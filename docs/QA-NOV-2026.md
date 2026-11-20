# MNEMOSYNE-404 — Endurecimiento de datos y búsqueda (21-11-2026)

## Cambios
- Importación de respaldo con modos añadir sin conflictos, omitir duplicados y sustituir biblioteca. El modo de sustitución exige escribir RESTAURAR y desencadena primero la descarga de una copia de los datos actuales.
- La fusión sigue validándose de nuevo dentro de una única transacción IndexedDB. El modo omitir evita sobrescribir IDs y evita insertar objetos en posiciones ocupadas; omite también los vínculos cuyo destino no existe.
- Exportación de copia desde lecturas nuevas de IndexedDB, no desde las listas cargadas en la interfaz.
- La lista de memorias muestra 60 tarjetas por bloque, reduce el texto visible en tarjetas y retrasa brevemente las búsquedas para reducir repintados.
- Los editores rechazan más de 20 etiquetas en lugar de perder etiquetas silenciosamente.
- La interfaz deja de presentarse como un release 1.0 aprobado sin pruebas funcionales completas.

## Comprobación
- Automatización añadida: .github/workflows/quality.yml, con Node 22 y pruebas Playwright en Chromium aislado.
- Pruebas de regresión de los modos de importación: tests/restore-modes.test.mjs.
- Las pruebas de navegador en GitHub Actions son imprescindibles antes de declarar estable el producto.
- La restauración total destruye los registros actuales. La copia automática se solicita al navegador, pero el usuario debe verificar que el archivo se guardó antes de confirmar un proceso irreversible; no equivale a una copia remota.
- IndexedDB está ligada al origen web y al perfil del navegador. Cambiar de localhost a GitHub Pages no migra memorias.

## Pendientes para STABLE
Pruebas manuales en Windows, Linux y móvil, accesibilidad, carga grande (1000 y 10 000 memorias), restauración a partir de una copia real y uso prolongado. No se etiqueta como STABLE por aprobar únicamente las pruebas unitarias.
