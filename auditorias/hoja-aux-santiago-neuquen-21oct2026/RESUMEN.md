# Segunda hoja de Lalo · Santiago y Neuquén — CORREGIDA

**Fecha de corrección:** 21/10/2026 · **rama aislada:** \`lab/hoja-auxiliar-santiago-neuquen-21oct2026\`. No se alteraron \`main\`, el MV1 congelado ni el APK publicado.

> **Corrección crítica realizada por el usuario:** El martes 20/10/2026, la pantalla de **Vivitusuerte** presenta **Santiago Previa 8067, Primera 6142 y Matutino 9634**; Neuquén Previa 0469, Primera 0245 y Matutino 0210. Mi hipótesis anterior —atribuir 6142 a Matutino, 9634 a Vespertino y dejar Santiago Primera en blanco— era **errónea**. Se corrigió el adaptador, los tests y se recalculó toda la auditoría de septiembre–octubre. **Todas las cifras de los informes anteriores calculadas con la Primera de Santiago vacía quedan ANULADAS** y son reemplazadas por este informe.

## Reglas físicas de la hoja auxiliar

Hoja de **2 filas × 12 posiciones**, grupos de cuatro cifras por turno:

| Jurisdicción | Previa | Primera | Matutino |
|---|---|---|---|
| Santiago del Estero | **8067** | **6142** | **9634** |
| Neuquén | **0469** | **0245** | **0210** |

- Valores originales de las cabezas de Santiago y Neuquén, **sin +11**.
- Se permite contacto entre columnas o franjas/turnos: recorridos horizontales, verticales y diagonales, **incluidas fronteras Previa–Primera y Primera–Matutino**.
- No saltos, huecos ni celdas reutilizadas. Los turnos no publicados quedan ocultos para PRE.
- Antes de Previa: **0 celdas**; antes de Primera: **8**; antes de Matutino: **16**; antes de Vespertino/Nocturno: **24** celdas si ambos territorios tienen todas sus cabezas.
- La hoja +11 mantiene su propia regla **de no cruzar columnas**.
- Los números que deben formarse en la hoja auxiliar son **las terminaciones de las cabezas que efectivamente salieron en Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos y Montevideo**, no las de Santiago/Neuquén. Los testigos se marcan POST y todos sus recorridos se registran. En consultas PRE se estudian familias VT2/VT3 reversible y VT4 exacto, nunca cabezas futuras como input.

## Correspondencia RAW del proveedor Vivitusuerte

**Ambos territorios siguen la misma correspondencia de la API que usa la app:**

| Fuente API | Turno de la hoja auxiliar |
|---|---|
| \`datos['10'].momento_5\` / \`datos['11'].momento_5\` | Previa |
| \`datos['10'].momento_1\` / \`datos['11'].momento_1\` | Primera |
| \`datos['10'].momento_2\` / \`datos['11'].momento_2\` | Matutino |

ID 10 = Santiago; ID 11 = Neuquén. Si en alguna fecha concreta el proveedor reporta \`----\`, respetarlo como hueco real. **Nunca introducir un hueco basándose en una web alternativa que llame de otra manera a ese turno.**

La regresión \`scripts/lab-aux-mapeo-fuente-test.ts\` fija los seis valores verificados por el usuario y comprueba simultáneamente los cinco cortes PRE y que los vacíos reales no se rellenen. \`src/auxSantiagoSource.ts\` acepta los mismos ID y turnos, exporta \`parseAuxiliaryHeads\` para pruebas sin red y \`fetchAuxiliaryHeads\` para la API real.

## Backtest PRE reconstruido con datos corregidos (01/09 a 20/10/2026)

Datos de **43 jornadas**, **215 cortes**, **1.152 cabezas** observadas de las seis jurisdicciones. Las entradas del turno objetivo se ocultan; los resultados solo se cotejan después. Son reconstrucciones retrospectivas, no pronósticos sellados.

### Cobertura física

| Modalidad | En +11 | En auxiliar | En ambas (solapamiento) | En alguna (unión) | Aporte exclusivo auxiliar |
|---|---:|---:|---:|---:|---:|
| VT2 exacto | **703** | 398 | 284 | **817** | **114** |
| VT3 exacto | **294** | **154** | **44** | **404** | **110** |
| VT4 exacto | **93** | **42** | **3** | **132** | **39** |

*Los solapamientos VT2 y VT4 se deducen mediante inclusión-exclusión de los contadores verificados. VT3 coincide además con el conteo explícito por familias de la auditoría.*

Distribución de las **1.152 cabezas VT3**:

| Formación | Septiembre | Octubre (hasta día 20) | Total |
|---|---:|---:|---:|
| En ambas hojas | 32 | 12 | **44** |
| Solo +11 | 152 | 98 | **250** |
| Solo Santiago–Neuquén | 65 | 45 | **110** |
| No forman VT3 en ninguna | 449 | 299 | **748** |
| Total | 698 | 454 | **1.152** |

VT3 en +11: 294/1152 = **25,52%**; en cualquiera de las dos: 404/1152 = **35,07%**. La segunda hoja aporta **110 cabezas** (9,55 puntos porcentuales del total) de **cobertura física POST**. No son aciertos predictivos Top.

Cruces válidos: **41 cabezas VT3 exactas** presentaron al menos un recorrido auxiliar que cruza entre turnos; **15 cabezas VT4 exactas** tuvieron cruce. Un cruce con tres recorridos no son tres aciertos distintos.

### Corte 20/10 con los seis datos correctos

| Objetivo | Celdas auxiliares ya conocidas | Familias físicas VT3 del auxiliar | Familias con algún cruce entre turnos |
|---|---:|---:|---:|
| Previa | 0 | 0 | 0 |
| Primera | 8 | 28 | 0 |
| Matutino | **16** | **73** | 22 |
| Vespertino | **24** | **122** | 43 |
| Nocturno | **24** | **122** | 43 |

Las **27 cabezas publicadas** del 20/10 produjeron **7 VT3 en +11** y **3 VT3 solo auxiliares** (10 con al menos un recorrido). Esas tres recuperadas exclusivamente por la auxiliar fueron:

1. **Vespertina Entre Ríos, 4066**: VT3 exacto \`066\` auxiliar; no formable en +11. También se forma VT4 exacto \`4066\` en la auxiliar.
2. **Nocturna Ciudad, 2697**: VT3 exacto \`697\` auxiliar; no formable en +11. Tiene un recorrido cruzando Primera→Previa además de dos dentro de Previa, y VT4 exacto \`2697\` auxiliar.
3. **Nocturna Provincia, 7310**: VT3 exacto \`310\` auxiliar; no formable en +11. Recorrido dentro de Matutino, ya disponible antes de Nocturna.

**Santa Fe Primera, cabeza 8568** sigue **sin** refuerzo auxiliar PRE para ese corte: solo se conocían las cabezas de Previa; no cargar Primera ni Matutino antes de tiempo.

### ¿Hay evidencia para mejorar los Tops de Lalo?

El registro de los **215 cortes PRE** de Top6 oficial VT3 contiene **1.284 apariciones** de familias propuestas por Lalo. De esas apariciones, **156** podían formarse también en Santiago–Neuquén, con **1 cabeza ganadora**; entre las restantes **1.128** hubo **16 cabezas ganadoras**.

No se observó mejora clara en selección predictiva por priorizar la mera presencia física en el auxiliar. La expansión de 294 a 404 **no autoriza aumentar aciertos declarados**: son cabezas cuyo número salió y luego se pudo formar físicamente.

### Alcance y próximos pasos

La segunda hoja completa está construida y se muestra en la pestaña **AUX** de la rama experimental de la app. Permite navegar por turno, modos VT2/VT3/VT4, consultar familia, marcar cabezas por sufijos exactos y resaltar recorridos. No hubo APK nueva ni cambio de lógica predictiva MV1.

Falta estudiar el otro componente del procedimiento manuscrito: la **memoria de recorridos auxiliares que ya explicaron cabezas ganadoras** y su comparación con las configuraciones de la hoja +11, sin dar votos duplicados por varias rutas de la misma cabeza.

**Archivos:**

- Geometría: \`src/auxSantiagoNeuquen.ts\`
- Normalización del proveedor corregida: \`src/auxSantiagoSource.ts\`
- Control regresivo: \`scripts/lab-aux-mapeo-fuente-test.ts\`
- Estudio reproducible: \`scripts/lab-aux-cotejo-2026.ts\`
- Interfaz de prueba: \`src/ui/AuxiliarySheetPanel.tsx\`
- Ejecución histórica previa a añadir la regresión: https://github.com/y0t3/Modelo-Papa/actions/runs/39644731161
- Ejecución con nuevo control del proveedor: https://github.com/y0t3/Modelo-Papa/actions/runs/39644843239

**Estado:** fuentes corregidas conforme Vivitusuerte verificado por usuario; MV1 conservado intacto. Ninguna mejora predictiva validada todavía.
