# Figuras que explicaron cabezas reales: traslado D−7 sin perseguir números
**Laboratorio independiente · 29 de octubre de 2026**  
**Rama:** `lab/huellas-ganadoras-semana-vt2-vt3-29oct`  
**Estado:** tres períodos ejecutados y pruebas aprobadas en [GitHub Actions 40972329455](https://github.com/y0t3/Modelo-Papa/actions/runs/40972329455). Ningún cambio en MV1, AUX, VT4, la interfaz ni la APK.

## Hipótesis visual (definida sin leer números nuevos)

El padre analiza las cabezas **efectivamente formables** de la Nocturna del mismo día de la semana anterior. Esas cabezas dejan huellas de casillas y recorridos físicos en cada columna de +11. Para la Nocturna objetivo se trasladan **las posiciones y el dibujo**, no las cifras antiguas. Solo después se leen las cifras actuales y, cuando se publica la Nocturna, se comprueba el sufijo real.

Ensayamos por separado VT2 y VT3, cuatro traslados:
1. **MISMO SITIO:** idénticas casillas e idéntica fuente.
2. **VERTICAL ±1:** una fila arriba o abajo en la misma fuente, con los contactos idénticos.
3. **FUENTE VECINA:** mismo recorrido, pero en la columna +11 inmediata contigua, sin cruzar fuentes al formar una cifra.
4. **MISMO SITIO o VERTICAL ±1:** unión de los anteriores 1 y 2.

Una cabeza antigua que admitía varios caminos genera múltiples huellas, **pero una cabeza posterior se cuenta una sola vez** aunque aparezca por distintos recorridos. Las rutas cumplen adyacencia física, no saltos, y nunca mezclan columnas. No se usan las cifras de la semana anterior para filtrar familias.

### Dos controles, ambos fijados sin mirar resultados actuales

- **Neutral:** igual cantidad de figuras, agrupadas por **misma fuente y misma silueta**. Probabilidad de cubrir cada cabeza con un conjunto uniforme sin reemplazo, calculada mediante combinaciones hipergeométricas. Se suman expectativas, no se inventan sorteos.
- **No ganador real D−7:** se toman figuras disponibles en la hoja de la semana anterior que **no explicaron ninguna cabeza de su Nocturna**, se proyectan con idéntico traslado y se eligen de manera determinista en los mismos grupos de silueta/fuente, sin mirar cifras actuales. Cuando es imposible igualar el cupo sin duplicar las posiciones candidatas, se registra explícitamente el faltante y no se proclama comparabilidad perfecta.

La métrica principal es **coincidencia física exacta de la terminación de 2 o 3 cifras** mediante una huella seleccionada, permitiendo recorrerla en sentido inverso físicamente válido. Un acierto parcial VT2 no se interpreta como VT3.

## Tamaño y alcance

118 Nocturnas verificadas: junio–julio 51; agosto–septiembre 52; octubre 12–28 15. Cinco jurisdicciones comparables por Nocturna (Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos); Montevideo, incluida en el acierto manual 1876, está **excluida del denominador histórico** y merece control separado de calendario. 590 cabezas nocturnas analizadas; dos fechas se excluyeron por jornada incompleta/semana sin dato, nunca por desempeño.

Todos los PRE son reconstrucciones retrospectivas de insumos disponibles antes del objetivo, **no instantáneas prospectivas selladas**.

## Resultado acumulado VT2

| Movimiento de huella ganadora D−7 | Cabezas coincidieron | Control neutral esperado | Control no ganador D−7 | Posiciones marcadas |
|---|---:|---:|---:|---:|
| Mismo lugar exacto | **112** | **97,95** | **97** | 1.215 |
| Vertical ±1 | 137 | 141,17 | 126 | 1.842 |
| Fuente vecina | 133 | 133,62 | 128 | 1.706 |
| Mismo lugar + vertical | 201 | 195,05 | 132* | 2.847 |

*Control no ganador del método combinado no comparable sin ajuste: **837 posiciones** de las 2.847 no pudieron emparejarse con un lugar distinto de igual grupo; por tanto NO interpretar 201 frente a 132 como mejora. En «mismo lugar» faltaron solamente **9 posiciones de 1.215**, y las comparaciones son mucho más próximas en exposición.*

### ¿La mejora de VT2 exacto es temporalmente coherente?

| Período | Mismo sitio observado | Control neutral esperado | Control real no ganador |
|---|---:|---:|---:|
| Junio–julio | 50 | 41,83 | 42 |
| Agosto–septiembre | 48 | 43,85 | 42 |
| Octubre 12–28 | 14 | 12,27 | 13 |
| Total | **112** | **97,95** | **97** |

La diferencia +14,05 contra control neutral y +15 contra el no ganador real es **una pista pequeña que repite el mismo signo en tres períodos**. Intervalos bootstrap exploratorios por jornada (15.000 réplicas):
- Observado menos control neutral: **IC95 % [−1,5; +29,8]** coincidencias.
- Observado menos control no ganador: **IC95 % [−9; +39]** coincidencias.

Ambos incluyen cero. Se probaron simultáneamente cuatro traslados y dos longitudes, lo que además introduce riesgo de múltiples comparaciones. **No se acredita ventaja predictiva ni apuesta recomendable.**

## Resultado VT3

| Movimiento | VT3 reales exactas | Control neutral | Control no ganador |
|---|---:|---:|---:|
| Mismo lugar | **2** | 3,82 | 7 |
| Vertical ±1 | 5 | 6,01 | 6 |
| Fuente vecina | 9 | 6,04 | 5 |
| Mismo lugar + vertical | 7 | 9,63 | 8 |

En el método «fuente vecina» VT3 el resultado de nueve coincidencias sobre 590 cabezas es demasiado pequeño y es una de ocho variantes probadas; no se considera evidencia de continuidad.

## Cuatro Nocturnas que motivaron la investigación

Las cifras antiguas NO intervienen en el traslado, pero los resultados reales actuales permiten comprobarlo:
- **Jueves 22/10**: Entre Ríos **8067** estuvo entre las huellas VT2 seleccionadas por **mismo lugar**; otros dos caminos ganadores correspondieron al traslado vertical, junto a otras cabezas.
- **Viernes 23/10**: la selección por **mismo lugar** formó exactamente `19`, correspondiente a Córdoba **6919**. **No** recuperó en ese mismo criterio Entre Ríos `2498`.
- **Lunes 26/10**: el acierto manual Montevideo **1876** no se contabilizó por la restricción estadística de cinco jurisdicciones. En esas cinco jurisdicciones no hubo coincidencia nocturna VT2 de la selección «mismo lugar».
- **Miércoles 28/10**: Córdoba **4510** sí se formó en una huella de **mismo lugar** y también en la alternativa vertical (su VT2 `10`). No demuestra que fuera la figura marcada por Lalo.

Estos casos son ilustraciones POST: no se eligen para ajustar la regla ni se suman dos veces.

## Lo que aprendimos y lo que no

1. **La unidad correcta de seguimiento es la huella ganadora confirmada y sus posiciones actuales**, no el número ni un ranking genérico.
2. **Mismo sitio exacto D−7** es el único criterio VT2 simple que dio un excedente modesto frente al control neutral en todos los períodos; también superó al control no ganador, pero sin confirmación estadística.
3. **Desplazar una fila, cambiar de fuente o combinar rutas** no produjo una diferencia robusta frente al control neutral; agregar muchos recorridos aumenta cobertura y ruido.
4. **VT3 no hereda automáticamente el comportamiento de VT2.** Todavía no corresponde avanzar a VT4.
5. **No se ha conseguido seleccionar uno o dos focos con ventaja demostrada**: «mismo sitio» todavía ilumina unas 10 huellas por Nocturna (1.215/118); si se limitan por otra fórmula después de mirar los resultados se introduce sesgo. Cualquier versión de dos focos requiere ensayo prospectivo predefinido.

## Aporte visual posible, NO implementado

En una vista experimental podría mostrarse la **minihoja Nocturna de D−7 con una cabeza confirmada y TODOS sus recorridos**, frente a la hoja actual con esas mismas posiciones iluminadas aunque hoy tengan dígitos diferentes. A un toque, exhibir las terceras cifras **físicamente extensibles** desde cada VT2 sin ordenar por probabilidad. El resultado real objetivo debe permanecer oculto hasta el POST.

Esta vista se plantea como **ayuda de exploración y explicación**, no un motor que declare dos apuestas preferibles.

## Reproducibilidad

- Código: `src/labWinningFootprintTransfer.ts`, funciones `winningFigures`, `moveWinnerFigures`, `evaluateAgainstShapeControl` y `controlFromNonWinningPast`.
- Test: `scripts/test-winning-footprint-transfer.ts`; regresiones oficiales `scripts/test-motor-lalo.ts` y huellas VT2 anteriores.
- Replay: `scripts/lab-winning-figure-week-transfer.ts`.
- GitHub Actions: [40972329455](https://github.com/y0t3/Modelo-Papa/actions/runs/40972329455), tres jobs satisfactorios.
- Tres artefactos ZIP `winning-figures-junio-julio`, `winning-figures-agosto-septiembre`, `winning-figures-octubre`, con resultados JSON de cada jornada, números solo en POST y testigos antiguos físicos.

**Balance:** seguimiento visual correcto; evidencia estadística todavía insuficiente para reemplazar prioridades o predecir números.
