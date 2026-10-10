# QA fase 14 — 2026-10-10

## Diagnóstico confirmado
**ALTO / arranque:** `app/main.js` importaba `inspectRestore` de `app/db.js` pero este no lo exportaba. El navegador habría rechazado la carga del módulo. **Corrección:** añadida exportación y auditoría no destructiva de conflictos.

## Restauración e integridad
- `analyzeRestore()` analiza coincidencias de identificadores, posiciones ocupadas y referencias a objetos no existentes; reconoce objetos predefinidos.
- `inspectRestore()` obtiene el estado de IndexedDB y devuelve los conflictos antes de solicitar confirmación al usuario.
- `restoreBackup(..., 'merge')` vuelve a inspeccionar las cuatro colecciones en la misma transacción `readwrite`; usa `add` y cancela ante colisiones para evitar sobrescrituras por `put`.
- Sin modificación de esquema ni eliminación de datos existentes.

## Evidencia ejecutada
- `node --test tests/*.test.mjs`: exit 0, **42/42 PASS** (34 previas, 8 nuevas), incluidos nombres exportados y comprobaciones puras de conflictos.
- `node --check` individual sobre 8 módulos: exit 0.
- HTTP: `/`, `/app/main.js`, `/app/db.js`, `/tests/browser-smoke.html` devolvieron 200.
- Chromium headless sobre `file://`: timeout, exit 124 (9 s), sin resultado de DOM. **NO EJECUTABLE**, no PASS.

## Riesgos y limitaciones
- IndexedDB real: operaciones y rollback todavía **SIN VALIDAR EN NAVEGADOR**.
- Interacción visual, WebGL, accesibilidad, móvil y despliegue GitHub Pages **SIN VALIDAR**.
- El modo `replace` de la API interna es destructivo por diseño; la UI normal de importación emplea exclusivamente `merge`.
- El test de navegador no destructivo conserva su protocolo de limpieza de registros temporales.

**QA gate: BLOCKED. Release gate: BLOCKED. Estado: ALPHA.**
