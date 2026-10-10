# Modelo Papá — Punto de control definitivo: contraste externo 16–23/09/2026

Fecha: 10/10/2026 · Rama experimental `experimento-analisis-visual-5d`.

## Protocolo congelado **antes** de ejecutar la semana
`PROTOCOLO_CONGELADO_HOLDOUT_VISUAL_16_23_SEPT_2026.md`, commit `960acf9e24958c848b55fe9b5a9a854a3cfe7e3b`.

Pregunta: antes de Matutina, ¿se forma una familia VT3 del +11 a partir de **dos cabezas del día anterior distintas y dos recorridos físicos diferentes** (ruta invertida cuenta como el mismo dibujo), en una misma columna, **ambos** en contacto físico con marcas ya confirmadas de Primera de ese día?

Se contemplan todas las familias y los sentidos directo/invertido, pero nunca se elige un número ni una orientación después de mirar resultados. Ninguna figura: OBSERVAR/NO JUGAR. Varias figuras: AMBIGUO/OBSERVAR. Una figura: observación de una familia de dos lecturas, NO apuesta.

Las hojas se reconstruyen sólo DESPUÉS de conocer las cabezas de cada jornada antigua, preservando las 3 modalidades completas (VT2/VT3/VT4) y todas las rutas físicamente válidas dentro de su columna. No se enumera en tabla vacía, ni se conectan columnas distintas.

## Ejecución: dos trabajos de GitHub separados temporalmente
**Run exitoso (tres jobs independientes de análisis):** https://github.com/y0t3/Modelo-Papa/actions/runs/38046837400

1. `registrar-sin-resultados`: `scripts/run-visual-chain7d.cjs` reconstruye 15–23/09, seguido de `scripts/run-holdout-blind-visual7d.cjs`, que genera los cortes ANTES de Matutina; sube únicamente hojas anteriores y registros ocultando la cabeza objetivo.
2. `verificar-despues`: sólo **después** de concluir el job ciego descarga el artefacto sellado y `scripts/run-holdout-post-visual7d.cjs` consulta las cabezas de las seis jurisdicciones. Resultados en ZIP distinto, sin reemplazar el expediente ciego.
3. `diagnostico-sin-resultados`: `scripts/run-holdout-nearmiss-diagnostic7d.cjs` abre sólo el archivo ya sellado para contar condiciones faltantes. Esta auditoría adicional se hizo **después** de conocer el primer balance; queda expresamente rotulada diagnóstica y NO altera la regla.

Archivos reproducibles:
- **Examen ciego completo + 7 visores HTML:** https://github.com/y0t3/Modelo-Papa/actions/runs/38046837400/artifacts/11666744559
- **Resultados publicados consultados después:** https://github.com/y0t3/Modelo-Papa/actions/runs/38046837400/artifacts/11668205628
- **Diagnóstico de condiciones faltantes (sin cabezas de Matutina):** https://github.com/y0t3/Modelo-Papa/actions/runs/38046837400/artifacts/11668015839

Abrir `index.html` del ZIP ciego. Los expedientes muestran la hoja previa MARCADA completa, los caminos heredados, las marcas ya confirmadas de Primera sobre las celdas +11 actuales y TODOS los VT2, VT3, VT4, incluidas formas y alternativas que no califican. El ZIP posterior tiene cada cabeza completa de Matutina, familia y resultado.

## Hallazgo de la semana externa

Hojas reconstruidas cerradas: **15,16,17,18,19,21,22,23 de septiembre** (sin sorteo domingo 20). Cortes ciegos ANTES de Matutina: **7**. El 23 fue parte de la semana que se había utilizado para formular la hipótesis; es **control solapado**, no pertenece a la muestra externa principal, que tiene **6** fechas (16,17,18,19,21,22).

| Fecha | VT3 disponibles | Familias VT3 con ≥2 cabezas antiguas | De ellas con ≥2 huellas físicas distintas | Dos huellas distintas tocando Primera | Registro ciego |
|---|---:|---:|---:|---:|---|
| 16/09 | 10 | 0 | 0 | 0 | OBSERVAR |
| 17/09 | 8 | 0 | 0 | 0 | OBSERVAR |
| 18/09 | 28 | 3 | 0 | 0 | OBSERVAR |
| 19/09 | 8 | 1 | 1 | 0 | OBSERVAR |
| 21/09 | 15 | 0 | 0 | 0 | OBSERVAR |
| 22/09 | 8 | 0 | 0 | 0 | OBSERVAR |
| 23/09, solapado | 14 | 0 | 0 | 0 | OBSERVAR |

**Balance externo**: 0 de 6 con la figura compuesta completa, 0 de 6 ambiguas con varias figuras, 6 de 6 con ausencia de señal y abstención. La muestra del 23 también se abstiene, pero no se suma.

**Fallas que importan visualmente:**
- 18/09: tres familias VT3 tienen dos cabezas históricas pero sólo **una figura física** por familia (aunque la orientación se pueda invertir). **No** cumplen dos huellas independientes.
- 19/09: una familia sí tiene dos cabezas y **dos figuras físicas** distintas, pero ambas no establecen el contacto requerido con marcas de Primera. **No** se permite relajar el criterio después del hecho.
- Los restantes días no llegan siquiera a dos cabezas diferentes en una misma familia.

## Resultado real, separado, y cobertura
Se recuperaron las seis cabezas Matutina los días **16,17,18,21,22,23/09**. El **19/09 sólo 5/6**: ausencia de coincidencia con cabezas faltantes es indeterminada. Como **ningún corte** precalificó figura, no existe prueba de precisión ni de ventaja del criterio: no hay elecciones que someter a evaluación de acierto. No debe afirmarse que 0/6 es «fallo predictivo de seis apuestas»; fue abstención definida de antemano. Tampoco permite inferir que el patrón no pueda aparecer en otra semana.

## Interpretación y punto de continuación

La condición geométrica reconocida retrospectivamente en `289/982` (29/09) y `778/877` (30/09) fue **demasiado escasa** en este primer período externo para validar selectividad o utilidad. No surgió evidencia predictiva; las coincidencias de 29/30 siguen siendo explicaciones históricas, NO apuestas anticipadas.

**No ajustar filtros retroactivamente** (más cabezas, menos contactos, cambio de turno, inversión preferida). El siguiente paso científico es probar *sin cambios* la definición congelada en otras jornadas independientes, y simultáneamente mantener exploración cualitativa de todos los dibujos, pero etiquetar los hallazgos nuevos como **otras hipótesis**, no como éxitos del mismo criterio. Puede extenderse el análisis a períodos anteriores con resultados disponibles. Para un pronóstico real se necesita registro de figura y orientación/turno antes de sorteo futuro.

**Sin cambios en `main`, APK oficial, selector congelado ni motor productivo.**
