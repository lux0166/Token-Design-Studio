# npm CLI verification — 0.2.0

Date: 2026-10-16. Environment: Windows, Node.js 24.19.0, npm 11.10.0, installed Codex CLI 0.163.0-alpha.10.2. Engine range declared: Node 22.12+. Other platforms' path defaults were tested as pure functions; native macOS/Linux launchers and the minimum Node release were not exercised here.

## Artifact

- Local package: output/npm/token-design-studio-0.2.0.tgz.
- 437,301 bytes compressed; 37 files; approximately 1 MB unpacked before npm installs runtime dependencies.
- SHA-256: `4141BADEE1CDB5A5367CD8137CC89BBC5087192BEF2E17DFEC71675C4E638696`.
- Includes built editor, bundled Node entry points, CLI, skill/workflow 1.2.0, 48 theme catalog and license notices. Files allowlist excludes personal store, .env, demo app, source, screenshots, tests and development tools.
- The npm private flag has been removed at the owner's request. No public npm publication or registry name reservation was performed. A local tarball install still downloads its normal runtime dependencies from npm when absent from cache.

## Checks run

`npm run pack:local` passed prepack TypeScript checks, Vite build and esbuild Node-runtime compilation. Two existing annotation warnings in Zod remain non-blocking build output.

`npm test`: 20 passed, zero failed. Existing persistence, locks, concurrency, CSS, theme and workflow tests pass. Added CLI tests cover platform data paths, command/port validation, managed skill upgrades with backups and preservation of later user edits. The shared source/CLI installer still rejects customized files before partial writes.

`npm run test:package`: nine groups passed against the final tarball:

1. Installed into a fresh directory containing spaces with `--omit=dev --ignore-scripts`. Verified executable discovery, runtime assets/licenses and absence of tsx, Vite, esbuild, React, React DOM and Lucide runtime installations.
2. Ran `npm exec --package <tarball> -- token-design-studio --version` from an empty directory with a clean npm cache.
3. Started the packaged editor and fetched HTML plus its JS asset; checked version, persistent data path, compatible-server reuse, different-store rejection and explicit --data-dir precedence over an inherited data-file environment variable.
4. Used real MCP clients through the packaged CLI stdio adapter and the exact compiled adapter advertised by the server/editor. Both expose 11 tools; workflow 1.2.0/quality guide, theme creation and token writes work. Custom port forwarding works.
5. Attempted a second server on another port against the same data file; the inter-process lock rejected it and store bytes remained unchanged.
6. Terminated and restarted the packaged process; stale-lock recovery completed and systems, token settings and history survived. The CLI runs the server in its own process rather than leaving a child server behind.
7. Migrated validated full data into an absent destination; source remained intact, repeat overwrite was rejected, malformed data and invalid history cursors were rejected before creating a destination file.
8. Invoked the actual installed Codex CLI with a temporary CODEX_HOME. Setup installed the skill, preserved an unrelated MCP server, backed up config, allowed a repeat, rejected a conflicting named server without changes, and accepted an explicit --replace-mcp. Real user configuration was not modified.
9. Attempted startup on a port owned by an unrelated HTTP application; reported the conflict without creating a new data file.

`git diff --check` passed. Tests used temporary stores/configuration; user data was not migrated or overwritten. The package's browser-opening branch was not exercised by these automated tests (`--no-open` was used). There is no daemon/autostart service; keep the Studio process running for HTTP/stdio clients.

## Changes surfaced in the editor

Footer version now comes from package metadata. The MCP setup page uses a server-advertised compiled stdio command/arguments and the current MCP endpoint environment value; it no longer assumes tsx exists in installed packages. Source-only development has a source adapter fallback. Packaged adapter behavior is covered by the real-client check above; this release preserves existing layout and visual direction.

## Release boundary

This completes the authorized implementation and local distribution validation. Public npm publication and real user Codex setup remain separate actions. The README contains tarball install/run, setup, persistence, migration, conflict and developer build instructions.

## Publication preparation update

The owner subsequently requested removal of the npm private flag. Removed it with npm pkg delete private, updated the README/specification and regenerated the tarball through prepack. TypeScript, Vite and Node-runtime builds passed. Direct inspection of package/package.json in the tarball confirmed that private is absent.

`npm publish ./output/npm/token-design-studio-0.2.0.tgz --dry-run --access public --registry=https://registry.npmjs.org` passed with 37 files before the subsequent README update. npm warned that registry login is still required for a real publication. No real publish was run. The functional checks above were performed before this metadata-only update; they were not repeated for flag removal. GitHub repository visibility is separate and remains private.

## Skill-sharing README update

Added a prominent standalone Codex skill installation/share section, recipient prerequisites, install location, example prompts, CLI command comparison and a local-tarball fallback. Registry commands are explicitly conditional on successful public publication. Repacked with npm pack --ignore-scripts because this update changes documentation only; existing compiled runtime/editor assets were retained. Compared package/README.md inside the tarball byte-for-byte with the source README and confirmed the npm private flag remains absent. The artifact size/checksum at the top reflects this documentation update. No new runtime tests were needed or claimed.
