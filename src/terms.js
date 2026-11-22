import sql from './domains/sql.json' with { type: 'json' };

import redis from './domains/redis.json' with { type: 'json' };

import backend from './domains/backend.json' with { type: 'json' };
import mq from './domains/mq.json' with { type: 'json' };

import dotnet from './domains/dotnet.json' with { type: 'json' };

import commerce from './domains/commerce.json' with { type: 'json' };
import algorithms from './domains/algorithms.json' with { type: 'json' };

import infra from './domains/infra.json' with { type: 'json' };

export const domains = [sql, backend, dotnet, redis, mq, commerce, algorithms, infra];

// Only previously published URLs belong in this lookup.
const formerBackendTopics = new Map([
  ['sku', 'commerce'],
  ['price-snapshot', 'commerce'],
  ['inventory-reservation', 'commerce'],
  ['refund', 'commerce'],
  ['cart', 'commerce'],
  ['order-state', 'commerce'],
  ['backtracking', 'algorithms'],
  ['binary-search', 'algorithms'],
  ['complexity', 'algorithms'],
  ['dynamic-array', 'algorithms'],
  ['dynamic-programming', 'algorithms'],
  ['graph-traversal', 'algorithms'],
  ['greedy', 'algorithms'],
  ['hash-map', 'algorithms'],
  ['hash-set', 'algorithms'],
  ['priority-queue', 'algorithms'],
  ['queue-stack', 'algorithms'],
  ['sliding-window', 'algorithms'],
  ['sorting', 'algorithms'],
  ['topological-sort', 'algorithms'],
]);

export function resolveEntryId(id) {
  if (!id.startsWith('backend/')) return id;
  const slug = id.slice('backend/'.length);
  const topic = formerBackendTopics.get(slug);
  return topic ? topic + '/' + slug : id;
}

export const plannedTopics = Object.entries({
  backend: '後端', mq: 'MQ', infra: 'Infra', fae: 'FAE',
  frontend: 'Frontend', browser: 'Browser', security: '資安'
}).filter(([id]) => !domains.some(domain => domain.id === id));

// SQL keeps its original public URLs. Other domains get their own namespace.
function entryId(domain, slug) {
  return domain === 'sql' ? slug : domain + '/' + slug;
}

export const terms = domains.flatMap(domain =>
  domain.terms.map(term => ({ ...term, domain: domain.id, id: entryId(domain.id, term.id) }))
);
export const relations = domains.flatMap(domain =>
  domain.relations.map(pair => pair.map(ref => {
    const [scope, slug] = ref.split('/');
    return slug ? entryId(scope, slug) : entryId(domain.id, scope);
  }))
);

export function relatedTerms(id) {
  const neighbors = relations.filter(pair => pair.includes(id)).flat();
  return terms.filter(term => term.id !== id && neighbors.includes(term.id));
}
