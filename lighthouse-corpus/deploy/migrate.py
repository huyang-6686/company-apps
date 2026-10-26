#!/usr/bin/env python3
"""Run by root. Migrations execute as non-login owner, never as runtime role."""
import hashlib
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def psql(sql):
    return subprocess.run(['runuser', '-u', 'postgres', '--', 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-At', '-d', 'lighthouse_corpus'], input=sql, text=True, capture_output=True, cwd='/', check=False)


def main():
    probe = psql("SELECT to_regclass('public.schema_migrations') IS NOT NULL;")
    if probe.returncode:
        raise RuntimeError('Cannot access isolated lighthouse_corpus database.')
    applied = {}
    if probe.stdout.strip() == 't':
        rows = psql('SELECT version, checksum FROM public.schema_migrations ORDER BY version;')
        if rows.returncode:
            raise RuntimeError('Cannot read migration registry.')
        applied = dict(line.split('|') for line in rows.stdout.splitlines() if line)
    statements = ["BEGIN; SET LOCAL ROLE lighthouse_owner; CREATE TABLE IF NOT EXISTS public.schema_migrations (version TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now());"]
    files = sorted((ROOT / 'server' / 'migrations').glob('[0-9]*.sql'))
    versions = {file.name for file in files}
    if set(applied) - versions:
        raise RuntimeError('Database contains migrations missing from release.')
    for file in files:
        digest = hashlib.sha256(file.read_bytes()).hexdigest()
        if file.name in applied:
            if applied[file.name] != digest:
                raise RuntimeError('Applied migration checksum mismatch; no changes made.')
            continue
        if any(character not in '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-. ' for character in file.name):
            raise RuntimeError('Unexpected migration filename.')
        statements.append(file.read_text(encoding='utf-8-sig'))
        statements.append("INSERT INTO public.schema_migrations(version,checksum) VALUES ('" + file.name + "','" + digest + "');")
    statements.append('GRANT SELECT, INSERT, UPDATE, DELETE ON nodes, role_cache, notifications, notification_events TO lighthouse_app; GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lighthouse_app; REVOKE ALL ON audit_log FROM lighthouse_app; GRANT SELECT, INSERT ON audit_log TO lighthouse_app; REVOKE ALL ON schema_migrations FROM PUBLIC; GRANT SELECT ON schema_migrations TO lighthouse_app;')
    dry_run = '--dry-run' in sys.argv
    statements.append('ROLLBACK;' if dry_run else 'COMMIT;')
    result = psql('\n'.join(statements))
    print(result.stdout, end='')
    if result.returncode:
        print(result.stderr, file=sys.stderr, end='')  # migration SQL contains no credentials
        raise RuntimeError('Migration failed; transaction rolled back.')
    print(('Dry-run rolled back; ' if dry_run else 'Migration committed; ') + str(len(files)) + ' release migration files verified.')


if __name__ == '__main__':
    try:
        main()
    except RuntimeError as error:
        raise SystemExit(str(error))
