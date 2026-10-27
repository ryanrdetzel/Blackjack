import { createPool } from '../src/database.js';
import { seed } from '../src/seed.js';

const pool = createPool();
try {
  await seed(pool);
  console.log('Sample fixtures inserted; existing IDs preserved');
} finally {
  await pool.end();
}
