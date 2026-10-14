# Punto de control — VT3 geometría completa versus anclada
**14/10/2026 · 115 cortes / 23 jornadas históricas · rama `lab-vt3-geometria-completa-14oct2026`.**

## Objetivo
Responder si abrir todas las rutas VT3 físicamente posibles, en vez de filtrar solo las que replican fuente+firma de una huella previamente ganadora, aumenta el rendimiento. Aísla **solo el universo de admisión**: el mismo orden geométrico D−1 o D−7 sobre ambas bolsas, resultados numéricos leídos **después** de congelar las posiciones, y presupuesto de tres/cinco/diez familias únicas. No se alteró el motor oficial, `main`, VT4, la hoja marcada ni los sellos prospectivos existentes.

## Cobertura PRE
| Unidad | Conteo |
|---|---:|
| Rutas físicas VT3 / corte (suma) | 27.900 |
| Rutas elegibles por huella histórica ganadora de igual fuente+firma | 8.053 |
| Rutas antes excluidas del ranking geométrico | **19.847** |
| Porcentaje de rutas excluidas | **71,14 %** |
En los 115 cortes, ambas bolsas pudieron producir diez madres distintas. Se usaron hojas del mismo turno de D−1 y D−7 estrictamente anteriores; se conservó la identidad física de cada ruta, fuente, forma y posición. El PRE se creó y selló sin los resultados objetivos, movidos físicamente a `/tmp`.

## Resultados comparables POST
| Método | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| Oficial | 5 | 8 | 15 |
| Geométrico anclado anterior (GEO_DESPLAZAMIENTO) | 8 | 9 | 14 |
| Nuevo geométrico anclado, idéntico score sobre ambos pools | **8** | **10** | **15** |
| Nuevo geométrico completo | **8** | **10** | **16** |

`A_D1` y `A_D7` son las **mismas diez madres ordenadas en los 115 cortes**, igual para `F_D1` y `F_D7`. No son dos repeticiones independientes ni dos reglas efectivamente distinguibles para este corpus. `A` y `F` comparten Top3 **115/115**, Top5 **110/115** y Top10 **70/115**.

## Cobertura de familias ganadoras disponibles — NO confundir con acierto seleccionado
En el inventario físico completo aparecieron **143 registros familia×corte coincidentes** con las cinco cabezas posteriores. De ellos:
- **64** familias ganadoras tenían al menos una posición anclada;
- **79** ganadoras sólo estaban en el inventario completo, sin la firma de raíz histórica;
- en **52 cortes** hubo al menos una familia ganadora exclusiva de las rutas no ancladas.

Esto identifica un obstáculo real de cobertura de la bolsa anclada. Pero **no demuestra que podamos identificar por adelantado esas 79 familias**. El algoritmo completo seleccionó **0 posiciones no ancladas en Top3**, 5 apariciones no ancladas en Top5 y 124 apariciones no ancladas en Top10 (a través de los 115 cortes). Solo **2** de las 124 apariciones no ancladas seleccionadas entre diez coincidieron con resultados ganadores: ambas corresponden a la misma familia **949/949** el **28/09**, en **Matutino** y **Vespertino**.

## Pares de comparación: qué se ganó o perdió al abrir rutas
Los cambios de resultado Top10 respecto de la política anclada fueron **todos del 28/09**:
- **Primera, 28/09:** pérdida de `037/730` (estaba #9 en el Top10 anclado y quedó fuera del completo).
- **Matutino, 28/09:** ganancia por `949/949`, antes exclusivamente no anclada.
- **Vespertino, 28/09:** ganancia por `949/949`, repetición de la **misma** familia del corte anterior.
Balance total **+1 corte Top10**; mejoras positivas están fuertemente correlacionadas. No se recuperó ningún Top3/Top5 adicional.

## Comparación temporal (congelada, no ajuste por mes)
| Período | Cortes | Oficial Top3/10 | Anclado Top3/10 | Completo Top3/10 |
|---|---:|---:|---:|---:|
| Sep. 15–30 | 70 | 3 / 10 | 6 / 11 | **6 / 12** |
| Oct. 1–10 | 45 | 2 / 5 | 2 / 4 | **2 / 4** |

**En octubre no hubo ninguna mejora por admitir rutas completas**, y la geometría completa tuvo Top10 menor que oficial: cuatro contra cinco.

## Controles neutrales, 2.000 elecciones uniformes por corte y universo
| Bolsa | Media neutral Top3 | Observado Top3 | Media neutral Top10 | Observado Top10 | Cola neutral ≥Top10 observado |
|---|---:|---:|---:|---:|---:|
| Anclada | 3,447 | 8 | 10,7745 | 15 | 0,08546 |
| Completa | 3,558 | 8 | 11,2695 | 16 | 0,07846 |

Aun sin selección múltiple, estas colas no establecen ventaja robusta Top10. Y al tratarse de **115 cortes ya explorados numerosas veces**, ninguno de estos valores constituye prueba confirmatoria de predicción.

## Señal crítica descubierta: ranking congelado
De las **92 transiciones intradía** (de un turno al siguiente dentro de la misma fecha):
- VT3 oficial repite exactamente su Top3 **52/92** y su Top10 **25/92**;
- Geométrico completo repite Top3 **84/92** y Top10 **78/92**;
- Geométrico restringido repite Top3 **84/92** y Top10 **66/92**.

El nuevo selector da prioridad a formas/posiciones de fuentes anteriores y casi nunca incorpora posiciones actuales que cambian entre turnos. El Top3 completo nunca difiere del Top3 anclado: por tanto **no prueba una mejora en la selección de madres superiores**.

## Decisión
1. **Retener el atlas completo como fuente de observación**, en particular el universo de familias ganadoras que jamás apareció en la bolsa de raíces confirmadas. La apertura mejora capacidad de observación, no la selección de Tops.
2. **NO modificar ranking oficial VT3 ni VT4**: ganancia Top10 +1/115 concentrada en la misma familia y fecha, Top3/5 sin ganancias, octubre sin mejora.
3. Próxima hipótesis independiente: estudiar el **nacimiento de recorridos en la nueva columna físicamente disponible de cada turno**, la novedad por fuente, y comparar alternativas frescas contra controles neutrales; no privilegiar una ruta por existir o contar geometrías repetidas. Si se estudia, fijar regla PRE y verificar contra futuras jornadas, no seguir optimizando sobre los mismos 115 cortes.
4. Preservar deduplicación de familias reversibles y cotejo POST numérico; una coordenada no es un resultado de lotería observable.
5. Las 2.000 selecciones neutrales son comparadores exploratorios, no evidencia estadística confirmatoria por reutilización de la muestra y correlación intradía.

## Respaldo
- [Acción de GitHub completada: PRE ocultando POST, sello, POST contrastado y controles](https://github.com/y0t3/Modelo-Papa/actions/runs/38521311868).
- `scripts/lab-vt3-geometria-completa-vs-anclada.mjs` y `PROTOCOLO_VT3_GEOMETRIA_COMPLETA_VS_ANCLADA_14OCT2026.md`.
- `auditorias/vt3-geometria-completa-vs-anclada-115-14oct2026/PRE_115.json`, `SELLO.json`, `POST_115.json`, `RESUMEN.json`.
