# Auditoría VT3 AUX — ¿faltan raíces o prioridad? (31/10/2026)

**Rama de laboratorio:** `lab/aux-vt3-embudo-sin-raiz-31oct2026`. Sin cambios en MV1, el motor auxiliar oficial, main ni APK.

## Pregunta

El viernes 30/10 había seis apariciones de cabezas VT3 físicamente formables en ambas hojas auxiliares: **4 sin ranking original**, **2 fuera del Top20** (puestos #38 y #80). ¿Es un fallo de selección repetible o simplemente hay muchos candidatos físicos fuera del ranking? ¿Reservar uno o tres de los diez lugares para familias de esas clases mejora frente a controles aleatorios con los mismos cupos?

**Importante:** las hipótesis se desarrollaron **después de conocer** el 30/10 y de mirar junio–octubre. El 30/10 no es una validación ciega de la hipótesis nueva, aunque se ejecuta en un proceso separado, sin usar POST para generar candidatos.

## Protocolo

- Cinco turnos por jornada y cinco jurisdicciones de cabezas (Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos), sin Montevideo. 119 jornadas completas históricas: 77 de junio–agosto, 42 de septiembre–octubre 12–29. Dos fechas con sorteos incompletos descartadas (20/6 y 9/7). **PRE reconstruido por turno**.
- AUX Ayer: Santiago/Neuquén de la jornada anterior, 24 cifras conocidas al comenzar el día. AUX Hoy: franjas progresivamente disponibles por turno. Caminos físicos VT3 de tres celdas adyacentes sin salto, cruces permitidos **solo dentro de la misma hoja**; los inversos cuentan como una misma familia.
- Ranking original: raíces ganadoras D−1 y D−7 ya deduplicadas por evento, no por ruta. Formas Primero: sitios físicos priorizados según recorridos ganadores de las seis jornadas previas; selección de sitios **antes de leer los dígitos actuales**.
- Cada familia físicamente formable del turno se clasifica **exclusivamente**: `top10`, `11–20`, `21+` (ranking original fuera de veinte), `sin_puesto` (ninguna raíz D−1/D−7). Si la cabeza POST no puede formarse, se informa como `no_formable`.
- **Hipótesis fijas PRE:** mantener los primeros 9 o 7 candidatos históricos e incorporar 1 o 3 familias de (A) `sin_puesto`, (B) `21+`, (C) ambas (`fuera20`). El orden de admisión lo determina **Formas Primero**, usando sus primeras 100 familias físicas únicas; no se incorporan familias sin recorrido. Si no hay disponibles, se conservan lugares originales.
- **Cinco controles neutrales** de cada variante, misma cantidad de familias nuevas y **exactamente el mismo conjunto fuente** al que se le permite ingresar, pero elegidas mediante hash determinista sin POST. Se conservan siempre diez plazas cuando el Top10 original tenía diez (menos en turnos con ranking corto).
- Para cuantificar si los grupos grandes ofrecen más oportunidades se cuentan **exposiciones de familias por turno** y **aciertos de cabezas por turno**, separadamente. No son probabilidades predictivas calibradas ni apuestas independientes.
- Pruebas unitarias: misma cantidad de cupos, no duplicación, clasificación mutuamente exclusiva, ninguna familia que no se pueda formar, conservación de los primeros 9 o 7, selección neutral pareada; regresión del motor Lalo.

## Embudo físico real, 119 jornadas

| Hoja/etapa | Top10 | 11–20 | 21+ | Sin puesto | Todas formables |
|---|---:|---:|---:|---:|---:|
| AUX Ayer, Previa–Matutino | 38 | 39 | 271 | 80 | 428 |
| AUX Ayer, Vespertina–Nocturna | 21 | 25 | 171 | 53 | 270 |
| AUX Hoy, Previa–Matutino | 24 | 21 | 27 | 66 | 138 |
| AUX Hoy, Vespertina–Nocturna | 21 | 27 | 99 | 98 | 245 |

**Cifras:** apariciones de cabezas reales por turno cuyo sufijo VT3 es físicamente formable en la hoja correspondiente; no 983 ganancias independientes. No confundir cantidad de casos fuera de ranking con ventaja de selección.

### Normalización: cantidad de cabezas por candidata expuesta

En **AUX Hoy desde Vespertina**, el gran conjunto de formaciones fuera del Top20 produce la mayoría de coincidencias, pero son cantidades enormes de familias posibles.

| Grupo | Exposiciones de familias (por corte) | Cabezas VT3 coincidentes | Proporción descriptiva |
|---|---:|---:|---:|
| Top10 | 2.360 | 21 | **0,890 %** |
| 11–20 | 2.294 | 27 | **1,177 %** |
| 21+ | 12.434 | 99 | **0,796 %** |
| Sin puesto | 11.398 | 98 | **0,860 %** |

**Conclusión sólida del diagnóstico:** las familias sin puesto no muestran una tasa bruta de coincidencia por candidatura mayor que el Top10. No hay evidencia para incorporar indiscriminadamente más familias sin raíz; los resultados fuera de ranking predominan **porque hay muchísimas más candidatas**. Las tasas son descriptivas, no corregidas por correlación entre cortes/fechas.

AUX Ayer con hoja completa confirma el mismo orden de magnitud: Top10 21/2.340 = 0,897 %, 11–20 25/2.340 = 1,068 %, 21+ 171/17.552 = 0,974 %, sin puesto 53/5.730 = 0,925 %. Ningún grupo alcanza un riesgo relativo marcadamente distinto con esta evidencia.

## Ensayo de cupos fijos — igual cantidad total de familias

| Hoja/etapa | Top10 original | Top10 con 3 del puesto 21+ | Control neutral equivalente (media de 5) | Top10 con 3 sin puesto |
|---|---:|---:|---:|---:|
| AUX Ayer, temprana | 38 | **41** | 38,8 | 36 |
| AUX Ayer, completa | 21 | **23** | 20,8 | **24** |
| AUX Hoy, temprana | 24 | **28** | 24,2 | 25 |
| AUX Hoy, completa | 21 | **27** | 25,0 | 21 |
| **Total de hojas/etapas** | **104** | **119** | **108,8** | **106** |

La columna del control neutral es la misma hipótesis de tres plazas en puestos 21+, pero con elección aleatoria pareada del **mismo** conjunto en cada turno. Frente al Top10, la variante `21+ / 3 cupos` suma +15 coincidencias agregadas en el período; frente a los controles neutrales, +10,2. Distribución de +15: AUX Ayer temprano +3, Ayer completo +2, Hoy temprano +4, Hoy completo +6.

**Incertidumbre:** remuestreo descriptivo de **119 jornadas enteras, 16.000 repeticiones**, considerando juntas las dos hojas y sus turnos. Para `21+ / 3 cupos` frente a Top10, diferencia observada **+15**, intervalo bootstrap orientativo **−2 a +32**. Para AUX Hoy completa, +6, intervalo descriptivo **+1 a +13** en un remuestreo por días, **no corregido por las seis variantes ensayadas ni por selección retrospectiva**. El resultado no valida superioridad predictiva ni justifica producción.

### Cambio por período: AUX Hoy hoja completa

| Período | Original | 3 candidatas de 21+ | Control neutral |
|---|---:|---:|---:|
| Junio–agosto | 14 | **19** | 16,4 |
| Septiembre–octubre | 7 | **8** | 8,6 |
| **Total** | 21 | **27** | 25,0 |

En el segundo período la variante supera al original solo por uno, y queda **por debajo de su control neutral**.

En contraste, elegir 3 candidatas `sin_puesto` no mejora AUX Hoy completa (21 contra 21 originales, neutral 24), y en AUX Ayer temprano empeora (36 contra 38). No rescata satisfactoriamente el grupo sin raíces.

## Cotejo separado del 30/10 (conocido ANTES de diseñar el híbrido)

El viernes 30/10 aportó seis casos formables:

| Turno/hoja | Cabeza | Familia VT3 | Ranking original | Fuente Formas Primero |
|---|---|---|---|---|
| Primera / AUX Ayer | **Córdoba 5514** | **415/514** | **#80** | **#3** |
| Primera / AUX Hoy | Provincia 6364 | 364/463 | Sin puesto | No Top10 |
| Vespertina / AUX Hoy | Provincia 9810 | 018/810 | #38 | No Top10 |
| Vespertina / AUX Hoy | Santa Fe 5781 | 187/781 | Sin puesto | No Top10 |
| Vespertina / AUX Hoy | Entre Ríos 3276 | 276/672 | Sin puesto | No Top10 |
| Nocturna / AUX Hoy | Santa Fe 8734 | 437/734 | Sin puesto | No Top10 |

Los híbridos `21+ / 1 cupo`, `21+ / 3 cupos` y `fuera20 / 1 o 3 cupos` rescatan **solo Córdoba 5514 en AUX Ayer Primera**, porque la familia #80 aparece primero entre las elegibles de Formas Primero. **Ninguno** de los híbridos rescata las otras cinco apariciones; los híbridos de `sin_puesto` no logran coincidencias ese viernes. El Top10 original obtuvo cero en los diez cortes, Formas Primero consiguió una.

**Advertencia metodológica:** la jornada 30/10 no es un verdadero out-of-sample de la hipótesis `21+ / 3 cupos`: se conocía Córdoba 5514 y las cuatro familias sin raíces antes de formularla. No asignar valor confirmatorio a ese rescate. El selector Formas Primero, que ya existía antes de conocer el 30/10, sí puede seguirse como experiencia previa con un único acierto adicional.

## Decisión

- **No cambiar el motor ni ampliar apuestas.** El diagnóstico de exposición desinfla la aparente ventaja del gran volumen de familias sin ranking.
- **Hipótesis prioritaria para un contraste verdaderamente nuevo:** reservar hasta tres plazas (de diez) a familias con ranking 21+ elegidas por Formas Primero, con controles neutrales y el Top10 histórico. **Congelar ahora sin cambiar pesos o grupos**; someter a jornadas PRE selladas antes de cada sorteo.
- Mantener por separado un conteo de familias **formables sin ranking** para explicar pérdidas de cobertura, pero no asignarles automáticamente una prioridad superior.
- Conservar los números **únicamente como evidencias de backtest**, no como probabilidades futuras ni recomendaciones de apuestas.

## Archivos y ejecución

- `src/labAuxEmbudoVT3.ts`: admisión física, fuente clasificada y controles aleatorios pareados de igual cupo.
- `scripts/test-aux-embudo-vt3.ts`: invariantes de selección y mismo presupuesto.
- `scripts/lab-aux-embudo-vt3.ts`: análisis de cobertura por clase, 1/3 plazas, exportación de evidencia por turno y candidata.
- `.github/workflows/lab-aux-vt3-embudo.yml`: tres trabajos, dos períodos históricos y 30/10 separado.
- [GitHub Actions, corrida validada](https://github.com/y0t3/Modelo-Papa/actions/runs/41168207541): tres jobs **success**, JSON de cada período en los artefactos del workflow.
