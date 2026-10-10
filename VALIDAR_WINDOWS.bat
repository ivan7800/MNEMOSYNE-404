@echo off
setlocal
cd /d "%~dp0"
set "PYTHON_CMD="
where py >nul 2>&1
if not errorlevel 1 set "PYTHON_CMD=py -3"
if not defined PYTHON_CMD (
  where python >nul 2>&1
  if not errorlevel 1 set "PYTHON_CMD=python"
)
if not defined PYTHON_CMD (
  echo ERROR: Necesitas Python 3 para ejecutar las pruebas.
  pause
  exit /b 2
)
if not exist "informes" mkdir "informes"
set "LOG=informes\QA-WINDOWS-ULTIMA-EJECUCION.txt"
echo MNEMOSYNE 404 - Prueba funcional E2E > "%LOG%"
echo Los datos se prueban en un perfil temporal independiente. >> "%LOG%"
echo Ejecutando... El resultado tambien se guardara en %LOG%
%PYTHON_CMD% tests\e2e_local.py >> "%LOG%" 2>&1
set "RC=%errorlevel%"
type "%LOG%"
echo.
if "%RC%"=="0" (
 echo Resultado E2E: PASS
) else (
 echo Resultado E2E: NO APROBADO. Codigo de salida: %RC%
 echo Si falta Playwright: %PYTHON_CMD% -m pip install playwright
 echo Para instalar Chromium de Playwright: %PYTHON_CMD% -m playwright install chromium
)
echo.
pause
exit /b %RC%
