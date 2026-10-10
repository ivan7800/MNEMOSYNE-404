@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>&1
if not errorlevel 1 (
    py -3 "%~dp0INICIAR_SERVIDOR.py"
    exit /b %errorlevel%
)
where python >nul 2>&1
if not errorlevel 1 (
    python "%~dp0INICIAR_SERVIDOR.py"
    exit /b %errorlevel%
)
echo Se necesita Python 3 para iniciar MNEMOSYNE 404.
pause
exit /b 2
