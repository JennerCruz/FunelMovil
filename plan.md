# Funel Móvil — plan de implementación

## Alcance

Construir una aplicación móvil Expo/React Native/TypeScript en español a partir de `FunelPerLuis.xlsx`. La app será un frontend operativo con datos iniciales locales: consulta rápida por DN celular, panel de indicadores, listado filtrable, detalle de movimientos y registro de nuevos movimientos. La primera versión no depende de una API externa; el libro se transforma a un módulo TypeScript local y las altas viven en el estado de la sesión.

## Fuente de datos y modelo

- `data/workbook.json` conserva la extracción completa de las hojas no vacías del libro original.
- `data/funel-data.ts` expone movimientos normalizados, catálogos maestros, indicadores de `Hoja1` y `Hoja2`, enlaces de `INICIO` y metadatos de la fuente.
- La pantalla de movimientos usa los encabezados de `Base_Datos_Movimientos` y los menús de `Config_Catalogos`.
- Los nuevos registros reciben un ID `OPE-LOCAL-###`, fecha actual y `CODIFICADO = SI` al guardarse. Se agregan al estado local sin sobrescribir el archivo original.
- Las métricas visibles se recalculan desde la lista actual y se combinan con el snapshot diario de `Hoja1` para mantener el contexto del Excel.
- La tarjeta `ONEDRIVE / SHAREPOINT` acepta un enlace compartido de OneDrive/SharePoint. El servidor descarga y parsea el XLSX con SheetJS, reconoce la hoja de movimientos y los catálogos, y reemplaza la fuente local sin alterar la interfaz.
- La fuente compartida se conserva en el almacenamiento local de la app y se vuelve a consultar cada 60 segundos. La acción manual “Cargar y sincronizar” permite forzar la actualización. Si falla la fuente remota, la app conserva la última información cargada y muestra el error en la tarjeta de conexión.
- `data/daily-summary.ts` calcula el reporte por fecha: atención general excluye `TELEMARKETIN`; TLMK se distribuye por `$60`, `$90`, `$100`, migraciones y otras TLMK; JUMP cuenta `JUMP`/`HÍBRIDO`; POS, terminales, ventas, extras, conversiones, citados y efectividad se derivan del texto de cada fila.

## Navegación y estructura

- `app/(tabs)/index.tsx`: pantalla única operativa con cuatro vistas internas: Resumen, Movimientos, Diario y Catálogos; evita una navegación profunda y mantiene el uso con una mano.
- `components/record-form.tsx`: formulario modal de alta con validación mínima de DN y menús en cascada.
- `components/record-detail.tsx`: detalle completo del movimiento seleccionado.
- `components/daily-summary.tsx`: ficha diaria inspirada en la imagen de referencia, con selector de fecha y bloques TLMK/POS/terminales/ventas.
- El reporte diario usa una composición tabular de dos columnas, encabezado violeta y bloques de color amarillo, verde, azul, rojo, morado y lila para reflejar la tabla de referencia en pantalla móvil.
- `components/portal-browser.tsx`: navegador del portal operativo fijo. En Android/iOS usa `react-native-webview` con autocompletado de los datos proporcionados; en web/Preview usa `expo-web-browser` como respaldo seguro.
- `data/funel-data.ts`: tipos, datos y funciones derivadas.
- `data/daily-summary.ts`: reglas de conteo y porcentajes del reporte diario.
- `data/workbook-types.ts`: contrato de datos para la fuente remota.
- `data/workbook.json`: respaldo local fiel a las filas extraídas del XLSX.
- `server/onedrive.ts` y `/api/onedrive/load`: descarga segura de enlaces compartidos, lectura XLSX y normalización.
- `app/(tabs)/_layout.tsx`: pestañas inferiores en español.

## Diseño — Archivo Vivo

### Alternativas consideradas

- **Terminal de Campo** (0.07): bloques compactos y contraste firme para operación rápida.
- **Archivo Vivo** (0.05, elegida): fichas editoriales sobrias que reinterpretan el libro Excel como un archivo móvil consultable.
- **Pulso Neón** (0.08): tablero oscuro con estados luminosos y énfasis en métricas.

### Dirección elegida

- **Movimiento:** editorial utilitario, inspirado en tarjetas de expediente y dashboards de operaciones, no en una hoja de cálculo literal.
- **Principios:** jerarquía numérica clara; acciones primarias siempre visibles; densidad controlada; estados con color y texto, nunca solo color.
- **Color:** azul pizarra `#355070` como firma de control y trazabilidad; verde menta `#6DCCB5` para confirmaciones y datos vivos; fondo marfil `#F7F5F0`; ámbar `#D99A2B` para pendientes; tinta `#1E2A32`.
- **Layout:** encabezado con contexto y búsqueda, seguido de un rail horizontal de métricas y un flujo vertical de fichas; filtros en chips desplazables y formulario en hoja modal.
- **Elementos distintivos:** banda lateral menta en registros codificados; etiqueta de fuente `XLSX LOCAL`; separadores finos tipo archivador; punto de estado que acompaña a cada métrica.
- **Interacción:** pulsaciones amplias, feedback háptico del starter, búsqueda con resultado inmediato y CTA fijo de “Nuevo registro”. Los filtros se pueden limpiar sin perder el contexto.
- **Animación:** transiciones suaves de opacidad y desplazamiento corto al cambiar vistas; no usar animaciones decorativas que ralenticen captura de datos.
- **Tipografía:** Alegreya Sans para titulares y numerales expresivos; sistema sans nativo para campos y lectura larga. Tamaños: 30 para título de sección, 22 para métricas, 15 para cuerpo, 11 para metadatos.
- **Esencia:** “El expediente operativo del día, listo para encontrar una línea y seguir con la gestión.” Personalidad: preciso, sereno, resolutivo.
- **Voz:** microcopy directo y contextual. Ejemplos: “Busca una línea y abre su historial.” / “Registro guardado en la sesión local.”
- **Marca:** wordmark “funel.” en minúsculas con un punto menta como marca de continuidad; el logo nativo conserva el icono del starter hasta generar un asset dedicado.
- **Color propio:** `#6DCCB5`, usado con moderación en estados activos y acciones de confirmación.

## Implementación

1. Mantener el starter Expo fijo y sustituir la pantalla de ejemplo por el panel operativo.
2. Añadir tipos, datos normalizados, funciones de catálogo y métricas calculadas.
3. Añadir formulario y detalle como componentes reutilizables.
4. Configurar pestañas: Resumen, Movimientos y Catálogos.
5. Validar con `pnpm check`, `pnpm lint`, `pnpm db:push`; arrancar Metro/API en sus puertos fijos y verificar el manifiesto de rutas si aplica al runtime web.
