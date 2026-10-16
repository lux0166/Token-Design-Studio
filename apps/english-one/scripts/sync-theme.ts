import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { writeFileSync } from 'node:fs';
const client = new Client({ name: 'fluento-design', version: '0.1.0' });
await client.connect(new StreamableHTTPClientTransport(new URL('http://127.0.0.1:4318/mcp')));
async function call(name: string, args: Record<string, unknown> = {}) {
  const r = await client.callTool({ name, arguments: args });
  const text = (r.content as { type: string; text: string }[])[0].text;
  if (r.isError) throw new Error(text);
  return JSON.parse(text);
}
try {
  await call('get_workflow', { mode: 'design-and-build' });
  const list = await call('list_systems');
  let system = list.systems.find((s: { name: string }) => s.name === 'Fluento · Learning');
  if (!system) system = await call('create_system', { name: 'Fluento · Learning', preset: 2 });
  const current = await call('get_system', { systemId: system.id });
  await call('update_tokens', { systemId: system.id, expectedRevision: current.revision, patch: {
    light: { background: '#F7F8FC', foreground: '#172035', card: '#FFFFFF', 'card-foreground': '#172035', popover: '#FFFFFF', 'popover-foreground': '#172035', primary: '#6658E8', 'primary-foreground': '#FFFFFF', secondary: '#EFEDFE', 'secondary-foreground': '#6152CE', muted: '#F1F2F8', 'muted-foreground': '#667086', accent: '#E5F5EF', 'accent-foreground': '#247C61', destructive: '#C43D54', 'destructive-foreground': '#FFFFFF', border: '#E9EAF1', input: '#E0E3EE', ring: '#6658E8', 'chart-1': '#6658E8', 'chart-2': '#968BF3', 'chart-3': '#56B29A', 'chart-4': '#F2AF7B', 'chart-5': '#D58EB2', sidebar: '#FFFFFF', 'sidebar-foreground': '#637086', 'sidebar-primary': '#6658E8', 'sidebar-primary-foreground': '#FFFFFF', 'sidebar-accent': '#EFEDFE', 'sidebar-accent-foreground': '#6658E8', 'sidebar-border': '#E9EAF1', 'sidebar-ring': '#6658E8' },
    dark: { background: '#121524', foreground: '#F2F2FA', card: '#1C2033', 'card-foreground': '#F2F2FA', primary: '#ADA1FF', 'primary-foreground': '#211B50', secondary: '#302A50', 'secondary-foreground': '#E9E3FF', muted: '#292D43', 'muted-foreground': '#A7AEC3', border: '#363B53', input: '#363B53', ring: '#ADA1FF' }, settings: { radius: 12, font: 'Inter', fontSize: 14, spacing: 4 },
  } });
  const css = await call('export_css', { systemId: system.id });
  writeFileSync(new URL('../src/theme.css', import.meta.url), css.css);
  const contrast = await call('check_contrast', { systemId: system.id, mode: 'light' });
  writeFileSync(new URL('../docs/token-studio.json', import.meta.url), JSON.stringify({ systemId: system.id, systemName: system.name, contrast }, null, 2));
  console.log(JSON.stringify({ systemId: system.id, systemName: system.name, exported: 'src/theme.css', contrast: contrast.pairs }));
} finally { await client.close(); }

