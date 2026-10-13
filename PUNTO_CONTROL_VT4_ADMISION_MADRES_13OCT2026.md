# Punto de control VT4 · admisión de madres VT3 y recorridos físicos sin raíz

**13/10/2026 · rama `lab-vt4-admision-madres-13oct2026`**. Ejecuciones: [115 cortes (éxito)](https://github.com/y0t3/Modelo-Papa/actions/runs/38468710086), [Primera y Matutina 13/10 (éxito)](https://github.com/y0t3/Modelo-Papa/actions/runs/38469307277).

## Qué se hizo
Continuamos sobre el motor VT4 de **madre VT3 orientada** corregido (no se invierten cuaternas completas) sin tocar `src/motorLalo.ts`, `main`, app instalada, ni ningún sello oficial. Contraste físico completo de los 115 cortes históricos y análisis detallado de las cabezas del 13/10.

Se crearon tres inventarios **por caminos propios**, no sólo por las etiquetas de las familias:

1. **TOP10** — hijos de caminos VT3 realmente admitidos de madres #1 a #10.
2. **ADMITIDAS** — hijos de todas las rutas históricamente respaldadas VT3, incluso de madres #11 en adelante.
3. **FÍSICAS** — hijos de todos los caminos de tres casillas físicamente realizables, con clasificación explícita de rutas sin anclaje. Una ruta que sólo comparte dígitos con otra admitida **no hereda su raíz**. Las extensiones conservan la misma fuente y exigen las cuatro casillas contiguas, distintas, con lectura exacta.

Los grupos VT4 se identifican por **madre VT3 reversible, extremo de ampliación, cifra adicional y nivel físico de respaldo**. Los pares sólo son etiquetas; la evaluación de resultados utiliza exclusivamente valores de cuatro cifras **leídos en caminos reales**. Nunca cuentan dos veces los mismos valores de cuatro cifras en un Top10.

El workflow sacó físicamente `OBJETIVOS_POST_115.json` y el fixture completo antes de construir y sellar todos los Tops de las 7 políticas; verificó que `TOP10_CUPO2` reproduce **exactamente los Tops previos** de la prueba de diversidad de madres para los 115 cortes. El archivo `PRE_115.json` y su sello SHA256 quedaron versionados antes de restaurar los POST. Todo contiene diez plazas por corte.

## Resultado de las 115 comparaciones

| Política | Top3 | Top5 | Top10 | Madres diferentes medias | Plazas medias desde madres VT3 >#10 | Plazas físicas sin raíz medias |
|---|---:|---:|---:|---:|---:|---:|
| VT4 madre orientada sin diversidad | 0 | 0 | **0** | 1,287 | 0 | 0 |
| **TOP10, dos hijas por madre** | 0 | 0 | **4** | 5,000 | 0 | 0 |
| Todas las madres **admitidas**, igual cupo dos | 0 | 0 | **4** | 5,000 | 0 | 0 |
| Madres admitidas repartidas por estratos de puesto | 0 | 0 | 1 | 4,930 | **3,861** | 0 |
| Madres físicas repartidas por estratos (2 sin raíz) | 0 | 0 | 1 | 5,235 | 2,000 | **2,000** |
| Ocho hijas habituales + dos de madres sin raíz | 0 | 0 | 0 | 5,270 | 0 | **2,000** |
| Todas las madres físicas con prioridad antigua | 0 | 0 | 0 | 1,400 | 0 | 0 |

**Ampliar la bolsa de admitidas manteniendo prioridad/cupo dos no modificó absolutamente ningún Top10**: los 115 Tops son exactamente iguales. El cuello de botella es qué madres ocupan las plazas, no simplemente cuántas son elegibles.

**Reservar plazas para madres #11+ o sin raíz** sí modificó el Top10, pero no mejoró aciertos históricos. Los estratos recuperaron **15/09 Previa, cabeza `7175`**, con agrupación `7175/7571` derivada de madre con respaldo `175/571`, en puesto 8. Al mismo tiempo, las políticas de estratos perdieron **las cuatro** coincidencias de `TOP10_CUPO2`: 24/09 Previa `3159`, 03/10 Matutina `2592`, 10/10 Matutina `6542`, 10/10 Nocturna `2654`. Los dos cupos sin raíz no ganaron ningún corte adicional.

En todas las políticas, **Top3 = 0/115**. Mantener la lista de candidatos físicos y cambiar sólo su amplitud no produjo una selección históricamente convincente en las primeras tres plazas. Los sorteos son aleatorios y el mismo historial ya se investigó exhaustivamente, por lo que no hay base para promover estos métodos a producción.

## Primera del 13/10: qué pasaba con 5485
La cabeza **5485 Ciudad** sí deriva de rutas VT4 físicas con madres VT3 de respaldo **#5 `485/584` y #9 `548/845`**. La misma cifra exacta aparece en dos agrupaciones correctas, `5485/5584` y `5485/8455`, pero **no son dos aciertos independientes**. Ambas agrupaciones tienen **dos testimonios físicos** en la fuente Previa. Hay **94 agrupaciones en el pool nativo**, **478 con todas las madres admitidas** y **776 agrupaciones adicionales de rutas sin anclaje** (no son cabezas distintas).

Aun al permitir madres posteriores y dos plazas físicas sin respaldo, la cuaterna `5485` **no llegó a Top10 en ninguna de las siete políticas predefinidas**. Tampoco Top3 ni Top5. Sigue siendo un problema de **prioridad de una hija concreta frente a otras hijas legítimas** dentro de una madre admitida, no de admisión.

## Matutina del 13/10: por qué 1057 sigue excluida
El análisis se reconstruyó con las fuentes de antes del turno y comprobó **exactamente** el Top10 VT3, columnas y raíces del sello Matutino guardado a las 13:52 Argentina, hash `067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41`.

La cabeza **1057 Provincia**, con camino físico real en **Nocturna anterior**, se podía representar por **dos madres VT3 sin anclaje propio**:
- `105/501` produce agrupación VT4 de final añadido `1057/5017`;
- `057/750` produce agrupación VT4 de prefijo añadido `1057/1750`.

Se trata de **dos maneras de atribuir una misma cabeza a madres diferentes**, no de dos cabezas acertadas. La inspección contabiliza rutas físicas adicionales de cada agrupación, que pueden representar otros valores de la misma agrupación; nunca inventa una raíz D−1/D−7. **Ninguna madre de 1057 fue admitida en VT3**, por eso en el nivel ADMITIDAS no existe la candidata.

Abrir el pool a todas las madres físicas **sí permite registrar 1057 como candidata disponible**, pero **ninguno de los métodos que reservaba plazas para las sin anclaje la colocó entre sus diez primeras agrupaciones**. Había **104 agrupaciones nativas**, **660 bajo todas las madres admitidas** y **1.082 agrupaciones adicionales sin anclaje**, frente a sólo diez plazas. El problema, una vez que permitimos rutas sin raíz, deja de ser su existencia y pasa a ser **cómo distinguirla de miles de otras agrupaciones físicamente válidas**.

La evaluación del 13/10 es **una reconstrucción VT4 retrospectiva**, no un sello VT4 anterior a Primera/Matutina. El sello anterior al sorteo sólo incluía VT3. Montevideo `3629` coincidió con VT3 Top5; **no** fue acierto VT4.

## Diagnóstico final y decisión

1. La inversión de cuaternas ya se sustituyó en laboratorio por la **identidad madre VT3 + cifra fija + extremo**, respetando todas las formaciones físicas.
2. El **reparto de dos hijas por madre** es la mejor variante *de estos ensayos retrospectivos*: 4/115 Top10 y ninguna en Top3. Abrir la admisión sin cambiar prioridades no modifica nada.
3. Reservar plazas automáticamente para madres sin anclaje **no fue una mejora**: 0–1/115 frente a 4/115, pese a que explica por qué 1057 estaba disponible. Es esperable: hay muchas más candidatas físicas que diez plazas.
4. Para proseguir con hojas existentes conviene **no seguir ensanchando el inventario indiscriminadamente**. El siguiente experimento más informativo es analizar, en las cabezas históricamente ganadoras que sí tienen madres admitidas, **qué evidencia real de ruta, raíz o convergencia separa a una hija ganadora de sus hermanas físicas**. Se debe entrenar con un período y evaluar en otros, sin usar resultados del propio corte para elegir; también comparar contra controles neutrales para detectar memorización/azar.
5. **No introducir cambios automáticos en VT4 oficial ni la app todavía**. La corrección de identidad es estructural y legítima, mientras que el reparto sigue pendiente de prueba independiente.

## Archivos reproducibles
- `PROTOCOLO_VT4_ADMISION_MADRES_13OCT2026.md`
- `scripts/lab-vt4-admision-madres.mjs`, `scripts/lab-vt4-admision-13oct.mjs`
- `.github/workflows/lab-vt4-admision-madres.yml`, `.github/workflows/lab-vt4-admision-13oct.yml`
- `auditorias/vt4-admision-madres-115-13oct2026/PRE_115.json`, `SELLO.json`, `POST_115.json`, `RESUMEN.json`, `13OCT_POST.json`.
- [115 cortes: GitHub Actions #38468710086](https://github.com/y0t3/Modelo-Papa/actions/runs/38468710086)
- [Cotejo 13/10: GitHub Actions #38469307277](https://github.com/y0t3/Modelo-Papa/actions/runs/38469307277)

**Motor y app oficiales permanecen intactos.**
