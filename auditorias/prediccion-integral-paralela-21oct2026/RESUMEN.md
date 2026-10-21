# Predicción: Lalo MV1 e Integral en botones separados

**Rama experimental:** `lab/prediccion-integral-paralela-21oct2026`  
**Fecha:** 21/10/2026  
**Validación:** [GitHub Actions #39696652181](https://github.com/y0t3/Modelo-Papa/actions/runs/39696652181) — correcta.

## Experiencia en la app

En la pestaña **PREDICCIÓN** se añadieron dos botones de motor:

- **MODELO LALO:** conserva la salida de `buildMotorLalo` y su selector histórico +11 sin alterar el orden ni contenido de los rankings. Sigue siendo la vista predeterminada.
- **LALO INTEGRAL:** ejecuta `buildMotorLaloIntegral` con su lectura conjunta de +11 y Santiago–Neuquén y su propio ranking independiente (mezcla experimental fija 65/35 definida en el laboratorio).

Ambos usan **el mismo componente `PredictionSummary`**, por lo que VT2, VT3 y VT4 conservan sus pestañas horizontales, fichas de familias en lista vertical, Top3/Top5/Top10 y detalles visuales. En Integral, tocar una familia abre la **procedencia específica por hoja**, raíces históricas auxiliares, fuentes, cruces legales, puesto MV1/AUX y números exactos físicamente cubiertos. Si también existe en +11, permite abrir el recorrido del tablero +11; una familia exclusivamente auxiliar no debe enviarse a una ruta +11 que no existe.

### Dos resaltados independientes

- **Coincidencia entre motores**: una familia en los **Top10 de ambos** se señala en su ficha, con el puesto que ocupa en el otro motor. La inversión permitida de VT2/VT3 y la agrupación correcta de VT4 se normalizan para que no se pierda una coincidencia por el orden del texto.
- **Coincidencia POST**: cuando se publicó una cabeza de cualquiera de las seis jurisdicciones, la ficha de la familia que contiene su **terminación exacta** se resalta y muestra la cabeza completa. Que la familia esté en los dos modelos NO significa que haya ganado. Un POST se compara en la modalidad correspondiente; **no es un premio monetario real sin la apuesta correspondiente**.
- **VT4**: usar solamente los valores de cuatro cifras con testigo físico válido. Nunca invertir el entero para inventar una madre VT3 o declarar una cabeza inexistente.

Bajo los Tops hay un botón **«⇄ Comparar familias y cabezas de ambos motores»** que despliega una comparación adicional Top3/Top5/Top10 por modalidad, con familias compartidas, cantidad de familias exclusivas y **cabezas publicadas que acertó MV1, Integral o ambos**. Mostrar una cabeza como «✓ AMBOS» requiere que sus cifras estén en las terminaciones de ambos TopN que se están cotejando, no solo en los Top10 generales.

## Carga de datos y aislamiento

`App.tsx` conserva `motor` y `hist` oficiales. Además guarda referencias `integralPast` separadas y recupera **las cabezas RAW reales de Santiago y Neuquén** de las mismas fechas D−1 y D−7 usadas por MV1. Las marcas auxiliares históricas se extraen POST de cabezas reales de las seis jurisdicciones; el tablero de destino solo abre los turnos que existían en el PRE correspondiente. Si faltan datos AUX actuales o históricos, se muestra **«Integral no disponible»**, sin rellenar raíces ni reemplazar los Tops de MV1.

`integral` se calcula cuando el usuario abre la pestaña Predicción, como valor derivado independiente. **Cambiar botones no altera ni un candidato del Top original.** Se mantiene la pestaña experimental de comparaciones VT3 original.

## Pruebas y verificaciones

- `npx tsc --noEmit`: **aprobado**, incluye todos los componentes React Native.
- Geometría Santiago–Neuquén y mapa corregido Vivitusuerte del 20/10: aprobados.
- `scripts/lab-integral-test.ts`: **16 comprobaciones**, entre ellas no fuga de datos del turno futuro y genealogía VT4.
- `scripts/lab-prediccion-paralela-test.ts`: **12 comprobaciones** que incluyen familia VT2 reversible compartida, VT3 solo AUX, cabeza POST de ambos motores, VT4 exacto `3226` y rechazo de `6223` como inversión inválida.
- `scripts/lab-prediccion-paralela-20oct.ts`: **jornada real 20/10/2026**, las cinco ventanas PRE con memoria D−1 y D−7, comparando los Tops de ambos motores. En todos los turnos el ranking MV1 contenido en el cálculo Integral fue **idéntico al ranking de MV1 calculado independientemente**. Se mostraron resultados reales POST en el comparador, incluyendo **Provincia Previa 4805 → familia VT2 05/50 en ambos**.
- `scripts/lab-linea-tiempo-20oct.ts`: comprobación adicional de continuidad visual histórica.

Estos resultados certifican coherencia de código, geometría, cortes y comparación. **Todavía no se generó una APK nueva ni se hizo una prueba táctil de diseño en un teléfono**. La integración se conserva en esta rama experimental; no toca `main`.

## Archivos principales

- `App.tsx`: botones MV1 / Integral, carga histórica auxiliar y comparador desplegable.
- `src/ui/PredictionSummary.tsx`: interfaz compartida de Tops 3/5/10 y resaltados.
- `src/ui/ParallelPredictionCompare.tsx`: panel de familias y cabezas comunes.
- `src/predictionParallel.ts`: normalización física de familias y cálculo POST puro.
- `scripts/lab-prediccion-paralela-test.ts`: pruebas sintéticas de coincidencia.
- `scripts/lab-prediccion-paralela-20oct.ts`: control histórico con la misma memoria que la app.
- `.github/workflows/lab-prediccion-integral-paralela.yml`: pruebas automatizadas.

**Nota:** La predicción sigue siendo experimental. Los resaltados indican coincidencias observadas y respaldos físicos, no probabilidades confirmadas, rendimientos económicos ni recomendaciones de montos apostados.
