# Modelo Lalo +11 · auditoría del filtro físico VT3
**25 de octubre de 2026 · Solo laboratorio · MV1 y APK intactos**

## Pregunta
¿Por qué tantas cabezas con sus tres cifras físicamente dibujables en la
hoja +11 no entran al Top10? ¿El problema está en la geometría, en
admitir familias o en el ranking?

## Reglas preservadas
- Hoja PRE generada con nocturna anterior y turnos ya conocidos del día.
- Camino VT3 siempre dentro de **una fuente/columna**, tres celdas
  consecutivas por roce ortogonal/diagonal; sin huecos ni saltos.
- Coincidencia con cabeza publicada: sufijo exacto de 3 cifras;
  familia inversa usada únicamente como unidad de ranking.
- Familias del motor original calculadas solo desde recorridos
  ganadores D−1/D−7 trasladados a la misma fuente y sus bifurcaciones
  físicas respaldadas. Cabezas del turno objetivo nunca en entrada PRE.
- Se evalúan las seis jurisdicciones del turno; Montevideo NO origina
  raíces de la hoja +11, igual que en el código de producción.
- Las familias adicionales del experimento son SOLO un **sombra**
  contrafactual: no se añaden a MV1, VT4, VT2, `main` ni APK.
- Familias sombra formadas físicamente en la hoja PRE, no generadas
  como combinaciones numéricas arbitrarias.
- Jornada válida exige al menos 20 cabezas; sin completar sorteos
  feriados ficticios.

## Embudo observado (junio–23 de octubre)
**123 jornadas, 615 cortes PRE, 3.295 cabezas publicadas.**

| Situación de la cabeza VT3 | Número | %
| --- | ---: | ---: |
| El sufijo exacto no se forma físicamente | 2.448 | 74,3 % |
| Físicamente posible, pero NO está en el conjunto del motor | **537** | **16,3 %** |
| En el motor, pero fuera de Top10 | 252 | 7,6 % |
| En Top10 (incluye Top3/5) | **58** | 1,8 % |

El **63,4 % de las 847 cabezas geométricamente posibles** estaba
fuera incluso del conjunto de familias del motor. En total, el motor
reconoció 310 de las 847 oportunidades físicas (36,6 %).

| Turno | Cabezas | VT3 dibujables | Formables no reconocidas | Reconocidas debajo Top10 | Top10 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Previa | 615 | 61 | 35 | 17 | 9 |
| Primera | 615 | 107 | 70 | 30 | 7 |
| Matutino | 716 | 207 | 119 | 64 | 24 |
| Vespertino | 615 | 172 | 105 | 61 | 6 |
| Nocturno | 734 | **300** | **208** | 80 | 12 |
| Total | 3.295 | **847** | **537** | **252** | **58** |

> NO INTERPRETAR como probabilidades de sorteo: son recuentos de
> oportunidades geométricas y coincidencias retrospectivas.

### Un invariante revelador

En los 615 cortes, **cero familias físicamente presentes** quedaron
fuera del motor cuando poseían el mismo patrón exacto de tres celdas
que un recorrido ganador D−1/D−7 **en la misma columna**. Esto
es consistente con que el motor reproduce ya esas traslaciones.
La brecha está en **otras figuras o cambios de estructura**, no en
corregir el orden de un traslado idéntico.

## Ejemplos actuales fuera del conjunto del motor

- **22/10**: 6 cabezas VT3 formables; 5 no reconocidas, 1 en puesto
  #21. Ciudad Primera 8578 (578) se dibuja en Previa; Provincia
  Matutino 4710 (710) en Nocturna anterior; Santa Fe Vespertino
  8257 (257) en dos columnas.
- **23/10**: 7 cabezas VT3 formables, **las 7 no reconocidas**:
  Ciudad Matutino 3061, Entre Ríos Matutino 3103,
  Montevideo Matutino 3978, Provincia Vespertino 3698,
  Ciudad Nocturno 1280, Entre Ríos Nocturno 2498 y
  Montevideo Nocturno 1517.
- En 24/10, fecha separada de la selección del criterio:
  26 cabezas observadas, 5 VT3 dibujables y **5 no reconocidas**.

Estos casos son hechos POST para auditar un corte reconstruido PRE,
no recomendaciones de números.

## Sombra geométrica: sólo una nueva familia, mismo cupo Top10

Se exploró si una familia excluida, físicamente válida, podía ganar
el lugar #10 cuando comparte **dos celdas de posición física** con
un dibujo ganador D−1/D−7 de la misma fuente. Comparar posición
de dos caminos de días distintos NO permite cruzar columnas ni
equivale a afirmar que el número sea una traslación ganadora.
Si hay al menos diez familias originales, se reemplaza solo #10;
si hay menos de diez, se completa hasta un máximo de diez.

| Restricción de selección de la sombra | Baseline Top10 | Variante Top10 | Ganó | Perdió |
| --- | ---: | ---: | ---: | ---: |
| Contacto con D−1 | 58 | 63 | 6 | 1 |
| Contacto con D−1 o D−7 | 58 | 63 | 6 | 1 |
| Contacto con ambos períodos | 58 | 60 | 3 | 1 |
| **Convergencia real en dos o más columnas**, más contacto histórico | 58 | **63** | 6 | 1 |

**Todas las listas conservaron el cupo máximo de diez.**
Top3 original no cambia, pues la nueva familia ocupa el último lugar.
No se recalcularon VT2 ni VT4 con esa familia hipotética.

### El control aleatorio es indispensable

15.000 simulaciones con semilla fija por variante: se elige una
familia *al azar dentro del mismo conjunto admisible* en cada corte,
manteniendo el mismo reemplazo de un puesto. Se mide solo cuántas
cabezas POST habría recuperado, no se predicen sorteos al azar.

| Familia admisible | Recuperó la regla | Promedio al azar | % de sorteos aleatorios ≥ regla |
| --- | ---: | ---: | ---: |
| D−1 | 6 | 6,10 | 56,8 % |
| D−1 o D−7 | 6 | 6,24 | 59,8 % |
| Ambos períodos | 3 | 5,08 | 89,2 % |
| **Convergencia 2+ fuentes** | **6** | **3,83** | **14,5 %** |

La convergencia restringe el universo sombra a unas 9,3 familias
admisibles por corte con elección; el filtro D−1 sencillo deja
alrededor de 34,8. La convergencia supera su promedio aleatorio,
pero **no de forma concluyente**, y además se eligió después
de explorar varias variantes: no hay ajuste formal por múltiples
ensayos. Un saldo +5 por sí solo NO prueba una mejora predictiva.

### Verificación temporal separada: sábado 24/10

La regla de convergencia se aplicó SIN modificar condiciones a un
día que no formó parte de los datos 1/6–23/10:
- 26 cabezas publicadas; 5 VT3 físicamente posibles.
- **Las 5 no reconocidas por Lalo original.**
- Top10 Lalo original **0**; convergencia experimental **0**.
- No hubo incorporaciones ni pérdidas. Muestra de un día,
  insuficiente para establecer conclusión estadística.

## Decisión y siguiente hipótesis

**No activar recuperación sombra, convergencia ni submotor en la APK.**
La selección por apoyo físico de dos celdas, aunque intuitiva y
geométricamente válida, no pasó un control aleatorio convincente.

Sí queda probado *dónde está la brecha*: las figuras que cambiaron
su estructura geométrica respecto de las raíces históricas (más
a menudo en los turnos con varias fuentes visibles).

Próximo experimento acotado, sin tunear el Top3:
identificar **firmas físicas nuevas** por fuente/posición de 5–6
jornadas y exigir una activación previa comprobada de una estructura
conectada. Primero comparar tasas de admisión y falsas alarmas
contra una selección aleatoria de familias igualmente formables;
solo después plantear un ranking. Evitar volver a extender
la memoria demasiado atrás para generar candidatos.

## Evidencia reproducible

- Auditoría 123 jornadas:
  https://github.com/y0t3/Modelo-Papa/actions/runs/40160228715
- Control temporal 24/10:
  https://github.com/y0t3/Modelo-Papa/actions/runs/40160385382
- Scripts:
  `scripts/lab-lalo-filtro-vt3.ts`
  y `scripts/lab-lalo-convergencia-holdout24.ts`.
- JSON: `resumen.json`, `cabezas.json`, `cortes-y-testigos.json`,
  `control-aleatorio-condicional.json`. Fecha, turno y valor
  trazables en los artefactos Actions.
