# VT3 · Atribución de ejemplos recientes que cambian la tercera familia
**13 de octubre de 2026 · rama `lab-vt3-atribucion-aprendizaje-online-13oct2026` · sin alterar `main`, motor VT3/VT4, aplicación, hojas, rutas oficiales ni predicciones selladas.**

## Pregunta
Cuando el aprendiz cambia la **tercera candidata externa** al actualizar su memoria con cabezas ya conocidas de la semana X+1, ¿cuáles son exactamente los ejemplos y sus **recorridos físicos propios** que provocan ese cambio? ¿Cuántas supuestas novedades son la misma forma repetida en otro turno? No queremos optimizar otra regla usando los aciertos conocidos.

## Congelamiento y datos
- Fuente estructural PRE: `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/PRE_115.json`, SHA256 `42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e`. Los recorridos físicos ya fueron auditados: tres casilleros reales adyacentes de una sola fuente, todas las orientaciones válidas; las familias son ternas reversibles, no VT4.
- Fuente de selección previa: `auditorias/vt3-memoria-corta-online-90-13oct2026/POST_90.json`, contiene **los 90 Tops congelados** del replay online, en que el modelo escogió antes de conocer el resultado de cada corte. Verificar *todas* las terceras producidas por una reproducción fiel del algoritmo anterior y abortar si alguna difiere. No usar resultados objetivos para construir nuevos Tops.
- Todos los objetivos de las 115 hojas en `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/POST_115.json`: disponibles solo en la fase POST de análisis, y cada selección del corte `i` utiliza para su banco de ejemplos positivos únicamente índices anteriores `j<i` de semanas disponibles o del mismo día ya publicados.
- Preparación PRE separada en GitHub Actions, moviendo TODO el directorio `auditorias` fuera de lectura; reconstruir listas de candidatas para los 90 cortes, seleccionar el banco vacío aún sin resultados, congelar `PRE_90.json`, `SELLO.json` y SHA256 de script y protocolo.

## Atribución física — no sólo etiquetas
Se auditan estos modos **existentes, sin cambiar sus decisiones**:
- `ESTATICA_SEMANA_X`: todos los ejemplos de familias ganadoras físicas de la semana X completa.
- `ONLINE_ACUMULATIVA`: mismos ejemplos más todos los positivos de turnos conocidos de X+1.
- `ONLINE_DIA_ACTUAL`: solamente positivos de turnos del mismo día antes del objetivo, si hay; si no, fallback a X.
- `ONLINE_ULTIMOS_5_TURNOS` y `ONLINE_ULTIMOS_15_TURNOS`: sólo los últimos 5 o 15 cortes ya sorteados incluyendo fin de X.
- `ONLINE_NEGATIVAS_5_TURNOS`: ejemplos de familias no ganadoras de turnos anteriores, control ya fijado.

Para **cada corte y cada propuesta**, replicar exactamente la puntuación `media(Jaccard de los 3 ejemplos más parecidos a la candidata)`, con mismo orden de desempate que el motor experimental original. En la propuesta escogida y en la candidata que proponía la memoria estática, devolver:
- puntuaciones bajo la memoria estática y la actual, margen de una sobre otra y cambio del margen;
- **tres ejemplos realmente más influyentes** en el score, cada uno con fecha y turno anterior, familia, nombre de fuente y conjunto de caminos físicos normalizados. Mostrar rutas coincidentes **de la candidata del presente**, no cruzar rutas de dos fuentes ni atribuir raíces prestadas;
- número de ejemplos recientes entre esos tres, cuántos aportan alguna forma que no estaba en los positivos de X, cuántos repiten geometrías existentes, cuántos vienen del mismo turno/día, cantidad de fuentes y caminos distintos;
- **ablación contrafactual**: quitar todos los ejemplos recientes para `ONLINE_ACUMULATIVA` debe reproducir exactamente `ESTATICA_SEMANA_X`; retirar todos los ejemplos positivos del día para `ONLINE_DIA_ACTUAL` debe producir la candidata estática (si el banco original no era fallback). Para modos de ventana, cuantificar candidatos alterados pero **no** llamarlos «causados por nueva evidencia», pues pueden cambiar solamente al olvidarse de ejemplos previos.
- reconocer si **no hay coincidencia de forma en absoluto** entre los ejemplos más próximos y el seleccionado (caso desempate oficial en lugar de aprendizaje), y si la supuesta novedad es sólo un camino adicional con la **misma forma geométrica**.
- agrupar las comparaciones por los 43 cambios de `ONLINE_ACUMULATIVA` respecto del fijo y los 84 cambios de `ONLINE_ULTIMOS_5_TURNOS`, y describir los cambios negativos para no estudiar solo el único acierto.

La clave de una evidencia geométrica independiente es `forma normalizada`, **no** el número de testimonios. Cada ejemplar es una familia positiva diferente en su corte: dos cabezas de distintas jurisdicciones que produzcan igual terna no suman dos votos. Una misma forma de dos ejemplos en dos turnos sigue siendo repetición de geometría aunque los sorteos de origen sean distintos. Registrar ambos niveles por separado.

## Controles
- Recalcular EXACTAMENTE las terceras para los 90 cortes y 6 métodos de memoria enumerados, a partir de fuentes y códigos inmóviles.
- Comparar qué habría cambiado si se hubieran *agregado* sólo las nuevas positivas frente a *reemplazar* el banco entero por turno/día; no confundir ambos mecanismos.
- Verificar con los resultados históricos que rescates/pérdidas sigan siendo los mismos que en el estudio ya sellado. No implementar nuevos Top3/Top5, pesos, admisiones ni propuestas escogidas después de POST.
- Medir también los ejemplos negativos anteriores que generan puntuación geométrica elevada; una coincidencia de forma compartida por ganadores y no ganadores limita la especificidad del mecanismo.
- Resultados por semana, día, turno y grupo de cambios, incluyendo documentos detallados de **todos los 90 cortes**. Número de aciertos minúsculo y corpus reiteradamente explorado: jamás interpretar coincidencia descriptiva como aumento demostrado de probabilidad futura.

## Entregables
`scripts/lab-vt3-atribucion-online.mjs`, `.github/workflows/lab-vt3-atribucion-online.yml`, `auditorias/vt3-atribucion-online-90-13oct2026/{PRE_90.json,SELLO.json,POST_90.json,RESUMEN.json}` e informe final Markdown. Sólo rama lab.
