import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StudioStore } from '../server/store.js';
import { parseThemeCss } from '../server/css.js';
import { contrastReport, createSnapshot, exportCss, colorContrast } from '../shared/model.js';

function fixture(t: { after: (fn: () => void) => void }) {
  const dir = mkdtempSync(join(tmpdir(), 'token-studio-unit-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'studio.json');
  const store = new StudioStore(file);
  return { store, id: store.read().systems[0].id, file };
}
test('disk persistence, complete undo and redo, and branch history', t => {
  const { store, id, file } = fixture(t);
  store.update(id, { light: { primary: '#2563eb' }, settings: { radius: 16 } }, 'agent');
  assert.equal(new StudioStore(file).get(id).light.primary, '#2563EB');
  assert.equal(store.get(id).history[0].source, 'agent');
  store.travel(id, 'undo'); assert.equal(store.get(id).light.primary, '#18794E'); assert.equal(store.get(id).settings.radius, 8);
  store.travel(id, 'redo'); assert.equal(store.get(id).settings.radius, 16);
  store.travel(id, 'undo');
  store.update(id, { settings: { radius: 12 } }, 'editor');
  assert.equal(store.get(id).history.length, 1); assert.equal(store.get(id).cursor, 1);
  assert.throws(() => store.travel(id, 'redo'));
});
test('locked updates reject entire batch from agent AND editor without partial writes', t => {
  const { store, id } = fixture(t);
  store.setLock(id, 'light.primary');
  const revision = store.read().revision;
  for (const source of ['agent', 'editor'] as const) {
    assert.throws(() => store.update(id, { light: { foreground: '#123456', primary: '#FF0000' }, settings: { radius: 12 } }, source), /đã khóa/);
    assert.equal(store.get(id).light.foreground, '#0F172A');
    assert.equal(store.get(id).settings.radius, 8);
    assert.equal(store.read().revision, revision);
  }
  store.setLock(id, 'light.primary');
  store.update(id, { light: { primary: '#123456' } }, 'agent');
  assert.equal(store.get(id).light.primary, '#123456');
});
test('revision prevents stale editor or agent writes; logging never invalidates read revision', t => {
  const { store, id } = fixture(t);
  const revision = store.read().revision;
  store.log('get_system', true, id);
  store.assertRevision(revision);
  assert.equal(store.read().calls.length, 1);
  store.update(id, { settings: { radius: 3 } }, 'editor');
  assert.throws(() => store.assertRevision(revision), /Dữ liệu vừa/);
});
test('validation prevents unknown tokens, unsafe CSS settings, invalid paths and malformed colors', t => {
  const { store, id } = fixture(t);
  assert.throws(() => store.update(id, { light: { primary: 'red; } body { display:none' } }, 'agent'));
  assert.throws(() => store.update(id, { settings: { font: 'x; color:red' } } as any, 'agent'));
  assert.throws(() => store.update(id, { light: { nope: '#123456' } } as any, 'agent'));
  assert.throws(() => store.setLock(id, 'light.__proto__'));
  assert.throws(() => store.setLock(id, 'nope.primary'));
  assert.throws(() => store.update(id, { settings: { radius: 900 } }, 'agent'));
});
test('CSS parser handles v3 bare HSL, v4 OKLCH, RGB, dark mode and dimensions', () => {
  const result = parseThemeCss(':root { --primary: 0 100% 50%; --radius: .5rem; --spacing: 4px; --font-sans: "Georgia", serif; } .dark { --primary: oklch(0.7 0.15 150); --foreground: rgb(255 255 255); }');
  assert.equal(result.patch.light?.primary, '#FF0000');
  assert.equal(result.patch.dark?.foreground, '#FFFFFF');
  assert.match(result.patch.dark!.primary!, /^#[A-F0-9]{6}$/);
  assert.deepEqual(result.patch.settings, { radius: 8, spacing: 4, font: 'Georgia' });
});
test('CSS never executes imports and reports unsupported values; only exact root/dark rules apply', () => {
  const result = parseThemeCss('@import "https://example.invalid/x.css"; body { --primary: red; } :root { --primary: #123456; --foreground: var(--somewhere); --muted: rgb(0 0 0 / .5); }');
  assert.equal(result.patch.light?.primary, '#123456');
  assert.equal(result.warnings.length, 2);
  assert.throws(() => parseThemeCss('body { --primary: red; }'), /Không tìm thấy/);
  assert.throws(() => parseThemeCss(':root { --primary: #123456; '));
});
test('export/import roundtrip preserves all tokens and settings; comment escape is safe', () => {
  const s = createSnapshot('My */ theme'); s.settings.font = 'Georgia';
  const css = exportCss(s);
  const parsed = parseThemeCss(css);
  assert.deepEqual(parsed.patch.light, s.light); assert.deepEqual(parsed.patch.dark, s.dark); assert.deepEqual(parsed.patch.settings, s.settings);
  assert.equal(css.includes('My */ theme'), false);
  assert.ok(css.includes('--color-sidebar-ring: var(--sidebar-ring)'));
});
test('contrast uses WCAG sRGB luminance; failures sorted first', () => {
  assert.equal(colorContrast('#000000', '#FFFFFF'), 21);
  assert.equal(colorContrast('#FFFFFF', '#FFFFFF'), 1);
  const s = createSnapshot(); s.light.primary = '#FFFFFF';
  const report = contrastReport(s, 'light');
  assert.equal(report[0].aa, false); assert.equal(report[0].ratio, 1);
});
test('corrupt data fails without overwriting the original file', t => {
  const { file } = fixture(t);
  const raw = '{bad json'; writeFileSync(file, raw);
  assert.throws(() => new StudioStore(file)); assert.equal(readFileSync(file, 'utf8'), raw);
});
test('history is bounded to 60 changes and remains undoable after reload', t => {
  const { store, id, file } = fixture(t);
  for (let i = 0; i < 70; i++) store.update(id, { settings: { radius: i % 25 } }, 'editor');
  const loaded = new StudioStore(file);
  assert.equal(loaded.get(id).history.length, 60);
  for (let i = 0; i < 60; i++) loaded.travel(id, 'undo');
  assert.equal(loaded.get(id).cursor, 0);
});
