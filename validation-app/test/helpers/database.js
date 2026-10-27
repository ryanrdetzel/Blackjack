import { randomUUID } from 'node:crypto';
import { createPool } from '../../src/database.js';
import { migrate } from '../../src/migrate.js';
import { createApp } from '../../src/app.js';

export async function database(t) {
  const connectionString = process.env.TEST_DATABASE_URL;
  if (!connectionString) throw new Error('TEST_DATABASE_URL is required; integration tests never mock or silently skip PostgreSQL');
  const schema = `test_${randomUUID().replaceAll('-', '')}`;
  const admin = createPool({ connectionString, schema: 'public' });
  let pool;
  t.after(async () => {
    if (pool) await pool.end();
    try {
      await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    } finally {
      await admin.end();
    }
  });
  await admin.query(`CREATE SCHEMA ${schema}`);
  pool = createPool({ connectionString, schema });
  await migrate(pool);
  return {
    pool, connectionString, schema,
    reconnect() { return createPool({ connectionString, schema }); },
  };
}

export async function api(t, pool) {
  const server = createApp(pool);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });
  const root = `http://127.0.0.1:${server.address().port}`;
  return {
    root,
    async request(path, { method = 'GET', body, headers = {} } = {}) {
      const response = await fetch(`${root}${path}`, {
        method,
        headers: { ...(body === undefined ? {} : { 'content-type': 'application/json' }), ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return { status: response.status, body: await response.json() };
    },
  };
}
