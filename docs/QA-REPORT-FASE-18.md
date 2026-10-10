# QA REPORT — FASE 18 (2026-10-10)

## Alcance
Migraciones IndexedDB antiguas, conflictos de restauración, compatibilidad de copias v1/v2 y repasos/rutas de aprendizaje.

## Cambios
- `tests/e2e_local.py`: introduce simulación de base `mnemosyne404` versión 1 dentro de un perfil temporal, verifica actualización a versión 3, almacenes nuevos y persistencia del dato original; intenta restauración `merge` conflictiva y comprueba rechazo sin sobrescritura.
- `tests/e2e-fixture.html`: documento local de apoyo para carga de módulos sin utilizar el perfil habitual.
- `tests/legacy-compat.test.mjs`: compatibilidad de copias anteriores, vencimiento de repaso y filtrado de rutas.
- Sin modificaciones a módulos funcionales ni esquema de la aplicación.

## Limitación
La navegación de Chromium a HTTP local está bloqueada por una política del entorno. Las nuevas pruebas E2E **no han llegado a ejecutarse**; el test sale con código 2. No confundir la validación estática o Node con una migración de IndexedDB real.

## Pendientes
Ejecución E2E en Windows con un perfil temporal y navegador permitido; edición y borrado UI, pruebas responsive, accesibilidad, WebGL, conservación de datos y subruta GitHub Pages.

## Gates
QA BLOCKED; Security PENDING; Release BLOCKED.
