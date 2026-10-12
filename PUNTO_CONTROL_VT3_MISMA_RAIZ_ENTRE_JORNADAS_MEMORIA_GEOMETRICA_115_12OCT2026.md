# Modelo Papá — Memoria física de una misma raíz VT3 entre jornadas

**12/10/2026. Prueba retrospectiva completada sobre 23 jornadas / 115 cortes ya disponibles**, rama experimental `auditoria-sorteo-10oct-2026`. **Sin cambios** en `main`, motor oficial V7–V14, Top, tablero +11, marcado automático o APK. No se agregaron cifras VT4.

## Hipótesis probada

Fijar una raíz histórica confirmada por **fecha D−7, cabeza completa, turno antiguo, fuente +11 y bloque de tres casilleros**, reuniendo todas sus rutas válidas. Trasladar esa misma raíz tanto al tablero de la **última jornada sorteada** como al del corte actual **del mismo turno y fuente**. Ambas grillas sólo contienen lo conocido antes de sus respectivos turnos. Analizar por separado:

- **Ruta física completa** en una fuente 6×2, contigua incluso diagonal, sin reutilizar casilla ni atravesar fuentes, reconociendo la inversa.
- **Bloque geométrico** sin orientación: varias lecturas de un mismo bloque no son testimonios espaciales independientes.
- **Familia VT3 reversible**, que puede cambiar aunque las celdas recorridas sean las mismas.
- **Bifurcaciones nuevas/persistentes**, entendidas como rutas de esa misma familia que comparten un segmento real de dos celdas con un traslado de la raíz.

El PRE no accede a resultados de la fecha objetivo ni los usa para elegir ruta, cifra, ranking o raíz. Se conserva íntegra la bolsa de madres D−7 y el ranking por bifurcaciones `D7_FROZEN` del experimento anterior.

## Inventario temporal verificable

- **115 cortes** y **1.008 exposiciones de raíz** con hoja anterior comparable; las cinco del primer día carecen de jornada anterior en este corpus.
- Deduplicadas las repeticiones por turnos de **una misma fecha + evento histórico + fuente + bloque**: **268 comparaciones raíz/día**.
- **252/268** raíces no comparten ninguna familia VT3 entre los dos días, **14** comparten una y **2** comparten dos, al comparar todos sus descendientes posibles.
- Sus traslados ocupan **1.167 bloques físicos** equiparables; **1.166** bloques no conservan ninguna lectura VT3 anterior; **1** conserva alguna. El mismo lugar físico casi siempre lleva a otros dígitos.

### ¿El lugar que bifurcó antes vuelve a bifurcar?

| Evolución por bloque (no por ruta duplicada) | Bloques |
|---|---:|
| Bifurcó en ambas jornadas | **342** |
| Sólo en la anterior | 268 |
| Sólo en la actual | 307 |
| En ninguna | 250 |
| **Total** | **1.167** |

Control condicional a **cantidad de bloques de cada raíz y cantidades bifurcadas en cada uno de los dos días**: intersección esperada **347,5**; observada **342**; desviación típica 7,03. Permutación de 10.000 reasignaciones de posición dentro de cada raíz, semilla 20261012: intervalo 95% **[334,361]**, proporción con ≥342 **0,807**. **No hay persistencia espacial anómala de bifurcación**. El control no supone independencia entre cabezas o raíces observadas y sólo es descriptivo.

## Mismos Top 3, 5 y 10 de familias VT3, sin modificar la bolsa

| Prioridad PRE | Top3 | Top5 | Top10 | Nulo Top10, igual bandas de densidad |
|---|---:|---:|---:|---:|
| **D−7 original congelado** | **5** | **8** | **16** | 11,365 |
| Lugar que bifurcó en jornada anterior | **0** | **0** | **6** | 6,680 |
| Cantidad de lugares que bifurcaron antes | 0 | 0 | 9 | 8,396 |
| Lugar que continuó bifurcando | 0 | 4 | 12 | 9,794 |
| Lugar con bifurcación nueva | 7 | 8 | 13 | 10,979 |
| Continuidad o nacimiento mixto | 0 | 3 | 10 | 9,919 |
| Misma familia en descendientes de la misma raíz anterior | 5 | 7 | 14 | 10,524 |
| Mismo nombre de familia con rama anterior | 5 | 7 | 16 | 11,365 |

**El ranking por lugar de bifurcación de ayer perdió diez cortes netos Top10 (2 rescates, 12 pérdidas)**, cambió propuestas en 101 cortes, delta agrupado por 23 jornadas con intervalo exploratorio **[−17,−4]**. La aparición de ramas nuevas mejoró Top3 de 5 a 7, pero bajó Top10 a 13, sin indicio confirmatorio (se han explorado muchísimas hipótesis con el mismo corpus).

El nulo del ranking conserva cantidad de caminos actuales, fuentes, transferencias, raíces y 1/2 lecturas por familia. Los valores no implican ventaja estadística frente a lotería aleatoria ni justifican apostar.

### Ejemplo visual

**05/10 Matutino**, antecedente **28/09 Vespertino, cabeza completa `2517`**, terna confirmada `517/715` en **Primera +11**. Se puede seguir ese bloque ancestral en el tablero de **03/10 Matutino** y luego **05/10 Matutino**, examinando todas las lecturas posibles en los mismos lugares. Entre las familias actuales se encuentra `729/927`, Top10 D−7, que posteriormente coincidió numéricamente con `3729`. La cabeza objetivo NO fue consultada para generar ninguno de esos caminos. Que una figura lleve hacia otra terna no selecciona por sí solo cuál de varias familias saldrá.

## Reproducción documentada

ZIP adjunto en la conversación **`modelo-papa-vt3-seguimiento-misma-raiz-115-cortes-12oct2026.zip`**, **19 ficheros, 1.650.446 bytes**, SHA256 **`0af63b0f16e03792be47a84987e7af6ae8d0940b7a19fa4053ef00c63aca3433`**, `testzip` correcto. Incluye `INPUT_PRE.json`, ranking previo congelado `FANOUT_PRE.json`, `RESULTADOS_POST.json` separado, scripts Python sin dependencias externas, control de geometría y permutaciones, informes, CSV de 115 cortes, dos visores offline autocontenidos y capturas.

- `EVOLUCION_RAICES_VT3_PRE.json` SHA256 `cf8d82d7eaeea888585b8c9a47d95e3b94df48524a2667445bdc261cd50c36cb`.
- `CONTROL_BLOQUES_PRE.json` SHA256 `c7b45c33599c1d43d466d8aef54f8160e245e8fb16bbfe50aedde71b8c439b11`.
- `EVOLUCION_RAICES_VT3_POST.json` SHA256 `d303a56c8456cdbec27ba3da410e0809fbae901516374191fb95583a5a19e54f`.
- `python analizar.py verify`: **115** cortes, **1.008** raíces comparables y **9.528** lugares de recorridos auditados; también verifica la terna antigua contra la cabeza histórica completa, fecha D−7, origen, geometría y familia actual.
- **Reproducción aislada real**: directorio limpio sin `RESULTADOS_POST.json` generó PRE, control geométrico y visor PRE con **3 hashes idénticos**; tras copiar únicamente el resultado POST se reprodujeron **8 salidas idénticas**, incluidos ambos HTML e informe, y pasó la auditoría final.
- Los dos visores `VISOR_EVOLUCION_VT3_PRE.html` y `VISOR_EVOLUCION_VT3_POST.html` permiten seleccionar fecha/turno, cabeza histórica, familia VT3, recorrido completo, ranking; muestran **tres hojas** y las rutas reales bifurcadas de la familia elegida. Se probaron en Chromium/Playwright con **05/10 Matutino, `2517`, `729/927`**, así como corte sin raíz comparable, **0 errores JavaScript**. La vista PRE carece del archivo de objetivos.

## Decisión

Conservar el atlas de evolución de raíz como instrumento visual descriptivo, **sin bonificar la persistencia del lugar bifurcado ni sustituir el Top VT3 oficial**. La figura histórica puede ocupar la misma zona y generar números diferentes; esto confirma por qué no debemos exigir persistencia literal de las cifras. No se ha encontrado todavía criterio con ventaja predictiva demostrable para seleccionar entre madres hermanas de una misma raíz. Continuar investigando VT3 con los datos existentes y sin alterar producción, antes de completar VT4.
