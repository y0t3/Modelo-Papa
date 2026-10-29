# Lectura del Top10 vivo · VT2 Lalo · movimientos entre turnos y 5–6 jornadas

**Investigación del 29/10/2026.** Rama `lab/vt2-transiciones-familias-cinco-dias-29oct2026`. No modifica MV1, ranking oficial, main ni APK. Resultados exclusivamente **PRE reconstruidos** a partir de los insumos cronológicos del código fuente; no PRE auténticos del celular.

## Hipótesis humanamente observable

**No es lo mismo repetir una posición que repetir una familia.** Ejemplo: si la familia reversible VT2 `34/43` acertó en `Primera #2`, y aparece en `Nocturno #7`, es una **familia previamente acertada**, pero el puesto nocturno #7 no tiene por qué haberse acertado antes. A la inversa, que antes haya acertado `#7` no demuestra nada sobre el nuevo número que ocupa `#7` ahora.

Los dos tableros / anotaciones experimentales son distintos:
1. **Familia marcada:** el número de dos cifras reversible fue una cabeza coincidente en un Top10 PRE de uno de los turnos anteriores *del mismo día*, y también está en el Top10 del turno por anticipar.
2. **Puesto marcado:** el índice #1..#10 ya tuvo alguna cabeza coincidente en un Top10 anterior de ese día, aunque la familia ahora sea otra.

Ambas se reconstruyen solo con resultados publicados **antes** del corte objetivo. No se inventan sorteos de Montevideo ni se lo incorpora como raíz histórica en Lalo. La ventana de 5–6 días se evalúa solo con cortes de jornadas *anteriores* efectivamente incluidos en la base de la auditoría.

## Control de reproducción del motor real

- **127 jornadas, 635 cortes PRE, 3.401 cabezas evaluables** del 01/06 al 28/10/2026.
- Top Lalo VT2: **Top3 220**, **Top5 351**, **Top10 674**; todos reproducidos.
- Nocturnas: **127 turnos**, **140 cabezas con familia en Top10**.
- **349 de 1.270 cupos nocturnos (27,5 %)** contenían familias VT2 que ya habían coincidido en turno previo ese día.
- **49 de las 140 cabezas nocturnas del Top10 (35 %)** cayeron en esas familias, frente a 91 fuera.
- En esos **349 cupos**, **47 cupos distintos** registraron al menos una cabeza coincidente; **302 no**. Por tanto no es un «selector seguro» y no garantiza encontrar la cabeza ganadora.
- El estado «puesto ya acertado» seleccionaba **440 cupos (34,6 %)** y coincidió en 54 de 140 cabezas. No es equivalente al estado de familia.

## Familias que ya acertaron antes ese día: dinámica temporal

| Período | Nocturnas | Cupos de familias antes acertadas | Coincidencias nocturnas de estas familias | Total de coincidencias VT2 Top10 |
|---|---:|---:|---:|---:|
| Junio–julio | 51 | 136 | 14 | 53 |
| Agosto–septiembre | 52 | 145 | 24 | 60 |
| Octubre 1–24 | 21 | 60 | 11 | 24 |
| Octubre 26–28 | 3 | 8 | **0** | 3 |
| **Total** | **127** | **349** | **49** | **140** |

**Densidad relativa**: 49/140 = 35 % de los aciertos dentro de 349/1.270 = 27,5 % de los cupos (un cociente descriptivo ≈1,27), no probabilidad predictiva ni rendimiento económico.

## Controles negativos / permutaciones

Se mantuvieron las cifras acertadas, el Top10 exacto y los empates de puesto por múltiples cabezas. Solo se permutó la asignación entre la máscara «familia acertó antes hoy» y los puestos actuales, **25.000 veces**:
- Dentro de cada nocturna: promedio de **37,7** coincidencias; percentiles 95 % [28,47]; observadas **49**; p unilateral ≈ **0,014**.
- Intercambiando máscaras de familias entre nocturnas de **igual mes y día de semana**: promedio **38,3**; percentiles 95 % [30,47]; observadas 49; p unilateral ≈ **0,012**.

**Advertencias:** estas pruebas examinan una hipótesis descubierta explorando el MISMO histórico después de observar resultados; se analizaron otras relaciones y puestos. Los p-valores no están ajustados por múltiples comparaciones y los controles condicionales no prueban ventaja respecto a un sorteo aleatorio ni predicen ganancias. Las familias VT2 reversibles no tienen todos la misma cantidad de combinaciones numéricas, y la distribución natural de dígitos puede introducir sesgos. Se requiere nueva evaluación prospectiva.

## «Señal viva» de seis jornadas, no una regla perpetua

En el último bloque de seis jornadas de la muestra:

| Nocturna | Familias previamente acertadas en el Top10 | Aciertos nocturnos Top10 | Aciertos de esas familias |
|---|---:|---:|---:|
| 22/10 | 3 | 2 | 1 |
| 23/10 | 3 | 2 | 1 |
| 24/10 | 4 | 2 | **2** |
| 26/10 | 4 | 1 | 0 |
| 27/10 | 1 | 1 | 0 |
| 28/10 | 3 | 1 | 0 |

En las tres jornadas 22–24/10 se mantuvo una repetición de familias dentro del mismo día; en las tres siguientes desapareció. **Esto describe una transición que el ojo humano puede observar**, no significa que hubiera sido identificable de antemano como el punto exacto de corte.

Como ensayo de ventana previo, se evaluó el siguiente criterio **sin usar los resultados de la noche objetivo**: «en las cinco Nocturnas anteriores, al menos tres tuvieron alguna familia VT2 que ya había coincidido durante el mismo día». Eso se verificó antes de **34 Nocturnas** del histórico (excluidas las primeras cinco), en las que los cupos marcados fueron 88 de 340 y capturaron **17 de las 42 coincidencias** nocturnas Top10; la referencia uniforme condicionada a cupos era ~11,7. Durante agosto–septiembre se verificó antes de 24 Nocturnas y capturó 13 de 31 coincidencias en 63/240 cupos marcados. **Los umbrales fueron escogidos a posteriori**, y en el tramo 26–28/10 el criterio estuvo activo las tres noches sin capturar ninguna cabeza: **NO usarlo como selector automático**.

## Propuesta visual sin tocar el motor

A diferencia del ranking, la **información contextual** puede evolucionar durante la jornada:
- A la derecha de cada familia Top10, anotar **si la misma familia acertó antes hoy** y en cuál turno / puesto.
- Marcar por separado **si el puesto ya acertó**, evitando confundirlo con la familia.
- Mostrar un rastro **de las últimas seis jornadas**, con la secuencia de turnos y posiciones en las que esa familia fue propuesta y resultó ganadora.
- Señalar cambios de fase: «la repetición ocurrió en 3/5 noches previas», «hoy se desvaneció»; no prometer «está por salir» ni sugerir apuestas automáticamente.
- Mantener Top10 original y tres capas de lectura: **familia**, **posición**, **recorrido físico**.
- **Ningún sello PRE debe alterarse** al actualizar coincidencias POST.

## Archivos y controles

- `scripts/lab-vt2-posiciones-libres.ts`: PRE íntegros 635 cortes y resultados comparados cronológicamente.
- `scripts/lab-vt2-relaciones-familias.ts`: testigos por familia en turno anterior, ventanas de 5 y 6 jornadas, permutaciones condicionales; `resumen.json`.
- `auditorias/vt2-relaciones-familias/ventana-seis-jornadas.json`: cada Nocturna de las últimas seis jornadas con sus diez familias, puestos ya acertados, familias ya acertadas, permanencia en el turno anterior y cabezas POST.
- Acción [#40824757841](https://github.com/y0t3/Modelo-Papa/actions/runs/40824757841), con controles Lalo y archivos de resultados descargables.

**Decisión: registrar esta lectura como apoyo de interpretación humana; no cambiar ninguna posición del Top10 MV1 ni derivar una probabilidad o consejo de apuesta.**
