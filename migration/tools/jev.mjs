#!/usr/bin/env node
// Zero-dependency CLI harness for TypeSafe's Jev ("System One") model via
// Cloudflare Workers AI.
//
// Usage:
//   node migration/tools/jev.mjs <request.json> [--runs N] [--raw]
//
// request.json shape:
//   { "state": string | object | array, "questions": { <id>: { type, instructions, criteria } } }
//
// Credentials (never printed): CF_ACCOUNT_ID, CF_JEV_API_TOKEN, read from
// process.env first, falling back to a dotenv-style file at JEV_ENV_FILE
// (default: <cwd>/.env.jev). Lines are KEY=VALUE, '#' comments and blank
// lines are skipped; values are not shell-expanded.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CF_ENDPOINT = (accountId) =>
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run`;
const MODEL = 'typesafe/jev';

function loadEnvFile(path) {
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return {};
  }
  const out = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function resolveCredentials() {
  const envFilePath = resolve(process.env.JEV_ENV_FILE || resolve(process.cwd(), '.env.jev'));
  const fileVars = loadEnvFile(envFilePath);
  const accountId = process.env.CF_ACCOUNT_ID || fileVars.CF_ACCOUNT_ID;
  const token = process.env.CF_JEV_API_TOKEN || fileVars.CF_JEV_API_TOKEN;
  if (!accountId || !token) {
    throw new Error(
      `Missing CF_ACCOUNT_ID / CF_JEV_API_TOKEN. Set them in the environment or in ${envFilePath} ` +
        '(set JEV_ENV_FILE to point elsewhere).',
    );
  }
  return { accountId, token };
}

function parseArgs(argv) {
  const args = { runs: 1, raw: false, requestPath: undefined };
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--runs') {
      args.runs = Number.parseInt(argv[++i], 10);
    } else if (a === '--raw') {
      args.raw = true;
    } else {
      rest.push(a);
    }
  }
  args.requestPath = rest[0];
  return args;
}

async function callJev({ accountId, token }, body) {
  const start = performance.now();
  let response;
  let json;
  try {
    response = await fetch(CF_ENDPOINT(accountId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const latencyMs = performance.now() - start;
    throw Object.assign(new Error(`Network error calling Jev: ${err.message}`), { latencyMs });
  }
  const latencyMs = performance.now() - start;
  const text = await response.text();
  try {
    json = JSON.parse(text);
  } catch {
    throw Object.assign(
      new Error(`Non-JSON response (HTTP ${response.status}): ${text.slice(0, 300)}`),
      { latencyMs, httpStatus: response.status },
    );
  }
  if (!response.ok || json.success === false) {
    const apiErrors = Array.isArray(json.errors) ? json.errors : [];
    const detail = apiErrors.map((e) => `${e.code}: ${e.message}`).join('; ') || text.slice(0, 300);
    throw Object.assign(new Error(`Jev API error (HTTP ${response.status}): ${detail}`), {
      latencyMs,
      httpStatus: response.status,
      apiErrors,
    });
  }
  return { json, latencyMs, httpStatus: response.status };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.requestPath) {
    console.error('Usage: node migration/tools/jev.mjs <request.json> [--runs N] [--raw]');
    process.exitCode = 1;
    return;
  }
  const requestFile = JSON.parse(readFileSync(resolve(args.requestPath), 'utf8'));
  if (typeof requestFile.state === 'undefined' || typeof requestFile.questions !== 'object') {
    throw new Error('request.json must have "state" and "questions" fields');
  }
  const creds = resolveCredentials();
  const body = { model: MODEL, input: { state: requestFile.state, questions: requestFile.questions } };

  const runs = Number.isFinite(args.runs) && args.runs > 0 ? args.runs : 1;
  const results = [];
  for (let i = 0; i < runs; i += 1) {
    try {
      const { json, latencyMs, httpStatus } = await callJev(creds, body);
      const result = json.result ?? json;
      const out = {
        ok: true,
        answers: result.answers ?? result,
        latencyMs: Math.round(latencyMs),
        httpStatus,
        usage: result.usage ?? json.usage ?? null,
        model: result.model ?? null,
      };
      if (args.raw) out.raw = json;
      results.push(out);
    } catch (err) {
      const out = {
        ok: false,
        error: err.message,
        latencyMs: err.latencyMs ? Math.round(err.latencyMs) : null,
        httpStatus: err.httpStatus ?? null,
      };
      results.push(out);
    }
  }
  const payload = runs === 1 ? results[0] : { runs: results };
  console.log(JSON.stringify(payload, null, 2));
  if (runs === 1 && results[0].ok === false) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`jev.mjs failed: ${err.message}`);
  process.exitCode = 1;
});
