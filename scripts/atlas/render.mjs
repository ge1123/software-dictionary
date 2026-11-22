import { readFileSync } from 'node:fs';
import { instance } from '@viz-js/viz';
import inventory from '../../src/model-atlas/index.json' with { type: 'json' };
import { terms } from '../../src/terms.js';

const termNames = new Map(terms.map(t => [t.id, t.zh]));
const esc = value => String(value).replace(/[&<>"']/g, ch =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const prose = text => esc(text).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const groupName = {core: '資料模型設計', commerce: '電商交易模組'};
const qualified = t => t.schema + '.' + t.name;
const attr = value => JSON.stringify(String(value));

export function readChapter(chapter) {
  return JSON.parse(readFileSync(new URL('../../src/model-atlas/chapters/' + chapter.slug + '.json', import.meta.url)));
}
function table(headers, rows) {
  const cell = x => x === null ? '<em>NULL</em>' : esc(typeof x === 'object' ? JSON.stringify(x) : x);
  return '<div class="overflow"><table><thead><tr>' + headers.map(x => '<th scope="col">'+esc(x)+'</th>').join('') +
    '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map(x => '<td>'+cell(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
}
function diagram(viz, plan, objects) {
  const lines = ['digraph ER {', 'graph [rankdir=TB, bgcolor="transparent", pad=0.14, nodesep=0.4, ranksep=0.85];',
    'node [shape=plain, fontname="sans-serif", fontsize=12];','edge [color="#496856", fontcolor="#355845", fontname="sans-serif", fontsize=10];'];
  function edge(a,b,label,style,cardinality) {
    const ends = cardinality ? ' headlabel='+attr(cardinality.parent)+' taillabel='+attr(cardinality.children)+' labeldistance=2.0' : '';
    lines.push(`${attr(a)} -> ${attr(b)} [label=${attr(label)}, style=${attr(style)}${ends}];`);
  }
  function node(id,label,rows) {
    const cells=rows.map(([col,type])=>`<TR><TD ALIGN="LEFT">${esc(col)}</TD><TD ALIGN="LEFT">${esc(type)||' '}</TD></TR>`).join('');
    lines.push(`${attr(id)} [label=<<TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="5" COLOR="#779585" BGCOLOR="#fffef8"><TR><TD COLSPAN="2" BGCOLOR="#e0ede2"><B>${esc(label)}</B></TD></TR>${cells}</TABLE>>];`);
  }
  if (plan.concept) {
    for (const [name, fields] of Object.entries(plan.concept.entities)) node(name,name,fields.map(f=>[f,'']));
    for (const [from,to,label] of plan.concept.links) edge(from,to,label,'dashed');
  } else {
    const multipleSchemas = new Set(objects.map(t=>t.schema)).size > 1;
    for (const t of objects) {
      const primary=t.constraints.find(k=>k.type==='p')?.cols ?? [];
      const foreign=t.constraints.filter(k=>k.type==='f');
      node(qualified(t), (multipleSchemas ? qualified(t) : t.name) + ({v:' (view)',m:' (matview)'}[t.kind] ?? ''),
        t.columns.map(([col,type])=>[col, [type,primary.includes(col)?'PK':'',foreign.some(k=>k.cols.includes(col))?'FK':''].filter(Boolean).join(' · ')]));
      for (const k of foreign) {
        const required = k.cols.every(col => t.columns.find(c => c[0] === col)[2]);
        const unique = t.constraints.some(key => ['p','u'].includes(key.type) && key.cols.every(col => k.cols.includes(col)));
        edge(qualified(t),k.targetSchema+'.'+k.target,k.cols.join(', ')+' → '+k.refs.join(', '),'solid',
          {parent:required?'1':'0..1',children:unique?'0..1':'0..N'});
      }
      for (const dependency of t.depends ?? []) edge(qualified(t),qualified(dependency),'reads','dashed');
    }
  }
  const result = viz.render(lines.concat('}').join('\n'),{format:'svg',engine:'dot'});
  if (result.status!=='success') throw Error(JSON.stringify(result.errors));
  return result.output.slice(result.output.indexOf('<svg')).replace(/\s+id="(?:graph|node|edge)\d+"/g,'')
    .replace('<svg ', '<svg role="img" aria-label="'+esc('方案 '+plan.code+' · '+plan.title)+'" ');
}
function records(t) {
  const sample=t.samples.length ? table(t.columns.map(c=>c[0]),t.samples) : '<p>實驗結束時為空。</p>';
  const keys=t.constraints.map(k=>k.sql);
  return `<section><h4>${esc(qualified(t))}</h4>${sample}
    <p class="meta">欄位限制與唯一索引</p><pre>${esc([...keys,...t.indexes].join('\n') || '此物件未宣告資料表約束或唯一索引。')}</pre></section>`;
}
function layout(title, prefix, body) {
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} · Software Dictionary</title><link rel="stylesheet" href="${prefix}atlas.css"></head>
    <body><header><a href="${prefix}../">Software Dictionary</a><a href="${prefix}../#/topics/commerce">電商業務詞典</a></header><main>${body}</main></body></html>`;
}
function chapterPage(viz, chapter, data) {
  const source='https://github.com/ge1123/research-schema-design/blob/'+inventory.revision+'/'+chapter.source+'/';
  const plans=data.plans.map(plan=>{
    const objects=data.tables.filter(t=>plan.tables?.includes(qualified(t)));
    const key=plan.code.toLowerCase();
    return `<section class="plan" id="${key}"><h2>方案 ${plan.code} · ${esc(plan.title)}</h2>
    <figure><div class="diagram" tabindex="0" role="region" aria-label="可捲動的 ER 圖">${diagram(viz,plan,objects)}</div>
    <figcaption>${plan.concept?'概念圖 · 原章節未提供此方案的 DDL。':'PostgreSQL 實驗結束時的結構。PK 為主鍵，FK 為外鍵。實線由參照表指向被參照表，邊上依序列出外鍵與目標欄位；兩端數字依欄位可空性及主鍵、唯一約束標示。'}</figcaption></figure>
    ${plan.note?'<p>'+prose(plan.note)+'</p>':''}
    ${objects.some(t=>t.depends?.length)?'<p>虛線 reads 表示檢視讀取的來源。</p>':''}
    ${objects.length?`<details><summary>看資料、外鍵與約束（${objects.length} 個物件）</summary>
    <p>以下是本次實驗回滾前的資料，每個物件最多顯示兩列。複合外鍵請按欄位順序對照 REFERENCES。</p>${objects.map(records).join('')}</details>`:''}
    <a class="source" href="${source}README.md#L${plan.line}">原章節 · 方案 ${plan.code}</a></section>`;
  }).join('');
  const [headers,...rows]=data.comparison;
  return layout(chapter.title,'../',`<a href="../">← 全部資料模型</a><p class="meta">${groupName[chapter.group]} · ${esc(chapter.source.split('/').pop().slice(0,2))}</p>
    <h1>${esc(chapter.title)}</h1><p>${prose(data.intro)}</p>
    <nav aria-label="本章方案">${data.plans.map(p=>`<a href="#${p.code.toLowerCase()}">${p.code} · ${esc(p.title)}</a>`).join('')}</nav>
    <h2>方案比較</h2>${table(headers,rows)}${plans}
    <h2>驗證與來源</h2><p>依 PostgreSQL 18.7 系統目錄繪製實作圖。單連線執行本章 lab.sql 並核對資料表、欄位、主外鍵與檢視。${esc(data.validationNote??'')}</p>
    <ul><li><a href="${source}lab.sql">完整 SQL 與案例斷言</a></li><li><a href="${source}README.md">固定版本教材</a></li>
    <li><a href="../../#${chapter.term}">相關詞條 · ${esc(termNames.get(chapter.term))}</a></li>
    ${chapter.source==='06-split-shipments'?'<li><a href="../../cases/split-shipments/">分批出貨 · 逐包查詢實例</a></li>':''}</ul>`);
}
export async function renderAtlas() {
  const viz=await instance();
  const pages=new Map();
  let count=0;
  for(const c of inventory.chapters){
    const data=readChapter(c);
    count+=data.plans.length;
    pages.set('models/'+c.slug+'/index.html',chapterPage(viz,c,data));
  }
  const lists=Object.entries(groupName).map(([group,label])=>{
    const chapters=inventory.chapters.filter(c=>c.group===group);
    return `<section id="${group}"><h2>${label} · ${chapters.length} 章</h2><ol class="chapters">${chapters.map(c=>`<li><a href="./${c.slug}/">${esc(c.title)}</a></li>`).join('')}</ol></section>`;
  }).join('');
  pages.set('models/index.html',layout('資料模型 ER 圖','./',`<h1>資料模型 ER 圖</h1><p>${inventory.chapters.length} 個業務與工程案例，${count} 個方案。各章可比較設計、閱讀 ER 圖，並展開實驗資料與約束。</p><nav aria-label="系列"><a href="#core">資料模型設計</a><a href="#commerce">電商交易模組</a></nav>${lists}`));
  return pages;
}
