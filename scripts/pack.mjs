import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const destination = resolve('output/npm');
mkdirSync(destination, { recursive: true });
if (!process.env.npm_execpath) throw new Error('Chạy npm run pack:local.');
execFileSync(process.execPath, [process.env.npm_execpath, 'pack', '--pack-destination', destination], { stdio: 'inherit' });
