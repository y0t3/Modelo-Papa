# INFO Auxiliar — minihojas de antecedentes y comparación PRE (29/10/2026)

## Alcance

En INFO → 04 Minihojas Santiago–Neuquén se agregó comparación visual de antecedentes para cada modo, conservando la galería semanal.

- **Jornada histórica:** la cabeza ganadora real de ese turno aparece como opción VT2, VT3 o VT4. Al tocarla abre minihoja antigua con cifras completas, fuente y recorrido físico. La segunda minihoja reproduce **solo los movimientos** sobre las celdas PRE del turno actual, cuando son físicamente válidos. Se pueden recorrer todas las rutas antiguas y posiciones PRE calculadas, sin convertirlas en candidatas.
- **Jornada actual:** familia Top10 AUX por VT2, VT3 o VT4; al tocarla se abren sus rutas PRE y las raíces antiguas efectivamente utilizadas en el ranking, con selector independiente de camino y antecedente. Ante información incompleta, no se dibuja una hoja histórica ficticia.
- Etiquetas de fecha, modo AYER/HOY, jurisdicción, cabeza, terminación, fuente de cifras, trayecto numerado y puesto reconocido. VT4 muestra su valor exacto y la madre VT3 del AUX, no invierte la cuaterna.
- Las posiciones físicas de una forma antigua y el respaldo histórico del motor se identifican como cosas distintas. Una coincidencia geométrica por sí sola no se convierte en voto ni Top.

## Aislamiento

AUX AYER utiliza el tablero íntegro de Santiago–Neuquén anterior. AUX HOY empieza sin celdas en Previa, agrega Previa antes de Primera, Primera antes de Matutino y Matutino antes de Vespertino/Nocturno. No se usan cabezas del turno objetivo. Los antecedentes siempre preceden a la jornada analizada.

No se modificaron Lalo MV1, Lalo Auxiliar, Integral, selección de candidatos, reglas de genealogía VT4, resultados anteriores ni registros PRE. La hoja +11 no se mezcla geométricamente con AUX.

## Verificación

- TypeScript app completo: npx tsc --noEmit --project tsconfig.ui-check.json
- Nuevo test: scripts/test-info-aux-trazas-visuales.ts (rutas físicas contiguas, base antigua real, PRE limpio, VT4 con madre, contraejemplos, no fuga temporal, HOY Previa vacía).
- Regresiones: test-info-aux-predictiva-top3.ts, test-aux-correcciones-info-vt4.ts, lab-aux-dos-modos-regresion-test.ts, test-motor-lalo.ts.
- CI aprobado: https://github.com/y0t3/Modelo-Papa/actions/runs/40846732230

**Sin APK ni merge a main.** Falta comprobar en teléfono legibilidad de minihojas 2×12 y desplazamiento horizontal, cambios de ruta, volver/cerrar modal, alternar AYER/HOY, zoom y orientación horizontal.

## Investigación posterior

Examinar las tres VT4 físicamente formables y con madre habilitada de 15/10 (4942), 20/10 (2697) y 23/10 (4862), comparándolas con formas semejantes no ganadoras. No convertir una explicación visual en una mejora predictiva sin corte PRE prospectivo y control de falsas alarmas.
