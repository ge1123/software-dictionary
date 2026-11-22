import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { guides } from '../src/guides.js';
import { domains, relations, relatedTerms, terms } from '../src/terms.js';
const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;
assert.equal(new Set(domains.map(domain => domain.id)).size, domains.length);
for (const domain of domains) {
  assert.match(domain.id, slug);
  assert.ok(domain.name.trim() && domain.terms.length > 0, domain.id);
  for (const term of domain.terms) assert.match(term.id, slug);
  const questions = new Set();
  const groupSizes = new Map();
  for (const term of domain.terms) {
    if (term.modelCase) {
      const { id, title } = term.modelCase;
      assert.match(id, slug);
      assert.ok(title.trim() && existsSync(new URL('../cases/' + id + '/index.html', import.meta.url)), term.id);
    }
    if (term.lookupQuestion !== undefined) {
      const question = term.lookupQuestion.trim();
      assert.ok(question && !questions.has(question), term.id);
      questions.add(question);
    }
    if (term.comparison !== undefined) {
      const { group, hint } = term.comparison;
      assert.match(group, slug);
      assert.ok(hint.trim(), term.id);
      groupSizes.set(group, (groupSizes.get(group) ?? 0) + 1);
    }
  }
  for (const [group, size] of groupSizes) assert.ok(size >= 2, group);
  for (const pair of domain.relations) {
    assert.ok(pair.length === 2 || pair.length === 3);
    for (const ref of pair.slice(0, 2)) {
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
const b2b2c = terms.filter(t => t.domain === 'commerce' && t.category.startsWith('B2B2C'));
const businessIds = new Set(b2b2c.map(term => term.id));
const pairs = new Set();
for (const [a, b, reasons] of relations) {
  const key = [a, b].sort().join('/');
  assert.ok(ids.has(a) && ids.has(b) && a !== b && !pairs.has(key), key);
  pairs.add(key);
  const forward = relatedTerms(a).find(term => term.id === b);
  const reverse = relatedTerms(b).find(term => term.id === a);
  assert.ok(forward && reverse, key);
  if (reasons !== undefined || businessIds.has(a) || businessIds.has(b)) {
    for (const direction of ['forward', 'reverse']) {
      assert.ok(typeof reasons?.[direction] === 'string' && reasons[direction].trim(), key + ' ' + direction);
    }
    assert.equal(forward.reason, reasons.forward, key);
    assert.equal(reverse.reason, reasons.reverse, key);
  }
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

for (const term of b2b2c) assert.ok(relatedTerms(term.id).length, term.id);
for (const term of terms.filter(t => t.domain === 'commerce')) {
  assert.ok(Array.isArray(term.sources) && term.sources.length > 0, term.id);
  for (const [name, url] of term.sources) {
    assert.ok(name.trim(), term.id);
    assert.match(url, /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{40}\/.+#L\d+(?:-L\d+)?$/, term.id);
  }
}

assert.equal(new Set(guides.map(g => g.id)).size, guides.length);
for (const guide of guides) {
  assert.match(guide.id, slug);
  assert.ok(guide.title.trim() && guide.terms.length && guide.terms.every(id => ids.has(id)), guide.id);
  assert.ok(existsSync(new URL('../guides/' + guide.id + '/index.html', import.meta.url)), guide.id);
}
await import('./atlas/check.mjs');
