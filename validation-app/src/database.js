import pg from 'pg';

export function createPool({ connectionString = process.env.DATABASE_URL, schema = process.env.DATABASE_SCHEMA ?? 'public' } = {}) {
  if (!connectionString) throw new Error('DATABASE_URL is required');
  if (!/^[a-z_][a-z0-9_]{0,62}$/.test(schema)) throw new Error('Invalid DATABASE_SCHEMA');
  return new pg.Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    options: `-c search_path=${schema} -c statement_timeout=5000 -c lock_timeout=5000`,
  });
}
