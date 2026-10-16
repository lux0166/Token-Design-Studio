@echo off
setlocal
cd /d "%~dp0"
if not exist "apps\english-one\node_modules\vite" (
  call npm --prefix apps/english-one install
  if errorlevel 1 exit /b 1
)
echo Fluento: http://127.0.0.1:5174/
call npm run english:dev
