import ts from "typescript";
import { parse, formatHex } from "culori";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  createSnapshot,
  snapshotSchema,
  tokenNames,
  colorContrast,
} from "../shared/model.js";

// Pinned data import. Parse literal objects; never evaluate downloaded JavaScript.
const revision = "a3b47b37cba97dd637de517aab52c45ec0f83456";
const base = `https://raw.githubusercontent.com/jnsahaj/tweakcn/${revision}`;
async function read(path: string) {
  const response = await fetch(`${base}/${path}`);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.text();
}
const source = await read("utils/theme-presets.ts");
const file = ts.createSourceFile(
  "theme-presets.ts",
  source,
  ts.ScriptTarget.Latest,
  true,
);
function literal(node: ts.Expression): any {
  if (ts.isStringLiteral(node) || ts.isNumericLiteral(node))
    return ts.isNumericLiteral(node) ? Number(node.text) : node.text;
  if (ts.isObjectLiteralExpression(node))
    return Object.fromEntries(
      node.properties.map((prop) => {
        if (
          !ts.isPropertyAssignment(prop) ||
          !(ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name))
        )
          throw new Error("Unsupported upstream property");
        return [prop.name.text, literal(prop.initializer)];
      }),
    );
  throw new Error(`Nonliteral upstream data: ${ts.SyntaxKind[node.kind]}`);
}
const declaration = file.statements
  .filter(ts.isVariableStatement)
  .flatMap((s) => s.declarationList.declarations)
  .find((d) => ts.isIdentifier(d.name) && d.name.text === "defaultPresets");
if (!declaration?.initializer) throw new Error("Preset export not found");
const originals = literal(declaration.initializer) as Record<
  string,
  {
    label: string;
    styles: { light: Record<string, string>; dark: Record<string, string> };
  }
>;
const seed = createSnapshot();
const themes = Object.entries(originals).map(([id, original]) => {
  const notes: string[] = [];
  const light = { ...seed.light },
    dark = { ...seed.dark };
  for (const mode of ["light", "dark"] as const) {
    const styles =
      mode === "light"
        ? original.styles.light
        : { ...original.styles.light, ...original.styles.dark };
    const target = mode === "light" ? light : dark;
    for (const name of tokenNames) {
      if (!styles[name]) {
        notes.push(`Thiếu ${mode}.${name}: dùng giá trị mặc định.`);
        continue;
      }
      const color = parse(styles[name]);
      const hex = color && formatHex(color);
      if (!hex || (color.alpha !== undefined && color.alpha < 1))
        throw new Error(`Unsupported color ${id}.${mode}.${name}`);
      target[name] = hex.toUpperCase();
    }
    if (!styles["destructive-foreground"])
      target["destructive-foreground"] =
        colorContrast(target.destructive, "#FFFFFF") >
        colorContrast(target.destructive, "#000000")
          ? "#FFFFFF"
          : "#000000";
  }
  const styles = original.styles.light;
  const radiusMatch = (styles.radius ?? "0.5rem").match(/^([\d.]+)(rem|px)$/);
  const radius = radiusMatch
    ? Number(radiusMatch[1]) * (radiusMatch[2] === "rem" ? 16 : 1)
    : 8;
  const originalFont = styles["font-sans"] ?? "Inter, sans-serif";
  const font = /mono/i.test(originalFont)
    ? "system-ui"
    : /serif/i.test(originalFont.replaceAll("sans-serif", ""))
      ? "Georgia"
      : "Inter";
  if (!/^Inter\b/i.test(originalFont) && originalFont !== font)
    notes.push(`Font gốc ${originalFont}; bản local dùng ${font}.`);
  if (Object.keys(styles).some((key) => key.startsWith("shadow-")))
    notes.push("Shadow riêng của theme gốc chưa nằm trong model editor.");
  const snapshot = snapshotSchema.parse({
    name: original.label,
    light,
    dark,
    settings: { ...seed.settings, font, radius: Math.min(24, radius) },
    locks: [],
  });
  return {
    id: `tweakcn:${id}`,
    name: original.label,
    originalFont,
    notes,
    snapshot,
  };
});
mkdirSync("shared/catalog", { recursive: true });
writeFileSync(
  "shared/catalog/tweakcn.json",
  JSON.stringify(
    {
      source: {
        url: "https://github.com/jnsahaj/tweakcn",
        revision,
        path: "utils/theme-presets.ts",
        license: "Apache-2.0",
      },
      themes,
    },
    null,
    2,
  ) + "\n",
);
mkdirSync("third_party/tweakcn", { recursive: true });
writeFileSync("third_party/tweakcn/LICENSE", await read("LICENSE"));
console.log(
  `Imported ${themes.length} adapted themes from tweakcn ${revision}.`,
);
