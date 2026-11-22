import assert from 'node:assert/strict';
import { domains, relations, relatedTerms, terms } from '../src/terms.js';
const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;
assert.equal(new Set(domains.map(domain => domain.id)).size, domains.length);
for (const domain of domains) {
  assert.match(domain.id, slug);
  assert.ok(domain.name.trim() && domain.terms.length > 0, domain.id);
  for (const term of domain.terms) assert.match(term.id, slug);
  for (const pair of domain.relations) {
    assert.equal(pair.length, 2);
    for (const ref of pair) {
      const parts = ref.split('/');
      assert.ok(parts.length <= 2 && parts.every(part => slug.test(part)), ref);
    }
  }
}
const ids = new Set();
for (const term of terms) {
  for (const key of ['id', 'en', 'zh', 'definition', 'example', 'category']) assert.ok(term[key]?.trim(), term.id);
  for (const [name, meaning] of term.properties ?? []) assert.ok(name.trim() && meaning.trim(), term.id);
  assert.ok(!ids.has(term.id), term.id);
  ids.add(term.id);
}
assert.ok(ids.size);
console.log('Validated', ids.size, 'entries.');
for (const { id, sample } of terms) {
  if (!sample) continue;
  for (const key of ['language', 'setup', 'code', 'result']) assert.ok(sample[key]?.trim(), id);
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
for (const { id, practice, sample } of terms) {
  if (!practice) continue;
  for (const field of ['principle', 'verify', 'tradeoff']) assert.ok(practice[field]?.trim(), id);
  assert.ok(sample && practice.steps.length && practice.steps.every(step => step.trim()), id);
  assert.ok(practice.sources.length && practice.sources.every(([name, url]) => name.trim() && new URL(url).protocol === 'https:'), id);
}
for (const { id, scale } of terms) {
  if (scale === undefined) continue;
  for (const key of ['benefit', 'cost', 'measure']) assert.ok(scale?.[key]?.trim(), id);
}
