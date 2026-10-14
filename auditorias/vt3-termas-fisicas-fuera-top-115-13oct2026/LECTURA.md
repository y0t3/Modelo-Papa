# Auditoría de ternas VT3 físicamente presentes y no elegidas

**115 cortes — sólo lectura de hojas selladas.** Los 79 registros históricos de familia ganadora física sin raíz se contrastaron contra toda la exposición numérica disponible; no equivalen a 79 aciertos Top10.

## Exposición ajustada al tamaño de la bolsa

| Clase | Terminaciones 000–999 medias/corte | Cabezas observadas | Esperadas bajo uniforme | p bilateral Bonferroni (10) |
|---|---:|---:|---:|---:|
| A_1_3 | 5.583 | 5 | 3.21 | 1.0000 |
| A_4_10 | 13.47 | 12 | 7.745 | 1.0000 |
| A_11_PLUS | 86.209 | 47 | 49.57 | 1.0000 |
| B_NUEVA_MULTI | 0 | 0 | 0 | 1.0000 |
| B_NUEVA_SIMPLE | 39.965 | 19 | 22.98 | 1.0000 |
| B_PERSIST_MULTI | 13.843 | 6 | 7.96 | 1.0000 |
| B_PERSIST_SIMPLE | 80.2 | 47 | 46.115 | 1.0000 |
| B_PREVIA_MULTI | 0 | 0 | 0 | 1.0000 |
| B_PREVIA_SIMPLE | 9.6 | 7 | 5.52 | 1.0000 |
| NO_FISICA | 751.13 | 432 | 431.9 | 1.0000 |

## Sustituir una plaza del Top10 (nueve oficiales fijas)

| Política | Top3 | Top5 | Top10 | Ganó cortes | Perdió cortes | Sin raíz seleccionada (cortes) |
|---|---:|---:|---:|---:|---:|---:|
| OFICIAL | 5 | 8 | 15 | 0 | 0 | 0 |
| ANCLADA_11 | 5 | 8 | 16 | 1 | 0 | 0 |
| FISICA_NUEVA | 5 | 8 | 16 | 1 | 0 | 115 |
| FISICA_PERSISTE | 5 | 8 | 18 | 3 | 0 | 115 |
| FISICA_MAS_FUENTES | 5 | 8 | 16 | 1 | 0 | 115 |
| FISICA_MAS_FORMAS | 5 | 8 | 18 | 3 | 0 | 115 |
| FISICA_HASH_NEUTRO | 5 | 8 | 15 | 0 | 0 | 115 |

Control neutral de 2000 decisiones de la misma bolsa PRE, Top10 medio: 15.8785, intervalo percentil 5–95: 15–18.

**Interpretación:** descripción histórica, no prueba de ventaja; todas las selecciones PRE se fijaron antes de revelar los resultados en el workflow. No se alteró el motor ni la clasificación oficial.
