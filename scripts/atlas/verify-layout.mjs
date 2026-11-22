import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { preview } from 'vite';
import inventory from '../../src/model-atlas/index.json' with { type: 'json' };

// All coordinates below are CSS pixels after the SVG's viewBox and transforms.
function inspectSvg(svg) {
  const issues = new Set();
  const rect = element => element.getBoundingClientRect();
  const bounds = rect(svg);
  const outside = (inner, outer) => inner.left < outer.left - 1 || inner.top < outer.top - 1 ||
    inner.right > outer.right + 1 || inner.bottom > outer.bottom + 1;
  const overlaps = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
  const names = [...svg.querySelectorAll('text')].map(el => ({
    el, name: el.textContent.trim(), box: rect(el)
  }));
  const entities = [...svg.querySelectorAll('g.node > polygon:first-of-type, rect.box')];
  const boxes = entities.map(el => ({ el, box: rect(el) }));
  for (const [i, text] of names.entries()) {
    if (outside(text.box, bounds)) issues.add('clipped text: ' + text.name);
    for (const other of names.slice(i+1)) {
      if (overlaps(text.box, other.box)) issues.add('text overlap: ' + text.name + ' / ' + other.name);
    }
    const owner = boxes.find(({el}) => el.parentElement.contains(text.el));
    if (owner && outside(text.box, owner.box)) issues.add('text outside entity: ' + text.name);
    if (!owner && boxes.some(b => overlaps(text.box, b.box))) issues.add('label on entity: ' + text.name);
  }
  const paths = svg.querySelectorAll('g.edge > path, g.edge > polygon, g[data-parent] > path');
  for (const path of paths) {
    const length = path.getTotalLength();
    const transform = path.getScreenCTM();
    if (path.parentElement.hasAttribute('data-parent')) {
      for (const [name, at] of [[path.parentElement.dataset.parent, 0], [path.parentElement.dataset.child, length]]) {
        const entity = boxes.find(b => b.el.parentElement.querySelector('.heading').textContent === name);
        const pt = path.getPointAtLength(at).matrixTransform(transform);
        if (!entity || pt.x < entity.box.left - 1 || pt.x > entity.box.right + 1 ||
            pt.y < entity.box.top - 1 || pt.y > entity.box.bottom + 1) issues.add('detached endpoint: ' + name);
      }
    }
    const step = 2 / Math.max(Math.hypot(transform.a, transform.b), Math.hypot(transform.c, transform.d));
    for (let at = 0; at <= length; at += step) {
      const pt = path.getPointAtLength(at).matrixTransform(transform);
      const inside = box => pt.x > box.left + 1 && pt.x < box.right - 1 &&
        pt.y > box.top + 1 && pt.y < box.bottom - 1;
      for (const text of names) {
        if (inside(text.box)) issues.add('line through text: ' + text.name);
      }
      if (boxes.some(b => inside(b.box))) issues.add('line through entity');
    }
  }
  return [...issues];
}

const server = await preview({ preview: { host: '127.0.0.1', port: 0, open: false } });
const base = 'http://127.0.0.1:' + server.httpServer.address().port;
let browser;
try {
  browser = await chromium.launch({executablePath: process.env.CHROME_BIN});
  const page = await browser.newPage();
  const imagePage = await browser.newPage();
  const cases = readdirSync('dist/cases', {withFileTypes: true}).filter(d => d.isDirectory());
  const entries = [
    ...inventory.chapters.map(c => ({url: '/models/' + c.slug + '/', expected: c.plans.length})),
    ...cases.map(c => ({url: '/cases/' + c.name + '/'}))
  ];
  const failed = new Set();
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    let count = 0;
    for (const {url, expected} of entries) {
      const response = await page.goto(base + url);
      assert.equal(response.status(), 200, url);
      const diagrams = page.locator('figure svg, figure img');
      const n = await diagrams.count();
      assert.ok(n > 0 && (expected === undefined || n === expected), url);
      const pageOverflows = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      for (const frame of await page.locator('.diagram, .er-scroll').all()) {
        const reachable = await frame.evaluate(el => {
          const max = el.scrollWidth - el.clientWidth;
          const hint = el.nextElementSibling;
          if (hint?.tagName !== 'SMALL' || hint.hidden !== (max <= 1)) return false;
          el.scrollLeft = max;
          const atEnd = Math.abs(el.scrollLeft - max) <= 1;
          el.scrollLeft = 0;
          return atEnd;
        });
        assert.ok(reachable, url + ' diagram scroll area or hint');
      }
      for (const [i, diagram] of (await diagrams.all()).entries()) {
        const tag = url + '#' + (i+1);
        let problems;
        if (await diagram.evaluate(el => el.tagName.toLowerCase() === 'img')) {
          const img = await diagram.evaluate(el => ({url: el.currentSrc, width: el.clientWidth, height: el.clientHeight, ok: el.complete && el.naturalWidth > 0}));
          assert.ok(img.ok, tag);
          await imagePage.setViewportSize({width: img.width, height: img.height});
          await imagePage.goto(img.url);
          problems = await imagePage.locator('svg').evaluate(inspectSvg);
        } else {
          problems = await diagram.evaluate(inspectSvg);
        }
        if (pageOverflows) problems.push('page overflows viewport');
        if (problems.length) {
          console.error(width, tag, problems.join(' | '));
          failed.add(tag);
        }
        count++;
      }
    }
    console.log('Checked ' + count + ' ER diagrams at ' + width + ' CSS pixels.');
  }
  assert.equal(failed.size, 0, failed.size + ' diagrams have layout defects');
} finally {
  await browser?.close();
  await server.close();
}
