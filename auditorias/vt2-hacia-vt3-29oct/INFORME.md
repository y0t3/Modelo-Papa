# Laboratorio VT2 → VT3 · retrospectiva física 29/10/2026

**Estado:** rama experimental `lab/vt2-a-vt3-recorridos-29oct2026`. Código MV1, AUX, motor VT4, interfaz y APK sin modificar. **No integrar a producción** con estos resultados.

## Qué se ensayó

De cada Top10 VT2 oficial se conservan las **rutas físicas realmente presentes**. Por cada orientación 2-celdas, se intenta anteponer UNA cifra contigua de la misma fuente, sin repetir celdas. Se ordenan **familias reversibles VT3**, con un máximo de 10 por corte. En +11 se restringe cada camino a la misma columna; en Santiago/Neuquén se admiten cruces contiguos entre turnos, pero nunca se mezclan ambas hojas. Se evalúan separadamente Lalo +11, AUX AYER y AUX HOY.

Tres ordenamientos fijados:
- **RONDAS**: rota madres VT2 por puesto; dentro de cada madre, prioriza distintas fuentes y recorridos reales;
- **CUADRADO**: igual reparto de madres, priorizando las hijas VT3 que pueden participar en un cuadrado 2×2 físico y fuentes distintas;
- **FUENTES**: concentra primero hijas con más fuentes y caminos válidos.

Una cuarta cifra NO se calcula aquí. Una cabeza POST del turno jamás participa en la selección PRE. La evaluación conserva dos métricas distintas: coincidencia por *familia reversible* (comparable con el ranking oficial VT3) y coincidencia por **recorrido exacto de sus tres últimas cifras**.

## Primera prueba: 26, 27 y 28 de octubre

15 cortes; 81 cabezas del proveedor actual, incluyendo Santa Fe 28/10 Nocturno `6666` sin corroboración independiente. Quitar este resultado no cambia ningún Top10 ni los aciertos de las variantes en este laboratorio.

| Motor | Top10 original VT3 | Rondas | Cuadrado | Fuentes | Exactas físicas Top10 (según modalidad) |
|---|---:|---:|---:|---:|---:|
| Lalo | 1 | 2 | 2 | 3 | 1 / 1 / 2 |
| AUX AYER | 1 | 4 | 4 | 4 | 3 / 3 / 3 |
| AUX HOY | 1 | 1 | 2 | 1 | 1 / 2 / 1 |

Los casos que originaron esta prueba eran **físicamente formables por extensión** en Lalo, pero **no aparecen en el nuevo Top10**: Nocturna 26/10, sufijo `876`, puesto 17 de Rondas, 15 de Fuentes; Nocturna 28/10, sufijo `510`, puesto 36 de Rondas, 18 de Fuentes. El origen VT2 ocupa #7 en ambos casos.

## Prueba ampliada: seis bloques de fechas

Fechas seleccionadas: 1–5 junio, 13–17 julio, 3–7 agosto, 14–18 septiembre, 19–23 octubre y 26–28 octubre de 2026.

**140 cortes / 756 cabezas**, reconstruidos cronológicamente con fuentes auténticas. Todos los días de la selección pudieron procesarse. No equivale a pronósticos prospectivos sellados.

| Motor | VT3 Top10 original | Rondas | Cuadrado | Fuentes |
|---|---:|---:|---:|---:|
| Lalo +11 | 16 | 17 | 17 | 17 |
| AUX AYER | 10 | 17 | 17 | **18** |
| AUX HOY | 11 | 10 | **13** | 12 |

Cobertura por trazas físicas exactas en las variantes Rondas/Cuadrado/Fuentes:
- Lalo: **15 / 15 / 15**; familias reversibles 17/17/17.
- AUX AYER: **15 / 15 / 14**; familias 17/17/18.
- AUX HOY: **9 / 12 / 9**; familias 10/13/12.

Con las diez madres VT2 (todavía sin escoger VT3), las terminaciones VT3 ganadoras físicamente posibles eran Lalo **80**, AUX AYER **74** y AUX HOY **44**. Esta es **cobertura de oráculo**, no aciertos del Top ni una propuesta de jugar todas las hijas. El salto 80→15 o 74→15 muestra que priorizar diez familias VT3 sigue siendo el cuello de botella.

### Cómo cambió AUX AYER según el período

| Semana elegida | Original | Rondas | Cuadrado | Fuentes |
|---|---:|---:|---:|---:|
| Junio | 3 | 2 | 3 | 3 |
| Julio | 1 | 2 | 2 | 2 |
| Agosto | 1 | 4 | 3 | 3 |
| Septiembre | 3 | 2 | 2 | 3 |
| Octubre, 8 jornadas | 2 | 7 | 7 | 7 |

La diferencia favorable se concentra en agosto y octubre, con retroceso en algunas semanas. **No hay estabilidad temporal demostrada**.

## Control neutral y cautela estadística

Se comparó cada orden con diez familias elegidas uniformemente en el **mismo conjunto físico de extensiones de cada corte**, manteniendo 10 cupos; los sorteos POST solo evalúan. El control no asume que ganar dependa de la geometría y no representa un sistema de apuestas.

En las 140 ventanas, la expectativa de coincidencia reversible de Top10 del control fue aproximadamente:
- Lalo **15,78** vs 17 del laboratorio;
- AUX AYER **13,73** vs 17–18;
- AUX HOY **10,30** vs 10–13.

Monte Carlo exploratorio de 800 repeticiones/caso: AUX AYER Fuentes con 18 coincidencias no supera un umbral confirmatorio (cola unilateral aproximada p≈0,14). Se probaron tres órdenes y tres motores; **las comparaciones múltiples agravan el riesgo de falsa mejora**. Los intervalos bootstrap por jornada de la diferencia contra el original incluyen cero en las variantes examinadas, excepto una estimación límite que comienza en cero.

Por tanto: **aún no está justificado reemplazar el VT3 actual**, ni sumar candidatos más allá del Top10, ni atribuir rentabilidad o ventaja estadística. Hay cobertura exploratoria no cubierta por el ranking actual que merece un ensayo prospectivo congelado.

## Decisión

1. Mantener intacto Lalo MV1 y AUX oficiales.
2. Conservar **AUX AYER VT2→VT3** como hipótesis de laboratorio prioritaria, junto a Lalo VT2→VT3 como lectura explicativa.
3. Para el siguiente control, sellar diariamente el Top10 de las extensiones, comparar con el oficial y con un Top10 aleatorio de igual universo, además de contabilizar **recorrido exacto** y fracasos.
4. Solo si el VT3 resiste datos posteriores independientes, explorar cadena VT2→VT3→VT4 con prefijos físicos, sin inversión arbitraria de VT4.

## Reproducción

- Código: `src/labVt2Vt3Extension.ts`.
- Tests: `scripts/test-lab-vt2-vt3-29oct.ts`, más regresiones MV1 y AUX.
- Replay inicial: `scripts/lab-vt2-hacia-vt3-29oct.ts`.
- Replay amplio: `scripts/lab-vt2-hacia-vt3-historico.ts`.
- Workflow de CI: `.github/workflows/lab-vt2-vt3-29oct.yml`.
- GitHub Actions completo: https://github.com/y0t3/Modelo-Papa/actions/runs/40949550197
- Artefactos de la ejecución: `lab-vt2-hacia-vt3-26-28oct` y `lab-vt2-a-vt3-historico`, cada uno con JSON de todos los cortes y rankings PRE reconstruidos.

Las fechas y los criterios se fijaron durante una exploración retrospectiva. Aun cuando no se cambió el código para optimizar el resultado de cada sorteo, **esto no sustituye una validación prospectiva ciega**.
