# Modelo Papá · Primer lector VT3 vivo de la tabla +11 completa
Fecha de control: 2026-10-10 · Rama experimental \`experimento-analisis-visual-5d\`

## Norma fija
Antes de cada turno se lee TODA la tabla +11 físicamente disponible,
progresivamente:
Nocturna anterior→Previa→Primera→Matutina→Vespertina→Nocturna.
La hoja de D−7, ayer y las jornadas previas son memoria contextual, no
condiciones de admisión. No mezclar celdas de columnas distintas en
ningún recorrido. VT3 prioridad Top3; VT2 se conserva independiente
y VT4 físico/extra sigue experimental.

## Lo que ya quedó implementado y probado
1. \`src/progressiveBoard7d.ts\`: observa columnas visibles, marcas
   ganadoras conocidas de turnos anteriores de HOY, geometrías
   compartidas entre turnos y columnas, y vínculos opcionales con
   la jornada anterior o D−7. No selecciona ni puntúa candidatas.
2. \`scripts/test-progressive-board7d.cjs\`: verifica las cinco
   etapas y que cambiar el resultado objetivo o futuros turnos
   no cambie el análisis previo. Batería verde.
3. **Corrección real:** \`src/adaptive7d.ts\` contaba en su ciclo
   de vida los momentos vacíos de turnos no sorteados como si
   fueran oportunidades transcurridas: provocaba decaimiento
   artificial en una figura confirmada el día anterior.
   Ahora avanza sólo en turnos con cabezas reales registradas.
   El test sintético de \`scripts/test-visual5d.cjs\` se adaptó para
   identificar correctamente un sorteo realmente finalizado.
4. \`src/liveVT3Pilot7d.ts\`: conecta el motor adaptativo EXISTENTE
   al tablero progresivo actual y a todos los resultados
   temporalmente conocidos. No requiere D−7, respeta físicamente
   cada columna y devuelve hasta tres VT3 únicos. Mantiene
   intactos los pesos del adaptativo; es SOLO un piloto.
5. \`scripts/test-live-vt3-pilot7d.cjs\`: asegura que el piloto
   pueda usar hoy y ayer, que se abstenga si no hay apoyo,
   que funcione sin D−7 y que ignore las cabezas del objetivo.
6. \`scripts/run-progressive-observer7d.cjs\` y
   \`scripts/run-live-vt3-pilot7d.cjs\`: auditorías cronológicas
   con resultados abiertos DESPUÉS de generar lecturas y candidatas.

No cambiar \`main\`, ni incorporar a la APK o al selector oficial.

## Evaluación retrospectiva del piloto VT3
El piloto usa exactamente los pesos y ordenamiento del
\`analyzeAdaptive7D\` que ya existían. Se evalúan turnos con seis
jornadas anteriores disponibles, igual que otros replays del proyecto.
La referencia uniforme elige el mismo número de candidatos de todos
los VT3 físicamente legibles en la tabla anterior al turno.

| Período | Turnos | VT3 piloto propuestos | Aciertos piloto | Azar físico esperado | VT3 propuestos lector D−7 anterior | Aciertos D−7 |
|---|---:|---:|---:|---:|---:|---:|
| 2025 | 1491 | 4305 | 18 | 23.585 | 2420 | 13 |
| Ene-may 2026 | 584 | 1677 | 3 | 9.264 | 923 | 5 |
| Jun-sep 2026 | 483 | 1386 | 11 | 7.187 | 790 | 7 |
| TOTAL | 2558 | 7368 | 32 | 40.036 | 4133 | 25 |

Los lectores tuvieron **DIFERENTES cantidades de candidatos**, de
modo que comparar 32 contra 25 NO demuestra una mejora. El piloto
vivo propuso muchas más ternas y obtuvo globalmente menos aciertos
de los esperados bajo su propio control físico. La diferencia positiva
en junio-septiembre está concentrada en septiembre; no se
generalizó a otros tramos.

VT2 contenido sigue sin ser un evento adicional independiente.

## Qué sí demuestra
- Se consiguió la **arquitectura causal** de lectura de la tabla
  completa, incremental y autónoma respecto de D−7.
- No se necesitan inventar rutas físicas cruzando columnas.
- Un motor adaptativo puede consumir las marcas de cada turno cerrado,
  incluso hoy, antes de anticipar el siguiente.
- La corrección del reloj adaptativo impide que momentos sin sorteo
  causen decaimiento artificial.
- No necesitamos ampliar por defecto los cupos de candidatos.

## Qué NO demuestra
El piloto no ha descubierto el criterio VISUAL final con el que papá
seleccionaba pocas figuras. El adaptativo antiguo aplica pesos
heurísticos y estados experimentales; reusarlos sobre una fuente
mejor no asegura seleccionar bien VT3.
Los números de estos períodos históricos están contaminados por
exploración previa, no son validación prospectiva.

## Evidencia en GitHub
- Batería verde tras corrección del reloj:
  https://github.com/y0t3/Modelo-Papa/actions/runs/38028448287
- Tres ventanas del piloto VT3 con JSON por fecha, turno, columna
  y ruta, completadas correctamente:
  https://github.com/y0t3/Modelo-Papa/actions/runs/38028541669
- Auditoría previa de la disponibilidad de señales del día:
  https://github.com/y0t3/Modelo-Papa/actions/runs/38028091957

## Próximo paso — prioridad VT3 sin aumentar candidatos
Antes de cambiar pesos, examinar **cuáles fueron las figuras VT3
seleccionadas que fallaron**, qué evidencia tenían (hoy, ayer,
semana, turno y columna física) y qué figuras con apoyos visuales
comparables quedaron afuera.

No repetir la búsqueda exclusiva D−7 ni sumar todo lo físicamente
formable al Top3. Comparar las relaciones de movimiento real
entre columnas y jornadas, sin atribuir manualmente a papá rutas
que sólo fueron reconstruidas automáticamente.

Cualquier nueva regla debe congelarse antes de los resultados, tener
mismo presupuesto Top3, documentar su trayectoria física y enfrentarse
a un control aleatorio comparable y, después, a turnos prospectivos.
