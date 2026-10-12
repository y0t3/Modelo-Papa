# Modelo Papá — Una raíz histórica confirmada genera varias madres VT3

**12/10/2026. Prueba ejecutada, verificada y reproducida sobre 115 cortes de 23 jornadas históricas** (septiembre/octubre de 2026). **No altera** `main`, motor oficial V7–V14, Top de producción, hoja +11 automática, registros ni APK. **VT3 se estudia antes de VT4.** Rama experimental `auditoria-sorteo-10oct-2026`.

## Problema investigado

El usuario solicita discriminar cómo una figura VT3 confirmada por una cabeza antigua en D−7 produce distintas candidatas tras trasladarse geométricamente a la hoja disponible antes del corte. No basta acumular recorridos, cabezas o fuentes, ni sirve escoger a posteriori la raíz que contenía el resultado.

**Raíz física:** clave `fuente de 6×2 + bloque antiguo de tres celdas sin orden de lectura + cabeza histórica completa + turno antiguo`. Las orientaciones/repeticiones de una misma figura no crean una segunda raíz. Para cada raíz, el PRE conserva TODAS las rutas de traslado y todas las madres VT3 reversibles que nacen en el tablero actual, así como las bifurcaciones que comparten **un tramo real de dos casilleros** con la ruta trasladada de esa misma raíz. Se cuentan bloques nuevos distintos, sin eliminar sus recorridos alternativos.

No se cruza fuente ni se usan celdas vacías, saltos o celdas reutilizadas. **Las marcas automáticas de la hoja siguen siendo POST a cabezas completas ya publicadas**, nunca trazos predictivos. Las cabezas objetivo se mantienen fuera del PRE.

## Descubrimiento geométrico

Sobre **3.655 exposiciones madre VT3 recuperadas por D−7**, hay **1.036 exposiciones de raíces históricas diferentes por corte**. No equivale a 1.036 pruebas independientes: una misma raíz aparece de nuevo en varios turnos de la jornada.

Cada raíz pudo producir **entre 3 y 10** familias VT3 reversibles distintas, **mediana 4**, sin raíz con descendiente único:
- 3 descendientes: **115 raíces**.
- 4 descendientes: **458**.
- 5 descendientes: **339**.
- 6 o más descendientes: **124**.

**2.842 exposiciones de madres** tienen una sola raíz confirmada y **813** más de una. Aunque una raíz antigua esté físicamente demostrada, **no determina la VT3 correcta**; hay que resolver dos selecciones: cuál raíz examinar y qué descendiente de esa raíz priorizar.

### Caso histórico 05/10 Matutino

Cabeza anterior **`2517`**, 28/09 Vespertino, huella antigua reversible **`517/715`** en fuente **Primera +11**. Al trasladarla al tablero disponible el 05/10 genera **cuatro** madres diferentes:

| VT3 descendiente | Bloques bifurcados propios de esa raíz | Puesto Top D−7 congelado |
|---|---:|---:|
| `277/772` | 1 | 22 |
| `379/973` | 0 | 29 |
| `507/705` | 0 | 30 |
| **`729/927`** | **3** | **6** |

Cabeza objetivo POST Santa Fe `3729` contiene terminación VT3 `729`. Caso retrospectivo valioso para estudiar una transformación. **No se usó ese resultado para generar las cuatro madres o su ranking PRE.**

## Ensayo de priorización sin alterar bolsa o presupuesto

**Mismas madres D−7, mismos Top3/5/10 y ranking original congelado.** Las variantes cambian **solo la prioridad PRE** usando atributos computables por raíz.

| Criterio VT3 | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| **D7_FROZEN**, bifurcaciones tradicionales | **5** | **8** | **16** |
| `RAIZ_MENOR_ABANICO`, raíz que engendra menos familias | 3 | 3 | 12 |
| `RAMAS_POR_DESCENDIENTE`, bloques de rama divididos por amplitud de la raíz | 4 | 8 | **16** |
| `BLOQUES_ANCLADOS_RAIZ`, bloques realmente conectados a esa raíz | 5 | 8 | 15 |
| `MAX_RAMA_MISMA_RAIZ`, máximo de bifurcaciones de una raíz | 5 | 9 | 15 |
| `RAICES_QUE_BIFURCAN`, cantidad de raíces que producen ramas | 5 | 9 | 15 |

Son **cortes** donde al menos una familia VT3 del Top coincidió entre cinco cabezas argentinas (n=115). No son números ni apuestas individuales. No se eligió ninguna cifra VT4.

El control de cobertura equivalente conserva bandas de **rutas VT3 actuales, fuentes, rutas heredadas, número de raíces y lecturas de cada familia**. Expectativa descriptiva para Top10:
- Ranking D−7 original **11,365 cortes** frente a **16 observados**.
- `RAMAS_POR_DESCENDIENTE` **11,669** frente a **16**; mismo balance, no mejora.
- `RAIZ_MENOR_ABANICO` **10,785** frente a **12**; peor que el anterior.

Bootstrap de diferencias pareadas por las **23 jornadas completas**: Top10 `RAIZ_MENOR_ABANICO − D7` intervalo **[−10,+2]**; `BLOQUES_ANCLADOS_RAIZ − D7` **[−3,0]**; `RAMAS_POR_DESCENDIENTE − D7` **[0,0]** porque cambió selección, no conjunto de cortes acertados. El corpus está explorado reiteradamente, por lo que ningún resultado es evidencia confirmatoria de poder predictivo.

### Comprobación condicionada dentro de la misma raíz (NO un Top)

De 1.036 exposiciones raíz×corte, **sólo 40** tenían una familia ganadora entre sus descendientes. **Si uno supiera por POST qué raíces contienen ganador**, elegir dentro de cada una el descendiente con más bloques bifurcados desde esa raíz recuperaría **17/40**, frente a **9,125** esperado eligiendo uniformemente entre sus familias.

**PERO:** dentro de raíces igualadas por rutas físicas, huellas heredadas y fuentes, el resultado esperado sube a **17,333/40**. La aparente diferencia sobre azar uniforme se explica por geometrías más densas. Además el ejercicio selecciona raíces retrospectivamente por contener ganador; **NO es una política para elegir raíces PRE**.

Controles dentro de esas 40 raíces: elegir la familia con más recorridos físicos totales **16**, con más bifurcaciones globales **18**, o mejor clasificada por D−7 ya existente **18**. Tampoco destaca la preferencia por bifurcaciones propias de una raíz.

## Casos favorables y desfavorables

- `RAIZ_MENOR_ABANICO` rescata respecto a D−7 cortes históricos como **17/09 Vespertino (VT3 `174/471`)**, **24/09 Nocturno (`076/670`)**, **26/09 Vespertino (`757`)**, pero pierde otros **siete** (15/09 Matutino, 24/09 Previa y Matutino, 25/09 Matutino, 28/09 Primera y Matutino, 02/10 Previa): balance neto negativo.
- `BLOQUES_ANCLADOS_RAIZ` pierde **05/10 Vespertino**, familia `799/997`, que estaba en el Top10 original; **no rescata** cortes nuevos.
- La familia `729/927` del **05/10 Matutino** sigue en Top10 de la variante normalizada por abanico (8.ª) y en el original (6.ª), pero el rango de una familia no justifica seleccionar una raíz por POST.

## Implementación y entrega reproducible

**ZIP de conversación:** `modelo-papa-vt3-una-raiz-varias-familias-115-cortes-12oct2026.zip`, **17 archivos, 1.307.596 bytes**, SHA256 `291f6a31892252b4cac95cbb0e4db9885360e251984aaba89c98c2e9d6600c4a`; test ZIP íntegro.

Contiene `analizar.py` (fases `pre|verify|post|rootdiag|report`), `visores.py`, `reproducir_aislado.py`, `probar_visores.py`, insumo histórico PRE, resultados POST aparte, `FANOUT_PRE.json`, `FANOUT_POST.json`, diagnóstico condicionado, los 115 cortes CSV, 1.036 raíces CSV, informe, README, dos visores HTML offline y capturas.

- **PRE SHA256:** `34e479f84f664fd400f99d3f8e11c0db3bceba256b9f4a2da99698b778add235`.
- **POST SHA256:** `36d0c7e232c8fa8362254c13b82613672b17d4bed14d0611a9be944fb79031f1`.
- `verify` recalculó las **115 geometrías de raíz y familias**, comprobó **1.036 raíces** y **4.891 vínculos de cabeza confirmada a recorrido transferido**, y verificó todas las rutas VT3 actuales que participan en ranking: fuente única, lectura, tres celdas distintas, vecindad (incluida diagonal), ausencia de vacíos y retorno.
- **`reproducir_aislado.py` PASÓ** en un directorio temporal nuevo: PRE y visor PRE generados con `RESULTADOS_POST.json` **físicamente ausente**; luego se copió el resultado objetivo y se regeneraron **ocho salidas byte a byte idénticas**, incluyendo PRE, POST, diagnóstico, CSV e HTML.
- Visores `VISOR_RAICES_VT3_PRE.html` y `VISOR_RAICES_VT3_POST.html` completos con las **115 fechas×turnos**, selector de raíz y todos sus descendientes, antiguo bloque físico, hoja actual, huella transferida, bifurcaciones por tramo, fuentes, ranking anterior y alternativas; POST muestra objetivos solamente después. Ambos comprobados en **Chromium/Playwright**, caso `05/10 Matutino, raíz 2517, familia 729`, cambio de criterio y familia, **cero errores JS**.
- No se reetiquetaron las marcas de la hoja de papá ni se usaron las cabezas nuevas para construir el PRE.

## Decisión siguiente

**No promover ninguna variante** ni volver todavía a completar VT4. El atlas deja resuelta la procedencia `cabeza completa D−7 → raíz concreta → familias distintas → rama concreta`. La discriminación faltante no es sumar caminos ni acortar abanicos; es comprender **cómo se comporta esa misma figura confirmada en otras hojas**, con los mismos testigos y controles de densidad. Continuar con las hojas ya disponibles, conservar negativos y separar todos los PRE de POST.
