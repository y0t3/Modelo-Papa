# Punto de control — madres VT3 #4/#5 y controles físicos 13/10/2026

**Rama:** `lab-vt3-madres-45-huellas-comparadas-13oct2026`.
**GitHub Actions:** [#38496871638](https://github.com/y0t3/Modelo-Papa/actions/runs/38496871638) — finalizada correctamente.
**Motor y app:** `main`, `src/motorLalo.ts`, rankings oficiales y sellos anteriores sin modificaciones.

## Qué se comprobó

Tres conjuntos PRE ya congelados y sus sellos SHA-256 permitieron rescatar, para cada uno de 115 cortes, el detalle de las cinco primeras madres VT3: rutas/bloques, raíces ganadoras D−1/D−7, repetición de geometría, hijas VT4 físicas y formas históricas de hijas. El universo PRE de las madres #1–3 y el incremento correspondiente a #4–5 **coincide exactamente** con el mapa físico completo de 10.000 números por corte ya sellado.

Se eligieron **dos madres por corte** mediante diez métodos fijos antes de cotejar POST. Las cabezas incluidas reflejan todas las cuaternas físicas de esas dos madres, no un Top10 de hijas ni predicciones nuevas.

| Política | Cuaternas elegibles medias/corte | Cabezas exactas observadas | Referencia aleatoria ilustrativa | Cortes con acierto |
|---|---:|---:|---:|---:|
| Madres #1 y #2 | 30,50 | 0 | 1,754 | 0 |
| Madres #4 y #5 | 26,85 | **6** | **1,544** | **5** |
| Más raíces D−1 | 30,06 | 2 | 1,729 | 2 |
| Más raíces D−7 | 30,29 | 2 | 1,742 | 2 |
| Ambas raíces | 31,19 | 2 | 1,794 | 2 |
| Más bloques VT3 | 30,50 | 0 | 1,754 | 0 |
| Reuso de ruta | 29,12 | 0 | 1,675 | 0 |
| Memoria de hijas VT4 | 32,44 | 2 | 1,866 | 2 |
| Mayor bolsa física | 34,73 | 2 | 1,997 | 2 |
| Control hash neutral | 28,90 | **5** | 1,662 | 5 |

`PUESTOS_4_5`: p bilateral exploratorio ajustado por diez métodos = **0,1007**. El control neutral acertó cinco cabezas, así que el resultado NO prueba ventaja causal de la posición VT3.

## Las seis cuaternas físicamente alcanzables desde madres #4/#5

| Fecha/turno | Cabeza | Madre VT3 propia | Puesto | Raíces madre D−1 / D−7 | ¿Huella ganadora D−1/D−7 en la hija concreta? |
|---|---|---|---:|---|---|
| 24/09 Previa | 3159 | 159/951 | 5 | 0 / 1 | No |
| 03/10 Matutina | 5832 | 238/832 | 4 | 0 / 1 | Sí, D−1 exacta |
| 03/10 Matutina | 2592 | 295/592 | 5 | 0 / 1 | Sí, D−7 por forma |
| 05/10 Matutina | 3729 | 729/927 | 5 | 3 / 1 | No |
| 10/10 Matutina | 6542 | 456/654 | 5 | 1 / 0 | No |
| 10/10 Nocturna | 2654 | 456/654 | 5 | 1 / 0 | No |

**Observaciones:**
- **5/6** cabezas recuperables vinieron de una madre en #5, sólo una de #4. La madre `456/654` apareció dos veces el mismo 10/10; son dos cabezas/cortes, **no dos familias maternas independientes**.
- En **4/6** hijas exactas acertadas, la extensión VT4 no reproducía una forma ganadora anterior D−1/D−7, aunque su madre VT3 sí estaba respaldada. **No es válido exigir memoria ganadora propia de hija como condición universal**.
- La memoria ganadora de la madre y la memoria ganadora de una hija concreta **pueden proceder de períodos distintos**: el 03/10 `238/832` estaba respaldada por D−7 y `5832` mostraba una huella exacta D−1.
- Las madres negativas con similar tamaño de bolsa eran a menudo de #3, con raíces y bloques parecidos, y NO dieron coincidencia. **Cantidad de raíces, abundancia y forma geométrica genérica no bastaron para discriminar de manera consistente**.

## Estabilidad temporal

Septiembre (70 cortes): madres #4/#5, **1 observada / 0,927 esperadas**.
Octubre (45 cortes): **5 observadas / 0,617 esperadas**.
Esa concentración reciente surgió dentro de una muestra muchas veces explorada. No puede tratarse como prueba prospectiva.

## Decisión experimental

1. **No elevar automáticamente** #4/#5 ni penalizar #1–3 en `main`.
2. **No reordenar** VT3 por número bruto de raíces D−1/D−7 ni por más caminos/bloques: los controles de dos madres no se beneficiaron.
3. Investigar primero **qué distingue las ternas VT3** cuando las cabezas exactas están realmente disponibles; no confundir acertar una terna con extender a la cuarta cifra.
4. Construir un único criterio simple y congelarlo para sorteos *nuevos, aún no conocidos* antes de intentar mejorar el Top3/Top10. Mantener controles de tamaño de bolsa y plazos, sin optimizar reiteradamente sobre estos 115 cortes.

## Archivos de auditoría

- `PROTOCOLO_VT3_MADRES_45_HUELLAS_13OCT2026.md`
- `scripts/lab-vt3-madres-45-huellas.mjs`
- `auditorias/vt3-madres-45-huellas-115-13oct2026/PRE_115.json` y `SELLO.json` (commit previo al POST)
- `auditorias/vt3-madres-45-huellas-115-13oct2026/POST_115.json`, `RESUMEN.json`, `LECTURA.md`.

**Advertencia:** la referencia nula supone cinco cabezas uniformes independientes; es un control de exposición, no una validación del mecanismo de quiniela. El análisis de estos 115 cortes fue guiado parcialmente por resultados conocidos y no debe presentarse como predicción externa.