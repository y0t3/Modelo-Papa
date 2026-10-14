# Protocolo de prueba VT3 — Novedad física frente a respaldo acumulado

**14/10/2026 — rama de laboratorio, 115 cortes históricos PRE/POST.**

## Problema específico
La tabla diaria agrega una fuente de dos columnas en cada turno; **nunca se eliminan las anteriores**. Entre turnos de un mismo día una familia físicamente existente no puede desaparecer. Por eso una secuencia binaria 10101 por COLUMNAS no representa 10101 por CORTES: distingue disponibilidad individual por fuente de disponibilidad acumulativa.

Queremos averiguar si, con el mismo inventario completo de madres VT3 físicamente posibles, ordenar por **eventos de nueva columna** mejora Top3/Top5/Top10 respecto de ordenar por evidencia acumulada. No inferir ningún resultado de una coordenada; el POST mira ternas coincidentes con las cinco cabezas sorteadas.

## Fuente y definiciones congeladas
Usar los perfiles PRE de `auditorias/vt3-transiciones-individuales-115-13oct2026/PRE_115.json`, cuyo propio proceso verificó las rutas físicas y los antecedentes PRE de `vt3-cobertura-bifurcaciones` y `vt3-nacimientos-convergencias`, con hashes oficiales. Son 115 cortes, 23 fechas, familias físicas completas, no solamente ancladas. Revalidar exactitud de familias, orden de cortes y estados. Las 115 cabezas objetivo deben estar ocultas en PRE.

En cada corte, cada familia tiene:
- `INICIAL`: Previa, primera fuente del día (no puede considerarse nacimiento comparado con otra columna de ese día).
- `NACE_FISICAMENTE`: no existía en ninguna fuente anterior del día y aparece en la **nueva** fuente.
- `CONVERGE_FUENTES`: ya existía y obtiene al menos un camino físico propio de la **nueva** fuente. Las rutas viejas no son nuevas.
- `YA_PRESENTE`: no obtiene recorrido en la fuente nueva, aunque conserve rutas de columnas anteriores.
- `newAnchor`: al menos uno de los nuevos caminos está ligado a una raíz histórica PRE genuina de esa **misma fuente**. Una raíz vieja en otra fuente no es nueva.
- `newBlocks2`: dos o más bloques físicos de tres celdas distintos de la fuente recién incorporada, sin contarlos como eventos independientes por repetir orientaciones.

No penalizar ni multiplicar presencia acumulativa por corte. Una familia sin novedad sigue elegible, pero se ordena después de los nuevos eventos. La familia reversible sigue siendo la unidad para el cupo de candidatos y la validación.

## Políticas PREFIJADAS antes del POST
Todas usan las mismas familias físicas elegibles en cada corte y producen diez familias únicas sin restricciones por cifras. Ninguna lee cabezas objetivo; el nombre de familia se usa únicamente como identidad de salida y desempate fijo.
- `ACUMULADO`: orden lexicográfico por anclaje histórico, raíces D−1+D−7, número de fuentes, bloques físicos, caminos; desempate familia ascendente. Es un comparador de presencia, **no el VT3 oficial**.
- `NOVEDAD_FUENTE`: primero fuente nueva presente, luego `newAnchor`, `birth`, `converge`, `newBlocks2`; después comparador acumulado.
- `NOVEDAD_RAIZ`: primero `newAnchor`, luego `birth`, `converge`, `newSource`, `newBlocks2`; después comparador acumulado.
- `OFICIAL` y `GEOMETRIA_COMPLETA_ANTERIOR`: Tops heredados de auditorías anteriores para no reescribir resultados.
- `NEUTRAL_TODAS`: 2.000 selecciones uniformes de diez familias disponibles, mismo corte.
- `NEUTRAL_NOVEDAD`: 2.000 selecciones uniformes con la misma restricción `newSource` por delante de los demás, para distinguir la señal del simple filtrado de la nueva columna. Previa utiliza selección uniforme global.

El primer criterio en los dos modelos de novedad es distinto y **no se elegirá retrospectivamente el más favorable** para producción. PRE emitirá familias, perfiles y estados, y sello SHA256 antes de reabrir resultados. POST comparará Top3/Top5/Top10, ganancias/pérdidas por corte, fracción de candidatos nuevos vs estables, cuántas ganadoras fueron nuevas, análisis por turno/mes, y estabilidad de Top3 dentro de la jornada. Control de cinco cabezas reales por corte (una familia puede coincidir con varias cabezas; para TOP se cuenta el corte una sola vez).

## Precauciones
El corpus de septiembre/octubre fue explorado numerosas veces: ningún resultado retrospectivo es confirmatorio. Es incorrecto llamar «se apagó / reapareció dentro del día» a una familia de tablero acumulativo. Los caminos y familia reversibles se conservan; VT4 nunca genera madres por inversión de la cuaterna. **No modificar `main`, app, motor oficial, VT4, sellos genuinos anteriores.**
