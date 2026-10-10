# Modelo Papá — Atlas ocular de giros, sentidos, traslaciones y alternativas

Punto de control: 2026-10-10. Trabajo realizado sólo en `experimento-analisis-visual-5d`.

## Punto de partida y método

Continuación estricta del estudio de las hojas marcadas del **23, 24, 25, 26, 28, 29 y 30 de septiembre de 2026**. Cada hoja nace DESPUÉS de sus cabezas sorteadas, con **TODOS** los recorridos VT2/VT3/VT4 válidos, una sola columna por trazo y la cabeza COMPLETA registrada debajo. No se usan tableros vacíos para buscar pronósticos ni se inventan enlaces entre columnas.

La extensión `scripts/run-morphology-atlas7d.cjs` toma las hojas efectivamente reconstruidas por `scripts/run-visual-chain7d.cjs`; no descarga ni vuelve a interpretar resultados desde cero. Deduplica por modalidad+origen+celdas ORDENADAS, conservando todas las cabezas, jurisdicciones y turnos explicativos. Compara los dibujos de dos jornadas sorteadas y clasifica relaciones para el examen ocular, NO como puntuación:

1. **Misma huella:** misma columna, celdas y orden.
2. **Sentido invertido:** mismas celdas y columna, orden inverso.
3. **Traslación en el mismo origen:** mismos pasos, celdas desplazadas dentro del bloque de origen.
4. **Giro con extremo común:** misma columna e igual inicio O final, cambio del resto.
5. **Forma análoga en otro origen:** VT3/VT4 con pasos iguales en columnas distintas. Se comparan dibujos; NUNCA se une una celda de una columna con otra.

El atlas detecta bifurcaciones aparentes con varios giros desde un mismo extremo de VT3/VT4. Deben inspeccionarse: en un tablero pequeño son posibles relaciones abundantes y no equivalen a movimiento dirigido.

## Resultados comprobados con GitHub Actions

Ejecución exitosa: https://github.com/y0t3/Modelo-Papa/actions/runs/38042575705

Artefacto nuevo: https://github.com/y0t3/Modelo-Papa/actions/runs/38042575705/artifacts/11665973507

Abrir **`index.html`** dentro del ZIP. El visor conserva ambas hojas anteriores completas con todas las marcas en paralelo, más fichas de los dos trazos comparados. Se puede filtrar por tipo de transformación sin ordenar por supuesto acierto. Incluye **`ESTUDIO_DESCRIPTIVO.md`** con los 30 cortes previos al objetivo y **`ATLAS_RELACIONES.json`** con todas las relaciones y procedencias.

Los tests automáticos validaron sintaxis y clasificación básica: misma ruta, dirección inversa, traslado, giro, analogía sin cruces, no coincidencias, adyacencia y deduplicación. El visor HTML embebido también fue comprobado sintácticamente.

### Todos los pares de figuras catalogados por transición

| Comparación | Huellas antiguas distintas | Nuevas distintas | Exactas | Inversas | Traslaciones | Giros con extremo común | Analogías entre orígenes | Antiguas sin relación en el catálogo |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 23 → 24 | 38 | 62 | 7 | 4 | 38 | 39 | 1 | 5 |
| 24 → 25 | 62 | 45 | 9 | 4 | 39 | 69 | 2 | 17 |
| 25 → 26 | 45 | 46 | 1 | 2 | 21 | 17 | 2 | 14 |
| 26 → 28 | 46 | 71 | 6 | 6 | 29 | 61 | 1 | 11 |
| 28 → 29 | 71 | 37 | 3 | 5 | 36 | 47 | 4 | 26 |
| 29 → 30 | 37 | 58 | 8 | 4 | 28 | 41 | 5 | 6 |
| **Total de relaciones emparejadas** | — | — | **34** | **25** | **191** | **274** | **15** | — |

Total **539 relaciones** entre recorridos de pares consecutivos. **NO** son 539 pruebas independientes, ni confirman ninguna capacidad predictiva; un recorrido puede participar en muchas relaciones. Las 58 rutas únicas del 30 no contradicen las 63 trazadas: hay caminos coincidentes que explican varias cabezas y se deduplican para el análisis morfológico.

## Caso 29→30 que requiere examen VISUAL, sin leerlo como acierto anticipado

**Dos orígenes históricos de la terminación 778 en el 30:**

- **29/09 cabeza 4983, Primera, VT3=983**: misma huella ordenada `prevNocturno` `3:1→2:1→1:1` se lee `778` el 30; la cabeza **6778 de Matutina del 30** finalmente marcó VT3=778 por esa huella.
- **29/09 cabeza 7289, Matutino, VT3=289**: celdas `prevNocturno` `2:0→2:1→3:1`; la inversión física `3:1→2:1→2:0` lee también `778` en la tabla +11 del 30, y coincide con otra marca de la cabeza 6778 en Matutina.
- La lectura de `778` por esos dos trazos era físicamente posible ANTES de la Matutina, incluso antes de Primera; **pero nunca se congeló antes de ese sorteo como candidato preferido.** No es un acierto de pronóstico. La ruta original `2:0→2:1→3:1` se releía como `877` en el 30, otra alternativa visual.
- Atribuir un supuesto poder predictor a la inversión/reconvergencia sólo porque luego se verificó `6778` sería el mismo error de retroajuste señalado en el caso `0154:54→10:0910`.

## Resultado metodológico

Para el 29→30, entre **37 huellas antiguas únicas** y **58 huellas nuevas únicas** aparecen **86 parejas de relación** (8 exactas, 4 inversas, 28 trasladadas, 41 con extremo común y 5 analogías interorígenes). Sólo **6 de las 37** no exhibieron ninguna de las familias catalogadas. Ese panorama hace muy fácil hallar alguna semejanza después de conocer los resultados. Por lo tanto el atlas aún NO permite aislar cuál giro o inversión debió preferirse ANTES del siguiente sorteo.

El atlas compara también las marcas progresivas de HOY conocidas antes de cada uno de los 5 turnos, en 30 cortes. Esos cortes no contienen marcas del objetivo. Las relaciones con todas las marcas del día cerrado son específicamente **históricas retrospectivas**, no predicciones ciegas.

## Próximo experimento necesario

Sin promover todavía el `778` ni el `10`, construir una **revisión ciega a nivel de turno**, en la que todo lo ya conocido (HOJA MARCADA anterior + tabla +11 de hoy completa disponible + marcas de los turnos previos) aparezca junto, pero el resultado objetivo quede físicamente separado. Examinar todo el conjunto de alternativas: rutas normales, inversión válida, giros, desplazamientos y ausencia de señales. Registrar en archivo inmutable una justificación visual o **OBSERVAR/NO JUGAR**. Sólo después abrir resultados y medir tanto confirmados como no confirmados en VT2/VT3/VT4 de forma independiente. Para validación predictiva real serán necesarios turnos aún no sorteados al momento del registro.

No se modificaron el motor oficial, `main`, el selector congelado ni el código de la APK. Los nuevos archivos son sólo de investigación y visualización retrospectiva.
