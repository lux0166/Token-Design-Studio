import { packageRoot, metadata, codexHome } from './paths.mjs';
import { join } from 'node:path';
import { planInstallation, beginInstallation } from './install-core.mjs';
export function planSkill(home = codexHome(), options = {}) {
  return planInstallation({ home, source: join(packageRoot, 'skills/token-studio-shadcn'), version: metadata.version, ...options });
}
export function beginSkillInstall(plan = planSkill()) { return beginInstallation(plan); }
export function installSkill(plan = planSkill()) {
  const transaction = beginSkillInstall(plan);
  try { transaction.commit(); return transaction.finish(); }
  catch (error) { transaction.abort(error); throw error; }
}
