# Motor de Episodios Análogos V0 · primer contraste 2025/2026

**Experimento verdaderamente ajeno a la hoja +11.** No utiliza columnas, recorridos, raíces históricas, +11 ni posiciones del tablero. No modifica MV1, APK ni rankings oficiales.

## Idea

El corte PRE tiene un estado completo: las cinco cabezas RAW del **turno inmediatamente anterior**. En Previa, toma las cinco Nocturnas de la última jornada con datos. En Primera–Nocturno, toma el turno precedente ya publicado de ese día.

Al cotejar un objetivo determinado, busca entre **90 episodios del mismo turno pero de fechas estrictamente anteriores**. Recupera 12 episodios:

1. **ANALOGÍA DIRECTA:** mínima distancia de Hamming entre diez posiciones de cifras (últimos dos dígitos por cada una de cinco jurisdicciones).
2. **ANALOGÍA DE HUELLA:** multiconjunto de diez dígitos, más penalización por repeticiones de pares dentro del contexto. No depende de las posiciones del tablero.
3. **RECIENTES 12:** control que elige los doce episodios anteriores sin semejanza.
4. **FRECUENCIA 90:** control que acumula resultados de los noventa episodios sin semejanza.
5. **ALEATORIO FIJO:** control sin acceso a las cabezas (desempate determinístico).

No mira la cabeza objetivo para encontrar contextos; convierte las cabezas del siguiente turno de los episodios recuperados en familias reversibles VT2/VT3 y propone Top3/5/10. Invertir una familia no fabrica recorridos: aquí no existen recorridos.

Parámetros predefinidos en la primera ejecución, no recalibrados a los aciertos: 90 jornadas, K=12, dos distancias. El código del prototipo y sus contrastes está en `scripts/lab-motor-episodios-analogos.ts`.

## Cobertura de la muestra

- Calendario descargado: 657 días entre 01/01/2025 y 19/10/2026. Con jornadas de resultados: 546, sin errores de descarga reportados.
- 2719 episodios completos elegibles; 2569 cortes con al menos 30 episodios históricos anteriores.
- **Septiembre–diciembre 2025:** 507 cortes / 2535 cabezas; **enero–19 octubre 2026:** 1208 cortes / 6040 cabezas.
- Objetivo: cinco jurisdicciones argentinas por corte. No hubo Montevideo como cabeza objetivo.

## VT3 · cabezas recuperadas en Top5

| Selector | 2025 Sep–Dic | 2026 Ene–Oct |
|---|---:|---:|
| Analogía directa | 17 | 54 |
| Analogía de huella | 23 | 57 |
| Últimos 12 episodios | 22 | 59 |
| Frecuencia 90 | **25** | 56 |
| Aleatorio fijo | 19 | **59** |

2025: 23 coincidencias de huella frente a 25 de frecuencia; diferencia **−2** (IC de remuestreo por jornada: −15 a +12). 2026: 57 vs 56, diferencia **+1** (IC −19 a +20). No se observa una mejora convincente.

Las cifras esperadas por cobertura uniforme para Top5 de huella son aproximadamente 24,31 (2025) y 57,90 (2026), por lo que tampoco hay exceso útil sobre esa referencia.

## VT2 · cabezas recuperadas en Top5

| Selector | 2025 Sep–Dic | 2026 Ene–Oct |
|---|---:|---:|
| Analogía directa | **256** | 601 |
| Analogía de huella | 255 | 612 |
| Últimos 12 episodios | 239 | **619** |
| Frecuencia 90 | 232 | 605 |
| Aleatorio fijo | 217 | 569 |

La ventaja retrospectiva VT2 de 2025 (analogía directa frente a frecuencia **+24**) no se reprodujo en 2026 (**−4**). IC por jornada para la diferencia de 2026: −62 a +51. La analogía de huella, 2026 +7 sobre frecuencia, tuvo IC −49 a +62. No es una mejora estable.

### Control estadístico correcto

La primera ejecución contenía una permutación de resultados dentro de mes/turno, **inadecuada como contraste causal para selectores que incorporan resultados anteriores del mismo mes**: el reordenamiento de las respuestas no actualizaba el entrenamiento cronológico de los pronósticos. Se descartaron esos p-valores y sus distribuciones nulas en vez de presentarlos como evidencia.

Versión final: comparación pareada por jornada real, bootstrap en bloques de jornadas (1999 remuestreos) y prueba exploratoria de cambio de signo, con ajuste entre ambas distancias. Se comparan métodos contra las mismas cabezas sin mover ni cambiar el historial que produjo sus predicciones.

- VT3: contra frecuencia, p exploratorio máximo ajustado de 0,791 (2025) y 0,642 (2026). Contra recientes: 0,645 y 0,755.
- VT2: contra frecuencia, p exploratorio máximo ajustado de 0,190 (2025) y 0,568 (2026). Contra recientes: 0,309 y 0,780.

Ningún método analógico mostró una superioridad replicada y convincente.

## Aprendizaje

Este motor estudia **situaciones históricas completas**, no transformaciones. Es un laboratorio genuinamente alternativo; el concepto funciona técnicamente, pero la dimensión del contexto (diez posiciones de dígitos) es grande frente a solo noventa episodios de consulta. Encontrar episodios realmente parecidos puede ser raro incluso sin ningún sesgo de los sorteos.

La comparación demuestra además que encontrar contextos similares **no equivale** a que sus consecuencias numéricas sean similares. No corresponde modificar MV1 ni añadir predicciones analógicas a la app.

Si se profundiza esta línea, el siguiente estudio tendría que cambiar la **pregunta pronosticada**: antes de pronosticar tres cifras exactas, intentar validar si estados RAW análogos anticipan alguna característica agregada de los siguientes cinco resultados. Definir el objetivo y los criterios antes de ver los aciertos y usar otro bloque de prueba independiente, no seleccionar retrospectivamente propiedades exitosas.

Código: https://github.com/y0t3/Modelo-Papa/blob/lab/motor-episodios-analogos-21oct2026/scripts/lab-motor-episodios-analogos.ts

Ejecución exitosa: https://github.com/y0t3/Modelo-Papa/actions/runs/39545843484

Los resultados de un sorteo bien aleatorizado no deberían ser predictibles por su pasado. Este informe es auditoría exploratoria, no evidencia de ganancia o rentabilidad.
