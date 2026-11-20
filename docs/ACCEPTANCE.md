# Pruebas de aceptación — MNEMOSYNE-404 candidato 1.0

Este documento distingue **cobertura automatizada** de **validación manual**. La CI real es la fuente del resultado PASS/FAIL; un test escrito no supone que haya aprobado.

| ID | Criterio | Cobertura y evidencia |
|---|---|---|
| A01 | Inicio local sin excepciones | E2E en servidor Python y página principal |
| A02 | Subruta GitHub Pages sin 404 | Integridad de recursos, despliegue Pages; revisar navegación pública |
| A03 | Selección de sala y objetos 3D | Recorrido controlado en navegador; selección visual manual pendiente |
| A04 | Mapa 2D utilizable | E2E selector de modo, cuatro salas y lista de objetos |
| A05 | CRUD consistente | E2E guardar memoria y CRUD de objetos/vínculos |
| A06 | Persistencia entre sesiones | E2E recarga y reapertura de IndexedDB |
| A07 | Búsqueda y referencias | Tests unitarios, E2E filtro colección y lector Markdown |
| A08 | Backup completo e importación | E2E 1.000 memorias, copia v3, skip y replace; copia real pendiente |
| A09 | Rechazo de copia inválida | Tests unitarios; formularios reales en varios navegadores pendiente |
| A10 | Accesibilidad teclado | Foco visible, WASD y botones táctiles; lector de pantalla manual pendiente |
| A11 | Móvil | CSS responsive; ensayo en teléfono físico pendiente |
| A12 | XSS | E2E Markdown con etiquetas maliciosas mostradas como texto |
| A13 | PWA offline | E2E desconexión tras instalación del SW; instalación real pendiente |
| A14 | Rendimiento | 10.000 notas en prueba pura y 1.000 en IndexedDB; carga prolongada pendiente |

**No declarar STABLE** hasta aprobar todos los criterios manuales críticos. Ejecutar el workflow Quality de la rama/commit exactos y registrar su enlace en el informe de publicación.
