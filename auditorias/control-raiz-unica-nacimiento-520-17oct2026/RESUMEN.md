# Control histórico VT3: raíz única sin bifurcación y nacimiento sin raíces

**17/10/2026 · Laboratorio retrospectivo sobre 520 PRE CORREGIDOS, sin alterar MV1, el motor, Geometría Completa, Nueva Prueba ni la APK.**

Ejecución satisfactoria: https://github.com/y0t3/Modelo-Papa/actions/runs/39022015859

## Pregunta

Dos hechos observados en el viernes **16/10**:

1. `3253 → 253/352` (Santa Fe Matutina): familia admitida por Lalo, con **un** antecedente propio D−1 transferido desde Nocturna Córdoba 6204 del 15/10, sin bifurcación física propia, relegada al **puesto 45** oficial (Geometría #6 / Nueva #7).
2. `5807 → 708/807` (Santa Fe Nocturna): familia con recorrido físico nacido en Vespertina pero **sin raíz admitida** por Lalo. Nunca integró el Top10.

¿Son categorías que merece la pena subir al ranking o simples familias entre muchas alternativas con igual geometría?

## Datos y prevención de errores previos

Se utilizaron los mismos **104 días / 520 PRE / 2600 cabezas argentinas** que el laboratorio histórico ya corregido: 51 jornadas (255 cortes) de junio–julio y 53 jornadas (265 cortes) de agosto–octubre hasta el 15/10/2026. Las cabezas de Montevideo de **20/06 (0963) y 09/07 (0802)** se conservaron en su fecha real, sin inventar cabezas argentinas esos días. Se comprobó que el nuevo informe vuelve a tener exactamente **654 cabezas físicamente trazables**.

En total se enumeraron **70.199 exposiciones de familia VT3** físicamente posibles (familia reversible por corte PRE, no 70.199 familias distintas). El código mantiene las **todas** las rutas de celdas contiguas por fuente y deduplica sentidos inversos cuando calcula la banda de cantidad de rutas. Jamás se cruzan columnas. Los PRE se reconstruyen antes de incorporar las cabezas del turno objetivo.

La raíz examinada es la **admitida por el motor Lalo**, deduplicada por cabeza histórica real, no un dibujo genérico que se parezca a otra forma. Se separó `directRoots = 1` y `branchBlocks = 0`; no se confunde la presencia de varias rutas de una misma cabeza con raíces independientes.

La comparación mantiene todas las familias negativas presentes en cada PRE. El control neutral se calcula únicamente en estratos **mixtos** donde están presentes el grupo observado y su comparador; si una familia carece de comparador, no se utiliza para ese contraste neutral.

## Contraste A: una raíz válida propia, ninguna bifurcación

Tratadas: familias admitidas por Lalo, exactamente **una raíz independiente** y **cero bifurcaciones propias**.

Controles: familias físicamente presentes con **cero raíz, cero bifurcaciones**, en el **mismo corte PRE, fuente de nacimiento, banda de rutas físicas (1, 2, 3–5, 6–12, 13+) y fuente única/múltiple**.

| Período | Exposiciones tratadas (sin exigir emparejamiento) | Cabezas tratadas | Exposiciones comparables | Cabezas observadas comparables | Neutral esperado |
|---|---:|---:|---:|---:|---:|
| Junio–julio | 6202 | 58 | 6005 | **56** | **53,48** |
| Agosto–octubre | 7186 | 66 | 6875 | **62** | **62,83** |
| **Total** | **13388** | **124** | **12880** | **118** | **116,32** |

En los estratos mixtos hay **33.404 exposiciones de controles**, con **308 cabezas ganadoras**. Las tasas descriptivas son aproximadamente **9,16 por mil** en el grupo con una raíz y **9,22 por mil** en sus controles; no hay separación significativa desde una perspectiva práctica. El exceso neutral global es solo **+1,68 cabezas**, y cambia de signo entre bloques temporales.

## Control secundario A: con raíz, ¿la bifurcación mejora la selección?

Se compararon familias **admitidas con una o más raíces**, agrupadas por ausencia/presencia de bifurcación, conservando el mismo corte, origen, banda de recorridos y número de fuentes.

| Período | Cabezas sin bifurcación observadas en estratos mixtos | Neutral esperado | Exceso |
|---|---:|---:|---:|
| Junio–julio | 21 | 20,97 | +0,03 |
| Agosto–octubre | 23 | 27,35 | −4,35 |
| **Total** | **44** | **48,31** | **−4,31** |

**No encontramos superioridad consistente de las familias bifurcadas**, pero este control mezcla distintos números de raíces propias y no prueba que eliminar la prioridad de bifurcaciones mejore los Tops. Es un motivo para **auditar**, no para editar el ranking.

## Contraste B: nacimientos del día sin raíz

Tratadas: familias intradía que **nacen físicamente en la última columna incorporada** (estado `NUEVA_FAMILIA`), con **una fuente, sin raíces ni admisión oficial**.

Control más cercano en edad/origen: familias que **también nacieron en alguna columna intradía**, siguen en una sola fuente, tampoco poseen raíces ni admisión, pero ya estaban presentes al menos desde el corte anterior (estado `SIN_CAMBIO`). Se empareja por **mismo corte PRE y banda de recorridos físicos únicos**. No se obliga a la misma columna de nacimiento, pues eso haría imposible confrontar recién nacidas y anteriores dentro del mismo PRE.

| Período | Exposiciones tratadas totales | Cabezas tratadas totales | Exposiciones tratadas comparables | Cabezas observadas comparables | Neutral esperado |
|---|---:|---:|---:|---:|---:|
| Junio–julio | 5652 | 57 | 4168 | **41** | **41,02** |
| Agosto–octubre | 6143 | 50 | 4557 | **36** | **38,76** |
| **Total** | **11795** | **107** | **8725** | **77** | **79,78** |

En los estratos mixtos hay **14.408 exposiciones de controles** con **138 cabezas**. Tasas descriptivas: **8,83 por mil** para recién nacidas y **9,58 por mil** en las previamente disponibles. El nacimiento no muestra mejora repetida.

Como contraste de sensibilidad, también se enfrentó nacimiento intradía sin raíz contra la familia sin raíz de **Nocturna anterior**, mismo PRE, fuente única y banda de rutas:

- Junio–julio: **52 observadas / 46,98 neutrales**, diferencia +5,02.
- Agosto–octubre: **45 observadas / 47,70 neutrales**, diferencia −2,70.
- Total: **97 / 94,68**, diferencia +2,32. **Cambió de signo**. Ambos grupos difieren por origen y antigüedad.

## Diagnóstico por turno

Los controles A (raíz única vs ninguna) en estratos mixtos sumaron:
- Previa: 10, contra neutral 11,72.
- Primera: 15, contra neutral 16,97.
- Matutina: 30, contra neutral 25,71.
- Vespertina: 35, contra neutral 28,08.
- Nocturna: 28, contra neutral 33,83.

Señales de signos opuestos por turno y sin prueba independiente. En el control B (nacimiento intradía sin raíz versus intradía antiguo), solo hay estratos comparables a partir de Matutina: Matutina **27/29,29**, Vespertina **27/23,18**, Nocturna **23/27,32**.

## Interpretación / decisión

1. Una raíz propia, aun demostrada físicamente, **no basta por sí sola** para distinguir a la familia ganadora de candidatos similares. Mantener su trazabilidad y mostrarla en INFO/Experimental, sin ascenderla automáticamente.
2. Nacer en la fuente nueva es un hecho **geométrico**, no una señal predictiva demostrada. La exclusión de `708/807` del 16/10 identifica una **limitación del lector experimental** (requiere admisión oficial), pero no demuestra que admitir todas las recién nacidas aumente la precisión.
3. La **prioridad extrema de las bifurcaciones** merece un test específico de ranking alternativo fijado antes de la evaluación, dado que el control geométrico no mostró superioridad consistente. No cambiar el motor con la evidencia disponible.
4. La siguiente investigación debe analizar secuencias físicas completas: **nacer → permanecer → sumar nueva fuente → encadenar raíces comprobadas**; comparando familias positivas y negativas con igual PRE, antigüedad, fuente y cantidad de trazos, no pesos arbitrarios.
5. No confundir exposiciones familia×turno con ensayos independientes: los cinco turnos comparten memoria dentro de una jornada, el corpus ha sido examinado muchas veces y los resultados son **retrospectivos**, no predicciones prospectivas ni probabilidades válidas de apuestas.

## Reproducibilidad

- Acción GitHub completada: https://github.com/y0t3/Modelo-Papa/actions/runs/39022015859
- Código de enumeración existente: `scripts/lab-vt3-secuencias-movimiento.ts` (en esta rama).
- Controles puros: `scripts/lab-vt3-control-raiz-nacimiento.ts`.
- Datos detallados con 520 cortes, todos los negativos y controles: artefacto `LAB-VT3-CONTROL-RAICES-NACIMIENTOS-520` / archivo `VT3_MOVIMIENTOS_FUENTE_VERIFICADA_JUN_OCT_2026.json`.
- Rama: `lab/control-grupos-raiz-unica-nacimiento-17oct2026`.
- Motores y APK oficiales no modificados.
