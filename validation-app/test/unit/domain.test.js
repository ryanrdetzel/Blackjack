import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTask, parseList, encodeCursor, validateTransition, validateId, InputError, STATUSES } from '../../src/domain.js';

const id = '00000000-0000-4000-8000-000000000001';
const bad = (fn, status = 400) => assert.throws(fn, (error) => error instanceof InputError && error.status === status);

test('create normalizes strings and defaults description', () => {
  assert.deepEqual(parseTask({ title: '  Ship API  ' }), { title: 'Ship API', description: '' });
  assert.deepEqual(parseTask({ title: 'A', description: '  notes  ' }), { title: 'A', description: 'notes' });
});

test('create rejects invalid payloads and unknown fields', () => {
  for (const body of [null, [], 'a', {}, { title: '' }, { title: '  ' }, { title: 4 }, { title: 'x'.repeat(121) },
    { title: 'a', description: null }, { title: 'a', description: 'x'.repeat(2001) }, { title: 'a', status: 'done' }, { title: 'a', surprise: true }]) {
    bad(() => parseTask(body));
  }
});

test('updates distinguish omitted fields from invalid fields', () => {
  assert.deepEqual(parseTask({ description: '' }, { partial: true }), { description: '' });
  assert.deepEqual(parseTask({ status: 'in_progress' }, { partial: true }), { status: 'in_progress' });
  for (const body of [{}, { status: 'unknown' }, { title: null }]) bad(() => parseTask(body, { partial: true }));
});

test('transition matrix enforces terminal states and idempotence', () => {
  const allowed = { pending: ['pending', 'in_progress', 'canceled'], in_progress: ['pending', 'in_progress', 'done', 'canceled'], done: ['done'], canceled: ['canceled'] };
  for (const from of STATUSES) for (const to of STATUSES) {
    if (allowed[from].includes(to)) assert.equal(validateTransition(from, to), to);
    else bad(() => validateTransition(from, to), 409);
  }
  bad(() => validateTransition('unknown', 'pending'));
});

test('pagination has strict bounds, filters, and round-trip cursors', () => {
  assert.deepEqual(parseList(new URLSearchParams()), { limit: 20, status: null, cursor: null });
  const task = { id, createdAt: '2026-01-01T00:00:00.000Z' };
  assert.deepEqual(parseList(new URLSearchParams({ limit: '100', status: 'done', cursor: encodeCursor(task) })), { limit: 100, status: 'done', cursor: { createdAt: task.createdAt, id } });
  for (const query of ['limit=0', 'limit=-1', 'limit=101', 'limit=1.5', 'limit=01', 'limit=1e1', 'limit=', 'limit=1&limit=2', 'status=oops', 'other=x', 'cursor=bad', 'cursor=']) {
    bad(() => parseList(new URLSearchParams(query)));
  }
  const malformed = [[], ['2026-01-01', id], ['bad', id], ['2026-01-01T00:00:00.000Z', 'bad'], ['2026-01-01T00:00:00.000Z', id, 'extra']];
  for (const value of malformed) bad(() => parseList(new URLSearchParams({ cursor: Buffer.from(JSON.stringify(value)).toString('base64url') })));
});

test('task IDs reject malformed values', () => {
  assert.equal(validateId(id), id);
  for (const value of ['1', '', undefined, "'; DROP TABLE tasks; --"]) bad(() => validateId(value));
});
