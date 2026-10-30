# Diagnóstico del embudo VT3 en auxiliares Santiago–Neuquén

**Fecha:** 30/10/2026. **Rama aislada:** `lab/diagnostico-embudo-vt3-aux-30oct`.

## Pregunta

Las hojas AUX (Ayer y Hoy, **separadas**) pueden formar muchos VT3 físicos con tres casillas contiguas, pero sus motores rara vez sitúan el VT3 ganador en los primeros diez puestos. ¿El problema está en la existencia física, la selección a partir de ganadores anteriores o el orden del ranking?

## Reproducción

- Mismo código MV1 / AUX ya utilizado, sin cambio de reglas, pesos ni APK.
- 16 jornadas completas, 12–29/10/2026: **80 cortes PRE, 400 cabezas POST, 0 jornadas omitidas**. [Pruebas y replay de octubre](https://github.com/y0t3/Modelo-Papa/actions/runs/41026787353).
- 103 jornadas completas, 1/6–30/9/2026: **515 cortes PRE, 2.575 cabezas POST**, dos fechas sin condiciones suficientes omitidas. [Pruebas y replay junio–septiembre](https://github.com/y0t3/Modelo-Papa/actions/runs/41026963550).
- Cinco jurisdicciones del laboratorio: Ciudad, Provincia, Córdoba, Santa Fé, Entre Ríos. Montevideo se mantiene fuera por su calendario.
- AUX AYER: Santiago/Neuquén de la jornada sorteable anterior, grilla 2×12, disponible desde Previa.
- AUX HOY: solo las tres franjas terminadas **antes** del turno objetivo: 0, 8, 16, 24, 24 celdas entre Previa/Primera/Matutino/Vespertino/Nocturno.
- Un VT3 válido exige tres casillas distintas y contiguas en la **misma hoja**; puede atravesar las fronteras de las tres franjas auxiliares, pero no cruzar entre AUX Ayer/Hoy ni hacia +11. Leerlo en dirección inversa da la misma familia porque el recorrido físico puede invertirse.
- Se enumera todo camino geométricamente válido **antes** de mirar resultados, por `enumerateAuxPaths` y se agrupa por lectura reversible; en paralelo, se calcula el ranking AUX auténtico de `buildAuxIndependent`, que **solamente** considera proyecciones de las rutas de cabezas ganadoras anteriores (raíces D−1/D−7). Solo POST se cotejan las últimas 3 cifras exactas de cada cabeza. Una cabeza y corte se contabiliza una sola vez por tablero, sin importar múltiples caminos.
- Por ello diferenciamos: **Imposible físico**, **Formable pero sin puesto** (no llegó a la fase de proyección histórica), **Rank 51+**, **Rank 21–50**, **Rank 11–20** y **Top10**.
- Las cifras de AUX Ayer y AUX Hoy se miden **por separado** y pueden solaparse entre sí; no se suman como cabezas únicas.

## Resultados junio–septiembre (103 jornadas, 2.575 cabezas)

| Etapa | Auxiliar Ayer | Auxiliar Hoy |
|---|---:|---:|
| Promedio de celdas en el corte | 23,5 | 14,4 |
| Familias VT3 distintas físicamente posibles por corte | **116,3** | **70,0** |
| Familias VT3 candidatas en ranking histórico, por corte | 93,5 | 41,7 |
| Cabezas cuya VT3 es físicamente formable | **614** (23,8 %) | **333** (12,9 %) |
| De ellas, cabezas con familia en ranking completo | 496 | 191 |
| Aciertos si se toma Top10 | **56** | **41** |
| Aciertos si se toma solamente puesto 11–20 | **55** | **40** |
| Aciertos si se toma solamente puesto 21–50 | 150 | 63 |
| Aciertos si se toma puesto 51 o más | 235 | 47 |
| VT3 formados pero sin puesto | 118 | 142 |
| VT3 físicamente imposibles | 1.961 | 2.242 |

Estos números muestran: (a) la hoja *no* forma cualquier VT3; (b) muchos VT3 realmente ganadores sí tienen un camino previo, pero (c) la selección de los diez **casi empata** con los puestos 11–20. El Top10 cubre **56 de 614** ganadores físicamente alcanzables en AYER, o 9,1 %, y **41 de 333** en HOY, o 12,3 %. Que un Top10 aparezca poco no prueba que otro algoritmo pueda ganar; tampoco existe aquí evidencia clara de ventaja de la puntuación actual frente a los diez siguientes.

### Solo Nocturna, junio–septiembre (103 turnos, 515 cabezas)

| Etapa | Ayer | Hoy |
|---|---:|---:|
| VT3 físicos formables | 113 | 102 |
| Con puesto en ranking completo | 92 | 59 |
| Top10 | **9** | **8** |
| Puestos 11–20 | 9 | **14** |
| Puestos 21–50 | 29 | 17 |
| Puesto 51+ | 45 | 20 |
| Físicos pero sin puesto | 21 | 43 |
| Imposibles de formar | 402 | 413 |

## Resultados octubre, 12–29 (16 jornadas, 400 cabezas)

| Etapa | Ayer | Hoy |
|---|---:|---:|
| Familias VT3 distintas físicamente posibles por corte | 124,9 | 74,3 |
| Familias VT3 con puesto por proyección histórica | 92,8 | 42,4 |
| VT3 de cabezas formables | **84** | **50** |
| Con puesto en ranking completo | 69 | 28 |
| Top10 | **3** | **4** |
| Puestos 11–20 | **9** | **8** |
| Puestos 21–50 | 27 | 9 |
| Puestos 51+ | 30 | 7 |
| Físicos pero sin puesto | 15 | 22 |
| Imposibles | 316 | 350 |

### Nocturna de octubre, 80 cabezas

- AUX AYER: 15 VT3 formables; 12 con ranking; **0 en Top10** y **5 en 11–20**.
- AUX HOY: 16 VT3 formables; 11 con ranking; **1 en Top10** y **2 en 11–20**.

**Caso verificable 29/10, Nocturna, Santa Fe 2813**: su VT3 813 es físicamente formable en las dos auxiliares al corte PRE; se ubica **#12 en AUX AYER** y **#79 en AUX HOY**. No se usa ese acierto para alterar ningún orden o entrenar ninguna regla.

## Interpretación y límites

1. **El embudo físico importa:** de 2.575 cabezas en junio–septiembre, el 23,8 % de las VT3 se forman en AYER y el 12,9 % en HOY. Un ranking perfecto tampoco podría recuperar las cabezas sin recorrido físico.
2. **El ranking histórico AUX no aporta una separación clara a nivel Top10:** en ambos períodos y tableros el primer bloque de diez puestos es muy similar al segundo bloque en términos de coincidencias observadas; en octubre incluso sale peor. Esta es una descripción histórica, no una prueba estadística de inutilidad o de una regla contraria.
3. **La densidad es engañosa:** 24 celdas permiten alrededor de 116–125 familias VT3 distintas por corte, por lo que muchas formaciones físicas no aportan necesariamente información predictiva individual.
4. **No atribuir victoria al doble soporte AUX Ayer+Hoy sin controles:** las dos hojas derivan de fuentes similares y pueden tener formaciones coincidentes por azar; la historia de las madres VT2 y del 813 ya mostraba ese riesgo.
5. La prueba es **PRE reconstruida** a partir de datos anteriores y una política fija de selección; no es una secuencia de pronósticos sellados en vivo. Las cabezas y cortes, jurisdicciones y puestos dentro de la misma fecha están correlacionados.
6. **No sumar** las 56 y 41 coincidencias como si fueran necesariamente cabezas distintas: una cabeza puede coincidir en ambos tableros.

## Próxima prueba con mejor poder de decisión

No optimizar un motor a partir del caso 813. En laboratorio, mantener diez familias VT3 por turno, tres candidatos de selector comparables:
- **A.** Top10 AUX actual (proyecciones de raíces D−1/D−7 y orden por eventos).
- **B.** Puestos 11–20 AUX, sin cambios, como control interno de **igual presupuesto**, más un control neutro de diez familias físicas elegidas PRE con semillas fijas.
- **C.** Ranking experimental de **sitios y siluetas físicas**: seleccionar la ubicación/recorrido antes de leer sus dígitos, con testigos concretos de la propia AUX y ventana corta 5–6 jornadas. Contar eventos ganadores únicos, no multiplicar los votos de una misma cabeza por sus múltiples rutas. Evaluar la capacidad del Top10 de capturar más cabezas exactas, pero también la estabilidad por turno y fecha.

Congelar A/B/C antes de comparar el período que quede reservado para validación, separando HOY y AYER. Si el selector C no supera controles pareados, no llevarlo a producción. **Mantener VT2 y VT3 independientes**. Geometría y Conectadas de +11 son alternativas diferentes, que requieren comparación de presupuestos sin mezclar las casillas de ambas clases de hojas.

## Código reproducible

- `src/labEmbudoAuxVT3.ts`: pruebas puras de formación, ranking y denominadores de cabezas sin solapamientos dentro de un tablero.
- `scripts/test-embudo-aux-vt3.ts`: hoja sintética, candidatos sin proyección, top10/11–20, imposibles, corte vacío.
- `scripts/lab-tres-hojas-figuras.ts`: construcción real PRE de 80 y 515 cortes y reporte completo con ejemplos por Nocturna.
- `.github/workflows/lab-embudo-aux-vt3.yml` y `.github/workflows/lab-embudo-aux-vt3-jun-sep.yml`.
- Artefactos GitHub Actions: `embudo-vt3-aux-octubre` y `embudo-vt3-aux-junio-septiembre`.

**No se cambió el motor oficial, los Top10 en la app ni la APK.**
