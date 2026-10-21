# Modelo Lalo · estudio marginal Top1–Top6 en VT2/VT3/VT4

**21/10/2026 · rama experimental** \`lab/marginal-top1-top6-21oct2026\`.
**Estado: ejecución correcta y auditada. Modelo oficial MV1 y APK sin cambios.**

## Pregunta

¿Los puestos cuarto, quinto y sexto aportan suficientes coincidencias para justificar las *terminaciones exactas adicionales* que representan? ¿Qué ocurre si se desea seleccionar pocos candidatos, sin olvidar VT2, VT3 ni VT4?

La evaluación no atribuye valores monetarios ni usa probabilidades "mágicas"; parte de los Tops PRE reales reconstruidos desde ambas hojas en laboratorio. Son replays retrospectivos y se han investigado muchas configuraciones sobre estos años; no constituyen una prueba prospectiva sellada.

## Corrección importante antes de evaluar VT4

El lector auxiliar del laboratorio anterior construía la clave de la familia VT4 añadiendo cifra a una madre VT3 y podía **contar como terminación apostable la orientación inversa de la madre aunque no existiera físicamente como recorrido VT4 en la hoja**. En este laboratorio se corrigió: las dos orientaciones siguen perteneciendo a la misma *familia madre*, **pero sólo las orientaciones realmente formadas por recorridos físicos** se consideran terminaciones exactas cubiertas. Se respeta la prohibición de invertir las 4 cifras para crear madres nuevas.

Esto reduce la exposición VT4 del lector auxiliar respecto al backtest previo y puede ajustar alguno de sus aciertos. No se alteró la producción, solo el replay de control.

## Protocolo

- Los resultados de 2024, 2025 y 2026, **del 1 de agosto al 20 de octubre**, 69 jornadas por año; cada una PRE reconstruida en su propio día. Fuente oficial de la app Vivitusuerte y mapeo corregido de Santiago/Neuquén.
- **Primera a Nocturno** para una comparación igualitaria: Previa carece todavía de tablero auxiliar. **276 cortes por año; 828 cortes totales; 4.507 cabezas de destino** de las seis jurisdicciones, 1.503/1.502/1.502 por año.
- Cada **familia** es una unidad de ranking, pero una familia puede cubrir dos **terminaciones exactas** o una sola si palíndroma. Se eliminan duplicados.
- **Apuesta hipotética de control**: apostar exactamente cada terminación seleccionada en cada jurisdicción con sorteo publicado en el corte, **solo sobre la primera cabeza**, una unidad por terminación×jurisdicción. Por tanto, \`apuestas-unidad = Σ(k números exactos únicos por corte × jurisdicciones disponibles)\`. **No representa dinero realmente jugado.**
- Esperanza bajo n cifras uniformes: \`apuestas-unidad / 10^n\`. Es un control fijo por exposición, no tasa de éxito inferida.
- Se computan **Top1, Top2, Top3, Top4, Top5 y Top6**, con su acierto marginal por puesto, número adicional de terminaciones, apuestas-unidad y comparación contra azar uniforme.
- Una cabeza puede acertar VT2 y VT3 simultáneamente; esto es dos *eventos por modalidad*, pero **una sola cabeza distinta** cubierta. Un evento VT2 solo significaría premio cobrado si se hubiera apostado explícitamente esa terminación VT2.

## Resultado conjunto 2024–2026: Tops 3 y 5

| Modalidad | Método | Hits Top3 | Hits Top5 | Aciertos extra puestos 4+5 | Extra esperables uniformes |
|---|---|---:|---:|---:|---:|
| **VT2** | Lalo | 260 | **442** | +182 | 173,05 |
| VT2 | Memoria auxiliar | 266 | 434 | +168 | 173,37 |
| **VT3** | Lalo | 20 | 38 | +18 | 17,07 |
| VT3 | Memoria auxiliar | **36** | **55** | +19 | 17,41 |
| **VT4** | Lalo | 1 | 3 | +2 | 1,59 |
| VT4 | Memoria auxiliar | 0 | 3 | +3 | 0,79 |

**Interpretación:** los puestos 4 y 5 producen más aciertos brutos porque cubren más resultados, pero **su rendimiento marginal se aproxima a lo esperable por azar uniforme** en VT2/VT3, una vez considerados el número de tickets por jurisdicción. El exceso de VT4 (+3 frente a 0,79 en auxiliar) es solo **tres casos** en 3 años, retrospectivo y sujeto a múltiples pruebas. No optimizar la apuesta sobre él.

## 2026: anatomía del ranking, aciertos NUEVOS al añadir cada puesto

| VT2 | #1 | #2 | #3 | #4 | #5 | #6 |
|---|---:|---:|---:|---:|---:|---:|
| Lalo | 36 | 38 | 27 | 35 | 24 | 27 |
| Memoria auxiliar | 31 | 31 | 29 | 22 | 31 | 24 |

| VT3 | #1 | #2 | #3 | #4 | #5 | #6 |
|---|---:|---:|---:|---:|---:|---:|
| Lalo | 2 | 4 | 1 | 2 | 8 | 5 |
| Memoria auxiliar | **7** | 3 | 5 | 3 | 1 | 6 |

| VT4 (exactos) | #1 | #2 | #3 | #4 | #5 | #6 |
|---|---:|---:|---:|---:|---:|---:|
| Lalo | 0 | 0 | 0 | 0 | 2 | 0 |
| Memoria auxiliar | 0 | 0 | 0 | 1 | 0 | 0 |

¡Ojo! En VT3 de Lalo, en 2026 el puesto **quinto** aportó más que los anteriores. No convertir eso en un nuevo orden invertido: es posterior al sorteo e inestable de año en año.

## Unidades de apuesta hipotética por jurisdicción para distintos Tops, total 2024–2026

| Modalidad y lector | Apuestas-unidad Top3 | Hits Top3 | Apuestas-unidad Top5 | Hits Top5 |
|---|---:|---:|---:|---:|
| VT2 Lalo | 26.184 | 260 | 43.489 | 442 |
| VT2 auxiliar | 25.978 | 266 | 43.315 | 434 |
| VT3 Lalo | 25.408 | 20 | 42.479 | 38 |
| VT3 auxiliar | 25.972 | 36 | 43.380 | 55 |
| VT4 Lalo | 24.203 | 1 | 40.141 | 3 |
| VT4 auxiliar | 13.481 | 0 | 21.415 | 3 |

El **mínimo multiplicador de premio bruto para cubrir costo** en esta simulación simplificada (mismas unidades por jurisdicción, premio pagado sobre la primera cabeza, sin impuestos y cero comisiones) sería \`apuestas-unidad / hits\`.

Ejemplos 2026:

- **VT2 Lalo Top3:** 8.644 apuestas-unidad / 101 aciertos ≈ **85,6×**.
- **VT2 Lalo Top5:** 14.461 / 160 ≈ **90,4×**.
- **VT3 auxiliar Top3:** 8.707 / 15 ≈ **580,5×**.
- **VT3 auxiliar Top5:** 14.503 / 19 ≈ **763,3×**.

Son **umbrales aritméticos condicionales** de una estrategia hipotética, no los pagos vigentes de la quiniela, ni ROIs verificados. No se conoce aquí cuánto apuesta el padre realmente, cuáles loterías, reglas de "a la cabeza"/varias posiciones ni multiplicadores netos. Si se hacen apuestas en una sola jurisdicción o en algunas, todos los denominadores cambiarán. Un ejemplo favorable no implica ganancia futura.

## Escenarios de seis familias totales entre modalidades

Comparación retrospectiva de asignaciones predefinidas para 2026. Se mantienen los Tops inalterados y cambian solo cuántas familias se incluyen por modalidad:

| Reparto VT2 / VT3 / VT4 | Lalo, cabezas únicas | Lalo, apuestas-unidad | Auxiliar, cabezas únicas | Auxiliar, apuestas-unidad |
|---|---:|---:|---:|---:|
| 3 / 2 / 1 | 106 | 17.064 | 98 | 16.136 |
| 2 / 3 / 1 | 80 | 17.009 | 74 | 16.163 |
| 4 / 1 / 1 | 138 | 17.138 | 118 | 16.119 |
| 4 / 2 / 0 | **141** | 17.220 | 119 | 17.359 |
| 2 / 4 / 0 | 82 | 16.996 | 77 | 17.388 |

**NO se puede inferir que 4/2/0 sea mejor para ganar dinero.** Dedicando más espacio a VT2 se consiguen más coincidencias de cabezas porque la probabilidad de un final de dos cifras es del orden de **100 veces la de cuatro cifras por terminación**. Los pagos de distintas longitudes se diseñan para compensar diferencias de probabilidad. En ausencia de premios y montos, sólo sabemos qué reparto incrementa el conteo de cabezas compatibles, no el retorno neto.

## Qué aporta cada último puesto a la decisión

- **VT2:** jamás relegarlo. Los puestos 4 y 5 añaden muchas cabezas (2026 Lalo 59 aciertos adicionales), pero con apuesta proporcional más grande; se compara con 58,17 aciertos esperables por exposición. No hay evidencia suficiente de que ese tramo esté mejor seleccionado que el azar.
- **VT3:** la memoria auxiliar Top3 (2026 15 con ≈8,71 esperados y 2025 13 con ≈8,57) aparece interesante; en 2024 hubo 8 con ≈8,69 esperables, un contraejemplo. Dada la exploración histórica, no modificar el motor por ello.
- **VT4:** muy pocos eventos para jerarquizar Top1–Top6; una sola coincidencia adicional altera drásticamente las estimaciones. No vender confianza estadística por un solo acierto.
- **Top6:** agregar el sexto puesto aportó 84 VT2 Lalo, 10 VT3 Lalo y 1 VT4 Lalo en conjunto, pero supuso 8.680 + 8.677 + 8.041 apuestas-unidad nuevas. Su relación con uniformidad fue cercana a lo esperable en esas modalidades.

## Decisión

1. Analizar **VT2, VT3 y VT4 como modalidades igual de legítimas**, sin asumir que la frecuencia VT2 por sí sola significa mejor ganancia.
2. Mantener Top3/Top5/Top6 **como unidades familiares**, mostrando al lado el número real de terminaciones apostables que representan.
3. Comparar la calidad por **aciertos marginales, exposición, baseline aleatorio con la misma cantidad de tickets y resultados por año**, evitando optimizar un Top después de observar resultados.
4. Mantener motor Lalo MV1 y APK intactos; la corrección de cobertura VT4 ocurrió solo en el laboratorio.
5. Para hablar de rentabilidad, incorporar más adelante **una tabla específica de premios/boletos/montos** de la modalidad elegida, en lugar de deducir ganancias de aciertos abstractos.

## Reproducibilidad

- Generador de replays triples: \`scripts/lab-lalo-triple-modalidad.ts\`
- Evaluación marginal auditada: \`scripts/lab-lalo-marginal-tops.ts\`
- [Ejecución correcta con replay y auditoría](https://github.com/y0t3/Modelo-Papa/actions/runs/39652663071).
