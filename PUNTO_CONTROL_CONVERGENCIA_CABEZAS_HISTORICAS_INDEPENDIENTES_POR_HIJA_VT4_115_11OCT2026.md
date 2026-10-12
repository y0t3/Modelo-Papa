# Modelo Papá — convergencias de cabezas históricas independientes por hija VT4

**11/10/2026. Prueba completa con las hojas ya existentes: 23 jornadas, 115 cortes.** Rama `auditoria-sorteo-10oct-2026`; **sin modificar main, hoja +11 y marcado automático, V7–V14, rankings o APK**. Retrospectivo y exploratorio, no predicción prospectiva.

## Qué se comprobó

Una madre VT3 reversible genera dos hijas VT4 diferenciadas por cada cifra añadida, y cada hija exige sus **propios** recorridos VT4 físicamente contiguos dentro de una única fuente. Las cabezas históricas D−7 o de última jornada (D−1 operativa) se vinculan a **cada recorrido de la hija exacta**, con sus ternas antiguas y fechas. No se prestan testigos entre hijas ni se crean madres nuevas al invertir VT4.

**Unidad de cabeza independiente:** número **completo de cuatro cifras distinto** (conservar fecha/turno y jurisdicción histórica sólo cuando el dato original la ofrece). Dos caminos respaldados por la misma cabeza son una sola cabeza histórica. Cuando el formato antiguo omite jurisdicción, registrar desconocida, no inventarla. El PRE no consulta el POST.

**Cuatro clases de múltiples cabezas:**
1. **Convergencia espacial estricta:** dos rutas VT4 distintas, con al menos una cabeza completa histórica **exclusiva de cada ruta**, diferentes entre sí.
2. Cabezas diferentes alcanzan rutas distintas, pero no hay exclusividad.
3. Varios caminos conservan exactamente las mismas cabezas.
4. Dos o más cabezas diferentes justifican **una sola ruta** actual: convergencia histórica, **no** convergencia espacial.

## Inventario PRE, ruta física propia

Las 11.040 combinaciones madre+cifra originan **21.410 hijas reversibles individuales**, de las cuales **9.303** tienen formación VT4 física, mediante **22.653 recorridos** distintos contabilizados dentro de sus grupos madre+cifra.

| Distintas cabezas completas antiguas atribuibles a la hija física | Hijas |
|---|---:|
| Ninguna cabeza directa | **2.434** |
| Exactamente una | **4.060** |
| Dos o más | **2.809** |
| Total | **9.303** |

De las **2.809** con dos o más cabezas: **1.730** convergencias espaciales estrictas, **363** en varias rutas sin exclusividad, **447** con apoyos compartidos indistinguibles entre varias rutas, **269** en un único camino. **1.870** tienen cabezas antiguas de ambos períodos (D−7 y última jornada).

### Reconstrucción decisiva del 05/10 Matutina

Madre `729/927` + `3`, hija **`3729/9273`**, fuente Primera +11:

- **Ruta actual 0:0 → 1:0 → 2:0 → 1:1**, cabeza histórica **7429** del **03/10 Vespertina**, antigua huella VT3 `429`, última jornada.
- **Ruta actual 0:0 → 1:0 → 2:0 → 2:1**, cabeza histórica **2517** del **28/09 Vespertino**, antigua huella `517`, D−7.

Dos cabezas **completas distintas**, dos jornadas, dos recorridos actuales distintos y antecedentes **exclusivos de cada ruta**: es **convergencia espacial auténtica** de la misma hija `3729/9273`. La cabeza `3729` coincidió con POST Santa Fe. **Pero** la hermana `3927/7293` tiene sus propias tres rutas y no se apoya en estas dos, y **un caso histórico favorable no demuestra capacidad predictiva**.

## Cotejo histórico y control de cobertura equivalente

En todas las madres Top10 históricas **ensayando las diez cifras por madre**, hubo **20 exposiciones madre+cifra con coincidencia numérica**; sólo **6 coincidencias de la hija exacta físicamente formada**, repartidas en **5 cortes**. De las seis, únicamente **1** tenía ≥2 cabezas antiguas completas distintas y convergencia espacial estricta. En las otras cinco, la convergencia estricta **no existía**.

Si deduplicamos por **corte + familia VT4 reversible** en lugar de por madre/cifra, existen **8.511 familias físicas únicas**, **5 coincidencias únicas** y **una** con convergencia estricta. Dos madres que proponen la misma hija **no crean dos aciertos distintos**.

Se construyó un control **hipergeométrico exacto**, que mantiene fijo el corte, las seis coincidencias observadas y la cantidad de hijas de cada clase; sólo permuta las etiquetas de convergencia entre hijas del **mismo rango de cantidad de rutas físicas** (1, 2, 3, 4–5, 6+), evitando que una familia con muchos recorridos gane ventaja sólo por su mayor cobertura:

| Clase | Coincidencias físicas observadas | Media nula condicionada | Cola P(≥observadas), descriptiva |
|---|---:|---:|---:|
| ≥2 cabezas completas antiguas distintas | **1** | **2,318** | **0,969** |
| Convergencia espacial estricta | **1** | **1,906** | **0,928** |

Control con rutas **exactas**: media de estrictas **1,739**; control sólo por corte: **1,589**. En ningún escenario hay señal favorable. No usar las colas nominales como evidencia confirmatoria: los mismos 23 días ya fueron investigados muchas veces, hay pocas coincidencias y muchos recorridos correlacionados.

## Reproducibilidad y material

**ZIP disponible en la conversación:** `modelo-papa-convergencia-cabezas-distintas-hija-vt4-115-cortes-11oct2026.zip`, **18 archivos**, **2.382.228 bytes**, **SHA256 `1d4f1e893165f1a2eb59d9dd948e14747ec7d7665d483bae44a22771a68c9f60`**, test ZIP correcto. Se incluyen insumos originales PRE y POST físicamente separables, código Python 3 estándar `analizar.py` (`pre|post`), `verificar.py`, `controles.py`, `visores.py`, `informe.py`, prueba de navegador, PRE/POST, controles exactos, CSV por hija física, CSV de todas las coincidencias, informe y dos visores HTML autocontenidos de los **115 cortes**.

Hashes de los nuevos resultados:
- **`CONVERGENCIAS_PRE.json`**: `d16c83088fb8c6f740dfb21af5b54c6d59bf502145f201d94a8e1b60078623c4`.
- **`CONVERGENCIAS_POST.json`**: `ace49de5aa6825ec4c2dd2c2a097f718013cbf39b64cc83d7fa49c10831a8b21`.

**Reproducción verificada desde ZIP extraído en una carpeta nueva:** retirar físicamente `FUENTE_UNIFICADO_POST.json`, `CONVERGENCIAS_POST.json` y otros artefactos terminados; ejecutar `analizar.py pre` y `verificar.py` → SHA PRE idéntico. Reponer `FUENTE_UNIFICADO_POST.json`, ejecutar POST/controles/visores/informe → **ocho salidas byte a byte idénticas**. `verificar.py` revalida las **22.653 rutas**, celdas actuales e históricas, ternas de cabezas completas, fuentes únicas, anterioridad, inversión y pertenencia exclusiva de cada testigo a su hija.

Visores `VISOR_CONVERGENCIAS_PRE_115.html` y `VISOR_CONVERGENCIAS_POST_115.html`: tres hojas en pantalla (D−7, última jornada, actual), madre, cifra, hermana VT4 y fuente, **TODAS las rutas físicas** de la hija, y cabezas antiguas por ruta. Probados con Chromium/Playwright: caso **05/10 Matutina** `3729/9273` y cambio de corte, sin errores JavaScript. Navegación directa `file://` estaba bloqueada por el entorno; test del HTML completo con `set_content`. La vista PRE carece de cabezas objetivo y la POST las muestra sólo después del cotejo.

## Decisión técnica

**Mantener convergencia de cabezas independientes como hecho geométrico rastreable**, no como prima, filtro obligatorio, validación de VT4 ni nueva regla predictiva. Se sigue con datos existentes. Posible siguiente investigación: evaluar **familias que pasan de una a dos convergencias a lo largo de jornadas**, preservando PRE cronológico y sin confundir incremento del tablero intradía con traslado físico.
