import { createServer } from 'node:http';
import { InputError, parseTask, parseList, validateId } from './domain.js';
import { createTask, getTask, listTasks, updateTask } from './tasks.js';

async function jsonBody(request) {
  if (request.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new InputError('Content-Type must be application/json', 415);
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > 16384) {
      request.resume();
      throw new InputError('Request body too large', 413);
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new InputError('Invalid JSON');
  }
}

export function createApp(pool) {
  const server = createServer(async (request, response) => {
    function send(status, body) {
      response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
      response.end(JSON.stringify(body));
    }
    try {
      const url = new URL(request.url, 'http://localhost');
      const method = request.method;
      if (method === 'GET' && url.pathname === '/health') return send(200, { status: 'ok' });
      if (method === 'GET' && url.pathname === '/ready') {
        try {
          await pool.query('SELECT id FROM tasks LIMIT 1');
          return send(200, { status: 'ready' });
        } catch {
          return send(503, { error: 'Database unavailable or migrations missing' });
        }
      }
      if (url.pathname === '/tasks') {
        if (method === 'GET') return send(200, await listTasks(pool, parseList(url.searchParams)));
        if (method === 'POST') return send(201, await createTask(pool, parseTask(await jsonBody(request))));
        return send(405, { error: 'Method not allowed' });
      }
      const match = /^\/tasks\/([^/]+)$/.exec(url.pathname);
      if (match) {
        const id = validateId(match[1]);
        if (method === 'GET') return send(200, await getTask(pool, id));
        if (method === 'PATCH') return send(200, await updateTask(pool, id, parseTask(await jsonBody(request), { partial: true })));
        return send(405, { error: 'Method not allowed' });
      }
      return send(404, { error: 'Not found' });
    } catch (error) {
      if (error instanceof InputError) return send(error.status, { error: error.message });
      // Never log connection strings, request bodies, or raw database errors.
      console.error('Request failed:', error.name);
      return send(500, { error: 'Internal server error' });
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return server;
}
