import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync, readdirSync, utimesSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { planSkill, installSkill, beginSkillInstall } from '../cli/skill.mjs';
import { setupCodex } from '../cli/codex.mjs';

const fixture = t => { const home = mkdtempSync(join(tmpdir(), 'studio-transaction-')); t.after(() => rmSync(home, { recursive: true, force: true })); return home; };
test('skill edit after preflight is preserved and install-skill ignores unrelated PORT', t => {
  const home = fixture(t); installSkill(planSkill(home));
  const plan = planSkill(home), path = join(plan.target, 'SKILL.md');
  writeFileSync(path, 'custom edit'); assert.throws(() => installSkill(plan), /sau bước kiểm tra/); assert.equal(readFileSync(path, 'utf8'), 'custom edit');
  const fresh = join(home, 'fresh');
  const result = spawnSync(process.execPath, ['bin/token-design-studio.mjs', 'install-skill'], { encoding: 'utf8', env: { ...process.env, CODEX_HOME: fresh, PORT: '0' } });
  assert.equal(result.status, 0, result.stderr); assert.ok(existsSync(join(fresh, 'skills/token-studio-shadcn/SKILL.md')));
});
test('path conflicts are detected before any skill or MCP writes', t => {
  const home = fixture(t), target = join(home, 'skills/token-studio-shadcn'); mkdirSync(target, { recursive: true }); writeFileSync(join(target, 'references'), 'keep me');
  assert.throws(() => planSkill(home), /Xung đột/); assert.equal(existsSync(join(target, 'SKILL.md')), false);
});
test('installation lock rejects another process and leaves no partial manifest', t => {
  const home = fixture(t), transaction = beginSkillInstall(planSkill(home));
  const second = spawnSync(process.execPath, ['bin/token-design-studio.mjs', 'install-skill'], { encoding: 'utf8', env: { ...process.env, CODEX_HOME: home } });
  assert.equal(second.status, 1); assert.match(second.stderr, /Bộ cài khác/);
  transaction.commit(); transaction.finish(); assert.ok(existsSync(join(home, 'skills/token-studio-shadcn/.token-design-studio.json')));
});
test('failed swap restores old tree including unmanaged files', t => {
  const home = fixture(t); installSkill(planSkill(home));
  const target = join(home, 'skills/token-studio-shadcn'); writeFileSync(join(target, 'notes.txt'), 'personal');
  const transaction = beginSkillInstall(planSkill(home, { version: 'test-next' }));
  const stage = readdirSync(join(home, 'skills')).find(name => name.startsWith('.token-studio-shadcn.stage-'));
  rmSync(join(home, 'skills', stage), { recursive: true });
  assert.throws(() => transaction.commit()); transaction.abort(new Error('fault'));
  assert.equal(readFileSync(join(target, 'notes.txt'), 'utf8'), 'personal'); assert.notEqual(JSON.parse(readFileSync(join(target, '.token-design-studio.json'))).version, 'test-next');
});
test('interrupted committed install recovers on next invocation before retry', t => {
  const home = fixture(t); installSkill(planSkill(home));
  const code = "import {planSkill,beginSkillInstall} from './cli/skill.mjs'; const tx=beginSkillInstall(planSkill(process.env.CODEX_HOME,{version:'interrupted'})); tx.commit(); process.exit(0);";
  assert.equal(spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd: resolve('.'), env: { ...process.env, CODEX_HOME: home } }).status, 0);
  const lock = join(home, 'skills/.token-studio-shadcn.install.lock'); if (existsSync(lock)) utimesSync(lock, new Date(0), new Date(0));
  assert.throws(() => installSkill(planSkill(home)), /sau bước kiểm tra/);
  assert.notEqual(JSON.parse(readFileSync(join(home, 'skills/token-studio-shadcn/.token-design-studio.json'))).version, 'interrupted');
  installSkill(planSkill(home));
});
test('setup creates fresh CODEX_HOME and compensates config when skill changes during CLI call', t => {
  const root = fixture(t), home = join(root, 'fresh'); const previous = process.env.CODEX_HOME; process.env.CODEX_HOME = home;
  t.after(() => { if (previous === undefined) delete process.env.CODEX_HOME; else process.env.CODEX_HOME = previous; });
  const run = args => {
    if (args[1] === 'get') return { status: 1, stderr: 'No MCP server' };
    writeFileSync(join(home, 'config.toml'), '[mcp_servers.token-studio]\nurl="http://127.0.0.1:4318/mcp"\n');
    mkdirSync(join(home, 'skills/token-studio-shadcn'), { recursive: true }); writeFileSync(join(home, 'skills/token-studio-shadcn/notes.txt'), 'external edit');
    return { status: 0 };
  };
  assert.throws(() => setupCodex(4318, false, run), /hoàn nguyên/);
  assert.equal(existsSync(join(home, 'config.toml')), false); assert.equal(readFileSync(join(home, 'skills/token-studio-shadcn/notes.txt'), 'utf8'), 'external edit');
});
test('rollback refuses to overwrite concurrent configuration edits', t => {
  const home = fixture(t), config = join(home, 'config.toml'); writeFileSync(config, 'original');
  const tx = beginSkillInstall(planSkill(home)); const backup = tx.configBefore(config); writeFileSync(config, 'installed'); tx.configWritten(); writeFileSync(config, 'other process');
  assert.throws(() => tx.abort(new Error('fault')), /tiến trình khác/); assert.equal(readFileSync(config, 'utf8'), 'other process'); assert.equal(readFileSync(backup, 'utf8'), 'original');
});
