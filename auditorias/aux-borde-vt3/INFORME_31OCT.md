# VT3 AUX: intercambios controlados entre los puestos 8–10 y 11–13

**Laboratorio retrospectivo PRE · 31/10/2026 · Rama:** `lab/aux-vt3-intercambios-borde-31oct2026`.

## Pregunta y protocolo

Tras el estudio de figuras, eventos únicos y dispersión de sus antecedentes, se ensayó un **desempate conservador cerca del límite del Top10**. El ranking histórico **no cambia**: se compara un Top10 original con un selector que conserva los puestos 1–7 y solo puede sustituir una o dos familias de los puestos 8–10 por otras de 11–13.

- Tableros independientes AUX Ayer y AUX Hoy; recorridos VT3 de tres celdas contiguas válidas, con cruces entre franjas del **mismo** tablero y familias reversibles. No se mezclan hojas.
- 119 jornadas PRE reconstruidas: 77 de junio–agosto, 42 de septiembre–octubre, excluyendo jornadas incompletas de 20/6 y 9/7 y 1–11/10. Se evalúan cinco cabezas por turno (no Montevideo). Para comparar, se usan **únicamente cortes con Top20 completo**, no inventar candidatas ausentes.
- El motor oficial AUX puntúa con los eventos ganadores D−1 y D−7 **ya deduplicados por cabeza**, sin contar caminos como votos independientes. La prueba usa también recuerdos geométricos compatibles en las **seis jornadas sorteables previas** sin leer los resultados objetivo.
- Los antecedentes de sitio exacto, silueta desplazada y cruce se leen únicamente de las formaciones físicas PRE. La puntuación fija de laboratorio `2×min(días distintos,4) + 2×min(días exactos,2) + 0,5×min(días desplazados,3) + indicador de cruce + 0,5×min(raíces originales,5) + indicador de raíces en ambas referencias` se usa solo para ordenar pares. **No fue entrenada estadísticamente ni seleccionada por optimización**.
- Solo se admite un intercambio si la nueva candidata tiene puntuación al menos **1** mayor y **como máximo una raíz original menos** que la excluida. Un método admite un intercambio y otro hasta dos. Las candidatas posibles para salir son 8–10; para entrar 11–13. Los puestos 1–7 quedan fijos.
- Cinco controles neutrales, para **cada** modalidad, hacen **exactamente la misma cantidad de intercambios** en las mismas seis posiciones limítrofes, por selección determinista basada en una semilla independiente de los resultados POST. Se registran las familias que entran, salen y si recuperaron o perdieron cabezas.

## Resultados, solo cortes con veinte familias

| Modo y etapa | Cortes | Top10 | 1 swap | Hasta 2 swaps | 5 controles para 1 swap, media | 5 controles para 2 swaps, media |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| AUX Ayer, Previa–Matutino | 351 | **38** | 36 | 37 | 37,4 | 37,8 |
| AUX Ayer, Vespertino–Nocturno | 234 | **21** | **21** | 20 | 20,6 | 18,8 |
| AUX Hoy, Previa–Matutino | 176 | **20** | 19 | 18 | 20,6 | 22,0 |
| AUX Hoy, Vespertino–Nocturno | 228 | 19 | **22** | **22** | 20,0 | 20,8 |

Un acierto representa cabeza real VT3 cubierta por una familia seleccionada, **no** número de apuestas ni ganancia monetaria.

### Cuántos intercambios se ejecutaron realmente

| Modo y etapa | Cortes que cambiaron al menos 1 | Cambios totales con hasta 2 | Aciertos rescatados / perdidos con hasta 2 |
| --- | ---: | ---: | ---: |
| AUX Ayer, temprana | 285/351 | 393 | 5 / 6 |
| AUX Ayer, completa | 190/234 | 262 | 2 / 3 |
| AUX Hoy, temprana | 149/176 | 207 | 0 / 2 |
| AUX Hoy, completa | 192/228 | 276 | **3 / 0** |

Aunque se cambia solo uno o dos nombres, **se cambia en muchos turnos**: aproximadamente cuatro de cada cinco cortes completos. No llamarlo un filtro excepcional ni asumir que la pequeña ventaja de AUX Hoy compensa tantos cambios: la mayoría de los intercambios no modifican los aciertos.

### Estabilidad de períodos

| Hoja completa | Período | Top10 | 1 swap | 2 swaps |
| --- | --- | ---: | ---: | ---: |
| AUX Ayer | Junio–agosto | 15 | 16 | 15 |
| AUX Ayer | Septiembre–octubre | 6 | 5 | 5 |
| AUX Hoy | Junio–agosto | 12 | 13 | 13 |
| AUX Hoy | Septiembre–octubre | 7 | 9 | 9 |

La pequeña mejora de AUX Hoy se observa en ambos períodos: +1 y +2 frente al original. Sin embargo, son pocos casos y el control neutral es cercano; ambos bloques se conocían antes de proponer este experimento, por lo que no representan una comprobación ciega.

### Incertidumbre al remuestrear jornadas completas

Bootstrap **descriptivo** de 10.000 remuestreos de fechas, manteniendo juntos los turnos de una misma fecha:

| Hoja completa | Método | Ganancia | Intervalo orientativo del 95 % |
| --- | --- | ---: | ---: |
| AUX Ayer | 1 swap | 0 | **−4 a +4** |
| AUX Ayer | 2 swaps | −1 | **−5 a +3** |
| AUX Hoy | 1 swap | +3 | **0 a +7** |
| AUX Hoy | 2 swaps | +3 | **0 a +7** |

**Ningún intervalo excluye el cero.** Además se han ensayado diversas variantes en los laboratorios previos: no corregimos por selección múltiple ni existe todavía un período prospectivo sellado.

## Caso visual de interés: Santa Fe, 29/10, Nocturna

La cabeza **2813**, familia VT3 **318/813**, estaba en el puesto **12 de AUX Ayer** con cuatro raíces del ranking original y cinco testigos geométricos distribuidos en cinco jornadas previas.

**No fue promovida** por ninguno de los dos selectores de borde el 29/10. La modalidad de un intercambio eligió sustituir **557/755 (#10)** por **457/754 (#13)**; ni la salida ni la entrada produjo acierto en esa Nocturna. Este caso muestra que disponer de un antecedente llamativo no es suficiente para construir una regla de desempate que recupere las ganadoras.

## Decisión

**No incorporar ninguno de los dos selectores a producción.** Para AUX Ayer, no se encontró ganancia; para AUX Hoy completa, la mejora de tres cabezas no se separa de manera convincente del control neutral y los intervalos incluyen cero. Conservar el Top10 original de cada motor y no ampliar cantidades de apuestas.

El análisis identifica mejor **qué cambios concretos** está haciendo una hipótesis, permitiendo explicar a posteriori un candidato rescatado/perdido. La vía metodológicamente más sana ahora es conservar **una política sencilla ya fijada** en PRE futuro, sin recalibrarla a las jornadas de octubre, y comparar contra Top10 y controles. No implica modificar la APK o jugar más números.

## Reproducción

- `src/labAuxBorderSwapsVT3.ts`: puntuación fija geométrica-temporal, criterio de sustitución, hasta dos intercambios y controles nulos con mismo número de swaps.
- `scripts/test-aux-borde-vt3.ts`: conservación de puestos 1–7, filtro de raíces, diez familias únicas, controles pareados y fallback cuando no hay veinte familias.
- `scripts/lab-aux-borde-vt3.ts`: PRE reconstruido con exportación por corte y explicación de familias que entran y salen, incluyendo rescate/pérdida POST.
- `.github/workflows/lab-aux-vt3-borde.yml`: evaluación por los dos períodos con regresión de motor Lalo.
- [GitHub Actions, ejecución validada](https://github.com/y0t3/Modelo-Papa/actions/runs/41164428913): ambos trabajos en success.
- Artefactos `aux-borde-vt3-junio-agosto` y `aux-borde-vt3-septiembre-octubre` con JSON completo.

**Sin cambios en main, MV1, app ni APK.**
