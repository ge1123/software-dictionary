import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import inventory from '../../src/model-atlas/index.json' with { type: 'json' };
import { terms } from '../../src/terms.js';

const directory = new URL('../../src/model-atlas/chapters/', import.meta.url);
const ids = new Set(terms.map(t=>t.id));
const chapters = inventory.chapters;
const files = chapters.map(c=>c.slug+'.json');
assert.deepEqual(readdirSync(directory).sort(),files.slice().sort());
assert.match(inventory.revision,/^[a-f\d]{40}$/);
for(const [group,length] of [['core',37],['commerce',30]]) {
  const series=chapters.filter(c=>c.group===group);
  assert.deepEqual(series.map(c=>Number(c.source.split('/').pop().slice(0,2))),Array.from({length},(_,i)=>i+1));
}
let implemented=0, conceptual=0;
for (const ch of chapters) {
  assert.ok(ids.has(ch.term),ch.slug+' '+ch.term);
  const data=JSON.parse(readFileSync(new URL(ch.slug+'.json',directory)));
  const objects = new Map(data.tables.map(t=>[t.schema+'.'+t.name,t]));
  const covered = new Set();
  assert.match(data.labSha256,/^[a-f\d]{64}$/);
  assert.equal(data.plans.map(p=>p.code).join(''),ch.plans);
  assert.match(ch.plans,/^AB(C)?$/);
  assert.ok(data.intro.trim() && data.comparison.length>=2);
  for (const plan of data.plans) {
    assert.ok(plan.title && plan.line>0);
    if(plan.concept) {
      assert.ok(!plan.tables && plan.note && Object.keys(plan.concept.entities).length);
      for(const [a,b] of plan.concept.links) assert.ok(a in plan.concept.entities && b in plan.concept.entities);
      conceptual++;
      continue;
    }
    implemented++;
    assert.ok(plan.tables.length && new Set(plan.tables).size===plan.tables.length);
    for (const id of plan.tables) {
      const t=objects.get(id);
      assert.ok(t?.columns.length,id);
      covered.add(id);
      const cols=t.columns.map(c=>c[0]);
      for (const row of t.samples) assert.equal(row.length,cols.length);
      for (const k of t.constraints) {
        assert.ok(k.sql && k.cols.every(col=>cols.includes(col)),id);
        if(k.type==='f') {
          const target=k.targetSchema+'.'+k.target;
          assert.ok(plan.tables.includes(target),target);
          assert.equal(k.cols.length,k.refs.length);
          assert.ok(k.refs.every(name=>objects.get(target).columns.some(c=>c[0]===name)),target);
        }
      }
      for(const dep of t.depends??[]) assert.ok(plan.tables.includes(dep.schema+'.'+dep.name));
    }
  }
  assert.deepEqual(covered,new Set(objects.keys()),ch.slug);
}
console.log('Validated',chapters.length,'chapters,',implemented,'SQL models and',conceptual,'conceptual models.');
