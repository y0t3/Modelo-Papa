# Modelo Papá — VT3: raíces antiguas confirmadas (3 a 9 jornadas sorteadas atrás)

**12 de octubre de 2026. Ensayo completo y reproducible sobre las 23 jornadas históricas / 115 cortes ya guardados**; **no se esperaron nuevos sorteos ni se modificaron hoja automática, `main`, motor V7–V14, Top oficiales o APK**. Estos resultados son **retrospectivos y NO demuestran capacidad predictiva**.

## Pregunta que motivó la prueba

Después de D−7, D−1, D−2 y contactos parciales, **tres cortes** seguían sin VT3 objetivo respaldada por un recorrido anterior realmente confirmado: 23/09 Matutina, 02/10 Nocturna y 09/10 Nocturna. También quedaban dos con **mero contacto**, no con herencia confirmada. Buscamos exclusivamente ternas físicas antiguas confirmadas por **cabezas completas ya publicadas en esas fechas**, y permitimos trasladar rígidamente la figura **en la misma fuente** dentro de la grilla 6×2 de la hoja actual, sin saltos, vacíos, cruce de fuentes ni reutilización de celdas.

La búsqueda adicional usa **3.ª a 9.ª jornada con sorteos anterior**, contadas cronológicamente, no 3–9 días calendario. El D−7 original del Modelo Papá significa además **siete días calendario**, la hoja del mismo día de la semana, y se conserva aparte. El marcado de hojas sigue siendo **automático después de cabezas conocidas**. No se construyeron hijas VT4 ni se utilizó resultado objetivo para crear o ordenar una VT3.

## Rutas verificadas para los casos que faltaban

| Fecha/corte | VT3 posterior | Fecha de la huella confirmada | Cabeza completa antigua | Fuente física que se traslada | Puesto de política con raíces antiguas |
|---|---|---|---|---|---:|
| 23/09 Matutina | `064/460` | 18/09, **4.ª previa** | `2735` (Vespertina), terna `537/735` | Primera +11 | **55** |
| 02/10 Nocturna | `328/823` | 28/09, **4.ª previa** | `5137` (Nocturna), terna `137/731` | Matutina +11 | **86** |
| 02/10 Nocturna | `979` | 24/09, **7.ª previa** | `3418` (Nocturna), terna `418/814` | Vespertina +11 | **115** |
| 09/10 Nocturna | `354/453` | 06/10, **3.ª previa** | `9476` (Nocturna), terna `476/674` | Previa +11 | **35** |
| 23/09 Vespertina, antes con sólo contacto | `289/982` | 12/09, **9.ª previa** | `1582` (Matutina), terna `285/582` | Previa +11 | **159** |

**Todos los testigos son físicos y cada cabeza antigua efectivamente confirmó la terna original**, pero esta tabla de cinco ejemplos fue seleccionada **conociendo el resultado POST para diagnosticar antiguos fallos**. **Ninguna** de las familias entró en el Top10 al ordenar con raíces antiguas; ningún caso se puede presentar como acierto de pronóstico.

## El resultado de los 115 cortes revela saturación de cobertura

| Historia ampliada | Cortes con al menos una VT3 objetivo en la bolsa | Familias/corte promedio |
|---|---:|---:|
| Base D−7∪D−1∪puentes∪D−2, sin nuevas raíces | **75** | **110,12** |
| Hasta **3.ª** jornada anterior | **77** | **113,74** |
| Hasta **4.ª** | **79** | **116,37** |
| Hasta **7.ª** | **79** | **120,64** |
| Hasta **9.ª** | **80** | **123,22** |
| Todas las VT3 físicamente posibles | **80** | **132,81** |

Hay **35 cortes donde ninguna familia objetivo VT3 era físicamente posible** con fuentes conocidas antes del turno. En los 80 donde sí era posible, ampliar hasta nueve antecedentes logró cobertura de bolsa del **100% de esos 80**, pero pagando **123 familias por corte**, casi toda la geometría. Esto **no es una mejora de anticipación**. Antes, las pocas familias eran un problema de recuperación; ahora el límite dominante es elegir sólo unas pocas de una bolsa casi saturada.

| Criterio PRE /115 cortes | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| D−7 bifurcaciones congelado | **5** | **8** | **16** |
| D−1 figuras confirmadas congelado | **9** | **13** | **18** |
| Prioridad a raíces 3.ª–9.ª jornadas anteriores | **4** | **6** | **12** |
| Mantener anteriores primero y añadir raíces al final | **2** | **4** | **9** |

Top10 de raíces antiguas **rescata 6 cortes y pierde 12** respecto a D−1: diferencia **−6**, intervalo bootstrap descriptivo agrupado por **23 jornadas** **[−13,+1]**. Promedio del azar uniforme de igual bolsa y cupo: **10,57**. Seleccionar una familia mirando el POST y luego mostrar su ruta verdadera no es validación del ranking.

## Evidencia técnica

Laboratorio ZIP de conversación: **`modelo-papa-vt3-raices-confirmadas-antiguas-115-cortes-12oct2026.zip`**, **42 archivos, 2.059.712 bytes**, SHA256 **`515fd3bc68b2297453c760e44d3322310d2398ad5be98d2d445379237c046763`**. Incluye 30 JSON de fechas crudas (cuatro últimas cifras, igual que la app), fuente PRE del diagnóstico anterior, archivos separados POST, programa Python 3 estándar `analizar.py pre|post|verify`, `crear_atlas.py`, README, informe, CSV de **todos los 115 cortes**, manifiesto de hashes y **atlas visual HTML de cinco casos POST**.

- PRE `RAICES_PRE.json` SHA256 **`1c732de0ef42aad7ccb3e121f02a2c725153e64ffd7f214f7c9e6a089514d6ae`**.
- POST `RAICES_POST.json` SHA256 **`ed3afe34807734c029c89aabc9e2813755940fea7400a97ddc493f2bff2e3609`**.
- **31.908 testigos históricos de tres casilleros** auditados exhaustivamente: fecha antigua anterior, cabeza completa confirmada, fuente, lectura antigua y nueva, forma conservada, mismo desplazamiento en todos los casilleros y celdas vecinas distintas. Son testimonios correlacionados, no observaciones independientes.
- `RAICES_PRE.json` no contiene campos de cabezas objetivo; se creó sin archivo POST. El atlas `ATLAS_RAICES_POST.html` está **marcado explícitamente POST** porque sus cinco casos sí se eligieron tras revisar objetivos, nunca se incorporó al algoritmo PRE.
- **Reproducción real**: extracción de copia limpia con 30 JSON, Python original, SIN `RESULTADOS_POST.json`. Se obtuvieron hash PRE idéntico y comprobación geométrica `PRE_GEOMETRY_PASS 115 witnesses 31908`. Al incorporar resultados después se regeneraron POST, CSV y atlas HTML: **cuatro salidas byte por byte idénticas**.
- Atlas comprobado en **Chromium/Playwright** con `set_content`, cinco opciones y doce celdas por grilla antigua y actual, tres celdas resaltadas en cada hoja, cambio de caso, cero errores JS. La política de este entorno bloquea `file://` en Chromium; el HTML está disponible como archivo de conversación independiente.

## Decisión de desarrollo

**No elevar raíces antiguas a nueva bonificación, filtro ni prioridad Top.** Conservarlas en el observatorio como genealogía física adicional y pasar de la búsqueda ilimitada de raíces a buscar características morfológicas **discriminantes con cupos 3/5/10 de familias VT3**, siempre preservando los negativos, los datos POST separados y el sesgo de exploración retrospectiva. La **extensión a VT4 debe esperar** a que podamos explicar de manera independiente la selección inicial VT3.
