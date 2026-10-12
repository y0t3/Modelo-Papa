# Modelo Papá — Evaluación cronológica VT3 sin utilizar cabezas futuras

**12/10/2026. Prueba completa, auditada y reproducida sobre 23 fechas y 115 cortes ya guardados.** Rama experimental `auditoria-sorteo-10oct-2026`, sin modificar `main`, motor V7–V14, hoja +11, marcado automático, Top oficiales ni APK. Se conserva VT3 como objetivo independiente, antes de VT4.

## Precaución central contra una falsa validación

Se tomaron seis **rankings PRE previamente congelados** en laboratorios ya efectuados sobre el mismo corpus. Se reprodujo cronológicamente qué criterio se habría aplicado cada día, usando **únicamente el historial de resultados de fechas anteriores**. **Se sellaron los cinco turnos completos de cada fecha antes de incorporar cualquier cabeza objetivo de ese mismo día.** Los cinco primeros días del 15 al 19 de septiembre forman historial; se informan por separado **90 cortes de evaluación del 21 de septiembre al 10 de octubre (18 fechas ×5)**. También se preservan los 115 cortes completos.

**Advertencia de sesgo de investigación:** los seis criterios habían sido diseñados, comparados y seleccionados como objetos de estudio **mirando retrospectivamente los resultados de estas mismas fechas**. Aunque el software de reproducción sí impide leer cabezas futuras mientras decide, las elecciones iniciales de políticas no provienen de un conjunto de entrenamiento realmente independiente. Es un **replay cronológico con separación operativa**, **NO** prueba de pronóstico prospectiva ni *holdout* ciego externo. No presentar resultados como ventaja real en un proceso aleatorio.

## Menú PRE congelado

1. `D7`: bifurcaciones de tramos trasladados de cabezas históricas D−7.
2. `D1`: traslado de huellas confirmadas de la última jornada operativa.
3. `BLOQUES`: bifurcaciones deduplicadas por conjuntos de tres casilleros.
4. `RAICES`: cantidad de cabezas antiguas completas distintas.
5. `RAMAS`: bifurcaciones ponderadas por amplitud del abanico descendiente de una raíz.
6. `NACIENTE`: lugares donde empieza una bifurcación nueva en relación con la misma raíz en jornada anterior.

Se añadieron cuatro reglas de agregación **sin incorporar ninguna familia extra al cupo**:
- `LEADER_ALL`: elegir diariamente entre los seis criterios la política con más aciertos Top10 acumulados en **fechas pasadas**; desempate fijo a `D7` y después al orden original.
- `LEADER_LAST5`: idéntico, sólo últimas cinco fechas anteriores.
- `LEADER_TURN`: sólo turnos homónimos de fechas anteriores (no usa otros turnos del mismo día).
- `MIX_D7_D1`: ranking por suma de recíprocos de posiciones para las listas D7/D1, máximo **3, 5 o 10 familias VT3**. No equivale a unir dos Top10 en uno de 20.

## Resultados del período de evaluación (90 cortes, no 115)

| Política de familia VT3 | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| D−7 fijo | **3** | **6** | **11** |
| **D−1 fijo** | **6** | **9** | **13** |
| D−7 por bloques | 3 | 6 | 10 |
| Cabezas históricas distintas | 0 | 2 | 7 |
| Ramas ponderadas | 2 | 5 | 11 |
| Ramas nacientes | 5 | 5 | 8 |
| **Líder de aciertos acumulados** | 5 | 7 | **11** |
| Líder últimas cinco jornadas | 4 | 6 | **11** |
| Líder con sólo historial del turno | 2 | 4 | **7** |
| Fusión de D−7/D−1 en mismo cupo | 5 | 8 | **12** |

En la comparación de los **115** cortes, D7 **5/8/16**, D1 **9/13/18**, selector acumulado **7/9/15**, reciente **6/8/15**, por turno **4/6/12**, fusión **7/11/17**.

### El comportamiento cambia por período

- **21–30 septiembre:** 45 cortes; Top10 D7=**5**, D1=**10**, selector acumulado=**8**, fusión=**7**.
- **01–10 octubre:** 45 cortes; D7=**6**, D1=**3**, selector acumulado=**3**, fusión=**5**.
- La política acumulativa optó por D1 en **85** de 90 cortes evaluados; tardó en adaptarse al cambio de octubre. La política reciente optó D7 en 50 y D1 en 40, pero **tampoco** mejoró.
- Top10: **6** cortes ambos métodos D7/D1 acertaron, **7** sólo D1, **5** sólo D7, **72** ninguno. La unión informal de ambos Top10 alcanzaría 18 cortes **con el doble de presupuesto**; no debe compararse contra Top10 ni contarse como política válida de 10 familias.
- Comparación pareada D1 vs D7: sólo 7 victorias exclusivas frente a 5 derrotas exclusivas, binomial nominal bilateral **0,774** (descriptivo). No hay prueba robusta de mejora.
- En **83/90** cortes ambos métodos disponían de diez familias, y D7 tenía menos en los otros siete. Al igualar estrictamente presupuesto por corte a `min(cupo, len(D7), len(D1))`, los aciertos D7 **11** y D1 **13** en Top10, **3/6** en Top3, **6/9** en Top5 **no cambiaron**.
- Remuestreo descriptivo por **18 jornadas completas**: líder acumulado menos D1 Top10 **[−6,0]**, fusión menos D1 **[−7,+4]**. Ninguno supera el observador fijo.

## Prueba de aislamiento reproducible verdaderamente secuencial

**Archivo ZIP adjunto en la conversación:** `modelo-papa-vt3-evaluacion-cronologica-115-cortes-12oct2026.zip`, **47 entradas**, **1.987.550 bytes**, SHA256 **`cfbbf821c8185737c0f3772860f158a6555705476aae23a9317c31b20d976f93`**. ZIP íntegro, extracción y reproducción independientes verificadas.

Incluye seis fuentes PRE **congeladas**, `RESULTADOS_POST.json` separado, `analizar.py`, `paso.py`, `reproducir_aislado.py`, `visores.py`, pruebas de Chromium, PRE de seis listas para los 115 cortes, **23 folios PRE sellados** con cinco turnos cada uno, resumen POST 115 cortes, CSV, informe, manifiesto SHA256, dos visores HTML offline y capturas.

- SHA256 `RANKINGS_CONGELADOS_PRE.json`: `59f85946d26a1c39908d80a010abd2d8b6f61feb9a85138cdfafbb4743b1e934`.
- SHA256 `CRONOLOGICO_POST.json`: `d090668e7b097e6ae3790cbb23a2608643aa066d9dcd4f5879fccaac9fe82df5`.

**Se probó en carpeta temporal nueva extraída del ZIP:**
1. Reconstruir desde los seis insumos PRE los mismos 115 órdenes, sin introducir ningún archivo POST.
2. Para cada una de las 23 fechas, generar el folio completo **sin que exista en la carpeta el archivo resultado de la fecha actual o futura**; comparar bytes con el folio PRE original.
3. Sólo una vez selladas las cinco decisiones de ese día introducir `RESULTADO_HOY.json` con esa fecha, calificar, conservar únicamente su resultado dentro de un historial cerrado y quitar el archivo antes del día siguiente.
4. Verificar **115 decisiones y POST iguales**, generar también el **visor PRE con todos los resultados POST finales ausentes**, y verificar su hash exacto.
5. El ZIP extraído por separado pasó los mismos controles; se compararon cuatro hashes principales idénticos. Ambos visores se probaron con Chromium/Playwright, día 05/10 Matutino, ranking D7 con `729/927`, filtros de fecha, turno, regla y cupo, con **cero errores JavaScript**.

El PRE sólo expone familias propuestas y qué criterio quedó elegido sobre historial anterior. El POST añade las cabezas objetivo después del cotejo. Los folios no son marcas predictivas manuales sobre la hoja original; son salidas del observatorio experimental.

## Decisión

**No introducir un selector de criterio por aciertos recientes al motor oficial.** Conservar D7 y D1 como dos observadores distinguibles y registrar siempre los Tops como familias VT3 reversibles con trazos físicos legibles. Este ensayo hace explícita la deriva entre septiembre y octubre, pero no descubre una regla confiable para elegir de antemano qué observador será acertado. Seguir experimentando con geometrías usando los datos existentes, preservando controles negativos y sin pasar aún a sumar cifras VT4.
