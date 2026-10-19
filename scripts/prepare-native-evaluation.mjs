// Opt-in preparation only. Never starts chats, changes client configuration or overwrites recorded results.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
const root=resolve('output/evaluations/040/native-prepared');mkdirSync(root,{recursive:true});
const cases=JSON.parse(readFileSync('docs/evaluation/1.4.0/cases.json','utf8')).cases;
const guides=['SKILL.md','references/interview.md','references/reuse.md','references/design-quality.md','references/tasks.md','references/handoff.md'];
const assets=['assets/task-template.json','assets/task.schema.json','scripts/validate-task.cjs','scripts/THIRD_PARTY_LICENSES.txt'];
const digest=value=>createHash('sha256').update(value).digest('hex');
const versions=['1.3.2','1.4.0'], inputs=[];
for(const version of versions){
  const source=path=>version==='1.3.2'?execFileSync('git',['show',`cc26f76:skills/token-studio-shadcn/${path}`]):readFileSync(join('skills/token-studio-shadcn',path));
  const dir=join(root,version);mkdirSync(dir,{recursive:true});
  for(const file of [...guides,...assets]){const destination=join(dir,file);mkdirSync(dirname(destination),{recursive:true});writeFileSync(destination,source(file));}
  const guide=guides.map(file=>source(file).toString('utf8')).join('\n\n---\n\n');writeFileSync(join(dir,'WORKFLOW.md'),guide);
  inputs.push({version,guideSha256:digest(guide),skillDirectory:dir});
}
const runs=[];
for(const client of ['codex','antigravity'])for(const workflow of versions)for(const fixture of cases){
  const id=`${client}-${workflow}-${fixture.id}`,folder=join(root,workflow);
  const prompt=`Run this user-authorized synthetic evaluation in a fresh ${client} native IDE/app chat and a dedicated empty workspace. Never edit Token Studio sources, the English demo, global skills, client settings or other chats.\n\nRead ${join(folder,'WORKFLOW.md')}; use only workflow ${workflow}. Its matching schema, template and helper are in ${folder}. Do not replace baseline assets with the current installed v2 helper. Native discovery is evaluated separately.\n\nConfirmed fixture:\n${fixture.task}\n${fixture.reference?`Inspect the actual PNG: ${resolve(fixture.reference.path)} (${fixture.reference.width}x${fixture.reference.height}, SHA-256 ${fixture.reference.sha256}).`:''}\n\nBuild a local standalone HTML/CSS/JS prototype with semantic browser controls and synthetic data, plus a proportionate dossier for that workflow version. Production React/shadcn integration, deployment and new business rules are outside scope. Use the confirmed direction; do not ask again. Inspect the image and test real main interactions, desktop/mobile and keyboard; save real screenshots, command outcomes and limits. If tools are blocked, record the block, do independent work and never invent evidence. Save RESULT.json with actual client/version/model if observable, source guide hash, paths, commands and limitations. Do not send messages to other chats.\n`;
  const path=join(root,id+'.md');writeFileSync(path,prompt);runs.push({id,client,workflow,case:fixture.id,surface:'native IDE/app',status:'pending',prompt:path,promptSha256:digest(prompt)});
}
writeFileSync(join(root,'plan.json'),JSON.stringify({schemaVersion:1,inputs,runs},null,2)+'\n');
console.log(`Prepared 8 native prompts under ${root}. No sessions started. Preserve per-run inputs and actual evidence separately.`);
