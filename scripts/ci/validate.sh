#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project="$(realpath -- "$1")"
evidence="$(realpath -m -- "$2")"
mkdir -p -- "$evidence"
cd -- "$project"
source_revision="$(git rev-parse HEAD)"
test "$source_revision" = "$EXPECTED_SOURCE_REVISION"
test "$(node --version)" = v24.19.0
test "$(pnpm --version)" = 11.25.0
node --input-type=module - <<'NODE'
import { readFileSync } from 'node:fs';
const project = JSON.parse(readFileSync('package.json', 'utf8'));
if (project.packageManager !== 'pnpm@11.25.0') throw new Error('Unexpected package manager pin');
NODE
lock_before="$(sha256sum pnpm-lock.yaml | cut -d ' ' -f 1)"
export NEXT_TELEMETRY_DISABLED=1

run_phase() {
  local phase="$1" started status
  shift
  started="$(date +%s)"
  set +e
  "$@"
  status="$?"
  set -e
  printf '%s\t%s\t%s\n' "$phase" "$status" "$(( $(date +%s) - started ))" >> "$evidence/phases.tsv"
  return "$status"
}

result=0
if run_phase install timeout --signal=TERM --kill-after=10s 8m pnpm install --frozen-lockfile --fetch-retries=0 --fetch-timeout=30000; then
  run_phase tests timeout --signal=TERM --kill-after=10s 90s pnpm test || result=1
  run_phase typecheck timeout --signal=TERM --kill-after=10s 2m pnpm exec tsc --noEmit || result=1
  if run_phase build timeout --signal=TERM --kill-after=10s 4m pnpm build; then
    run_phase http_smoke timeout --signal=TERM --kill-after=10s 90s node "$script_dir/http-smoke.mjs" "$project" "$evidence/http-smoke.json" || result=1
  else
    result=1
  fi
else
  result=1
fi
run_phase tracked_source timeout 10s git diff --exit-code || result=1
lock_after="$(sha256sum pnpm-lock.yaml | cut -d ' ' -f 1)"
node --input-type=module - "$evidence" "$source_revision" "$lock_before" "$lock_after" "$result" <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const [directory, revision, before, after, result] = process.argv.slice(2);
const phases = readFileSync(path.join(directory, 'phases.tsv'), 'utf8').trim().split('\n').map(line => {
  const [name, code, seconds] = line.split('\t');
  return { name, exit_code: Number(code), seconds: Number(seconds) };
});
writeFileSync(path.join(directory, 'validation.json'), JSON.stringify({
  schema_version: 1, source_revision: revision, node: process.version,
  pnpm: '11.25.0', lockfile_sha256_before: before, lockfile_sha256_after: after,
  result: Number(result), phases,
  scope: 'Synthetic tests and disposable local application smoke; no external account or deployment acceptance',
}, null, 2) + '\n');
if (before !== after) process.exitCode = 1;
NODE
exit "$result"
