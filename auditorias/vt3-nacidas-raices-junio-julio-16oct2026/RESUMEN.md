# Control temporal de familias nacidas con raíces D−7 — junio y julio de 2026

**Investigación realizada el 16/10/2026 · rama de laboratorio únicamente.** La APK Modelo Lalo 0.3.5, motor oficial `src/motorLalo.ts`, Geometría completa `src/vt3Shadow.ts` y MV1 no fueron editados.

## Qué se congeló antes de ejecutar este bloque
Se reutilizaron **sin modificar las reglas** escritas en `scripts/lab-geo-newborn-weekly-roots.ts` y `scripts/lab-geo-normalization.ts` después de la prueba anterior sobre 15/08–15/10.

La huella semanal es una cabeza anterior *real* que produjo un camino VT3 válido de tres celdas, compatible por traslado rígido de la figura dentro de la **misma columna** del camino actual. Puede tratarse de dígitos diferentes, NO de una reiteración de la familia numérica anterior. Cabezas históricas duplicadas por muchos caminos se reducen a un evento.

Las cabezas de cada turno objetivo se leen **después** de construir su PRE; en ningún caso intervienen para elegir candidatas. El experimento es retrospectivo y junio-julio también había sido estudiado previamente por el proyecto; por eso no se lo presenta como validación prospectiva independiente.

## Base efectiva y exclusiones

- Período solicitado: **01/06–31/07/2026**.
- **49 jornadas completas aptas**, **245 cortes PRE**, **1.225 cabezas** de cinco jurisdicciones, **313** cabezas con familia VT3 físicamente trazable (25,6%).
- Se omitieron **10 cortes** de dos jornadas que no disponían de suficientes cifras en la fuente **Nocturna anterior** para formular un Top3 de Nocturna sin inventar dígitos: **22/06 y 10/07**, los cinco turnos de cada fecha. No se imputaron cifras ni resultados faltantes.
- En esos cortes pueden existir candidatos en columnas posteriores, pero no son comparables con una política de tres puestos de Nocturna anterior. Las exclusiones se registran por fecha y causa; la muestra validada y todas sus tasas se calculan **sin incluirlos**.
- Montevideo participa solo como fuente de la hoja cuando correspondía, y no se cuenta entre las cinco cabezas argentinas objetivo.

## Discriminación de familias recién nacidas

Aparecieron **18.840 exposiciones de familia VT3 nueva por corte** (familia × turno, no únicas de todo el período) y **186 apariciones de cabezas ganadoras** con familia nacida después de Nocturna anterior.

| Respaldo histórico | Exposiciones de familia | Cabezas ganadoras |
|---|---:|---:|
| D−7, misma figura y fuente actual | 3.170 | 36 |
| D−7, específicamente fuente de nacimiento | 2.971 | 34 |
| D−1, misma figura y alguna fuente actual | 3.246 | 31 |
| Sin huella D−7 | 15.670 | 150 |

Control neutral estratificado dentro de **mismo corte, primera columna y banda de cantidad de rutas**:

| Tipo de huella | Observado | Esperanza neutral descriptiva | Diferencia |
|---|---:|---:|---:|
| D−7 cualquier fuente | 36 | 33,21 | +2,79 |
| D−7 fuente de nacimiento | 34 | 31,48 | +2,52 |
| D−1 cualquier fuente | 31 | 34,47 | −3,47 |

**Por mes:**
- Junio: D−7 **19** vs **19,67** esperadas (−0,67); D−1 **20** vs **19,68** (+0,32).
- Julio: D−7 **17** vs **13,54** (+3,46); D−1 **11** vs **14,79** (−3,79).

El signo de la señal cambia según mes y tipo de referencia. No hay ventaja general confiable de D−7 ni D−1 por el hecho de que exista un recorrido de igual forma y fuente.

## Top3 comparado (máximo 3 familias VT3 por turno)

La base normalizada conserva tres familias de Nocturna anterior. Las variantes mixtas mantienen las dos primeras y, según un criterio fijo, prueban una familia de otra fuente o recién nacida. Ninguna usa resultados del propio turno al elegir.

| Regla | Junio (120 cortes) | Julio (125 cortes) | Total |
|---|---:|---:|---:|
| Tres familias de Nocturna, normalizadas | 4 | 3 | **7** |
| Normalización con columnas disponibles sin restricción de fuente | 5 | 4 | **9** |
| Dos de Nocturna + una de otra columna | 4 | 4 | **8** |
| Dos de Nocturna + mejor familia realmente nueva | 4 | 3 | **7** |
| Dos de Nocturna + familia nueva con huella D−7 | 3 | 3 | **6** |
| Dos de Nocturna + familia nueva con huella D−1 | 3 | 3 | **6** |
| Dos de Nocturna + nueva, ordenando por **número de raíces D−7** | 4 | 4 | **8** |

En particular, el filtro D−7 **redujo** el acierto del Top3 frente a dejar tres de Nocturna, en vez de mejorarlo.

## Comparación de los motores históricos de huellas completas
También se reprodujeron las mismas tres variantes de huellas que ya habían sido ensayadas sobre agosto-octubre, sobre idénticos 245 cortes junio-julio:

| Variante | Junio | Julio | Total Top3 |
|---|---:|---:|---:|
| Lalo oficial | 5 | 2 | 7 |
| Geometría completa vigente | 3 | 3 | 6 |
| Huellas + desplazamiento | **9** | 1 | 10 |
| Huellas + antecedentes independientes | **9** | 1 | 10 |
| Exclusivamente familias con raíz ganadora | **10** | 1 | **11** |

Las tres variantes de raíces ganadoras tuvieron una clara concentración en **junio** y rindieron **un solo acierto en julio cada una**. La diferencia entre meses es muy grande para proponer cualquiera como reemplazo definitivo. El resultado confirma inestabilidad que también se vio entre agosto y septiembre-octubre.

## Contraste con 15/08–15/10 ya analizado
El bloque de 265 PRE / 53 jornadas agosto-octubre había arrojado:
- 21.471 exposiciones de nuevas familias VT3 con 194 apariciones ganadoras.
- **D−7: 33 coincidencias observadas**, **34,99** esperadas por control comparable (−1,99).
- Top3 de Nocturna normalizado **11**; dos Nocturna y una familia recién nacida con D−7 **12**; dos Nocturna y una recién nacida sin exigir D−7 **13**.

Las pequeñas variaciones de signo no son evidencia robusta. El mismo patrón de formas puede existir entre muchos caminos alternativos no ganadores, y contar cabezas antiguas o rutas por sí solo no determina un candidato superior.

## Decisión y siguientes investigaciones

1. **NO activar D−7 ni D−1 como condición de entrada** al Top3 para familias recién nacidas: en ambos bloques distintos ya investigados, la condición no aportó ganancia reproducible.
2. **NO reemplazar los motores** por la variante de huellas que rindió 10 en junio y 1 en julio. Las observaciones de meses pasados no proporcionan señal predictiva prospectiva validada.
3. Mantener la regla original del padre para la **lectura visual explicativa** de las hojas: comparar el mismo día semanal anterior, observando solo figuras realmente marcadas por cabezas ganadoras, no todas las formas generables. Pero no transformar esa observación en un puntaje automático sin controles adicionales.
4. Para el siguiente estudio, contrastar el **recorrido concreto** y su evolución física a través de las cinco fuentes frente a familias igualmente disponibles de la misma columna, sin inventar privilegios para trazos manuscritos.
5. Todo desarrollo debe seguir en rama experimental; la APK 0.3.5 y los motores originales siguen intactos.

## Trazabilidad
- Corrida GitHub Actions junio-julio: https://github.com/y0t3/Modelo-Papa/actions/runs/38861124286
- Corrida base agosto-octubre: https://github.com/y0t3/Modelo-Papa/actions/runs/38860223408
- Rama actual: `lab/vt3-nacidas-d7-validacion-junio-julio-16oct2026`.
- Código principal: `scripts/lab-geo-newborn-weekly-roots.ts`; ejecución `scripts/lab-geo-roots-265.ts` adaptada únicamente en ventana y controles de completitud.
- Artefacto GitHub: `HUELLAS-GANADORAS-265-CORTES` con `VT3_NACIDAS_RAICES_D7_JUN_JUL_CORTES.json` y JSON de cada motor/ranking/corte.

**Los aciertos son de familia de tres cifras, no predicción exacta de cuatro cifras; las fechas y turnos dentro de una jornada no son observaciones independientes ni probabilidades de acertar una apuesta.**
