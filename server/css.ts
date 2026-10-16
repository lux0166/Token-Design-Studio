import postcss from 'postcss';
import { parse, formatHex } from 'culori';
import { tokenNames, fonts, type SystemPatch, type Mode } from '../shared/model.js';

export function parseThemeCss(css: string): { patch: SystemPatch; warnings: string[]; count: number } {
  const root = postcss.parse(css);
  const patch: SystemPatch = {};
  const warnings: string[] = [];
  let count = 0;
  root.walkRules(rule => {
    const selectors = rule.selectors.map(s => s.trim());
    const mode: Mode | undefined = selectors.includes('.dark') ? 'dark' : selectors.includes(':root') ? 'light' : undefined;
    if (!mode) return;
    rule.each(node => {
      if (node.type !== 'decl' || !node.prop.startsWith('--')) return;
      const key = node.prop.slice(2);
      if (tokenNames.includes(key as typeof tokenNames[number])) {
        const value = node.value.trim();
        // shadcn v3 stores bare HSL channels; v4 uses full CSS color functions.
        const color = parse(value) ?? parse(`hsl(${value})`);
        const hex = color && formatHex(color);
        if (!hex || ('alpha' in color && color.alpha !== undefined && color.alpha < 1)) {
          warnings.push(`${mode}.${key}: bỏ qua màu không hỗ trợ (${value}). Chỉ nhập màu đặc.`);
          return;
        }
        patch[mode] = { ...patch[mode], [key]: hex.toUpperCase() };
        count++;
      } else if (key === 'radius' || key === 'spacing' || key === 'base-font-size') {
        const match = node.value.match(/^([\d.]+)(px|rem)$/);
        if (!match) { warnings.push(`--${key}: cần giá trị px hoặc rem.`); return; }
        const value = Number(match[1]) * (match[2] === 'rem' ? 16 : 1);
        const field = key === 'radius' ? 'radius' : key === 'spacing' ? 'spacing' : 'fontSize';
        patch.settings = { ...patch.settings, [field]: value }; count++;
      } else if (key === 'font-sans') {
        const font = node.value.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
        if (fonts.includes(font as typeof fonts[number])) {
          patch.settings = { ...patch.settings, font: font as typeof fonts[number] }; count++;
        } else warnings.push(`Font ${font} chưa có trên editor. Giữ font hiện tại.`);
      }
    });
  });
  if (!count) throw new Error('Không tìm thấy token hợp lệ trong :root hoặc .dark. Hỗ trợ HEX, RGB, HSL và OKLCH.');
  return { patch, warnings, count };
}
