# MNEMOSYNE 404 — QA Fase 20 — 2026-10-10

## Alcance
Validación funcional E2E con aislamiento del perfil de navegador, prueba de arranque, migración y restauración. No se añadieron funcionalidades al producto.

## Evidencia del entorno actual
- `node --test tests/*.test.mjs`: exit 0; 55/55 PASS.
- `python -m py_compile tests/e2e_local.py`: exit 0.
- `python tests/e2e_local.py`: exit 2; `ERR_BLOCKED_BY_ADMINISTRATOR` antes de ejecutar las comprobaciones funcionales.
- La política de ejecución de Chromium en este entorno bloquea el acceso HTTP local; no se presume que exista el mismo bloqueo en Windows.

## Entrega adicional
`VALIDAR_WINDOWS.bat`: ejecuta E2E con Python, informa del código de salida, registra logs en `informes/QA-WINDOWS-ULTIMA-EJECUCION.txt` y da instrucciones si faltan dependencias. No instala software ni modifica la configuración de seguridad. El test `tests/e2e_local.py` usa un perfil temporal; no abre el perfil habitual del usuario.

## No comprobado
- Ejecución de `VALIDAR_WINDOWS.bat` en Windows real.
- E2E de IndexedDB, actualización v1→v3, conflicto de restauración, edición, recarga, navegación 3D/2D.
- Rendimiento y accesibilidad real; despliegue GitHub Pages.

## Decisión
QA: **BLOCKED**. Security: **PENDING**. Release estable: **BLOCKED**. El siguiente paso no es otra ronda de pruebas estáticas, sino obtener el archivo de informe Windows y corregir fallos reales revelados por dicha ejecución.
