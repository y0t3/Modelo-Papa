# Episodios de actividad geométrica: pausas, varias fuentes y regreso a la fuente propia

**Fecha: 17/10/2026. Auditoría retrospectiva sobre el histórico de 104 jornadas/520 cortes PRE corregidos. No se modifica Lalo MV1, Geometría Completa, Nueva Prueba, VT4, main ni la APK.**

Ejecución final aprobada: https://github.com/y0t3/Modelo-Papa/actions/runs/39028925464

## Qué se comprueba

El método del padre se conserva en orden estricto:

1. Se toman SOLO figuras de tres casillas que explicaron cabezas auténticamente sorteadas en **jornadas anteriores**.
2. Cada hecho conserva cabeza completa, fecha, turno en el que salió, fuente +11 que permitió el recorrido y celdas exactas.
3. Se mira la historia de esa figura en las últimas **seis jornadas reales**. Si en una fecha no explicó cabezas, se registra un silencio (NO se interpreta como inexistencia física).
4. Antes del turno objetivo, se reconstruye la hoja +11 de Nocturna previa más los turnos ya disponibles. Se buscan las figuras históricas físicamente posibles **dentro de una sola fuente**, sin huecos, saltos ni cruces entre columnas.
5. SOLO en las casillas de esa figura actual se leen las nuevas cifras candidatas, agrupadas en familias reversibles VT3. Las cabezas del turno objetivo no intervienen en la selección, únicamente en su evaluación posterior.
6. Se contrastan todas las familias físicamente posibles que acertaron y no acertaron, con controles por PRE, primera fuente, fuente testigo y banda de cantidad de recorridos. Control más estricto iguala también intensidad histórica (número de días de figura/fuente y fuentes distintas).

Las apariciones en **dos fuentes en una misma fecha** se anotan simultáneamente como hechos comprobados: no son dos jornadas ni se adjudica falsamente una única fuente. Una figura puede a la vez retornar tras una pausa y manifestarse en varias fuentes: esas categorías NO son mutuamente excluyentes.

## Datos

- 51 días junio–julio (255 PRE) + 53 días agosto–octubre (265 PRE), **520 PRE** y **2600 cabezas argentinas**.
- Se reproducen las **654** exposiciones de cabeza con VT3 físicamente disponible.
- Montevideo solo se usa como fuente física (respetando 20/06 y 09/07), nunca se inventan cabezas argentinas ni turnos que no existieron.
- El histórico fue estudiado previamente muchas veces: esta es una auditoría exploratoria, no un conjunto realmente ciego. Una jornada tiene cinco turnos dependientes.

## Condiciones estudiadas y Top3 retrospectivos

Una “pausa” significa **ausencia de marcas ganadoras para esa figura**, no desaparición del trazado posible en el tablero.

| Condición visual (figura comprobada) | PRE con al menos 3 candidatas elegibles | VT3 Top3 total |
|---|---:|---:|
| Retorna tras jornada inmediatamente anterior sin marca de esa figura | 471 | 8 |
| Retorna a la misma fuente tras pausa | 421 | 8 |
| Retorna desde otra fuente tras pausa | 459 | 9 |
| Ayer explicó cabezas en varias fuentes | 371 | 6 |
| Se manifestó en varias fuentes ayer y en algún día anterior | 225 | 5 |
| **Regresa a una fuente donde ya había dado coincidencias, después de manifestarse en otra la jornada anterior** | **290** | **14** |

No todos los métodos tienen 3 candidatos en los 520 cortes. Los conteos deben compararse **en exactamente los mismos cortes**.

### Comparación justa de “vuelve a su fuente”

| Período | PRE elegibles | Top3 trayectoria de regreso | Top3 Geometría Completa en esos mismos PRE | Top3 Lalo oficial en los mismos PRE |
|---|---:|---:|---:|---:|
| Junio–julio | 129 | **11** | 5 | 6 |
| Agosto–octubre | 161 | 3 | **9** | 2 |
| **Total** | **290** | **14** | **14** | **8** |

El cambio de signo por período es decisivo para la prudencia: **no hubo mejora neta frente a Geometría Completa en los cortes comparables**. No cambiar el Top oficial ni el ranking experimental basándose en junio.

Otras condiciones al comparar en cortes idénticos:
- Retorno simple tras silencio: **8** Top3 frente a **17** Geometría en los 471 PRE con candidatas.
- MultifuentE comprobada ayer: **6** frente a **13** Geometría en 371 PRE.
- MultifuentE persistente: **5** frente a **10** Geometría en 225 PRE.

## Controles de todas las familias disponibles, incluidas negativas

Se evaluó un **único testigo de cada familia por PRE**, no se multiplicaron cabezas por trayectos inversos. Solo se usan estratos con positivos y negativos presentes. En el control estricto, los testigos se igualan por primera fuente física, fuente efectivamente elegida en PRE, número de fuentes actuales, banda de recorridos y cantidad de días históricos con esa figura/fuente.

| Condición | Cabezas observadas en familias con patrón, estratos estrictos | Valor neutral esperado | Diferencia |
|---|---:|---:|---:|
| Retorno tras silencio | **26** | 26,14 | −0,14 |
| Retorno en su misma fuente tras pausa | **13** | 13,18 | −0,18 |
| Retorno tras pausa con figura antes en otra fuente | **26** | 26,75 | −0,75 |
| MultifuentE ayer | **27** | 30,06 | −3,06 |
| MultifuentE ayer y alguna jornada anterior | **17** | 16,31 | +0,69 |
| **Regreso a una fuente tras manifestarse en otra** | **18** | **13,18** | **+4,82** |

La única diferencia favorable más visible es el regreso de fuente, pero al separarla:
- **Junio–julio:** **13 observadas / 7,63 esperadas** (+5,37).
- **Agosto–octubre:** **5 observadas / 5,55 esperadas** (−0,55).

Por lo tanto la separación **no se sostiene en el período posterior**. Aunque el control estricto ayuda a distinguir frecuencia geométrica de orden temporal, los datos son escasos y las exposiciones comparten información histórica. No es una prueba estadística confirmatoria.

## Ejemplos verificados con cabezas y coordenadas

### 01/06 Nocturna, cabeza posterior **0462**, familia **264/462**

La figura geométrica se observa físicamente en la columna **Nocturna anterior** del PRE, casillas `1:1 → 2:0 → 3:0`, que forman **264**. Después sale **0462**, terminación **462** (inversa de 264).

La misma figura había explicado anteriormente:
- **28/05 Nocturna, Córdoba 7657**, fuente Nocturna anterior, casillas `3:1 → 4:0 → 5:0`.
- **29/05 Nocturna, Provincia 7952**, fuente Previa, casillas `3:0 → 2:0 → 1:1`.
- **29/05 Nocturna, Entre Ríos 4205**, fuente Matutino, casillas `2:0 → 1:0 → 0:1`.
- **30/05 Nocturna, Santa Fe 5130**, nuevamente en Nocturna anterior, casillas `4:0 → 3:0 → 2:1`.

Es un regreso físico comprobado a una fuente donde la figura ya había estado activa. No es continuidad de las cifras históricas.

### 02/06 Nocturna, cabeza posterior **8244**, familia **244/442**

La figura se reproduce ahora en **Matutino**, casillas `2:1 → 3:0 → 4:0`, cifras **442**, familia reversible **244/442**. Coincide luego con la cabeza **8244**.

La historia previa de esa figura incluye:
- **28/05 Nocturna Córdoba 7657**, Nocturna anterior.
- **29/05 Nocturna Provincia 7952**, Previa.
- **29/05 Nocturna Entre Ríos 4205**, Matutino.
- **30/05 Nocturna Santa Fe 5130**, Nocturna anterior.
- **01/06 Vespertina Provincia 3668**, Matutino.
- **01/06 Nocturna Entre Ríos 0462**, Nocturna anterior.

Es seguimiento del **mismo dibujo**, con cifras cambiantes y distintas fuentes. El patrón se documenta porque hubo cabezas reales que lo comprobaron; la predicción se hace en la nueva hoja +11.

## Decisión

- El seguimiento con pausas y concurrencia en múltiples fuentes es **técnicamente reproducible** y puede mostrarse visualmente con su historial completo, sin inventar marcas.
- **No** hubo evidencia de que simplemente regresar tras silencio o aparecer en varias fuentes mejore la selección VT3.
- El regreso a una fuente anterior es la hipótesis más interesante en términos exploratorios, **pero falla la replicación temporal**: su aparente ventaja Top3 en junio-julio desaparece en agosto-octubre. Con la misma cobertura de 290 cortes, empata a Geometría en Top3 total.
- No fusionar un motor nuevo ni reordenar la app hasta contar con verificación externa a estos mismos meses; tampoco recomputar PRE guardados antiguos como si hubieran sido seleccionados a tiempo.
- Si se investiga de nuevo, estudiar **episodios con fechas, fuente y antigüedad exactas**, pero diseñar el criterio ANTES de comparar con un bloque temporal no reutilizado. No tratar un caso ganador particular como demostración de una regla.

## Código y trazabilidad

- [Ejecución aprobada con TypeScript, pruebas y barrido de 520 PRE](https://github.com/y0t3/Modelo-Papa/actions/runs/39028925464).
- `scripts/lab-figuras-episodios.ts`: episodios y fuentes.
- `scripts/test-lab-figuras-episodios.ts`: pruebas de retorno, solapamiento de fuentes, huecos y fechas válidas.
- `scripts/lab-figuras-comprobadas-a-pre.ts`: integración en los 520 PRE, controles y casos ganadores.
- Artefacto `LAB-EPISODIOS-FIGURAS-520`, con `FIGURAS_COMPROBADAS_A_PRE_520.json` y todos los casos positivos/negativos, coordenadas y periodización.
- Rama: `lab/figuras-pausas-multifuente-17oct2026`. `main` sin cambios.
