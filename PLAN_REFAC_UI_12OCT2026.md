# Modelo Papá · Refactor de interfaz y motor (12/10/2026)

## Estado preservado

- **Checkpoint inmutable de referencia:** `checkpoint-ui-motor-12oct2026`, commit `7d9b2ce37a447f79a1d7b9c9d175cc3d750e46f1`.
- **Rama de interfaz:** `ui-refactor-hoja-12oct2026` creada desde exactamente ese commit.
- **Fuera de alcance:** modificar `src/predictive.ts`, `src/analysisEngine.ts`, `src/paths.ts`, `src/sheet.ts`, `src/cabezas.ts`, criterios oficiales y lógica de la APK.
- No mezclar conclusiones de laboratorios sept/oct retrospectivos con el selector activo de la app ni etiquetar probabilidades que no existen.

## Contrato de pantallas

1. **Hoja:** tablero +11 siempre por encima del carrusel de cabezas; desplazamiento horizontal **sólo para cambiar el turno**, sin volver a recorrer cinco listas verticales. Marcas completas post-cabeza. Celdas legibles, tintes y bordes VT2 rosa/rojo, VT3 turquesa, VT4 dorado.
2. **Predictiva:** **exactamente** las rutas de `buildPredictive`, mediante `buildPredictivePanorama`, sin recomputar ni duplicar otra puntuación; elegir una familia ilumina todas sus rutas y da un detalle gráfico del testigo, con fuente, lectura y cabeza antigua disponible.
3. **Predicción:** fecha y turno visibles; Top3, Top5 y Top10 de **familias VT3** del selector vigente y explicación en lenguaje corriente. Modalidades VT2/VT4 **no inventadas**: se indica honestamente que no existe selector independiente activo equivalente y que no hay Top disponible. No presentar dos orientaciones de una familia como madres distintas.
4. **Cabezas:** tabla de seis jurisdicciones × cinco turnos en pestaña propia, incluidas las no coincidentes apagadas; resaltado de **sufijo real** (2/3/4 cifras) de las coincidentes de cada turno, sin atribuir acierto a prefijos internos.
5. **Info:** estado de observación y evolución con nombres simples y leyenda de modalidades, apartado más técnico opcional; nunca presentar `NACE/ACTIVA` como probabilidades científicas.

## Componentes separados de lógica de predicción

- `src/ui/visualTokens.ts`: paleta estable y prioridad visual de modalidades.
- `src/ui/MarkedBoard.tsx`: sólo pintar los dígitos del tablero +11 y **TODOS los caminos a través de los casilleros**, sin líneas que tapan números. Un recorrido queda conservado en datos; superposición -> indicadores VT2/3/4 sobre bordes, nunca excluir una ruta física.
- `src/ui/HighlightedHead.tsx`: cifra completa; resaltado solo en últimas 2/3/4 cifras efectivamente justificadas.
- `src/ui/TurnStrip.tsx`: elegir turno del carrusel horizontal.
- `src/ui/MiniRoutePreview.tsx`: representación pequeña, legible, de recorrido y fuente.
- `src/ui/HeadsTable.tsx`: tabla independiente de cabezas y coincidencias.
- `src/ui/PredictionSummary.tsx`: Top VT3 proveniente del `PredictiveView` original, misma fecha y turno.
- `src/PanoramaSheet.tsx`: composición reutilizable de Hoja/Predictiva sin recalcular qué propone el motor.

## Entregas y criterios de aceptación

**Etapa A — UI de lectura**: sustituir las líneas por rellenos/bordes, conservar contraste de dígito blanco/oscuro, todo VT2/3/4 visible en panorama; un toque selecciona las rutas de una cabeza sin borrar las demás. Un solo turno de cabezas desplegado junto al tablero por vez, con desplazamiento horizontal.

**Etapa B — Navegación**: pestañas Hoja / Predictiva / Predicción / Cabezas / Info, todas directas. Cabezas coincidentes con sufijo coloreado y no coincidentes atenuadas.

**Etapa C — Motor a la vista**: Predictiva y Predicción usan el **mismo `buildPredictive` y orden `hotFamilies`** sin imponer nuevos rankings. Mini ficha vinculada a recorrido físico y antecedente real. Ausencia de VT2/VT4 se comunica sin fabricate Top, hasta estudiar selectores independientes.

**Etapa D — Info y ensayos**: resumen de vida de familias sin promesas de eficacia, registro de decisiones PRE/POST y comparación temporal fuera de muestra, después de aprobación separada.

## Principio de seguridad

El tablero histórico **solo se marca por resultados ya conocidos**; la hoja predictiva pinta únicamente lo propuesto por el motor vigente. Las dos capas deben tener los mismos colores pero diferente procedencia. No se reescribe el motor para embellecer los Top; no se usa POST para formar candidatos PRE. Los cambios de UI no constituyen validación predictiva.
