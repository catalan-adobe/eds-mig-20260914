#!/usr/bin/env node
// PROXY for the Jev evaluation (Jev itself returns HTTP 402 on this account): replay the recorded
// migration decisions through a standard Workers AI chat model and compare with the agent's answers.
// usage: node migration/tools/cf-llm-eval.mjs <model-id> [decisions.json]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../..', import.meta.url).pathname;
const env = Object.fromEntries(readFileSync(join(ROOT, '.env.jev'), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]));
const model = process.argv[2] || '@cf/meta/llama-3.1-8b-instruct';
const { blockPalette, decisions } = JSON.parse(readFileSync(process.argv[3] || join(ROOT, 'migration/jev/decisions.json'), 'utf8'));

function prompt(d) {
  if (d.kind === 'block_type') return `Pick the Edge Delivery Services block for this page section. Options: ${JSON.stringify(blockPalette)}. Section: ${d.state}\nReply with JSON {"answer": "<option key>"} only.`;
  if (d.kind === 'authorable') return `Should this element be editable by content authors in the document (true) rather than fixed in code/CSS (false)? Element: ${d.state}\nReply with JSON {"answer": true|false} only.`;
  return `Which option best serves the goal? Options: ${JSON.stringify(d.options)}. Context: ${d.state}\nReply with JSON {"answer": "<option key>"} only.`;
}

const rows = [];
for (const d of decisions) {
  const t0 = Date.now();
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CF_JEV_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt(d) }], max_tokens: 40, temperature: 0 }),
  });
  const latencyMs = Date.now() - t0;
  const j = await res.json();
  const resp = j.result ? (j.result.response ?? j.result.choices?.[0]?.message?.content ?? '') : '';
  const text = typeof resp === 'string' ? resp : JSON.stringify(resp);
  let answer = null;
  try { answer = (typeof resp === 'object' ? resp : JSON.parse(text.match(/\{[^}]*\}/)[0])).answer; } catch { answer = null; }
  if (typeof answer === 'string' && d.kind === 'authorable') answer = answer === 'true';
  rows.push({ id: d.id, mine: d.mine, model: answer, raw: text.slice(0, 100), agree: answer === d.mine, latencyMs, http: res.status,
    usage: j.result && j.result.usage, error: j.success === false ? JSON.stringify(j.errors).slice(0, 160) : undefined });
}
const lat = rows.map((r) => r.latencyMs).sort((a, b) => a - b);
console.log(JSON.stringify({ model, summary: { total: rows.length, agree: rows.filter((r) => r.agree).length,
  parsed: rows.filter((r) => r.model !== null).length, p50Ms: lat[Math.floor(lat.length / 2)], p95Ms: lat[Math.floor(lat.length * 0.95)] }, rows }, null, 1));
