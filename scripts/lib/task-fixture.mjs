// Independent synthetic package fixture exercised through the installed helper.
import{mkdirSync,writeFileSync,readFileSync}from'node:fs';
import{join}from'node:path';
import{spawnSync}from'node:child_process';
import{createHash}from'node:crypto';
export function prepareGrillFixture(root,helper){
  mkdirSync(root,{recursive:true});const spec='Synthetic specification: clarify scheduling rules before code. No real interview or browser claim.';
  writeFileSync(join(root,'SPEC.md'),spec);
  const task={schemaVersion:2,title:'Package grill fixture',goal:'Specify schedule rules',project:'Package verification',mode:'grill-me',scope:'screen',decisions:[{id:'D-01',question:'What is in scope?',answer:'Specification only',source:'project',status:'resolved',material:true,evidence:'Synthetic package fixture brief'}],acceptanceCriteria:[{id:'AC-01',text:'Specification states the scheduling scope',decisionIds:['D-01']}],artifacts:[{id:'spec',kind:'spec',path:'SPEC.md',label:'Synthetic specification',sha256:createHash('sha256').update(spec).digest('hex')}],checks:[{id:'accept',kind:'acceptance',label:'Specification coverage',status:'passed',required:true,evidence:'Synthetic spec contains the confirmed scope; no implementation claimed',criterionIds:['AC-01'],artifactIds:['spec']}]};
  const file=join(root,'task.json');writeFileSync(file,JSON.stringify({task}));
  const run=args=>{const result=spawnSync(process.execPath,[helper,...args],{encoding:'utf8',windowsHide:true,timeout:10000});if(result.status!==0)throw new Error(result.stderr||result.stdout);return JSON.parse(result.stdout);};
  run(['snapshot',file,'--project-root',root,'--phase','plan','--write']);
  const draft=JSON.parse(readFileSync(file,'utf8'));draft.task.checks[0].fingerprint=draft.task.snapshots.plan.digest;writeFileSync(file,JSON.stringify(draft));
  run(['verify',file,'--project-root',root,'--write']);return{file,task:JSON.parse(readFileSync(file,'utf8')).task};
}
