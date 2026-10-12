# Punto de control — bifurcaciones físicas reales de VT3 → cada hija VT4

**11/10/2026. Experimento descriptivo completado y reproducido** sobre los mismos 23 días / 115 cortes históricos (70 sept, 45 oct), sin esperar resultados nuevos. Rama de auditoría, **sin cambios** en motor, tablas automáticas, `main`, V7–V14 ni APK.

## Pregunta visual nueva, diferente de las pruebas ya cerradas

De las formas adicionales de una madre VT3 que estaban en la hoja actual, ¿cuáles nacen realmente de **compartir celdas con una huella VT3 trasladada desde D−7 o última jornada** y qué hija VT4 física puede surgir de cada rama? Mantener rutas completas; la última cifra agregada nunca se vuelve una madre nueva por inversión.

**Clasificación por cada recorrido nuevo**, comparado solamente con madres VT3 heredadas de **la misma fuente de 6×2** y **la misma familia VT3**:

| Relación de la copia VT3 nueva con huellas heredadas | Caminos |
|---|---:|
| **Bifurcación de tramo**: comparten un par consecutivo de celdas | **1.038** |
| Contacto en dos celdas, pero no el mismo tramo consecutivo | **174** |
| Contacto de un casillero solamente | **192** |
| Separada: cero celdas compartidas con heredadas de esa fuente | **62** |
| **Sin raíz de igual madre en esa fuente**: no hay heredada con qué comparar (NO es un camino aislado) | **653** |
| **Total de formas VT3 nuevas** | **2.119** |

Estos recorridos pertenecen a **918 exposiciones madre-corte** con alguna forma adicional; **629** presentan al menos una bifurcación de tramo. Otras **1.914** rutas madre actuales fueron heredadas y no se duplicaron.

De **21.410 hijas reversibles** asociadas a las 11.040 extensiones madre+cifra del universo diagnosticado, **9.303** tuvieron al menos un recorrido VT4 físico propio, otras **12.107** sólo lectura numérica. De las físicas, **3.745** hijas-exposición tienen algún testigo generado desde una copia nueva que comparte tramo con una heredada. **No** son 3.745 señales de predicción; hay abundante cobertura geométrica y trayectos correlacionados.

## Resultados POST (SIN reajustar selección PRE)

En **115 cortes**, al ensayar las diez cifras por madre VT3 elegible de su Top10 original, hubo **20 exposiciones coincidentes madre+cifra** en el POST; **sólo 6** fueron coincidencias de la **hija exacta físicamente trazada**, repartidas en **5 cortes**. De esas seis:
- **2** tenían al menos una ruta de la hija apoyada en una bifurcación de tramo.
- **3** dependían exclusivamente de padres de forma nueva, sin testigo VT4 de madre heredada para esa misma hija.
- **3** tenían también soporte VT4 de madre heredada. Las categorías de ramificación y ascendencia son superpuestas.

**No hay evidencia de que las bifurcaciones mejoren la selección del dígito**: estas cifras son descripciones de una bolsa de cobertura amplia, no rendimiento de Top3/5/10 reoptimizados ni un conjunto de validación independiente.

### Casos contrapuestos verificados

- **26/09 Matutino; madre `013/310`**. Una forma antigua VT3 `109/901` de D−7 fue confirmada por cabeza completa **`4109`** y se traslada dentro de la fuente **Previa +11** para dar la nueva madre `013/310`. Una nueva copia de `013` comparte un tramo de dos casillas con la heredada. Al añadir `7` se forma físicamente la hija reversible **`0137/7310`**, que coincide en POST. Esta hija tiene **6 testigos desde formas nuevas** y **ninguno desde madres heredadas**. No ajustar un ranking después de conocer el resultado.
- **03/10 Matutino; madre `295/592`**. La hija física `2592/2952` presenta tanto un testigo de huella heredada como uno de nueva bifurcación; la cabeza real `2592` coincide, pero los dos apoyos no son dos aciertos.
- **05/10 Matutino; madre `729/927`**. Dos rutas VT3 de forma adicional bifurcan de trazos heredados. Sin embargo, la hija que salió **`3729/9273`** tiene **2 testigos VT4 desde huellas heredadas** y **0 desde las nuevas ramas**. Su hermana `3927/7293` mantiene sus propios tres testigos. **Prohibido adjudicar el acierto de `3729` a las formas bifurcadas o a `3927`.**

## Antifuga, fuente y reproducción REAL

Entrada PRE exacta: `FUENTE_UNIFICADO_PRE.json`, SHA256 **`337c9ad152fbd842356e255746f2c339ac40a1deaf3c8d90fc29a4beb16f96ca`** del observatorio anterior. Se usa también el atlas PRE D−7/D−1 previo, y los objetivos se leen sólo del `FUENTE_UNIFICADO_POST.json`, etapa separada.

- **SHA PRE nuevo** `BIFURCACIONES_PRE.json`: `01459eeac6e9636715f6d9242c203db0a83f7f4b35e8cf8e7472a01aea39be3f`.
- **SHA POST nuevo** `BIFURCACIONES_POST.json`: `93f7d6fa5c8a191b0634cf51aead241b0c5b41f155b7e019bb11daa863a511f5`.
- **22.653 recorridos físicos VT4** revalidados, con fuente única, 4 celdas distintas realmente vecinas, lectura reversible verificada, ancestro triple real y evidencia propia de cada hija. **21.410** hijas individuales auditadas. La clasificación de las **2.119** formas nuevas volvió a computarse íntegra.
- **Archivo ZIP reproducible, verificado en sesión**: `modelo-papa-bifurcaciones-vt3-hijas-vt4-115-cortes-11oct2026.zip`, **16 archivos**, **2.739.769 bytes**, SHA256 **`8ea16e6307137d9d24d05a970ef32d87b5a8c3d7f4323a5fb314e863f9a05184`**, `testzip()` OK.
- Prueba independiente: se extrajo el ZIP a carpeta nueva, **se retiraron físicamente todos los ficheros POST**, y se regeneró el PRE idéntico; sólo después se reintrodujo el resultado fuente, se reprodujeron **7 archivos byte por byte** (JSON PRE, JSON POST, dos HTML, dos CSV, informe). Script reparado para utilizar `Path(__file__).resolve().parent`, no la carpeta original.
- `VISOR_BIFURCACIONES_PRE.html` y `VISOR_BIFURCACIONES_POST.html` permiten recorrer **115 cortes**, madre, fuente, cifra e hija; dibujan las tres hojas y **TODOS** los trazos físicos. **Chromium/Playwright comprobados** en 26/09 y 05/10 con controles reactivos, sin errores JS; PRE no contiene la cabeza objetivo, POST sí la muestra.
- Incluye `analizar.py`, `verificar.py`, `informe.py`, `visores.py`, `probar_visores.py`, `LEEME.md`, `BALANCE_POR_CORTE.csv` y `COINCIDENCIAS_POST.csv`, con casos negativos y fuentes congeladas. El ZIP está disponible como archivo adjunto de esta conversación; el repositorio almacena aquí el punto de control, no el ZIP entero.

## Decisión y siguiente trabajo sin esperar sorteos nuevos

Conservar la conexión `cabeza histórica completa → huella antigua confirmada → traslado a madre VT3 nueva → bifurcación real o no → testigo físico de la hija VT4 específica` como **dato visual de observación**.

**Siguiente pregunta distinta**: cuando **antecedentes de cabezas históricas diferentes** (no múltiples caminos de la misma cabeza) convergen físicamente sobre **una misma hija VT4**, ¿es información adicional o simplemente multiplicación de cobertura? Definir independencia por cabeza completa, fecha/turno y fuente, comparar contra controles con igual cantidad de familias y numerales. No dar un bono al número de líneas ni modificar motor oficial en este punto.
