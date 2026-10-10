# MNEMOSYNE 404 — Fase 3 (0.2.0 Alpha)

Palacio de memoria con mapa 3D WebGL nativo y alternativa 2D. Esta edición añade memorias locales persistentes. No requiere Internet.

## Uso
Extraer ZIP, ejecutar `ABRIR_MNEMOSYNE.bat` en Windows con Python 3 instalado, visitar `http://localhost:8765/`. No abrir `index.html` con `file://`.

Selecciona una sala y un objeto, pulsa **Nueva memoria**, introduce título y texto, guarda. La memoria queda vinculada al objeto seleccionado. Busca por título, contenido o etiquetas. Pulsa **Editar** para cambiarla o **Eliminar** para borrarla con confirmación. **Vincular al objeto** permite asociar memorias preexistentes; **Desvincular** retira la asociación sin borrar la memoria.

## Datos y límites
Memorias y asociaciones en IndexedDB del navegador y perfil usados. Las salas y objetos iniciales son una plantilla fija, todavía no editables. No hay sincronización ni copia de seguridad: **no introducir conocimiento irremplazable aún**. No borrar almacenamiento del navegador. Esta fase solo admite texto (máximo 40.000 caracteres por memoria), título y etiquetas.

## Verificación
La sintaxis JS se verifica con `node --check app/main.js` y `node --check app/db.js`. El navegador automatizado en el entorno de entrega impide la navegación por política (`ERR_BLOCKED_BY_ADMINISTRATOR`), por lo que CRUD, persistencia y comportamiento visual están pendientes de ensayo independiente. Versión Alpha, no STABLE.

## Fases siguientes
Backup/import JSON con validación y recuperación; CRUD de salas y objetos; mejoras de búsqueda, rutas de memoria, QA completa y eventual PWA. La arquitectura original preveía Three.js local, pero el prototipo usa WebGL nativo sin dependencias.


## Fase 4 — Copias de seguridad

Botón **Exportar JSON**: descarga memorias y vínculos en un archivo versionado. **Importar JSON** valida formato, versión, campos, duplicados y referencias antes de realizar una fusión atómica; si una memoria tiene el mismo identificador que una existente, se sobrescribe. Cancelar mantiene los datos intactos. El tamaño máximo importado es 8 MB.

Para realizar las pruebas de validación: `node --test tests/backup.test.mjs`. Estas pruebas NO sustituyen la validación visual de navegador, IndexedDB real ni el proceso completo de restauración.


## Fase 5 — objetos propios (v0.4.0 Alpha)
Selecciona una sala, pulsa **Crear objeto**, introduce nombre y descripción y elige una de las 12 ubicaciones. Puedes **Editar** o **Eliminar** tus objetos. Sus vínculos se eliminan al borrar el objeto, pero las memorias se conservan. Los objetos aparecen como pequeños pedestales en 3D. El modo 2D mantiene el listado accesible.

La base IndexedDB migra de versión 1 a 2 sin borrar memorias y vínculos. Exporta una copia JSON antes de actualizar. El formato de backup v2 incluye `objects` y acepta restaurar copias v1. La importación de archivos sustituye registros que coincidan en ID; no altera los archivos originales del navegador fuera de la transacción. Restricción: máximo 12 objetos personalizados por sala.

**Estado:** desarrollo Alpha. Las pruebas unitarias no sustituyen pruebas reales de navegación y persistencia en navegador.

## Fase 6 — v0.5.0 Alpha

Selecciona una sala con memorias vinculadas y pulsa **Recorrer sala** para repasarlas por título en orden alfabético; **Repasar pendientes** muestra memorias nuevas y aquellas cuya fecha de revisión llegó. Primero recuerda la respuesta, pulsa **Mostrar respuesta**, y califica **Otra vez** (1 día), **Me costó** (mínimo 2 días) o **Lo recordé** (mínimo 3 días); los intervalos posteriores aumentan mediante un algoritmo sencillo. No se trata de un algoritmo validado científicamente.

El historial de revisiones se conserva en IndexedDB (versión 3) y se incluye en las copias JSON (versión 3). Se siguen importando copias v1 y v2; antes de importar realiza una exportación. La fusión de datos existentes no borra los registros previos omitidos en la copia.

Estado: Alpha. Las pruebas unitarias no sustituyen a la comprobación real de navegación, almacenamiento y migración en navegador.

## Fase 7 — experiencia adaptable (v0.6.0 Alpha)

Se incorporan cuatro temas: Cyber Archive, Biblioteca clásica, Archivo oscuro y Minimal. El selector conserva el tema elegido en `localStorage` (preferencias no sensibles). El botón **Ambiente** permite desactivar las sombras y las animaciones ambientales; el estado también se conserva y, por defecto, respeta `prefers-reduced-motion`. Hay indicadores de foco visibles y los controles se redistribuyen en móvil. El fondo WebGL cambia de paleta sin crear un nuevo contexto; el modo 2D sigue disponible. **No cambia el esquema IndexedDB ni el formato de copias**, que continúan en v3.

El acabado y la navegación real necesitan revisión en navegador antes de declarar la versión estable.

## Fase 8 — intercambio de conocimiento (v0.7.0 Alpha)

Se puede **Importar MD / conocimiento JSON** (hasta 50 archivos en una operación). Cada `.md` se convierte en una memoria con su texto original; el primer encabezado `#` aporta el título y, en su ausencia, se usa el nombre del archivo. Se aceptan archivos Markdown de hasta 100 KB; los documentos de más de 40.000 caracteres se rechazan con mensaje explícito, sin recortes. No se interpretan HTML, enlaces ni instrucciones como código ejecutable.

Se admite también un JSON **explícito y versionado**, con esta estructura:

```json
{
  "format": "mnemosyne404-knowledge",
  "schemaVersion": 1,
  "entries": [
    {"title": "Ejemplo", "content": "Texto de la nota", "tags": ["aprendizaje"]}
  ]
}
```

El botón **Exportar conocimiento** produce ese mismo formato, intercambiable con scripts externos. El JSON general tiene límite de 8 MB y hasta 2000 entradas por archivo. Los contenidos importados reciben identificadores nuevos y no sobrescriben memorias existentes; la importación fusiona atómicamente en IndexedDB después de validar todos los archivos. Si existe un objeto seleccionado, las notas se vinculan a él. Para preservar objetos, vínculos y repasos, utilizar **Exportar JSON** (copia de seguridad completa), no la exportación de conocimiento.

**Second Brain:** esta versión no integra una API ni asume un esquema específico del proyecto externo. Para importar datos de Second Brain hace falta exportarlos a Markdown o transformarlos al esquema de intercambio documentado. No hay sincronización en tiempo real ni conexión de cuentas.

### Pruebas

Ejecutar `node --test tests/*.test.mjs` y comprobar sintaxis con `node --check app/main.js && node --check app/interchange.js`. El flujo visual y la restauración real en Chromium o Edge siguen pendientes de verificación manual en este entorno. No declarar STABLE.

## Fase 9 — informe QA

Consultar `docs/QA-REPORT-FASE-9.md`. Las 34 pruebas automatizadas de lógica pasan, pero la aplicación **no** está certificada como estable: las pruebas E2E de navegador no se pudieron ejecutar en el entorno de auditoría. Se mantiene la versión 0.7.0-alpha para evitar un incremento de versión injustificado.

## Fase 10 — estabilización de datos

Se evita el truncado silencioso al importar Markdown. El editor también valida los límites compatibles con las copias JSON (título ≤120, cuerpo ≤40.000, etiquetas ≤100, objeto ≤80 caracteres de título y ≤500 de descripción). 34/34 pruebas de lógica y sintaxis de ocho módulos: PASS. La ejecución visual con navegador continúa pendiente; no se autoriza release STABLE.

## Seguridad QA — Fase 11
La página `tests/browser-smoke.html` ya no elimina la base de datos. Crea identificadores temporales únicos, comprueba operaciones y elimina únicamente sus propios registros. Las pruebas E2E del navegador siguen pendientes y la versión no es STABLE.

## Estado de auditoría fase 12
El test de lógica pasa 34/34 y la sintaxis de ocho módulos es válida. No hay certificación E2E real: el intento de Chromium agotó el tiempo y el puerto 8765 estaba ocupado. Revisa `docs/QA-REPORT-FASE-12.md` antes de tratar esta versión como lista para publicación. El archivo BAT usa un puerto fijo; si hay conflicto, identifica el proceso que lo ocupa antes de iniciarlo.

### Fase 13 — arranque y protección frente a conflictos

`ABRIR_MNEMOSYNE.bat` utiliza `INICIAR_SERVIDOR.py`, que selecciona un puerto libre en `127.0.0.1` y abre el navegador tras arrancar el servidor. Para arrancar manualmente: `python INICIAR_SERVIDOR.py`.

Una copia JSON con IDs ya existentes o vínculos a objetos inexistentes se **rechaza** al importar desde la interfaz. No se sobrescriben registros por coincidencia de ID en una fusión. Exporte una copia antes de cualquier importación. La función de restauración con modo `replace` es interna, destructiva y no se expone desde la interfaz.

**Límites conocidos:** no se han completado pruebas E2E en navegador ni sobre Windows; versión Alpha, no STABLE.

## Fase 14 — corrección de arranque y restauración
Se corrigió la ausencia de la exportación `inspectRestore`, que impedía la carga del módulo principal. La importación de respaldos verifica conflictos antes de confirmar y de nuevo dentro de una transacción `readwrite`, abortando ante colisiones. Se añadieron pruebas de contrato de módulos y de conflictos (`42/42 PASS`). No se ha podido completar el smoke test Chromium en este entorno: sigue siendo una versión **Alpha**, no certificada para uso con datos irremplazables. Consulte `docs/QA-REPORT-FASE-14.md`.

## Fase 15 — pruebas de integración reproducibles
Se añadió `tests/e2e_local.py`, prueba automatizada mediante Playwright, servidor local de puerto libre y **perfil temporal** separado del navegador habitual. Comprueba CRUD de IndexedDB, reapertura, navegación 2D, creación y recuperación de una memoria después de recargar. Consulta `docs/QA-REPORT-FASE-15.md` para su ejecución y límites. En este entorno Chromium respondió `ERR_BLOCKED_BY_ADMINISTRATOR`, por lo que el estado sigue **Alpha / BLOCKED**.


## Fase 16 — QA de integridad
Se han reforzado las comprobaciones de importación: vínculos a memorias inexistentes y objetos entrantes con posiciones duplicadas. El test E2E permite `CHROMIUM_PATH` si se necesita indicar la ruta al navegador. 45/45 pruebas Node pasan, pero no se ha demostrado el funcionamiento en Chromium debido a restricciones de navegación en este entorno. No es una release estable. Ver `docs/QA-REPORT-FASE-16.md`.

### Fase 17 — verificación
Ejecutar `node --test tests/*.test.mjs` para pruebas de lógica y estructura. Ejecutar `py tests/e2e_local.py` en Windows con Python y Playwright/Chromium instalados. Exit code `2` indica que el navegador bloqueó el acceso, **no** que se hayan validado las funciones. Informe: `docs/QA-REPORT-FASE-17.md`.

### Fase 18 — validación pendiente en navegador
Se añaden pruebas E2E de migración IndexedDB v1→v3 y restauración conflictiva en perfil **temporal** de Chromium, y pruebas Node de formatos heredados y repaso. Ejecutar `py tests/e2e_local.py` desde la carpeta del proyecto tras instalar Playwright. En este entorno Chromium devuelve `ERR_BLOCKED_BY_ADMINISTRATOR`; por ello no hay certificación E2E ni release estable.

### Fase 19 — comportamiento ante pérdida de WebGL
Si el dispositivo pierde el contexto gráfico, el visor cambia automáticamente al mapa 2D y muestra un aviso. Para reintentar usar WebGL, recarga la página. Los gestos cancelados no mantienen el estado de arrastre.

**Estado de validación:** 55 pruebas automatizadas Node superadas. La interacción completa sigue pendiente: el entorno de pruebas impide al Chromium navegar a la URL local. No usar como almacenamiento único de información importante.

### Fase 20 — Validación de navegador en Windows
Extrae el paquete, instala Python 3 y Playwright si no están disponibles (`py -3 -m pip install playwright` y `py -3 -m playwright install chromium`). Ejecuta `VALIDAR_WINDOWS.bat` y revisa `informes/QA-WINDOWS-ULTIMA-EJECUCION.txt`. El test usa un perfil temporal de navegador. Si la prueba falla, conserva el informe para diagnosticar la causa. **No se ha certificado aún una versión STABLE.**


## Entrega auditada para GitHub Pages
La aplicación es estática, sin backend ni compilación: publica directamente el contenido de esta carpeta en GitHub Pages (`/MNEMOSYNE-404/`). `.nojekyll` está incluido. No publiques conocimientos personales: IndexedDB almacena los datos en el navegador del visitante. Ejecuta `VALIDAR_WINDOWS.bat` antes de etiquetar la versión como estable. Detalles: `docs/QA-RELEASE-REPORT.md`.
