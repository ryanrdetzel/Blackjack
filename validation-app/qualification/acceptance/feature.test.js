import test from 'node:test';
import assert from 'node:assert/strict';
import * as domain from '../../src/domain.js';

// This is a requested, NOT-YET-IMPLEMENTED qualification feature. It is deliberately
// outside npm test and must fail on the unmodified baseline; it is not DB coverage.
test('new domain feature: normalize task labels without mutating input', () => {
  assert.equal(typeof domain.normalizeTaskLabels, 'function', 'Implement exported normalizeTaskLabels(value) in src/domain.js');
  const input = ['  Backend ', 'URGENT', 'backend', 'needs-review'];
  assert.deepEqual(domain.normalizeTaskLabels(input), ['backend', 'needs-review', 'urgent']);
  assert.deepEqual(input, ['  Backend ', 'URGENT', 'backend', 'needs-review']);
  assert.deepEqual(domain.normalizeTaskLabels([]), []);
  assert.deepEqual(domain.normalizeTaskLabels(['x'.repeat(32)]), ['x'.repeat(32)]);
  for (const value of [undefined, null, 'backend', [2], [''], ['   '], ['two words'], ['under_score'], ['é'], ['x'.repeat(33)], Array.from({ length: 11 }, (_, n) => `label-${n}`)]) {
    assert.throws(() => domain.normalizeTaskLabels(value), (error) => error instanceof domain.InputError && error.status === 400);
  }
  // Limit applies to unique normalized labels, not raw duplicate count.
  assert.deepEqual(domain.normalizeTaskLabels(Array(15).fill(' Backend ')), ['backend']);
});
