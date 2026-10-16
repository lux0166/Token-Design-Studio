import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

test('installer delivers the quality guide and preserves a locally customized skill without partial writes', t => {
  const home = mkdtempSync(join(tmpdir(), 'token-studio-skill-'));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  const run = () => spawnSync(process.execPath, ['scripts/install-skill.mjs'], { cwd: resolve('.'), env: { ...process.env, CODEX_HOME: home }, encoding: 'utf8' });
  assert.equal(run().status, 0);
  const target = join(home, 'skills/token-studio-shadcn');
  const quality = 'references/design-quality.md';
  const source = readFileSync(resolve('skills/token-studio-shadcn', quality));
  assert.deepEqual(readFileSync(join(target, quality)), source);
  assert.equal(run().status, 0, 'identical installation remains safe to repeat');
  const instructions = readFileSync(join(target, 'SKILL.md'));
  writeFileSync(join(target, quality), 'Local quality preferences must survive.\n');
  const refused = run();
  assert.equal(refused.status, 1);
  assert.equal(readFileSync(join(target, quality), 'utf8'), 'Local quality preferences must survive.\n');
  assert.deepEqual(readFileSync(join(target, 'SKILL.md')), instructions);
});
