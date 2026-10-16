# Familias VT3 recién nacidas frente a huellas ganadoras semanales

**Cotejo completado el 16/10/2026 — laboratorio retrospectivo de 53 jornadas, 265 PRE, 1325 cabezas.** Sin modificar Modelo Lalo (MV1), Geometría completa, ni APK 0.3.5.

## Pregunta
Una familia VT3 que aparece por primera vez al incorporarse una columna del mismo día ¿es mejor candidata si su recorrido físico reproduce en la misma fuente la forma de una **cabeza ganadora realmente verificada** de la jornada anterior o del mismo día semanal anterior?

Esto NO prueba identidad numérica entre cabezas. La raíz antigua y el recorrido nuevo pueden tener cifras distintas; lo comprobable es la misma figura física y el traslado rígido válido en una fuente.

## Reglas respetadas
- `PRE` solo con Nocturna anterior más turnos previos del mismo día: nunca cabezas del turno objetivo.
- Familias reversibles de **tres cifras**; no se invierten cifras VT4 ni se cuentan aciertos VT2 como VT3.
- Recorridos de tres casillas adyacentes, sin cruzar columnas, saltar celdas ni atribuir un dibujo a una familia que no lo forma.
- **Nacimiento:** la familia no está en Nocturna anterior pero sí en Previa, Primera, Matutino o Vespertino. Se anota la *primera* columna que la puede formar; una fuente posterior puede reforzarla, pero no vuelve a nacer.
- Raíces antiguas **reales** de `buildMotorLalo(...).roots`, solo VT3 (`oldCells.length===3`), fecha previa y periodos D−1/D−7. Se relacionan con camino actual por **misma fuente + misma figura de tres celdas**, reversible solo en el *sentido físico*.
- La misma cabeza histórica se cuenta una vez por fecha/turno/jurisdicción/cabeza y periodo, por más caminos que tenga.
- Se comparan **TODAS** las familias nacidas, no únicamente las ganadoras, y se guardan cabezas históricas antiguas y casillas actuales para auditar las rutas.

## Universo y resultado general

En 265 PRE se registraron **21.471 exposiciones de familia nacida en una columna intradía** (familia × turno; no familias únicas), y **194 exposiciones de cabeza ganadora** cuya familia había nacido después de Nocturna anterior.

| Huella comprobada | Exposiciones de familia | Coincidencias VT3 de cabeza |
|---|---:|---:|
| D−7, misma forma y alguna fuente actual | 3.621 | 33 |
| D−7, específicamente fuente de nacimiento | 3.434 | 31 |
| D−1, alguna fuente | 3.485 | 31 |
| Sin huella D−7 | 17.850 | 161 |

**D−7: 33/3621 = 0,91% frente a 161/17850 = 0,90%.** No hubo separación apreciable de ganadoras y no ganadoras.

### Control neutral condicionado al PRE
Dentro de cada corte, primera columna y banda de número de rutas físicas (1–2, 3–5, 6–12, 13+) se conserva el número de familias con respaldo; luego se calcula la coincidencia media esperada si la etiqueta de respaldo no identificara selectivamente a las ganadoras:

| Respaldo | Coincidencias observadas | Promedio neutral condicionado |
|---|---:|---:|
| D−7 en alguna fuente | **33** | **34,99** |
| D−7 en fuente de nacimiento | **31** | **33,29** |
| D−1 en alguna fuente | **31** | **27,73** |

- **D−7 no muestra ventaja** en este control. D−1 aparece modestamente por encima de la expectativa, pero solo 3,27 cabezas de diferencia en 265 cortes y con decisiones previas de investigación; no es evidencia confirmatoria.
- Los cortes dentro de una jornada comparten historia y candidatos: **no** interpretar esos 21.471 registros como pruebas estadísticamente independientes.

### Por tramo
| Medida | 15/08–14/09 | 15/09–15/10 |
|---|---:|---:|
| Familias nuevas × turno | 10.921 | 10.550 |
| Cabezas con familia nueva físicamente disponible | 95 | 99 |
| Con D−7 en alguna fuente | 1.701 (15 aciertos) | 1.920 (18 aciertos) |
| Control neutral D−7 esperado | 15,11 | 19,88 |

No se observa ventaja estable en ninguno de los tramos.

## Top3 controlados (exactamente tres familias)

Se mantienen las dos mejores familias de **Nocturna anterior según la normalización combinada ya existente**. Se compara qué ocupa el tercer puesto. Si no existe familia nueva con el requisito exigido, se conserva la tercera de Nocturna. Es un laboratorio, no un reemplazo del ranking original.

| Regla del tercer puesto | Aciertos VT3 Top3 (265 turnos) |
|---|---:|
| Tres de Nocturna (control normalizado) | **11** |
| Normalización con fuentes libres | **12** |
| Dos Nocturna + una familia de otra fuente, aunque no sea nueva | **12** |
| Dos Nocturna + mejor familia realmente nueva | **13** |
| Dos Nocturna + nueva con huella D−7 en cualquier fuente | **12** |
| Dos Nocturna + nueva con huella D−7 en su fuente de nacimiento | **12** |
| Dos Nocturna + nueva con huella D−1 | **12** |
| Dos Nocturna + nueva, priorizando el **número** de huellas D−7 | **10** |

El 13 de la variante sin filtro de huella gana **3 exposiciones de cabeza** (21/08 Primera `379/973`, 08/09 Matutino `678/876`, 11/09 Matutino `418/814`) y pierde una (07/09 Matutino `021/120`) respecto del control 11. *Son cuatro casos en un histórico exhaustivamente examinado*, no demostración de capacidad futura.

La regla estricta D−7 solo logra 12: pierde el acierto `678/876` del 08/09, **porque no tenía una huella semanal verificada**, aunque su familia acababa de nacer en Previa. El mismo criterio **no evitó** desplazar `021/120` el 07/09.

Priorizar la **cantidad de raíces D−7** en lugar de la normalización existente fue aún peor (10): no rescató ninguna cabeza exclusiva.

### Ejemplo de huella genuina que sí se puede rastrear

**21/08 Primera — familia 379/973**. Estaba físicamente en Previa y no en Nocturna anterior. Reprodujo la figura de un recorrido de la cabeza histórica **1149, Entre Ríos, viernes 14/08**, de fuente Previa; la nueva figura quedó trasladada dos filas hacia arriba, con los tres contactos físicos preservados. D−7 permitió reconocer este caso, pero muchos otros candidatos no ganadores tenían recuerdos análogos.

## Interpretación
1. Es correcto, conforme a la regla original del padre, mirar **solo formas ganadoras verificadas**: la auditoría conserva cabezas antiguas y las tres casillas concretas; no interpreta cualquier figura de una tabla como un resultado real anterior.
2. Pero la mera existencia de un traslado rígido histórico de la **misma forma y fuente** no discrimina de manera útil a estas familias nuevas en la muestra.
3. El orden de normalización, sin exigir raíz histórica, conservó más aciertos que los filtros semanales; aun así la diferencia total fue muy pequeña y post hoc.
4. La hipótesis del mismo día semanal debería estudiarse, si se continúa, como **secuencia visual de caminos y cabezas marcadas**, no únicamente un indicador booleano de que existe una figura histórica.
5. **No modificar** Geometría completa, Lalo oficial ni APK; cualquier regla nueva debe tener diseño fijado previamente y contrastarse también con un bloque temporal no usado en este ajuste.
6. **Todos los resultados son retrospectivos**: no representan probabilidades reales de ganar ni garantías de acierto.

## Código y evidencia
- Acción GitHub: https://github.com/y0t3/Modelo-Papa/actions/runs/38860223408
- Script central: `scripts/lab-geo-newborn-weekly-roots.ts` en rama `lab/vt3-nacidas-raices-d7-265-16oct2026`.
- `scripts/lab-geo-normalization.ts` expone el orden normalizado completo de familias como criterio de desempate, verificando el Top3 original.
- `scripts/lab-geo-roots-265.ts` reproduce 265 PRE y publica `VT3_NACIDAS_RAICES_D7_265_CORTES.json`; el artefacto conserva también los informes previos.
