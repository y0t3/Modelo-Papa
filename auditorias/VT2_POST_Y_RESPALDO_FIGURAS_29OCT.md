# Diagnóstico y corrección: minihojas por forma y POST VT2 experimental — 29/10/2026

## Qué seguía el motor

Lalo no fue un ranking de **formas puras**. Primero toma recorridos de cabezas ganadoras anteriores, traslada cada forma por posiciones físicas dentro de la misma columna +11 y lee las nuevas cifras. Después **agrupa por familia reversible numérica** en `src/motorLalo.ts` y la ordenación Top10 se hace por familias, usando eventos ganadores independientes, fuentes, bifurcaciones y bloques.

La minihoja antigua de Predicción VT2 `Vt2FamilyHistoryModal.tsx` también filtraba las cabezas por las **mismas dos cifras**, incluso con figuras geométricas distintas. No era evidencia de seguimiento de siluetas; ese rótulo era confuso. La nueva visual de siluetas de PREDICTIVA es observacional, **no cambia el motor**.

## Cómo queda la minihoja VT2 de PREDICCIÓN

Se separan explícitamente cuatro niveles:

1. **Recorrido actual** de la familia: casillas, fuente y cifras que produce, con minihoja PRE.
2. **La misma silueta histórica**, que puede haber generado otras cifras. Solo marcas ganadoras POST de seis jornadas anteriores y de sorteos anteriores al objetivo en la misma jornada. No se confunde con raíz ni se suma como voto.
3. **Raíces efectivamente utilizadas por Lalo para ese recorrido**, con fecha, cabeza, turno y minihoja histórica cuando puede reconstruirse físicamente. Si la figura no tiene raíz VT2 directa, se indica; si surge de VT3, se muestra esa genealogía.
4. **Otras coincidencias de la misma familia numérica**, antiguas, que no necesariamente tienen igual figura ni respaldo de ese recorrido.

La forma se compara visualmente antes que el número, pero esto es una corrección de **explicación/auditoría**, no un nuevo motor de selección por figura. El siguiente estudio de formas puras debe diseñarse como motor experimental independiente, con controles negativos y PRE sellados, antes de cambiar los Tops.

## POST de VT2 en experimental

Se agregó `src/vt2ExperimentalPost.ts` para cotejar, **después de publicarse** las cabezas reales del turno:

- Geometría Completa VT2: coincidencias exactas de terminación como **familia reversible**, Top3 y Top10.
- Configuraciones Conectadas VT2: mismo criterio independiente, con puestos propios y cabezas reales.
- Ambas secciones muestran explícitamente `POST pendiente`, `POST sin coincidencias` o las coincidencias con **jurisdicción, cabeza y puesto**.
- Los datos PRE de las listas no se modifican, reordenan ni recalculan al llegar el POST.
- Resultados Santa Fe de 5 cifras: se toman últimas dos al cotejar VT2; 4/5 cifras válidas conservan los ceros iniciales.
- El conjunto de cinco jurisdicciones usado aquí conserva la evaluación experimental original, sin Montevideo. No se acredita una ganancia económica por una coincidencia de familia, y que esa familia haya coincidido **no demuestra** que el ganador siguiera la figura expuesta.

Prueba específica `scripts/test-vt2-experimental-post.ts`: aciertos de ambos motores, sin sorteo, Top3/10, dos resultados de misma familia, cinco cifras, ceros, duplicados y ausencia de mutación PRE; además de TypeScript, MV1, minihojas y ausencia de fugas temporales.

## Distribución

Corrección de pruebas en la rama `fix/vt2-post-figuras-29oct2026` derivada de `feature/experimental-vt2-formas-30oct2026`. APK 0.3.12 independiente, icono azul/dorado preservado. La app estable no se actualiza ni se tocan motores oficiales.
