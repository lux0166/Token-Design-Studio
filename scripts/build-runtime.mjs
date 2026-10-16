import { build } from 'esbuild';
await build({ entryPoints: { server: 'server/index.ts', stdio: 'server/stdio.ts', data: 'server/data.ts' }, outdir: 'runtime', bundle: true, packages: 'external', platform: 'node', format: 'esm', target: 'node22', sourcemap: false });
