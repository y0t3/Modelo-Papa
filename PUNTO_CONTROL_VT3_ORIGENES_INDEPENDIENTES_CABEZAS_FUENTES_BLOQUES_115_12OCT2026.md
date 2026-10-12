# VT3 antes de VT4 — cabezas históricas, fuentes y bloques físicos independientes

**12/10/2026.** Prueba retrospectiva completada sobre las **23 jornadas / 115 cortes históricos** de septiembre–octubre. **Sin alterar el motor, `main`, la hoja +11, las marcas automáticas, los Top oficiales ni la APK.** Rama experimental `auditoria-sorteo-10oct-2026`.

## Definición precisa

Conservamos los mismos **3.655** registros madre VT3 D−7 y exactamente sus recorridos físicos + rankings congelados. Cada madre reversible equivale a una familia de dos lecturas cuando éstas difieren; Top3/5/10 cuenta **familias, no números**.

- Una **cabeza histórica independiente** es un número completo antiguo de cuatro cifras **diferente**; no se multiplica porque una misma cabeza dé más de un recorrido.
- Un **bloque VT3 físico** son tres casilleros distintos en una fuente 6×2, sin importar el orden válido de recorrido. Los recorridos completos se conservan y verifican.
- Distinguir varias cabezas que desembocan en el **mismo bloque heredado** y cabezas exclusivas de **bloques diferentes**.
- Dos fuentes significan orígenes físicos de fuente distintos, NO dos caminos dentro de la misma fuente.
- Sólo fuentes y cabezas antiguas efectivamente conocidas antes del corte objetivo; POST separado. No se crean candidatos VT4.

**Importante:** el ranking D−7 anterior YA incluía diversidad de fuentes y cabezas como **desempates secundarios**; este experimento evalúa si subir esas características por encima de las bifurcaciones sería útil.

## Geometría PRE (exposiciones, no aciertos independientes)

| Variable | Casos |
|---|---:|
| Exposiciones madre VT3 D−7 | **3.655** |
| Dos o más cabezas completas históricas distintas | **680** |
| Dos o más fuentes históricas | **57** |
| Dos cabezas distintas explican un mismo bloque actual | **406** |
| Cabezas exclusivas sobre dos bloques actuales distintos | **352** |

Las categorías se superponen, y la misma exposición puede aparecer en varios turnos.

## Resultado en 115 cortes: cortes con ≥1 familia VT3 del Top que coincide con cabeza POST

| Ranking de familias VT3, mismo presupuesto | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| **D−7 bifurcaciones original congelado** | **5** | **8** | **16** |
| Prioridad a cabezas históricas diferentes | **2** | **4** | **10** |
| Prioridad a bloques históricos diferentes | **2** | **4** | **10** |
| Convergencia histórica sobre un mismo bloque | **1** | **3** | **10** |
| Convergencia exclusiva sobre bloques distintos | **2** | **3** | **9** |
| Prioridad a varias fuentes de origen | **2** | **4** | **10** |

Top10 por cabezas distintas frente al original: diferencia −6 cortes; bootstrap descriptivo pareado por las **23 jornadas completas**, intervalo **[−12,−1]**. No confundir este intervalo exploratorio con validación prospectiva tras investigar repetidamente las mismas fechas.

Control de selección aleatoria con igual Top y bandas de densidad de rutas, fuentes, huellas D−7, cabezas distintas y 1/2 lecturas: **expectativa 12,155** cortes para composición del Top10 original; **7,840** para composición del Top10 ordenado por número de cabezas. Estos controles son condicionales a atributos y cupo, no al resultado. No demuestra superioridad externa de ningún método.

En el **Top10 original** hubo **17 coincidencias madre-exposición en 16 cortes**; **13 de esas 17** tenían una sola cabeza histórica confirmada. En toda la bolsa D−7, las **31 exposiciones acertadas** estaban respaldadas desde una sola fuente, aunque sólo **57 de 3.655** exposiciones incluían varias fuentes: no es una señal para vetar las multisource, es escasez de observaciones.

## Dos casos que impiden una regla simplista

- **26/09 Nocturna, familia `283/382`**: antiguas cabezas completas **`4693`, `6553`, `6890`** sustentan un **único bloque heredado actual** de una fuente. D−7 bifurcaciones puesto **28**; cabezas históricas primero puesto **4**. POST coincide con `283/382`. Un rescate retrospectivo que no prueba una política mejor.
- **05/10 Matutina, familia `729/927`**: una cabeza histórica antigua **`2517`** sustenta un recorrido D−7 que se bifurca físicamente en la nueva hoja. Ranking bifurcaciones puesto **6**, cabezas históricas primero **16**. Posteriormente salió `3729`, terminación VT3 `729`. La política alternativa perdió este corte.

## Reproducción y visor

Archivo de conversación **`modelo-papa-vt3-cabezas-fuentes-bloques-independientes-115-cortes-12oct2026.zip`**: **15 archivos**, **854.498 bytes**, SHA256 **`1a8f0882ac1e8ca07933bb95fbfae54f61d7cf868af9183d78b6b3938b70fa48`**. ZIP comprobado y extraído en **carpeta nueva**: se ejecutó `analizar.py pre` y `verify` **sin archivo `RESULTADOS_POST.json`**, dando PRE hash **`7bd498f6dbfdc84e1c726d4498128bb05dc9654cb2209e79e967bd912029ec24`**. Después, con POST, regeneró hash POST **`ea360ce309d750fdb6be462bc6c3ec0987dcf6e9e6a8965b3efa4d358f6db6d2`**. **Seis salidas reproducidas byte por byte**, entre PRE/POST JSON, CSV, dos HTML e informe.

Contiene scripts `analizar.py`, `visores.py`, `crear_informe.py`, entradas y salidas PRE/POST, CSV por 115 cortes, `INFORME.md`, `LEEME.md` y capturas. Visores `OBSERVATORIO_VT3_ORIGENES_PRE.html` / `OBSERVATORIO_VT3_ORIGENES_POST.html` presentan hojas D−7 y actual, todos los recorridos VT3, heads antiguas, origen y cambios de puesto. Ambos HTML probados en Chromium con Playwright mediante `set_content`, sin errores JS, cambios de fecha, turno, criterio, familia y recorrido. PRE no muestra cabezas objetivo; POST sí.

## Decisión

**Mantener las bifurcaciones D−7 como referencia experimental** y añadir los antecedentes independientes al observatorio, sin bonificar automáticamente múltiples cabezas, bloques ni fuentes. Este estudio NO demuestra pronósticos genuinos ni permite cambiar el Top oficial. No avanzar a VT4 hasta resolver mejor la selección de VT3. Se puede seguir trabajando con las mismas hojas para estudiar cómo una única huella antigua confirmada se bifurca de modo distinto según la jornada, preservando los negativos.
