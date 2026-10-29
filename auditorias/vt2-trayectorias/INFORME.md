# VT2 Lalo — seguimiento de familias entre turnos y ventanas de 5/6 jornadas

**29/10/2026 · investigación experimental · rama `lab/vt2-trayectorias-rank-movimiento-29oct2026`.** Top10 Lalo MV1, `main`, APK y fuentes de Montevideo **sin cambios**. Datos históricos únicamente: **127 jornadas y 635 cortes PRE reconstruidos** de junio al 28/10, **3.401 cabezas** evaluables, Lalo VT2 Top3/5/10 = 220/351/674 reproducidos y pruebas de regresión MV1 aprobadas.

## Objetivo

Una familia VT2 reversible, por ejemplo `67/76`, puede estar en el ranking de varios turnos (no necesariamente en el mismo puesto). En cada corte del día se guarda:
- Familia y puesto actual del Top10, que no se modifica.
- Puestos anteriores de **la misma familia** durante la jornada, y si **acertó efectivamente** con cabezas publicadas antes del corte.
- Cambio de posición respecto a la última aparición previa: **SUBE** (#7→#4), **IGUAL** (#4→#4), **BAJA** (#4→#7) o **NUEVA** (no estaba en Top10 anterior de ese día).
- Si permaneció desde el turno previo o desapareció y reapareció en otro; últimos cinco días, premios VT2 anteriores por familia.
- POST separado: cabezas que coinciden en el turno objetivo. Nunca se leen antes de generar las etiquetas PRE.

**Nota:** cambio de puesto en el ranking **no es** desplazamiento físico en celdas +11. Esta fase interpreta el Top10, no altera la geometría física que lo genera.

## Resultado Nocturno: solo familias que ya habían acertado en el día

| Último movimiento | Posiciones con la señal | Cabezas nocturnas coincidentes | Coincidencias descriptivas por puesto observado |
|---|---:|---:|---:|
| Sube | 33 | 9 | 27,3 % |
| Mantiene | 237 | 35 | 14,8 % |
| Baja | 79 | 5 | 6,3 % |
| **Total** | **349** | **49** | **14,0 %** |

Son conteos de cabezas y puestos PRE observados, **no probabilidades monetarias ni de sorteo**. Una cabeza puede venir de cualquiera de las seis jurisdicciones y un puesto puede explicar más de una.

| Período | Sube: posiciones / hits | Baja: posiciones / hits | Igual: posiciones / hits |
|---|---:|---:|---:|
| Jun–Jul | 15 / 4 | 31 / 0 | 90 / 10 |
| Ago–Sep | 13 / 3 | 34 / 3 | 98 / 18 |
| Oct 1–24 | 4 / 2 | 11 / 2 | 45 / 7 |
| Oct 26–28 | 1 / 0 | 3 / 0 | 4 / 0 |
| Total | **33 / 9** | **79 / 5** | **237 / 35** |

El contraste «sube vs baja» tiene una diferencia de aproximadamente **21 puntos porcentuales** entre 9/33 y 5/79, pero las posiciones y los casos no son muestras independientes de billetes de lotería.

### Control de puesto y fecha

Se realizaron **30.000 permutaciones de etiquetas SUBE/IGUAL/BAJA entre candidatos de igual rango Nocturno (1..10) y del mismo bloque temporal** (Jun–Jul, Ago–Sep, Oct 1–24, Oct 26–28). Se conservan el número de señales y resultados por cada grupo. Esta referencia evita atribuir al movimiento un efecto debido únicamente a que una familia está en un puesto históricamente más favorecido.

- SUBE vs BAJA: diferencia real **0,2094**, media bajo control **0,0181**, referencia 95 % **[−0,1116; +0,1638]**, **p bilateral ≈0,0115**; bootstrap por noche para diferencia **[+0,035; +0,401]**.
- SUBE vs IGUAL: diferencia real **0,1250**, p bilateral **≈0,0715**.
- Como se probaron múltiples señales / turnos / ventanas y se descubrió la hipótesis examinando los mismos resultados, **ningún p-valores es confirmatorio**, y estos controles **no son una prueba de que una apuesta tendrá ventaja sobre el azar**.

## Comparación de dos familias — cupo idéntico

Selección solo para observación: entre familias que ya acertaron hoy, una política experimental prioriza las que SUBEN respecto a su última aparición del día, manteniendo el orden oficial en los empates. Nunca crea candidatos fuera del Top10 ni asigna probabilidades.

| Política alternativa de hasta 2 familias Nocturnas | Coincidencias en 127 Nocturnas |
|---|---:|
| Top2 oficial de Lalo (#1/#2) | 27 |
| Priorizar familias que ya acertaron hoy, sin orden de movimiento | 41 |
| Priorizar familias que acertaron hoy y SUBEN de posición | **43** |
| Priorizar familias que acertaron hoy y BAJAN | 37 |
| Priorizar familias que acertaron hoy y permanecen en el turno anterior | 41 |
| Priorizar familias ya vistas hoy, aunque no hayan acertado | 27 |
| Priorizar familias que ganaron en las 5 Nocturnas anteriores | 32 |

**La diferencia SUBE respecto a repetir la familia sin mirar desplazamiento es solo +2**. No adoptar nueva jerarquía sin nueva evidencia.

### Comprobación de «una fase que dura 5–6 jornadas»

Se ensayó una regla prospectivamente computable con el histórico: antes de cada Nocturna, mirar solo las últimas **5 o 6 Nocturnas completas anteriores**, medir qué selección de dos familias acertó más (Top2 vs familiares repetidas del día), y elegir la que llevaba ventaja; empate vuelve a Top2.

| Historia previa usada | Nocturnas evaluadas | Selector adaptativo | Top2 fijo | Familias del día fijas |
|---|---:|---:|---:|---:|
| 5 jornadas anteriores | 122 | **26** | 26 | **41** |
| 6 jornadas anteriores | 121 | **27** | 26 | **41** |

Esta regla dinámica **NO identificó períodos favorables a tiempo**. En particular estuvo activada en 26–28/10 y no rescató ninguna coincidencia. Los resultados descriptivos de una racha no equivalen a predecir su continuidad.

La mera presencia en el Top10 del turno anterior tampoco es suficiente: **1.196 de los 1.270 puestos** nocturnos seguían conteniendo familias presentes en el Top10 vespertino, y **126 de los 140 hits Top10** llegaron en esos puestos. La altísima presencia basal hace que el rasgo sea poco discriminante.

## Ejemplo — trayectorias reales de familias

El archivo `ventana-6-dias.json` contiene **los diez puestos de cada turno** del 22, 23, 24, 26, 27 y 28 de octubre, incluyendo familia, último puesto, giro de ranking, si acertó antes hoy, si persistió/reapareció y las cabezas POST.

Coincidencias nocturnas:
- **22/10:** familia 67/76, cabeza 8067, #7; también 58/85, 9558, #5.
- **23/10:** 89/98, 2498, #7; también 17/71, 1517, #3.
- **24/10:** 39/93, 5739 y 0439, ambas #3.
- **26/10:** 67/76, 1876, #7.
- **27/10:** 99/99, 2299, #2 (una sola orientación, números gemelos).
- **28/10:** 01/10, 4510, #7.

Los tres primeros días presentaron alguna familia nocturna que ya había acertado en el día, los tres siguientes no.

## Decisión y pendientes de interfaz

**Mantener MV1, candidatos Top10 y posiciones intactos.** La línea de investigación pasa a ser una capa visual junto a los diez candidatos:
1. Etiqueta discreta de la **familia exacta reversible** y turno/puesto donde ya acertó hoy.
2. Indicador independiente del cambio en ranking **sube / igual / baja / reaparece** (no geometría de celdas).
3. Rastro verificable de **5–6 jornadas** y, cuando exista, recorrido físico desde las hojas +11.
4. **Top10 visible por defecto**, sin chips de Top3/Top5, con coincidencias resaltadas inmediatamente.
5. **Retirar «Nueva Prueba»** de la comparación experimental, preservando los registros viejos y sin alterar el motor oficial.
6. No implementar aún esta interfaz experimental ni cambiar el motor sin prueba prospectiva sellada.

## Código, CI y limitaciones

- `scripts/lab-vt2-trayectorias-familias.ts`: trayectorias PRE, políticas con dos familias, selección dinámica temporal, rastros por turno.
- `scripts/lab-vt2-control-movimiento.ts`: permutación estratificada por puesto/período, remuestreo por día y control de casos.
- `auditorias/vt2-trayectorias/resumen.json`, `control-puesto-periodo.json`, `ventana-6-dias.json` y `nocturnas-127.json` como artefactos de GitHub Actions.
- [GitHub Actions, ejecución satisfactoria](https://github.com/y0t3/Modelo-Papa/actions/runs/40828304315).

**Las comparaciones son retrospectivas reconstruidas sin PRE firmado en el dispositivo y no predicen rendimientos económicos.** El siguiente experimento real es sellar las etiquetas y candidatos antes de cada turno, sin reajustar umbrales después de ver resultados.
