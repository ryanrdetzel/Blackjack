import { createPool } from './database.js';
import { createApp } from './app.js';

const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? '3000');
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535');
const pool = createPool();
pool.on('error', () => console.error('Idle database connection failed'));
const server = createApp(pool);
server.listen(port, host, () => console.log(`API listening on ${host}:${port}`));

let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => process.exit(1), 10000);
  deadline.unref();
  server.close(async () => {
    try {
      await pool.end();
      clearTimeout(deadline);
    } catch {
      process.exitCode = 1;
    }
  });
  server.closeIdleConnections();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
server.on('error', async (error) => {
  console.error('Server failed:', error.code ?? error.name);
  await pool.end();
  process.exitCode = 1;
});
