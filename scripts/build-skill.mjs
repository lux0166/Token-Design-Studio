import { build } from 'esbuild';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { taskInputSchema } from '../shared/tasks.ts';
import { z } from 'zod';
const root = 'skills/token-studio-shadcn';
mkdirSync(`${root}/scripts`, { recursive: true }); mkdirSync(`${root}/assets`, { recursive: true });
writeFileSync(`${root}/assets/task.schema.json`, JSON.stringify(z.toJSONSchema(taskInputSchema), null, 2) + '\n');
writeFileSync(`${root}/scripts/THIRD_PARTY_LICENSES.txt`, 'The bundled offline validator includes Zod.\n\n' + readFileSync('node_modules/zod/LICENSE', 'utf8'));
await build({ entryPoints: ['cli/validate-task.ts'], outfile: `${root}/scripts/validate-task.cjs`, bundle: true, platform: 'node', format: 'cjs', target: 'node22', minify: true, legalComments: 'none' });
