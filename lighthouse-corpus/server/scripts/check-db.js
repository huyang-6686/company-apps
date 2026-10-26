'use strict';
// Deployment probe only. Business routes still serve simulated data.
const { Client } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL_MISSING');
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    const identity = await client.query('SELECT current_database() AS db, current_user AS actor');
    if (identity.rows[0].db !== 'lighthouse_corpus' || identity.rows[0].actor !== 'lighthouse_app') {
      throw new Error('DATABASE_ISOLATION_MISMATCH');
    }
    const result = await client.query('SELECT version, checksum FROM public.schema_migrations ORDER BY version');
    const fs = require('node:fs');
    const path = require('node:path');
    const crypto = require('node:crypto');
    const directory = path.join(__dirname, '..', 'migrations');
    const versions = fs.readdirSync(directory).filter(name => /^\d+.*\.sql$/.test(name)).sort();
    if (result.rows.length !== versions.length) throw new Error('MIGRATION_COUNT_MISMATCH');
    for (const version of versions) {
      const checksum = crypto.createHash('sha256').update(fs.readFileSync(path.join(directory, version))).digest('hex');
      if (!result.rows.some(row => row.version === version && row.checksum === checksum)) {
        throw new Error('MIGRATION_CHECKSUM_MISMATCH');
      }
    }
    const privileges = await client.query("SELECT has_table_privilege(current_user, 'public.audit_log', 'INSERT') AS can_insert, has_table_privilege(current_user, 'public.audit_log', 'UPDATE') AS can_update, has_table_privilege(current_user, 'public.audit_log', 'DELETE') AS can_delete, has_table_privilege(current_user, 'public.audit_log', 'TRUNCATE') AS can_truncate");
    const rights = privileges.rows[0];
    if (!rights.can_insert || rights.can_update || rights.can_delete || rights.can_truncate) {
      throw new Error('AUDIT_PRIVILEGES_INVALID');
    }
    console.log('Database probe passed: isolated database, migrations and audit privileges verified; demo routes remain simulated.');
  } finally {
    await client.end();
  }
}

main().catch(() => {
  // Never emit a connection string or driver error that could contain credentials.
  console.error('Database probe failed; inspect server-side configuration securely.');
  process.exitCode = 1;
});
