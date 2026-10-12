# Modelo Papá — VT3 primero: recuperar las familias que D−7 no encuentra

**12/10/2026. Estudio terminado sobre 115 cortes históricos de 23 jornadas ya conocidas; NO es ensayo prospectivo.** Desarrollo separado de VT4. **No modificar `main`, motor V7–V14, hoja +11 automática, Tops oficiales ni APK.** Rama experimental `auditoria-sorteo-10oct-2026`.

## Problema, universo y exclusiones temporales

En el laboratorio VT3 congelado anteriormente, la familia VT3 objetivo reversible existía físicamente (entre todas las rutas de una misma fuente 6×2, adyacentes diagonal incluida, sin saltos/reuso/cruce de columnas de fuentes) en **80 de 115 cortes**; solo **27** tenían alguna familia objetivo recuperada por traslado de figuras confirmadas de D−7. Esto producía **53 cortes con objetivo físico pero fuera de la bolsa D−7**. En **35 cortes** no había ninguna VT3 objetivo físicamente disponible antes del turno. En **11** de los 27 cortes alcanzables el ranking D−7 de bifurcaciones la dejaba fuera del Top10.

No se utilizó una cuarta cifra ni resultados de la jornada objetivo para formar propuestas. Los cinco resultados argentinos se reservaron para el POST, y se conservó el tablero de seis jurisdicciones (incluida Montevideo) únicamente para geometría +11. Solo se consultan fuentes conocidas antes del turno y cabezas históricas previas ya cerradas. El marcado de las hojas de papá sigue siendo **automático POST** a resultados completos, no una predicción dibujada manualmente.

## Dos rescates con reglas físicas antes del resultado

1. **D−1 operativa**: última jornada real con sorteos, que puede ser sábado antes de lunes. Se reenumeran sus rutas de tres celdas confirmadas efectivamente por cabezas completas **de los cinco distritos argentinos** de ese día, incluyendo la fuente Nocturna inmediatamente anterior cuando corresponde, y se trasladan rígidamente en su **misma fuente** al tablero actual. Se registran fecha, turno, jurisdicción, cabeza completa, vieja terna/ruta y nueva terna/ruta. Familias distintas de las antiguas son aceptables si preservan la figura.
2. **Puente físico de dos casillas desde D−7**: una ruta VT3 actual de **otra familia numérica** comparte un segmento físico de dos celdas vecinas con una huella VT3 confirmada D−7 ya trasladada a la hoja actual, **dentro de la misma fuente**. No basta compartir un dígito ni aproximación numérica. Se conservan todas las raíces D−7 distintas y sus caminos. Puentes no equivalen por sí solos a corroboraciones predictivas.

Las reglas se diseñaron y aplicaron sobre `INPUT_PRE.json` y `BASE_VT3_PRE.json` congelados del ensayo anterior, además de **30 archivos crudos de fechas previas normalizados a 4 cifras**, pero el programa genera cada corte consultando datos cronológicamente anteriores al objetivo. PRE no abre ni necesita `RESULTADOS_POST.json`.

## Recuperación de los 53 cortes ausentes de D−7

| Caso | Cortes |
|---|---:|
| Ambas vías recuperan objetivo | **18** |
| Sólo D−1 | **1** |
| Sólo puente D−7 | **26** |
| Ninguna | **8** |

**45/53** están en alguna de las dos bolsas ampliadas; ello NO equivale a 45/53 aciertos de un Top. Cobertura de bolsa en los 115 cortes:

| Bolsa VT3 | Cortes con alguna familia objetivo | Promedio de familias elegibles por corte |
|---|---:|---:|
| D−7 original | **27** | **31,78** |
| D−1 solo | **33** | **32,97** |
| D−7∪D−1 | **46** | **55,56** |
| Puente D−7 solo | **71** | **96,85** |
| D−7∪puente | **71** | **98,89** |
| D−7∪D−1∪puente | **72** | **105,21** |
| Todos los recorridos VT3 físicos | **80** | **132,81** |

**La inflación de bolsa de puentes es crucial**: casi tres veces la bolsa D−7. No confundir cobertura con anticipación selectiva.

## Top 3/5/10 de familias VT3 (NO números individuales), mismos cupos

| Criterio previo a resultados | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| **D7_FROZEN**, ranking de bifurcaciones de laboratorio anterior **sin cambios** | **5** | **8** | **16** |
| **D1_PRIOR**, fuente confirmada D−1 sobre D−7∪D−1 | **9** | **13** | **18** |
| BRIDGE_PRIOR, bifurcaciones cruzadas sobre D−7∪puente | **3** | **5** | **8** |
| UNION_CONVERGENCIA, apoyar varias vías en bolsa unida | **2** | **5** | **11** |
| D7_RETAIN_PRIORITY, preservar todo D−7 en orden y sólo llenar huecos libres | **5** | **8** | **17** |

D1_PRIOR Top10 tiene **8 rescates y 6 pérdidas respecto al D7_FROZEN**, mejora neta **+2**. Intervalo exploratorio de diferencia pareada agrupado por las **23 jornadas**: **[−6,+11]**; incluye cero. En los **11** cortes donde una madre VT3 ganadora estaba en D−7 pero su Top10 falló, D1_PRIOR **no rescató la misma madre D−7**; en uno acertó por otra madre que D−7 no había recuperado.

Control de azar con la misma bolsa y cupo D1 Top10: **10,63** cortes esperados uniformemente. Control condicional más justo, preservando bandas de **caminos físicos actuales, fuentes, cantidad de huellas D−1 confirmadas y pertenencia D−7**: media **13,80** (18 observados). Estos controles son **descriptivos** sobre las mismas fechas ampliamente exploradas, además de múltiples métodos ensayados aquí. No introducir una política nueva ni hablar de mejora prospectiva.

## Casos con prueba geométrica e histórica

- **15/09 Previa; VT3 `175/571`**. Ausente de la bolsa D−7, recuperada por D−1 con cabezas completas `2670` y `2076` de la jornada **14/09**. D1_PRIOR la ubicó **5.ª** y una cabeza posterior `7175` coincidió con la madre. También existía puente D−7, pero quedó **13.º** en el ranking BRIDGE_PRIOR.
- **08/10 Matutina; VT3 `071/170`**. No D−7 ni puente; única vía de las examinadas fue traslado D−1 de huella confirmada por cabeza `0261` en Vespertina anterior. Quedó **10.ª** D1_PRIOR, cabeza POST `7071`.
- **15/09 Vespertina; `565`**. Puente físico de raíz D−7 `365`, pero puesto **132** al priorizar puentes; evidencia de dificultad de clasificación a partir de mucha geometría.
- **05/10 Matutina; `729/927`**. Se conserva el caso de transferencia D−7 confirmado `2517`, sin utilizar ningún dato VT4 al definir madres; una elección posterior de cifra `3` es otro problema.

## Verificación y reproducibilidad

Paquete de la conversación **`modelo-papa-recuperacion-vt3-d1-puentes-115-cortes-12oct2026.zip`**: **47 entradas**, **2.830.508 bytes**, ZIP íntegro, SHA256 **`18889e5d626a4a20fbb9cffa08b619e24a71dca2c396827404c4c2896b7440fc`**. Incluye todas las entradas históricas necesarias y scripts Python 3 estándar, PRE/POST separados, CSV de los 115 cortes, controles exactos y dos visores HTML autocontenidos que abarcan las 23 fechas y cinco turnos.

- PRE `RECUPERACION_VT3_PRE.json`: SHA256 **`f0927be53dc3154a2b278340c5373bdff8706ac80d0c370f51ed1a750187d0bc`**.
- POST `RECUPERACION_VT3_POST.json`: SHA256 **`377122ace573afffa1fd360cef0b5b76c09fb67d766faac10cec96732de1d307`**.
- `recuperar.py verify` volvió a enumerar las familias VT3 físicas de los **115 cortes** y auditó **cada ruta trasladada D−1** contra cabeza completa antigua (fecha/turno/jurisdicción, celdas previas y actuales), así como que cada puente une un tramo de **otra familia D−7** físicamente real, sin cruces, vacíos, saltos o reutilización.
- **Reproducción aislada:** extraído ZIP a directorio nuevo, retirados físicamente todos los productos POST y el archivo `RESULTADOS_POST.json`; regenerados PRE y visor PRE byte por byte. Tras incorporar POST, se regeneraron **siete archivos exactamente idénticos** (PRE, POST, CSV, controles, informe y dos HTML) y se comprobó su SHA256. El primer lanzador de prueba agotó su plazo durante las etapas finales, pero todas las salidas restantes fueron reejecutadas y verificadas por separado.
- Ambos visores HTML de **115 cortes** probados mediante **Chromium Playwright `set_content`**, con cambio de fecha, turno, familia `175/571` y `071/170`; tres fuentes/hojas SVG visibles, cero errores JS. PRE no muestra resultados objetivo; POST los añade en panel separado. `file://` está bloqueado por el navegador de prueba, no por fallo del HTML.

## Próxima decisión

**VT3 es el objetivo y la cuarta cifra debe esperar a que expliquemos mejor la selección de madres.** Mantener por separado D−7, D−1 y el puente geométrico como observadores. Examinar ahora los **8 casos físicos no recuperados** y los **11 casos D−7 recuperados pero fuera de Top10**. Sólo proponer cambios de política luego de un control de igual cobertura que no dependa de elegir números ganadores conocidos. No promover ningún ranking actual a producción ni alterar las hojas automáticas.
