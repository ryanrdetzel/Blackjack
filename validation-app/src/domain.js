export class InputError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export const STATUSES = Object.freeze(['pending', 'in_progress', 'done', 'canceled']);
const TRANSITIONS = Object.freeze({
  pending: Object.freeze(['in_progress', 'canceled']),
  in_progress: Object.freeze(['pending', 'done', 'canceled']),
  done: Object.freeze([]),
  canceled: Object.freeze([]),
});

function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new InputError('Body must be a JSON object');
  }
}

function text(value, name, max, allowEmpty = false) {
  if (typeof value !== 'string') throw new InputError(`${name} must be a string`);
  const normalized = value.trim();
  if ((!allowEmpty && !normalized) || normalized.length > max) {
    throw new InputError(`${name} must contain ${allowEmpty ? '0' : '1'}-${max} characters`);
  }
  return normalized;
}

export function validateStatus(value) {
  if (!STATUSES.includes(value)) throw new InputError('Invalid status');
  return value;
}

export function validateTransition(from, to) {
  validateStatus(from);
  validateStatus(to);
  if (from !== to && !TRANSITIONS[from].includes(to)) {
    throw new InputError(`Cannot transition from ${from} to ${to}`, 409);
  }
  return to;
}

export function parseTask(body, { partial = false } = {}) {
  object(body);
  const keys = Object.keys(body);
  const allowed = partial ? ['title', 'description', 'status'] : ['title', 'description'];
  if (keys.some((key) => !allowed.includes(key))) throw new InputError('Unknown task field');
  if (partial && keys.length === 0) throw new InputError('Update must not be empty');
  const result = {};
  if (!partial || Object.hasOwn(body, 'title')) result.title = text(body.title, 'title', 120);
  if (Object.hasOwn(body, 'description')) result.description = text(body.description, 'description', 2000, true);
  else if (!partial) result.description = '';
  if (Object.hasOwn(body, 'status')) result.status = validateStatus(body.status);
  return result;
}

export function validateId(value) {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new InputError('Invalid task ID');
  }
  return value;
}

export function encodeCursor(task) {
  return Buffer.from(JSON.stringify([task.createdAt, task.id])).toString('base64url');
}

export function parseList(params) {
  for (const key of params.keys()) {
    if (!['limit', 'cursor', 'status'].includes(key) || params.getAll(key).length !== 1) {
      throw new InputError('Unknown or repeated query parameter');
    }
  }
  const rawLimit = params.get('limit') ?? '20';
  if (!/^[1-9]\d*$/.test(rawLimit) || Number(rawLimit) > 100) throw new InputError('limit must be an integer from 1 to 100');
  const status = params.has('status') ? validateStatus(params.get('status')) : null;
  let cursor = null;
  if (params.has('cursor')) {
    try {
      const raw = params.get('cursor');
      if (raw.length > 256 || !/^[A-Za-z0-9_-]+$/.test(raw)) throw new Error();
      const decoded = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
      if (!Array.isArray(decoded) || decoded.length !== 2 || typeof decoded[0] !== 'string') throw new Error();
      const [createdAt, id] = decoded;
      if (new Date(createdAt).toISOString() !== createdAt) throw new Error();
      validateId(id);
      cursor = { createdAt, id };
    } catch {
      throw new InputError('Invalid pagination cursor');
    }
  }
  return { limit: Number(rawLimit), status, cursor };
}
