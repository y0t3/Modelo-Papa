# Motor de Estados Colectivos V0 · contraste retrospectivo RAW (21/10/2026)

**Rama experimental `lab/estados-colectivos-21oct2026`. Sin +11, hoja, celdas, recorridos, familias predictivas ni componentes del MV1.**

Ejecución exitosa: https://github.com/y0t3/Modelo-Papa/actions/runs/39610834346

## Objetivo y procedimiento

En cada corte PRE se reciben cinco cabezas reales del **turno inmediatamente anterior** en cinco jurisdicciones argentinas. Para Previa se usa la Nocturna anterior. El modelo NO elige ternas, sino estima la probabilidad de ciertas características de los cinco resultados del siguiente turno:

- **PARES**: por lo menos tres de cinco cifras finales son pares.
- **ALTAS**: por lo menos tres de cinco cifras finales son mayores o iguales a 5.
- **SUMA250**: la suma de las cinco terminaciones de dos cifras es 250 o mayor.
- **REPITE_UNIDAD**: existe al menos una cifra final repetida entre las cinco cabezas (diagnóstico secundario, evento muy frecuente).

Modelos fijos antes de ver los resultados:

1. `TASA_HISTORICA`: probabilidad suavizada observada entre 120 episodios anteriores del mismo turno.
2. `VECINOS_25`: utiliza los 25 estados de entrada más similares por huella de frecuencias de dígitos, suma y dispersión; pesa cada episodio por cercanía y regulariza hacia la tasa histórica.
3. `ESTADOS_8`: combina tres indicadores binarios de la situación de entrada en ocho grupos, con suavizado hacia la tasa histórica.
4. `PERSISTENCIA`: supone que la propiedad se conserva con probabilidad 0,65 frente al turno inmediatamente anterior.

Se usó una pérdida Brier cuadrática (menor=mejor) como variable principal, con tres características cercanas al 50%; logloss y exactitud como diagnósticos. En 2025 se reconstruyó entrenamiento solo con fechas anteriores, a lo sumo 120 episodios. **Para todo 2026 la tabla de entrenamiento quedó congelada en 2025-12-31**, sin reentrenamiento sobre los resultados del período evaluado.

## Datos

- Fechas del calendario solicitadas: 658, desde 2025-01-01 hasta 2026-10-20.
- Jornadas con sorteos suficientes: **547**.
- Episodios completos disponibles: **2724**.
- Cortes con 50 o más episodios anteriores para entrenar: **2474**.
- Errores de descarga: cero.
- Validación cronológica julio–diciembre 2025: **767 cortes, 155 jornadas, 2301 observaciones principales**.
- Contraste congelado enero–20 octubre 2026: **1213 cortes, 243 jornadas, 3639 observaciones principales**.
- La Nocturna de 2026-10-20 está incluida, porque la fuente devolvió cabezas completas.

## Brier promedio de los tres objetivos principales

| Período | Tasa histórica | 25 vecinos | 8 estados | Persistencia |
|---|---:|---:|---:|---:|
| Validación jul–dic 2025 | **0,25132** | 0,25299 | 0,25337 | 0,27856 |
| Contraste ene–oct 2026 | **0,25268** | 0,25481 | 0,25522 | 0,27180 |

Brier de evento binario balanceado pronosticando 0,5 de manera constante = 0,25; el modelo de analogías no logró aportar predicción calibrada. No inferir ventaja de apuesta de pequeñas variaciones numéricas.

## Diferencia de error frente a tasa histórica (beneficio positivo sería mejora)

Comparación pareada de exactamente los mismos cortes, remuestreada en bloques de **jornadas enteras** (1999 réplicas). Los intervalos no corrigen múltiples modelos u objetivos probados, pero son suficientes para detectar la ausencia de mejora en este esquema.

| Variante | 2025: diferencia de Brier (IC95%) | 2026: diferencia de Brier (IC95%) |
|---|---|---|
| 25 vecinos | −0,00167 [−0,00323; −0,00008] | **−0,00213 [−0,00344; −0,00069]** |
| 8 estados | −0,00205 [−0,00458; 0,00049] | **−0,00254 [−0,00421; −0,00087]** |
| Persistencia | −0,02724 [−0,03379; −0,02062] | −0,01912 [−0,02414; −0,01411] |

**Las diferencias de 2026 son negativas**: los selectores por estados fueron consistentemente peores, no mejores. No se debe elegir un subperíodo favorable ni recalibrar los pesos al 2026 para revertir el resultado.

## Diagnóstico por característica, año 2026

| Evento | Proporción observada | Brier tasa | Brier vecinos | Brier estados |
|---|---:|---:|---:|---:|
| Mayoría de pares | 49,22% | **0,25244** | 0,25495 | 0,25292 |
| Mayoría altas | 51,36% | **0,25359** | 0,25556 | 0,25691 |
| Suma >=250 | 47,65% | **0,25200** | 0,25392 | 0,25582 |
| Repetición de unidad | 70,24% | **0,21356** | 0,21541 | 0,21370 |

En el evento de repetición, la mayor exactitud se explica casi enteramente por la alta probabilidad básica. No demuestra información condicional del turno previo.

## Conclusión operativa

1. Motor RAW y colectivo técnicamente implementado y reproducible, pero **no mejoró** a estimar proporciones históricas.
2. La semejanza entre distribuciones de dígitos de los cinco resultados previos no anticipó eficazmente la paridad, predominio de cifras altas ni suma de los cinco resultados siguientes.
3. La persistencia fuerte fue peor que la tasa histórica. La hipótesis de estados compartidos tampoco superó la referencia.
4. No convertir los estados en reglas de filtrado VT2/VT3, porque esto agregaría selección sin capacidad validada y aumentaría riesgo de sobreajuste.
5. Mantener el motor como **control negativo independiente** de las reglas del padre. Ningún cambio a MV1, APK o modelos existentes.

El usuario buscaba específicamente un camino diferente de la hoja +11: este estudio lo explora de forma genuina y separada. Los sorteos de lotería se diseñan para ser aleatorios; la inexistencia de ventaja predictiva es compatible con ello.

Código: https://github.com/y0t3/Modelo-Papa/blob/lab/estados-colectivos-21oct2026/scripts/lab-estados-colectivos-v0.ts

Verificación histórica: https://github.com/y0t3/Modelo-Papa/actions/runs/39610834346
