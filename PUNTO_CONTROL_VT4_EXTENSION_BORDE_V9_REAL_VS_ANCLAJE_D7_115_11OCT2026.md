# Modelo Papá: confirmación real V9 del borde VT2 de la extensión VT3→VT4

**11/10/2026, auditoría exploratoria ejecutada sobre 115 cortes históricos (23 jornadas, 70 de septiembre y 45 de octubre). No se espera información futura ni se cambia el motor oficial, la hoja automática, rankings V7–V14 ni APK.**

## Experimento, sin cambiar las madres ni el presupuesto

Se usa el PRE anteriormente congelado `PRE_LOCI.json`: 1.104 exposiciones de **las mismas madres VT3 ya elegidas y en el mismo orden** por `MULTIRRUTA_MADRES_ROCE`. Se mantienen dos hijas hermanas orientadas por madre+cifra y sus inversas respectivas, sin crear falsas madres nuevas.

Se aísla la cuarta cifra: la base es el orden D−7 de cifra anclada específicamente a una huella VT3 heredada. La variante da prioridad **solo** a una cifra cuyo borde de **dos casillas físicas añadidas a la madre** haya sido confirmado por la terminación VT2 de una cabeza **real de turno anterior**, y cuya fuente existiera ANTES de tal turno. Se considera la cantidad de turnos previos con esa confirmación y el número de bordes VT2 distintos; empates heredan el orden de D−7. No basta con que exista el borde; no se utilizan resultados del turno objetivo ni posteriores para el PRE, ni se modifica la posición de ninguna madre.

## Resultados (cortes con ≥1 cabeza cubierta; 115)

| Presupuesto | Roce general | D−7 anclaje | D−7 + V9 borde real |
|---|---:|---:|---:|
| Top3 madres × 1 cifra | 0 | 0 | **0** |
| Top5 madres × 1 cifra | 1 | 1 | **1** |
| Top10 madres × 1 cifra | 2 | 1 | **1** |
| Top10 madres × 2 cifras | 2 | 3 | **3** |
| Top10 madres × 3 cifras | 4 | 5 | **5** |

**Ningún rescate ni pérdida respecto al anclaje D−7** con los mismos cupos; delta pareado 0 cortes. Control con dígitos uniformes compartidos por madre/jornada y misma cantidad de madres: Top10×1, media **1,874** frente a **1** de V9; Top10×3, media **5,645** frente a **5** de V9. Controles retrospectivos exploratorios, no ventaja estadística ni prueba de predicción.

**Cambios reales de decisión:**
- 1.104 madres Top10 examinadas; **493** tenían alguna cifra con borde VT2 genuinamente confirmado en turno anterior.
- De las 11.040 opciones madre+dígito, **731** tenían señal V9 del borde. **252 de 1.104** madres cambiaron su primera cifra y **78/115** cortes contenían al menos un cambio, sin nuevo acierto.
- 8.792 incidencias geométricas de borde de extensión, 1.257 testimonios de confirmación borde×turno anterior. No representan observaciones independientes.
- Entre 731 grupos madre+dígito con señal previa, **uno** coincidió con una cabeza posterior; entre los 10.309 sin señal, **19** coincidieron. Descriptivo sin ajustes por otras características, sin beneficio evidente.
- **19/09 Nocturno**, madre `109/901`, cifra `4`, lectura `4109`, borde `49/94` confirmado en Vespertino. **La cifra 4 ya estaba primera por anclaje D−7**, por lo que V9 acompaña una decisión previa, no produce un rescate.

## Auditoría y material reproducible

Archivos origen `PRE_LOCI.json` y `VT2_HISTORIA_PRE.json` separados de `RESULTADOS_POST.json`. Programa `analizar.py pre` no accede a POST; `analizar.py post` sí. El **PRE nuevo SHA256** es `2d23d1812903aa0481816ea7634d5b51e8586bd6cf26b2664e74e77cce77e6a4`. Se reprodujo exactamente sin ningún archivo POST en una carpeta nueva. Auditadas todas las rutas: cuatro celdas sin reuso, mismas fuentes, contiguas, valores físicos reales y únicamente confirmaciones anteriores al objetivo.

ZIP completo disponible como adjunto de la conversación: `modelo-papa-vt4-v9-borde-fisico-d7-115-cortes-11oct2026.zip`, **1.076.350 bytes**, SHA256 **`375fca7692861fdcb0dde1a31a80673eea1c8ed4457c8ede063965ba838da35f`**, 13 archivos. Incluye los datos origen necesarios, scripts Python 3 sin dependencias, archivo PRE congelado, cotejo POST, balance de los 115 casos, informe y visores HTML `VISOR_V9_BORDE_PRE.html`/`VISOR_V9_BORDE_POST.html`. ZIP validado `testzip` y extraído en carpeta nueva: **cinco salidas** reproducidas byte a byte. Dos visores verificados con Chromium, navegación al 05/10 Matutino, sin errores JS; PRE no contiene resultados objetivo.

## Decisión

El borde temporal V9 debe quedar como **observación visual**, sin bonificación o filtro duro: cambió muchas elecciones sin aportar aciertos en la prueba. Para seguir avanzando con las hojas existentes, siguiente hipótesis sería caracterizar el **cambio físico y de ubicación de la misma madre VT3** entre D−7, D−1 y la hoja actual, distinguiendo causas geométricas de confirmaciones temporales y manteniendo negativos. No repetir tanteos de puntajes ni esperar datos futuros para el desarrollo.
