# Modelo Papá · VT3, traslación de figuras ganadoras D−14 → D−7 → D
Fecha del ensayo: 2026-10-10 · Rama: \`experimento-analisis-visual-5d\`

## Objetivo fijado antes del contraste
La investigación principal sigue centrada en VT3. Un criterio visual
posible era dar prioridad a una figura ganadora reconstruida de D−7
cuando otra figura ganadora **con los mismos pasos y sentidos** aparecía
en la hoja D−14, pero DESPLAZADA a otras celdas.

No es la repetición exacta de coordenadas, ya estudiada aparte.
No permite saltar, cruzar columnas de turnos ni reinterpretar VT2
como dos aciertos independientes del mismo sorteo.

Procedencia de las hojas: los recorridos se reconstruyen automáticamente
a partir de TODAS las cabezas históricas ya conocidas y se conservan todos
los caminos VT3 válidos. **No se atribuye a papá la selección manuscrita
de cada uno de esos caminos reconstruidos**.

## Regla de emparejamiento
- D−14 y D−7 son fechas REALES del mismo día semanal.
- Ambas hojas deben contener una ruta VT3 ganadora; se compara el MISMO
  turno de salida y la MISMA columna de origen.
- Coincide la secuencia ORDENADA de desplazamientos \`dr,dc\` entre sus
  tres celdas, conservando el sentido de lectura. Las celdas absolutas
  deben ser distintas (la repetición exacta se ensayó por separado).
- Se registra desplazamiento \`moveRows\`, \`moveCols\`,
  dirección SUBE/BAJA/LATERAL y ambas cabezas históricas para trazabilidad.
- La geometría GANADORA de D−7, y no el resultado del objetivo D,
  origina la candidata VT3 proyectada al tablero actual.
- El ranking base es el mismo lector combinado 7D, con sus seis
  jornadas previas y el Top3 VT3; el ranking experimental da prioridad
  binaria a disponer de una traslación confirmada D−14/D−7.
  No premia el número de variantes retrospectivas de la misma figura.
- Presupuesto de candidatas y universo físico D−7 idénticos. El
  resultado de D se abre sólo después de congelar ambos rankings.

## Ensayo cronológico de cuatro períodos
| Período | Turnos evaluados con ambas semanas | Candidatas VT3 | Candidatas con traslación | Cambios de selección | VT3 base | VT3 traslación |
|---|---:|---:|---:|---:|---:|---:|
| 2024 | 1449 | 2394 | 85 | 32 | 13 | 12 |
| 2025 | 1441 | 2347 | 69 | 19 | 12 | 12 |
| Ene–may 2026 | 524 | 861 | 25 | 8 | 5 | 5 |
| Jun–sep 2026 | 453 | 738 | 21 | 6 | 7 | 7 |
| **Total** | **3867** | **6340** | **200** | **65** | **37** | **36** |

Referencia aleatoria restringida al mismo conjunto de rutas físicas D−7
y cantidad de candidatos: 37,142 aciertos esperados en estos turnos.

El cambio produjo **un VT3 menos** que el ranking original. VT2 sufijo
contenidos en esos mismos candidatos: 347 con el original y 346 con
traslación. No son sorteos ni aciertos independientes.

Direcciones observadas entre las figuras seleccionadas con apoyo:
86 SUBE, 105 BAJA y 8 LATERAL, clasificadas por la PRIMERA pareja
de rutas verificable, sin escoger dirección a partir del resultado.
Son recuentos descriptivos, NO indicios de qué dirección pronosticar.

## Interpretación
La forma desplazada existe como fenómeno geométrico y puede
reconstruirse sistemáticamente, pero fue relativamente escasa en
estos contextos (200 candidatas con apoyo entre 6340 seleccionadas).
Darles prioridad casi nunca modificó el Top3; cuando lo hizo,
no mejoró el resultado total.

**No aprobar este criterio como selector final.** No es evidencia
de que el padre no viera movimientos: sólo invalida la hipótesis
limitada «misma forma ganadora desplazada D−14→D−7 implica
prioridad VT3 en D» en los datos históricos estudiados.

Además, estos cuatro períodos ya se utilizaron en múltiples pruebas
exploratorias. Ninguna comparación nueva sobre ellos constituye
una validación prospectiva no contaminada.

## Evidencia ejecutable
- \`src/vt3TranslatedD14d7.ts\`: reconstrucción de pruebas geométricas,
  movimientos y selector espejo con mismo presupuesto.
- \`scripts/test-vt3-translated-d14d7.cjs\`: test de forma trasladada,
  fecha D−14/D−7, columna de origen, disponibilidad, causalidad y
  conservación de Top3.
- \`scripts/run-vt3-translated-d14d7.cjs\`: informe cronológico con
  parejas de rutas, cabezas y resultados por fecha/turno/mes.
- \`.github/workflows/vt3-translated-d14d7.yml\`: trabajos históricos
  automatizados.
- Ejecución verificada tras corregir un nombre antiguo de campo usado
  para informar «cambios» (sin alterar el motor):
  https://github.com/y0t3/Modelo-Papa/actions/runs/38025031341

## Decisiones conservadas
\`main\` intacta; motor semanal oficial y APK NO integran estas
variantes. VT2 se conserva, VT3 continúa como prioridad, VT4 físico
y extrapolado continúan experimentales y etiquetados.

## Próximo trabajo, sin abrir otra búsqueda de pesos
Un problema aún pendiente es describir **cadenas de transformación**
de la red visual completa: giros, bifurcaciones, convergencias y
cambios de zona de una figura VT3 a través de varias hojas. Antes
de darles puntaje, tabular su frecuencia y sus bases de comparación
sin seleccionar subgrupos ganadores a posteriori. Priorizar registros
prospectivos de cada turno antes de afirmar una ventaja real.
