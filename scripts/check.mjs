import assert from 'node:assert/strict';
import { terms } from '../src/terms.js';
const ids = new Set();
for (const term of terms) {
  for (const value of Object.values(term)) assert.ok(value?.trim(), term.id);
  assert.match(term.id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.ok(!ids.has(term.id), term.id);
  ids.add(term.id);
}
assert.ok(ids.size);
console.log('Validated', ids.size, 'SQL entries.');
