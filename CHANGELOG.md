# Registro de cambios

## 1.0.0-rc.2 — 2026-11-21 (reparación de visor)

- Reparación del cambio 2D → 3D: redibujado después del layout y recuperación de la cámara general.
- El recorrido a pie termina limpiamente al pasar a 2D; al volver a 3D la cámara no queda fuera de las salas.
- El framebuffer WebGL se preserva para hacer visible y comprobable la escena al alternar modos.
- Servicio PWA actualizado: caché v2, archivos JS/CSS consultados en red antes de reutilizar copia offline, y actualización automática una vez cuando no hay un editor abierto.
- Mapa 2D: las cuatro tarjetas aparecen al principio del panel; antes podían quedar por debajo del área visible.
- Vista previa Markdown: consultar una referencia ya no cierra el editor ni pierde el borrador sin guardar.
- Pruebas nuevas de píxeles reales WebGL y tres ciclos consecutivos 2D↔3D, mapa 2D en pantalla, preservación de borradores y política de actualización del service worker.
- **No se modifica la versión de IndexedDB ni se borran conocimientos o repasos.** Las pruebas manuales con equipos reales siguen pendientes.

## 1.0.0-rc.1 — 2026-11-21 (candidato)

- Integridad de datos: snapshot IndexedDB atómico, conservación de colecciones e historial adaptativo en backups v3, importación hasta 64 MB.
- Biblioteca: Markdown seguro, lector, referencias internas bidireccionales, colecciones, filtros avanzados y búsqueda en bloques.
- Aprendizaje: adaptación del factor de facilidad, repaso histórico, panel y objetivo diario.
- Palacio WebGL: modo recorrido a pie, cámara y controles con teclado/táctil, selección de objetos, decoración arquitectónica y calidad ajustable; fallback 2D preservado.
- PWA: manifiesto, icono local, caché de recursos estáticos; los datos privados permanecen en IndexedDB.
- QA: tests Node de integridad, 10.000 recuerdos en búsqueda y E2E Playwright para Chromium, Firefox y WebKit.
- Sin promesa de sincronización, adjuntos, edición de salas o versión STABLE sin QA manual.

## Historial anterior

Consulta docs/HISTORIAL-ALPHA.md y los informes QA previos para ver la evolución del prototipo.
