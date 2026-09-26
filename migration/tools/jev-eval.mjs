#!/usr/bin/env node
// Replay recorded migration decisions through Jev and compare with the agent's own answers.
// usage: node migration/tools/jev-eval.mjs [migration/jev/decisions.json] > migration/jev/results.json
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = new URL('../..', import.meta.url).pathname;
const file = process.argv[2] || join(ROOT, 'migration/jev/decisions.json');
const { blockPalette, decisions } = JSON.parse(readFileSync(file, 'utf8'));
const dir = mkdtempSync(join(tmpdir(), 'jev-'));
const PRICE_PER_TOKEN = 0.042 / 1e6; // USD, documented direct-API input price; output tokens free

function question(d) {
  if (d.kind === 'block_type') {
    return { type: 'choice', instructions: 'Which Edge Delivery Services block (or default content) best represents this page section for authors?', criteria: blockPalette };
  }
  if (d.kind === 'authorable') {
    return { type: 'noul', instructions: 'Should this element be editable by content authors in the document (true) rather than fixed in code/CSS (false)?', criteria: { true: 'Copy, images or links an author may need to change', false: 'Decoration or behaviour that belongs to the design system' } };
  }
  return { type: 'choice', instructions: 'Which option best serves the stated goal?', criteria: d.options };
}

const rows = [];
for (const d of decisions) {
  const req = join(dir, `${d.id}.json`);
  writeFileSync(req, JSON.stringify({ state: d.state, questions: { q: question(d) } }));
  let res;
  try {
    res = JSON.parse(execFileSync('node', [join(ROOT, 'migration/tools/jev.mjs'), req], { encoding: 'utf8', cwd: ROOT }));
  } catch (e) {
    res = { ok: false, error: String(e.stdout || e.message).slice(0, 300) };
  }
  const a = res.answers && res.answers.q;
  const jev = a ? (d.kind === 'authorable' ? a.noul >= 0.5 : a.choice) : null;
  rows.push({ id: d.id, kind: d.kind, mine: d.mine, jev, agree: jev === null ? null : jev === d.mine,
    confidence: a ? (a.confidence ?? a.noul) : null, latencyMs: res.latencyMs,
    costUsd: res.usage ? res.usage.input_tokens * PRICE_PER_TOKEN : null, error: res.ok === false ? res.error : undefined });
}
const answered = rows.filter((r) => r.jev !== null);
const lat = answered.map((r) => r.latencyMs).sort((x, y) => x - y);
console.log(JSON.stringify({
  summary: { total: rows.length, answered: answered.length, agree: answered.filter((r) => r.agree).length,
    p50Ms: lat[Math.floor(lat.length / 2)] ?? null, totalCostUsd: answered.reduce((s, r) => s + (r.costUsd || 0), 0) },
  rows,
}, null, 1));
