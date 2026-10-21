# Modelo Lalo Integral · primera versión y cuatro semanas de cotejo

**Fecha de trabajo:** 21 de octubre de 2026  
**Rama independiente:** `lab/modelo-lalo-integral-4semanas-21oct2026`  
**Ejecución verificada:** https://github.com/y0t3/Modelo-Papa/actions/runs/39674409314  
**Estado:** motor integral experimental creado y probado; **Modelo Lalo MV1, motor de producción, Tops de APK y `main` intactos**.

## Qué se implementó

Existe un **único selector PRE** `buildMotorLaloIntegral` que reúne candidatas de ambas hojas y entrega **un Top de familias VT2, otro VT3 y otro VT4**. No reemplaza los recorridos de Lalo por los auxiliares; conserva para cada familia su procedencia y sus testigos:

1. **Lalo MV1 +11**, sin cambios: patrones ganadores de días anteriores, traslados válidos y bifurcaciones; cada recorrido queda **dentro de su propia columna**.
2. **Santiago–Neuquén RAW**, sin aplicar +11: dos filas y tres franjas de Previa, Primera y Matutino; **sí permite recorridos contiguos entre franjas** sin saltos ni huecos. Las raíces son exclusivamente **cabezas ya sorteadas** de las seis jurisdicciones en D−1 y D−7. Cada una cuenta como un evento histórico, aunque tenga muchas rutas.
3. Las figuras ganadoras auxiliares se trasladan físicamente por su **forma de movimiento**, y cada candidata lee exclusivamente **dígitos actuales de celdas PRE visibles**. La fuente futura nunca se abre anticipadamente.
4. El selector integra el **ranking** por familia, no suma directamente caminos ni asume que dos fuentes hacen más probable el sorteo. Regla fija de esta versión:

   `puntaje = 65 / posición_MV1 + 35 / posición_AUX`; el término se omite si la familia no figura en uno de los motores. **No son probabilidades ni pesos optimizados en las cuatro semanas**.

5. **VT2 se procesa como modalidad propia** y sus aciertos valen tanto como los de VT3/VT4 en su registro correspondiente.
6. **VT4 se construye únicamente anteponiendo una cifra a una madre VT3 que esté entre las diez primeras familias VT3 del propio Integral**. Solo se cuentan terminaciones VT4 físicamente trazadas; no se invierte el número completo para inventar otra madre.
7. Cada familia muestra su rango en Lalo y AUX, fuentes físicas +11 y AUX por separado, raíces D−1/D−7, rutas, cruce legal auxiliar y las terminaciones exactas efectivamente cubiertas.

También se conserva la posibilidad de correr **tres selecciones separadas sobre el mismo PRE**: MV1 puro, AUX puro e Integral. No es solamente un mezclador visual: sus familias se seleccionan y ordenan en un único resultado.

## Período y metodología de prueba

Las últimas **cuatro semanas completas** del histórico hasta el 20/10/2026: **23/09/2026–20/10/2026**, 28 días calendario. Solo hubo **24 jornadas con resultados completos** en ese período. Se utilizaron datos desde el **05/09** para formar tableros y raíces históricas; no se trasladaron candidatos de fechas más remotas.

- Cotejo total: **120 cortes** de los cinco turnos, **642 cabezas** de seis jurisdicciones.
- Cotejo **justo para las dos hojas**: Primera, Matutino, Vespertino y Nocturno; **96 cortes PRE, 522 cabezas**. Previa no tiene todavía hoja auxiliar y, por diseño, Integral coincide con Lalo original.
- Fechas sin jornada real se excluyen; no se inventan sorteos inexistentes. Montevideo solo aporta resultados en los turnos que realmente publica.
- Para cada corte y modalidad se prepararon **Top3 y Top5 antes de leer los resultados del turno objetivo**, y luego se compararon con las cabezas POST.
- Se controlaron **familias elegidas, terminaciones exactas distintas y exposición hipotética** `terminaciones × jurisdicciones con cabeza válida`. La comparación principal **IGUAL_PRESUPUESTO** no permite al Integral cubrir más terminaciones que el Top3/Top5 de MV1 en ese corte; si la familia no entra entera, se omite. No divide familias.
- Se corrieron además **49 ordenamientos de control** del mismo conjunto de familias MV1/AUX, con ese mismo presupuesto. Los controles se promedian por semilla, **no se suman como si fueran 49 sorteos**.
- El período se conocía por investigaciones anteriores. Es una reconstrucción PRE con **control temporal** y POST verificable; **no es una serie de pronósticos que hubieran quedado sellados antes de los sorteos** ni una prueba independiente de predictibilidad o ganancias.

### Comprobaciones automáticas

Aprobadas: tipos TypeScript, fuente Santiago/Neuquén verificada (20/10: Santiago **8067 / 6142 / 9634**, Neuquén **0469 / 0245 / 0210**), geometría de ambas hojas, PRE sin resultados del propio turno, cambio de cabezas futuras que **no** altera un PRE anterior, rechazo de raíces de la fecha objetivo y genealogía de las familias VT4.

## Resultado principal: mismas oportunidades de juego

**Resultados 23/09–20/10, solamente turnos comparables (96 cortes/522 cabezas). Cada acierto es una coincidencia de terminación exacta, NO un premio efectivamente cobrado.**

| Tipo | Top | MV1 puro | AUX puro | **Lalo Integral** |
|---|---|---:|---:|---:|
| **VT2** | 3 familias | **39** | 25 | 34 |
| VT2 | 5 familias | **56** | 39 | 53 |
| **VT3** | 3 familias | 2 | **4** | **4** |
| VT3 | 5 familias | **10** | 6 | 4 |
| **VT4 exacto** | 3 familias | 0 | 0 | 0 |
| VT4 | 5 familias | **2** | 0 | 1 |

### Terminaciones realmente expuestas, igualando presupuesto

| Tipo | Top | MV1 unidades de apuesta hipotéticas | Integral unidades de apuesta hipotéticas |
|---|---|---:|---:|
| VT2 | Top3 | 3.063 | **3.052** |
| VT2 | Top5 | 5.087 | **5.065** |
| VT3 | Top3 | 2.947 | **2.919** |
| VT3 | Top5 | 4.918 | **4.845** |
| VT4 | Top3 | 2.804 | **2.734** |
| VT4 | Top5 | 4.659 | **4.497** |

Cada unidad es una terminación concreta hipotéticamente jugada **a la primera cabeza** en una jurisdicción/turno evaluado. No son pesos invertidos, boletos vendidos ni pagos reales.

La cobertura de **cabezas distintas por cualquiera de las modalidades**, sin contarlas dos veces, fue: **Top3 MV1 41, Integral 38**; **Top5 MV1 63, Integral 57**. Por lo tanto, **esta versión del Integral no mejoró el resultado general en las cuatro semanas**, aunque sí aumentó VT3 Top3.

### Qué ganó y perdió al reemplazar candidatas de MV1

Se cotejaron las mismas 522 cabezas con y sin el Integral, por modalidad:

| Tipo | Top | Coincidencias que el Integral **agrega** | Coincidencias de MV1 que **pierde** | Saldo |
|---|---|---:|---:|---:|
| VT2 | Top3 | 7 | 12 | **−5** |
| VT2 | Top5 | 11 | 14 | **−3** |
| VT3 | Top3 | 2 | 0 | **+2** |
| VT3 | Top5 | 2 | 8 | **−6** |
| VT4 | Top3 | 0 | 0 | 0 |
| VT4 | Top5 | 0 | 1 | −1 |

Esto verifica que **sí están interactuando** los lectores: algunos números del AUX entran al Top Integral y reemplazan familias del original. A veces la sustitución ayuda, otras perjudica.

**Dos aciertos VT3 Top3 nuevos del Integral:**
- **03/10 Nocturno, Entre Ríos: cabeza 4266**, VT3 **266/662**: venía del AUX.
- **09/10 Nocturno, Montevideo: cabeza 9231**, VT3 **132/231**: venía del AUX.

También hubo ejemplos VT2 favorecidos: **06/10 Vespertino de Provincia 8809 → 09/90**, o **09/10 Primera de Córdoba 3903 → 03/30**. No obstante, se perdieron más coincidencias VT2 de las que se recuperaron.

### Ejemplo importante donde la mezcla descartó un candidato acertado

**20/10/2026, Nocturno, Ciudad: 2697.** La hoja AUX tenía **697/796** en **Top2 VT3** y habría acertado su terminación. Pero el selector Integral 65/35 optó por:
`334/433`, `024/420`, `383/383`.

Así, **el propio Integral no elevó 697/796 a su Top3**, y tampoco lo hizo Lalo MV1. Este caso impide decir que fusionar ambos tableros garantiza rescatar los aciertos de cada uno. Al seleccionar pocos candidatos hay sustituciones.

### Distribución semanal de VT2 Top3, turnos comparables

| Semana | Lalo MV1 | Integral |
|---|---:|---:|
| 23–29 septiembre | 7 | 7 |
| 30 sept.–6 octubre | **16** | 11 |
| 7–13 octubre | 6 | **8** |
| 14–20 octubre | **10** | 8 |

La variación es relevante: la segunda semana explica una parte grande del retroceso VT2. No es correcto escoger después otra proporción de mezcla para hacer coincidir retrospectivamente los aciertos.

### Referencia de azar dentro del mismo conjunto de familias

**49 órdenes de control**, Top3 con límite de terminaciones de MV1, únicamente turnos comparables:

| Modalidad | Media de aciertos de control | MV1 | Integral |
|---|---:|---:|---:|
| VT2 Top3 | 28,5 | **39** | 34 |
| VT3 Top3 | 3,47 | 2 | **4** |
| VT4 Top3 | 0,39 | 0 | 0 |

En VT3 el Integral se aproxima al promedio de los controles de las mismas familias; **la diferencia de dos aciertos frente a MV1 no demuestra mejor capacidad de selección**. El Top5 VT3 del Integral fue peor que MV1 y que varios controles. La muestra de VT4 es muy escasa.

## Interpretación y decisión

**Se alcanzó el objetivo de ingeniería:** tenemos un tercer motor **integral de verdad**, que recibe las dos geometrías, mantiene marcas ganadoras históricas, trabaja familia por familia y entrega Tops independientes por VT2/VT3/VT4. La comparación de las cuatro semanas se ejecutó correctamente.

**No se alcanzó una mejora predictiva general con esta primera regla de integración.** VT3 Top3 es una señal exploratoria, pero VT2 y VT3 Top5 pierden; la selección mixta desplaza aciertos legítimos del lector original. No se debe subir la confianza ni el monto apostado sobre estos resultados.

La configuración **65/35 queda guardada sin optimizar después del cotejo**. Antes de proponer cambios sería mejor estudiar **cuándo conviene conservar el Top original y cuándo hay respaldo físico excepcional que justifique una sustitución**, con controles y cortes nuevos sellados. El requisito es proteger VT2, no forzar un triunfo VT3 a costa de descartar otras modalidades.

**MV1 sigue congelado; no se ha conectado el Integral a la pantalla oficial de Predicción ni generado una APK nueva.** El nuevo motor está disponible **solo en esta rama experimental**, junto a las pruebas y resultados por corte.

## Archivos y ejecución

- `src/motorLaloIntegral.ts`: única predicción combinada de ambas hojas, raíz AUX POST histórica y entrada PRE, madres VT3 / VT4 física.
- `scripts/lab-integral-test.ts`: 16 aserciones de aislamiento, geometría y fuga temporal.
- `scripts/lab-integral-4semanas.ts`: reconstrucción PRE, 49 controles, Top3/Top5, exposición y detalle por turno/jornada.
- `scripts/lab-integral-diagnostico.ts`: diferencias ganadas/perdidas y procedencia física de candidatos.
- `lab-results/modelo-lalo-integral-4semanas.json`: todos los cortes y candidatos del experimento; artefacto de GitHub Actions.
- `lab-results/modelo-lalo-integral-diagnostico.json`: diagnósticos de ganancia/pérdida por modalidad.
- [GitHub Actions con todos los tests aprobados](https://github.com/y0t3/Modelo-Papa/actions/runs/39674409314).
