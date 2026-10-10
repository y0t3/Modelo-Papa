# Modelo Papá · Diagnóstico: VT3 elegidos vs. omitidos por la lectura viva
Fecha de corte: 2026-10-10. Rama: \`experimento-analisis-visual-5d\`.

## Pregunta y límites
¿El lector adaptativo que interpreta la tabla +11 progresiva elige mejores
candidatos VT3 que una elección aleatoria de **igual presupuesto dentro de
exactamente el mismo conjunto de ternas que ya considera**?

Esta auditoría **NO cambia pesos, estados, cupos ni la lista Top3**.
Tampoco incorpora las ternas físicas que nunca entraron a su memoria.
No necesita D−7; lee las columnas presentes antes de cada turno,
las cabezas comprobadas de HOY y marcas anteriores disponibles.

## Instrumentación sin modificar selecciones
- \`src/adaptive7d.ts\` acepta opcionalmente
  \`{inspectVT3Pool:true}\`: devuelve la lista completa de valores VT3
  únicos clasificada con el orden ORIGINAL, antes de cortarla al Top3.
  Sin ese parámetro devuelve exactamente lo mismo que antes.
- \`src/vt3SelectedVsExcluded7d.ts\` añade RASGOS descriptivos
  calculados antes del sorteo: misma forma y columna de HOY, mismo
  recorrido/celdas, contacto, ramificación, misma forma en otra
  columna, sufijo VT2 físico coincidente, día anterior, D−7 y zona.
  Las figuras pueden compararse entre columnas, pero cada ruta es
  físicamente interna a su columna.
- \`scripts/test-vt3-selected-vs-excluded7d.cjs\` verifica
  integridad del ranking, Top3 idéntico, causalidad e historial.
- \`scripts/run-vt3-selected-vs-excluded7d.cjs\` compara
  cronológicamente cada turno y documenta primeros 20 ejemplos
  omitidos en orden de fecha, sin elegir anécdotas favorables.
- \`.github/workflows/vt3-chosen-omitted7d.yml\` ejecuta los
  tres períodos con JSON por fecha, turno, figura, fuente,
  coordenadas, señales y resultado real.

## Resultado: mismas candidatas originales, sin nuevo motor
| Período | VT3 considerados por adaptativo | Seleccionados Top3 | Aciertos Top3 | Terminaciones ganadoras DENTRO del conjunto | Ganadores dejados afuera | Esperanza aleatoria con igual Top3 y mismo conjunto |
|---|---:|---:|---:|---:|---:|---:|
| 2025 | 39364 | 4305 | 18 | 207 | 189 | 20.384 |
| Ene–may 2026 | 15633 | 1677 | 3 | 63 | 60 | 7.314 |
| Jun–sep 2026 | 12643 | 1386 | 11 | 66 | 55 | 7.343 |
| **TOTAL** | **67640** | **7368** | **32** | **336** | **304** | **35.041** |

Esta comparación aleatoria conserva para CADA turno:
- cantidad exacta de candidatas que el motor habría publicado (≤3);
- conjunto de ternas físicamente válidas que ya eran elegibles;
- cantidad de terminaciones ganadoras que coincidieron con ese conjunto,
  conocida SOLO después del sorteo.

Su esperanza por turno es
\`candidatas_elegidas × (ganadores_en_pool / tamaño_pool)\`.
La esperanza acumulada no implica sortear ni jugar las candidatas excluidas.

**La prioridad actual obtuvo 32 frente a ~35,04 esperadas con selección
uniforme de igual cupo sobre SU PROPIO POOL.** No se observa ventaja
generalizable. En 2025 y principios de 2026 quedó por debajo;
junio-septiembre estuvo por encima, pero es un tramo explorado y
esa diferencia no se replica en el resto.

**La existencia de 304 ganadores omitidos se descubrió AL FINAL y no
demuestra que sepamos identificarlos antes.** Tampoco demuestra
que expandir candidatas sea conveniente. El usuario no desea
aumentar la cantidad: conservar Top3 VT3 como objetivo.

## Por qué los rasgos observados aún no dan regla
Dos ejemplos de evidencia descriptiva, SIN nueva clasificación:
- «Misma forma y origen en HOY»: 2025 elegidos 10/2250 y
  omitidos 95/16412; ene-may 2026 elegidos 0/876, omitidos
  34/6531; jun-sep 2026 elegidos 7/729, omitidos 30/4978.
- «Mismo tipo de forma y origen AYER»: 2025 elegidos 11/2817
  y omitidos 107/19908; ene-may 2026 elegidos 3/1131,
  omitidos 30/7829; jun-sep 2026 elegidos 8/909,
  omitidos 28/6655.

Son recuentos de CANDIDATAS que exhiben el rasgo, no sorteos
independientes. Se solapan entre sí, y las frecuencias son pequeñas.
No se justifica asignar más puntaje a una etiqueta porque
funcionó en un tramo aislado.

**Distinguir asimismo:** 336 ganadores estaban en el conjunto
adaptativo, mientras muchos otros VT3 reales no pertenecían
a ese conjunto. La exploración visual no debe fabricar
rutas ni ampliar automáticamente el cupo para cubrirlos.

## Decisión
1. No modificar ranking adaptativo por estos ejemplos retrospectivos.
2. Preservar VT3 prioritaria, VT2 independiente y VT4 extra etiquetado.
3. Preservar las cinco columnas +11 progresivas y la causalidad por turno,
   con D−7 como memoria opcional.
4. La fase siguiente debe formular UNA hipótesis visual claramente
   distinta de un simple conteo de marcas (por ejemplo,
   transición cualitativa observable de forma, orientación,
   zona y bifurcación entre COLUMNAS/JORNADAS), fijarla antes
   de probarla, mantener Top3 y registrarla prospectivamente.
5. No declarar motor final ni ventaja frente al azar sin
   resultados posteriores al congelamiento.

## Evidencia ejecutada
- https://github.com/y0t3/Modelo-Papa/actions/runs/38029166541
- Archivos fuente y test indicados arriba, todos en la rama
  \`experimento-analisis-visual-5d\`.
- \`main\` y APK no incorporan esta instrumentación experimental.
