# Seguimiento de figuras: ¿qué testigos discriminan las VT3 que Lalo no reconoce?
**Estudio observacional retrospectivo, 25/10/2026.** Rama: `lab/lalo-vt3-rastros-discriminacion-25oct2026`. Ningún cambio en `main`, el motor MV1, AUX ni APK.

## Problema
En el sábado 24/10 encontramos cinco terminaciones VT3 ganadoras que eran físicamente formables pero no reconocidas por MV1. La ampliación indiscriminada a seis jornadas generaba centenares de candidatas no ganadoras. El nuevo panel **Seguimiento de figuras** facilita observar su genealogía; aquí verificamos si las señales geométricas explican algo más que cobertura física.

## Reglas congeladas antes de analizar resultados
Cada corte es el instante PRE de Previa, Primera, Matutino, Vespertino y Nocturno, construido con **solo** cabezas y columnas ya conocidas, seis jornadas efectivas anteriores y Nocturna real por jurisdicción.

El universo de comparación son **todas las familias VT3 de tres celdas contiguas físicamente posibles en el corte PRE que NO figuran en ningún puesto del MV1**. Ningún camino cruza columnas. Los testigos son solamente cabezas ganadoras **publicadas ANTES del corte**, con su silueta geométrica comprobada, no formas abstractas del tablero.

Se evaluaron tres marcas binarias, sin añadir ni ordenar candidatas:
1. **DOS_DIAS**: silueta ganadora testificada en **al menos dos jornadas anteriores distintas**, mismo origen o columna vecina, traslado del ancla vertical <=2 filas.
2. **DOS_MISMA**: misma silueta testificada en **dos jornadas anteriores distintas** en la misma fuente, traslado del ancla <=1 fila.
3. **CADENA**: dos fechas cronológicamente ordenadas con fuentes s−2 y s−1, ambas con la silueta anterior y candidato en fuente s. Nunca se dibuja un camino transversal dentro de una hoja +11.

Se comparó cada marca con todas las familias no ganadoras de su mismo corte, no con una base numérica aleatoria ni otras jurisdicciones mezcladas. Se hicieron **5.000** sorteos aleatorios de etiquetas ganadoras por período/señal, manteniendo cada corte y su número de familias y ganadoras; son controles diagnósticos, no una estimación confirmatoria de capacidad de predicción.

## Reproducción MV1
**124 jornadas, 620 cortes, 3.321 cabezas**. Coincidencias de cabezas oficiales: **VT3 Top3 17, Top5 35 y Top10 59**. No se toca ningún puesto y todas las regresiones MV1/seguimiento temporal pasaron.

En total el denominador de **familias físicamente formables pero no reconocidas** es **52.537 exposiciones familia × corte**, de las cuales **539** acertaron como familia al menos una cabeza en su corte. No son 52.537 números distintos, ni 539 cabezas distintas; varias cabezas del mismo turno pueden caer en una única familia.

| Señal PRE | Exposiciones elegibles | Ganadoras elegibles | Ganadoras esperadas bajo selección aleatoria intra-corte | p aleatoria >= observado |
|---|---:|---:|---:|---:|
| DOS_DIAS | 28.646 | 295 | 293,82 | 0,4790 |
| **DOS_MISMA** | **4.465** | **59** | **45,71** | **0,0254** |
| CADENA | 2.919 | 30 | 28,91 | 0,4470 |

Hay 4.406 exposiciones NO ganadoras en DOS_MISMA. Por tanto no es una regla que por sí sola pueda identificar un acierto específico. La diferencia del control es exploratoria y sigue expuesta a selección de reglas/ventanas y a pruebas múltiples: **no demuestra ventaja predictiva, ni justifica apostar**.

### Estabilidad temporal (la comprobación crucial)

| Período | DOS_MISMA familias elegibles | Ganadoras observadas | Ganadoras esperadas al azar | p unilaterial |
|---|---:|---:|---:|---:|
| Junio–julio | 1.866 | 24 | 17,61 | 0,0730 |
| Agosto–septiembre | 1.839 | 28 | 20,54 | 0,0564 |
| **Octubre** | **760** | **7** | **7,56** | **0,6482** |

**Octubre no confirma la señal de dos días en la misma columna.** Aunque el agregado de los 620 cortes parezca favorable, el resultado fuera de los períodos antiguos es compatible con selección aleatoria, y el criterio se examinó entre varias configuraciones exploratorias. No editar un supuesto “umbral óptimo” tras mirar estos resultados.

### Sábado 24/10
Cinco VT3 ganadores físicamente posibles que MV1 no reconocía (9379, 1573, 9321, 5693, 5739). De las cinco:
- **DOS_DIAS** etiquetaría únicamente a `379/973` (Primera, 9379) y `739/937` (Nocturno, 5739), en grupos respectivos de 30 y 50 familias elegibles.
- **DOS_MISMA** no etiquetaría a ninguna de las cinco. Los grupos elegibles por turno tenían 3, 3, 3, 3 y 4 familias, respectivamente.
- **CADENA** no etiquetaría a ninguna.

Por lo tanto, ninguna señal nueva recupera el sábado como una selección estable. Se trata de **seguimiento**, no de mejores Tops.

## Qué hacer ahora
1. Mantener el registro de figuras en **Info** como observacional: formar, reconocer, guardar antecedentes, cambio entre fuentes y presencia en AUX AYER/HOY. El título de una sección debe dejar claro que **una figura con dos raíces no es una predicción**.
2. Conservar **DOS_MISMA** como única hipótesis exploratoria que merece observación futura, pero **no darle prioridad predictiva** ni cambiar la generación VT4 desde madre VT3.
3. Antes de próximos sorteos, congelar por corte una fotografía **PRE inmutable** del MV1, AUX AYER/HOY y las familias físicamente posibles con esta marca, indicando fecha/hora, fuentes y raíces. Después del sorteo, hacer cotejo POST sin recalcular selección.
4. Evaluar por bloque temporal *prospectivo* la diferencia de coberturas, la cantidad de falsas señales y cuánto aporta la coincidencia entre dos hojas, a igual presupuesto de candidatas. No entrenar la regla con los propios resultados que se usan para aprobarla.
5. Recién si gana repetidamente frente a controles y al MV1 en cortes **futuros sellados**, considerar un motor experimental de prioridad. Jamás sustituir el MV1 de producción automáticamente.

## Evidencia
- [GitHub Actions #40259981829](https://github.com/y0t3/Modelo-Papa/actions/runs/40259981829) — completado correctamente, incluye test de aislamiento de datos PRE y test de motor oficial.
- `scripts/lab-vt3-rastros-discriminacion.ts` — reproduce testigos, ventanas cronológicas y controles.
- [Resultados verificados](RESULTADOS-VERIFICADOS.json) — doce combinaciones período × regla, controles y cinco cortes del 24/10.
- Artefacto de Actions `seguimiento-vt3-controles-historicos` — desglose por corte, cabeza y familias físicas comparables.
