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
