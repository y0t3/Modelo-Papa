# Movimiento de huellas VT3: D−7, última jornada sorteada y hoja PRE actual — 115 cortes

**11/10/2026. Prueba COMPLETADA y verificada**, sin esperar sorteos nuevos, sin modificar `main`, APK, marcado automático, ni motores/árbitros oficiales. Corpus **23 jornadas, 115 cortes** ya conocido (70 septiembre/45 octubre); resultado exploratorio, NO validación predictiva externa.

## Qué se corrigió en la interpretación física

No es correcto llamar «giro» al mero traslado geométrico de una huella D−7. Se distinguen:
- **Huella histórica confirmada**: VT3 que coincidió con una cabeza completa ya publicada en D−7 (misma fecha de semana anterior), o **última jornada con sorteos** (D−1 **operativa**, que puede ser sábado si el objetivo es lunes). Se anotan fecha, turno y cabeza previa.
- **Traslado**: colocar la misma forma en otra posición del **mismo par de columnas fuente 6×2** de la hoja PRE actual; puede variar desplazamiento de fila o lado pero no gira el propio trazado ni cambia de fuente. **La terna numérica que ahora ocupa esas celdas puede ser distinta de la antigua**.
- **Otras copias físicas actuales** de la misma familia VT3 pueden tener formas diferentes: esas sí han de investigarse aparte como variedad de orientación, no confundirse con traslado de la huella.
- **Doble evidencia histórica**: una familia VT4 reversible hija con un testigo de extensión desde D−7 y otro desde la última jornada. Registrar además si ambos testimonios corresponden a **una misma ubicación física actual** o dos ubicaciones distintas; no confundirlas con señales independientes.
- Madre reversible VT3 y **dos hijas VT4 orientadas**, cada hija reversible. Madre `729/927` +3 → `3729` y `3927`; inversas `9273` y `7293`. Invertir la hija no crea madre `273`.

## Diseño y regla contrastada

Se conservaron **sin cambios** el conjunto y orden de las 1.104 exposiciones de madres de `MULTIRRUTA_MADRES_ROCE` (Top3, Top5, Top10) y el orden original por anclaje D−7 de la cuarta cifra. Se reconstruyeron los recorridos VT3 efectivamente confirmados en la última jornada **anterior** leyendo sólo fuentes crudas más antiguas que cada caso, con las **cinco jurisdicciones argentinas** para resultado y **seis filas** (incluye Montevideo) para caminos físicos.

Regla alternativa **sólo para cuarta cifra**: prioriza el mismo dígito si la **misma hija VT4 reversible físicamente formada** dispone de extensiones desde antecesores D−7 y también desde la última jornada; después prioriza hijas físicas y testigos de la jornada anterior, desempate según el orden de cifra D−7 ya congelado. No cambia la madre, el número de cifras presupuestadas ni el criterio de no atravesar fuentes.

Se mantiene el corte PRE/POST retrospectivo: **toda la etapa PRE carece de archivo POST** durante la reproducción aislada; no significa que la historia sea un holdout nuevo.

## Hallazgos cuantitativos

| Hallazgo | Recuento |
|---|---:|
| Madres-corte VT3 examinadas | **1.104** |
| Madres-corte con algún antecesor transferido desde última jornada | **467** |
| Recorridos de madre VT3 transferidos desde D−7 | **1.653** |
| Recorridos de madre VT3 transferidos desde última jornada | **657** |
| Colocaciones actuales **idénticas** sostenidas por antecedentes de ambos períodos | **230** |
| Madres con al menos una hija VT4 física respaldada por ambos períodos | **443** |
| Grupos madre+dígito con coincidencia de hija VT4 física de ambos períodos | **1.323** |
| Madres cuya primera cifra cambia al añadir D−1 operativa | **107/1.104** |
| Extensiones VT4 por huecos realmente adyacentes a huellas D−7 | **8.655** |
| Extensiones VT4 por huecos realmente adyacentes a huellas de última jornada | **3.459** |

Movimientos entre posiciones 6×2 del mismo origen: D−7 **401/1.653** se mantienen en las mismas coordenadas y **1.252** se trasladan; jornada anterior **126/657** se mantienen y **531** se trasladan. Las rutas son apariciones de celdas, **no observaciones independientes ni predicciones acertadas**.

## Cotejo POST: número de cortes con ≥1 cabeza cubierta

| Presupuesto | Solo D−7 | D−7 + última jornada |
|---|---:|---:|
| Top3 madres × 1 cifra | **0** | **0** |
| Top5 madres × 1 cifra | **1** | **1** |
| Top10 madres × 1 cifra | **1** | **1** |
| Top10 madres × 2 cifras | **3** | **3** |
| Top10 madres × 3 cifras | **5** | **5** |

Los restantes presupuestos Top3/5/10 × 1/2/3 también empatan: **ningún corte rescatado ni perdido**, pese a 107 primeras cifras modificadas. Control azar de mismos grupos maternos y número de cifras, prioridades uniformes compartidas por jornada: Top10 × 1, **2,006** cortes esperados; × 2, **3,946**; × 3, **5,800**. Observados con D−1: 1, 3, 5. Sin señal robusta de discriminación de la cuarta cifra. El promedio de números de cuatro cifras cubiertos no es exactamente igual entre dos métodos: Top10×1 34,24 solo D−7 y 33,99 D−7+D−1; evitar equiparar a un Top10 de diez números individuales.

### Caso 5/10 Matutina, madre `729/927`

- Forma original D−7 del 28/9 confirmada; nueva madre `729/927` en la hoja actual.
- La última jornada con resultados antes del lunes 5/10 fue **sábado 3/10**, y aporta **cuatro huellas madre** válidas que se trasladan, **ninguna idéntica a la colocación de la madre D−7 actual**.
- La cifra **3** genera hijas hermanas `3729`, `3927`; ambas pueden formarse físicamente. `3729/9273` tiene al menos un testigo D−7 y otro del sábado; `3927/7293` tiene testigo del sábado.
- **La cifra 3 quedó tercera en ambos órdenes** (detrás de 9 y 7). Resultado posterior Santa Fe **3729**. No es nuevo acierto ni mejora de priorización.

## Evidencia técnica e integridad

- PRE SHA256 **`d28e2dd979b4b45e7c9f76d6b2c06fddd4528bfd7104573dd676861a0639f802`**.
- POST SHA256 **`4c22408574c3556537f73f847947661f10397b7c2d3d0fea9105666a18977569`**.
- `verificar.py` auditó todas las **1.653 rutas VT3 D−7 + 657 de última jornada + 8.655 extensiones VT4 D−7 + 3.459 extensiones de última jornada**, revisando fuente, celdas distintas, vecinos, posición, lectura real, hija reversible, tiempo de cabeza antigua y movimiento exacto.
- Reconstrucción **en directorio aislado**, con `RESULTADOS_POST.json` físicamente ausente al ejecutar PRE: hash PRE idéntico. Después se añadió POST, se regeneró idénticamente su cotejo, se corrió auditoría y se reprodujeron ambos visores byte a byte.
- Visores offline de los **115 cortes**: `VISOR_D1_D7_PRE_115.html` y `VISOR_D1_D7_POST_115.html` con selección fecha, turno, madre, cifra y tres hojas dibujadas (D−7, última jornada, actual). Probados en Chromium: cambio de cifra, caso 05/10, tres gráficos y cero errores JavaScript. PRE oculta cabezas objetivo.
- Archivo de conversación `modelo-papa-movimiento-vt3-d7-ultima-jornada-vt4-115-cortes-11oct2026.zip`, **44 archivos, 2.607.814 bytes**, SHA256 **`17b2aefb07805a429a034ff9eb598593bfb07f07d7c46a76698fba5d78ddfb0b`**; ZIP test de integridad OK. Incluye 30 JSON de fechas, scripts, PRE+POST separados, informes, CSV completo y HTML.

## Decisión

**La genealogía comparada D−7 / última jornada aporta información visual válida, pero todavía no selecciona mejor la cuarta cifra.** No añadir prima, filtro, obligación de corroboración ni cambio en motor predictivo. **Seguimos trabajando con las hojas existentes**, sin bloquear desarrollo por resultados futuros.

Próximo ensayo útil y diferente: comparar **figuras adicionales no heredadas** que ya aparecen en la misma familia VT3 de la hoja actual (orientación, bifurcaciones y cambio de fuente), frente a la pura traslación de las figuras históricas; no crear reglas basadas en el resultado POST.
