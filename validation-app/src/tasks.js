import { randomUUID } from 'node:crypto';
import { encodeCursor, InputError, validateTransition } from './domain.js';

function task(row) {
  return {
    id: row.id, title: row.title, description: row.description, status: row.status,
    createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(),
  };
}

export async function createTask(pool, input) {
  const result = await pool.query(
    'INSERT INTO tasks (id, title, description) VALUES ($1, $2, $3) RETURNING *',
    [randomUUID(), input.title, input.description],
  );
  return task(result.rows[0]);
}

export async function getTask(pool, id) {
  const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (!result.rowCount) throw new InputError('Task not found', 404);
  return task(result.rows[0]);
}

export async function listTasks(pool, { limit, status, cursor }) {
  const result = await pool.query(
    `SELECT * FROM tasks
     WHERE ($1::text IS NULL OR status = $1)
       AND ($2::timestamptz IS NULL OR (created_at, id) > ($2, $3::uuid))
     ORDER BY created_at ASC, id ASC LIMIT $4`,
    [status, cursor?.createdAt ?? null, cursor?.id ?? null, limit + 1],
  );
  const items = result.rows.slice(0, limit).map(task);
  return { items, nextCursor: result.rows.length > limit ? encodeCursor(items.at(-1)) : null };
}

export async function updateTask(pool, id, input) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT * FROM tasks WHERE id = $1 FOR UPDATE', [id]);
    if (!existing.rowCount) throw new InputError('Task not found', 404);
    const row = existing.rows[0];
    const status = input.status ?? row.status;
    validateTransition(row.status, status);
    const result = await client.query(
      'UPDATE tasks SET title = $2, description = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id, input.title ?? row.title, input.description ?? row.description, status],
    );
    await client.query('COMMIT');
    return task(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
