# Motor Regímenes RAW V0 · 21/10/2026

**Rama:** `lab/cambios-regimen-21oct2026`. Independiente del Motor Lalo MV1, de la hoja +11 y de sus recorridos. No modifica `main` ni la APK.

Código: https://github.com/y0t3/Modelo-Papa/blob/lab/cambios-regimen-21oct2026/scripts/lab-regimen-raw-v0.ts

Ejecución correcta con control uniforme adicional: https://github.com/y0t3/Modelo-Papa/actions/runs/39613417924

## Pregunta

¿Existe un *cambio de régimen* temporal que haga que la distribución de centenas/decenas/unidades de las cabezas RAW deje de ser estable, y tiene valor predictivo dar más peso a los últimos resultados?

Se estudian **2025 y 2026 por separado**. El efecto predictivo se compara después, sin usar +11 ni caminos.

## Descarga y cobertura

- Calendario 01/01/2025 a 20/10/2026: 658 fechas.
- Con algún resultado: 547 jornadas.
- **13.653 cabezas argentinas** (2025: 7.579; 2026: 6.074), cinco jurisdicciones y cinco turnos con registros válidos.
- Errores de descarga: **0**.
- Montevideo no forma parte del análisis argentino.

## Escaneo de cambios

Se predefinieron 18 series por año:

- 3 posiciones de cifras RAW agrupadas globalmente.
- Cada posición por cinco jurisdicciones: otras 15 series.

En cada serie se busca el corte de máxima diferencia en distribución de 10 dígitos, restringido al segmento 25%–75% del año. No se busca solo un dígito elegido después de conocer el resultado.

Se generaron **499 permutaciones conjuntas de CABEZAS** dentro de la misma jurisdicción y turno. Esto preserva las distribuciones marginales de cada fuente y correlaciones dentro de una cabeza, pero destruye la secuencia temporal. Los valores p están corregidos por el mayor estadístico entre las **18 pruebas del año**.

| Período | Cabezas | Señales corregidas con p ≤ 0,05 | Mejor indicio aparente | p bruto | p ajustado |
|---|---:|---:|---|---:|---:|
| 2025 | 7.579 | **0** | Unidades Santa Fe, cerca de 26/05/2025 | 0,096 | 0,768 |
| 2026 | 6.074 | **0** | Unidades Ciudad, cerca de 09/05/2026 | 0,142 | 0,930 |

Ejemplo que NO resulta significativo: Ciudad, unidad 6, 2026; antes de ~09/05 frecuencia 7,39%, después 12,81%. Es fluctuación compatible con el nulo tras corrección. No significa que haya cambiado la probabilidad real.

**Límite:** los cortes 25%–75% y las familias elegidas apuntan a cambios prolongados. No descartan microepisodios, errores del proveedor, ni cambios más sutiles.

## ¿Mejora un pronóstico RAW adaptativo?

Pronóstico independiente: para cada futura cabeza estimar probabilidades del dígito exacto (0–9) en centenas, decenas y unidades. El objetivo se evalúa en PRE **antes de incorporar cualquiera de las cabezas del mismo turno**.

- Baseline fija: tasas por jurisdicción+turno tomadas de enero–junio 2025 para validación julio–diciembre de ese año, o todo 2025 congelado para pronosticar 2026; Dirichlet alpha 1.
- Adaptación local: 80% baseline + 20% frecuencia de los últimos 30 resultados de esa misma jurisdicción+turno (suavizado alpha 2).
- Adaptación global: 80% baseline + 20% frecuencia en los 300 resultados anteriores de cualquier jurisdicción y turno (suavizado alpha 2), estrictamente antes del turno objetivo.
- Controles adicionales incorporados al detectarse que la baseline era débil: **uniforme exacto 10% por dígito** y baseline congelada fuertemente suavizada con alpha 25. Estos controles no reentrenan el motor a los resultados observados; son referencias conservadoras necesarias para interpretar el supuesto beneficio.

Error principal: logloss promedio, **menor es mejor**. Uniforme teórico: ln(10) = 2,302585.

| Selector | Jul–Dic 2025 (3.854 cabezas) | Ene–20/10 2026 (6.074 cabezas) |
|---|---:|---:|
| **Uniforme 0–9 (referencia)** | **2,30259** | **2,30259** |
| Baseline muy suavizada | 2,30526 | 2,30832 |
| Baseline histórica sin fuerte suavizado | 2,32632 | 2,31966 |
| Adaptación local | 2,32000 | 2,31657 |
| Adaptación global | 2,31725 | 2,31417 |

En ambas pruebas, las adaptaciones mejoraron la baseline **débil**, pero empeoraron la referencia uniforme. La mejora aparente es un efecto de suavizar estimaciones históricas con ruido, **no una ventaja sobre el azar uniforme**.

Los contrastes por jornada de la mejora definida como `logloss_referencia − logloss_adaptación` (positivo sería mejor) dan, en 2026:

- Adaptación local vs uniforme: **−0,01399**, IC bootstrap 95% [−0,01623; −0,01169].
- Adaptación global vs uniforme: **−0,01159**, IC bootstrap 95% [−0,01355; −0,00959].
- Adaptación global vs baseline histórica sin suavizado: +0,00548, IC [0,00478; 0,00619]; esta última comparación es engañosa sin la uniforme.

Los intervalos son de remuestreo por fecha (1.499 muestras), descriptivos y no corregidos por todas las hipótesis exploradas previamente.

## Conclusión y decisión

1. No aparece evidencia de un **cambio persistente** de distribución que resista la corrección por 18 escaneos.
2. Una memoria corta parece mejorar probabilidades relativas a una baseline mal calibrada, pero **no vence a asignar 10% fijo a cada cifra**.
3. No hay motivo empírico para crear filtros numéricos ni sustituir familias VT2/VT3 por regímenes detectados.
4. El enfoque es completamente independiente del +11 y sirve como control de estabilidad y calidad de datos, no como motor de apuestas validado.
5. **MV1, APK y motores oficiales no cambiaron**.

Los juegos bien aleatorizados no deberían ofrecer patrones predictivos consistentes. Esta investigación retrospectiva no prueba rentabilidad ni ventaja futura.