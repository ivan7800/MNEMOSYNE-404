# 404 QA REPORT — MNEMOSYNE 404

Fecha: 2026-10-10  
Versión examinada: 0.7.0-alpha (fase 8)  
Resultado: **QA GATE BLOCKED — no certificado como estable**.

## Resumen ejecutivo
Se ha auditado el paquete de fase 8 sin reescribir la aplicación. Las 32 pruebas existentes de backup, intercambio y aprendizaje terminan correctamente. La sintaxis de los ocho módulos JavaScript es válida. Todas las 51 referencias directas mediante `$('<id>')` de `app/main.js` apuntan a elementos presentes en `index.html`.

**No se han superado pruebas funcionales reales de navegador.** Chromium devuelve `net::ERR_BLOCKED_BY_ADMINISTRATOR` al acceder tanto a `http://127.0.0.1:18765/` como a `file:///mnt/data/MNEMOSYNE-404/index.html`. El bloqueo pertenece al entorno de pruebas, y no demuestra por sí mismo un fallo del producto.

## Pruebas PASS (ejecutadas)
| ID | Prueba | Resultado |
|---|---|---|
| QA-01 | `node --test tests/*.test.mjs` | PASS, 32/32, exit 0 |
| QA-02 | `node --check app/*.js` (ejecutado por archivo) | PASS, 8/8, exit 0 |
| QA-03 | Comprobación estática de IDs `$('id')` de `app/main.js` vs HTML | PASS, 51 referencias, 0 ausentes |
| QA-04 | `unzip -t MNEMOSYNE-404_FASE-8_ALPHA.zip` | PASS, exit 0 |
| QA-05 | Inspección de `app/experience.js` y `app/interchange.js` | Sin `eval` ni `innerHTML` observados en módulos inspeccionados; no equivale a auditoría completa de seguridad |

## Pruebas bloqueadas / no ejecutables
| ID | Prueba | Resultado | Motivo |
|---|---|---|---|
| QA-B01 | Arranque y errores de consola | NO EJECUTABLE | Navegación Chromium denegada por administrador |
| QA-B02 | Botones, salas 3D/2D, canvas y objetos | NO EJECUTABLE | Mismo bloqueo |
| QA-B03 | Crear/editar/borrar, vínculos y recarga | NO EJECUTABLE | Mismo bloqueo |
| QA-B04 | Migración IndexedDB v1/v2 → v3 | NO EJECUTABLE | Mismo bloqueo |
| QA-B05 | Copia/restauración JSON desde UI | NO EJECUTABLE | Mismo bloqueo |
| QA-B06 | Importación MD/JSON desde UI | NO EJECUTABLE | Mismo bloqueo |
| QA-B07 | Repasos, navegación teclado y temas | NO EJECUTABLE | Mismo bloqueo |
| QA-B08 | Responsive, contraste, rendimiento y GitHub Pages real | NO EJECUTABLE | Sin navegador accesible ni despliegue |

## Observaciones y riesgos
- **ALTO — validación insuficiente de la interfaz:** las funciones críticas de persistencia no se han verificado de extremo a extremo. Bloquea STABLE.
- **MEDIO — respaldos locales:** los datos están en IndexedDB; eliminación de datos del navegador o cambio de perfil puede causar pérdida sin backup externo.
- **MEDIO — fusión por IDs:** la importación de backup reemplaza registros de igual identificador, con confirmación; realizar exportación previa.
- **MEDIO — carga Markdown:** `parseMarkdown` limita silenciosamente el contenido a los primeros 40 000 caracteres; debe advertirse o rechazarse para evitar pérdida no evidente. Pendiente de corrección en el siguiente incremento.
- **MEDIO — accesibilidad 3D:** la alternativa 2D existe en código, pero no se ha probado en navegador con teclado o lector de pantalla.
- **BAJO — despliegue:** no existe prueba de publicación bajo `/MNEMOSYNE-404/`; verificar rutas relativas y recursos en GitHub Pages antes de publicarlo.

## Evaluación
No se asigna puntuación global numérica: una parte esencial de las pruebas de producto no pudo ejecutarse. La aplicación permanece en **ALPHA**.

## Plan priorizado
1. Ejecutar smoke tests de navegador en un equipo donde Chromium pueda navegar a localhost.
2. Corregir cualquier bug reproducido e incorporar pruebas de regresión.
3. Resolver la truncación silenciosa de documentos largos y añadir tests específicos.
4. Ensayar una migración con base v2 real, persistencia tras recarga e importaciones inválidas.
5. Revisar responsive, acceso por teclado, rendimiento, privacidad y despliegue GitHub Pages en subruta.
6. Solo entonces decidir si procede una release candidate.
