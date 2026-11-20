# MNEMOSYNE-404 — Palacio de memoria

**Estado: candidato a 1.0, no certificado STABLE.** Aplicación web local-first y sin cuenta para organizar conocimientos, enlazar notas y repasar lo aprendido. Conserva las cuatro salas originales, sus objetos y la identidad visual. Los conocimientos se guardan en IndexedDB y no salen del navegador.

**Abrir en la web:** https://ivan7800.github.io/MNEMOSYNE-404/

## Empezar

- **Windows:** ejecutar ABRIR_MNEMOSYNE.bat con Python 3 instalado.
- **Linux Mint / Linux:** ejecutar python3 INICIAR_SERVIDOR.py desde la carpeta del proyecto.
- **Servidor / Pages:** servir el repositorio por HTTP(S). No abrir index.html mediante file://.
- En WebGL puedes girar el palacio con el ratón o activar **Explorar a pie**. WASD desplaza; flechas orientan; E interactúa; Esc vuelve al vestíbulo cuando no hay diálogos abiertos. Hay controles táctiles para el recorrido.
- **Modo 2D** ofrece una alternativa navegable sin WebGL.

## Organizar y leer

1. Selecciona una sala y, si quieres, uno de sus objetos.
2. Crea una memoria con título, contenido y etiquetas. Una **colección** opcional ayuda a clasificar por materias o proyectos; puedes crearla escribiendo su nombre.
3. El editor soporta Markdown **básico**: títulos, párrafos, listas, bloques de código y negrita. Usa [[Título de otra memoria]] para relacionar notas; desde **Leer** aparecen enlaces y referencias entrantes. El contenido se muestra como texto seguro, **nunca se ejecuta HTML de las notas**.
4. Busca por términos, etiqueta o colección y ordena alfabéticamente o por fecha. La lista se pagina en bloques de 60 resultados.

Las salas predeterminadas no se pueden añadir ni eliminar. Los objetos personalizados siguen limitados a 12 por sala. **No hay adjuntos ni sincronización con servicios externos**.

## Aprender

**Recorrer sala** permite estudiar las memorias ligadas a sus objetos. **Repasar pendientes** utiliza intervalos adaptativos con tres grados; cada repaso añade un histórico portátil y actualiza el panel de repeticiones, tasa de recuerdos y objetivo diario. El objetivo diario es una preferencia local del navegador y no forma parte de la copia JSON.

## Datos, privacidad y recuperación

**Es fundamental exportar con frecuencia.** IndexedDB está ligada al origen web y al perfil del navegador: cambiar de equipo, de navegador, de localhost a GitHub Pages o borrar datos del sitio no traslada las notas.

- **Exportar JSON** crea una instantánea coherente de memorias, enlaces, objetos y repasos. Verifica que el fichero se ha descargado y conserva otra copia fuera del equipo.
- **Importar JSON** ofrece: añadir sin conflictos, omitir IDs duplicados sin sobrescribir, o sustituir toda la biblioteca (destructivo, confirmación adicional). Antes de sustituir se ofrece un nuevo respaldo, pero **tú debes comprobar que existe**.
- Formato de copia v3, retrocompatible con backups v1/v2. Máximo **64 MB**, **10.000 memorias**, **50.000 vínculos**, **48 objetos**. Puede ser necesario dividir bibliotecas que excedan el tamaño de archivo; no se truncan silenciosamente.
- **Importar MD / conocimiento JSON** crea notas nuevas. **Exportar conocimiento** no es un respaldo completo de vínculos, objetos o repasos.
- La PWA guarda en caché los archivos estáticos de la aplicación; no envía notas a ningún servidor. Al primer uso necesita conexión. La disponibilidad de «Instalar» depende del navegador.

## Validación

La CI ejecuta Node 22 y E2E Playwright con perfiles temporales aislados para Chromium, Firefox y WebKit. Incluye migración v1→v3, CRUD, persistencia, importación con 1.000 memorias, filtrado, seguridad HTML y prueba offline. No usa el perfil real del usuario.

Comandos: node --test tests/*.test.mjs ; python3 -m pip install playwright==1.56.0 ; python3 -m playwright install chromium ; python3 tests/e2e_local.py .

Consulta [criterios de aceptación](docs/ACCEPTANCE.md), [registro de QA 1.0](docs/QA-1.0-RC.md) e [historial](docs/HISTORIAL-ALPHA.md).

**Limitaciones para certificar STABLE:** faltan pruebas manuales reales de Windows 11, Linux Mint, iOS Safari, accesibilidad con lectores de pantalla, uso prolongado y restauración desde un backup personal real. Las pruebas automatizadas no equivalen a esas comprobaciones.
