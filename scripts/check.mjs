import assert from 'node:assert/strict';
import { relations, relatedTerms, terms } from '../src/terms.js';
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
}
const pairs = new Set();
for (const [a, b] of relations) {
  const key = [a, b].sort().join('/');
  assert.ok(ids.has(a) && ids.has(b) && a !== b && !pairs.has(key), key);
  pairs.add(key);
  assert.ok(relatedTerms(a).some(term => term.id === b), key);
  assert.ok(relatedTerms(b).some(term => term.id === a), key);
}
console.log('Validated', pairs.size, 'bidirectional references.');
