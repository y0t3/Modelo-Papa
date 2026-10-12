# Modelo Papá — VT3 primero: 8 cortes ausentes y 11 fuera del Top 10

**12/10/2026. Ensayo retrospectivo ya ejecutado sobre 23 jornadas y 115 cortes existentes.** Rama `auditoria-sorteo-10oct-2026`. **No** modifica `main`, motor V7–V14, marcado automático de hoja +11, Top oficial ni APK. **No** retoma aún la elección de la cuarta cifra VT4.

## Hipótesis nueva probada sin conocer POST

El ensayo previo dejó **8 cortes** con alguna VT3 objetivo físicamente disponible, pero fuera de D−7, D−1 y puente de tramo; y **11 cortes** donde D−7 tenía la familia pero ésta quedaba fuera del Top 10.

Dos observadores PRE adicionales:
- **D−2 operativa**: penúltima jornada **con sorteos**, no día calendario D−2. Sólo traslada rutas VT3 antiguas **realmente confirmadas por cabezas completas**, preservando fuente y tres celdas contiguas sin reuso. Cada testigo retiene cabeza, jurisdicción, turno, familia y casilleros antiguos/actuales.
- **Contactos parciales D−7/D−1**: una familia física actual toca una huella heredada en algún casillero sin poder atribuirse un traslado completo válido. Contacto **NO ES** huella confirmada de esa familia. Los contactos se guardan y auditan por ruta, no como puntos o familias predictivas nuevas.

Los rankings VT3 previos `D7_FROZEN` y `D1_PRIOR_FROZEN` permanecen **idénticos**.

## Ocho ausentes: resultado completo

| Fecha/turno | VT3 objetivo física | D−2 confirmada | Contacto parcial | Interpretación |
|---|---|---|---|---|
| 17/09 Primera | `597/795` | Sí, puesto 32 | D−1 | Recuperación física de bolsa, fuera Top 10 |
| 19/09 Previa | `098/890`, `355/553` | Sí, puestos 10 y 3 | D−1 | **Único de los ocho rescatado por Top 10 D−2** |
| 19/09 Primera | `396/693` | Sí, puesto 11 | D−1 | En bolsa, fuera Top 10 |
| 23/09 Matutina | `064/460` | No | No | Sigue sin explicar por estas vías |
| 23/09 Vespertina | `289/982` | No | D−7, D−1 | Sólo contacto, NO herencia |
| 28/09 Nocturna | `137/731`, `168/861`, `718/817`, `778/877` | No | D−1 para `168`/`718` | Sólo contacto, NO herencia |
| 02/10 Nocturna | `328/823`, `979` | No | No | Sigue sin explicar |
| 09/10 Nocturna | `354/453` | No | No | Sigue sin explicar |

Por tanto: **3/8 recuperados con rutas D−2 completas confirmadas**, **2/8 sólo con contactos parciales** y **3/8 no recuperados**. El caso `355/553` del **19/09 Previa** utiliza una ruta actual de fuente Nocturna anterior vinculada a la terna antigua `446`, confirmada por cabeza completa **`9446` del 17/09 Previa**. No usar POST como origen de la ruta.

| Bolsa/Top | Acierto de bolsa, cortes | Familias medias/corte | Top 3 | Top 5 | Top 10 |
|---|---:|---:|---:|---:|---:|
| D−7 original | 27 | 31,78 | 5 | 8 | 16 |
| D−1 original | 33 | 32,97 | **9** | **13** | **18** |
| Unión anterior D−7∪D−1∪puente | 72 | 105,21 | — | — | — |
| **D−2 sola** | 31 | 31,64 | 5 | 7 | **10** |
| Unión anterior más D−2 | 75 | 110,12 | — | — | — |
| Unión anterior más D−2 y contactos | 77 | 125,45 | 7 (orden contacto) | 7 | 12 |
| Todas las VT3 físicas | 80 | 132,81 | — | — | — |

El **Top10 D−2 obtuvo 10/115**, frente a **10,334** esperados por selección aleatoria de diez familias dentro de su misma bolsa. No hay mejora predictiva, y la expansión de contactos satura casi todo el tablero físico (77/80 cortes en cobertura máxima, pero una bolsa promedio de 125,45 familias). Los mismos datos Sept/Oct fueron investigados muchas veces, por lo cual no son holdout confirmatorio.

## Once ordenados fuera: causa y control negativo

El D−7 original contenía **3.655 exposiciones** de madres: **1.616** con bifurcación de tramo y **2.039** sin ella. En todas las madres D−7, **19** exposiciones con bifurcación y **12** sin ella coincidieron en POST. Pero el Top10 destinaba **1.017 de sus 1.104 posiciones** a madres con bifurcación; sólo 87 a las otras.

**Nueve de los once cortes perdidos** tenían una madre objetivo sin bifurcaciones. Intentar solucionar esto con una **cuota fija PRE de siete puestos para bifurcaciones y tres sin bifurcación**, manteniendo el ranking congelado dentro de cada clase, resultó **Top10 13/115**, en lugar de **16/115**: **dos rescates, cinco pérdidas**. Una cuota 5+5 dio **11/115**. Nulo dentro de la bolsa con cuota 7+3 y mismo presupuesto: **11,135** cortes esperados. Bootstrap por las 23 jornadas, diferencia 7+3 frente a original: **[−7, +1] cortes**. No imponer cuotas, no promocionar bonificaciones.

El caso `243/342`, **29/09 Nocturna**, estaba **11.º**: el mayor problema es la discriminación cerca del límite, no simplemente el volumen de la bolsa. Otros quedaron 15.º, 16.º, 22.º, 27.º, 28.º, 31.º, 32.º, 36.º, 42.º y 46.º; no basta ampliar el Top sin cambiar el cupo.

## Geometría y reproducción

Se preservó el tablero físico 6×2 por fuente, con las seis jurisdicciones contribuyendo al +11, y cinco argentinas para cabezas objetivo. Sin salto, vacío, retorno a celda usada o conexión entre fuentes. Auditadas:
- **4.413** rutas actuales D−2 con lectura real de su VT3.
- **4.786** apoyos de esas rutas a recorridos antiguos confirmados.
- **4.926** referencias a cabezas históricas completas contrastadas con resultados anteriores.
- **22.064** contactos D−7 y **21.965** D−1, cada uno contrastado con raíces auténticas de su fuente. Ninguno computado como nuevo recorrido heredado confirmado.
- **115** decisiones PRE; POST únicamente para evaluar aciertos históricos.

**Paquete reproducible de conversación:** `modelo-papa-diagnostico-vt3-8-ausentes-11-fuera-top-115-cortes-12oct2026.zip`, **49 archivos**, **4.340.101 bytes**, SHA256 **`96542f9821c31f11d689e18535475c091c022c70305d4aabe71df3584cdabbf1`**. Contiene 30 datos crudos por jornada, los PRE anteriores congelados, `diagnostico.py`, `comprobar.py`, `cuotas.py`, `visores.py`, PRE/POST separados, CSV detallado de los 19 casos, informe y ambos visores HTML de los **115 cortes**. ZIP `testzip` correcto. En carpeta aislada sin POST se regeneraron PRE y visor PRE y después con POST se regeneraron POST, CSV, cuotas y visor POST, **seis hashes exactos**.

SHA256 del nuevo `DIAGNOSTICO_VT3_PRE.json`: **`650a4243a27acdcb0ca0a8c0b525a1a15ee002100a093b28cb1327a9f0ad4b64`**. SHA256 `DIAGNOSTICO_VT3_POST.json`: **`b07d9252319bd0c56cef937d986f10399f060d05f3d6c5441bd941bfea12015d`**.

Los visores PRE/POST se probaron en Chromium/Playwright con muestra representativa de cuatro cortes: selección de fecha, turno, familia, fuente y ruta; render de cuatro grillas SVG, cero errores JS. Los archivos distribuidos incluyen la base completa de **115 cortes**; no se afirma que se haya probado visualmente cada uno. La vista PRE no contiene resultados objetivo ni banderas de fallos definidos por POST.

## Decisión

**VT3 permanece como objetivo principal.** La recuperación geométrica D−2 puede añadirse como observador visual, pero **no** al Top por defecto. Un contacto parcial no pasa a ser una figura confirmada; una cuota de familias sin bifurcación tampoco mejora los resultados. Conservar los tres cortes todavía sin antecedente y los once fallos de ranking, así como todos los testigos positivos y negativos, sin reescribir motor ni esperar nuevas fechas. Pasar a VT4 sólo cuando tengamos un mejor criterio VT3 independiente, con evaluación temporal rigurosa.
