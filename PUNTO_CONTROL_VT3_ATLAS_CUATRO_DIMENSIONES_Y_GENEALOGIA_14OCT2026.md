# Punto de control — Atlas multidimensional y genealogía verificada VT3
**14/10/2026 · 115 cortes retrospectivos · rama `lab-vt3-atlas-cuatro-dimensiones-14oct2026`.**

## Objetivo
Contrastar la propuesta de cuatro dimensiones A/B/C/D sin confundir reaparición física con trayectoria predictiva. Se enumeraron los recorridos propios de cada fuente, sin cruce entre columnas, con inversiones exclusivamente de terna VT3. Se distinguen dos niveles: semejanza geométrica disponible antes del sorteo y vínculo con huella de una cabeza históricamente comprobada.

## Nivel I: atlas de eventos físicos
- 23 fechas, 115 cortes, **27.900 eventos físicos de recorrido**, **15.273 registros familia×corte**.
- A, traslado de firma dentro de fuente con otra familia en jornada previa: **14.586 exposiciones, 137 ganadoras**; 95,5 % de los registros. Saturación de geometrías en 6×2, prácticamente sin capacidad discriminante.
- B, misma forma y familia en dos fuentes: **251 / 2**.
- C, misma forma con otra familia en D−7 exacto: **11.396 / 103**. Frecuente; al emparejar los negativos no quedó contraste útil en los estratos definidos.
- D, cambio de una casilla y de firma de la misma familia y fuente: **597 / 5**.
- Emparejamiento estratificado: B observado 2 vs esperado 2,75; D observado 5 vs 5,2511. No hay mejora convincente.
- Score de cuatro dimensiones, tercer puesto entre #3–#10: **5/115 Top3, 8/115 Top5, 15/115 Top10**, idéntico al oficial. Sorteo uniforme neutral Top3: promedio 6,367/115.
- Score multidimensional, sustituyendo sólo el puesto #10 por familia física no anclada: **15/115 Top10**, igual al oficial; selección uniforme entre elegibles promedio **15,8655/115**. Control hash logró 16/115 por azar, no señal.
- Los 115 cortes y la elección del selector son retrospectivos; el movimiento aparente no confirma probabilidad superior.

## Nivel II: genealogía desde huellas históricamente ganadoras
- En los mismos cortes: **6.389 registros de familias ancladas**, **16.176 vínculos huella antigua→camino actual**, **582 rootIds históricos distintos**. Los vínculos comparten raíces; NO son 16.176 sorteos independientes.
- Cada vínculo se reconstruyó desde rootId con fecha antigua, cabeza completa, turno, jurisdicción, fuente y tres celdas antiguas. Se comprueba que la fecha es anterior y la geometría respeta contacto físico. En PRE no se leyó el resultado del objetivo.
- Mutación estructural respecto de raíz: **2.644 exposiciones, 28 ganadoras**. Emparejadas observadas 14 vs esperadas 16,2673.
- Traslado rígido de raíz confirmado de **dos o más filas**: **3.157 exposiciones, 37 ganadoras**. Entre estratos comparables, observadas **32** vs esperadas **27,5855**, en 55 estratos mixtos. Descriptivo exploratorio sin p-valor confirmatorio.
- Traslado D−7 de dos o más filas: **1.685 exposiciones, 16 ganadoras**; observadas 13 vs esperadas 11,9295.
- Varias cabezas históricas independientes respaldando una misma familia: 1.935 exposiciones, 19 ganadoras; 10 vs 9,6081 esperado.
- Cambiar las cifras del número histórico: 6.389/6.389 registros anclados, por construcción; no permite seleccionar.
- Selector de genealogía para tercer puesto: **6 Top3 / 9 Top5 / 15 Top10** frente a **5/8/15 oficial**. 2.000 controles neutrales de la misma plaza: Top3 medio 6,375, cola ≥ 6: 0,7696. Una mejora retrospectiva de un corte NO demuestra ventaja.
- Puesto #10 anclado desde #11–#30: **15/115 Top10** (0 mejoras), neutral promedio 15,61.
- Precaución especial: ya se ha probado numerosas reglas en estas mismas fechas, lo cual aumenta el riesgo de hallazgos retrospectivos casuales.

## Decisión
1. **Conservar** el atlas de eventos y genealogía como capa auditable en GitHub, separado de la puntuación oficial.
2. **Descartar como bono automático** la similitud A/C de cualquier forma física: está demasiado extendida para discriminar.
3. **Investigar exclusivamente como hipótesis prospectiva** el desplazamiento rígido de al menos dos filas desde una huella histórica ganadora verdaderamente documentada, con controles de cobertura y raíces únicas. Especificar la regla antes de nuevas cabezas; no interpretarla como mejora probada.
4. No cambiar `src/motorLalo.ts`, `main`, los Tops vigentes, la hoja +11, la regla VT4 ni los PRE prospectivos ya sellados.
5. Registrar fechas, fuentes, caminos, firmas, raíces, deltas y **todos los negativos**, sin usar cabeza/jurisdicción del objetivo en la fase PRE. El objetivo POST va en archivo aparte.

## Evidencia reproducible
- [Primera acción completada: atlas A/B/C/D](https://github.com/y0t3/Modelo-Papa/actions/runs/38517073552)
- [Segunda acción completada: raíces y genealogía](https://github.com/y0t3/Modelo-Papa/actions/runs/38517414167)
- `auditorias/vt3-atlas-cuatro-dimensiones-115-14oct2026/`: `EVENTOS_PRE_115.json`, `PRE_115.json`, `SELLO.json`, `POST_115.json`, `RESUMEN.json`.
- `auditorias/vt3-atlas-raices-verificadas-115-14oct2026/`: `PRE_115.json`, `SELLO.json`, `POST_115.json`, `RESUMEN.json`.
- Protocolos separados y scripts `scripts/lab-vt3-atlas-cuatro-dimensiones.mjs`, `scripts/lab-vt3-atlas-raices-genealogia.mjs`.
- Ambas acciones ocultaron el POST base antes de construir y sellar PRE; luego restauraron POST para cotejo. No convierte a estos cortes históricos en validación verdaderamente prospectiva.
