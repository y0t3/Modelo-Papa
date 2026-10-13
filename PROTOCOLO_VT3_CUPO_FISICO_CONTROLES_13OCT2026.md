# VT3 — control del cupo físico libre y diferencia contra desempates neutrales
13/10/2026 · rama `lab-vt3-cupo-fisico-controles-13oct2026`.

## Por qué hace falta este control
En los 115 cortes históricos el puesto **10** original tuvo **cero familias coincidentes**. Por lo tanto, substituir ese puesto no pierde ninguno de los aciertos observados, independientemente de qué criterio físico se elija. La variante `ABIERTA_FUENTE_RENOVADA_1` obtuvo Top10 18/115 versus 15/115 oficial, pero ese +3 tiene que distinguirse de abrir un cupo cualquiera. Toda la muestra ya se utilizó repetidamente; esto NO es un experimento ciego.

## Insumos PRE inmutables
Leer `auditorias/vt3-transformaciones-bloque-115-13oct2026/PRE_115.json` y `NOCTURNA_PRE.json`, con su `SELLO.json` verificado (el origen inmediato ya separa PRE y POST). Los objetivos salen sólo del `POST_115.json` de cobertura en etapa POST, nunca del generador PRE. Mover todos los POST de las carpetas relevantes fuera del checkout antes de crear controles y su sello. No alterar diez plazas ni familias reversible/inverso; sin dibujar rutas inexistentes ni cambiar su genealogía.

## Definición fija de elegibilidad
Para un corte posterior al primer día, una familia puede ocupar el puesto diez si:
- Está en el inventario físico PRE real (tres celdas contiguas en una fuente), **pero no tiene ninguna raíz transferida admitida** (familia no anclada).
- No comparte fuente homónima con ningún recorrido físico de la misma familia en el PRE de la última jornada operativa del **mismo turno** (`allSourcesNew`).
- No se afirma que sea nueva *hoy* ni que haya cambiado de raíz; es simplemente nueva respecto de su presencia por **fuente homónima interjornada**.
Si no existe candidata elegible, mantener el Top10 original. Los primeros nueve puestos jamás cambian.

## Selecciones PRE comparadas, antes del POST
- `ORIGINAL`: Top10 original.
- `RENEW_LAST_BLOCKS`: elegible que está en la fuente recién incorporada al corte primero, mayor número de bloques físicos distintos, alfabético (réplica exacta del criterio 18/115).
- `RENEW_MOST_BLOCKS`: cantidad de bloques descendente, luego fuente más reciente, alfabético.
- `RENEW_MOST_SOURCES`: fuentes físicas distintas descendente, luego bloques, alfabético.
- `RENEW_FEWEST_BLOCKS`: bloques ascendentes, alfabético.
- `RENEW_ALPHABETIC`: alfabético directo.
- `RENEW_REVERSE_ALPHA`: alfabético inverso.
- `RENEW_HASH_FIXED`: menor SHA256(`20261013|fecha|turno|familia`) entre elegibles; control neutro determinista.
- `RANDOM_NEUTRAL_2000`: 2.000 seleccionadores uniformes, con semilla fija 20261013, para cada corte elegible. Las 115×2.000 decisiones se generan y guardan **antes** de dar acceso al POST, cada una reemplazando sólo el puesto 10, sin elegir el mejor resultado POST.

## Métricas y falsación
Comparar Top3/Top5/Top10 de cada política, por mes y turno, rescates/pérdidas pareados y número de elegibles reales por corte. Reportar ganadoras **en el puesto 10** tanto del original como de cada regla.

- Distribución de las 2.000 elecciones aleatorias neutrales (promedio, mediana, p5/p95, máximo, fracción que alcanza o supera el resultado de `RENEW_LAST_BLOCKS`). Esta comparación es más relevante para su utilidad adicional que sólo contra el Top original.
- Controles adicionales por asignación de jornadas completas: 10.000 permutaciones libres, 10.000 sólo entre mismas fechas de día de semana, 10.000 dentro de septiembre/octubre, siempre moviendo juntos los cinco turnos. Comparar explícitamente **diferencia** `RENEW_LAST_BLOCKS - RENEW_HASH_FIXED` y `RENEW_LAST_BLOCKS - ORIGINAL`. No inventar tiempos, cabezas ni cruzar familias con fuentes físicas nuevas.
- La permutación por resultado es sólo una prueba negativa exploratoria; con 23 días y docenas de hipótesis anteriores el significado estadístico es limitado.
- Diagnóstico Nocturna 12/10 POST separado; cualquier regla que recoja 851 ya conocido se presentará como explicación retrospectiva, no acierto prospectivo.
- No pasar cambios al motor oficial ni VT4, aunque algún puntaje sea más alto.
