# Observatorio V8 + V9 + VT0 ampliado a cinco turnos y VT2/VT3/VT4

**Fecha:** 11/10/2026. Rama de laboratorio `auditoria-sorteo-10oct-2026` únicamente. Se desarrolló un observatorio HTML autocontenido con 29 días (08/09–10/10/2026), **145 cortes** previos al turno objetivo. Paquete entregado al usuario en la conversación: **observatorio-integrado-v8-v9-vt0-145-cortes-cinco-turnos.zip** (incluye inputs originales, script Python reproducible, 145 cortes PRE, POST exhaustivos, visor, informe y tests).

## Reglas de separación

- Fuente de datos: respuestas originales fechadas de API del backtest V8 (ZIP auditado, run https://github.com/y0t3/Modelo-Papa/actions/runs/38107717643) y expediente Nocturna Oct10 (capturas PRE originales). D−1: sorteo anterior efectivo, D−7: exactamente una semana. No inventar memoria en ausencia de días reconstruibles.
- Corte PRE: solo +11 Nocturna previa más fuentes conocidas de turnos anteriores, y cabezas completas antiguas D−1 / D−7. **Ninguna cabeza del turno objetivo** aparece en `CORTES_PRE_SIN_CABEZAS_OBJETIVO.json`, excepto coincidencias incidentales históricas. Marcas anteriores del mismo día sí están permitidas. Cotejo POST en archivo aparte.
- Celdas contiguas sin saltos ni repetición, recorridos dentro del MISMO par de turno (VT2/3/4), 2–4 posiciones; huella canónica reversible con cabeza completa y dirección original conservada. Los puentes V8 cruzados son rojos explícitamente **inválidos** y nunca VT.
- Ranking V8 original se muestra exclusivamente como **explicación histórica del corte ANTES Primera**, sin adaptación ni votos en el modelo visual. En el resto del día se exponen únicamente las huellas y bitácoras VT0/V9. No hay pesos predictivos.

## Resumen exhaustivo: figuras físicas heredadas D−1∪D−7 por corte

| Modalidad | Heredadas en 145 cortes (exposiciones, no predicciones) | Compatibles posteriores | Todas las físicamente posibles en 145 cortes | Compatibles en universo |
|---|---:|---:|---:|---:|
| VT2 | **4.629** | **460** (9,94 %) | **10.100** | **1.015** (10,05 %) |
| VT3 | **2.490** | **26** (1,04 %) | **35.180** | **395** (1,12 %) |
| VT4 | **720** | **0** | **100.124** | **121** (0,12 %) |

Estos son caminos reexpuestos durante turnos sucesivos, no 7.839 predicciones ni 145 experimentos independientes. Heredar huellas **no muestra enriquecimiento obvio** contra el universo geométrico; no extrapolar probabilidades ni construir selector con ello.

Cobertura de cabezas posteriores: **53/145 cortes con 6/6**, **92/145 con 5/6**. Sobre **7.839** exposiciones heredadas, hay **486 confirmadas**, **3.342 negativas con cobertura completa** y **4.011 indeterminadas**. No reclasificar estas últimas como fallos.

## Confirmación de octubre 10 contra expediente anterior

Se verificaron por cálculo local los JSON auténticos:
- PRE Previa 09:04 SHA256 `19d3357c82e59dbf5050ed7941f160b7e4c04a1a0875fb5e25de9147a245ea4b`.
- PRE Primera 10:53 SHA256 `99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9`.

Las cinco etapas reproducen exactamente el número de huellas heredadas **[17,35,62,72,75]** y las coincidencias físicas **[1,2,2,2,8]**. Además, identidades de huellas D−1 y D−7 del 10/10 contrastadas una a una con el cierre publicado antes. Caso V8 `393`: dos rutas dirigidas cruzadas, **cero legales**. Caso `654`: dos rutas dirigidas legales, con una huella D−1 antigua `4843`.

## Entrega y pruebas

Archivos del ZIP:
`index.html` (visor único autosuficiente), `INFORME_COMPLETO.md`, `LEEME_PRIMERO.md`, `CORTES_PRE_SIN_CABEZAS_OBJETIVO.json`, `RESULTADOS_POST_TODOS_NEGATIVOS.json`, `V8_RANKINGS_EXPLICATIVOS.json`, `CONTROL_PROCEDENCIA_Y_PRUEBAS.json`, `PRUEBAS_EJECUTADAS.json`, `construir_observatorio_5turnos.py`, `test_observatorio.py`, `plantilla.html`, `vista_654_5turnos.png` e `insumos/` (tres archivos fuente íntegros). ZIP verificado sin errores.

Pruebas exhaustivas en los 145 cortes: adyacencia, fuente única, no repetir celdas, lectura correcta, antecedente estrictamente anterior, no filtrar por cabeza futura, marcas de turnos previos únicamente, negativas solo con cobertura total, dos digests auténticos, coincidencias de Oct10 iguales a auditoría anterior. **Navegador Chromium** probó cambio de fecha/turno, búsqueda de `393` con puente cruzado, `654` con dos rutas legítimas, selección de cabeza D−1 `4843`, revelar/ocultar, Nocturna 75 figuras y navegación VT2/3/4, sin errores de JavaScript.

## Decisión

**Rescatar al observatorio solamente**: firmas físicas reversibles VT0, bitácoras V9 (existencia ≠ confirmación) y explicación V8 (cruces prohibidos separados). Este análisis no demuestra capacidad de selección predictiva. No modificar `main`, motor, selector ni APK. Próximo paso lógico: registro de decisiones reales pre-sorteo y evaluación prospectiva, con abstenciones y todos los negativos.
