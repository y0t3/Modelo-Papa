# VT4 independiente — resultados del laboratorio 24/11/2026

Fuente: [Actions 45490607304](https://github.com/y0t3/Modelo-Papa/actions/runs/45490607304), dos jobs exitosos. PRE reconstruido, no prospectivo. Cinco jurisdicciones objetivo, Montevideo solo fuente. 115 + 95 cortes completos, 575 + 475 cabezas.

| Cobertura | Sept-oct observado/esperado | Nov observado/esperado |
|---|---:|---:|
| Lalo | 47 / 45.250 | 33 / 37.796 |
| AUX AYER | 42 / 40.350 | 35 / 37.595 |
| AUX HOY | 15 / 22.601 | 16 / 20.842 |
| Unión | 98 / 101.213 | 76 / 89.645 |
| Exactamente dos hojas | 6 / 6.718 | 8 / 6.237 |
| Tres hojas | 0 / 0.135 | 0 / 0.176 |

Top10 de números exactos, no familias: Lalo 3/0; bloques Lalo 2/0; bloques AYER 1/0; bloques HOY 1/0; unión física 1/1; consenso 1/1; historia D1D7 1/0; nacimiento 0/0; control hash 0/0. Los lectores de auxiliares actuales no tienen diez valores en todos los cortes; sus exposiciones son menores. En métodos con diez exactos por corte, expectativa uniforme total 1.05. No hay mejora de selección demostrada. El control hash único no es una distribución de referencia.

## Exploración por fuente y turno

Se calcularon colas superiores Poisson-binomial utilizando el tamaño exacto de cada bolsa PRE y cinco objetivos por corte, bajo supuesto idealizado de cabezas independientes uniformes. Comparaciones exploratorias (19 pares fuente/turno, unión incluida, HOY-Previa excluida).
- Lalo Nocturno: 19 vs 14.529 (p=0.1334), 17 vs 11.9725 (p=0.0851); agregado 36 vs 26.5015 (p=0.03459 sin corregir; Bonferroni 0.6573).
- AUX AYER Vespertino: 10 vs 8.07 (p=0.2875), 13 vs 7.519 (p=0.03649); agregado 23 vs 15.589 (p=0.03986; Bonferroni 0.7573).
- Ninguno de los 19 contrastes agregados supera corrección por comparaciones múltiples. Los patrones son de cobertura, no de capacidad de ranking.
- En el tramo 18–23/11 ningún método logró Top10 exacto. Consenso y unión física recuperaron el mismo 8416 el 11/11; no son confirmaciones independientes.

Decisión: no cambiar producción ni asignar pesos por turno. Conservar dos hipótesis descriptivas para repetir con reglas congeladas sobre otras fechas (Lalo Nocturno y AYER Vespertino). Revisar cobertura y selección por separado, sin aumentar candidatos. Las fechas adicionales no son necesariamente desconocidas para todo el proyecto, solo no usadas en esta comparación.