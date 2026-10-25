# Modelo Lalo — embudo VT3 y rastro geométrico (25/10/2026)

Estado: **laboratorio / no incorporar todavía a MV1**. Rama experimental:
`lab/lalo-vt3-embudo-rastro-6j-25oct2026`.

## Objetivo

Explicar las 542 cabezas VT3 físicamente formables pero no reconocidas
por el motor, con las bases por jurisdicción corregidas también para
las raíces históricas D−1 y D−7.

Revisar solo recorridos válidos de 3 cifras dentro de una misma columna
+11, incluso cuando existan múltiples órdenes válidos de tres casillas.
Se deduplican únicamente la trayectoria exacta y su inversa.
Resultados futuros nunca intervienen en la selección PRE.

Se analizaron 124 jornadas y 620 cortes cronológicos (junio al 24/10),
con 3.321 cabezas y la misma versión de referencia utilizada en la
auditoría de raíces históricas reales.

## Distribución de la muestra

- No formables en la hoja antes del sorteo: **2.462**
- Formables y no reconocidas: **542**
- Reconocidas fuera de Top10: **258**
- Top6–10: **24**
- Top4–5: **18**
- Top1–3: **17**
- Total: **3.321**
- Total formables: **859**
- Total reconocidas por el motor: **317**
- Aciertos Top10 originales: **59**

### Las 542 no reconocidas: antecedente geométrico más próximo
Categorías excluyentes en orden de prioridad (se cotejan rutas válidas
con figuras VT3 que explicaron cabezas **publicadas en jornadas anteriores**,
nunca simples coincidencias visuales inventadas).

| Rastro geométrico | Cabezas |
|---|---:|
| Misma figura en misma fuente, últimas 6 jornadas, pero no D−1/D−7 | 261 |
| Misma figura en fuente inmediatamente vecina, jornadas 1–3 | 125 |
| Misma figura en fuente inmediatamente vecina, jornadas 4–6 | 60 |
| Dos celdas compartidas en la misma fuente, últimos 6 días | 79 |
| Misma forma en otra fuente no vecina | 16 |
| Sin ninguno de los testigos anteriores | 1 |
| **Total** | **542** |

No aparece ninguna cabeza físicamente posible no reconocida con
**misma figura, misma fuente y antecedente exacto D−1/D−7**. Esto es
coherente con la regla de reconocimiento MV1: el problema restante está
en fuentes/ventanas que MV1 no contempla, no en que omita una ruta D−1/D−7
con la misma forma disponible.

### Prueba PRE (una sola sustitución de la última posición del Top10)

Se fijaron dos reglas geométricas separadas, ninguna añade candidatas
de fuera del tablero ni aumenta los diez puestos. Se evalúa por familias
VT3 reversibles, mismo número de entradas.

| Versión | Aciertos Top3 | Top5 | Top10 | Nuevos / desplazados |
|---|---:|---:|---:|---|
| Lalo con raíces reales | 17 | 35 | 59 | — |
| Misma forma en columna vecina últimos 3 días (`VECINA_3`) | 17 | 35 | 60 | 4 / 3 |
| Misma forma en la misma columna últimos 6 días (`MISMA_6`) | 17 | 35 | 67 | 11 / 3 |

La prueba de continuidad de la misma columna ganó +3 en junio/julio,
+5 en agosto/septiembre y 0 en octubre (dos ganados y dos desplazados).
La regla de columna vecina ganó 0, +2 y −1 respectivamente.

### Azar condicional: 10.000 réplicas por regla y período

Se selecciona aleatoriamente una familia del mismo conjunto elegible
en cada corte, con igual número de sustituciones. Se compara la
cantidad de aciertos **nuevos** (no la capacidad predictiva global del
motor). El puesto desplazado es fijo por corte.

| Regla | Nuevos observados | Media azar | P95 azar | Fracción azar igual o mayor |
|---|---:|---:|---:|---:|
| VECINA_3 | 4 | 5,905 | 10 | 0,846 |
| MISMA_6 | 11 | 6,546 | 11 | 0,0643 |

La señal `MISMA_6` **no alcanza 5%** ni resiste inferencia
confirmatoria por exploración previa de múltiples criterios. En
octubre no hay ganancia neta. Cualquier mejora aparente requiere
verificación prospectiva sobre nuevos sorteos sellando primero los
Tops PRE.

## Restricciones cumplidas

- **MV1 intacto:** no hay cambios en `src/motorLalo.ts`, ni `main`.
- Previa+11 nace solo de las últimas Nocturnas reales por jurisdicción.
- D−1 / D−7 corregidas de la misma forma, sin usar el objetivo.
- No se cruzan columnas del +11. No se saltan casillas.
- Todos los recorridos físicos distintos permanecen disponibles.
- Las seis jornadas anteriores solo aportan cabezas realmente sorteadas,
  con trazabilidad de fuente, silueta, posición y fecha.
- La fuente Montevideo permanece en la hoja +11; sus cabezas
  no se cuentan como raíces históricas del motor, conforme MV1.
- Se compararon aciertos por familia VT3, no tasas de retorno económico.

## Ejecutado y reproducible

- Script: `scripts/lab-vt3-embudo-rastro-6j.ts`
- Workflow: `.github/workflows/lab-vt3-embudo-rastro6.yml`
- [Ejecución final de GitHub Actions](https://github.com/y0t3/Modelo-Papa/actions/runs/40176734162)
- Artefacto: `vt3-embudo-rastro-seis-jornadas`, con `resumen.json`,
  `cabezas.json` y `cortes.json` detallados.

## Conclusión para el siguiente paso

El nuevo análisis sí explica geométricamente **541 de las 542**
no reconocidas, clasificando sus testigos físicos previos. Eso
**no significa** que hubiera sido posible predecirlas: los conjuntos
PRE de elegibles siguen siendo amplios (unas 40 familias por corte
en estas dos reglas).

La mejor línea de investigación es averiguar qué reduce de forma
válida ese conjunto sin mirar resultados posteriores, o usar los
rastreos para explicar las familias de los Tops actuales. No mover
MV1 ni anunciar mejoras hasta validación prospectiva independiente.
