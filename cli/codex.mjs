import { spawnSync } from 'node:child_process';
import { existsSync, copyFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { codexHome } from './paths.mjs';
import { planSkill, installSkill } from './skill.mjs';
function codex(args) {
  let command = 'codex';
  if (process.platform === 'win32') {
    const paths = spawnSync('where.exe', ['codex'], { encoding: 'utf8', windowsHide: true });
    const candidates = (paths.stdout || '').trim().split(/\r?\n/).filter(Boolean);
    command = candidates.find(path => /\.exe$/i.test(path)) || candidates.find(path => /\.cmd$/i.test(path)) || 'codex';
    if (/\.cmd$/i.test(command)) {
      // Fixed names and a validated loopback URL only, never free-form shell input.
      return spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `""${command}" ${args.map(arg => `"${arg}"`).join(' ')}"`], { encoding: 'utf8', windowsHide: true });
    }
  }
  return spawnSync(command, args, { encoding: 'utf8', windowsHide: true });
}
export function setupCodex(port, replace = false) {
  const plan = planSkill();
  const url = `http://127.0.0.1:${port}/mcp`;
  const current = codex(['mcp', 'get', 'token-studio', '--json']);
  if (current.error) throw new Error('Không tìm thấy Codex CLI. Cài Codex CLI trước, hoặc dùng install-skill rồi thêm HTTP MCP trong Settings.');
  let same = false;
  if (current.status === 0) {
    const info = JSON.parse(current.stdout);
    same = info.enabled !== false && info.transport?.type === 'streamable_http' && info.transport.url === url;
    if (!same && !replace) throw new Error('MCP token-studio đã có cấu hình khác. Chưa ghi thay đổi. Dùng --replace-mcp để thay riêng kết nối này.');
  } else if (!/No MCP server|not found|does not exist/i.test(current.stderr || '')) throw new Error(`Không đọc được cấu hình Codex: ${(current.stderr || '').trim()}`);
  let configBackup;
  if (!same) {
    const config = join(codexHome(), 'config.toml');
    if (existsSync(config)) { configBackup = `${config}.token-design-studio-${Date.now()}.bak`; copyFileSync(config, configBackup); chmodSync(configBackup, 0o600); }
    const added = codex(['mcp', 'add', 'token-studio', '--url', url]);
    if (added.status !== 0) throw new Error(`Chưa thêm được MCP. Bản sao lưu: ${configBackup || 'không có cấu hình cũ'}. ${(added.stderr || '').trim()}`);
  }
  return { ...installSkill(plan), configBackup, url, unchangedMcp: same };
}
