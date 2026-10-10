# ARCHITECTURE BLUEPRINT — MNEMOSYNE 404

**Fecha:** 2026-10-10 · **Versión prevista:** 0.1.0-alpha · **Estado:** fase 1 completada (diseño, no software verificado).

## 1. Resumen ejecutivo
Producto web local-first para representar conocimientos en espacios: palacios y salas navegables, objetos con memorias asociadas y enlaces conceptuales. Objetivo medible: crear, hallar, abrir y exportar conocimiento de forma fiable. El 3D es una capa de navegación, no la fuente de verdad.

## 2. Usuarios y casos de uso
Usuario individual en Windows/escritorio como experiencia principal y móvil para consulta. Casos: almacenar solución IT en un servidor de una sala; encontrar una nota buscando texto; crear asociación entre dos conceptos; recuperar conocimiento con repasos; exportar/importar su biblioteca. Integración opcional futura con Second Brain, sin dependencia.

## 3. Alcance
**MUST v0.1:** un palacio con cuatro salas configuradas, movimiento/cámara 3D y selección de objetos, alternativa 2D, CRUD de salas/objetos/memorias, búsqueda local, persistencia, export/import JSON con validación, estado vacío, errores.
**SHOULD v0.2:** editor de posiciones, vínculos entre memorias, rutas y repaso espaciado, adjuntos TXT/MD; filtros, skins.
**COULD v0.3:** importación de PDF de texto mediante parser local, grafos visuales, iluminación/audio opcional, importación de Second Brain a través de esquema definido.
**WON'T por ahora:** IA autónoma, OCR, sincronización en nube, colaboración multiusuario, carga y ejecución arbitraria de scripts, VR, importación automática por API de Second Brain.

## 4. Stack y justificación
HTML semántico, CSS, JS ES Modules. Three.js para render 3D real y picking por raycasting; empaquetado local y fijado por versión, sin CDN. IndexedDB para registros y blobs permitidos, localStorage solo preferencias; navegador con servidor HTTP de desarrollo (evitar file://). PWA offline opcional tras estabilizar el núcleo. Sin bundler complejo obligatorio: evaluar imports locales en fase 2.

## 5. Arquitectura
Capas: `domain` (modelos/validación) → `repository` (IndexedDB) → `services` (búsqueda/backup) → `ui` (panel HTML, 2D) y `scene` (Three.js). Ambos modos llaman a servicios comunes; nunca guardan desde componentes gráficos directamente. Navegación 3D desacoplada del CRUD. Eventos de selección con identificadores estables. Errores comunicados sin descartar trabajo.

## 6. Modelo de datos
- `palace`: id(uuid), title, description, createdAt, updatedAt.
- `room`: id, palaceId, title, slug, theme, layoutKey, position{x,y,z}, createdAt, updatedAt.
- `object`: id, roomId, title, kind[book,terminal,artifact,door], position{x,y,z}, rotationY, scale, memoryIds[], createdAt, updatedAt.
- `memory`: id, title, bodyMarkdown(texto sin HTML activo), tags[], sourceUrl?(http/https), createdAt, updatedAt.
- `edge`: id, fromMemoryId, toMemoryId, label; IDs existentes, evitar relaciones huérfanas.
- `learningRoute`: id, title, orderedMemoryIds[], createdAt.
- `review`: memoryId, dueAt, intervalDays, ease, lastReviewedAt (fase posterior).
- `attachment`: id, memoryId, filename, mime, size, blob (posterior, límites estrictos).
SchemaVersion=1, IDs UUID, fechas ISO, migraciones transaccionales. Una memoria puede asociarse a múltiples objetos. Borrados de sala requieren confirmación y decisión explícita sobre destino de objetos; nunca borrar memorias en cascada.

## 7. Persistencia
IndexedDB: almacenes `palaces`, `rooms`, `objects`, `memories`, `edges`, `routes`, `meta`; índices por palaceId, roomId y fecha. Cuotas del navegador no garantizadas: capturar `QuotaExceededError`. Migración con rollback de transacción y ensayo con datos antiguos. No guardar datos sensibles pensando que IndexedDB los cifra.

## 8. Módulos y responsabilidades
`app/main.js`: arranque; `app/domain/*.js`: entidades y esquemas; `app/data/db.js`: transacciones; `app/services/search.js`: índice/búsqueda; `app/services/backup.js`: import/export; `app/scene/*`: escena, navegación, picking; `app/ui/*`: vista 2D, paneles, accesibilidad; `app/config.js`: límites y flags. Estructura propuesta, todavía no creada.

## 9. UX y navegación
Inicio: palacio con cuatro salas (IT, Biblioteca, Nexus, Archivo). Ratón/click o táctil para seleccionar, WASD/flechas si es posible; Escape vuelve/cierra. Panel lateral con título, descripción, memorias y acciones explícitas. Atajo de búsqueda y botón permanente `Modo 2D`, accesible sin WebGL. Estados vacíos, guardando, guardado, error, confirmación de borrar. No imponer cámara libre en móvil: selección por planos/2D.

## 10. PWA y offline
Iteración posterior: manifest con `start_url: ./`, `scope: ./`, caché versionada de shell, estrategia que no cachee datos privados en respuestas. Manejar actualización con aviso; no prometer modo offline hasta prueba real.

## 11. GitHub Pages
Base `/MNEMOSYNE-404/`; rutas de recursos relativas, navegación sin rewrite de servidor, imports locales y pruebas con hosting bajo subruta. GitHub Pages solo aloja código y assets; memorias se almacenan en el dispositivo y no se sincronizan.

## 12. Seguridad y privacidad
Texto de usuarios tratado como no confiable: `textContent`, render Markdown seguro y esquema de URL permitido (solo http/https), sin `eval`. Import JSON con comprobación de tamaño, schemaVersion y referencias; mostrar vista previa, backup antes de reemplazar. Sin scripts en PDFs/HTML importados, sin telemetría. Dependencias fijadas, licencias documentadas, CSP cuando sea viable.

## 13. Importación y exportación
Formato `{"format":"mnemosyne404","schemaVersion":1,"exportedAt":"...","data":{...}}`; validar contadores, campos, IDs/referencias y límites; modo fusionar con remapeo seguro de IDs o restaurar con confirmación y backup previo. Descarga con Blob. Pruebas de ida/vuelta y corrupción.

## 14. Estructura propuesta
`index.html`, `styles/`, `app/{main,domain,data,services,scene,ui}/`, `assets/`, `tests/`, `docs/`, `manifest.webmanifest`, `sw.js` (solo cuando se pruebe PWA), `README.md`, `PLAN.md`, `LESSONS.md`.

## 15. Riesgos
**Alto** WebGL no disponible → fallback 2D. **Alto** pérdida por limpieza del navegador → exportación/backup prominente, pruebas restore. **Alto** complejidad de navegación → pruebas de tareas reales en 2D/3D. **Medio** límites IndexedDB con adjuntos → tamaños máximos y cuota. **Medio** actualizaciones SW → no añadirlo en alpha hasta verificar invalidación. **Medio** dependencias → fijar versión y distribuir localmente.

## 16. Criterios de aceptación
Ver `ACCEPTANCE.md`; ningún PASS sin pruebas ejecutadas.

## 17. Plan de implementación
1) Shell 2D/3D y navegación robusta. 2) Modelo/IndexedDB y CRUD real. 3) Objetos interactivos y búsquedas. 4) Export/import. 5) Rutas/repaso/grafos. 6) UX premium/performance. 7) integración opcional. 8) QA, seguridad, PWA y release.

## 18. Decisiones arquitectónicas
ADR-001: local-first y sin cuentas. ADR-002: el 3D es proyección de un grafo/datos independiente. ADR-003: 2D es acceso de primera clase. ADR-004: Three.js local, sin CDN runtime. ADR-005: no integrar Second Brain hasta definir/validar su formato real; no inventar compatibilidad. ADR-006: documentación y backup antes de release.

**ARCHITECTURE GATE:** READY para iniciar implementación acotada; no implica que exista app funcional.
