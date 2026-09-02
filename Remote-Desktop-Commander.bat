@echo off
setlocal
chcp 65001 >nul
title Remote Desktop Commander - Auto Recovery
cd /d "%~dp0"

set "NODE=K:\nodejs\node.exe"
set "WATCHER=%~dp0remote-watch.js"
set "RDC_ENTRY=%~dp0node_modules\@wonderwhy-er\desktop-commander\dist\index.js"

if exist "%NODE%" goto :node_ok
where node >nul 2>nul
if errorlevel 1 goto :missing_node
set "NODE=node"

:node_ok
if not exist "%WATCHER%" goto :missing_watcher
if not exist "%RDC_ENTRY%" goto :missing_deps

echo ========================================
echo   Remote Desktop Commander
echo   Auto Recovery: ON
echo ========================================
echo.
echo Close this window to stop the server.
echo Internal Desktop Commander disconnects restart automatically.
echo.

:supervise
"%NODE%" "%WATCHER%"
set "EXITCODE=%ERRORLEVEL%"
if "%EXITCODE%"=="0" goto :end

echo.
echo [BAT] Watcher stopped with exit code %EXITCODE%.
echo [BAT] Restarting watcher in 3 seconds...
timeout /t 3 /nobreak >nul
goto :supervise

:missing_node
echo ERROR: Node.js was not found.
goto :failed

:missing_watcher
echo ERROR: Watcher was not found: %WATCHER%
goto :failed

:missing_deps
echo ERROR: Desktop Commander dependencies are not installed.
echo Run this command in the launcher folder:
echo   K:\nodejs\npm.cmd ci
goto :failed

:failed
pause
exit /b 1

:end
endlocal
exit /b 0
