import sql from './domains/sql.json' with { type: 'json' };

export const domains = [sql];

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
