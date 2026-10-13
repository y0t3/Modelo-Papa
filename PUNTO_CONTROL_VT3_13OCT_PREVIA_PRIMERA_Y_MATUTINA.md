# Corte de control VT3 · 13/10/2026: Previa y Primera, Matutina prospectiva sellada

**Fecha:** martes 13 de octubre de 2026. **Rama:** `lab-vt3-turnos-13oct2026-pre-primera-sello-mat`. Motor `src/motorLalo.ts` sin editar; VT3, VT4, sellos antiguos y app oficial intactos.

## Estado de resultados y cronología

Se confirmaron por fuentes publicadas las cabezas **Previa (10:15)** y **Primera (12:00)**:

| Jurisdicción | Previa | Primera |
|---|---|---|
| Ciudad | 6448 | 5485 |
| Provincia | 6337 | 0310 |
| Córdoba | 5546 | 8857 |
| Santa Fe | 5119 | 3385 |
| Entre Ríos | 1495 | 4084 |

La **Matutina** argentina está programada para las **15:00**; durante la ejecución todavía **no** se habían publicado sus resultados. Previa y Primera se reconstruyeron **después de conocerse**, y no corresponde denominarlas predicciones prospectivas selladas. El único **nuevo pronóstico previo** de esta prueba es Matutina.

Para reconstruir D−1 se completaron con cabezas ya publicadas las 5 jurisdicciones argentinas de los 5 turnos del lunes 12/10, ausentes del fixture histórico (que terminaba el 10/10). Fuentes: `quinielacorrentina.com/resultados-hoy/`, `tujugada.com.ar/quiniela_entre_rios.asp`, y páginas de resultados de Ciudad, Córdoba y Provincia. Para Montevideo 12/10 se mantuvo **ausente** (`----`), ya que no había una sexta cabeza verificable: no se inventó una cifra de la última fila, y esta ausencia podría afectar los recorridos cuando se disponga de ese dato. El antecedente D−7 se reconstruyó con el martes **06/10** y su hoja anterior del **05/10**; D−1 con lunes **12/10** y sábado **10/10**. Se mantuvieron fuente única, tres casillas vecinas y raíces comprobadas sin préstamo.

## Previa: cinco cabezas sin ruta física VT3

Familias finales Ciudad `448/844` (6448), Provincia `337/733` (6337), Córdoba `546/645` (5546), Santa Fe `119/911` (5119), Entre Ríos `495/594` (1495). **Ninguna** puede formarse en tres casillas físicamente vecinas sobre el tablero +11 disponible en PRE de Previa (Nocturna anterior).

Top3 Lalo: `226/622`, `266/662`, `305/503`.

Top10: `226/622`, `266/662`, `305/503`, `326/623`, `507/705`, `051/150`, `056/650`, `071/170`, `152/251`, `225/522`.

**Top3 0; Top5 0; Top10 0.** Este corte no se mejora reordenando familias: ninguna de las cinco es físicamente elegible.

## Primera: tres familias representables, una recuperada en Top5

Top3 Lalo: `226/622`, `305/503`, `507/705`.

Top10: `226/622`, `305/503`, `507/705`, `036/630`, **`485/584`**, `266/662`, `326/623`, `037/730`, `548/845`, `063/360`.

| Jurisdicción | Cabeza | Familia reversible | Presencia física | Admisión/ranking | Causa |
|---|---:|---|---|---|---|
| Ciudad | 5485 | **485/584** | **2 rutas** en Previa | **#5**; dos admitidas, raíces **D−1 + D−7** independientes | Fuera de Top3 por 1 fuente vs 2 fuentes del #3 |
| Provincia | 0310 | **013/310** | **1 ruta** en Nocturna anterior | física **sin admisión** | cero traslados/bifurcaciones con raíces propias |
| Córdoba | 8857 | **758/857** | **1 ruta** en Previa | **#42**; una admitida, raíz **D−7** | Respecto de Top3 primero pierde por ausencia de bifurcación; respecto de Top10 primero pierde por 0 raíces D−1 contra 1 del #10 |
| Santa Fe | 3385 | 385/583 | 0 rutas | sin puesto | físicamente ausente |
| Entre Ríos | 4084 | 084/480 | 0 rutas | sin puesto | físicamente ausente |

**Top3 0; Top5 1; Top10 1.** Se diferencian admisión (0310), ranking (8857) y acierto dentro de Top5 (5485). No confundir el valor `5485` con `548/845`; su VT3 es correctamente `485/584`.

Recorridos significativos de Primera:
- `5485` → `485`: rutas de fuente Previa celdas `1:0→1:1→0:0` y `1:0→1:1→2:0`; raíces históricas D−1: 12/10 Primera Ciudad/Provincia `9554` (según jurisdicción propia del dato) y D−7: 06/10 Vespertino `9226`. En el POST del motor ambos testigos comparten los dos eventos.
- `0310` → `013`: fuente `prevNocturno`, celdas `3:0→3:1→2:1`, válida sin anclaje.
- `8857` → `758`: fuente Previa, celdas `2:1→2:0→1:1`, raíz D−7 06/10 Nocturno `9476`.

## Matutina — PRE sellado antes del sorteo, no evaluado

**Sello con GitHub Actions:** `2026-10-13T16:52:03.733Z` = **13:52:03 hora Argentina**, anterior al sorteo 15:00.

**SHA256 del archivo Matutina PRE:** `067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41`.

Con Nocturna anterior, Previa y Primera conocidas, las tres columnas físicas nuevas son:
- `prevNocturno`: `62,26,53,01,75,--`;
- `Previa`: `59,48,57,30,06,--`;
- `Primera`: `96,21,68,96,95,--`.

Top3 VT3 ya fijado: **`226/622`, `305/503`, `699/996`**.

Top5: anteriores más `266/662`, `629/926`.

Top10: anteriores más `507/705`, `596/695`, `036/630`, `485/584`, `326/623`.

**No consultar ni evaluar Matutina como POST hasta después de las 15:00.** Este sellado permite una verificación verdaderamente prospectiva de las próximas cinco cabezas, distinta a la reconstrucción de Previa y Primera.

## Resumen y decisión

- Previa: 0/5 cabezas físicamente disponibles; error de cobertura geométrica, no simplemente de rango. No acierto Top3/Top10.
- Primera: 3/5 cabezas con familia VT3 físicamente representable; 2 admitidas por Lalo y una sin raíz; una acertó en **Top5** y Top10, pero ninguna en Top3.
- Global: **Top3 0/2; Top5 1/2; Top10 1/2** cortes históricos ya publicados. Denominadores por corte, no por cabeza.
- Matutina: sello PRE ya versionado antes de publicación (SHA indicado). Es el control útil siguiente. No hay mejora prospectiva validada de ranking ni cambios en VT3 oficial.

## Evidencias
- `scripts/lab-vt3-en-vivo-13oct2026.mjs`: lectura de fixture 30 fechas, D−1 verificado de 12/10, comparación por recorridos físicos, ninguna cifra futura del turno en PRE.
- `.github/workflows/lab-vt3-en-vivo-13oct2026.yml`: primero crea y sube sello Matutina PRE, y sólo después coteja Previa y Primera.
- `auditorias/vt3-en-vivo-13oct2026/MATUTINA_PRE_SELLADA.json` y `SELLO.json`.
- `PREVIA_PRIMERA_RECONSTRUIDAS_PRE.json` (reconstrucción posterior, **no** sello prospectivo).
- `POST_PREVIA_PRIMERA.json` y `RESUMEN.json`.
- GitHub Actions [38433967939](https://github.com/y0t3/Modelo-Papa/actions/runs/38433967939).

**Advertencia:** son sorteos aleatorios. La presencia de una familia en Top3/Top10 no implica ventaja predictiva garantizada.
