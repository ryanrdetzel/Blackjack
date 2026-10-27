import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../src/domain.js', import.meta.url);
const good = "in_progress: Object.freeze(['pending', 'done', 'canceled']),";
const defective = "in_progress: Object.freeze(['pending', 'canceled']),";
const mode = process.argv[2];
if (!['apply', 'restore'].includes(mode)) throw new Error('Usage: node qualification/repair-fixture.js apply|restore');
const source = await readFile(path, 'utf8');
const before = mode === 'apply' ? good : defective;
const after = mode === 'apply' ? defective : good;
if (source.split(before).length !== 2 || source.includes(after)) {
  throw new Error('Expected exact baseline/fixture not found; refusing to overwrite other work');
}
await writeFile(path, source.replace(before, after));
console.log(mode === 'apply' ? 'Repair fixture applied: completion transition regression introduced' : 'Repair fixture restored to correct baseline');
