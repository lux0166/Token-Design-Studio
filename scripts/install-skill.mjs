import { installSkill, planSkill } from '../cli/skill.mjs';
try {
  if(process.argv.slice(2).some(a=>a!=='--adopt-known'))throw new Error('Chỉ hỗ trợ --adopt-known.');
  const result = installSkill(planSkill(undefined,{adoptKnown:process.argv.includes('--adopt-known')}));
  console.log('Đã cài skill: ' + result.target + '\nMở phiên Codex mới để tải skill.');
  if (result.backup) console.log('Bản sao lưu: ' + result.backup);
} catch (error) { console.error(error.message); process.exitCode = 1; }
