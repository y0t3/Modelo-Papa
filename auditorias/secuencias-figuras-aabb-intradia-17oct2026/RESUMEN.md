# Trayectorias geométricas comprobadas A→A→B y A→A→B→B (17/10/2026)

**Estudio retrospectivo, sin modificar Modelo Lalo MV1, Geometría Completa, VT4 ni la APK.**
Ejecución exitosa: https://github.com/y0t3/Modelo-Papa/actions/runs/39027361643

## Pregunta concreta

El padre identifica **una figura de casillas**, no un número. Solo sigue figuras que realmente explicaron cabezas sorteadas; las busca en el nuevo tablero +11 y lee **las nuevas cifras** dentro de sus recorridos válidos. La figura puede aparecer dos jornadas en una fuente, pasar a otra fuente durante otras dos, y luego cambiar o desaparecer.

Se analizaron por separado:
- **DOS_SEGUIDAS**: misma figura y fuente explicaron cabezas en las **dos jornadas reales inmediatamente anteriores**.
- **AAB**: la figura explicó cabezas en dos últimas fechas activas en una fuente A y en la más reciente en otra fuente B, que debe ser la fuente de lectura PRE. La última fecha activa debe coincidir con la jornada real inmediatamente anterior.
- **AABB**: dos jornadas activas en fuente A seguidas de dos en B (últimas cuatro fechas de actividad de esa figura), con nueva lectura PRE en B.
- **INTRADIA**: figura comprobada en la misma fuente por una cabeza de **un turno anterior del mismo día**; nunca se utiliza la cabeza del turno objetivo.
- **DOS_E_INTRADIA**: dos últimas jornadas consecutivas en la misma fuente y refuerzo comprobado hoy antes del objetivo.

**Control estricto de fases:** cuando una figura tiene marcas comprobadas en varias fuentes **en el mismo día**, AAB/AABB exigen una única fuente por cada fecha de la secuencia. Se registra la ambigüedad en lugar de adjudicarle la fuente arbitrariamente. Las fechas sin sorteo no se inventan; se usan las jornadas completas reales disponibles, incluida Nocturna válida de Montevideo para armar el siguiente +11. Inversiones de un mismo recorrido no duplican su figura.

## Muestra histórica

- **104 jornadas / 520 PRE**, repartidos en 51 jornadas junio-julio (255 cortes) y 53 jornadas 15/agosto–15/octubre (265 cortes).
- 2.600 cabezas de las cinco jurisdicciones argentinas y **654 exposiciones de cabezas VT3 físicamente trazables** antes del sorteo. Montevideo es **fuente de columna +11**, no sexto objetivo.
- El histórico corregido conserva los parciales uruguayos (20/06 y 09/07) y dos PRE sin ninguna terna VT3; se mantienen en el denominador.
- Cada familia posible actual se deriva de **tres casillas realmente adyacentes de una sola columna** y se agrupa como familia reversible. No se marcan trazos como ganadores por su mera disponibilidad en el tablero.

## Resultado de rankings históricos

Un Top3 en esta tabla significa **hasta tres familias** cuando existe la secuencia; el resto de los PRE queda sin candidato para esa regla. No son Top3 de igual cobertura sobre los 520 cortes.

| Selección | Cortes con al menos una familia | Coincidencias Top3 junio-julio | Top3 agosto-octubre | Top3 total |
|---|---:|---:|---:|---:|
| DOS_SEGUIDAS | 319/520 | 5 | 9 | **14** |
| AAB | 201/520 | 6 | 4 | **10** |
| AABB | 43/520 | **2** | **0** | **2** |
| INTRADIA | 325/520 | 5 | 5 | **10** |
| DOS_E_INTRADIA | 45/520 | 1 | 0 | **1** |
| **Modelo Lalo oficial** | 520 PRE evaluados | 7 | 6 | **13** |
| **Geometría Completa** | 520 PRE evaluados | 6 | 11 | **17** |

Geometría Completa sigue encontrando más cabezas en Top3 sobre el histórico completo. El 2/43 de AABB **no** puede compararse directamente con 17/520 sin considerar que son muestras de disponibilidad y tres puestos distintos; el fenómeno de AABB además está concentrado en el bloque temprano.

## Controles contra figuras igualmente disponibles, no ganadoras

Dentro del mismo PRE se comparan familias con y sin la fase buscada, emparejadas por primera fuente, fuente del testigo PRE y banda de cantidad de caminos físicos. Para DOS_SEGUIDAS, AAB y AABB también se iguala la banda del número de jornadas con comprobación histórica en la fuente (`0,1,2,3+`) para controlar **cantidad de apoyo frente a orden temporal**. Se excluyen estratos donde uno de los dos grupos no existe.

| Marca previa exigida | Familias ganadoras observadas en estratos comparables | Valor neutral esperado | Diferencia |
|---|---:|---:|---:|
| DOS_SEGUIDAS | **17** | 18,14 | −1,14 |
| AAB | **9** | 11,84 | −2,84 |
| AABB | **3** | 1,75 | +1,25 |
| INTRADIA | **51** | 53,99 | −2,99 |
| DOS_E_INTRADIA | **2** | 3,25 | −1,25 |

En **AABB** solo hubo 96 estratos mixtos a lo largo de los 520 PRE, con 3 coincidencias frente a 1,75 esperadas; un exceso de **1,25 cabezas**, demasiado pequeño para establecer ventaja. Los demás signos no favorecen ninguna regla de manera estable. Estos controles son **descriptivos**: hay dependencia entre turnos de una misma jornada y selección repetida de hipótesis en este mismo histórico.

## Dos historias físicas AABB verificadas

### Caso 1: 06/06 Previa, cabeza posterior **6861**

La forma geométrica es `-1,0 ; -1,1` (pasos canónicos, equivalentes por inversión del recorrido), con cuatro jornadas de actividad comprobada por cabezas distintas:

1. **02/06**, Nocturna de Ciudad **8244**, figura comprobada en la fuente +11 **Matutino**, casillas `4:0 → 3:0 → 2:1`.
2. **03/06**, Nocturna de Provincia **6951**, misma figura y fuente **Matutino**, casillas `2:0 → 1:0 → 0:1`.
3. **04/06**, Matutina de Ciudad **3836**, misma figura comprobada en la fuente **Nocturna anterior**, casillas `5:0 → 4:0 → 3:1`.
4. **05/06**, Vespertina de Córdoba **3532**, misma figura y fuente **Nocturna anterior**, casillas `3:0 → 2:0 → 1:1`.

**PRE del 06/06 Previa:** en la columna +11 **Nocturna anterior** aparece la misma figura, ahora en las casillas `1:1 → 2:0 → 3:0`, que leen **168**; su familia es **168/861**. La cabeza publicada después fue **6861**, terminación **861**. Es un acierto de familia VT3, **no** un 4 cifras exacto ni una repetición numérica histórica.

### Caso 2: 08/06 Nocturna, cabeza posterior **8442**

La figura es `-1,1 ; -1,-1`. Sus últimas cuatro jornadas con una única fuente activa fueron:

1. **03/06**, Vespertina de Entre Ríos **7500**, figura comprobada en fuente **Previa**, recorrido `3:0 → 2:1 → 1:0`.
2. **04/06**, Matutina de Ciudad **3836**, figura comprobada en fuente **Previa**, recorrido `0:0 → 1:1 → 2:0`.
3. **05/06**, Primera de Entre Ríos **3311**, figura comprobada en fuente **Nocturna anterior**, recorrido `2:0 → 3:1 → 4:0`.
4. **06/06**, entre otras coincidencias reales, Previa de Provincia **4788** y Primera de Córdoba **3618** explican la misma figura en **Nocturna anterior**.

**PRE del 08/06 Nocturna:** figura en **Nocturna anterior**, casillas `2:0 → 3:1 → 4:0`, nuevas cifras **244**, familia **244/442**; cabeza posterior **8442**. El 07/06 no se inventa como jornada de sorteo.

Son pruebas auditables de que **la interpretación física solicitada es reproducible**. No bastan para declarar un modelo con eficacia futura.

## Decisión y siguientes límites de investigación

- **Sí:** el orden de manifestaciones comprobadas, incluyendo trayectorias AABB con cambio real de fuente, puede reconstruirse sin conocer el sorteo futuro. Guardar foto de fuente, cabeza antigua y caminos concretos.
- **No:** la simple regla AABB, repetición de dos días o repetición intradía mostró suficiente separación contra controles negativos o aumentó el rendimiento global frente a Geometría Completa.
- **Próximo paso justificado:** caracterizar **episodios** de actividad completa de figuras, respetando días con ausencia, bifurcaciones geométricas realmente ganadoras y superposición entre fuentes el mismo día, con controles negativos semejantes. En una evaluación nueva deben fijarse las reglas antes de examinar un período fuera del histórico usado para desarrollarlas. No inventar un ranking mágico ni alterar MV1.
- En el tramo **agosto-octubre no hubo coincidencias Top3 AABB**: esto limita fuertemente una posible generalización. No presentar el caso de junio como garantía o tendencia.

## Reproducción

- [GitHub Actions 39027361643](https://github.com/y0t3/Modelo-Papa/actions/runs/39027361643), ejecución completada.
- `scripts/lab-figuras-secuencias-reales.ts` y `scripts/lab-figuras-comprobadas-a-pre.ts` en rama `lab/secuencias-figuras-aabb-intradia-17oct2026`.
- Artefacto `LAB-FIGURAS-FASES-AAB-AABB-520` → `FIGURAS_COMPROBADAS_A_PRE_520.json`, con 520 cortes, Tops, coordenadas y controles positivos/negativos.
- **`main`, motores y APK no modificados.**
