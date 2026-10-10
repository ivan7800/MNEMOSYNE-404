# MNEMOSYNE 404 — QA fase 12 (2026-10-10)

## Resultado
**BLOCKED para release STABLE.** No se ha certificado la aplicación en navegador. Se conserva `0.7.0-alpha`.

## Verificaciones ejecutadas
- `node --test tests/*.test.mjs` → exit 0; **34/34 PASS** (lógica y formatos de datos).
- `node --check app/<módulo>.js` para los ocho módulos → exit 0 en todos (sintaxis).
- Revisión estática de rutas del HTML: CSS `./styles/main.css`; módulos `./app/experience.js` y `./app/main.js`. No se identificaron rutas web absolutas en este HTML. **No demuestra despliegue en GitHub Pages.**
- Búsqueda estática `innerHTML`, `insertAdjacentHTML`, `eval`, `new Function` en módulos: sin coincidencias. El código usa `textContent` para memorias. **No equivale a pentest.**
- Chromium sin interfaz: `timeout 18 chromium --headless --no-sandbox --disable-gpu --disable-dev-shm-usage --user-data-dir=/tmp/mnemo-chrome-test-12 --dump-dom http://127.0.0.1:8765/tests/browser-smoke.html` → exit 124 (timeout), prueba **NO EJECUTABLE**. El servidor de este intento no pudo vincular el puerto 8765 (`Errno 98 Address already in use`); no se puede atribuir el bloqueo exclusivamente al navegador.

## Observaciones prioritarias
1. **ALTO**: faltan pruebas E2E efectivas de creación/edición/eliminación, botones, IndexedDB, recuperación tras recargar, escenas 3D y modo 2D.
2. **MEDIO**: el launcher abre la URL antes de comprobar que el servidor esté disponible; el puerto fijo 8765 puede estar ocupado. Requiere revisión y prueba en Windows.
3. **MEDIO**: `restoreBackup(...,'merge')` sobrescribe IDs coincidentes por diseño. Hay advertencia y confirmación, pero no vista previa de conflictos ni backup automático.
4. **MEDIO**: `validateBackup` valida IDs de memorias en vínculos y repasos, pero no comprueba completamente la existencia de todos los objetos de destino en el estado fusionado.
5. **PENDIENTE**: accesibilidad completa, responsive y rendimiento con bibliotecas grandes.

## Pruebas que faltan para RC/STABLE
Ejecutar Chromium real con origen HTTP controlado y sin conflicto de puertos; probar migraciones sobre copia aislada de una base v1/v2, CRUD y persistencia tras reinicio, importación incorrecta y conflictos, cada control relevante, 3D/2D, teclado/móvil, carga de subruta `/MNEMOSYNE-404/` y restauración desde backup. Nunca usar `indexedDB.deleteDatabase('mnemosyne404')` sobre datos personales.

## Decisión
No declarar PASS de QA, RC o STABLE. No publicar a GitHub sin autorización explícita. Mantener la aplicación anterior y documentar evidencias en cada nueva ejecución.
