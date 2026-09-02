@echo off
setlocal
chcp 65001 >nul
title RDC Plugin Launcher - Install
cd /d "%~dp0"

set "NODE=K:\nodejs\node.exe"
set "NPM=K:\nodejs\npm.cmd"
set "RDC_ENTRY=%~dp0node_modules\@wonderwhy-er\desktop-commander\dist\index.js"

if not exist "%NODE%" goto :missing_node
if not exist "%NPM%" goto :missing_npm
if not exist "%~dp0package.json" goto :missing_package
if not exist "%~dp0package-lock.json" goto :missing_lock

echo ========================================
echo   uni's RDC plugin launcher - Install
echo ========================================
echo.
echo Installing the locked dependency tree...
echo.

call "%NPM%" ci
if errorlevel 1 goto :install_failed

echo.
echo Validating watchdog syntax...
call "%NPM%" run check
if errorlevel 1 goto :validation_failed

echo.
echo Checking installed Desktop Commander version...
call "%NPM%" run rdc:version
if errorlevel 1 goto :validation_failed

if not exist "%RDC_ENTRY%" goto :missing_rdc

echo.
echo ========================================
echo Installation completed successfully.
echo You can now run Remote-Desktop-Commander.bat
echo ========================================
echo.
pause
exit /b 0

:missing_node
echo ERROR: Node.js was not found: %NODE%
goto :failed

:missing_npm
echo ERROR: npm was not found: %NPM%
goto :failed

:missing_package
echo ERROR: package.json was not found.
goto :failed

:missing_lock
echo ERROR: package-lock.json was not found.
goto :failed

:missing_rdc
echo ERROR: Desktop Commander entry point was not installed:
echo %RDC_ENTRY%
goto :failed

:install_failed
echo.
echo ERROR: npm ci failed.
goto :failed

:validation_failed
echo.
echo ERROR: Installation validation failed.
goto :failed

:failed
echo.
echo Installation was not completed.
pause
exit /b 1
