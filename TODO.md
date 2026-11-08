# TODO — Funel Móvil

## Datos locales derivados del libro

- [x] Incorporar los datos iniciales de `FunelPerLuis.xlsx` como fuente local dentro de la app, conservando los nombres y valores relevantes de `INICIO`, `Base_Datos_Movimientos`, `Config_Catalogos`, `Hoja1` y `Hoja2`.
- [x] Mantener una estructura tipada para movimientos, catálogos, indicadores y metadatos de la fuente para que el frontend no dependa de celdas dispersas.

## Consulta operativa

- [x] Incluir búsqueda rápida de registros por DN celular, con resultados claros y acceso al detalle asociado.
- [x] Mostrar un panel de resumen con los indicadores operativos principales derivados de los datos locales.
- [x] Mostrar un listado de movimientos con filtros basados en los campos y catálogos disponibles en el libro.
- [x] Incluir una vista de detalle para consultar la información completa de cada movimiento o gestión.
- [x] Añadir una pestaña `Diario` donde se pueda elegir una fecha y ver el resumen operativo con ejecutivo `Eduardo Cruz`, atención general sin `TELEMARKETIN`, TLMK por monto, JUMP por `HÍBRIDO`, POS, terminales, ventas, conversiones, citados y efectividad.

## Fuente compartida de OneDrive

- [x] Permitir pegar un enlace compartido de OneDrive o SharePoint para cargar cualquier libro XLSX accesible por ese vínculo.
- [x] Reemplazar la fuente local con los movimientos, catálogos, hojas y snapshots reconocidos del libro remoto sin cambiar el diseño visual existente.
- [x] Guardar el vínculo localmente y consultar de nuevo el archivo cada 60 segundos, además de ofrecer sincronización manual y retorno a la fuente local.

## Reporte visual y portal operativo

- [x] Presentar el reporte Diario como tabla de dos columnas, con encabezado de fecha/CAC/ejecutivo/tipo de flujo y bloques coloreados similares a la imagen de referencia.
- [x] Añadir la pestaña Navegador con el portal operativo fijo, acceso configurado y WebView integrado en dispositivos móviles; en Preview/web se abre mediante el navegador seguro del sistema.

## Registro y experiencia móvil

- [x] Incluir un formulario móvil para registrar nuevos movimientos con validaciones y menús de selección alimentados por `Config_Catalogos` y las demás hojas aplicables.
- [x] Actualizar localmente la información visible durante el uso de la app al registrar nuevos movimientos.
- [x] Mantener navegación, componentes y acciones adaptados a pantallas móviles en orientación vertical, con interfaz íntegramente en español.

## Calidad de entrega

- [x] Configurar el branding de proyecto y comprobar diagnósticos TypeScript.
- [x] Ejecutar comprobaciones estáticas y validar que Metro/API arranquen en los puertos fijos del starter.
