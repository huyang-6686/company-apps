#!/usr/bin/env python3
"""First deployment only; run as root on the authorized ECS. Never prints secrets."""
import os
import secrets
import subprocess
from pathlib import Path

ENV_FILE = Path('/etc/lighthouse-corpus/app.env')


def admin(sql, database='postgres'):
    result = subprocess.run(
        ['runuser', '-u', 'postgres', '--', 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-At', '-d', database],
        input=sql, text=True, capture_output=True, cwd='/', check=False,
    )
    if result.returncode:
        raise RuntimeError('Database administrative operation failed; no credentials were logged.')
    return result.stdout.strip()


def main():
    if os.geteuid() != 0:
        raise RuntimeError('Run as root on the deployment server.')
    if ENV_FILE.exists():
        raise RuntimeError('Environment file already exists; inspect existing deployment before retrying.')
    existing = admin("SELECT rolname FROM pg_roles WHERE rolname IN ('lighthouse_app','lighthouse_owner'); SELECT datname FROM pg_database WHERE datname='lighthouse_corpus';")
    if existing:
        raise RuntimeError('Lighthouse database or roles already exist; refusing to replace them.')
    password = secrets.token_hex(32)
    ENV_FILE.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    descriptor = os.open(str(ENV_FILE), os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, 'w') as output:
        output.write('NODE_ENV=production\nHOST=127.0.0.1\nPORT=3100\n')
        output.write('DATABASE_URL=postgresql://lighthouse_app:' + password + '@127.0.0.1:5432/lighthouse_corpus\n')
    admin("BEGIN; SET LOCAL password_encryption='scram-sha-256'; CREATE ROLE lighthouse_owner NOLOGIN; CREATE ROLE lighthouse_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION CONNECTION LIMIT 20 PASSWORD '" + password + "'; COMMIT;")
    admin('CREATE DATABASE lighthouse_corpus OWNER lighthouse_owner;')
    admin('REVOKE ALL ON DATABASE lighthouse_corpus FROM PUBLIC; GRANT CONNECT ON DATABASE lighthouse_corpus TO lighthouse_app;')
    admin('ALTER SCHEMA public OWNER TO lighthouse_owner; REVOKE ALL ON SCHEMA public FROM PUBLIC; GRANT USAGE ON SCHEMA public TO lighthouse_app;', 'lighthouse_corpus')
    process_env = dict(os.environ, PGPASSWORD=password)
    check = subprocess.run(['psql', '-X', '-v', 'ON_ERROR_STOP=1', '-h', '127.0.0.1', '-U', 'lighthouse_app', '-d', 'lighthouse_corpus', '-Atc', 'select 1'], env=process_env, text=True, capture_output=True, check=False)
    if check.returncode or check.stdout.strip() != '1':
        raise RuntimeError('TCP password authentication failed; do not run migrations. Keep environment file for recovery.')
    print('Independent database created; runtime role TCP authentication passed; environment file mode=600.')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Exception messages are static, never include PostgreSQL output or passwords.
        raise SystemExit(str(error) if isinstance(error, RuntimeError) else 'Bootstrap failed; inspect server securely.')
