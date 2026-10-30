# Extensiones VT2 → VT3: distinguir información PRE y cotejo POST

Rama experimental: `feature/extensiones-aciertos-y-respaldos-30oct`.

## Qué explora exactamente

- La hoja +11 aporta **madres VT2** desde el Top10 de Lalo o de la unión de los motores experimentales. Las extensiones físicas VT3 del panel se buscan **en Auxiliar Ayer y Auxiliar Hoy** de manera independiente, sin cruzar casillas entre tableros y sin exigir que existan en +11.
- Ahora se consulta **también** si la extensión está en los Top10 **VT3 propios de la +11**, por ejemplo «Lalo #... / Formas primero #...». Esta marca es información PRE, no crea ni modifica una ruta AUX ni altera rankings.
- Todas las extensiones válidas continúan agrupadas en `_13`/`_31` y se pueden abrir con todas sus rutas.

## Señales PRE (antes del sorteo)

- **Dorado / Respaldo PRE:** al menos una de estas condiciones ya se conocía: la extensión aparece en Top10 VT3 +11, un Top10 VT3 auxiliar, o tiene una cabeza antigua realmente ganadora en alguna ruta idéntica dentro de su tablero.
- El estado **Ayer + Hoy** se mantiene como etiqueta, sin considerarlo por sí solo prueba predictiva.
- Al tocar una extensión, se listan por separado antecedentes ganadores históricos en Ayer/Hoy y si aparece en los Top10 VT3 +11. Un resultado del turno objetivo no participa de ninguno de estos cálculos.

## Cotejo POST (después de publicar cabezas)

La app recibe desde la pantalla principal las cabezas **publicadas para el turno seleccionado**, sin consultarlas para construir los recorridos.

- **Verde ✓ Coincidió:** la terminación VT3 de una cabeza publicada es igual a la extensión, o a su lectura inversa en el mismo recorrido físico. La ficha indica jurisdicción, número completo y si fue directa o inversa.
- **Sin coincidencia en N cabezas publicadas hasta ahora:** el turno tiene al menos un resultado, pero todavía ninguno coincide. No equivale a resultado definitivo si faltan otras jurisdicciones.
- **Aún no hay resultados publicados:** ninguna jurisdicción tiene cabeza validada; no se muestra acierto ni fracaso.

Ejemplo de Nocturna del 29/10/2026: **Santa Fe 2813** destaca la extensión **813** como coincidencia directa. **513** conserva sus minihojas y sus respaldos PRE, pero no recibe marca de acierto por ese resultado.

**La pantalla no selecciona apuestas ni garantiza probabilidades favorables.** La finalidad es permitir interpretación física y evaluación posterior sin fuga temporal.

## Comprobaciones

- `src/extensionReview.ts` coteja lecturas directas/inversas, cabezas de 4 y 5 cifras con ceros y jornadas sin publicar; `plus11Rankings` solo compara los Top10 PRE.
- `scripts/test-extensiones-cotejo-ui.ts`: pruebas de 2813→813, 2813≠513, 5318→318 lectura inversa, cabezas no publicadas y duplicados.
- `src/ui/ExtensionExplorerPanel.tsx` muestra dos colores con leyenda explícita, los antecedentes y las minihojas con todos los caminos válidos.
- `App.tsx` aporta solo las cabezas publicadas para el turno; la generación de candidatos no consulta esos datos.
- `VALIDAR extensiones con aciertos y respaldos` verifica tipos, regresiones y separación PRE/POST; `APK de prueba extensiones con aciertos` produce un instalable separado de la APK oficial.

**Estado:** rama de experimentación. La compilación y las pruebas deben estar aprobadas antes de afirmar disponibilidad de APK.
