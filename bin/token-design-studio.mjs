#!/usr/bin/env node
import { main } from '../cli/main.mjs';
main().catch(error => { console.error(`Token Design Studio: ${error.message}`); process.exitCode = 1; });
