import{test}from'node:test';
import assert from'node:assert/strict';
import{mkdtempSync,mkdirSync,cpSync,writeFileSync,readFileSync,readdirSync,existsSync}from'node:fs';
import{join,resolve}from'node:path';
import{tmpdir}from'node:os';
import{execFileSync,spawnSync}from'node:child_process';
import{planInstallation,beginInstallation,inspectSkill}from'../cli/install-core.mjs';
import{rmSync}from'node:fs';
const setup=t=>{const home=mkdtempSync(join(tmpdir(),'studio-adopt-'));t.after(()=>rmSync(home,{recursive:true,force:true}));const target=join(home,'skills/token-studio-shadcn');mkdirSync(join(home,'skills'));cpSync('skills/token-studio-shadcn',target,{recursive:true});writeFileSync(join(target,'SKILL.md'),execFileSync('git',['show','c3e8142:skills/token-studio-shadcn/SKILL.md']));writeFileSync(join(target,'my-notes.md'),'Preserve unmanaged notes');return{home,target,source:resolve('skills/token-studio-shadcn'),version:'0.4.0'};};
test('doctor is read-only and known unmanaged adoption retains backup, custom extras and full contents',t=>{
  const options=setup(t),before=readFileSync(join(options.target,'SKILL.md'));
  const report=inspectSkill(options);assert.equal(report.adoptable,true);assert.equal(report.managed,false);assert.ok(report.outdated.includes('SKILL.md'));assert.equal(existsSync(join(options.target,'.token-design-studio.json')),false);
  assert.throws(()=>planInstallation(options),/chỉnh riêng/);
  const transaction=beginInstallation(planInstallation({...options,adoptKnown:true}));transaction.commit();const result=transaction.finish();
  assert.deepEqual(readFileSync(join(result.backup,'SKILL.md')),before);assert.equal(readFileSync(join(options.target,'my-notes.md'),'utf8'),'Preserve unmanaged notes');assert.equal(inspectSkill(options).healthy,true);
  for(const file of ['references/tasks.md','assets/task.schema.json','assets/task-template.json','scripts/validate-task.cjs'])assert.ok(existsSync(join(options.target,file)));
});
test('adopt-known cannot override custom files or change ownership of a managed client',t=>{
  const options=setup(t);writeFileSync(join(options.target,'references/reuse.md'),'Custom rules');const before=readFileSync(join(options.target,'SKILL.md'));
  assert.ok(inspectSkill(options).customized.includes('references/reuse.md'));assert.throws(()=>planInstallation({...options,adoptKnown:true}),/chỉnh riêng/);assert.deepEqual(readFileSync(join(options.target,'SKILL.md')),before);assert.equal(existsSync(join(options.target,'.token-design-studio.json')),false);
});
test('full CLI install-skill accepts adopt-known independently of invalid PORT',t=>{
  const options=setup(t);const result=spawnSync(process.execPath,['bin/token-design-studio.mjs','install-skill','--adopt-known'],{encoding:'utf8',env:{...process.env,CODEX_HOME:options.home,PORT:'invalid'},windowsHide:true});assert.equal(result.status,0,result.stderr);assert.equal(inspectSkill(options).healthy,true);
});
