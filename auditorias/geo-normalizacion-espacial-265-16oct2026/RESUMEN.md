# Normalización geométrica por fuente, forma y posición — 265 turnos

**Laboratorio completado el 16/10/2026 · APK 0.3.5 intacta · sin cambiar Modelo Lalo ni Geometría completa de producción.**

## Hipótesis y precauciones

Se comprobó previamente que los recorridos de dos diagonales tienen una desventaja estructural en los puntajes absolutos de Geometría: 2724 comparaciones emparejadas por fuente y posición, de las cuales perdió 2724. Además, las referencias de todas las rutas físicamente posibles de ayer y de la semana anterior no dependen de los dígitos, cuando las raíces ganadoras del modelo oficial permanecen fijas.

El objetivo aquí **no** es imponer dobles diagonales, sino estudiar si comparar una ruta contra alternativas **físicamente equiparables** evita ventajas automáticas de ciertas figuras o lugares.

Todos los cortes son **retrospectivos** y los resultados fueron usados previamente durante la investigación. Ninguna diferencia histórica es evidencia prospectiva concluyente.

## Protocolo replicable

- **53 jornadas, 265 PRE reconstruidos, 1325 cabezas** (15/08 al 15/10).
- Mismos recorridos físicos adyacentes VT3, misma familia reversible y las mismas fuentes por turno, sin saltar celdas ni cruzar fuentes; cada hoja PRE se construye sin las cabezas del turno objetivo.
- Para cada recorrido se conserva el vector de **7 criterios** geométricos del motor original. No se recalculan ni se optimizan esos criterios.
- El auditor reproduce primero **exactamente** las tres familias originales en cada uno de los 265 cortes y mantiene intactos sus motores originales y los otros informes.
- **Misma fuente + forma:** posición relativa del recorrido frente a otros recorridos de la misma fuente con idéntica forma geométrica.
- **Misma fuente + posición:** posición relativa frente a otros recorridos que comparten la fuente y la fila/columna mínima del rectángulo que los contiene (no las mismas tres casillas).
- Se usa un **percentil interno de puntaje** por estrato. Los empates reciben rango medio; un estrato de tamaño uno recibe 0,5 (no prioridad automática). Ante empate en percentil, desempate con los criterios originales.
- **Combinado:** media simple de ambos percentiles, sin pesos ajustados a los ganadores.
- **Combinado con fuentes fijas:** exactamente las fuentes que habrían ocupado los puestos 1, 2 y 3 del motor original, pero se escoge dentro de cada fuente a las tres familias con mejor orden relativo respetando que no se repitan. Es un control para distinguir reajuste de formas vs distribución de columnas.
- Se muestran solo **tres familias** por turno en todos los métodos.

## Aciertos Top3 VT3 por período

| Método | 15/08–14/09 (130 turnos) | 15/09–15/10 (135 turnos) | Total 265 |
|---|---:|---:|---:|
| Geometría completa original | 1 | **10** | 11 |
| Percentil en misma fuente + forma | 1 | 9 | 10 |
| Percentil en misma fuente + posición | 1 | 4 | 5 |
| **Combinación de ambos percentiles** | **3** | 9 | **12** |
| Combinación **sin cambiar fuentes originales** | 2 | 9 | 11 |

**La combinación libre recuperó cuatro aciertos de cabeza por corte y perdió tres** frente al motor vigente (balance +1) al cambiar el conjunto del Top3 en **233/265 cortes**. Cambiar solo dentro de las fuentes originales produjo **dos ganancias y dos pérdidas** (balance 0) y cambió familias en 156/265 cortes.

### Cambios de la combinación libre

Recuperados (familias VT3):
- 08/09 Matutino: `678/876`.
- 11/09 Matutino: `418/814`.
- 28/09 Previa: `273/372`.
- 29/09 Nocturno: `709/907`.

Perdidos:
- 15/09 Matutino: `779/977`.
- 21/09 Nocturno: `173/371`.
- 01/10 Matutino: `598/895`.

Una de esas pérdidas no corresponde a una figura doble diagonal: el procedimiento cambia el **ranking de todas las figuras**, no solo el tratamiento de diagonales. Las siete exposiciones se concentran en siete cortes distintos, pero se seleccionó el mecanismo de análisis después de conocer los resultados del histórico.

## Efecto sobre las fuentes

De 795 posiciones de Top3 (265 × 3), el **motor original** eligió:
- 739 Nocturna anterior, 56 Matutina, 0 Previa, 0 Primera, 0 Vespertina.

La **combinación libre** eligió:
- 507 Nocturna anterior, 148 Previa, 67 Primera, 62 Matutina, 11 Vespertina.

Al exigir las **mismas fuentes del original** desaparece la pequeña mejora neta: **11 frente a 11**. Esto sugiere que el cambio de fuentes es una parte relevante de la diferencia, pero no demuestra que ampliar fuentes mejore prospectivamente la selección.

## Doble diagonal y normalización

| Método | Testigos representantes Top3 de doble diagonal (795 puestos) |
|---|---:|
| Original | 0 |
| Solo misma fuente + forma | 5 |
| Solo misma fuente + posición | 0 |
| Combinación libre | 2 |
| Combinación con fuentes fijas | 8 |

La normalización puede permitir algunas dobles diagonales, pero **no las favorece sistemáticamente**. Que la variante con fuentes fijas incluya más de esas figuras y aun así empate el original refuerza que la figura, por sí sola, no garantiza una ventaja.

## Limitaciones

1. La normalización por rango depende del **universo de rutas disponibles de ese mismo PRE**; es un descriptor relativo, no una probabilidad de acierto.
2. Misma fuente + posición no significa mismos tres contactos físicos. Es una comparación controlada parcial.
3. Los caminos de ida y vuelta y distintas rutas de una misma familia no se transforman en observaciones ganadoras independientes.
4. **Todo este histórico ya fue explorado antes.** No hay un conjunto verdaderamente virgen: las ganancias, pérdidas y el +1 neto son exploratorios, no pruebas de un patrón predictivo.
5. La normalización no convierte las referencias de ayer construidas con todas las formas en antecedentes numéricos comprobados.
6. No se deben extrapolar tasas de acierto ni utilizar estos resultados como recomendación de juego.

## Decisión y siguiente experimento

- **No fusionar ni reemplazar** motor oficial, Geometría completa o APK.
- No premiar todas las dobles diagonales, ni copiar la normalización combinada directamente: +1 en 265 y 233 Top3 cambiados no es ventaja estable.
- Próxima comprobación útil: aislar en qué circunstancias la **incorporación real de otra columna** añade una familia competitiva frente a limitar la búsqueda a Nocturna anterior, con la misma cantidad de puestos y criterios fijados antes de mirar resultados.
- Evitar más selección ad hoc de parámetros sobre los mismos 265 turnos. Para validar una regla definitiva, guardar cortes PRE posteriores antes de publicar cabezas.

## Código / evidencia

- Workflow GitHub Actions aprobado: https://github.com/y0t3/Modelo-Papa/actions/runs/38857471934
- Código de laboratorio: `scripts/lab-geo-normalization.ts`, `scripts/lab-geo-shape-audit.ts` y `scripts/lab-geo-roots-265.ts` en rama `lab/geo-normalizacion-espacial-265-16oct2026`.
- Artefacto GitHub Actions `HUELLAS-GANADORAS-265-CORTES`, archivo `GEOMETRIA_NORMALIZACION_265_CORTES.json` con cada corte, familia, recorrido físico seleccionado, fuente, tipo de forma, tamaño de estratos, percentiles y aciertos.
