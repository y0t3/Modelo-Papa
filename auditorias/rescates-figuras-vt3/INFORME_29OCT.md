# Auditoría de rescates VT3 — figuras, posición, antecedentes y POST
**Fecha de estudio:** 29/10/2026 · **Carácter:** laboratorio, PRE reconstructivo, NO pronóstico prospectivo sellado.

## Qué se implementó

- Un módulo puro `src/figureRescueAudit.ts` que compara las **diez familias VT3 de Formas Primero** contra las **diez de Lalo MV1** y etiqueta tres grupos: **RESCATE** (en Formas pero no Top10 Lalo), **COMPARTIDO** y **SOLO_LALO**.
- Un panel visual `src/ui/FigureRescueAuditPanel.tsx`, colocado al inicio de Experimental, con filtros de esos grupos.
- Cada propuesta puede desplegar la **figura PRE elegida antes de leer los tres dígitos**, los **testigos POST históricos de las seis jornadas previas** con minihojas físicas y el POST del objetivo, si existe.
- Para una cabeza posterior coincidente se **enumeran todos los caminos físicos legales** de las tres últimas cifras en las columnas +11 PRE (incluida orientación inversa cuando corresponda). Ningún camino cruza columnas ni salta casillas.
- Se distingue **familia coincidente**, **ruta seleccionada que forma esa familia**, **otras rutas físicas de la misma familia** y **evidencia predictiva**. **La tercera categoría no demuestra la cuarta.** Como la familia seleccionada deriva precisamente de esa ruta, la verificación física posterior es en gran parte tautológica y no aporta un voto independiente.
- Montevideo no se usa para evaluación +11; resultados Córdoba/Santa Fe de cinco cifras admitidos, siempre se comparan las últimas tres preservando ceros.
- El motor y sus Tops quedan INTACTOS. Los datos del turno que se evalúa entran **solamente después** de generar ambos Tops; la app no reordena candidatos por POST.

## Cotejo completo, 590 cortes

Se analizaron 118 jornadas completas: 255 cortes junio–julio, 260 agosto–septiembre y 75 octubre 12–28. En total 2.950 cabezas publicadas y 590 rankings por motor.

Cada una de las 4.643 propuestas VT3 por figura **fuera del Top10 de Lalo** cuenta una exposición candidata×turno.

| Periodo | Propuestas rescatadas | Cabezas coincidentes | Esperadas, mismo tipo de figura y fuente | Esperadas, otras familias físicas fuera de Lalo |
| --- | ---: | ---: | ---: | ---: |
| Jun–jul | 1.982 | 21 | 22,38 | 18,64 |
| Ago–sep | 2.040 | 21 | 19,14 | 19,88 |
| Oct 12–28 | 621 | 3 | 3,68 | 5,66 |
| **TOTAL** | **4.643** | **45** | **45,21** | **44,19** |

Los controles son expectativas descriptivas, **no** una prueba de significación con exposición idéntica. El primero selecciona alternativamente familias físicas de la misma silueta y fuente del candidato, excluidas las que ya estaban en Top10 de Lalo. El segundo elige entre todas las familias físicas que Lalo excluyó, manteniendo el mismo número de propuestas. No se atribuye capacidad predictiva a una diferencia de centésimas o décimas.

### Subgrupos descriptivos (PRE, NO configuraciones validadas)

| Característica | Exposiciones | Coincidencias | Esperadas por figura+fuente |
| --- | ---: | ---: | ---: |
| Con antecedente de la misma fuente | 4.630 | 45 | 45,21 |
| Sólo apoyo de fuente vecina | 13 | 0 | 0,00 |
| Con marca D−1 | 2.978 | 23 | 25,03 |
| Sin marca D−1 | 1.665 | 22 | 20,17 |
| Activada en dos o más jornadas | 4.124 | 39 | 39,69 |
| Activada en una sola jornada | 519 | 6 | 5,52 |

La prioridad geométrica actual favorece casi siempre **misma fuente y ancla cercana**, por lo que el grupo de fuente vecina prácticamente no tiene representación. El hecho de que las propuestas acumulen más eventos no aumenta automáticamente su tasa de coincidencias: también amplía la exposición a figuras muy comunes. No hay base para convertir ninguna fila de la tabla en un filtro automático.

### Tres ejemplos de octubre para inspección visual

1. **15/10 Nocturno, Entre Ríos 6624 → familia 426/624**, puesto **#1 de Formas**, fuera del Top10 de Lalo. Figura elegida en **Previa**, ancla fila 3 (índice 2), silueta `0:1>1:0>1:1`, presente en cinco jornadas previas, con testigos de 14/10 (7823), 13/10 (8857 y 4625), 10/10 (6542) y 09/10 (7354). El POST 624 se forma en **3 recorridos físicos** válidos, uno de ellos la ruta seleccionada con orientación inversa.
2. **19/10 Previa, Córdoba 2099 → 099/990**, puesto **#10 de Formas**, fuera del Top10 de Lalo. Hoja fuente **Nocturna anterior**, ancla fila 3, figura `0:1>1:0>2:1`; un testigo antiguo real: 14/10 2033, tramo 033. El POST 099 tiene **2 recorridos** físicos válidos.
3. **22/10 Primera, Córdoba 7967 → 769/967**, puesto **#2 de Formas**, fuera del Top10 de Lalo. Fuente **Nocturna anterior**, ancla fila 1, figura `0:1>0:0>1:0`; testigo de 21/10 6802, tramo 802. La cabeza POST 967 presenta **1 recorrido físico** en la hoja PRE.

Esos recorridos se mostraron en los registros del motor. **Que una figura se pueda volver a dibujar con las cifras ganadoras no demuestra que el sorteo “recorrió” ese camino**.

## Qué se aprendió y qué no

- **Sí:** la herramienta recupera las figuras precisas y los testigos que respaldaron los rescates, y deja ver sus diferencias respecto de Lalo. Los rescates son candidatos reales fuera del Top10 anterior, no una reordenación cosmética.
- **Sí:** se verificó que los aciertos de familia registrados en este laboratorio tenían caminos físicamente válidos en el tablero PRE y que la auditoría muestra todos los recorridos.
- **No:** los rescates no superan la expectativa de una selección física comparada por silueta+fuente (45 frente a 45,21). Tampoco D−1 ni varios días de activación separan de forma consistente los positivos de los negativos.
- **No:** no se modifican prioridades MV1, no se proyecta una supuesta mayor rentabilidad, y no se emplean resultados posteriores para seleccionar candidatos.
- **Limitaciones:** retrospectivo con datos históricos actualmente disponibles; las cabezas en un mismo corte no son independientes; el control por silueta+fuente no iguala perfectamente todos los caminos, y los hallazgos de subgrupos son exploratorios con comparaciones múltiples.

## Siguiente experimento sustentado

**Sin cambiar ningún Top**, registrar la evolución de **una misma posición física de una silueta concreta** entre jornadas: fuente, ancla, zona, momento de activación ganadora, si el antecedente pasó de fuente vecina a igual fuente y si la forma fue frecuente pero nunca activada. Separar siempre **presencia física** (muy común) de **activación por una cabeza real**. Evaluar contra caminos alternativos de la misma fuente y silueta, dentro de cortes PRE sellados antes de la publicación, con evaluación POST independiente. Sólo considerar una variante del motor si supera ese control fuera de muestra.

## Archivos y pruebas

- `src/figureRescueAudit.ts` y `src/ui/FigureRescueAuditPanel.tsx` (verificación y visualización).
- `scripts/test-figure-rescue-audit.ts` (fuga temporal, ceros, cinco cifras, selección y todos los caminos).
- `scripts/lab-auditar-rescates-figuras-vt3.ts` (590 cortes y nulos por silueta+fuente).
- Workflow exitoso: https://github.com/y0t3/Modelo-Papa/actions/runs/40861390348
- Tres artefactos JSON `resumen-*.json`, `cortes-*.json`, `rescates-*.json` publicados en GitHub Actions.
