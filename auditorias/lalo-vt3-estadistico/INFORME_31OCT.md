# VT3 Lalo · ¿Puede justificarse un Top10 por probabilidad y estadística?
**Auditoría 31/10/2026 | Laboratorio únicamente.**
**Rama:** `lab/lalo-vt3-baseline-estadistico-31oct2026` (sin modificaciones a main, motor oficial ni APK).

## Hipótesis y comparación

Un Top10 VT3 que la hoja +11 permita formar y que use solo conteos históricos podría mejorar al Top10 basado en marcas geométricas. Para medir **si aporta información estadística real**, se debe contrastar no solo contra Lalo MV1 sino contra **Top10 neutrales con exactamente diez familias y la misma cantidad de terminaciones numéricas** (familias reversibles de uno o dos miembros).

- Para cada corte se enumeran **todas las familias VT3 formables físicamente** en las columnas visibles antes del turno, sin cruzar fuentes y sin saltos.
- **Frecuencia 6:** solo cabezas de cinco jurisdicciones de las seis jornadas anteriores; **frecuencia 30:** solo las treinta jornadas anteriores. Cada ventana se mantiene cronológica y excluye la fecha objetivo. No se confunde cada camino con una cabeza nueva.
- Ordenación por frecuencia suavizada: `(frecuencia PRE de la familia + 500 × cantidad de terminaciones / 1000) / (número de cabezas de entrenamiento + 500)`. Esta constante es un valor arbitrario fijo y **no fue entrenado**; el resultado sigue siendo exploratorio. Permite evitar conclusiones extremas por pocos conteos.
- Se eligen las primeras diez familias físicamente formables; se mantienen **veinte controles neutrales** por corte y por modelo, cada uno con **exactamente la misma cantidad de familias de una y dos orientaciones** que su selección correspondiente.
- **Referencia matemática:** si cada terminación de tres cifras tiene probabilidad uniforme 1/1000, un Top10 con veinte terminaciones apostables abarca 2 % de una cabeza; en cinco jurisdicciones se esperan 0,10 coincidencias por turno. Al haber familias palindrómicas o Top10 original corto, la expectativa del período es un poco menor.
- Se excluye Montevideo. 119 jornadas completas, 595 cortes, 2.975 cabezas efectivas: 77 jornadas junio–agosto (385 cortes; sin 20/06 y 09/07, incompletas), 42 jornadas septiembre–octubre 12–29 (210 cortes). La jornada 30/10, que ya conocíamos, se verifica por separado.
- **No** se elige una regla mirando la cabeza ganadora; sin embargo **todas las pruebas son reconstrucciones retrospectivas**, no registros con sello externo PRE anteriores a esos sorteos. No se reivindica validación prospectiva.

## Resultado en 119 jornadas

| Motor | Cabezas VT3 reales | Esperadas bajo referencia uniforme (según orientaciones exactas) | Promedio de 20 controles neutrales |
|---|---:|---:|---:|
| **Lalo original Top10** | **48** | **56,86** | **54,40** |
| **Top10 estadístico, seis jornadas previas** | **58** | **58,97** | **61,85** |
| **Top10 estadístico, treinta jornadas previas** | **61** | **59,14** | **59,80** |

En términos de coincidencias históricas, Frecuencia 30 mejora **+13 frente a Lalo original**, pero consigue **apenas +1,2 sobre su control neutral**. La frecuencia corta 6 mejora +10 frente a Lalo, pero queda **−3,85 por debajo de sus controles**. **No se ha demostrado señal predictiva de las frecuencias pasadas.**

El original elige menos de diez familias en algunos cortes (5.937 espacios ocupados de un máximo 5.950) y contiene más palíndromos. Los controles se ajustan a ese presupuesto y orientación, evitando atribuir a un modelo un aumento que solo procede de cubrir más números.

## Comparación temporal

| Etapa | Lalo original | Frecuencia 6 | Frecuencia 30 |
|---|---:|---:|---:|
| Junio–agosto (77 jornadas) | **31** | **40** | **36** |
| Septiembre–29 octubre (42 jornadas) | **17** | **18** | **25** |
| Total | **48** | **58** | **61** |

- En junio–agosto, la frecuencia 30 logró **36**, pero los neutrales equivalentes promediaron **38,75**.
- En septiembre–octubre, frecuencia 30 logró **25** y neutrales equivalentes **21,05**. El efecto cambia por período y la muestra posterior es menor.
- Frecuencia 6 tuvo un salto concentrado en **agosto** (22 coincidencias frente a 8 del original), pero en junio y octubre fue inferior. Esto no prueba repetición futura.

### Intervalos de incertidumbre

Remuestreo descriptivo por **jornada completa**, manteniendo sus cinco turnos juntos, 12.000 repeticiones. Diferencia frente al Top10 original:

| Regla | Diferencia observada | Intervalo bootstrap aproximado del 95 % |
|---|---:|---:|
| Frecuencia 6 | **+10** | −10 a +30 |
| Frecuencia 30 | **+13** | −5 a +31 |

Son intervalos **exploratorios**, que no corrigen la elección posterior de la mejor variante ni garantizan independencia. Incluyen la ausencia de mejora. No justifican modificar el motor oficial.

### Interpretación económica y de decisiones

Para una única terminación exacta bajo el supuesto uniforme, la probabilidad por cabeza es 1/1000; no importa que el número lleve muchos días sin salir o que haya salido repetidamente. Un Top10 de **familias reversibles** puede abarcar hasta 20 terminaciones distintas (no diez), lo que cambia tanto la exposición como el número de apuestas necesarias si alguien decidiera cubrirlas todas.

Un acierto histórico no basta para demostrar **rentabilidad**. Haría falta especificar importe por número, pago bruto real por 3 cifras a la cabeza, jurisdicciones jugadas, inversión por turno y mantener resultados **futuros** que superen por un margen defendible a controles equivalentes, sin reajustar luego la regla.

## Cotejo 30/10, posterior a los estudios viejos pero anterior al diseño del modelo estadístico

| Modelo | Coincidencias en cinco turnos |
|---|---:|
| Lalo original | 0 |
| Frecuencia 6 | 0 |
| **Frecuencia 30** | **1**: Córdoba **2197**, Vespertina; familia 197/791 |
| Promedio neutrales equivalentes Frecuencia 30 | 0,10 |

La cabeza 2197 ya se conocía cuando se construyó esta hipótesis; por tanto, **ese acierto no tiene validez de pronóstico ciego**. Aunque el selector solo usa PRE, fue diseñado después del resultado; no debe usarse como evidencia confirmatoria.

## Decisión

- **Sí es viable construir y reproducir** un Top10 estadístico VT3 estricto de la hoja +11 que conserve solo familias físicas. La variante de 30 jornadas obtiene **61 vs 48**, pero el margen frente al control neutral de igual cobertura es mínimo (**61 vs 59,8**).
- **No se justifica aún** su incorporación al motor o su uso como garantía de apuestas. No se aprecia ventaja consistente del historial de frecuencias por sí mismo.
- Se conserva el **motor MV1 original sin modificaciones** y los Top10 de frecuencia únicamente como **instrumentos de comparación**.
- La única verificación que puede sostener una afirmación nueva es un **registro de candidatos PRE inmutable antes de sorteos futuros**, repetido durante suficientes jornadas; comparar también con un control aleatorio pareado y registrar coste/pago para cualquier conclusión económica.

## Reproducción

- `src/labLaloEstadisticoVT3.ts`: conteos PRE, suavizado, clasificación y controles pareados por orientaciones.
- `scripts/test-lalo-vt3-estadistico.ts`: rechaza fuga temporal; prueba frecuencias reversibles, familia palíndroma y mismas orientaciones/ranuras.
- `scripts/lab-lalo-vt3-estadistico.ts`: 119 jornadas, Top10 oficial vs frecuencias 6/30, 20 controles por corte, dato de expectativas uniformes, JSON por turno.
- `.github/workflows/lab-lalo-vt3-estadistico.yml`: tres trabajos exitosos y artefactos JSON descargables.
- [GitHub Actions — pruebas completadas](https://github.com/y0t3/Modelo-Papa/actions/runs/41180226590).
