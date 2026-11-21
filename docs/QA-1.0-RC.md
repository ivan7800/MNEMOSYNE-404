# MNEMOSYNE-404 — registro de QA candidato 1.0 (21-11-2026)

## Alcance implementado

**Fiabilidad:** instantánea de lectura IndexedDB con una transacción, importación atómica merge/skip/replace y validación de copia v3 con campos nuevos opcionales. Test de importación de 1.000 memorias y límite de importación completa 64 MB.

**Conocimiento:** Markdown básico sin innerHTML, referencias wiki con enlaces entrantes y salientes, colecciones en cada memoria, filtros por colección/etiqueta, búsqueda con palabras y paginación de 60 tarjetas. Compatible con respaldos antiguos sin colección.

**Aprendizaje:** repetición espaciada adaptativa basada en intervalos y factor de facilidad con histórico acotado a 365 entradas por memoria. Métricas de repaso y objetivo diario local; compatibilidad con reviews legados.

**Palacio:** recorrido opcional con teclado y botones táctiles, selección de objetos desde la escena, geometría de marcadores y opción de calidad gráfica. Se mantiene el mapa 2D accesible. No existe todavía un editor de salas o mundos arbitrarios.

**Entrega:** manifiesto PWA, icono original, servicio de caché del app shell (excluye datos privados), instalación progresiva en HTTPS/localhost y QA multi-motor.

## CI automatizada

- Node 22: sintaxis de módulos, contratos existentes y tests nuevos de colecciones, enlaces, aprendizaje, backups, PWA y 10.000 resultados en memoria.
- Python 3.12 + Playwright 1.56: Chromium, Firefox y WebKit. Cada navegador usa perfil temporal y servidor local aleatorio. Chromium y Firefox realizan recarga offline; en WebKit Linux se comprueba el registro activo del service worker, pero se marca SKIP para la desconexión y para CacheStorage cuando el runner no permite verificarlo. Playwright falla internamente al intentar reload con set_offline. No se atribuye cobertura de desconexión WebKit.
- Cobertura funcional: migración de base v1→v3; fusión que preserva datos existentes; CRUD; reapertura; cuatro salas; 2D; creación de memoria con colección; lector Markdown; enlaces wiki; tour 3D; PWA offline; importación de 1.000 registros; búsqueda; importación repetida sin sobrescrituras; sustitución desde copia; inyección HTML mostrada como texto.
- Se comprueba la ejecución concreta en GitHub Actions antes de marcar la release como aprobada. La existencia del workflow por sí sola no equivale a PASS.

## Riesgos y límites de la certificación

1. Las pruebas usan **datos sintéticos**; no tenemos acceso al backup real del usuario, por lo que su restauración sigue sin verificar.
2. Playwright WebKit en Linux **no es igual** a Safari sobre iPhone; hacen falta ensayos en dispositivos reales.
3. El motor 3D ofrece paseo limitado y selección de objetos, pero todavía no es un simulador 3D complejo con colisiones físicas, editor de arquitectura o mundos extensibles.
4. La exportación tiene límite restaurable de **64 MB**. Bibliotecas superiores exigen otro formato de exportación.
5. No hay servidor ni sincronización entre dispositivos. La instalación PWA conserva el mismo origen web y el mismo almacenamiento por perfil.
6. Markdown es un subconjunto seguro; no renderiza HTML, adjuntos, imágenes externas, tablas ni plugins de terceros.
7. Los objetivos diarios se guardan en localStorage y no en la copia JSON; conocimientos y revisiones sí se conservan.

## Criterio de publicación y STABLE

La promoción a main requiere unit PASS, E2E Chromium PASS, revisión de diff, ausencia de errores de sintaxis y deployment Pages PASS. La etiqueta **STABLE** requiere además compatibilidad manual en Windows 11, Linux Mint, iOS Safari, revisión de accesibilidad e importación de un backup real. Si faltan estos pasos, se publica como **1.0 RC**, no como STABLE.
