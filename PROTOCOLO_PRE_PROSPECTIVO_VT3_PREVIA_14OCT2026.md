# VT3 — PRE prospectivo del 14/10/2026, Previa

**Objetivo:** preservar el primer corte no visto tras cerrar la Nocturna del 13/10. Esta ejecución usa únicamente datos anteriores al 14/10 para crear el tablero de Previa. Ninguna cabeza del 14/10 forma parte de la entrada o de las selecciones. Rama separada; `main`, aplicación y motor oficial intactos.

## Datos autorizados
- Fixture histórico inmutable terminado el 10/10: `fixtures/cabezas-sept-oct-2026-30-fechas.json.gz.b64`.
- Jornada completa del 12/10 ya versionada en el protocolo de auditoría del 13/10; Montevideo `----`.
- 25 cabezas publicadas del 13/10: `auditorias/vt3-cotejo-nocturna-13oct2026/OBJETIVOS_POST_13OCT.json`, utilizadas **solamente** como antecedentes de la hoja del 14/10.
- Historia D−1: hoja del 13/10 (contra 12/10). Historia D−7: hoja del 07/10 (contra 06/10). `now` del 14/10 totalmente vacío.

## Tres líneas fijas y simultáneas
1. **VT3 oficial:** primeros 3, 5 y 10 grupos de `buildMotorLalo` sin cambios.
2. **Challenger tercera plaza D−1:** mantener originales #1 y #2, elegir #3 solamente entre originales #3–#10, mayor `d1Roots` propio; desempatar `d7Roots`, `physicalBlocks`, `rank` menor. Preservar todo el inventario Top10.
3. **Control hash:** entre exactamente los mismos puestos originales #3–#10, escoger hash SHA256 ascendente de `2026-10-14|Previa|familia`; mantener originales #1 y #2 y Top10.

## Validaciones PRE
- La fecha 14/10 no aparece en fixture ni en la fuente de resultados anteriores.
- Ninguna cabeza objetivo está cargada en `sheet.heads.Previa`; también deben estar vacías las columnas Previa y posteriores.
- Solo se construye el corte Previa; no inventar los turnos posteriores ni la columna Montevideo.
- Guardar el ranking VT3 completo con fuentes, evidencias, rutas físicas, tres líneas y hash SHA256; GitHub Actions versiona PRE y sello con hora de commit, antes de cotejar cualquier POST.
- No leer ni generar ningún POST de 14/10 en este flujo.
- Cuando existan resultados publicados, una auditoría separada cotejará las 5 cabezas contra las familias reversibles de tres cifras, sin alterar PRE. La cuaterna VT4 no interviene.

**Interpretación:** este es un registro de predicciones en sentido temporal, no evidencia de habilidad predictiva. Los sorteos son aleatorios y los análisis históricos previos tienen gran riesgo de sobreajuste.
