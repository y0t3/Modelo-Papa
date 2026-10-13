# VT4: traslado de recorridos de cabezas ganadoras D−7 y D−1 a hijas físicas

**13 de octubre de 2026 · rama experimental `lab-vt4-transferencia-rutas-ganadoras-13oct2026`.** No tocar `main`, `src/motorLalo.ts`, la aplicación, las predicciones anteriores ni los sellos existentes.

## Hipótesis
Para cada hija VT4 formada físicamente desde madre VT3 reversible, comprobar si **sus recorridos de cuatro casillas** reproducen trazados VT4 que **explicaron cabezas completas ganadoras en una hoja pasada realmente marcada** (D−7 o D−1). No premiar un patrón simplemente porque pueda dibujarse: su fuente histórica debe ser una coincidencia `sheet.matches` con `hit.kind==='vt4'`, cabeza completa válida, lectura exacta y camino físicamente verificado. No crear marcas predictivas a posteriori.

## Matchings separados
- `EXACTO`: misma fuente de turno e idénticas cuatro celdas consecutivas del recorrido (se permite orientación invertida como geometría; no se exige igualdad de los cuatro dígitos entre semanas).
- `TRASLADO`: misma fuente y misma secuencia de movimientos de tres pasos adyacentes, con posible cambio de fila/origen dentro del tablero; inversión del sentido del recorrido se considera equivalente. Se permite cambio de cifras entre días.
- `MISMO_TURNO`: además de fuente y geometría, la **cabeza histórica marcada** corresponde al turno que estamos prediciendo.
- `OTRA_FUENTE`: placebo geométrico que compara la misma forma con marca de otra fuente de turno, **nunca** la considera un respaldo verdadero.

Cada cabeza histórica única por fecha/turno/jurisdicción/cabeza es **un evento**, aunque tenga varias rutas y un dibujo invertido. Cada candidata VT4 usa **sus rutas físicas propias**, jamás el respaldo de cualquier otra hija o sólo de su madre.

## Ranking, presupuesto y controles
Para cada uno de 115 cortes de 23 jornadas:
- Base: 2 hijas de cada madre VT3 #1–#5, diez plazas. Reproducir exactamente el benchmark guardado `CUPO_2` (115 cortes).
- `D7_EXACTO`: priorizar número de eventos ganadores D−7 con misma fuente y mismas casillas; orden nativo sólo para empates.
- `D7_TRASLADO`: eventos D−7 misma fuente y misma secuencia de movimientos, con prioridad secundaria a exactitud.
- `D7_MISMO_TURNO`: D−7 con misma fuente y mismo turno de la cabeza histórica.
- `D1_EXACTO`: eventos ganadores D−1 exactos.
- `D1_TRASLADO`: eventos ganadores D−1 con traslación.
- `D7_D1_COMBINADO`: tupla prioridad D−7 exacto, D−1 exacto, D−7 trasladado, D−1 trasladado.
- `OTRA_FUENTE_CONTROL`: controles de geometría parecida pero de fuente histórica diferente.
- `CONTROL_HASH`: desempate por hash PRE determinista, sin conocimiento de ganadoras presentes.

Todas las políticas usan **exactamente diez agrupaciones** (dos de cada madre) y no permiten que una misma cuaterna física exacta consuma dos plazas. Cuatro cifras alternativas en una misma etiqueta sólo cuentan si existe su propio camino de cuatro casillas. El hijo elegido no recibe historial ni raíces del otro hijo, no se invierte automáticamente toda la cuaterna.

## Temporalidad auditable
Usar el mismo `INPUT_PRE_115.json` preparado y sellado en el laboratorio anterior. Fase PRE sin `OBJETIVOS_POST_115.json` ni fixture futuro, ambos retirados físicamente del checkout. Analizar los `history[].sheet.matches` verdaderos D−7 y D−1, los cuales son previos al objetivo, producir rankings e inventarios `PRE_115.json`, `SELLO.json`, y **commitear antes de revelar POST**. Fase POST restaura POST y evalúa los cinco resultados argentinos por corte, cambios relativos, aciertos Top3/5/10, cobertura real D−7/D−1, y los tres casos de hijas ganadoras omitidas (`2735`, `5832`, `3729`). Un chequeo posterior de `5485` Primera 13/10 debe etiquetarse **retroactivo**, pues VT4 no estuvo sellado antes de aquel sorteo.

## Advertencias
Sólo 115 cortes históricos ya investigados; mejores resultados podrían reflejar minería retrospectiva de políticas. No aumentar la exactitud de predicción por definición, la quiniela es aleatoria. Si no hay bastantes marcas VT4 históricas, contabilizar el vacío como limitación real, no inventar apoyo. Nada se promueve a producción automáticamente.
