# Secuencias VT3 emparejadas: ¿nacer, persistir y reforzarse distingue ganadoras?

**Cerrado el 16/10/2026 · Laboratorio independiente.** La APK 0.3.5, Modelo Lalo MV1, `src/motorLalo.ts` y `src/vt3Shadow.ts` siguen intactos. Sin merge a `main`.

## Propósito
La anterior investigación reconstruyó 104 jornadas, 520 cortes PRE y 1.002 historias físicas de familias VT3 de junio–julio y 15/08–15/10. Confirmó que las familias pueden nacer al aparecer una columna, persistir sin novedad y ser reforzadas por otra columna. Este laboratorio prueba específicamente si ese ORDEN de movimientos ayuda a distinguir a las que luego forman las cabezas del turno objetivo de familias igual de disponibles y densas que no coinciden.

## Estados (sin usar resultados futuros para construirlos)
- **B**: primera aparición física de la familia VT3 reversible; nace en Nocturna anterior o en columna intradía.
- **P**: mismo conjunto de fuentes, sin nuevo respaldo de la columna incorporada; los recorridos anteriores siguen exactamente iguales.
- **R**: familia existente que suma una **fuente física nueva**, sin alterar ninguno de los caminos anteriores.
- **BPR**: nació, permaneció en siguiente corte y se reforzó en el tercero. **BRP**: nació, se reforzó y posteriormente permaneció. No confundir orden y cantidad de refuerzos.
- La secuencia se calcula **solo con cortes anteriores al sorteo objetivo**. La cabeza de ese sorteo se añade después exclusivamente para evaluar. El orden de los cinco turnos se respeta. Celdas contiguas y fuentes independientes; sin cruzamientos de columnas.

## Base de comparabilidad
- 104 jornadas, **520 PRE**, 2.600 cabezas y 660 físicamente trazables a VT3.
- Enfocamos **familias nacidas en columnas del mismo día que ya tienen al menos dos turnos de antigüedad**, por lo que pueden producir BPP, BPR, BRP, BRR, etc.
- Total de esa cohorte: **12.643 exposiciones de familia por turno**, con **117 apariciones de cabeza ganadora**, distribuidas en junio–julio (5.995 exposiciones, 62 cabezas) y agosto–octubre (6.648, 55).
- Cada exposición es una familia × corte, no familia única. Repetición intra-jornada y disponibilidad física de rutas generan dependencia.
- **Control principal:** comparación con todas las familias del **mismo PRE exacto (fecha y turno), fuente de origen, misma edad implícita y banda de cantidad de rutas físicas actuales** (1, 2–3, 4–7 y 8+); se calcula la expectativa neutral manteniendo cuántas familias tienen cada rasgo dentro de cada estrato.
- **Control adicional:** también conserva presencia/ausencia de huellas verificadas D−1 y D−7 de la misma fuente/forma, no necesariamente de la misma cifra numérica.
- Incertidumbre descriptiva: bootstrap re-muestreando **jornadas enteras**, 4.000 réplicas, semilla determinística. Este intervalo no sirve como prueba confirmatoria por el histórico explorado reiteradamente y por las múltiples hipótesis observadas.

## ¿Ayuda el refuerzo histórico o reciente?

| Rasgo en la familia nacida intradía (edad ≥2) | Exposiciones de familia | Cabezas observadas | Neutral esperado, mismo corte/origen/rutas | Neutral también igualando D−1/D−7 |
|---|---:|---:|---:|---:|
| Algún refuerzo previo, sin importar estado actual | 1.804 | **15** | **19,33** | **17,44** |
| **Se refuerza ahora** con fuente nueva | 1.358 | **8** | **10,33** | **9,26** |
| **Nació → persistió → se refuerza** | 1.254 | **8** | **9,49** | **8,93** |
| **Ya había recibido refuerzo y ahora permanece** | 1.605 | **15** | **18,09** | **16,73** |

Estas categorías se superponen; no sumar filas. Ninguna exhibió ventaja estable. En particular, **B→P→R = 8 coincidencias observadas contra 9,49 neutral**, diferencia descriptiva −1,49. Con control de raíces, **8 contra 8,93** (diferencia −0,93). Bootstrap por jornadas de diferencia simple: **[−5,06, +2,44]** y control adicional **[−4,23, +2,88]**; ambos incluyen cero.

El refuerzo en cualquier momento: 15 contra 19,33 esperado, bootstrap por jornadas **[−9,58, +0,86]**; al controlar también D−1 y D−7, 15 contra 17,44, intervalo **[−7,11, +2,22]**. No hay evidencia convincente de que más pasos de una secuencia sean una ventaja.

## Orden literal de los movimientos, familias nacidas intradía

| Secuencia hasta PRE objetivo | Exposiciones | Apariciones ganadoras VT3 |
|---|---:|---:|
| BPP (nacer, permanecer dos cortes) | 6.624 | **60** |
| BPR (nacer, permanecer, reforzarse) | 813 | **4** |
| BRP (nacer, reforzarse, permanecer) | 772 | **6** |
| BRR (dos refuerzos sucesivos) | 140 | **1** |
| BPPP (nacer y permanecer tres cortes) | 3.056 | **34** |
| BPPR (refuerzo después de dos persistencias) | 346 | **4** |
| BPRP (refuerzo seguido por persistencia) | 447 | **4** |

Los 1.254 casos «alguna persistencia previa, refuerzo hoy» incluyen **BPR, BPPR, BPPPR y otras secuencias más largas**, de ahí que no coincidan con el número de BPR literal. La lectura *BPR vs BRP* no debe tratarse como una prueba inferencial aislada, porque cada forma tiene estructura temporal distinta y muy pocos eventos ganadores.

### Desglose por bloque

**Con algún refuerzo previo, origen intradía y edad ≥2**:
- Junio–julio: **9/905** frente a **10,08 esperadas** (igualando raíces 9,27).
- Agosto–octubre: **6/899** frente a **9,25 esperadas** (igualando raíces 8,17).

**Secuencia con persistencia y refuerzo en el corte actual**:
- Junio–julio: **2/612** frente a **3,93 esperadas** (control de raíces 2,78).
- Agosto–octubre: **6/642** frente a **5,56 esperadas** (control de raíces 6,15).

Este signo cambia entre los bloques. Una secuencia vistosa puede terminar en una cabeza acertada, pero existe también para muchas familias que no acertaron.

## Dos historias visuales concretas

**12/10/2026 — Provincia, Nocturno `1615`, familia `516/615`**:
- PRE Matutino: **nace en Primera**, lectura **615**; casillas `1:0 → 2:0 → 1:1` (fila y columna base cero).
- PRE Vespertino: **permanece** con ese recorrido, sin nuevo respaldo.
- PRE Nocturno: **se refuerza en Vespertino**, lectura **516**; casillas `4:0 → 3:0 → 4:1`, conservando el camino anterior de Primera.
- Cabeza **1615** publicada después del PRE Nocturno; la familia estaba físicamente disponible pero **fuera del Top3 tanto de Geometría como de Lalo**.
- Es un caso llamativo pero retrospectivo. Muchos otros recorridos BPR no coincidieron.

**17/07/2026 — Vespertino, cabeza `5153`, familia `153/351`**:
- PRE Primera: nace en Previa con dos recorridos VT3.
- PRE Matutino: permanece sin incorporar fuente.
- PRE Vespertino: suma recorrido físico **351** de Matutino; luego coincide con la cabeza `5153`.
- También queda fuera de ambos Tops3. Reforzar no es pronóstico privilegiado.

Estas historias, con todas las casillas y fuentes, pueden abrirse en el reproductor HTML previo; el nuevo JSON conserva estados completos y resultados de los controles.

## Interpretación y decisiones

1. **No dar bono a B→P→R ni a cualquier familia «con mucho movimiento»**: los controles dentro de una misma hoja no mostraron más coincidencias de lo esperable por densidad, origen y edad, y el signo varió según bloque.
2. **No excluir familias recién nacidas**: una familia puede coincidir sin refuerzo y muchas familias intradía ganadoras provienen de nuevas fuentes; distinguir admisión física de prioridad estadística.
3. **No confundir trazo de familia con cabeza ganadora**: los caminos de respaldo se muestran visualmente porque son explicaciones físicas válidas, no porque demuestren poder predictivo.
4. No modificar el motor oficial MV1, Geometría completa ni la APK 0.3.5; continuar aislando cambios en laboratorio.
5. Próxima investigación razonable: centrar el *reproductor visual* en diferencias entre **recorridos concretos y sus cambios de forma por fuente**, con controles comparables. Congelar el protocolo de cualquier Top3 nuevo **antes** de esperar cabezas futuras. El corpus completo junio–octubre fue explorado extensivamente: hace falta validación prospectiva, no optimizar más hiperparámetros sobre estas mismas fechas.

## Evidencias reproducibles
- Rama: `lab/vt3-secuencias-control-edad-16oct2026`.
- GitHub Actions exitoso: https://github.com/y0t3/Modelo-Papa/actions/runs/38865551414
- `scripts/lab-vt3-secuencias-emparejadas.ts` calcula secuencias, clases, controles y bootstrap por jornada, con verificaciones estrictas de historia sin saltar turnos; `scripts/lab-vt3-secuencias-movimiento.ts` reconstruye 520 PRE y produce dos JSON.
- Artefacto `LAB-VT3-SECUENCIAS-JUN-OCT-2026`: `VT3_SECUENCIAS_EMPAREJADAS_520_CORTES.json` (resumen principal), más `VT3_MOVIMIENTOS_COLUMNAS_JUN_OCT_2026.json` (520 PRE y 1002 historias completas).
- **Todas las métricas corresponden a coincidencias retrospectivas de familias de tres cifras, no a éxitos exactos de cuatro cifras ni a probabilidades de apuesta.**
