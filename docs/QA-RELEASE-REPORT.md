# MNEMOSYNE 404 — Auditoría de entrega

## Alcance
Se han conservado los módulos, controles, cuatro salas, WebGL, mapa 2D, memorias, vínculos, constructor de objetos, repasos, temas, Markdown/JSON, respaldos, pruebas y lanzadores Windows.

## Defectos y correcciones
- Integridad: el alta de una memoria vinculada antes usaba dos transacciones; un fallo en la segunda dejaba una memoria sin el vínculo solicitado. Ahora ambas escrituras comparten una transacción IndexedDB.
- Migraciones: las conexiones abiertas ahora se cierran al recibir `versionchange`, evitando bloquear actualizaciones de esquema desde esa pestaña.
- Publicación: incluido `.nojekyll` y URLs relativas para GitHub Pages; no necesita Python para ejecutarse publicado.
- Higiene: eliminado bytecode Python (`__pycache__`) del paquete de publicación.

## Evidencia y límites
Pruebas Node, comprobación `node --check`, sintaxis Python y servidor HTTP local: ver salida de la ejecución. Todos los botones identificados en HTML tienen listener directo o son los controles dinámicos generados por JavaScript, pero esto **no sustituye una prueba real de interacción**. En el entorno de auditoría, Chromium devuelve `ERR_BLOCKED_BY_ADMINISTRATOR` incluso en páginas `data:`: las pruebas E2E quedan bloqueadas por el entorno. No se puede certificar WebGL, formularios e IndexedDB en navegador ni proclamar PASS de release estable.

## Publicación
GitHub Pages: publicar el contenido de esta carpeta en la raíz de la rama configurada, no el ZIP dentro de otra carpeta. La app se sirve desde `/MNEMOSYNE-404/`, con assets relativos. La persistencia es específica del origen del navegador; realizar exportación JSON antes de migrar de origen o borrar datos locales.

## Pendiente antes de marcar STABLE
Ejecutar `VALIDAR_WINDOWS.bat` y comprobar manualmente navegación 3D/2D, los cuatro temas, todos los formularios, restauración y reimportación, persistencia después de recarga, funcionamiento móvil y controles de teclado. Bloqueo: QA funcional de navegador.
