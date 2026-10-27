import { createPool } from '../src/database.js';
import { migrate } from '../src/migrate.js';

const pool = createPool();
try {
  await migrate(pool);
  console.log('Migrations applied');
} finally {
  await pool.end();
}
