import { prepareGrillFixture } from './lib/task-fixture.mjs';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, existsSync, writeFileSync, rmSync, statSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
const metadata = JSON.parse(readFileSync('package.json', 'utf8'));
if (!process.env.npm_execpath) throw new Error('Chạy npm run test:skill-package.');
const temp = mkdtempSync(join(tmpdir(), 'studio-light-package-'));
const tarball = resolve(`output/npm/token-design-studio-skill-${metadata.version}.tgz`);
try {
  assert.ok(statSync(tarball).size < 200000, 'Skill package must stay below 200 KB compressed.');
  const result = spawnSync(process.execPath, [process.env.npm_execpath, 'install', '--prefix', temp, '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund', tarball], { encoding: 'utf8', timeout: 120000 }); assert.equal(result.status, 0, result.stderr);
  const root = join(temp, 'node_modules/token-design-studio-skill'), cli = join(root, 'bin/token-design-studio-skill.mjs');
  const installed = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')); assert.equal(installed.dependencies, undefined); assert.equal(installed.scripts?.postinstall, undefined);
  assert.deepEqual(readdirSync(join(temp, 'node_modules')).filter(n => n !== '.bin' && n !== '.package-lock.json'), ['token-design-studio-skill']);
  const run = args => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', timeout: 10000, env: { ...process.env, PORT: 'invalid' } });
  const homes = {};
  for (const client of ['codex', 'antigravity']) {
    const home = join(temp, client); homes[client] = home;
    const first = run(['install', '--client', client, '--home', home]); assert.equal(first.status, 0, first.stderr);
    const skill = join(home, 'skills/token-studio-shadcn');
    assert.equal(existsSync(join(skill, 'agents/openai.yaml')), client === 'codex');
    for (const file of ['SKILL.md', 'references/tasks.md', 'references/reuse.md', 'references/handoff.md', 'assets/task.schema.json', 'assets/task-template.json', 'scripts/validate-task.cjs', 'scripts/THIRD_PARTY_LICENSES.txt']) assert.deepEqual(readFileSync(join(skill, file)), readFileSync(join('skills/token-studio-shadcn', file)));
    assert.equal(run(['install', '--client', client, '--home', home]).status, 0);
    const doctor=run(['doctor','--client',client,'--home',home]);assert.equal(doctor.status,0,doctor.stderr);assert.equal(JSON.parse(doctor.stdout).healthy,true);
    const adoptHome=join(temp,client+'-legacy'), adoptTarget=join(adoptHome,'skills/token-studio-shadcn');mkdirSync(adoptTarget,{recursive:true});
    const upstream=spawnSync('git',['show','c3e8142:skills/token-studio-shadcn/SKILL.md'],{encoding:'utf8'});assert.equal(upstream.status,0);writeFileSync(join(adoptTarget,'SKILL.md'),upstream.stdout);
    assert.equal(run(['install','--client',client,'--home',adoptHome]).status,1);
    const adopted=run(['install','--client',client,'--home',adoptHome,'--adopt-known']);assert.equal(adopted.status,0,adopted.stderr);assert.ok(JSON.parse(adopted.stdout).backup);assert.equal(existsSync(join(adoptTarget,'agents/openai.yaml')),client==='codex');
    assert.equal(run(['install', '--client', client === 'codex' ? 'antigravity' : 'codex', '--home', home]).status, 1, 'do not mix client metadata in the same managed target');
    assert.equal(existsSync(join(home, 'config.toml')), false);
    writeFileSync(join(skill, 'references/tasks.md'), 'custom task rules'); assert.equal(run(['install', '--client', client, '--home', home]).status, 1); assert.equal(readFileSync(join(skill, 'references/tasks.md'), 'utf8'), 'custom task rules');
  }
  const helper = join(homes.codex, 'skills/token-studio-shadcn/scripts/validate-task.cjs');
  const fixture = prepareGrillFixture(join(temp, 'task-project'), helper);
  assert.equal(spawnSync(process.execPath,[helper,fixture.file,'--project-root',join(temp,'task-project')]).status,0);
  fixture.task.artifacts=[];writeFileSync(fixture.file,JSON.stringify({task:fixture.task}));
  assert.equal(spawnSync(process.execPath,[helper,fixture.file,'--project-root',join(temp,'task-project')]).status,1);
  assert.equal(run(['install', '--client', 'unknown', '--home', join(temp, 'bad')]).status, 1); assert.equal(existsSync(join(temp, 'bad')), false);
  console.log('PASS lightweight tarball: zero runtime dependencies, <200 KB, Codex + Antigravity isolation, repeat/customization protection, offline validator, no MCP configuration writes.');
} finally { rmSync(temp, { recursive: true, force: true }); }
