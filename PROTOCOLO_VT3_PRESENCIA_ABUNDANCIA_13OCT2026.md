# VT3 — presencia geométrica contra abundancia de recorridos y memoria placebo
**13/10/2026 · rama `lab-vt3-presencia-vs-abundancia-13oct2026`.** No modificar `main`, VT3/VT4 oficiales, app, hojas, rutas ni Tops sellados.

## Hallazgo que dispara el control
En el experimento previo, `PRESENCIA_FORMAS` (unión de formas únicas ganadoras de X) obtuvo 5/90 Top3, 13/90 Top10, rescatando `067/760` del 28/09 Matutino y `226/622` del 06/10 Vespertino. El control `RECUENTO_RUTAS` (mayor cantidad de rutas físicas externas al Top10) encontró exactamente ambas ganadoras. En 66/90 cortes los terceros fueron los mismos; en los otros 24 no acertó ninguno. Eso sugiere que `PRESENCIA_FORMAS` podría actuar como sustituto de complejidad física, y no como aprendizaje específico de ganadoras.

## Pregunta y decisión experimental
Identificar qué rutas reales respaldaban ambas familias, si las formas se habían visto realmente en positivos X, y si el puntaje de presencia favorece automáticamente familias con muchos caminos. Contrastar contra controles **sin conocer ninguna cabeza de X** y contra bancos de memoria placebo donde las etiquetas positivas de la semana X se reemplazan por candidatas físicas neutrales **de la misma admisión y clase de cantidad de rutas**, conservando la cantidad de ejemplos reales positivos por corte.

## Insumos PRE inmutables y sellado
- `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/PRE_115.json`, SHA256 `42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e`: perfiles reales de todas las formaciones físicas, incluidos conjuntos de formas/recorridos y anclaje propio por cada familia y corte.
- `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`, SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`: testigos completos de fuente, casilleros contiguos y eventos raíz sin préstamo.
- En PRE aislar físicamente TODOS los POST mediante GitHub Actions, y producir fichas `PRE_90.json` con bolsas de externas, candidatos por rutas/fuentes/figuras y cantidades **sin cabezas objetivo**; sellar SHA256 de script, protocolo y ambos insumos físicos.
- En POST leer `auditorias/vt3-voto-unico-forma-90-13oct2026/POST_90.json` para verificar las 90 terceras `PRESENCIA_FORMAS` ya congeladas y `auditorias/vt3-control-tercer-puesto-90-13oct2026/POST_90.json` para verificar las 90 terceras `RECUENTO_RUTAS` ya congeladas. Solo después de generar ambas listas se consultan los resultados de X+1 para evaluarlas. Reproducción exacta obligatoria, sin optimizar por éxitos posteriores.

## Comparadores predefinidos con **exactamente una plaza externa**
Se mantienen Top1/Top2 VT3 originales, tercero externo físicamente válido, Top3–Top9 originales:
1. `PRESENCIA_FORMAS` previa, Jaccard entre formas únicas propias de la candidata y la unión de formas de ganadoras físicas de **semana X**.
2. `MAYOR_RUTAS` previa, maximizar caminos físicos **únicos por fuente/casillas**, sin etiquetas de X.
3. `MAYOR_FORMAS`: maximizar cantidad de formas físicas normalizadas diferentes de la candidata (no cantidad de testimonios), desempatar por anclaje/rango/nombre.
4. `BANCO_TODAS_FISICAS_X`: reemplazar las figuras de ganadoras de X por la unión de figuras de **todas las candidatas físicas** de X, sin ver objetivos X.
5. `BANCO_TOP10_X`: unión de figuras de las diez primeras ancladas originales de cada corte de X, sin etiquetas ganadoras.
6. `MEMORIA_PLACEBO_UNIFORME`: en X, para cada corte con n positivas físicas reales, escoger aleatoriamente n candidatas físicas únicas, conservando tamaño pero no etiquetas correctas.
7. `MEMORIA_PLACEBO_EMPAREJADA`: en X, por cada positiva física real escoger una candidata del mismo estado de anclaje **y misma categoría de cantidad de rutas** (`1`, `2–3`, `4–7`, `8+`), sin duplicar familia cuando sea posible; no usar el resultado de X+1.

Los dos últimos controles realizan **500 réplicas de las tres parejas semanales X→X+1**, con semilla fija. No seleccionar después la mejor réplica. Igual bolsa física externa e idéntica asignación de turno y semanas. La cantidad/clase de ganadoras reales en X se conoce históricamente para definir las etiquetas placebo; no usar ninguna respuesta del examen X+1 al escoger.

## Análisis de los dos casos
Para `067/760` 28/09 Matutino y `226/622` 06/10 Vespertino:
- Documentar todos los testigos con fuente y casillas reales, deduplicados por camino y orientación reversible; anclaje histórico legítimo y eventos raíz independientes. Distinguir rutas, formas y fuentes.
- La memoria X, sus figuras únicas y el grado de coincidencia de las figuras de esos candidatos; score Jaccard y posición frente a candidatas físicas externas.
- Acumulación de número de formas del banco y proporción de formas de cada candidata que estaban en X: si el banco ya contiene todas las formas accesibles, `PRESENCIA_FORMAS` equivale mecánicamente a una función de diversidad física.
- Explicar por qué `MAYOR_RUTAS` escogió la misma familia y si ambos métodos discrepan sólo en casos donde **ninguno** acertó.
- Registrar por corte asociación de ranking/puntaje con cantidad de caminos y tipos de raíces. Los casos ganadores no son evidencia independiente de capacidad futura.

## Resultado y cautela
Comparar Top3, Top5, Top10 sobre **los mismos 90 cortes**; reportar medias y proporción de controles placebo que igualan o superan los 5 Top3/13 Top10 del alumno. Informar si la señal geométrica sobrevive a controles que no aprenden cabezas verdaderas. Los 23 días del corpus se han explorado extensamente. Los sorteos de quiniela son aleatorios; **no** incorporar una regla a VT3/VT4 sólo por +2 retrospectivo.

Entregables: script `scripts/lab-vt3-presencia-abundancia.mjs`, workflow GitHub Actions, `auditorias/vt3-presencia-abundancia-90-13oct2026/{PRE_90.json,SELLO.json,POST_90.json,RESUMEN.json}` e informe Markdown.
