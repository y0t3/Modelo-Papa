# Protocolo — Atlas de cuatro dimensiones VT3 (14/10/2026)

## Alcance y congelamiento
Investigación retrospectiva sobre 23 jornadas y 115 cortes previamente utilizados. No prueba capacidad predictiva. Se trabaja en rama independiente, sin tocar `main`, VT3 oficial, VT4 ni el PRE prospectivo de 14/10.
La unidad física es la ruta completa válida de TRES celdas con fuente propia; se deduplica la inversión del trayecto y se mantienen formas distintas de una familia. La firma geométrica usa desplazamientos relativos y es canónica bajo inversión; puede enlazar FAMILIAS NUMÉRICAS DIFERENTES.

## Variables calculadas exclusivamente PRE
- A: una firma de forma de la misma fuente homónima estuvo en la jornada operativa previa, cambió de posición y también cambió la familia numérica. No es continuidad de número.
- B: una familia de la hoja actual se encuentra en al menos dos fuentes físicas con la misma firma. Es convergencia física, nunca camino entre columnas.
- C: una firma geométrica de la misma fuente estuvo en la fecha D−7 exacta (misma referencia semanal), con familia distinta. La presencia numérica D−7 y las raíces D−7 se conservan aparte.
- D: entre dos jornadas operativas de igual turno, la misma familia y fuente tiene bloques de tres celdas que comparten exactamente dos casilleros y difieren en firma geométrica (mutación de un casillero).
Los criterios pueden coexistir. Para A/C el soporte anterior es físicamente disponible, NO equivale a una cabeza históricamente ganadora; los `rootIds` propios y el anclaje nunca se inventan.

## Registro y evaluación
Cada evento registra fecha, turno objetivo, fuente, familia, orientación numérica real, tres casilleros físicos, firma, posición y raíces. Sin cabeza objetivo ni jurisdicción posterior. La cabeza completa se incorpora únicamente a POST.
- PRE: todo el inventario físico, señales A/B/C/D, propuestas y elecciones neutras precomputadas.
- POST: cobertura Top3/5/10 contra cinco cabezas reales por corte, distribución de señales entre ganadoras y no ganadoras y esperados emparejados por condiciones PRE.
- Selector experimental `ATLAS_P3`: mantiene los puestos oficiales #1 y #2; asciende al puesto #3 desde puestos #3–#10 usando cantidad de A+B+C+D, desempate puesto original, sin alterar integrantes del Top10.
- Selector experimental `ATLAS_P10_ABIERTO`: preserva primeros nueve oficiales y sólo sustituye el décimo por una familia física NO anclada con alguna señal; elegir la de más señales, luego fuentes, bloques, alfabético. Si no existe elegible, dejar Top10 original.
- Control `HASH_P3`: hash determinista sobre el mismo inventario #3–#10. Control `HASH_P10_ABIERTO`: hash determinista sobre la misma bolsa elegible. Además 2.000 elecciones uniformes para los mismos puestos y el mismo conjunto de elegibles.
Se mantendrán cinco cabezas por corte, unidad de acierto corte/familia y análisis de sesgo de cobertura. La mejora sobre resultados ya vistos, incluyendo variantes precedentes, es EXPLORATORIA y susceptible a selección múltiple.

## Blindaje
Workflow mueve `POST_115.json` a ubicación temporal fuera del repo durante PRE; la fase PRE aborta si POST está accesible. Se sellan SHA-256 de insumo, código, protocolo y salidas PRE antes de restaurar POST. La comparación posterior comprueba todos los SHA. Se registran también las formas que no ganaron y la magnitud de exposición, para no convertir apariciones frecuentes en señales de éxito.

## Restricciones físicas
Columnas 6×2; tres celdas distintas, vecinas Chebyshev=1, sin espacios vacíos ni cruce de fuentes; siempre invertir sólo familia VT3. Ninguna extensión VT4 se genera en este laboratorio.
