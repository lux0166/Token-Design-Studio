import { z } from 'zod';

export const tokenNames = ['background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground', 'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground', 'accent', 'accent-foreground', 'destructive', 'destructive-foreground', 'border', 'input', 'ring', 'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground', 'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring'] as const;
export type TokenName = typeof tokenNames[number];
export type Mode = 'light' | 'dark';
export const fonts = ['Inter', 'Arial', 'Georgia', 'Verdana', 'system-ui'] as const;
export const hexSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Màu phải có dạng #RRGGBB').transform(s => s.toUpperCase());
export const tokenMapSchema = z.object(Object.fromEntries(tokenNames.map(n => [n, hexSchema])) as Record<TokenName, typeof hexSchema>).strict();
export const settingsSchema = z.object({
  radius: z.number().min(0).max(24),
  font: z.enum(fonts),
  fontSize: z.number().int().min(12).max(20),
  spacing: z.number().min(2).max(8),
}).strict();
export const snapshotSchema = z.object({
  name: z.string().trim().min(1).max(60),
  light: tokenMapSchema,
  dark: tokenMapSchema,
  settings: settingsSchema,
  locks: z.array(z.string().regex(/^(light|dark)\.[a-z0-9-]+$|^settings\.(radius|font|fontSize|spacing)$/)).max(80),
}).strict();
export type Snapshot = z.infer<typeof snapshotSchema>;
export const historySchema = z.object({
  id: z.string(), at: z.string(), source: z.enum(['editor', 'agent']), summary: z.string(),
  before: snapshotSchema, after: snapshotSchema,
});
export const systemSchema = snapshotSchema.extend({
  id: z.string().uuid(), createdAt: z.string(), updatedAt: z.string(),
  history: z.array(historySchema).max(60), cursor: z.number().int().min(0).max(60),
});
export type DesignSystem = z.infer<typeof systemSchema>;
export type HistoryEntry = z.infer<typeof historySchema>;
export const patchSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  light: tokenMapSchema.partial().optional(),
  dark: tokenMapSchema.partial().optional(),
  settings: settingsSchema.partial().optional(),
}).strict();
export type SystemPatch = z.infer<typeof patchSchema>;
export interface AgentCall { id: string; tool: string; at: string; ok: boolean; detail: string }
export interface StudioState { revision: number; systems: DesignSystem[]; calls: AgentCall[] }

const light: Record<TokenName, string> = {
  background: '#F8FAFC', foreground: '#0F172A', card: '#FFFFFF', 'card-foreground': '#0F172A',
  popover: '#FFFFFF', 'popover-foreground': '#0F172A', primary: '#18794E', 'primary-foreground': '#FFFFFF',
  secondary: '#E8F3EC', 'secondary-foreground': '#16633F', muted: '#E5E7EB', 'muted-foreground': '#64748B',
  accent: '#A7F3D0', 'accent-foreground': '#14532D', destructive: '#DC2626', 'destructive-foreground': '#FFFFFF',
  border: '#D1D5DB', input: '#D1D5DB', ring: '#18794E',
  'chart-1': '#18794E', 'chart-2': '#38A169', 'chart-3': '#68D391', 'chart-4': '#A7F3D0', 'chart-5': '#D1FAE5',
  sidebar: '#FFFFFF', 'sidebar-foreground': '#0F172A', 'sidebar-primary': '#18794E', 'sidebar-primary-foreground': '#FFFFFF',
  'sidebar-accent': '#E8F3EC', 'sidebar-accent-foreground': '#16633F', 'sidebar-border': '#E5E7EB', 'sidebar-ring': '#18794E',
};
const dark: Record<TokenName, string> = {
  ...light, background: '#101A16', foreground: '#F1F5F9', card: '#18251F', 'card-foreground': '#F1F5F9',
  popover: '#18251F', 'popover-foreground': '#F1F5F9', primary: '#4ADE80', 'primary-foreground': '#052E16',
  secondary: '#223C2C', 'secondary-foreground': '#DCFCE7', muted: '#26332C', 'muted-foreground': '#A3B8AA',
  accent: '#1D4930', 'accent-foreground': '#BBF7D0', border: '#33463B', input: '#33463B', ring: '#4ADE80',
  sidebar: '#18251F', 'sidebar-foreground': '#F1F5F9', 'sidebar-primary': '#4ADE80', 'sidebar-primary-foreground': '#052E16',
  'sidebar-accent': '#223C2C', 'sidebar-accent-foreground': '#DCFCE7', 'sidebar-border': '#33463B', 'sidebar-ring': '#4ADE80',
};
export const presets = [
  { name: 'Forest', color: '#18794E', dark: '#4ADE80', ink: '#052E16', accent: '#A7F3D0' },
  { name: 'Ocean', color: '#2563EB', dark: '#60A5FA', ink: '#172554', accent: '#BFDBFE' },
  { name: 'Violet', color: '#7C3AED', dark: '#C4B5FD', ink: '#2E1065', accent: '#DDD6FE' },
  { name: 'Sunset', color: '#C2410C', dark: '#FB923C', ink: '#431407', accent: '#FED7AA' },
  { name: 'Rose', color: '#BE185D', dark: '#F9A8D4', ink: '#500724', accent: '#FBCFE8' },
  { name: 'Zinc', color: '#18181B', dark: '#FAFAFA', ink: '#18181B', accent: '#D4D4D8' },
] as const;
export function presetPatch(index: number): SystemPatch {
  const p = presets[index] ?? presets[0];
  return {
    light: { primary: p.color, ring: p.color, accent: p.accent, 'accent-foreground': p.ink, 'sidebar-primary': p.color, 'chart-1': p.color },
    dark: { primary: p.dark, ring: p.dark, 'primary-foreground': p.ink, 'sidebar-primary': p.dark, 'sidebar-primary-foreground': p.ink },
  };
}
export function createSnapshot(name = 'Studio mặc định', preset = 0): Snapshot {
  const patch = presetPatch(preset);
  return { name, light: { ...light, ...patch.light }, dark: { ...dark, ...patch.dark }, settings: { radius: 8, font: 'Inter', fontSize: 14, spacing: 4 }, locks: [] };
}
export function snapshotOf(s: Snapshot): Snapshot {
  return structuredClone({ name: s.name, light: s.light, dark: s.dark, settings: s.settings, locks: s.locks });
}
export function colorContrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function contrastReport(s: Snapshot, mode: Mode) {
  const pairs: [TokenName, TokenName][] = [['foreground', 'background'], ['primary-foreground', 'primary'], ['card-foreground', 'card'], ['muted-foreground', 'background'], ['secondary-foreground', 'secondary'], ['accent-foreground', 'accent'], ['destructive-foreground', 'destructive']];
  return pairs.map(([text, background]) => {
    const ratio = colorContrast(s[mode][text], s[mode][background]);
    return { text, background, ratio: Math.round(ratio * 100) / 100, aa: ratio >= 4.5, aaa: ratio >= 7 };
  }).sort((a, b) => a.ratio - b.ratio);
}
export function exportCss(s: Snapshot) {
  const block = (mode: Mode) => Object.entries(s[mode]).map(([k, v]) => `  --${k}: ${v};`).join('\n');
  const mapping = tokenNames.map(k => `  --color-${k}: var(--${k});`).join('\n');
  return `/* ${s.name.replaceAll('*/', '')} — Token Studio\n   Tailwind CSS v4 / shadcn/ui. Keep your existing Tailwind imports.\n   System font stack; load a local Inter font if you choose Inter. */\n\n:root {\n${block('light')}\n  --radius: ${s.settings.radius / 16}rem;\n  --font-sans: '${s.settings.font}', system-ui, sans-serif;\n  --base-font-size: ${s.settings.fontSize}px;\n  --spacing: ${s.settings.spacing / 16}rem;\n}\n\n.dark {\n${block('dark')}\n}\n\n@custom-variant dark (&:is(.dark *));\n\n@theme inline {\n${mapping}\n  --radius-sm: max(0px, calc(var(--radius) - 4px));\n  --radius-md: max(0px, calc(var(--radius) - 2px));\n  --radius-lg: var(--radius);\n  --radius-xl: calc(var(--radius) + 4px);\n}\n\n@layer base {\n  body { background: var(--background); color: var(--foreground); font-family: var(--font-sans); font-size: var(--base-font-size); }\n}\n`;
}
