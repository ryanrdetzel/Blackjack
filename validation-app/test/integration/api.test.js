import test from 'node:test';
import assert from 'node:assert/strict';
import { database, api } from '../helpers/database.js';
import { migrate } from '../../src/migrate.js';
import { seed } from '../../src/seed.js';
import { createTask, getTask } from '../../src/tasks.js';

const missingId = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

test('HTTP create, validation, persistent storage, and status lifecycle', async (t) => {
  const db = await database(t);
  const app = await api(t, db.pool);
  assert.deepEqual(await app.request('/health'), { status: 200, body: { status: 'ok' } });
  assert.equal((await app.request('/ready')).status, 200);
  assert.equal((await app.request('/tasks', { method: 'POST', body: { title: '  ' } })).status, 400);
  assert.equal((await app.request('/tasks', { method: 'POST', body: { title: 'A' }, headers: { 'content-type': 'text/plain' } })).status, 415);
  const invalidJson = await fetch(`${app.root}/tasks`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
  assert.equal(invalidJson.status, 400);
  await invalidJson.arrayBuffer();
  assert.equal((await app.request('/tasks', { method: 'POST', body: { title: 'A', description: 'x'.repeat(17000) } })).status, 413);
  assert.equal((await app.request('/tasks', { method: 'POST', body: { title: 'A', unexpected: true } })).status, 400);
  const created = await app.request('/tasks', { method: 'POST', body: { title: '  Durable task  ', description: ' notes ' } });
  assert.equal(created.status, 201);
  assert.equal(created.body.title, 'Durable task');
  assert.equal(created.body.status, 'pending');
  const id = created.body.id;
  const secondPool = db.reconnect();
  try {
    assert.deepEqual(await getTask(secondPool, id), created.body);
    const restartedApp = await api(t, secondPool);
    assert.deepEqual((await restartedApp.request(`/tasks/${id}`)).body, created.body);
  } finally {
    await secondPool.end();
  }
  assert.equal((await app.request(`/tasks/${id}`, { method: 'PATCH', body: { status: 'done' } })).status, 409);
  assert.equal((await app.request(`/tasks/${id}`, { method: 'PATCH', body: { status: 'in_progress' } })).status, 200);
  const completed = await app.request(`/tasks/${id}`, { method: 'PATCH', body: { status: 'done', title: 'Completed' } });
  assert.equal(completed.status, 200);
  assert.equal(completed.body.status, 'done');
  assert.equal((await app.request(`/tasks/${id}`, { method: 'PATCH', body: { status: 'pending' } })).status, 409);
  assert.equal((await app.request(`/tasks/${id}`, { method: 'GET' })).body.title, 'Completed');
  assert.equal((await app.request(`/tasks/${missingId}`)).status, 404);
  assert.equal((await app.request('/tasks/not-an-id')).status, 400);
  assert.equal((await app.request('/tasks?limit=101')).status, 400);
});

test('same-timestamp pagination is deterministic, exclusive, filtered, and complete', async (t) => {
  const db = await database(t);
  await seed(db.pool);
  const app = await api(t, db.pool);
  let cursor = null;
  const ids = [];
  for (let page = 0; page < 6; page += 1) {
    const result = await app.request(`/tasks?limit=2${cursor ? `&cursor=${cursor}` : ''}`);
    assert.equal(result.status, 200);
    ids.push(...result.body.items.map((task) => task.id));
    cursor = result.body.nextCursor;
    if (!cursor) break;
  }
  assert.equal(cursor, null, 'pagination must terminate');
  assert.deepEqual(ids, [1, 2, 3, 4, 5].map((n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`));
  assert.equal(new Set(ids).size, ids.length);
  const filtered = await app.request('/tasks?status=pending&limit=1');
  assert.equal(filtered.body.items[0].id, ids[2]);
  const next = await app.request(`/tasks?status=pending&limit=1&cursor=${filtered.body.nextCursor}`);
  assert.equal(next.body.items[0].id, ids[4]);
  assert.equal(next.body.nextCursor, null);
});

test('migrations and seeds repeat without data loss or seed edits overwriting work', async (t) => {
  const db = await database(t);
  await migrate(db.pool);
  await seed(db.pool);
  await db.pool.query("UPDATE tasks SET title = 'User edited fixture' WHERE id = '00000000-0000-4000-8000-000000000001'");
  await seed(db.pool);
  await migrate(db.pool);
  const result = await db.pool.query('SELECT count(*)::int AS count FROM tasks');
  assert.equal(result.rows[0].count, 5);
  assert.equal((await getTask(db.pool, '00000000-0000-4000-8000-000000000001')).title, 'User edited fixture');
  assert.equal((await db.pool.query('SELECT count(*)::int AS count FROM schema_migrations')).rows[0].count, 1);
});

test('test schemas isolate actual database writes', async (t) => {
  const first = await database(t);
  const second = await database(t);
  const created = await createTask(first.pool, { title: 'Only in first schema', description: '' });
  assert.equal((await first.pool.query('SELECT count(*)::int AS count FROM tasks')).rows[0].count, 1);
  assert.equal((await second.pool.query('SELECT count(*)::int AS count FROM tasks')).rows[0].count, 0);
  await assert.rejects(getTask(second.pool, created.id), (error) => error.status === 404);
});

test('readiness distinguishes real database/schema failure from liveness', async (t) => {
  const db = await database(t);
  const app = await api(t, db.pool);
  await db.pool.query('DROP TABLE tasks');
  assert.equal((await app.request('/health')).status, 200);
  assert.equal((await app.request('/ready')).status, 503);
});

test('concurrent conflicting terminal updates are serialized', async (t) => {
  const db = await database(t);
  const app = await api(t, db.pool);
  const created = await app.request('/tasks', { method: 'POST', body: { title: 'Race' } });
  const path = `/tasks/${created.body.id}`;
  await app.request(path, { method: 'PATCH', body: { status: 'in_progress' } });
  const results = await Promise.all(['done', 'canceled'].map((status) => app.request(path, { method: 'PATCH', body: { status } })));
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
  assert.ok(['done', 'canceled'].includes((await app.request(path)).body.status));
});
