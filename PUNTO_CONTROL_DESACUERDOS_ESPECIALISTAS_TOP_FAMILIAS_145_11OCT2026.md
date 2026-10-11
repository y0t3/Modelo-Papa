# Punto de control — discrepancias V7/V8/V9, selección V13 y rescates Top por familias (11/10/2026)

**145 cortes históricos, 29 jornadas** (septiembre 100 cortes, octubre 45), tres modalidades VT2/VT3/VT4, **diez políticas PRE** congeladas antes del cotejo mediante código que no abre resultados. Ejercicio retrospectivo; **octubre no es un holdout virgen** porque el proyecto ya lo había explorado. Solo rama `auditoria-sorteo-10oct-2026`. **No se modificó `main`, el motor oficial, selector de producción ni APK.**

## Reglas innegociables

Top3 ⊂ Top5 ⊂ Top10 son **familias reversibles**, no números individuales; inversión confirmada es acierto y una sola plaza. Cada familia contiene **TODOS los caminos físicos reales** en una única pareja de turno, sin salto, hueco ni reuso. El estudio contempla solo familias físicas; las completaciones VT4 aleatorias sin cuarta celda siguen siendo **proyecciones numéricas** separadas y la VT3 madre nunca se confunde con la hija VT4. Nocturna anterior +11 es fuente de interés, nunca filtro obligatorio.

V7 = historia D−1/D−7; V8 = formas y distribución por fuentes; V9 = confirmaciones genuinas ya conocidas antes del turno y evolución; V13 = decisión individual por familia; V12/V14 = auditoría de sustituciones/abstención, no inventar candidatos ni votar un motor entero.

## Evidencia de desacuerdos en octubre

Se analizó la UNIÓN de Top10 V7, V8, V9 **y además** familias legítimas que V13 previo incluyó en su Top10 pese a estar fuera de los tres Top10 especialistas. Si aparece en dos motores, NO se trata como dos aciertos independientes.

| VT | Un solo especialista: positivas / propuestas | Dos | Tres | Añadidas por V13 fuera de los 3 Top10 |
|---|---:|---:|---:|---:|
| VT2 | **43/437** | 24/269 | 15/123 | 1 (0 aciertos) |
| VT3 | **11/1040** | 1/131 | 0/16 | 34 (0 aciertos) |
| VT4 | **1/1207** | 0/67 | 0/3 | 80 (0 aciertos) |

No exigir consenso obligatorio; un experto solitario puede conservar una familia confirmada. Consenso no equivale a evidencia independiente.

### Políticas comparadas a igual presupuesto

Bases V7/V8/V9 Top10, V13 anterior, consenso primero, primer puesto garantizado a cada experto, un rescate único de V7 o V8 o V9 sustituyendo lugar 10 de V13, y cuota fija **4 propuestas V8 + 3 V9 + 3 V7** con deduplicación y relleno V13. Diez políticas en total, todas listas anidadas, sin una familia duplicada.

**VT2 octubre (45 cortes; cantidad con ≥1 familia confirmada):**

| Política | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| V13 fusión anterior | **15** | **22** | **26** |
| Consenso primero | 15 | 22 | **30** |
| Al menos una de cada experto | **17** | 23 | 26 |
| Rescate del mejor V8 fuera de V13 | 15 | 22 | 27 |
| Rescate del mejor V9 fuera de V13 | 15 | 22 | 27 |
| Cupos 4 V8 + 3 V9 + 3 V7 | 14 | **24** | **31** |
| V8 solo | 14 | 21 | **33** |
| V9 solo | **18** | 22 | 32 |

**Desglose exacto de cupos frente a V13 Top10 en octubre:** **12 entradas acertadas recuperadas** y **4 acertadas desplazadas**, con otras sustituciones no confirmadas; el resultado neto por **cortes** aumenta de 26 a 31, no confundir familias y cortes. Para `CONSENSO_PRIMERO` fueron **9 inclusiones acertadas** versus **6 exclusiones acertadas**, y 26→30 cortes.

**Septiembre VT2 Top10, en 100 cortes:** V13 **64**, consenso **67**, cupos 4/3/3 **63**, V8 **64**, V9 **68**; ninguna domina por período y tamaño.

VT3 octubre: V13 3/45 Top10, consenso 2, cupos 4, V8 5, V9 5; VT4: V13 0, consenso 0, cupos 0, V8 1. Insuficiente para fijar árbitro.

### Control imprescindible por costo y oportunidades

Elegir **10 familias al azar dentro de esa MISMA bolsa PRE de especialistas** (condicionado en cada corte al número real de candidatas y aciertos) arroja estas esperanzas aritméticas de cortes con ≥1 coincidencia:

| Modalidad | Septiembre 100 cortes | Octubre 45 cortes |
|---|---:|---:|
| VT2 | **64,19** | **30,48** |
| VT3 | **10,26** | **4,45** |
| VT4 | **1,34** | **0,30** |

Así el mejor resultado VT2 de las políticas de cuotas en octubre, **31/45**, es casi **igual a 30,48 del control**. La mejora de arquitectura de preservar diversidad es útil para inspeccionar y no perder rutas, pero **no hay evidencia de ganancia predictiva nueva**. Muchas políticas se han diseñado sobre resultados históricos ya explorados; no seleccionar ganadora a posteriori.

### Caso de trazabilidad: 02/10 Primera

Santa Fé cabeza **1263** confirmó familia física **36/63**, dos testigos físicos de Nocturna anterior +11, con antecedentes D−1/D−7. V7 lugar 5, V8 lugar 10; V13 fusión la excluyó. `CONSENSO_PRIMERO` la rescató al Top10. En el mismo corte también confirmó **79/97**; examinar ambas para no narrar únicamente la ganancia. Un árbitro de cambios necesita un registro de **entra acertada / sale acertada / oportunidades**.

## Paquete reproducible y controles

Entregado `modelo-papa-discrepancias-v7-v8-v9-v13-familias-145-cortes.zip`, ZIP SHA256 `8b7a6adc8ed32cb5a7a2ece2be722f395d69f38eab46f4b7dd624a250c552dc8` (~4 MB). Directorio `discrepancias_especialistas_145`:
- `ANTES_DESACUERDOS_ESPECIALISTAS.html` — visor standalone PRE de fechas, turnos, modalidades, políticas, diez familias y **todos sus dibujos reales** sobre tablero +11; sin resultado objetivo.
- `DESPUES_COTEJO_DESACUERDOS.html` — visor POST separado, niveles top, aciertos, alternativas recuperadas y acertadas expulsadas.
- `1_congelar_desacuerdos_PRE.py` y `2_cotejar_desacuerdos_POST.py` separados, `3_generar_visores_e_informe.py`, `4_validar_y_empaquetar.py`, fuentes originales PRE, POST y tablero PRE independientes.
- `DESACUERDOS_PRE_145.json` SHA256 **`3bed354fcafc474e40df227d6198ec88d814d78f99a92b8955c9662009965575`**, `DESACUERDOS_POST_145.json` SHA256 **`2de4db0dc04728397178e7d39c34a8e9c3b791fe158c822f8734fee21c7fc952`**, `BALANCE_DESACUERDOS.csv`, `INFORME_DISCREPANCIAS_Y_ARBITRAJE.md`, capturas Chromium.
- Pruebas reales: se ocultó físicamente el POST, se reprodujo PRE **con idéntico SHA**; se verificaron **29.682 huellas de familias unión** por fuente, contacto, longitud, cifra y sentido reversible; 145 cortes × 3 modalidades × 10 listas sin repetidos y anidadas; páginas PRE/POST verificadas en Chromium sin errores JS; ZIP `testzip()` OK.
- Advertencia permanente: retirar POST durante una recomputación retrospectiva evita fuga directa por software, **no borra el hecho de que hipótesis y políticas fueron pensadas conociendo sorteos pasados**.

**Decisión:** no promover cuota 4/3/3, consenso obligatorio ni otros scores/gates al motor oficial. Conservar **una ficha por familia con todos sus trazos y antecedentes, más auditoría de desacuerdos, aciertos rescatados y aciertos desplazados** como base de la próxima evaluación.
