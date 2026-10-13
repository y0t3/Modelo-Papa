# Punto de control VT3 — tercer puesto aprendido contra un reemplazo neutral de la misma plaza
**13/10/2026 · Laboratorio concluido en `lab-vt3-control-tercer-puesto-13oct2026`.** Ejecución GitHub Actions [38384181501 — exitosa](https://github.com/y0t3/Modelo-Papa/actions/runs/38384181501).

## 1. Por qué se hizo
La semana X pudo memorizarse con todas sus cabezas VT3 físicamente posibles dentro del Top3 o del Top5 extendido (**60/60 cortes alcanzables**, sin fingir caminos para familias ausentes). Al llevar geometrías aprendidas a X+1, `FUSION_CONSERVADORA` mantuvo los **dos primeros** miembros VT3 originales y propuso una **tercera familia** de fuera del Top10, desplazando al décimo. Esto ocurrió en **los 90 cortes** del examen de tres semanas. La política obtuvo Top3 **4/90** y Top10 **12/90**, frente a Top3 **3/90** y Top10 **11/90** del original, recuperando sólo 21/09 Vespertino con `246/642`.

Esta nueva auditoría pregunta si el +1 tiene una ventaja **frente a cambios NEUTRALES CON EL MISMO NÚMERO DE PLAZAS**; no basta cotejarlo con métodos que reordenan todo el ranking.

## 2. Protocolo, sellos y aislamiento
- Fuente única al construir nuevos PRE: `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/PRE_115.json`, SHA256 `42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e`.
- El workflow retiró físicamente las **demás auditorías históricas** del checkout y generó `PRE_90.json` (lista de las diez familias originales, candidatas físicamente elegibles fuera de ellas, raíces propias, rangos, rutas y clases de cantidad de caminos), `CONTROLES_PRE.json` (semillas/política de 5.000 reemplazos neutrales) y `SELLO.json` (hashes de protocolo, script y PRE).
- Sólo **después** de sellar PRE se recuperaron `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/POST_115.json` y `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/POST_115.json`. El anterior archivo POST contiene la **selección realmente congelada** del experimento semanal: fue generada por aprendizaje de semana anterior, no mirando resultados de ese corte. Todas las listas se verificaron contra `[top1 original,top2 original,tercera aprendida,top3–top9 original]`.
- 90 cortes de tres semanas de examen: **18 fechas completas × cinco turnos**. Los controles conservan las primeras dos y **sólo incorporan una familia físicamente válida de fuera del Top10**, exactamente igual que la política aprendida. No inventan caminos, raíces o cambios de familia VT4. El décimo miembro original sale si entra uno externo.
- Se generaron **5.000 reemplazos neutrales para cada uno de tres estratos**, con semilla fija 20261013: (a) cualquier familia física externa; (b) misma condición anclada/no anclada que el candidato aprendido; (c) mismo anclaje y clase de rutas físicas `1`, `2–3`, `4–7` o `8+`. Las listas de control se obtienen por PRNG xorshift32 determinista y sólo usan etiquetas PRE de la propuesta ya congelada.
- Dos placebos adicionales de **10.000 reasignaciones de jornadas completas**, uno libre y otro manteniendo día semanal. No reordenan individualmente jurisdicciones ni turnos.

## 3. Resultado histórico medido
| Política | Top3 /90 | Top5 /90 | Top10 /90 | Familias terceras que ganaron | Rescates netos Top10 |
|---|---:|---:|---:|---:|---:|
| VT3 original | **3** | **6** | **11** | — | — |
| Aprendizaje geométrico, propuesta congelada | **4** | 5 | **12** | 1 | +1 |
| Mejor anclada del original fuera del Top10 (rango 11) | 3 | 4 | 11 | 0 | 0 |
| Hash fijo, sin elegir por resultados | **4** | 5 | 11 | 1 | 0 |
| Mayor número de rutas físicas propias entre externas | **5** | **6** | **13** | 2 | +2 |

El control de abundancia geométrica obtuvo dos coincidencias Top3 adicionales (28/09 Matutino y 06/10 Vespertino), pero **no** justifica incorporarlo al motor: se prueban numerosas hipótesis sobre las mismas semanas, y cuatro, cinco o trece éxitos son conteos muy bajos. Entre los controles uniformes de presupuesto fijo, lograr al menos **5/90 en Top3** ocurrió en alrededor del **15,26 %** de las 5.000 réplicas físicas uniformes; lograr al menos **13/90 en Top10** ocurrió en **12,62 %**. No hay señal clara de discriminación.

## 4. 5.000 reemplazos neutrales, exactamente la misma plaza
| Control neutral (5.000 Tops completos cada uno) | Top3 promedio | Proporción que alcanzó ≥4 Top3 | Top10 promedio | Proporción que alcanzó ≥12 Top10 |
|---|---:|---:|---:|---:|
| Cualquier candidata física fuera de Top10 | **3,6844** | **49,84 %** | **11,6106** | **46,00 %** |
| Igual anclaje físico-histórico que propuesta | 3,6596 | **48,70 %** | 11,5828 | **44,78 %** |
| Igual anclaje y clase de caminos | 3,5428 | **42,22 %** | 11,4544 | **36,90 %** |

Probabilidad exacta condicional para el recuento de familias ganadoras elegidas en las 90 terceras plazas si se seleccionara uniformemente entre candidatas físicas de cada corte: **0,749** exposiciones; condicionando por anclaje **0,736** y por anclaje+complejidad **0,633**. El alumno obtuvo **una**. Con independencia del control elegido, seleccionar una ganadora alguna vez en 90 cortes **no es extraordinario**. Ningún estrato tiene clase singleton forzada: `0` cortes con sólo una candidata compatible en la clase más fina.

**No hay mejora Top3/Top10 convincente por encima de seleccionar una familia externa neutral.**

## 5. El único rescate aprendido y su respaldo físico
**21/09 Vespertino**, cabezas `9674`, `6250`, `1306`, `5512`, `4246`.

- El único final VT3 físicamente disponible entre estas cabezas fue **`246/642`**.
- Top3 original: `202/202`, `317/713`, `387/783`. Top3 conservador: `202/202`, `317/713`, **`246/642`**.
- `246/642` tenía **una ruta física propia**, una cabeza histórica **D−1** en sus raíces admitidas, **ninguna raíz D−7** y estaba en **rango oficial 42**.
- Bolsa completa: **140** familias externas físicamente válidas, **72** con raíz propia. Sólo **20** eran comparables dentro de su estrato de anclaje y **una ruta**.
- El candidato del rango 11 (`193/391`), el hash (`565/565`) y el mayor número de rutas (`022/220`) no acertaron ese corte.

**Este rescate es físicamente legítimo** y el aprendiz lo propuso antes de conocer las cabezas del examen, pero **la existencia de 140 alternativas** y los controles anteriores muestran por qué no debemos elevarlo a evidencia de pronóstico.

## 6. ¿Qué tan estable era la tercera propuesta?
- **76/90** terceras propuestas estaban ancladas por raíces originales; **14/90** eran físicas sin raíz. No se agregó ninguna raíz a estas últimas.
- Media **122,77** familias externas físicamente disponibles por corte.
- Las familias aprendidas se repitieron a lo largo del tiempo: `253/352` 10 veces, `066/660` 7 veces y `246/642` 6 veces. Que una misma familia aparezca repetidamente puede ser fruto de la estructura geométrica y las hojas, y es útil auditar su frescura, pero **no es por sí mismo un indicio de probabilidad de ganar**.
- **57/90** cortes tenían alguna familia ganadora entre las candidatas externas, con **93** exposiciones ganadoras externas en total. Una sola propuesta externa por corte es un presupuesto estrecho: el azar de acertar una de ellas sigue siendo pequeño.

## 7. Permutaciones completas por fecha
Comparando la diferencia Top3 del alumno frente al oficial (+1):
- 10.000 reasignaciones libres de fechas: cola exploratoria (P(\Delta \ge 1)\approx **0,3305**).
- 10.000 reasignaciones conservando día semanal: cola (P(\Delta \ge 1)\approx **0,3861**).
Las diferencias positivas también aparecen en estos resultados permutados. Además, se ensayaron muchas hipótesis previamente: **no se deben interpretar estas colas como pruebas independientes confirmatorias**.

## 8. Conclusión de este ensayo
**La lógica supervisada Top3/Top5 de la semana X funciona como memoria y reconstrucción física, pero la tercera plaza seleccionada por geometrías positivas de X no demostró una ventaja identificable frente a una tercera externa neutral.**

La fusión aprendida sí generó una nueva candidata físicamente válida y un rescate histórico real: `246/642`. Pero aproximadamente **la mitad** de los controles con una plaza neutral también alcanza **4/90 Top3**, y casi la mitad alcanza **12/90 Top10**. Por tanto, **no agregar un peso de semejanza ni cambiar el Top3/Top10 oficial** con base en este +1. Tampoco promover el simple máximo de rutas por +2 de esta muestra; ese control es exploratorio.

El dato que queda por examinar, sin cambiar la selección, es si los repetidos terceros de aprendizaje provienen de **los mismos casilleros/fuentes heredados entre turnos**, o si son **nuevas evidencias físicas independientes**. Esto podría detectar inercia o dependencia de la representación, aunque no implique capacidad predictiva. Las hojas y rutas PRE ya están guardadas para hacerlo.

**VT3 oficial, sellos, app, hojas y VT4 permanecen intactos.**

## Archivos verificables
- `PROTOCOLO_VT3_CONTROL_TERCER_PUESTO_13OCT2026.md` — preguntas y controles fijados antes de consultar POST.
- `scripts/lab-vt3-control-tercer-puesto.mjs` — algoritmo reproducible.
- `.github/workflows/lab-vt3-control-tercer-puesto.yml`.
- `auditorias/vt3-control-tercer-puesto-90-13oct2026/{PRE_90.json,CONTROLES_PRE.json,SELLO.json,POST_90.json,RESUMEN.json}`.
- [GitHub Actions 38384181501 — ejecución correcta](https://github.com/y0t3/Modelo-Papa/actions/runs/38384181501).
