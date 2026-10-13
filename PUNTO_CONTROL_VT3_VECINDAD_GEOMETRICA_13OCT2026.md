# Punto de control VT3 — vecindad geométrica y control del cupo físico
**13 de octubre de 2026** · Rama experimental `lab-vt3-vecindad-geometrica-13oct2026` · [GitHub Actions 38362837345 (correcta)](https://github.com/y0t3/Modelo-Papa/actions/runs/38362837345).

## Pregunta y verificación
Se conservaron las **mismas** 7.403 exposiciones de familias físicamente elegibles sin raíz histórica de los 115 cortes (promedio 64,37 por corte, 110 cortes con alguna elegible). No se añadieron nuevas familias ni se cambiaron sus rutas, fuentes, anclajes históricos o definiciones de familias reversible. Se reservó **exclusivamente el puesto 10** del ranking; las nueve familias originales superiores permanecen inmutables en cada corte.

El generador PRE leyó los testigos físicos originales `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json` y la lista elegible del experimento anterior `auditorias/vt3-cupo-fisico-controles-115-13oct2026/PRE_115.json`. Todos los POST relacionados estuvieron físicamente apartados hasta producir `PRE_115.json`, `NOCTURNA_PRE.json` y `SELLO.json`; el workflow luego los restauró para medir aciertos y controles. Los testigos se validaron como caminos de tres celdas distintas y físicamente adyacentes, siempre dentro de la misma fuente.

Se admitieron **contactos geométricos** con trayectos anclados de otras familias SOLO cuando estos trayectos tienen efectivamente raíz propia `rootIds`: segmento común de dos celdas, casillero central/pivote común con bloque diferente, bloque entero de tres celdas compartido, cantidad de familias vecinas, fuentes distintas de contacto y densidad por bloque. **Una vecina anclada nunca presta su raíz** a una candidata no anclada; las cifras de contacto no se convierten en probabilidad.

## Universo PRE completo
| Propiedad física de la candidata elegible | Exposiciones candidatas | Exposiciones ganadoras observadas |
|---|---:|---:|
| Alguna vecina anclada compartiendo tramo de 2 celdas | 6.239 | 58 |
| Pivote central común con recorrido anclado en otro bloque | 5.112 | 44 |
| Algún bloque idéntico al de familia anclada distinta | 2.526 | 18 |
| 2+ familias vecinas ancladas por tramo | 5.564 | No puntuadas por separado |
| **Sin** contacto por tramo con ancladas | 1.164 | 10 |
| Sin ningún pivote con ancladas | 2.291 | 24 |
| Sin bloque de tres compartido con ancladas | 4.877 | 50 |

Las fracciones descriptivas de ganadoras por exposición no favorecen nítidamente contactos crecientes: 58/6.239 = 0,93% con vecino por tramo, frente a 10/1.164 = 0,86% sin vecino; 18/2.526 = 0,71% con bloque anclado compartido, frente a 50/4.877 = 1,03% sin ello. Los registros de una misma jornada no son independientes y el mismo sorteo produce varias familias: esos porcentajes son **sólo descriptivos**, no probabilidades para futuros sorteos.

## Rankings con una única plaza libre (puesto 10)
| Regla experimental | Top3 | Top5 | Top10 | Corte(s) recuperado(s) respecto al oficial |
|---|---:|---:|---:|---|
| ORIGINAL | 5 | 8 | 15 | — |
| BASE_RENOVADA, última fuente + bloques | 5 | 8 | **18** | 30/09 N, 01/10 M, 03/10 V |
| G_PIVOTE (más vecinas con pivote central común) | 5 | 8 | 16 | 16/09 M |
| G_VECINOS (más familias ancladas vecinas) | 5 | 8 | 16 | 21/09 Primera |
| G_FUENTES (más fuentes con contacto) | 5 | 8 | 16 | 03/10 V |
| G_BLOQUE (más familias con bloque de 3 celdas idéntico) | 5 | 8 | 16 | 01/10 M |
| G_DENSIDAD (más vecinas por bloque) | 5 | 8 | **17** | 16/09 M, 06/10 N |
| G_UMBRAL2 (al menos 2 vecinas, luego densidad) | 5 | 8 | **17** | 16/09 M, 06/10 N |
| CONTROL_BLOQUES (más bloques, sin geometría) | 5 | 8 | **17** | 01/10 M, 03/10 V |
| CONTROL_HASH (selección por hash fijo) | 5 | 8 | 15 | — |
| CONTROL_SIN_VECINOS (primero cero vecinas) | 5 | 8 | 15 | — |

**Ningún criterio de proximidad geométrica mejoró `BASE_RENOVADA` (18/115)**. Las reglas con más densidad geométrica dieron 17/115 igual que el control simple por cantidad de bloques (también 17/115), sin rescatar el mismo conjunto de cortes. Aunque todos superaron o igualaron 15/115 en esta muestra, ello se debe en parte al hecho ya observado de que el **puesto 10 original acertó cero veces**: reemplazarlo en 115 cortes no pudo restar coincidencias históricas. Ninguna de estas políticas demostró superioridad estadística fuera del corpus explorado.

La distribución de **2.000 elecciones uniformes PRE**, idénticas y selladas en laboratorio anterior, tuvo media Top10 15,8185. Fracciones que igualaron/superaron 16, 17 y 18 aciertos: 55,7%; 19,6%; 5,05% respectivamente. Importa evaluar contra BASE_RENOVADA y contra esos controles, **no sólo** contra el Top original.

### Reasignación de fechas como control negativo
10.000 permutaciones de **jornadas enteras** y 10.000 adicionales de jornadas del mismo **día de la semana**, sin cambiar PRE. Las diferencias de cada regla geométrica contra BASE_RENOVADA fueron **negativas**: pivotes -2 cortes, vecinos -2, fuentes -2, bloque -2, densidad -1, umbral2 -1. En lugar de presentar colas favorables de reglas previamente seleccionadas por las fechas, queda registrado que **ninguna supera a la base**; las colas unilaterales para igualar/superar esas diferencias negativas son altas (libres: ≥0,895 para G_DENSIDAD, ≥0,969 para G_PIVOTE y G_VECINOS; mismo día semana ≥0,83 y ≥0,918). Se conservaron en `RESUMEN.json` todos los controles, incluidos otros negativos.

### Estabilidad temporal
- Septiembre: original 10/70, BASE 11/70, PIVOTE 11/70, VECINOS 11/70, DENSIDAD 11/70, BLOQUES 10/70.
- Octubre: original 5/45, BASE 7/45, PIVOTE 5/45, VECINOS 5/45, DENSIDAD 6/45, BLOQUES 7/45.
- Vespertino sigue mal cubierto; base y control por bloques recuperan sólo 1/23 en ese turno.
- La ausencia de mejora y los cambios septiembre/octubre no justifican seleccionar ganadoras a posteriori.

## Nocturna del 12/10: explicación precisa de 851
Esta Nocturna ya era conocida al iniciarse los experimentos; el PRE del laboratorio es **reproducción histórica**, no el auténtico Top sellado a las 18:56. En el mismo conjunto elegible había **97 familias** físicas sin raíz transferida; entre ellas `158/851`.

- `158/851` tenía **1 camino en 1 bloque y 1 fuente**, 8 familias ancladas vecinas por segmento, 2 vecinas con pivote central y ningún bloque de tres celdas compartido. Llevaba dos turnos presente desde Primera y no figuraba en la fuente Vespertino incorporada al corte.
- `078/870`, también no anclada, tenía 9 vecinas y 4 con pivote central y la misma densidad de 1 bloque: ocupó el puesto 10 en reglas `G_VECINOS` y `G_DENSIDAD`, mientras 851 quedó fuera.
- `518/815` tenía 6 vecinas con pivote y ganó el desempate geométrico `G_PIVOTE`.
- La regla `BASE_RENOVADA` conservó `124/421`, con 7 bloques, 2 fuentes y presencia en la fuente recién añadida, aunque sólo 3 vecinas ancladas.
- **Ninguna regla** incluyó `158/851` en el Top10 de esa Nocturna. El `615` y `242` estaban anclados, fuera del Top10 y **no eran candidatos** para este único cupo sin raíz; `290` y `264` no existían físicamente en PRE.

En particular, que 851 rozara ocho familias ancladas no da ocho pruebas independientes ni ninguna raíz admisible. Los ejemplos son útiles para ver el tablero **sin escoger retroactivamente** una regla que favorezca a 851.

## Conclusión y límites
1. El contacto con familias históricamente ancladas **no demostró en este histórico mejor discriminación** que contar bloques o usar la heurística de fuente renovada.
2. La bolsa sin raíz sigue siendo enorme; la clasificación morfológica sirve para **explicar** la lectura visual, pero no merece aún promoverse a selector real.
3. Más ensayos retrospectivos afinados sobre los mismos 23 días sólo elevarían riesgo de sobreajuste. Para seguir trabajando sin esperar sorteos nuevos conviene auditar **cuánto depende cada señal de tener muchos bloques**, examinar estabilidad cronológica estricta y diagnosticar por qué el ranking oficial da cero en las posiciones 9 y 10 históricas, sin ajustar a esas ausencias.
4. Las tiradas son aleatorias; **no hay capacidad predictiva demostrada**.

## Evidencia y estado
`auditorias/vt3-vecindad-geometrica-115-13oct2026/{PRE_115.json,NOCTURNA_PRE.json,SELLO.json,POST_115.json,NOCTURNA_POST.json,RESUMEN.json}`, protocolo y script en esta rama. GitHub Actions **38362837345 completado**. No se modificaron motor oficial, `main`, hoja diaria, marcas POST, sellos antiguos, APK ni VT4.
