import { installSkill } from '../cli/skill.mjs';
try {
  const result = installSkill();
  console.log('Đã cài skill: ' + result.target + '\nMở phiên Codex mới để tải skill.');
  if (result.backup) console.log('Bản sao lưu: ' + result.backup);
} catch (error) { console.error(error.message); process.exitCode = 1; }
