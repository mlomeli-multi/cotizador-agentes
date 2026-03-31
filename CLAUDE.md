# Cotizador Agentes

## Proyecto
Cotizador dinámico de tarifas de transporte terrestre para logística/freight forwarding en México.
Stack: HTML/CSS/JS vanilla, Chart.js, Leaflet.js, XLSX.js. Sin backend, localStorage para datos.

## Estructura
- `index.html` — App principal (HTML + CSS + JS embebidos)
- `netlify.toml` — Config de deploy en Netlify

## Convenciones
- Todo en español (UI y comentarios)
- CSS embebido en `<style>` dentro de index.html
- JS embebido en `<script>` dentro de index.html
- Paleta: navy (#1e3a5f), blue (#2563eb), green (#10b981), amber (#f59e0b), red (#ef4444)
- System font stack
- Cards con border-radius: 12px
- Responsive design

## Modalidades
1. Aéreo Importación (DAP) — activa
2. Marítimo Importación (DAP) — pendiente

## Tipos de unidad de transporte
| Tipo | Max Payload | L x W x H (cm) |
|------|-------------|-----------------|
| 1 Tonelada | 900 kg | 190 x 150 x 150 |
| 3.5 Toneladas | 3,200 kg | 315 x 225 x 180 |
| Rabón (5 Ton) | 5,900 kg | 600 x 240 x 215 |
| Tortón (10 Ton) | 9,900 kg | 700 x 250 x 245 |
| Caja Seca 53' | 19,500 kg | 1585 x 238 x 238 |

## Aeropuertos
NLU (Nuevo Laredo), MEX (CDMX), MTY (Monterrey), GDL (Guadalajara)

## Registro de trabajo

### Hecho por Claude
- Commit `f30d0b7`: rediseño de la sección de carga con soporte multi-pallet.
- Commit `779c07c`: mejora del algoritmo de cubicaje para elegir unidad.
- Commit `258682e`: alta de usuarios, login e historial de cotizaciones con Google Sheets.
- Commits `3cf9c50` y `c81b367`: ajuste de comunicación con Google Apps Script usando `POST` + `URLSearchParams`.

### Hecho por Codex
- Diagnóstico del fallo real de login: la URL actual de Apps Script responde con login de Google / `401`, así que el problema principal es de despliegue/permisos del web app, no de la hoja `Usuarios`.
- Mejora del frontend para detectar cuando Apps Script devuelve HTML, redirección a Google o `401/403`, y mostrar un mensaje explícito en el login en lugar de solo `Error al cargar usuarios`.
- Aclaración en `google-apps-script.js` de los permisos correctos de despliegue: ejecutar como tu cuenta y acceso `Cualquier persona`.
- Validación del nuevo deployment público: ya responde JSON, pero devuelve `Hoja Usuarios no encontrada`, señal de que el Apps Script no está apuntando al spreadsheet correcto.
- Soporte en `google-apps-script.js` para configurar un `SPREADSHEET_ID` explícito cuando el web app sea standalone.
- Actualización del frontend para usar el URL público más reciente del Apps Script compartido por el usuario.
- Configuración del `SPREADSHEET_ID` con el archivo `Cotizador Agentes DB` compartido por el usuario: `1EzBWkmi9PqjgnZ_C1iDlzRWnqTJvhsuL4Z5s3LMgYiE`.

### Estado actual del login
- La hoja `Usuarios` luce correcta y los nombres/PIN/roles están bien estructurados.
- El web app ya es público y responde; el problema restante es que no está leyendo el Google Sheet correcto.
- Si el Apps Script no está ligado a la hoja, hay que pegar el ID del spreadsheet en `SPREADSHEET_ID`, volver a desplegar y usar la URL `/exec` actualizada.
