# Punto de control VT3 — vida útil de memoria semanal y reenseñanza turno por turno

**13 de octubre de 2026 · Rama experimental `lab-vt3-memoria-corta-online-13oct2026`.** Ejecución [GitHub Actions 38387395952 — concluida correctamente](https://github.com/y0t3/Modelo-Papa/actions/runs/38387395952). No se cambió `main`, `src/motorLalo.ts`, VT3/VT4 oficiales, hojas físicas, rutas, sellos previos, app ni APK.

## Qué se quiso comprobar

La propuesta del usuario es distinguir dos hipótesis:
1. El aprendiz reproduce al **100 %** las familias ganadoras físicamente posibles de una semana X —Top3 cuando caben tres, Top5 cuando hay cuatro o cinco— pero quizá su memoria geométrica sirva sólo **en el primer, segundo o tercer día** de X+1 y luego pierda relevancia.
2. En vez de conservar la misma memoria toda X+1, **volver a enseñarle** al aprendiz los recorridos reales de las cabezas que ya salieron en Previa, Primera, Matutino, etc., y reevaluar el siguiente turno. No permitir aprender del resultado que se pretende anticipar.

El «100 %» previo (**60/60 cortes físicamente alcanzables de tres semanas de entrenamiento**) consistió en un **libro supervisado de casos con familias ganadoras conocidas**. Reprodujo X sin releer resultados porque el libro memorizaba las respuestas; NO había adquirido una regla universal capaz de adivinar resultados futuros. La transferencia a X+1 utiliza similitud de rutas físicas, no la misma lista de familias ganadoras de X. El valor predictivo es la variable bajo examen.

## Datos, control de fuga y procedimiento
- Corpus inmutable: 23 fechas / 115 cortes. PRE `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/PRE_115.json`, SHA256 `42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e`. Las rutas propias ya habían sido validadas como trayectos de 3 celdas físicamente vecinas en una sola fuente, sin préstamo de raíces ni dígitos VT4.
- Tres pares X→X+1 en semanas calendario: 14/09→21/09, 21/09→28/09 y 28/09→05/10. Cada semana de examen contiene **seis fechas, cinco turnos cada una**: 30 cortes. Total **90 cortes en 18 jornadas**.
- PRE: workflow apartado físicamente **todo** `auditorias` salvo el único PRE anterior, creó `PRE_90.json`, y selló 2.000 controles neutrales físicos para cada corte en `NEUTRALES_PRE.json` y SHA256 de datos, código y protocolo en `SELLO.json`. Sólo después recuperó las cabezas de los sorteos y las memorias supervisadas de la semana X, y recorrió secuencialmente cada fecha/turno de X+1.
- Se comprobó que el método `ESTATICA_SEMANA_X` reproducía **exactamente los 90 Top10 completos y ordenados** de `FUSION_CONSERVADORA` ya congelados en la prueba anterior. No se ajustó el modelo retrospectivamente para esta prueba.
- Para cada turno, primero se generaron y fijaron TODOS los Tops usando únicamente los cortes de índice **menor** y sus resultados ya conocidos; después se verificó la cabeza actual y se añadieron a memoria las familias físicamente positivas del turno recién terminado (o cero cuando no existían).
- Misma capacidad para todas las variantes nuevas: preservar las dos primeras familias oficiales, elegir una sola tercera **físicamente disponible y externa al Top10 original** mediante semejanza de formas con la memoria, y conservar las siguientes siete oficiales. No cambiar diez por once, ni añadir candidatas irreales.

## 1. Ventanas de 1, 2 y 3 jornadas

Son acumulaciones de las primeras fechas de **cada una de las tres semanas**; los denominadores 15, 30, 45 y 90 no son muestras independientes unas de otras.

| Ventana | Cortes | Techo físico, cortes con ganadora posible | Oficial Top3 | Memoria semanal Top3 | Oficial Top10 | Memoria semanal Top10 |
|---|---:|---:|---:|---:|---:|---:|
| Sólo **primer día** | **15** | 11 | 0 | **1** | 1 | **2** |
| Primeros **dos días** | **30** | 23 | 0 | **1** | 3 | **4** |
| Primeros **tres días** | **45** | 31 | 1 | **2** | 4 | **5** |
| Días **4 a 6**, aislados | **45** | 30 | 2 | **2** | 7 | **7** |
| **Seis días completos** | **90** | 61 | 3 | **4** | 11 | **12** |

**Hecho importante:** toda la ganancia histórica de la memoria semanal ocurrió **el primer día (21/09 Vespertino)**, sin rescates netos adicionales en los restantes. Los últimos tres días empatan 2/45 Top3 y 7/45 Top10. Esto es compatible con la noción de ventana corta, pero NO permite atribuir causalidad a un «vencimiento» de memoria: el único rescate se conoce desde las pruebas anteriores, y los otros dos primeros días (28/09 y 05/10) no se recuperó ningún corte adicional.

### Evolución día a día, Top3 / Top10
| Posición del día dentro de X+1 | Cortes | Oficial | Memoria fija |
|---|---:|---:|---:|
| Día 1 | 15 | 0 / 1 | **1 / 2** |
| Día 2 | 15 | 0 / 2 | 0 / 2 |
| Día 3 | 15 | 1 / 1 | 1 / 1 |
| Día 4 | 15 | 0 / 3 | 0 / 3 |
| Día 5 | 15 | 1 / 2 | 1 / 2 |
| Día 6 | 15 | 1 / 2 | 1 / 2 |

En ninguno de los días 2–6 la memoria fija recuperó un nuevo Top3/Top10 frente al original. Top5 global: oficial **6/90**, memoria fija **5/90**; por tanto, la selección Top3 del alumno no se debe presentar como ventaja en todos los tamaños de Top.

## 2. Reaprendizaje online después de cada turno

Todos los métodos usan el mismo mecanismo de similitud geométrica; cambia únicamente **qué ejemplos docentes pasados están disponibles** para elegir la tercera nueva.

| Memoria usada para la siguiente hoja | Top3 /90 | Top5 /90 | Top10 /90 | Recuperaciones netas Top3 vs VT3 |
|---|---:|---:|---:|---:|
| VT3 oficial | **3** | **6** | **11** | — |
| Semana X completa, **congelada** | **4** | 5 | **12** | **+1** |
| Sólo último día de entrenamiento X | **4** | 5 | **12** | +1 |
| Últimos 3 días de entrenamiento X | **4** | 5 | **12** | +1 |
| Semana X + todos los resultados X+1 anteriores al turno actual | **4** | 5 | **12** | +1 |
| Sólo turnos ya salidos **hoy** (si no hay ejemplo, volver a X) | 3 | 4 | 11 | 0 |
| Últimos **5 turnos** completados | 3 | 4 | 11 | 0 |
| Últimos **15 turnos** completados | **4** | 5 | **12** | +1 |
| Control: ejemplos de **familias no ganadoras** de los últimos 5 turnos | 3 | 4 | 11 | 0 |
| Control fijo por hash, tercera física externa | **4** | 5 | 11 | +1 Top3, 0 Top10 |

La actualización acumulativa **cambió la tercera propuesta en 43/90 cortes** respecto a mantener X fija, pero **no ganó ni perdió** ningún corte Top3/Top10 en la muestra. La ventana de últimos **15 turnos** la cambió en **75/90**, con exactamente los mismos aciertos. La memoria de últimos **5 turnos** cambió **84/90**, perdió el único rescate de la memoria semanal y no recuperó ninguno nuevo.

La lectura correcta NO es «el aprendizaje dura quince turnos» ni «vuelve a aprender con éxito»: las políticas de un día y cinco turnos produjeron Top3 3/90, indistinguibles en número del VT3 original; los resultados son demasiado escasos para inferir una vida útil específica de la memoria.

## 3. El caso decisivo del primer día: `246/642`
**21/09/2026, Vespertina.** El PRE contenía **una sola familia ganadora físicamente posible** entre las cinco cabezas, `246/642`. En ese momento el sistema ya había visto Previa, Primera y Matutino de ese lunes.

| Política | Tercera propuesta | Resultado |
|---|---|---|
| VT3 original | `387/783` | Fallo |
| Semana X completa | **`246/642`** | **Acierto** |
| Sólo último día de X | **`246/642`** | **Acierto** |
| Últimos tres días de X | **`246/642`** | **Acierto** |
| X más cabezas recientes de X+1 | **`246/642`** | **Acierto** |
| Sólo resultados anteriores de ese día | `227/722` | Fallo |
| Últimos cinco turnos | `046/640` | Fallo |
| Últimos quince turnos | **`246/642`** | **Acierto** |
| Control con familias no ganadoras de cinco turnos | `193/391` | Fallo |
| Hash fijo | `565/565` | Fallo |

El PRE demuestra que `246/642` **ya venía físicamente idéntica desde el turno anterior** y no incorporó una ruta ni un evento raíz nuevos en Vespertina. Los ejemplos positivos de la semana anterior eran **37**; los positivos obtenidos durante ese lunes antes de Vespertina eran **1**. Con una memoria de **solo un** ejemplo intradía, el alumno prefirió otra terna; con la memoria histórica retenida siguió eligiendo `246/642`. **Actualizar no es necesariamente mejorar.**

## 4. Controles de azar de la misma plaza
Antes de POST quedaron selladas **2.000 terceras elecciones neutrales por corte**, uniformes entre familias físicas fuera del Top10 original, con Top1–Top2 original y siete miembros más originales. Son controles de un solo reemplazo, no cambios de todo el ranking.

| Ventana | Top3 memoria semanal | Top3 promedio neutral | Neutrales ≥ memoria semanal |
|---|---:|---:|---:|
| Primer día /15 | **1** | 0,1455 | **13,75 %** |
| Primeros 2 días /30 | **1** | 0,3010 | 26,10 % |
| Primeros 3 días /45 | **2** | 1,3680 | 30,80 % |
| Semana /90 | **4** | 3,7120 | **50,90 %** |

Para Top10, los neutrales que alcanzaron los **2/15** del primer día fueron **13,75 %**, y los que alcanzaron o superaron **12/90** en toda la semana fueron **47,10 %**. Estos porcentajes son descriptivos de réplicas sobre el mismo historial repetidamente explorado, no valores de probabilidad de acierto futuro ni una prueba estadística confirmatoria. El único rescate no justifica promocionar un tiempo de vida de uno o tres días.

## 5. Conclusiones y decisión
1. **La hipótesis de utilidad inmediata es plausible, pero no está respaldada de manera sólida.** La única ganancia está en el primer día de una de tres semanas; en las otras dos transiciones no hay rescate temprano y los Top3/Top10 posteriores empatan con el oficial.
2. **Reentrenar tras cada turno es viable causal y técnicamente**, y quedó implementado como laboratorio de replay: nunca necesita conocer la cabeza del turno objetivo. Pero en esta muestra no aumentó las coincidencias. Retener toda X + actualizar no superó a X congelada; reemplazar memoria X por únicamente turnos recientes hizo perder el rescate.
3. **No debe confundirse el 60/60 de las semanas de entrenamiento** —memorizar las cabezas ya conocidas, con Top5 cuando correspondía— con la capacidad de seleccionar nuevas cabezas por similitud geométrica.
4. **Mantener intactos VT3 y VT4**, sin modificar pesos ni fijar caducidad semanal de memoria por un solo caso. En vez de seguir ajustando ventanas de 1, 2, 3, 5 y 15 turnos para conseguir mejores números históricos, el próximo estudio útil sería registrar para cada candidata que el sistema cambia **qué ejemplos exactos anteriores la favorecieron** y comprobar si provienen de fuentes/recorridos realmente independientes o si sólo se acumuló una geometría repetida. Ese es un diagnóstico de causalidad del ranking, no un pronóstico.
5. El corpus sólo tiene 23 fechas y se empleó en múltiples laboratorios. Las quinielas son sorteos aleatorios: la inercia, recencia, geometría o supervisión sobre resultados conocidos **no producen por sí mismas una ventaja predictiva**.

## Evidencia reproducible
- `PROTOCOLO_VT3_MEMORIA_CORTA_ONLINE_13OCT2026.md` (hipótesis y políticas anteriores a POST).
- `scripts/lab-vt3-memoria-corta-online.mjs`.
- `auditorias/vt3-memoria-corta-online-90-13oct2026/PRE_90.json`, `NEUTRALES_PRE.json`, `SELLO.json`.
- `POST_90.json`: **cada una de las 90 predicciones** y todas las memorias disponibles en ese instante; índices de entrenamiento para auditar que son estrictamente anteriores al índice evaluado.
- `RESUMEN.json`: totales Top3/5/10, día por día, ventanas acumuladas, rescates/pérdidas, tres transiciones y 2.000 controles neutrales.
- [GitHub Actions 38387395952 — exitosa](https://github.com/y0t3/Modelo-Papa/actions/runs/38387395952).

**VT3 oficial y VT4 intactos.**
