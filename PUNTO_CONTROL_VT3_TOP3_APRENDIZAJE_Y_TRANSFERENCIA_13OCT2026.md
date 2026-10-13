# Punto de control VT3 — Top3 docente en X y transferencia real a X+1

**13/10/2026 · Laboratorios ejecutados, ambos con GitHub Actions completas:**
1. [38379169671 — aprendizaje supervisado Top3](https://github.com/y0t3/Modelo-Papa/actions/runs/38379169671), rama `lab-vt3-top3-aprendizaje-dirigido-13oct2026`.
2. [38379652057 — transferencia D−7](https://github.com/y0t3/Modelo-Papa/actions/runs/38379652057), rama `lab-vt3-top3-transferencia-d7-13oct2026`.

Se hicieron **dos experimentos distintos**, para responder sin ambigüedades a la pregunta de si «mostrar las cabezas correctas al Top3 de X y luego transferir lo aprendido a X+1» beneficia al VT3 oficial. Ninguno modifica `main`, `src/motorLalo.ts`, la hoja, los sellos reales, la app, VT4 o los recorridos físicos históricos.

## Qué significa «hacer acertar la semana de entrenamiento»

En cada hoja PRE sólo hay candidatas cuyas rutas de tres celdas son físicamente válidas y recorren una fuente, sin cruzar columnas. Puede haber ganadoras físicamente ausentes. En otras ocasiones existen más de tres terminaciones ganadoras distintas, que **no caben simultáneamente en Top3**.

`DOCENTE_TOP3` es un procedimiento construido **conociendo** la cabeza ya extraída de la semana X: introduce hasta tres familias ganadoras físicamente representables entre las primeras tres y completa las plazas restantes con candidatas del PRE. Esto permite alcanzar la **cobertura máxima de cortes posibles** en la propia X. **No es un modelo predictivo**; le estamos dando las respuestas.

Luego entrenamos un modelo lineal común a los 25–30 cortes de X con 43 rasgos **sin dígitos, fechas ni identificadores de familia**: cantidad de caminos/bloques/fuentes, geometría y zonas de los recorridos, antigüedad de sus fuentes, existencia de raíces propias D−1 y D−7, bifurcaciones y puesto original. Realizamos hasta 32 épocas de corrección de errores de Top3 con cuatro inicializaciones fijas; elegimos la combinación con más Top3 acertados en **X** (esta selección in-sample busca deliberadamente el sobreajuste, pero no conoce X+1).

Dos bolsas:
- `ANCLADAS`: sólo las familias que el VT3 oficial admite con su propio respaldo D−1/D−7.
- `FISICAS`: todas las familias realmente formables, incluidas las que tienen rutas pero ninguna raíz histórica admitida.

Los Tops experimentales de X+1 empiezan por las tres familias elegidas por el modelo y completan Top10 con la lista VT3 oficial sin repetir, manteniendo exactamente **diez familias reversibles**.

### Resultados de entrenamiento

| Semana X | Cortes | Top3 DOCENTE posible, ANCLADAS | Top3 ajustado ANCLADAS | Top3 DOCENTE posible, FISICAS | Top3 ajustado FISICAS |
|---|---:|---:|---:|---:|---:|
| 15–19/09 | 25 | 14 | **8** | **19** | **6** |
| 21–26/09 | 30 | 13 | **7** | **20** | **5** |
| 28/09–03/10 | 30 | 13 | **6** | **21** | **8** |
| **Total de rondas X** | **85** | **40** | **21** | **60** | **19** |

En cada semana, el DOCENTE conocía las respuestas y por construcción acertó **todos los cortes alcanzables** con su bolsa. El puntaje compartido, aunque buscó aprender del docente y mejoró claramente respecto al Top3 oficial de esas semanas (4/85), **no consiguió igualarlo**. Es una distinción fundamental: acertar in-sample mediante un catálogo por hoja no implica que exista una regla global de selección capaz de hacerlo.

### Examen sobre las tres semanas X+1

Se examinaron **90 cortes**, semanas 21/09, 28/09 y 05/10. Ninguna familia o etiqueta de la semana del examen entró en el entrenamiento de esa ronda.

| Evaluación | Top3/90 | Top10/90 |
|---|---:|---:|
| **VT3 oficial** | **3** | **11** |
| Modelo ajustado ANCLADAS | **1** | **10** |
| Modelo ajustado FISICAS | **0** | **9** |

No hubo **ningún** corte recuperado por el Top3 aprendido que el original hubiera fallado. El modelo anclado desplazó dos aciertos Top3 originales; el modelo físico desplazó tres. Sus Tops10 perdieron respectivamente uno y dos cortes sin recuperar otros.

En los 90 exámenes había **61 cortes** con una cabeza físicamente representable (techo descriptivo del inventario completo), pero la bolsa ANCLADAS sólo cubría físicamente **32 cortes**. Es un problema de admisión diferente del ranking: ni ordenar mejor puede recuperar una candidata físicamente inexistente ni una familia físicamente presente puede ser asumida como anclada por compartir casillas con otra.

**Interpretación:** estas 43 variables y este ajuste de ranking no aprendieron un criterio semanal transferible que mejorara el Top3 actual. No prueba que sea imposible con otros modelos, pero sí falsó el algoritmo propuesto en estos datos.

## Control 2 — copiar literalmente las rutas correctas del mismo día D−7

El experimento anterior no copiaba casilleros exactos. Para acercarnos al método visual de papá, creamos después una segunda prueba con un **Top3 DOCENTE de la fecha D−7**: tomar hasta tres familias físicas realmente ganadoras ya conocidas, y conservar todas sus rutas de tres celdas originales. Aplicar esas rutas al PRE D, mismo turno **siete días calendario después**, según:

- `ABS`: mismo orden de casilleros o reverso y la **misma fuente**.
- `FORMA_FUENTE`: misma forma geométrica por traslación, sin cambiar de fuente.
- `FORMA_LIBRE`: misma forma normalizada en cualquier fuente actual, pero cada recorrido **permanece dentro de su propia fuente**. Es control permisivo, no conexión entre columnas.
- `NEGATIVO_ABS`: las plantillas del mismo número de familias D−7 **no ganadoras**, escogidas por hash fijo sin mirar el resultado de D.

Se construyeron las fichas `PRE_115.json` antes de habilitar cualquier objetivo, con SHA256 del código y protocolo. En POST, la elección para el corte D sólo lee cabezas de D−7 antes de seleccionar los Tops de D. Si D−7 no existe en el historial, el corte no se evalúa.

- **85 cortes con D−7 disponible**, 17 fechas; se excluyeron 30 cortes (las primeras cinco fechas del historial y el lunes 21/09, cuyo lunes 14/09 no está disponible).
- El docente D−7 había enseñado **104 exposiciones de familias positivas**, de 110 físicamente ganadoras disponibles; algunas hojas tenían más de tres y sólo cabían tres.
- En los 85 destinos, **58** tenían al menos una familia ganadora físicamente representable; ninguna regla puede acertar con ruta física en los otros 27.
- Los patrones ABS aprendidos encontraron **al menos una familia física coincidente en 60 cortes**, media 2,35 familias por corte; los patrones trasladados en igual fuente encontraron 9,61 familias medias y también aparecieron en 60 cortes.

| Método Top3/Top10 evaluado con idénticos 85 cortes | Top3 | Top10 |
|---|---:|---:|
| VT3 original | **3** | **11** |
| ABS, mismas celdas y fuente, sólo ancladas | **3** | **11** |
| ABS, mismas celdas y fuente, todas físicas | **3** | **11** |
| Forma trasladada en la misma fuente, ancladas | **1** | **11** |
| Forma trasladada en la misma fuente, físicas | **1** | **11** |
| Forma trasladada permitiendo distinta fuente de origen, ancladas | **2** | **11** |
| Forma trasladada permitiendo distinta fuente de origen, físicas | **2** | **11** |
| Control negativo: copiar rutas ABS de D−7 no ganadoras | **2** | **11** |

**Importante:** la copia ABS cambió las familias del Top3 en **59/85 cortes** y la composición del Top10 en **53/85**. Por tanto no es que haya reproducido automáticamente el mismo ranking: efectivamente generó otros candidatos **sin aumentar coincidencias**. Las formas normalizadas por fuente incluso perdieron dos cortes Top3 oficiales (30/09 Matutino y 02/10 Previa), sin nuevos aciertos.

La copia de forma libre rescató 29/09 Matutino en Top3, pero desplazó los dos casos anteriores: **+1 rescate / −2 pérdidas, neto −1**. Todas las variantes conservaron Top10 **11/85**, pero eso no equivale a más aciertos: el Top10 incluye siete candidatos oficiales de relleno en cada corte. Hay que evaluar en particular el Top3 aprendido.

## Qué sí podríamos transferir a VT3 como capacidad descriptiva

1. **Docente físico comprobable**: dada una semana ya sorteada, mostrar qué cabezas VT3 son físicamente representables y qué recorridos exactos las explican, y distinguir las que no aparecen en la hoja. No es una predicción y no altera los candidatos PRE.
2. **Techo por etapa**: inventario físico completo vs familias con raíces históricas propias vs Top10 y Top3. Evita achacar un fallo de priorización al ranking cuando el número no existía físicamente o no tenía admisión válida.
3. **Réplica D−7 con todos los caminos** para interpretar el método manuscrito, indicando claramente `RUTA DE D−7` y `CANDIDATA ACTUAL`, sin inventar un éxito futuro.
4. **Diagnóstico de transferencia**: identificar entradas y salidas del Top que produce cada método, con éxito y fracaso. Las diferencias cuantificadas muestran que «aprender» no basta si el criterio no discrimina del resto de las rutas.

**No hay todavía un factor numérico que justifique cambiar la selección del Top3 ni del Top10 oficial.** El modelo supervisado no alcanzó el techo docente ni mejoró la semana posterior; las geometrías exactas D−7 tampoco superaron VT3. Un modelo más flexible capaz de memorizar 100 % de X probablemente agravaría el sobreajuste, salvo que mejore al aplicarse sin resultados de X+1.

## Fuentes y reproducibilidad

**Supervisado Top3:** `scripts/lab-vt3-top3-dirigido.mjs`, `PROTOCOLO_VT3_TOP3_APRENDIZAJE_DIRIGIDO_13OCT2026.md`, `auditorias/vt3-top3-dirigido-115-13oct2026/{PRE_115.json,SELLO.json,POST_115.json,RESUMEN.json}`. GitHub Actions [38379169671](https://github.com/y0t3/Modelo-Papa/actions/runs/38379169671).

**Réplica exacta D−7:** `scripts/lab-vt3-top3-transferencia-d7.mjs`, `PROTOCOLO_VT3_TOP3_TRANSFERENCIA_D7_13OCT2026.md`, `auditorias/vt3-top3-transferencia-d7-115-13oct2026/{PRE_115.json,SELLO.json,POST_115.json,RESUMEN.json}`. GitHub Actions [38379652057](https://github.com/y0t3/Modelo-Papa/actions/runs/38379652057).

**Precaución metodológica:** estos experimentos tienen separación temporal dentro de sus ejecuciones, pero se plantearon tras explorar intensamente estas mismas 23 fechas. **No son una prueba prospectiva independiente** ni demuestran que sorteos aleatorios puedan predecirse por recurrencia geométrica. Mantener motor oficial, Top sellados, app y VT4 intactos.
