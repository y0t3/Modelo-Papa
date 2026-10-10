# Punto de control del motor visual 7D — 10/10/2026

## Alcance
Rama `experimento-analisis-visual-5d`. Motor auditado: `src/combinedReader7d.ts` (lector combinado D-7).
Motor semanal original, `main` y selección de la APK: **sin modificaciones**.

**No afirmar que se ha validado el Modelo Papá completo.** Las memorias de dos focos, traslación,
promoción, reposo y reactivación existen en módulos experimentales, pero no forman todavía
parte de una política predictiva final única y comprobada. Los números de aquí evalúan
únicamente el lector combinado 7D, con sus pesos y límites actuales.

## Corrección concreta
Antes, una misma ruta ganadora pasada podía contar dos veces:
reconfirmación exacta y movimiento geométrico equivalente. Se corrigió para que cada sorteo
aporte como máximo una categoría geométrica a cada ruta: **EXACTA > MOVIMIENTO > RAMA**.
No se modificaron los pesos por resultados favorables.

## Protocolo reproducible
- `src/causalReplay7d.ts`: conserva sólo columnas y marcas conocidas antes del turno objetivo.
- Requiere 6 jornadas previas y la hoja **D-7 exacta**; no sustituye fechas faltantes.
- Cada modalidad VT2/VT3/VT4 se evalúa por separado; toda candidata está ligada
  a recorridos D-7 físicamente elegibles.
- Control 1: igual cantidad de candidatas elegidas uniformemente entre todos los sufijos posibles.
- Control 2 (principal): igual cantidad de candidatas elegidas al azar entre **las lecturas físicas D-7
  elegibles de ese turno**. Valores repetidos en distintas rutas se consideran una sola candidata.
- La probabilidad de cola es exacta bajo esta selección física aleatoria condicional, y no
  corrige selección de hipótesis, múltiples ensayos ni conocimiento retrospectivo.
- Scripts: `scripts/test-causal-replay7d.cjs`, `scripts/run-causal-replay7d.cjs`.
- La batería experimental 7D pasa. Los tests de procedencia y seguimiento que tenían
  expectativas erróneas se ajustaron sin cambiar los motores físicos.

## Resultados VT2 (candidatas, aciertos, control físico D-7)
| Tramo | Turnos evaluados | Candidatas VT2 | Aciertos VT2 | Azar físico esperado | Cola condicional |
|---|---:|---:|---:|---:|---:|
| 2025 completo | 1491 | 3844 | 216 | 206.205 | 0.1698 |
| enero–mayo 2026 | 584 | 1509 | 96 | 90.267 | 0.1962 |
| junio–septiembre 2026 | 483 | 1245 | 89 | 70.714 | 0.001205 |

VT3, respectivamente: 13 vs 14.686; 5 vs 4.500; 7 vs 6.012.
VT4: cero aciertos en los tres tramos.

La señal VT2 observada en junio–septiembre **no se reproduce de forma clara**
en 2025 ni en enero–mayo de 2026. El contraste retrospectivo reciente sigue
siendo descriptivo: estos meses participaron del proceso exploratorio.

## Evidencia y reportes completos
- 2025: https://github.com/y0t3/Modelo-Papa/actions/runs/38021562635
- Ene–may 2026: https://github.com/y0t3/Modelo-Papa/actions/runs/38021631177
- Jun–sep 2026: https://github.com/y0t3/Modelo-Papa/actions/runs/38021459833

Cada ejecución guarda un archivo JSON con cada turno, candidatos, celdas y cabezas
observadas, puntajes y controles; nada se reclasificó retroactivamente.

## Decisión congelada
**NO declarar motor final ni integrar en APK.** El lector combinado D-7 corregido
permanece como referencia experimental para un ensayo que no reajuste pesos
a partir de los mismos aciertos. El selector original queda intacto.

## Siguiente hipótesis única, antes de modificar el motor
Contrastar la política actual del lector combinado contra una variante estrictamente
VISUAL que utilice el estado persistido de **figura raíz + figura trasladada**
y reconfirmaciones independientes de sorteos anteriores, mediante los módulos
`figureTranslation7d`, `figurePromotion7d`, `figureRestReactivation7d`
y `figureSpatialWatch7d`, sin atribuir apoyos del turno objetivo.

Exigir **igual presupuesto de candidatos VT2**, misma cobertura reportada, controles
de azar físico y comparación cronológica por separado en los tres períodos anteriores.
En particular, una variante no se declara ganadora por mejorar sólo junio–septiembre.

Dado que los períodos históricos ya han sido inspeccionados, cualquier mejora
resultante en ellos sigue siendo exploratoria. Reservar una comprobación prospectiva
con fechas posteriores a esta congelación antes de afirmar ventaja real.

Reglas rectoras: `PRINCIPIO_RECTOR_7D.md`. No volver a V7 ni reabrir
reglas geométricas ya acordadas por un resultado aislado.
