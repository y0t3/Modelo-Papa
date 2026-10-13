# Control neutral de rutas históricas VT4 · 13/10/2026

**Rama:** `lab-vt4-transferencia-rutas-ganadoras-13oct2026`. Control **complementario** solicitado tras observar que la combinación D−7/D−1 capturó 5 cabezas completas en 4 cortes, frente a 4 cabezas del reparto anterior.

Mantener estrictamente el banco físico PRE, las diez plazas reales (dos hijas de cada una de cinco madres), la identidad madre+cifra+extremo y la tupla de puntuación **[eventos D−7 exactos, D−1 exactos, D−7 trasladados, D−1 trasladados]**. Los apoyos corresponden a eventos históricos reales con fecha/turno/jurisdicción/cabeza en `INVENTARIO_RUTAS_PRE_115.json`.

Para construir el placebo de **500 réplicas independientes**, en cada corte y **dentro de cada madre VT3**, permutar neutralmente entre sus hijas los cuatro conteos históricos **como una única tupla**. Se preservan los recorridos físicos y las cifras exactas de cada hija, el número de hijas, el volumen de señales históricas por madre y el cupo de dos. La permutación sólo desasocia artificialmente el mérito histórico de la ruta de la hija concreta, para medir cuánto importaba su correspondencia. No se presentará como una raíz real. Empates mantienen el puesto nativo del motor. Evitar cuaternas exactas repetidas entre los diez grupos.

**PRE**: retirar físicamente archivo `OBJETIVOS_POST_115.json` y fixture con futuras cabezas; crear y comprometer `PLACEBO_PRE_500.json` y sello SHA256 de las entradas y del script antes de cotejo.

**POST**: restaurar resultados y calcular para 115 cortes, en cada réplica, cantidad de **cabezas exactas** acertadas, número de cortes acertados, Top3/Top5/Top10 por corte y distribución de la ganancia respecto de las cuatro cabezas del reparto anterior. Comparar contra el caso D−7/D−1 verdadero (**5 cabezas, cuatro cortes**), sin elegir retrospectivamente la mejor réplica.

**Interpretación:** 500 permutaciones ayudan a detectar si la ganancia de una cabeza surge de la relación física entre apoyo histórico y ruta candidata. No prueban una ventaja predictiva: el corpus de 23 jornadas ya fue explorado muchas veces y escogimos la política combinada después de inspeccionar su rendimiento. Mantener `main`, motor, app y sellos anteriores intactos.
