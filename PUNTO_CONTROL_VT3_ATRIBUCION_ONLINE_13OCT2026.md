# Punto de control VT3 — por qué los ejemplos recientes cambian la tercera candidata

**Fecha:** 13 de octubre de 2026 · **rama:** `lab-vt3-atribucion-aprendizaje-online-13oct2026` · [GitHub Actions 38388821676 — completada](https://github.com/y0t3/Modelo-Papa/actions/runs/38388821676).

## Qué verificamos

El experimento previo `lab-vt3-memoria-corta-online-13oct2026` demostró que añadir cabezas conocidas después de cada turno alteraba la tercera familia de `FUSION_CONSERVADORA`, sin aportar una mejora neta en aciertos. Esta auditoría reconstruye **por qué**, identificando los tres ejemplos específicos que más puntuación Jaccard aportan a cada candidata y separando coincidencia de **forma normalizada** de coincidencia en la **misma fuente y casillas exactas**.

**Se reprodujeron y verificaron exactamente las 90 elecciones de cada modalidad congeladas en la ejecución anterior.** El script aborta si un tercero no coincide. No se creó ni eligió una predicción alternativa después de ver sus resultados. Siguen intactos `main`, VT3 oficial, VT4, sellos, app, APK, rutas originales y hoja +11.

### Aislamiento temporal y procedencia

1. GitHub Actions movió todo `auditorias` fuera del checkout, permitiendo usar únicamente `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/PRE_115.json`, SHA256 `42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e`. Construyó fichas de las 90 hojas, `PRE_90.json` y `SELLO.json` con SHA256 de script/protocolo/entrada/salida **sin resultados**.
2. Sólo luego se restauraron las memorias docentes de X y las cabezas del historial; se reconstruyeron secuencialmente los bancos de ejemplos con índices estrictamente anteriores al corte evaluado.
3. En cada corte, para cada candidatura, se calculó el mismo algoritmo original: media del índice Jaccard de **los tres ejemplos más parecidos** sobre el conjunto de formas normalizadas de todos sus caminos propios. Desempates: anclaje histórico legítimo, puesto original y nombre canónico.
4. Para cada tercero se almacenaron nombres de los ejemplos previos, fecha/turno/familia, similitud, **rutas físicas en fuente y casillas de ambas familias**, formas compartidas, coincidencias en misma fuente, coincidencia de casillas exactas y si esas formas ya estaban presentes en la semana X. Los conjuntos de rutas ya fueron validados en el laboratorio físico anterior; no se prestan raíces entre familias.
5. Los Tops3/5/10 y el número de aciertos de las seis modalidades se compararon con los ya sellados. En el análisis `ONLINE_ACUMULATIVA`, retirar todos los ejemplos nuevos debe retornar exactamente el selector estático para cada corte.

**Advertencia:** la atribución explica la *puntuación de similitud* del algoritmo, **no** causalidad de una cabeza de quiniela sobre otra; los sorteos son aleatorios. Tampoco permite atribuir «misma forma» a «mismo evento histórico de raíz»: dos cabezas independientes pueden generar la misma forma normalizada.

## 1. Las formas que deciden las sustituciones son, casi siempre, viejas

| Modalidad de memoria | Terceros diferentes respecto a memoria semanal /90 | Entre los cambios, al menos uno de los 3 ejemplares más influyentes proviene de X+1 | Entre los cambios, ejemplo reciente comparte **forma inédita** respecto de X | Entre los cambios, ejemplo reciente comparte **forma ya presente en X** |
|---|---:|---:|---:|---:|
| X completa, sin actualizar | 0 | 0 | 0 | 0 |
| **X más todos los turnos ya sorteados de X+1** | **43** | **43** | **0** | **43** |
| Sólo positivos anteriores del día, fallback a X | 53 | 53 | **3** | **51** |
| Últimos 5 turnos con memoria móvil | **84** | 78 | **6** | **75** |
| Últimos 15 turnos | 75 | 67 | **2** | **65** |
| Control: últimos 5 turnos, pero ejemplos **no ganadores** | 88 | 83 | 6 | 79 |

**Las columnas de novedades y repeticiones no son necesariamente excluyentes.** «Forma inédita» significa sólo que la **forma compartida entre el ejemplo reciente y el tercero escogido** no aparecía en los ejemplares ganadores de X. Es una comparación de geometrías normalizadas, no de cifras, cabezas ni fuentes.

**Dato principal:** en los 43 cambios de `ONLINE_ACUMULATIVA`, hubo algún ejemplo reciente entre los tres más influyentes, pero **ninguno** aportó una forma de coincidencia geométrica nueva respecto de X. Sus ejemplos nuevos eran sorteos ya conocidos en X+1, pero **reutilizaban figuras que el aprendiz ya había visto**.

Por tanto, el cambio de preferencia puede ocurrir al **reforzar numéricamente patrones previamente conocidos**, aunque no aparezca una geometría nueva relevante. Esta es una descripción precisa del mecanismo de voto por ejemplos del aprendiz; no demuestra que esos patrones carezcan de cualquier otro respaldo físico independiente.

Los modelos de ventana de 5/15 turnos cambian aún más frecuentemente no sólo por añadir ejemplos, sino porque **olvidan** otros de X. No atribuir todos esos cambios exclusivamente al ingreso de nuevas cabezas. Los bancos tienen media 5,96 y 18,67 ejemplares, contra 36,67 en la memoria X sin actualizar y 53,60 en acumulativa.

## 2. Por qué una misma forma puede dominar aunque no haya una ruta igual

El puntaje asigna a cada candidata la media de similitudes respecto de los tres ejemplos anteriores más cercanos. Tres ejemplos con **una misma forma geométrica** pueden ocupar los tres lugares de voto, aunque tengan:
- familias/números diferentes;
- fuentes o casillas físicas diferentes;
- turnos y jornadas diferentes.

Esos son **tres ejemplos supervisados reales**, no tres raíces independientes de la candidata de hoy. La geometría se está contando repetidamente en el banco de entrenamiento. El inventario de X contenía de media **36,67 ejemplos**, pero sólo **29 firmas diferentes de conjuntos de formas**; el acumulativo tenía **53,60 ejemplos** y **39,57 firmas diferentes**, en promedio por corte. No se debe equiparar número de ejemplos a diversidad de geometría.

Lo comprobado es que el criterio actual permite **multiplicar peso por repetición de forma**, no que ese peso prediga resultados futuros.

### Ablación contrafactual
Al retirar los nuevos ejemplos de X+1 del banco acumulativo, los 90 cortes **vuelven exactamente** a los terceros de `ESTATICA_SEMANA_X` al ejecutar el selector. Por ello, los 43 cambios acumulativos no provienen de un error de reproducción: son consecuencia de añadir ejemplos a la función Jaccard de tres vecinos. La magnitud aportada por cada ejemplo sobre el margen de los dos candidatos quedó en `RESUMEN.json` como diagnóstico; **la ablación de un solo ejemplo sobre el margen no se debe confundir con recalcular todo el ranking sin ese ejemplo**.

## 3. El caso del único acierto: 21/09 Vespertino

Las cabezas de Vespertina sólo tenían una familia VT3 físicamente formable: **`246/642`**. VT3 original no la incluyó en Top10.

**Con toda la semana X:** la tercera aprendida fue `246/642`, y los tres ejemplos de mayor similitud de forma fueron:
- **15/09 Vespertino — `565/565`**: misma forma normalizada `0:0>1:1>1:0`; no necesariamente la misma fuente.
- **16/09 Nocturno — `070/070`**: misma forma `0:0>1:1>1:0`, también presente en `prevNocturno`.
- **19/09 Previa — `098/890`**: misma forma `0:0>1:1>1:0`, también en `prevNocturno`.

**Los tres tuvieron similitud Jaccard de 1** respecto a la candidata de un solo recorrido `246/642`, porque compartían esa forma normalizada. **Ninguno compartía las mismas casillas absolutas exactas**. El aprendiz no estaba anticipando las cifras 246 sino prefiriendo una geometría que encontró entre ganadoras anteriores.

**Con sólo los turnos ya sorteados del propio lunes**, en el momento de predecir Vespertina sólo había **un ejemplo positivo físico**, proveniente de:
- **21/09 Primera — `227/722`**, que había salido previamente en esa jornada. Este ejemplo tenía similitud Jaccard **1** con `227/722` en la hoja actual y coincidía en **cuatro caminos exactos de la misma fuente/casillas `prevNocturno`**. La modalidad `ONLINE_DIA_ACTUAL` por eso eligió `227/722`, pero **no volvió a salir** en Vespertina.

**Con últimos cinco turnos**, el tercero fue `046/640`, tampoco ganador; su principal parecido venía de `264/462` de 19/09 Nocturno. **Con X acumulada más lo nuevo del lunes**, en cambio, el tercero siguió siendo `246/642`.

Éste es un caso concreto de cómo **recopiar una familia ya ganadora con la misma ruta exacta** puede parecer una elección evidente al motor sin tener poder anticipatorio, mientras otra familia geométricamente análoga sí salió por azar. Ninguno de los casos prueba una ley para el turno siguiente.

## 4. Comparación con el historial completo: decisiones abundantes, ningún rescate online

| Política | Top3 /90 | Top5 /90 | Top10 /90 | Ganadoras seleccionadas como tercera |
|---|---:|---:|---:|---:|
| **VT3 original** | **3** | **6** | **11** | — |
| X fija | **4** | 5 | **12** | **1** |
| X + todo lo nuevo conocido | **4** | 5 | **12** | **1** |
| Sólo positivos del día | 3 | 4 | 11 | **0** |
| Últimos 5 turnos | 3 | 4 | 11 | **0** |
| Últimos 15 turnos | **4** | 5 | **12** | **1** |
| Control de negativos en 5 turnos | 3 | 4 | 11 | **0** |

Pese a 43, 53, 84, 75 y 88 cambios de tercera familia, respectivamente, **ninguna modalidad actualizada ganó un corte Top3 adicional a la memoria X fija**. Las modalidades del día y de 5 turnos perdieron precisamente el único rescate histórico.

**No hay todavía justificación para recompensar o penalizar automáticamente la novedad de formas.** Una forma repetida puede ser físicamente válida y llegar a coincidir, como `246/642`; una ruta idéntica a una ganadora anterior tampoco garantiza que la cabeza se repita.

## 5. Qué podemos aprovechar para el proyecto
- Una **explicación trazable** de cada tercero: tres ejemplos docentes que suman a su puntaje, fuente/casillas propias, semejanza por forma y por ruta exacta, fecha del aprendizaje y si aporta geometría inédita o reutilizada.
- Un diagnóstico de **peso geométrico por repetición**. El algoritmo actual cuenta votos de ejemplos, no solamente diversidad de formas. Es una posible razón de su inercia e inestabilidad entre turnos.
- Un contraste auditable entre «reconozco una forma», «repito la misma figura física en otra cabeza» y «es la misma ruta exacta»; las tres cosas son distintas.
- No tenemos evidencia suficiente para modificar el Top3 oficial: la quiniela es aleatoria y las mismas 23 fechas llevan muchas pruebas retrospectivas.

### Experimento siguiente, si deseamos continuar sin nuevos sorteos
Predefinir un selector con **un voto máximo por firma geométrica normalizada**, dejando el resto del algoritmo y las plazas fijos, y compararlo contra memoria original y controles neutrales de igual capacidad **en secuencia semanal X→X+1**. Eso probaría si la redundancia de ejemplos causa un problema de *ranking*, y no sólo un efecto descriptivo. Un posible resultado positivo seguiría siendo exploratorio por reutilización intensiva del mismo corpus; nunca modificar producción sin otra validación.

## Archivos y ejecución
- `PROTOCOLO_VT3_ATRIBUCION_ONLINE_13OCT2026.md`.
- `scripts/lab-vt3-atribucion-online.mjs`.
- `auditorias/vt3-atribucion-online-90-13oct2026/PRE_90.json` y `SELLO.json`, preconstituidos sin cabezas futuras.
- `POST_90.json`: **90 × 6** explicaciones de terceros originales y propuestos; cada ejemplo incluye fecha, turno, familia y rutas propias completas.
- `RESUMEN.json`: cambios globales, por semana/turno/día, contribuciones contrafactuales de ejemplos recientes y ejemplos del único acierto.
- [GitHub Actions 38388821676 — finalizada correctamente](https://github.com/y0t3/Modelo-Papa/actions/runs/38388821676).

**VT3 oficial y VT4 permanecen intactos.**
