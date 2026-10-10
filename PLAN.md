# PLAN — MNEMOSYNE 404

Nombre: MNEMOSYNE 404  
Versión: 0.7.0-alpha  
Tipo: WEB / PWA futura  
Destino: ZIP local; GitHub Pages solo con autorización  
Estado: FASE 16 — INTEGRIDAD DE IMPORTACIÓN, STABLE BLOQUEADA

## FASE ACTUAL
FASE 16 — integridad de importación; ver `docs/QA-REPORT-FASE-16.md`.

## Alcance
MUST: navegación 3D/2D, CRUD, búsqueda, IndexedDB, backup validado.  
SHOULD: objetos, vínculos, rutas/repasos, temas, intercambio MD/JSON.  
COULD: PDF local, interoperabilidad directa Second Brain.  
WON'T: nube, OCR, VR, cuentas o publicación sin autorización.

## Gates
| Gate | Estado | Evidencia |
|---|---|---|
| Architecture / Plan | READY | `docs/ARCHITECTURE.md` |
| Build | PENDING | Sintaxis JS PASS; arranque navegador no ejecutable |
| UX | BLOCKED | No ejecutable en navegador |
| QA | BLOCKED | 34/34 tests; navegador bloqueado por administrador |
| Security | PENDING | Revisión estática parcial, falta auditoría completa |
| Release | BLOCKED | No publicar ni declarar STABLE |

## Riesgos y prioridades
ALTO: no verificación E2E. MEDIO: pérdida de datos sin backup; truncado Markdown; restauración con conflicto IDs; accesibilidad no probada. MEDIO: GitHub Pages subruta no comprobado.

## Comandos verificados
- `node --test tests/*.test.mjs` → exit 0 → 32/32 PASS.
- `node --check app/*.js` (por módulo) → exit 0 → sintaxis PASS.
- Comparación estática IDs JS/HTML → 0 ausentes.
- `unzip -t` al ZIP anterior → exit 0.
- Chromium `localhost` y `file://` → `ERR_BLOCKED_BY_ADMINISTRATOR` (NO EJECUTABLE).

## Siguiente fase válida
Resolución de los bloqueos QA en un navegador habilitado, correcciones verificadas y pruebas de regresión antes de RC.

## Correcciones fase 10 (2026-10-10)
- Markdown >40.000 caracteres: rechazo explícito; no se recorta.
- Editor de memorias y objetos: límites coherentes con respaldo validado.
- Tests: 34/34 PASS; sintaxis 8/8 PASS.
- E2E Chromium: no completado, pendiente de entorno habilitado.
- Release: BLOCKED.

## Fase 11 (2026-10-10)
- Prueba browser-smoke modificada para usar IDs únicos y NO ejecutar `indexedDB.deleteDatabase` contra datos reales.
- La prueba elimina solamente sus registros temporales, incluso ante fallo.
- QA navegador permanece pendiente mientras Chromium no complete una sesión.

## Fase 12 — validación final (2026-10-10)
- **34/34** pruebas de lógica PASS; **8/8** módulos pasan `node --check`.
- Revisión estática inicial de rutas relativas y sinks XSS: sin hallazgos obvios en el alcance inspeccionado.
- Navegador E2E: **NO EJECUTABLE** (timeout; puerto 8765 ocupado durante el intento).
- Se identificó fragilidad en launcher (puerto fijo, apertura del navegador antes del servidor) y riesgos en importación por fusión.
- **QA BLOCKED / Security PENDING / Release BLOCKED.** Ver `docs/QA-REPORT-FASE-12.md`.

## Fase 13 — integridad y arranque (2026-10-10)
- Launcher: puerto efímero de `127.0.0.1`, navegador abierto tras enlazar el servidor. Añadido `INICIAR_SERVIDOR.py`.
- `restoreBackup` en modo `merge`: rechaza IDs existentes y cancela la transacción completa; inspección previa de vínculos a objetos no existentes y posiciones ocupadas desde la UI.
- Verificado: `node --test tests/*.test.mjs` → exit 0, 34/34 PASS; `node --check` en 8 módulos → exit 0.
- Servidor Python real: HTTP 200 para `/`, `/app/main.js` y `/styles/main.css` con puerto asignado dinámicamente.
- PENDIENTE: ejecución del BAT en Windows, controles del navegador, IndexedDB real, E2E, accesibilidad y subruta GitHub Pages.
- QA BLOCKED / Release BLOCKED. No publicar.

## Fase 14 — reparación de import y refuerzo de restauración (2026-10-10)
- Corregido fallo bloqueante: `inspectRestore` se importaba desde `main.js`, pero faltaba su export en `db.js`.
- Añadidos comprobación pura de conflictos, inspección de BD y protección transaccional de la fusión.
- `node --test tests/*.test.mjs` → exit 0, **42/42 PASS**.
- `node --check` → exit 0 en 8 módulos.
- HTTP de rutas principales → 200; Chromium `file://` → timeout (exit 124, prueba NO EJECUTABLE).
- QA y Release **BLOCKED** hasta pruebas reales de navegador, IndexedDB, UI, 3D, accesibilidad y GitHub Pages.

## Fase 15 — integración (2026-10-10)
- 42/42 pruebas de lógica: PASS.
- Nuevo test E2E en `tests/e2e_local.py` con Chromium aislado en perfil temporal, sin borrar datos del perfil real.
- Intento E2E: NO EJECUTABLE por `ERR_BLOCKED_BY_ADMINISTRATOR`.
- QA Gate: BLOCKED; Release Gate: BLOCKED. Próximo: ejecución en navegador habilitado, prueba de migraciones y UI completa.

## Actualización Fase 16
- 45/45 pruebas automatizadas PASS.
- Chromium del sistema: navegación HTTP local bloqueada por administrador; E2E no ejecutable.
- QA y Release siguen BLOCKED hasta pruebas de integración reales.

## Fase 17 — verificación de integración (2026-10-10)
- 48/48 pruebas Node PASS, incluyendo tres comprobaciones nuevas de estructura UI, recursos e imports.
- 8 módulos JavaScript: sintaxis PASS; Python E2E: compilación PASS.
- Chromium E2E: BLOCKED por `ERR_BLOCKED_BY_ADMINISTRATOR` (exit 2 explícito).
- Ninguna prueba real de persistencia o UI marcada como PASS.
- QA BLOCKED / Release BLOCKED. Ver `docs/QA-REPORT-FASE-17.md`.

## Fase 18 — migraciones y aprendizaje (2026-10-10)
- Perfil aislado: test E2E ampliado para sembrar IndexedDB v1, abrirlo con v3, verificar conservación de datos y comprobar rechazo de colisiones en restauración.
- Añadida fixture `tests/e2e-fixture.html` y pruebas Node de copias v1/v2, repaso y rutas de aprendizaje.
- Estado: pruebas de Node PASS; E2E NO EJECUTABLE por política Chromium `ERR_BLOCKED_BY_ADMINISTRATOR` (exit 2).
- QA / Release: BLOCKED; no publicación ni denominación STABLE.

## Fase 19 — hardening WebGL y revisión de release (2026-10-10)
- Pérdida de contexto WebGL: fallback a modo 2D y mensaje de recuperación mediante recarga.
- Arrastre: cancelación explícita ante pointercancel y lostpointercapture.
- 55/55 pruebas Node PASS (3 pruebas de estructura adicionales).
- 8/8 módulos JS sintaxis PASS; test E2E Python compila.
- E2E: exit 2, `ERR_BLOCKED_BY_ADMINISTRATOR` antes de navegar: ninguna operación IndexedDB/UI E2E comprobada.
- QA Gate BLOCKED; Release Gate BLOCKED. Próximo: ejecutar pruebas E2E y auditoría visual en Windows con navegador permitido.

## Fase 20 — Validación funcional delegada a Windows (2026-10-10)
- 55/55 pruebas Node PASS; `e2e_local.py` compila.
- E2E Chromium local: exit 2, `ERR_BLOCKED_BY_ADMINISTRATOR`; ninguna aserción E2E ejecutada.
- Se incorpora `VALIDAR_WINDOWS.bat` para ejecución aislada y obtención de informe Windows.
- Ver `docs/QA-REPORT-FASE-20.md`.
- QA BLOCKED / Release BLOCKED, pendiente de informe E2E del equipo Windows.
