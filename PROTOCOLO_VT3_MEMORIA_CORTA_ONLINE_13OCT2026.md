# VT3 — ¿La memoria semanal sirve sólo 1, 2 o 3 jornadas? ¿Mejora reentrenar tras cada turno?

**Fecha:** 13/10/2026 · **Rama aislada:** `lab-vt3-memoria-corta-online-13oct2026`. No se modifica `main`, `src/motorLalo.ts`, hoja, recorridos oficiales, predicciones selladas, app, APK ni VT4.

## Pregunta concreta del usuario
Después de conseguir el **100 % de reproducción física** de las semanas de entrenamiento mediante memorias supervisadas (60/60 cortes alcanzables, Top3 o Top5 según cuántas familias ganadoras fueran físicamente formables), ¿es más útil esa memoria en **las primeras 1, 2 o 3 jornadas** de X+1 que a lo largo de toda la semana? ¿Se recupera utilidad al enseñar los recorridos correctos de **turnos ya sorteados**, actualizando el aprendizaje antes del próximo turno?

Los sorteos de quiniela son aleatorios. Este ensayo cronológico es retrospectivo, con las mismas 23 jornadas ya exploradas; **ninguna mejora demuestra eficacia futura**.

## Semanas y ventanas predeclaradas
Semanas del corpus lunes-domingo: 14/09 (5 fechas y 25 cortes), 21/09 (6 fechas y 30 cortes), 28/09 (6 fechas y 30 cortes), 05/10 (6 fechas y 30 cortes). Hacemos **tres transiciones X→X+1**, cada una con seis jornadas evaluables. Siempre cinco turnos en orden: Previa, Primera, Matutino, Vespertino y Nocturno, cinco jurisdicciones por turno. Dentro de las tres semanas X+1 agrupadas, ventanas **primer día** 15 cortes, **primeros dos días** 30 cortes, **primeros tres días** 45 cortes, **días 4–6** 45 cortes y **semana completa** 90 cortes. También reportar cada posición de día 1…6 y cada semana por separado, porque 15 cortes son muy pocos para evaluar mejoras.

## Insumos y sellado
Fuente PRE física **`auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/PRE_115.json`**, SHA256 `42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e`: todos los testigos físicos por familia y corte, sus formas, raíces propias e inventario; no resultados. Sus recorridos fueron validados antes como tres celdas físicamente adyacentes dentro de una fuente, sin extrapolar VT4.

Workflow GitHub: antes de construir `PRE_90.json`, apartar completamente `auditorias` y dejar solamente esa fuente PRE, verificando huella de contenido; registrar SHA256 del protocolo, script y PRE. Después restaurar los archivos anteriores (incluido `POST_115.json` de las cabezas reales) para ejecutar cronológicamente.

Para `STATIC_SEMANA` reproducir **exactamente** la tercera familia ya congelada por la `FUSION_CONSERVADORA` previa de `lab-vt3-dominio-semanal-top3-top5-13oct2026`, verificando los 90 Tops finales contra el archivo congelado. Ésta es una condición de integridad: no se puede cambiar la regla anterior tras conocer sus aciertos.

## Modelos PREDEFINIDOS, sin optimizar con resultados de la semana de examen
Aprendiz basado en el modelo anterior: 100 % de *reproducción* de las hojas X con libro supervisado de cabeza→familia y recorridos, **no** de selección autónoma de X; sobre hoja nueva ranking por máxima semejanza Jaccard de geometrías normalizadas, con media de las tres familias positivas más semejantes de la memoria. Se conserva el Top1 y Top2 VT3 oficiales; la tercera es la mejor candidata de **todo inventario físico salvo esas dos**, con empate a favor de raíz propia, rango original, alfabético. Top10 = [dos primeras originales, propuesta tercera, resto de Top original hasta completar diez], como en laboratorio anterior. Toda familia aprendida que se encuentre fuera del Top10 oficial reemplaza a la décima.

1. `OFICIAL`: VT3 original, Top3/Top5/Top10 sin cambios.
2. `ESTATICA_SEMANA_X`: positivos de la semana X completa, sin incorporar ninguna cabeza de X+1; idéntica a fusión conservadora congelada.
3. `ESTATICA_ULTIMO_DIA_X`: positivos de los cinco turnos del último día de X, sin reentrenamiento.
4. `ESTATICA_ULTIMOS_3_DIAS_X`: positivos de los últimos quince turnos de X, sin reentrenamiento.
5. `ONLINE_ACUMULATIVA`: semana X completa + todas las cabezas **ya sorteadas** de la semana de examen hasta justo antes del turno objetivo.
6. `ONLINE_DIA_ACTUAL`: sólo positivos de los turnos **anteriores del mismo día**, con respaldo de X completa cuando todavía ninguno disponible.
7. `ONLINE_ULTIMOS_5_TURNOS`: última jornada móvil = últimos cinco cortes efectivamente sorteados (incluyendo últimos de X hasta cubrir la ventana), sin mirar la fecha del objetivo.
8. `ONLINE_ULTIMOS_15_TURNOS`: últimos quince cortes efectivamente sorteados, incluidos X y la porción previa conocida de X+1.
9. `ONLINE_NEGATIVAS_5_TURNOS`: igual ventana últimos cinco, pero ejemplos de familias físicas que **no** ganaron en su turno, elegidas por hash PRE fijo en cantidad comparable, como control de especificidad del aprendizaje de ganadoras.
10. `HASH_FISICO`: mismo presupuesto de una tercera nueva externa, sin aprendizaje, SHA256(`20261013|date|turn|family`); control estático neutral.

Los modelos `ONLINE` sólo reciben ejemplos de un turno **después de publicar/registrar su resultado**. El PRE de X+1 del turno objetivo, y su Top, se construyen con `goals[j]` de índices **estrictamente menores** que el índice objetivo; ninguna cabeza actual/futura se utiliza para ordenar el mismo turno. El modo `ONLINE_DIA_ACTUAL` no usa sorteos anteriores de la misma fecha si no produjeron familia VT3 física; en ese caso conserva memoria X, sin inventar positivo.

Después de cada turno sorteado, realizar `docencia` retrospectiva: identificar **todas** las familias ganadoras físicamente formables en el inventario de ese turno (Top3/Top5 docente, cuando 1–3 o 4–5). Actualizar banco de ejemplos para turnos futuros. Incluir los turnos con resultado físico imposible en la secuencia de cinco y quince, aunque no aporten ejemplares positivos.

## Métricas y controles
- Para cada fecha de examen y rango de primeros 1, 2 o 3 días: Top3/Top5/Top10 en cortes, aciertos netos frente a VT3, rescates, pérdidas y denominador **físicamente representable**; por semana y jornada de vida de la memoria.
- Verificar que `ESTATICA_SEMANA_X` coincide con el **Top completo congelado** de la prueba previa, no sólo con su contador de aciertos; abortar si no coincide.
- Verificar que ninguna actualización de un turno incorporó resultados del propio turno, ni de un turno posterior; guardar últimos índices de entrenamiento y cantidad de ejemplos por política.
- Comparar `ONLINE_ACUMULATIVA` contra `ESTATICA_SEMANA_X`, `ONLINE_DIA_ACTUAL` contra `ESTATICA_SEMANA_X`, los modos de 5 y 15 turnos contra sus primeras jornadas, y `ONLINE_NEGATIVAS_5_TURNOS` como control.
- En la selección fija de una tercera plaza, 2.000 selecciones neutrales de familias externas con idéntico presupuesto, sembradas **antes de revelar POST**; comparar contra el número absoluto de aciertos (no premiar añadir una familia sólo por sacar rango10).
- Cuando el día1 o la semana inmediata mejore, tratarlo como hipótesis nueva, **no** como precisión demostrada: cada ventana tiene pocos ensayos y la fecha fue examinada repetidas veces. No elegir la mejor ventana a posteriori para modificar el motor.

## Entregables
`scripts/lab-vt3-memoria-corta-online.mjs`, workflow Actions, `auditorias/vt3-memoria-corta-online-90-13oct2026/{PRE_90.json,SELLO.json,POST_90.json,RESUMEN.json}` e informe Markdown. Todo en rama lab con ejecución verificada.
