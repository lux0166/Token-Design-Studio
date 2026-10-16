# npm distribution and CLI

Date: 2026-10-16. Approved by the user's "đc triển khai đi" following the npm CLI proposal. Prepare and test a local tarball; public registry publication is outside this step.

## Behavior

- Ship built editor, compiled Node runtime, 48 themes and complete skill; Node 22.12+, no user-side build.
- Default command starts editor + HTTP MCP on loopback and opens the browser. Support --no-open, --port and --data-dir. Reuse only compatible existing version/data; explain conflicts without switching stores silently.
- Keep data outside package/cache: LOCALAPPDATA/TokenDesignStudio on Windows, Application Support on macOS, XDG data on Linux. migrate validates and copies a legacy store only into an absent target; retain source.
- Protect a store from writers on different ports with a cross-process lock and consistent stale recovery. Preserve the source-development data path.
- setup codex uses the installed official Codex CLI to register HTTP MCP, backs up config, preserves other settings and refuses named conflicts unless --replace-mcp is explicitly given. Tests use an isolated CODEX_HOME.
- Skill upgrades use previous-file hashes and backups; user edits fail preflight without partial writes. Different unmanaged skills require reconciliation.
- mcp forwards stdio to the running HTTP server; keep Studio running before using agents. No daemon or hidden autostart service in this version.
- doctor reports version, paths and server status. Reject invalid commands/options/ports.

## Distribution and acceptance

Use a files allowlist; exclude personal data, .env, tests, demo app, screenshots and development tools. No postinstall side effects. The owner subsequently requested removal of the npm private flag ("bỏ private đi"); it is now removed so the package can be published. GitHub repository visibility is a separate setting and is unchanged. Registry publication has not been requested by that metadata change alone.

Install the real tarball with --omit=dev --ignore-scripts in a clean directory. Check executable discovery, static assets, real HTTP/stdio MCP, persistence/restart, locks, migration, skill updates and isolated Codex setup. Runtime must not require tsx/Vite/esbuild/React. Preserve existing checks and real user config/data.

This is distribution work, preserving the existing visual direction. Artifacts: local .tgz, instructions, verification and GitHub source.
