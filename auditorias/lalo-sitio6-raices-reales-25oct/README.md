# Modelo Lalo · continuidad VT3 con hojas históricas reales (25/10/2026)

> Laboratorio aislado. **Modelo Lalo MV1 y rama `main` sin cambios.** Ninguno de estos resultados justifica anunciar probabilidades o ventajas de apuesta.

## A. Corregir la columna Nocturna también en las raíces históricas

Código: `scripts/lab-raices-historicas-nocturna-vt3.ts` en la rama
`lab/lalo-raices-historicas-nocturna-25oct2026`.
Ejecución de referencia: [Actions 40175094606](https://github.com/y0t3/Modelo-Papa/actions/runs/40175094606).

Una vez corregida la Nocturna de la hoja actual, se probaron cuatro versiones de las raíces D−1/D−7:
`OLD_ROOTS`, `REAL_D1`, `REAL_D7` y `REAL_BOTH`.

| Control VT3 | OLD_ROOTS | REAL_BOTH |
|---|---:|---:|
| Jornadas | 124 | 124 |
| Cortes PRE | 620 | 620 |
| Cabezas | 3321 | 3321 |
| Formables en hoja actual | 859 | 859 |
| Reconocidas por motor | 311 | 317 |
| Formables sin reconocimiento | 548 | 542 |
| Top3 | 16 | 17 |
| Top5 | 35 | 35 |
| Top10 | 58 | 59 |

Hubo seis cabezas físicamente formables que pasaron de no reconocidas a reconocidas. Entre ellas, Entre Ríos Previa 29/06, cabeza **6603**, ingresó al puesto VT3 #10. Fueron 13 jornadas con alguna diferencia de fuente histórica: 6 tuvieron distinta D−1, 7 distinta D−7. La corrección mejora la fidelidad del dato histórico; sus ganancias en Top son pequeñas y no implican superioridad estadística.

## B. Continuidad del sitio durante las últimas seis jornadas

Código: `scripts/lab-sitio6-raices-reales-vt3.ts`.
Ejecución de referencia: [Actions 40175428436](https://github.com/y0t3/Modelo-Papa/actions/runs/40175428436).

Ensayo acotado **SITE_6**, elegido antes de ejecutar esta variante:
- Utiliza solo el historial pasado, cinco/seis jornadas por corte.
- Figura = recorrido válido de tres casillas adyacentes en **una misma fuente**.
- Misma silueta geométrica, misma fuente, diferencia vertical a lo sumo dos filas; las activaciones proceden de cabezas anteriores realmente publicadas.
- Solo reordena las **mismas diez familias VT3** que MV1; no introduce familias ni cambia la genealogía VT4.
- La comparación de la modalidad VT3 sigue siendo por familias reversibles, con cabezas posteriores reservadas para POST.

| Bloque | Top3 MV1 con raíces corregidas | Top3 SITE_6 |
|---|---:|---:|
| Junio–julio | 8 | 11 |
| Agosto–septiembre | 7 | 9 |
| Octubre | 2 | 1 |
| **Total** | **17** | **21** |

Top5 total: 35 → 38. Top10 total: 59 → 59. En el Top3, 11 cabezas ganadas y 7 perdidas: saldo +4.

### Control aleatorio condicional
10.000 simulaciones reproducibles, eligiendo en cada corte tres familias aleatorias **del mismo Top10**. Esto mide únicamente el mérito de ordenar el subconjunto; no el mérito predictivo del conjunto de familias ni la ganancia económica.

| Grupo | Observado SITE_6 | Media aleatoria | Percentil 95 aleatorio | Fracción aleatoria >= observado |
|---|---:|---:|---:|---:|
| Junio–julio | 11 | 7,189 | 11 | 0,074 |
| Agosto–septiembre | 9 | 6,032 | 10 | 0,1165 |
| Octubre | 1 | 4,518 | 7 | 0,9952 |
| Agosto–octubre conjuntamente | 10 | 10,496 | 15 | 0,636 |
| **Total** | **21** | **17,704** | **23** | **0,2138** |

No supera el percentil 95 del control total ni muestra ventaja sostenida en el bloque posterior. Los criterios fueron explorados en varias pruebas previas, por lo que las fracciones anteriores no deben tratarse como valores p confirmatorios.

## Estado y conclusión

- **Aceptable como corrección física experimental:** última Nocturna auténtica por jurisdicción, también para generar las raíces históricas D−1/D−7.
- **No validado para la predicción oficial:** reemplazar la prioridad VT3 por SITE_6.
- **Pendiente del embudo físico:** de 859 cabezas formables, 542 continúan sin reconocimiento; nuevas heurísticas deben medirse contra grupos elegibles equivalentes, con Top fijo y resultados sellados PRE.
- **No tocar MV1 congelado:** aislar mejoras en motores comparables y seguir validación prospectiva cronológica.

Archivos de cada ejecución en su artefacto de GitHub Actions: `resumen.json`, `candidatos-estado.json`, `por-cabeza.json`, `historial-previo.json`, `estados-por-periodo.json`, `azar-condicional.json`, y el reporte D−1/D−7.
