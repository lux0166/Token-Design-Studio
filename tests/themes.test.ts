import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  themeCatalog,
  getCatalogTheme,
  filterThemes,
  prepareThemeApplication,
  libraryThemes,
} from "../shared/themes.js";
import {
  snapshotSchema,
  snapshotOf,
  createSnapshot,
  tokenNames,
  exportCss,
} from "../shared/model.js";
import { parseThemeCss } from "../server/css.js";
import { StudioStore } from "../server/store.js";

test("all bundled themes have unique stable IDs and complete valid snapshots", () => {
  assert.equal(themeCatalog.length, 48);
  assert.equal(
    new Set(themeCatalog.map((t) => t.id)).size,
    themeCatalog.length,
  );
  assert.equal(themeCatalog.filter((t) => t.source === "tweakcn").length, 42);
  for (const theme of themeCatalog) {
    snapshotSchema.parse(theme.snapshot);
    assert.equal(Object.keys(theme.snapshot.light).length, tokenNames.length);
    assert.equal(Object.keys(theme.snapshot.dark).length, tokenNames.length);
    assert.equal(theme.snapshot.name, theme.name);
    const parsed = parseThemeCss(exportCss(theme.snapshot));
    assert.deepEqual(parsed.patch.light, theme.snapshot.light);
    assert.deepEqual(parsed.patch.dark, theme.snapshot.dark);
    assert.deepEqual(parsed.patch.settings, theme.snapshot.settings);
  }
});
test("catalog reads are isolated and unknown IDs do not silently fall back", () => {
  const original = getCatalogTheme("tweakcn:cyberpunk");
  const copy = getCatalogTheme(original.id);
  copy.snapshot.light.primary = "#000000";
  assert.equal(
    getCatalogTheme(original.id).snapshot.light.primary,
    original.snapshot.light.primary,
  );
  assert.throws(() => getCatalogTheme("invented-theme"));
});
test("search supports names, sources and Vietnamese accents without changing selection data", () => {
  assert.deepEqual(
    filterThemes(themeCatalog, " CYBER ").map((t) => t.name),
    ["Cyberpunk"],
  );
  assert.equal(filterThemes(themeCatalog, "", "tweakcn").length, 42);
  assert.equal(filterThemes(themeCatalog, "no match anywhere").length, 0);
  assert.equal(filterThemes(themeCatalog, "").length, 48);
});
test("theme application preserves locked settings, colors and identity; one undo restores the old snapshot", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "studio-themes-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const file = join(directory, "state.json");
  const store = new StudioStore(file),
    id = store.read().systems[0].id;
  store.setLock(id, "light.primary");
  store.setLock(id, "settings.radius");
  const before = store.get(id),
    revision = store.read().revision;
  const target = getCatalogTheme("tweakcn:cyberpunk").snapshot;
  const prepared = prepareThemeApplication(before, target);
  assert.equal(store.read().revision, revision);
  assert.deepEqual(store.get(id), before);
  assert.deepEqual(prepared.kept, ["light.primary", "settings.radius"]);
  assert.equal(prepared.preview.light.primary, before.light.primary);
  assert.equal(prepared.preview.settings.radius, before.settings.radius);
  assert.equal(prepared.preview.name, before.name);
  assert.ok(prepared.changed > 1);
  store.update(id, prepared.patch, "editor");
  const saved = new StudioStore(file).get(id);
  assert.equal(saved.name, before.name);
  assert.deepEqual(saved.locks, before.locks);
  assert.equal(saved.dark.background, target.dark.background);
  assert.equal(saved.history.length, before.history.length + 1);
  store.travel(id, "undo");
  assert.deepEqual(snapshotOf(store.get(id)), snapshotOf(before));
});
test("personal systems can be reused and catalog templates remain immutable", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "studio-library-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const store = new StudioStore(join(directory, "state.json"));
  const theme = getCatalogTheme("tweakcn:vintage-paper");
  const created = store.create("Thương hiệu của tôi", 0, {
    ...theme.snapshot,
    name: "Thương hiệu của tôi",
  });
  const personal = libraryThemes(store.read().systems).find(
    (t) => t.id === `local:${created.id}`,
  )!;
  assert.equal(filterThemes([personal], "thuong hieu", "Của bạn").length, 1);
  assert.deepEqual(personal.snapshot.light, theme.snapshot.light);
  assert.equal(
    prepareThemeApplication(personal.snapshot, personal.snapshot).changed,
    0,
  );
  personal.snapshot.light.primary = "#000000";
  assert.notEqual(store.get(created.id).light.primary, "#000000");
  assert.equal(createSnapshot("Legacy", 1).light.primary, "#2563EB");
});
