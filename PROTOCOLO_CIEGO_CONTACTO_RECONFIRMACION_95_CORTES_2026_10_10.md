# Registro congelado — continuidad de las huellas ya marcadas frente a contactos anteriores al turno

Fecha: 10/10/2026. Rama `experimento-analisis-visual-5d`.
Punto de partida: los **95 cortes ciegos** del 09–30/09/2026, con 20 hojas marcadas 08–30 y 19 transiciones, generados en https://github.com/y0t3/Modelo-Papa/actions/runs/38048007954.

## Pregunta cerrada **antes de hacer el cotejo nuevo**

¿Las huellas **efectivamente marcadas la jornada anterior**, que ya tocan una marca confirmada de hoy (Previa, Primera, etc., según el turno), se vuelven a confirmar en el **turno objetivo** con mayor o menor frecuencia que otras huellas antiguas en condiciones comparables que **no tocan nada**?

Esto es un **análisis histórico explicativo**, no una predicción ni una selección de valores. No se inventan recorridos sobre la tabla vacía. Se conservan VT2, VT3, VT4 y todas las huellas, incluidas las que luego no se confirman.

## Unidad geométrica y estado PREVIO

- Unidad: **huella física única heredada**, `modalidad + fuente + secuencia de celdas`, con orden invertido deduplicado. Diferentes cabezas marcadas sobre la misma huella no la multiplican. No cruzar columnas, saltar filas, repetir celdas ni extender las huellas.
- Para cada corte se toma sólo la grilla +11 visible ANTES del turno, todas las huellas heredadas del día anterior que están disponibles, y las marcas de turnos del mismo día ya cerrados. **No** se accede a la cabeza ni a las marcas del objetivo en este paso.
- Categorías por contacto **de la misma fuente física**, en precedencia: `MISMA_GEOMETRIA` (la marca anterior de hoy tiene misma huella ignorando inversión, con independencia de VT); `DOS_O_MAS_CELDAS` (al menos dos celdas en común, sin misma geometría); `UNA_CELDA`; `NINGUN_CONTACTO`. Guardar TODAS las marcas conocidas tocadas, sus cabezas completas, las posiciones y modalidad, no únicamente una escogida.
- El dato de contacto no elige cabeza futura, orientación o turno. Guardar **las dos lecturas actuales (directa/inversa)** para cada huella. Cada corte con Previa tiene por definición cero marcas anteriores del día: usarlo como control descriptivo, **no** como un contraste donde pueda haber contacto.
- Guardar un expediente ANTES de cada turno (95) con **todas** las rutas, incluidos los negativos. Cada expediente debe ser exportado como artefacto en un job cuyo fin anteceda la ejecución del cotejo.

## Comprobación POSTERIOR separada

- Leer únicamente después las hojas completas reconstruidas por resultados del sorteo objetivo, sin modificar ni reranquear los expedientes anteriores. Para cada huella antigua comparar con todas las rutas realmente **confirmadas por el objetivo**, de igual modalidad, fuente y forma física, sin usar otras fuentes ni resultados posteriores.
- Variables posteriores independientes: (a) **reconfirmación geométrica exacta en el objetivo**; (b) **alguna de las dos lecturas numéricas de la huella coincide con terminación de cualquiera de las cabezas completas** del objetivo (coincidencia permisiva, no una cifra elegida).
- Registrar coincidencias y **fracasos**, y cobertura de las seis jurisdicciones (si falta algún resultado, una ausencia es INDETERMINADA, no fallo).
- Producir tablas separadas por VT2/3/4 y por turno (Previa, Primera, Matutino, Vespertino, Nocturno). Para evitar que un gran número de marcas de turnos tempranos cree una «señal» artificial, agregar también **contrastes apareados dentro de la misma fecha+turno+columna+modalidad** cuando coexisten huellas con contacto y sin contacto. No atribuir independencia estadística a huellas que comparten cabeza, celdas o jornada.
- Al encontrar una diferencia, describir **tanto los falsos positivos como los falsos negativos** y las alternativas visuales ambiguas. No convertir una diferencia exploratoria en un nuevo filtro del motor ni en consejo de apuesta.

Advertencia: estamos revisando retrospectivamente septiembre, que ya fue estudiado intensamente. Todo hallazgo nuevo es **exploratorio dentro de muestra**, incluso si los expedientes se congelan antes del cotejo de esta ejecución. El estudio NO valida capacidad de prever un sorteo futuro, ni demuestra que una misma ruta se mueva realmente de un día al otro.

**No tocar** `main`, motor, APK, selector ni lógica de apuestas.