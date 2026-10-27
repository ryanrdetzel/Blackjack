import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTransition, parseTask } from '../../src/domain.js';

test('external contract: a worker can start and complete a task without reopening terminal states', () => {
  const update = parseTask({ status: 'in_progress' }, { partial: true });
  assert.equal(validateTransition('pending', update.status), 'in_progress');
  assert.equal(validateTransition('in_progress', 'done'), 'done');
  assert.equal(validateTransition('done', 'done'), 'done');
  for (const terminal of ['done', 'canceled']) {
    for (const target of ['pending', 'in_progress']) {
      assert.throws(() => validateTransition(terminal, target), (error) => error.status === 409);
    }
  }
  assert.throws(() => validateTransition('pending', 'done'), (error) => error.status === 409);
});
