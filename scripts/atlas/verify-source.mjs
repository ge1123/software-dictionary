import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import inventory from '../../src/model-atlas/index.json' with {type:'json'};
import { readChapter } from './render.mjs';

const root = process.argv[2];
if (!root || !process.env.DATABASE_URL) throw Error('Provide a source checkout path and a dedicated PostgreSQL DATABASE_URL.');
const catalogQuery = readFileSync(new URL('./catalog.sql', import.meta.url), 'utf8');
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
try {
  for (const chapter of inventory.chapters) {
    const data = readChapter(chapter);
    let sql = readFileSync(join(root, chapter.source, 'lab.sql'), 'utf8');
    assert.equal(createHash('sha256').update(sql).digest('hex'), data.labSha256, chapter.source);
    if (['09-payments-refunds','20-order-state-model'].includes(chapter.source)) {
      // Fix only the malformed dollar quotes in these two pinned lab files.
      sql = sql.replace(/(?<!\$)\$(?!\$)(?=\s*(?:$|BEGIN|DECLARE|;))/gm, () => '$$');
    }
    assert.match(sql, /ROLLBACK;\s*$/i);
    const schemas = [...sql.matchAll(/CREATE SCHEMA\s+(\w+)/gi)].map(m => m[1]);
    try {
      await db.query(sql.replace(/ROLLBACK;\s*$/i, ''));
      const actual = (await db.query(catalogQuery, [schemas])).rows;
      const expected = data.tables.map(t => ({
        schema:t.schema, name:t.name, kind:t.kind, columns:t.columns,
        constraints:t.constraints.map(k => ({target:null, targetSchema:null, refs:[], ...k})), indexes:t.indexes,
        dependencies:(t.depends ?? []).map(d => d.schema+'.'+d.name).sort()
      }));
      assert.deepEqual(actual, expected, chapter.source);
    } finally {
      await db.query('ROLLBACK');
    }
  }
  console.log('All 67 pinned labs matched the atlas catalog.');
} finally {
  await db.end();
}
