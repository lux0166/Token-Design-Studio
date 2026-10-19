// Explicit known upstream inputs; never derive trust from an installed user's files.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const refs=['c3e8142','9f4bef2','1f5e219','cc26f76'];
const files=['SKILL.md','agents/openai.yaml','references/interview.md','references/reuse.md','references/design-quality.md','references/handoff.md','references/tasks.md','assets/task.schema.json','assets/task-template.json','scripts/validate-task.cjs','scripts/THIRD_PARTY_LICENSES.txt'];
const hashes={};
const add=(file,content)=>{const lf=content.replaceAll('\r\n','\n');for(const text of [lf,lf.replaceAll('\n','\r\n')]){const hash=createHash('sha256').update(text).digest('hex');(hashes[file]??=new Set()).add(hash);}};
const source=(ref,file)=>execFileSync('git',['show',`${ref}:skills/token-studio-shadcn/${file}`],{encoding:'utf8',stdio:['ignore','pipe','ignore']});
for(const ref of refs)for(const file of files)try{add(file,source(ref,file));}catch{}
for(const ref of ['1f5e219','cc26f76']){
  const policy=source(ref,'SKILL.md').split(/\r?\n/).find(line=>line.startsWith('For new icon selection,'));
  if(!policy)throw new Error('Known policy source missing');
  add('SKILL.md',source('c3e8142','SKILL.md').replaceAll('\r\n','\n').replace('Use available shadcn MCP discovery/search/view tools',policy+'\n\nUse available shadcn MCP discovery/search/view tools'));
}
writeFileSync('cli/known-skills.mjs','// Hashes of pinned upstream releases and documented legacy icon-policy merges.\nexport const knownSkillHashes = '+JSON.stringify(Object.fromEntries(Object.entries(hashes).map(([file,set])=>[file,[...set]])),null,2)+';\n');
