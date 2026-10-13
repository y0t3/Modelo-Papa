# VT3 → VT4: cobertura física de cabezas completas al ampliar madres admitidas

**13/10/2026. Rama `lab-vt3-apertura-madres-vt4-cobertura-13oct2026`.** Laboratorio independiente; NO modifica `main`, `src/motorLalo.ts`, la app instalada, sellos oficiales ni predicciones previas.

## Hipótesis y magnitudes distintas

El Top10 VT4 corregido, con dos hijas de cada madre VT3 #1–#5, había acertado **cuatro cabezas completas en cuatro de 115 cortes**. Dentro de esas cinco madres únicamente **siete cuaternas ganadoras físicamente existentes** repartidas en **seis cortes** eran elegibles para cualquier ordenamiento de hijas.

**Aquí no se pretende que un Top10 contenga todas las cuaternas disponibles.** Medimos independientemente:

1. **Cobertura-oráculo física (NO predicción)**: para cada cabeza completa real, si ya existía una ruta VT4 exacta, con su madre VT3 física y **respaldo histórico propio**, al abrir puestos maternos VT3 hasta 3, 5, 10, 25, todas las admitidas, y finalmente todas las físicas sin anclaje. La cobertura de la bolsa física puede crecer mucho sin cambiar aciertos.
2. **Selección de diez agrupaciones VT4**: elegir como máximo diez candidatas reales a partir de bolsas maternas más amplias, usando orden PRE y sin mirar resultados. Evaluar si el techo adicional se convierte en coincidencias dentro de diez plazas.
3. **Atribución por ruta**: si una cabeza pudo llegar desde madres diferentes, sólo contar la misma cuaterna una vez por corte y registrar la menor posición materna admitida. No sumar dos hijas idénticas por sus dos madres; no prestar raíces a una ruta sin respaldo.

## Reglas innegociables

Una VT4 **no** se crea mediante inversión total de cuatro cifras: su identidad es madre VT3 reversible + cifra añadida + lado. P. ej. `3226/3622` deriva de `226/622` y prefijo `3`; no inventar `6223` desde inversión completa de `3226`.

El dígito añadido DEBE ser la cuarta casilla física contigua de una ruta de la misma fuente, con cuatro celdas distintas. La existencia física y la raíz VT3 propia son indicadores separados. Los caminos D−1/D−7 proceden sólo de resultados anteriores al objetivo; nunca son marcas predictivas.

## PRE/POST blindado

Usar los 115 `INPUT_PRE_115.json` originalmente preparados; ocultar físicamente `OBJETIVOS_POST_115.json` y fixture con cabezas del turno antes de crear la bolsa. Para cada corte y cada valor de cuatro dígitos `0000`…`9999` codificar, en formato binario comprimido, su **mejor puesto de madre VT3 con ruta propia respaldada** (centinela para ausencia) y si existe alguna ruta física, aun sin respaldo. El mapa completo se congela **sin saber cuál salió**. Sello SHA256 de código, protocolo, entradas y perfiles; commit PRE precede al POST.

Verificar que las 10 agrupaciones de `TOP5_CUPO2` y `TOP10_CUPO1` reproduzcan exactamente los benchmarks anteriores, y comparar estos modelos PRE, todos de **exactamente diez plazas**, sin repetir un valor exacto de cuatro cifras entre agrupaciones:
- `TOP5_CUPO2`: dos hijas de las madres VT3 #1–#5 (referencia 4/115).
- `TOP10_CUPO1`: una hija de cada madre #1–#10.
- `MIX_8MAS2_6A10`: ocho primeras plazas base + dos hijos físicos admitidos de madres VT3 #6–#10, con respaldo propio.
- `MIX_8MAS2_11PLUS`: ocho primeras plazas base + dos hijos respaldados de madre #11 o posterior.
- `MIX_5MAS5_6PLUS`: cinco primeras hijas de madres #1–#5 (una cada una) y cinco hijos de madres #6+ diferentes por rango.
- `MIX_5MAS5_11PLUS`: cinco primeras hijas de madres #1–#5 y cinco hijos de madres VT3 #11+ diferentes.
- `ESTRATOS_ANTERIOR`: recuperar el Top10 ya sellado de madres admitidas por estratos como control de reproducción.

Criterios de desempate: orden nativo VT4 para madres #1–#10 y para #11+ puesto real VT3, fuentes, bloques y familia; ninguna etiqueta POST. Si faltan plazas en un estrato, rellenar con candidatos físicamente legítimos de toda la bolsa admitida, sin duplicar números y registrando carencia; **jamás** reducir el número de puestos ni completar con combinaciones inventadas.

## POST y honestidad

Después del sello, restaurar POST, y medir por nivel de madres: cabezas únicas alcanzables, cortes con alguna cabeza alcanzable, saltos de cobertura (Top5→Top10→Top25→todas admitidas→sin anclaje), y por política de diez plazas: Top3/Top5/Top10, cabezas completas únicas, cambios/gastos de puestos, ganancias y pérdidas. Identificar cortes que mejoraron su **elegibilidad física** aunque no sus Tops. Análisis semanal descriptivo, sin afirmar mejora predictiva por haber usado muchas veces este mismo historial.

El valor de los distintos techos es diagnóstico posterior al sorteo: jamás se puede saber anticipadamente cuáles de los 10.000 valores saldrán. Quiniela aleatoria, evitar inferir ventaja predictiva sin pruebas independientes.

## Archivos
`scripts/lab-vt3-madres-vt4-cobertura.mjs`, workflow independiente, `auditorias/vt3-madres-vt4-cobertura-115-13oct2026/{PRE_115.json,MAPAS_FISICOS_PRE_115.json,SELLO.json,POST_115.json,RESUMEN.json}`, informe final de hallazgos y límites. Todo sólo en rama laboratorio.
