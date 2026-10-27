import { readFile } from 'node:fs/promises';

export async function seed(pool) {
  const tasks = JSON.parse(await readFile(new URL('../fixtures/tasks.json', import.meta.url), 'utf8'));
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const task of tasks) {
      await client.query(
        `INSERT INTO tasks (id, title, description, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $5) ON CONFLICT (id) DO NOTHING`,
        [task.id, task.title, task.description, task.status, task.createdAt],
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
