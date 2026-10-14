# Comparación ciega de madres VT3 #4/#5

Se cruzaron tres fuentes PRE ya selladas. El nuevo cálculo de exposición reproduce el mapa físico sellado por rango materno. Ningún Top de la aplicación fue cambiado.

| Dos madres elegidas por | Cuaternas físicas medias por turno | Cabezas exactas observadas / referencia | Cortes con coincidencia | p bilateral ajustado (10 métodos) |
|---|---:|---:|---:|---:|
| BASE_1_2 | 30.504 | 0 / 1.754 | 0 | 1.0000 |
| PUESTOS_4_5 | 26.852 | 6 / 1.544 | 5 | 0.1007 |
| D1_PROPIA | 30.061 | 2 / 1.7285 | 2 | 1.0000 |
| D7_PROPIA | 30.287 | 2 / 1.7415 | 2 | 1.0000 |
| DOBLE_RAIZ_PROPIA | 31.191 | 2 / 1.7935 | 2 | 1.0000 |
| BLOQUES_VT3 | 30.504 | 0 / 1.754 | 0 | 1.0000 |
| REUSO_EXACTO_DOS | 29.122 | 0 / 1.6745 | 0 | 1.0000 |
| MEMORIA_HIJAS | 32.443 | 2 / 1.8655 | 2 | 1.0000 |
| MAS_CUATERNAS_CONTROL | 34.73 | 2 / 1.997 | 2 | 1.0000 |
| HASH_NEUTRAL | 28.896 | 5 / 1.6615 | 5 | 0.5404 |

## Casos 4/5 vs madre negativa con exposición más parecida
- 2026-09-24 Previa: 3159 ← #5 159/951, D−1=0, D−7=1, bloques=2, bolsa=12; control #3 bolsa=16
- 2026-10-03 Matutino: 5832 ← #4 238/832, D−1=0, D−7=1, bloques=3, bolsa=12; control #3 bolsa=12
- 2026-10-03 Matutino: 2592 ← #5 295/592, D−1=0, D−7=1, bloques=3, bolsa=12; control #3 bolsa=12
- 2026-10-05 Matutino: 3729 ← #5 729/927, D−1=3, D−7=1, bloques=6, bolsa=20; control #1 bolsa=10
- 2026-10-10 Matutino: 6542 ← #5 456/654, D−1=1, D−7=0, bloques=2, bolsa=14; control #3 bolsa=16
- 2026-10-10 Nocturno: 2654 ← #5 456/654, D−1=1, D−7=0, bloques=2, bolsa=14; control #3 bolsa=16

**Distinción crucial:** aquí se evalúa la elegibilidad de **todas** las hijas físicas de dos madres, no diez selecciones VT4. Los p-valores son descriptivos post hoc, con exploración previa reiterada, no una ventaja demostrada. Consultar RESUMEN.json para meses y señales detalladas.
