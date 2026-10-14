# PRE paralelo prospectivo — posiciones antes que cifras, Previa 14/10/2026

Partimos del sello genuino original de Previa 14/10 y del PRE paralelo de genealogía existente, sin modificar ninguno de sus bytes. El objetivo está vacío. No se consulta resultado de la Previa 14/10 ni ningún turno posterior.

**Dos políticas predefinidas en laboratorio retrospectivo**:
- GEO_RAICES: ordenar rutas físicas de tres casillas por cantidad de eventos de cabezas históricas independientes que tienen igual firma en la misma fuente, después desplazamiento >=2 filas respecto de una huella confirmada, luego máximo desplazamiento, y desempate por fuente y coordenadas.
- GEO_DESPLAZAMIENTO: privilegiar desplazamiento >=2 filas, luego máximo desplazamiento, cantidad de eventos históricos independientes y desempate fijo por fuente/posiciones.
- Control hash SHA256 de `2026-10-14|Previa|geokey`, también exclusivamente geométrico.

**Regla central:** construir universo de rutas con celdas disponibles y raíces VT3 previas comprobadas, unir raíces y rutas por `sourceId + firma geométrica reversible`. Prohibido utilizar cifras actuales o familias para ordenar las rutas. Recién después de ordenarlas, leer las cifras de cada ruta y deduplicar las familias reversibles para obtener Top3, Top5 y Top10. Preservar adicionalmente el resultado de las diez primeras posiciones sin deduplicar.

Validez: 6 filas por 2 columnas por fuente; tres celdas únicas contiguas, sin cruces ni saltos. Comparar solo fuentes existentes antes del turno Previa. Validar SHA256 PRE/Sello anterior de GitHub y reproducir familias/ranking original con los mismos D−1 y D−7. Rechazar cualquier cabeza objetivo en la hoja. Registrar PRE rutas elegidas + lista y hash y resultados, antes de POST futuro. No tocar `main`, VT4, tops oficiales ni sellos originales.

**Advertencia metodológica:** el desplazamiento ganó 8 Top3 en 115 cortes históricos pero el beneficio se concentró en septiembre (6 vs 3) y no mejoró octubre (2 vs 2). Este PRE sirve para evaluación temporal sin reajuste; no predice coordenadas observables por la lotería, sólo la terna generada por una ruta preseleccionada.
