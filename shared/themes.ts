import catalog from "./catalog/tweakcn.json";
import {
  createSnapshot,
  presets,
  snapshotSchema,
  snapshotOf,
  type Snapshot,
  type SystemPatch,
  type DesignSystem,
} from "./model.js";

export interface LibraryTheme {
  id: string;
  name: string;
  source: "Token Studio" | "tweakcn" | "Của bạn";
  snapshot: Snapshot;
  notes: string[];
}
export const themeCatalog: LibraryTheme[] = [
  ...presets.map((preset, i) => ({
    id: `studio:${preset.name.toLowerCase()}`,
    name: preset.name,
    source: "Token Studio" as const,
    snapshot: createSnapshot(preset.name, i),
    notes: ["Preset Token Studio gốc; giữ tương thích các chỉ số 0–5."],
  })),
  ...catalog.themes.map((theme) => ({
    id: theme.id,
    name: theme.name,
    source: "tweakcn" as const,
    snapshot: snapshotSchema.parse(theme.snapshot),
    notes: theme.notes,
  })),
];
export const catalogSource = catalog.source;
export class ThemeCatalogError extends Error {}
export function getCatalogTheme(id: string): LibraryTheme {
  const theme = themeCatalog.find((theme) => theme.id === id);
  if (!theme)
    throw new ThemeCatalogError("Không tìm thấy theme. Đọc list_themes để lấy ID hợp lệ.");
  return structuredClone(theme);
}
export function libraryThemes(systems: DesignSystem[]): LibraryTheme[] {
  return [
    ...themeCatalog,
    ...systems.map((s) => ({
      id: `local:${s.id}`,
      name: s.name,
      source: "Của bạn" as const,
      snapshot: snapshotOf(s),
      notes: [
        "Bản sao từ design system đang lưu trên máy. Tạo mới sẽ giữ các khóa trong bản sao này.",
      ],
    })),
  ];
}
export function filterThemes(
  themes: LibraryTheme[],
  query: string,
  source = "all",
) {
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const search = normalize(query.trim());
  return themes.filter(
    (theme) =>
      (source === "all" || theme.source === source) &&
      normalize(`${theme.name} ${theme.source}`).includes(search),
  );
}
export function prepareThemeApplication(current: Snapshot, target: Snapshot) {
  const patch: SystemPatch = {};
  const kept: string[] = [];
  let changed = 0;
  for (const group of ["light", "dark", "settings"] as const) {
    const updates: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(target[group])) {
      const path = `${group}.${key}`;
      if (current.locks.includes(path)) {
        kept.push(path);
        continue;
      }
      if ((current[group] as Record<string, unknown>)[key] !== value) {
        updates[key] = value;
        changed++;
      }
    }
    if (Object.keys(updates).length) Object.assign(patch, { [group]: updates });
  }
  const preview = snapshotOf(current);
  for (const group of ["light", "dark", "settings"] as const)
    Object.assign(preview[group], patch[group]);
  return { patch, preview, kept, changed };
}
