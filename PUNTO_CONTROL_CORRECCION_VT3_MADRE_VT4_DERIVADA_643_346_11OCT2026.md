# CORRECCIÓN OBLIGATORIA: familia VT3 madre ≠ propuesta VT4 por cifra añadida

**11/10/2026.** Esta corrección sustituye la interpretación ambigua de `PUNTO_CONTROL_VT4_FAMILIAS_TOPS_ROCE_AZAR_145_CORTES_11OCT2026.md` pero **no reescribe los resultados ni rankings históricos**. En la rama experimental; **`main`, motor oficial, selector y APK sin cambios**.

## Ejemplo real, antes de Primera 10/10

El registro físico Nocturna anterior +11 `vt3|prevNocturno|2:1>3:0>4:0` contiene **346** y su lectura inversa **643**.

- **FAMILIA MADRE VT3:** `346 / 643` (una sola figura física). `460` no es la inversión de `643`.
- La propuesta AZAR seleccionó **la lectura raíz 346**, añadió **0 al FINAL**, obteniendo `3460`; su lectura de **cuatro cifras invertida** es `0643`. **FAMILIA DERIVADA VT4:** `3460 / 0643`. No existe un testigo de cuatro celdas físicas para esa propuesta en ese corte.
- Si en vez de `346` se extiende la lectura inversa `643` agregando **0 al final**, sale **otra** propuesta VT4 `6430 / 0346`. Esta **variante hermana no fue seleccionada en el Top** y no se puede adjudicar retrospectivamente su resultado.
- Invertir una VT4 completa y **elegir invertir primero su VT3 madre y extenderla** son operaciones DISTINTAS. Nunca transferir la cifra añadida a la memoria de VT3 ni tratar `460` como familiar de `643`.

## Protocolo correcto para toda VT3→VT4

1. Conservar `idMadreVT3`, `familiaMadreVT3`, lecturas de 3 cifras exactas `a / reverso(a)`, celdas fuente y memoria D−1/D−7.
2. Registrar `lecturaUsadaParaAgregar`, `cifraAgregada`, `ladoAdicion` (principio o final).
3. Registrar aparte `familiaVT4Propuesta`, las dos lecturas de cuatro cifras y **si existe o no una ruta VT4 legal**; si es azar y sin huella, es **proyección numérica, no acierto geométrico**.
4. Para completar el espacio sin alterar retrospectivamente selecciones: registrar la `varianteHermanaVT4Numerica` resultante de agregar la misma cifra en el extremo correspondiente de la lectura VT3 inversa. Esa variante NO está escogida salvo nueva selección PRE congelada.
5. **Acierto de familia VT3** por cualquiera de sus sentidos va a memoria de la **madre**; acierto VT4 corresponde a la **derivada**; no confundir apariciones ni sumar ficticiamente la misma evidencia dos veces.

## Corrección ejecutada y probada

- Original PRE intacto SHA-256 `de4dbe05e31a88364ef37c14457c032fcd9be9c873b26a918746aafb13e6b104`.
- **580 decisiones, 5.800 candidatos y posiciones Top3/5/10** originales comparados uno por uno; **0 modificaciones**. **3.770 extensiones** enriquecidas con la genealogía (1.885 por ROCE, 1.885 por AZAR); 2.030 propuestas directas identificadas sin una VT3 madre elegida.
- Archivo PRE V2 con genealogía SHA-256 `baf1afc230825a690e68cdf6f85363b9a5df0154bc4961b6312ee0fa0f3f8d55`. Comparación 5.800/5.800 y regresión especial del `643/346`: pasaron. JS del visor validado con `node --check`; **no** afirmar pruebas de Chromium de esta revisión.
- El visor PRE corregido muestra **VT3 madre** y **VT4 derivada**, y las variantes hermanas no seleccionadas. El POST anterior se conserva separado y sin cambios; esta fe de erratas **no** crea aciertos retroactivos.

**Archivos entregados en chat:** `correccion_genealogia_vt3_vt4/ANTES_VT4_FAMILIAS.html`, `correccion_genealogia_vt3_vt4/INFORME_CORRECCION.md` y `modelo-papa-correccion-genealogia-vt3-vt4-643-346.zip` (15 archivos, incluye scripts, PRE enriquecido, controles y POST original).
