import assert from 'node:assert/strict';
import { terms } from '../src/terms.js';
const ids = new Set();
for (const term of terms) {
  for (const key of ['id', 'en', 'zh', 'definition', 'example', 'category']) assert.ok(term[key]?.trim(), term.id);
  for (const [name, meaning] of term.properties ?? []) assert.ok(name.trim() && meaning.trim(), term.id);
  assert.match(term.id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.ok(!ids.has(term.id), term.id);
  ids.add(term.id);
}
assert.ok(ids.size);
console.log('Validated', ids.size, 'SQL entries.');
for (const { id, sqlExample } of terms) {
  if (!sqlExample) continue;
  for (const key of ['setup', 'sql', 'result']) assert.ok(sqlExample[key]?.trim(), id);
  for (const target of sqlExample.links) assert.ok(ids.has(target) && target !== id, id);
}
