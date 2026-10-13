# Laboratorio VT4 — invertir sólo la terna madre, nunca toda la cuaterna
**13/10/2026 · rama `lab-vt4-familia-madre-fija-13oct2026`.**
**Motivo:** VT4 antiguo agrupa `3226/6223` por invertir cuatro cifras; ello oculta que los segmentos madre son `226/622` pero `223/322` de la cuaterna invertida no es la misma interpretación de extensión. El usuario exige conservar el significado de madre VT3 al formar familias VT4.

## Convención nueva y comprobable
Una VT4 es una **extensión física** de una ruta real de tres celdas perteneciente a una familia VT3 previamente admitida. Definir cada agrupación de familia por **madre VT3 canónica, cifra agregada y extremo de la extensión**:
- Si la cifra se agrega **ANTES** de la terna, madre `226/622` más cifra `3` → familia VT4 **`3226/3622`**. Formar `3226` NO implica que `3622` tenga camino; cada variante necesita su propia ruta física de cuatro casillas. Es una familia estructural, no una afirmación de que ambas variantes salieron o se pudieron trazar.
- Si la cifra se agrega **DESPUÉS**, misma madre+cifra → **`2263/6223`**. Esta opción también debe existir **si y sólo si** aparece su respectiva ruta física; no se inventa `6223` a partir de invertir `3226`.
- La cifra agregada se conserva en el **mismo extremo** al invertir el orden de las tres cifras de la madre. **Nunca** se deriva una familia por inversión de cuatro cifras.
- Conservar todas las rutas físicas válidas de cuatro casillas, sin cruzar columnas/turnos, sin reutilizar casillas ni inventar enlaces. La familia/variantes del catálogo podrían tener solo una de las dos variantes físicamente disponible: marcarlo como tal.
- Si una misma cuaterna física puede explicarse mediante **dos madres distintas** (p. ej. `5485`), mantener procedencia por ambas madres y no atribuir a ninguna una raíz prestada. El diagnóstico debe mostrar inequívocamente su madre, lado y cifra agregada. Cuando una cabeza completa coincide con más de una agrupación VT4, **contar el acierto por corte una sola vez** y reportar superposición entre posiciones del Top para evitar contar varias cabezas ficticias.

## Integración experimental
Cambiar únicamente la agrupación de `vt4` y la correspondencia `POST VT4` en `src/motorLalo.ts`; no modificar geométrica VT2/VT3, sus rutas, prioridades, reglas +11 ni fuentes. Mantener política original de madres Top10 y ordenación VT4 para aislar **solo** el efecto de corregir la definición de familia. No aprobar aún la diversificación por madre ni ampliar cupos.

**POST VT4:** comparar resultados reales con el conjunto de `p.value` de rutas reales de cada familia del Top3/Top5/Top10; **no** con la inversión total de la cabeza ni suponiendo que todas las variantes mostradas son físicamente existentes.

**UI:** indicar madre VT3, extremo de cifra agregada y variantes efectivamente trazadas; un par mostrado `3226/3622` no debe interpretarse como dos caminos inventados.

**Trazabilidad:** usar PRE histórico de 115 cortes y los casos de Primera/Matutina del 13/10; sellar resultados originales en una rama independiente y comparar antes/después:
- VT3 de los 115 cortes **sin cambios** contra el inventario anterior y VT3 Matutino del 13/10 **idéntico** al sello de las 13:52;
- Las variantes VT4 contienen solo rutas físicas verificadas, y cada ruta madre pertenece a uno de los segmentos exactos contiguos de tres casillas del testigo de cuatro.
- Predecir rankings VT4 con datos del turno disponibles antes del sorteo, no con cabezas futuras.
- Auditar cambios en número de familias, distribución por madres y aciertos posteriores contra los mismos resultados, separando análisis retrospectivo de sello prospectivo.

**Cautela:** que `3226/3622` se agrupe correctamente no significa que ambas cifras sean físicamente posibles; la familia necesita caminos propios para cada forma. Los resultados de sorteos son aleatorios, y una reorganización semántica del ranking no demuestra predicción.
