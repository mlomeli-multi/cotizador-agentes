# Cotizador Agentes

## Proyecto
Cotizador de transporte para operación de freight forwarding en México.

Modos activos:
- `Aéreo Importación (DAP)`
- `Marítimo Importación (DAP)`

Stack actual:
- `HTML / CSS / JS` vanilla en un solo archivo principal
- `Leaflet.js`
- `Chart.js`
- `XLSX.js`
- `localStorage` para persistencia local
- `Google Apps Script` como backend ligero para usuarios, login, cotizaciones y tipo de cambio
- `GitHub Pages` como hosting principal

## Estructura actual
- `index.html` — app principal con HTML, CSS y JS embebidos
- `google-apps-script.js` — referencia del Apps Script desplegado
- `data/cotizador-base.json` — base compartida de tarifas
- `data/tipo-cambio.json` — respaldo compartido de tipo de cambio
- `data/conceptos-destino-maritimos.json` — conceptos destino marítimos por naviera
- `netlify.toml` — legado de deploy; el sitio vigente se valida en GitHub Pages

## Arquitectura importante

### Tarifas compartidas
- La app carga primero la base oficial desde `data/cotizador-base.json`
- Esa base ya no debe mezclarse con el tipo de cambio

### Tipo de cambio compartido
- La app intenta leer `getTipoCambio` desde Apps Script
- Si Apps Script no responde con tipo de cambio, cae al respaldo `data/tipo-cambio.json`
- El tipo de cambio se publica desde la app sólo por usuarios autorizados

### Conceptos marítimos destino
- Se cargan desde `data/conceptos-destino-maritimos.json`
- Son una capa separada del tarifario marítimo base
- Se usan sólo para `DAP Marítimo`

## Control de acceso

### Roles
- El login funciona contra Apps Script
- Los usuarios se leen desde Google Sheets
- Se cachean usuarios en Apps Script y también en frontend para mejorar tiempos de carga

### Autorización especial
- Sólo el usuario de Miguel puede administrar tarifas compartidas y tipo de cambio compartido
- En frontend se usa `isTariffManager()` con:
  - `miguel`
  - `miguel lomeli`

## Apps Script actual
- Deployment vigente:
  - `https://script.google.com/macros/s/AKfycbyKOQ_PWGjTyAmWFqCSs6iUY--YAKT_PmliRCm-3uI81_wBeyRgXj1xAMvmcOWBDwEi/exec`
- Soporta:
  - `login / usuarios`
  - `cotizaciones`
  - `getTipoCambio`
  - `guardarTipoCambio`
  - hoja `Configuracion`
- Optimización aplicada:
  - caché de usuarios por `180 segundos`
  - invalidación de caché al crear / editar / desactivar usuarios

## Estado actual del cotizador

### Aéreo
- Flujo DAP aéreo funcional de punta a punta
- Nuevos proveedores integrados en la base compartida:
  - `Birlesti Express`
  - `Sandoval`
  - `Ramce`
  - `Raymon Pack`
- Resumen de costos por aeropuerto ya integrado
- Calculadora aérea ya contempla:
  - flete terrestre aeroportuario
  - costos aeroportuarios por aeropuerto
  - resumen de venta
  - resumen de cotización
- Resumen de cotización aéreo con:
  - tabs `EN / ES`
  - estilos `Oficial / Brenda / Rodrigo`
  - botón `Copiar correo`
- Reglas comerciales activas:
  - AWB Release:
    - `NLU / MEX` = `USD 100`
    - `MTY` = `USD 130`
    - `GDL` = `USD 160`
  - Entry to Airport = `USD 45`
  - TT:
    - más de `900 km` = `1-2 days transit`
    - hasta `900 km` = `1 day transit`
- UX/UI aérea ya migrada a flujo por pasos:
  - `Ruta`
  - `Carga`
  - `Proveedor`
  - `Venta`
- `Resumen operativo` lateral sticky en desktop

### Marítimo
- Flujo `DAP Marítimo` activo y funcional
- Ranking `Top 3 Single` y `Top 3 Full`
- Selección independiente de `Single` y `Full`
- Mapa y calculadora marítima funcionando
- Importación de tarifarios por Excel ya integrada
- Corrección aplicada a vigencias raras de Excel tipo:
  - `1/1/46387`
- La normalización de vigencias ya quedó reflejada también en la base compartida
- UX/UI marítima ya alineada por pasos:
  - `Ruta`
  - `Comparador de opciones`
  - `Cargos en destino por naviera`
  - `Venta`

## Fase 2 marítima: cargos en destino por naviera

### Objetivo
Meter los `destination charges` de naviera al flujo marítimo sin mezclarlos con tarifas base ni con tipo de cambio.

### JSON vigente
- `data/conceptos-destino-maritimos.json`

### Qué hace hoy
- Selector de `Cargos en destino por naviera`
- Botón `Sin naviera`
- Lista de cargos seleccionables por naviera
- Botón `Seleccionar todo / Limpiar selección`
- Depósitos y garantías visibles aparte, fuera del total DAP
- Carga inicial de navieras y conceptos desde el JSON compartido

### Reglas implementadas
- Los conceptos `BL` y `CONT` sí aparecen para selección
- Depósitos / garantías no entran al total DAP
- El impuesto de cada concepto respeta la columna `F` del Excel:
  - `más IVA 16` suma impuesto
  - `incluido / inc / N.A.` no suma extra

## Armado comercial marítimo actual

### Estructura
- Lado izquierdo:
  - cargos destino por naviera
- Lado derecho:
  - resumen comercial
- Bloque inferior:
  - `Venta`
  - `Resumen de cotización`

### Bloque de venta
- Ya no hace scroll automático al actualizar
- `Selección base por contenedor` muestra la base `Single` y `Full`
- `Destination Charges` se muestran en tabla
- Los cargos destino permiten:
  - editar `MUB %`
  - editar `Venta`
  - mandar el renglón a `Costo`

### Comportamiento del botón `Costo`
- Sólo aparece en cargos destino
- Rojo cuando está apagado
- Verde cuando está activo
- Cuando está activo:
  - `MUB %` visible en `0`
  - `Venta` visible en `0`
  - utilidad en cero
- Si el usuario vuelve a editar campos, se recupera el modo manual

### Resumen de cotización marítimo
- Vive debajo de la calculadora
- Está pensado para copy/paste a correo
- Usa la venta actual de la calculadora, no sólo costos base
- Resume:
  - `Service Details`
  - `Destination Charges`
  - `Inland Freight`

## Decisiones importantes que no deben revertirse
- No volver a mezclar `cotizador-base.json` con `tipo-cambio.json`
- Mantener separado el JSON de conceptos destino marítimos
- Si algo no se refleja en Pages, primero probar `Ctrl + F5`
- No volver a depender de abrir archivos locales sueltos para validar `fetch`; revisar siempre servido desde Pages

## UX ya consolidada
- Login más rápido por caché
- Recarga manual de usuarios
- Último usuario recordado en navegador
- Errores de login más claros
- Modo admin y modo tariff manager separados
- Publicación de tipo de cambio compartido desde la app
- DAP aéreo y DAP marítimo ya usan un lenguaje visual más consistente por pasos

## Archivos / datos clave para futuras iteraciones
- `index.html` concentra casi toda la lógica
- `data/cotizador-base.json` es crítico y estable
- `data/tipo-cambio.json` es respaldo, no fuente primaria cuando Apps Script responde
- `data/conceptos-destino-maritimos.json` seguirá creciendo por naviera

## Riesgos / recordatorios técnicos
- No hay suite automatizada de pruebas UI; después de cambios grandes conviene smoke test manual en navegador
- `index.html` es monolítico; cualquier ajuste visual puede tocar lógica si no se edita con cuidado
- GitHub Pages puede tardar en reflejar cambios
- Un `Ctrl + F5` suele resolver la mayoría de efectos de caché
- Los cambios recientes en aéreo y marítimo son sensibles a UI y flujo, así que conviene validar siempre en navegador después de publicar
