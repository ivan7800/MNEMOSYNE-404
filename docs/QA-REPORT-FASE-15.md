# MNEMOSYNE 404 — QA, fase 15

## Resultado
QA: **BLOCKED**. Release: **BLOCKED**. No se ha acreditado un funcionamiento real de extremo a extremo.

## Evidencias
- `node --test tests/*.test.mjs`: 42/42 PASS, exit code 0.
- Chromium automatizado con un servidor HTTP en puerto libre: `ERR_BLOCKED_BY_ADMINISTRATOR`. La prueba de navegador es **NO EJECUTABLE EN ESTE ENTORNO** (no se trata de un fallo probado de la aplicación).
- `tests/e2e_local.py`: nuevo procedimiento de integración reproducible que crea perfil Chromium temporal independiente, comprueba IndexedDB, navegación 2D, CRUD de una memoria y recarga. No se ha podido ejecutar hasta el final en este entorno por la restricción anterior. No usar un perfil con información personal para pruebas.

## Ejecución local (Windows)
Con Python y Playwright instalados: `py -m pip install playwright`, `py -m playwright install chromium` y `py tests/e2e_local.py`. No requiere publicar a GitHub. El test usa un perfil temporal y un puerto HTTP libre. En caso de bloqueo por políticas corporativas, ejecutar en un Windows personal sin anular controles de seguridad.

## Pendientes
- Pasar el test E2E en un navegador permitido y conservar su salida.
- Validar migración real de IndexedDB v1→v2→v3, restauración de copias válidas/inválidas y ausencia de pérdida de datos.
- Probar WebGL y navegación con ratón/táctil, responsive, accesibilidad y subruta `/MNEMOSYNE-404/` de GitHub Pages.
- Auditoría de seguridad completa de importadores y copias.
