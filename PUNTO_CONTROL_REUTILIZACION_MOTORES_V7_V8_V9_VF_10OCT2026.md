# Auditoría de recuperación V7 / V8 / V9 / VF / VT0 — 10/10/2026

**Solo lectura y análisis. NO se alteró ningún motor, selector, APK, main ni rama de rediseño.** Revisado en Library: `motor_v7.py`, `motor_v8_parcial.py`, `motor_v9.py`, `predecir.py`; y repos `y0t3/VF-Quiniela` (`src/engine.ts`, `src/vt0.ts`, `src/vt0Board.ts`, `src/vt0HistoricalMatcher.ts`) y `y0t3/Modelo-Papa`.

## Problema físico demostrado, no supuesto

Se ejecutó el enumerador **original V7 `candidatos`** sobre la foto PRE auténtica del 10/10 antes de Primera (captura 10:53:58 ART: run `38057490657`). Tablero fuentes `prevNocturno`: 37,55,63,47,65,42 y `Previa`: 67,51,93,18,72,--.

- **624** recorridos dirigidos VT3 generados por V7; **328 válidos** dentro del mismo par de turno y **296 inválidos por cruce** (**47,4 %**).
- **289** ternas diferentes, de las cuales **81 solo aparecían por cruzar columnas indebidamente**; **175 ternas** poseen al menos un camino cruzado.
- V8 y V9 importaban `candidatos` de V7; el `engine.ts` de VF-Quiniela replica la misma enumeración sin restringir `Math.floor(c/2)`.
- En los **94 candidatos** de la columna inicial, los 94 persisten automáticamente cuando se incorpora la siguiente fuente, sin necesidad de una cabeza ganadora. Por tanto `persist` de V9 es **persistencia en la grilla acumulada**, no reconfirmación de resultado entre días/turnos.

Esta prueba **NO implica que el enumerador de `Modelo-Papa` esté mal**: `src/paths.ts` busca dentro de una única fuente de dos columnas. El fallo corresponde a las versiones antiguas de V7/V8/V9 y el enumerador VF viejo.

## Qué se puede rescatar

| Motor | A favor | Límite y acción |
|---|---|---|
| **V7** | `mas11`, fuentes y frecuencias como metadata | Tabla +11 ya existe. **No** importar `candidatos`, `rankear` ni modelo entrenado con figuras cruzadas. |
| **V8 Parcial Corregida** | `metricas`: proporción C0, cobertura de fuentes, trazos horizontales, número de rutas | Recalcular con rutas válidas para **ver distribución de recorridos**, NO importar su fórmula de score `0.55/0.30/0.05/0.10`. |
| **V9 Temporal** | `birth`, `persist`, `gains`, `source_gain`, `stale` como vocabulario visual | Separar **apareció en columna** vs **fue confirmado por una cabeza posterior**. No usar `conviccion` ALTA/MEDIA/BAJA como probabilidad. |
| **VF V11/V13/V14** | Trazabilidad de las salidas y alternativas; *informar* el desacuerdo | No activar selector, meta-ranking ni Dual Gate: entrenados con features potencialmente contaminadas, consenso no tuvo beneficio estable. |
| **VT0** | `geometrySignature` y firmas reversibles, `geometryCalibration`, `validateMarkedTraces` | Adaptar la firma a `VT|sourceId|geometría canónica`; validar **orden real de celdas**, dirección y fuente. El extractor VT0/VT0HistoricalMatcher también puede cruzar fuentes si se utiliza sin segmentación. |

## Duplicidades y posibles correcciones futuras en el motor visual ACTUAL

1. `src/routeLife.ts` agrupa VT3 únicamente por desplazamientos; sin `sourceId` fusiona fuentes físicamente independientes. **No incorporarlo como filtro ni score**.
2. `src/routeLineage7d.ts::relationOf` usa la secuencia `cells.join('>')` para la categoría exacta. Una huella recorrida al revés podría clasificarse como distinta aunque se trate del mismo dibujo. La firma física canónica de VT0 aporta solución potencial.
3. `src/routeHistory.ts` ya almacena fuente por plantilla, y `src/paths.ts` respeta un solo origen: mejor reutilizar este enumerador, no reemplazarlo.
4. `src/analysisEngine.ts` **no** usa `RouteLife` directamente y permanece congelado. Estados homónimos de `predictive.ts` y `routeLife.ts` no significan lo mismo.
5. `src/dates.ts::previousDrawDay` ya evita el domingo; no incorporar otra función duplicada de VT0Board. Para feriados y días sin resultados, seguir verificando ausencia de fuentes.

## Orden recomendado de pruebas, sin modificar motor ni APK

1. Verificar equivalencia entre cada figura histórica físicamente válida y `paths.ts`; prohibir cada cruce y preservar inversa y todas las alternativas.
2. Hacer visor **informativo** de métrica V8: densidad y distribución por origen/modalidad/zona/contacto; sin elegir ninguna cabeza ni aportar pesos.
3. Ensayar ciclo V9 en un módulo independiente: nacimiento de fuente, continuidad geométrica y **reconfirmación por cabeza ganadora**, todos eventos distintos; mostrar D−1 y D−7 separadamente, ventana reciente aproximada de cinco días.
4. Probar clasificación por firma VT0 y canon reversible contra hojas históricas, incluyendo **todas** las pérdidas, inversiones, cambios de orientación y figuras repetidas.
5. Luego prueba prospectiva ciega con figura **y sentido elegidos antes** del sorteo, o abstención, y contraste completo contra línea base; nada se transfiere al selector sin ventaja fuera de muestra.

**Decisión recomendada:** rescatar herramientas de observación de V8+V9+VT0, conservar motor geométrico actual y NO combinar clasificaciones ni rankings históricos como si tuvieran precisión demostrada. Nota completa disponible en archivo de auditoría generado en la conversación: `AUDITORIA_REUTILIZACION_MOTORES_V7_V8_V9_VF.md`.
