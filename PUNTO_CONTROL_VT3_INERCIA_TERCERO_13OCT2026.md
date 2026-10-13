# Punto de control VT3 — inercia real de recorridos y raíces del tercer candidato

**13 de octubre de 2026 · Rama experimental `lab-vt3-inercia-recorridos-tercero-13oct2026`.**

GitHub Actions **[38385605201: completada correctamente](https://github.com/y0t3/Modelo-Papa/actions/runs/38385605201)**. Este laboratorio no modifica `main`, `src/motorLalo.ts`, las hojas, los recorridos oficiales, los Tops sellados, la app, APK ni VT4.

## Pregunta
¿Por qué la tercera familia de la fusión conservadora aprendida se repite de turno en turno? ¿Aparecen **rutas propias nuevas**, fuentes recién incorporadas o eventos de raíz propios D−1/D−7, o es la permanencia de un recorrido ya presente?

El laboratorio inspeccionó **TODOS los 90 terceros realmente escogidos** entre 18 jornadas × 5 turnos del examen X+1 y el inventario físico de los cortes anteriores de esas fechas. El tercero aprendió sólo de semanas pasadas, como ya había quedado congelado antes de conocer la cabeza del examen.

## Procedimiento y control PRE/POST
Entradas estrictamente PRE:
- Inventario físico original 115 cortes `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`, SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`.
- Bolsas externas de 90 cortes `auditorias/vt3-control-tercer-puesto-90-13oct2026/PRE_90.json`, SHA256 `5f506c1cde4988105da3bb7d1914379f9ebd5a3f8c68770b93022f1625bdacf0`.

El workflow retiró físicamente todas las otras auditorías durante PRE, construyó las huellas de rutas por familia y fuente, normalizó exactamente la orientación inversa de cada recorrido de **tres celdas adyacentes distintas dentro de la misma fuente** y consolidó las raíces por evento `fecha|D−1/D−7|turno|jurisdicción|cabeza`, no por número de caminos heredados. Guardó `PRE_90.json` y `SELLO.json` con hashes de fuente, script, protocolo y nuevo PRE.

Sólo tras el sello se restauró el `POST_90.json` del experimento anterior: contiene las terceras propuestas que el motor produjo **antes** de las cabezas objetivo, aunque el nombre del archivo corresponda a la auditoría retrospectiva. Cada propuesta se revalidó contra `POST_115.json` del ensayo de aprendizaje semanal. Las cabezas del turno actual se consultaron sólo al etiquetar aciertos.

**Unidad:** camino propio físico = `fuente|celdas` reversibles; raíz histórica independiente = evento de cabeza de origen comprobado. No se prestan raíces ni se crean caminos a través de columnas.

## 1. Hallazgo principal: el tercero se «pega» a la hoja

| Indicador en las **90** terceras propuestas | Aprendiz | Control neutro físico, media de 5.000 | Control neutro con **igual anclaje y cantidad de rutas**, media |
|---|---:|---:|---:|
| Familias distintas en 90 selecciones | **32** | 82,18 | 78,32 |
| Misma tercera en turnos **consecutivos del mismo día**, sobre 72 transiciones | **55** | 0,58 | 3,09 |
| Selecciones cuya familia **ya existía físicamente** en el turno anterior | **56/72** | 52,18 | 56,41 |
| Para la familia seleccionada: **idéntico conjunto de rutas y raíces** que en el turno anterior | **56/72** | 47,44 | 55,05 |
| Ya presente y suma **al menos una cabeza histórica de raíz propia nueva** | **0** | 0,82 | 0,10 |
| Ya presente y añade rutas pero **sin** cabeza raíz nueva | **0** | 3,92 | 1,26 |
| La familia seleccionada **no existía físicamente** en el turno anterior | **16/72** | 19,82 | 15,59 |

Hay **18 primeras posiciones Previa** sin turno anterior dentro del día, por lo que las transiciones comparables son **72**, no 90. Cada selección de un corte fue exactamente una familia física con sus recorridos propios. Que se hayan observado 56 casos de huella física idéntica incluye 55 terceros repetidos consecutivamente y una familia existente anteriormente que pasó a ser la tercera **por primera vez** en ese turno.

La señal descriptiva más fuerte es la repetición de la **selección**: **55/72** frente a 3,09 de media en las réplicas que igualaban raíz/anclaje y clase de cantidad de rutas. En las 5.000 réplicas de esa bolsa ni una alcanzó 55 repeticiones consecutivas. Se trata de **inercia del algoritmo de selección en una secuencia de hojas que acumula fuentes**, no evidencia estadística de una ventaja para la quiniela. Un control que elige cada turno de forma independiente no incorpora intencionalmente la inercia de un ranker determinista; la comparación muestra concentración operativa, no capacidad predictiva.

La comparación de **huella idéntica por sí sola** cuenta otra historia: **56** para el aprendiz, **55,05** para el control de igual anclaje y rutas. Por tanto, **la persistencia física de una familia entre turnos es perfectamente normal** en este tablero. Lo excepcional es que el aprendiz tienda a volver a escoger **exactamente esa misma familia** en la tercera plaza, aunque las nuevas fuentes no agreguen nada suyo.

## 2. ¿Qué pasa con los caminos/raíces nuevos?

Entre las 72 posiciones Primera, Matutino, Vespertino y Nocturno del estudio:
- **56** propuestas ya existían físicamente el turno anterior. Las **56** conservaron el mismo conjunto de caminos **y** el mismo conjunto de eventos históricos de raíz. No ganaron recorridos nuevos, ni nuevos eventos D−1/D−7 propios, ni perdieron los existentes.
- **16** propuestas **aparecieron físicamente por primera vez** en ese día/turno. Por definición traían alguna ruta nueva respecto a una hoja en la cual la familia aún no se podía formar. Estas 16 apariciones aportaron **18 rutas** y **18 eventos históricos de raíz** al inventario del tercero en ese momento. **No confundir esas 18 raíces de entradas nuevas** con raíces recién añadidas a una candidata que venía manteniéndose desde antes.
- Las 18 Previa se auditaron individualmente pero **no se usaron** para concluir si una ruta había cambiado intradía.

En total entre transiciones comparables el aprendiz sumó **18 caminos físicos** de familias recién formables, todos en la fuente incorporada de ese turno, mientras la selección neutral con igual condición de anclaje y tamaño de rutas sumó **18,81** de media. **No hay señal de que el aprendiz genere más evidencia física nueva que una selección neutral equivalente**, pese a su mayor repetición.

## 3. Ejemplos auditados

### `253/352`: diez terceros, dos días completos
- Elegido en los cinco turnos del **23/09** y otra vez en los cinco turnos del **24/09**.
- **Una sola ruta física propia** durante cada jornada, misma fuente y casillas a lo largo de los cinco turnos.
- **Ocho continuaciones intradía** de huella idéntica, ninguna nueva ruta D−1/D−7 al pasar turno.
- **Cero coincidencias** en esas diez selecciones.

### `066/660`: siete terceros
- Cuatro apariciones desde Previa hasta Vespertino el **02/10** y tres desde Matutino hasta Nocturno el **10/10**.
- En **cinco** ocasiones fue exactamente la misma geometría/raíz que en el turno anterior. Una de las otras corresponde a una primera aparición física dentro del día.
- **Cero coincidencias**.

### `246/642`: el único acierto aprendido
- Fue tercero **todos los cinco turnos del 21/09** y apareció otra vez en Previa del **10/10**. Solo acertó **Vespertino 21/09**.
- En la Vespertina el tercero estaba **idéntico a Matutino**: **una ruta propia, cero rutas nuevas, cero eventos raíz propios nuevos**; era una familia anclada (rango oficial **42**) con respaldos que ya tenía en su hoja.
- Por tanto, **el único rescate histórico de la fusión vino de una propuesta repetida SIN novedad de respaldo físico**, no de un recorrido recién llegado.

Otros casos de repetición completa sin acierto: `058/850` cinco turnos 25/09 (sin anclaje); `077/770` cinco turnos 30/09 (sin anclaje); `143/341` cinco turnos 03/10.

## 4. Comparación con controles deterministas anteriores
Se hizo la misma auditoría física sobre las propuestas previamente congeladas `RANGO11`, `HASH_FIJO` y `RECUENTO_RUTAS`:

| Método de escoger una familia externa | Terceras distintas /90 | Repite misma tercera consecutiva /72 | Familia ya presente y huella física/raíz idéntica /72 | Aciertos de la tercera /90 |
|---|---:|---:|---:|---:|
| Aprendiz por geometría positiva | **32** | **55** | **56** | **1** |
| Mejor anclada fuera del Top10, rango11 | 67 | 19 | 49 | 0 |
| Hash fijo (neutral determinista por fecha/turno) | 83 | 0 | 46 | 1 |
| Mayor cantidad de rutas físicas propias | 51 | 30 | 35 | 2 |

El aprendizaje es el selector **más persistente** de estos cuatro. Eso no indica automáticamente un defecto: su prioridad por similitud con rutas ganadoras de X favorece patrones físicos que siguen disponibles, algo que puede ser esperable cuando el tablero crece fuente por fuente. La pregunta útil es si esa persistencia tiene valor real para selección: **este conjunto sólo tiene un acierto en la tercera, que además provino de una repetición sin evidencia nueva**.

## 5. Evolución por semana de prueba
| Semana que comienza | Cortes | Familias terceras distintas | Cortes con huella idéntica a turno anterior | Nuevas raíces de familias que aparecieron por primera vez | Aciertos de tercero |
|---|---:|---:|---:|---:|---:|
| 21/09 | 30 | 6 | 23 | 6 eventos | **1** |
| 28/09 | 30 | 11 | 20 | 8 eventos | 0 |
| 05/10 | 30 | 17 | 13 | 15 eventos | 0 |

**Aclaración:** la columna «nuevas raíces de familias que aparecieron» suma eventos por corte y puede incluir las Previa; NO corresponde a raíces que una familia previamente presente fue sumando al cambiar turno. El conteo de familias únicas y repetidas cambió claramente según la semana, pero no se infiere causalidad predictiva.

## 6. Conclusión y decisión
**Sí encontramos una inercia geométrica fuerte en la elección de la tercera candidata aprendida.** Entre turnos, el modelo sigue favoreciendo la misma terna; su forma física puede permanecer idéntica y sus raíces propias sin cambios. Las 55 repeticiones intradía superan enormemente las de selecciones independientes neutrales de la misma capacidad.

**Pero no encontramos justificación para penalizar automáticamente esa inercia.** El **único** tercero aprendido ganador fue precisamente una propuesta repetida cuya geometría no había cambiado desde Matutino. Quitarla por ser «vieja» habría eliminado ese acierto. El objetivo es distinguir **evidencia nueva vs repetición**, no suponer que frescura sea sinónimo de probabilidad.

Siguiente avance técnico razonable: conservar la tercera propuesta **junto con una explicación visual/diagnóstico de procedencia**, que muestre fuente/casilleros propios, último turno donde apareció ruta o raíz realmente nueva, y si permanece igual o cambia. Podría explorarse un **segundo candidato alternativo** cuando la tercera está estable, pero cualquier elección adicional de Top3/Top5 tendría que compararse con controles de igual número de plazas y evitar cambios impulsados por un único acierto conocido. No modificar reglas de selección ni VT3/VT4 oficiales todavía.

**El experimento es retrospectivo sobre 23 fechas estudiadas repetidamente.** Los sorteos de quiniela son aleatorios y el descubrimiento de inercia estructural no demuestra capacidad para predecir las cabezas de mañana.

## Evidencia respaldada
- `PROTOCOLO_VT3_INERCIA_TERCERO_13OCT2026.md`
- `scripts/lab-vt3-inercia-tercero.mjs`
- `auditorias/vt3-inercia-tercero-90-13oct2026/PRE_90.json`: 90 bolsas físicas y huellas propias, comparadas con turno anterior antes de revelar resultados.
- `SELLO.json`: SHA256 de PRE, código, protocolo e insumos.
- `POST_90.json`: por cada tercer candidato congelado, sus rutas nuevas/mantenidas y etiqueta de acierto sólo POST.
- `RESUMEN.json`: 5.000 simulaciones físicas y 5.000 igual anclaje+rutas, 4 controles deterministas, 90 terceros y diagnósticos por semana/turno.
- [GitHub Actions 38385605201: concluida correctamente](https://github.com/y0t3/Modelo-Papa/actions/runs/38385605201).
