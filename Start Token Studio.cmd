@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22.12 or newer, then run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm install
  if errorlevel 1 goto failed
)
call npm run build
if errorlevel 1 goto failed
echo.
echo Token Studio: http://127.0.0.1:4318
echo MCP: http://127.0.0.1:4318/mcp
echo Keep this window open. Press Ctrl+C to stop.
set STUDIO_OPEN_BROWSER=1
call npm start
if errorlevel 1 goto failed
exit /b 0
:failed
echo.
echo Could not start Token Studio. See the error above.
pause
exit /b 1
