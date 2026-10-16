import { homedir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
export const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const metadata = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
export function defaultDataDirectory(env = process.env, platform = process.platform, home = homedir()) {
  if (env.STUDIO_DATA_DIR) return resolve(env.STUDIO_DATA_DIR);
  if (platform === 'win32') return join(env.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'TokenDesignStudio');
  if (platform === 'darwin') return join(home, 'Library', 'Application Support', 'TokenDesignStudio');
  return join(env.XDG_DATA_HOME || join(home, '.local', 'share'), 'token-design-studio');
}
export function codexHome() { return resolve(process.env.CODEX_HOME || join(homedir(), '.codex')); }
