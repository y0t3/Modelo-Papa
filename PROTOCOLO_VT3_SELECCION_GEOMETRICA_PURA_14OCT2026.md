# Protocolo de prueba — seleccionar rutas físicas antes de leer sus números VT3
**14 de octubre de 2026. Solo retrospectiva exploratoria, 23 jornadas, 115 cortes.**

## Hipótesis acotada
Investigar únicamente el cambio del ORDEN DE DECISIÓN, no volver a estudiar A/B/C/D como bonificaciones, ni crear un ranking numérico de familias. Para cada corte PRE se reconstruyen los caminos de tres celdas de las cinco fuentes visibles hasta el turno, respetando 6×2, contacto Chebyshev=1, sin celdas repetidas ni cruces entre fuentes. Todas las rutas físicas de cualquier familia están en `EVENTOS_PRE_115.json` del Atlas previamente auditado, y se comprueba su integridad.

Se obtienen los `rootId` de huellas VT3 **realmente confirmadas por cabezas de jornadas anteriores**; los identificadores codifican fecha, período, turno, jurisdicción, cabeza completa, tipo, fuente y celdas. Para evitar que el inventario elegible herede una selección por cifras actuales, se reconstruye la elegibilidad **por geometría únicamente**: fuente + firma relativa reversible de la raíz previa. Se unen TODAS las posiciones actuales físicamente disponibles con esa fuente+firma, aunque su ruta original no figure como anclada por el agrupamiento del motor. La cabeza histórica solo acredita la procedencia de la huella; no se utiliza su valor para seleccionar posiciones.

**La lectura numérica de cada ruta actual solo se realiza después de haber ordenado las posiciones.** Cada posición genera un valor de tres dígitos por lectura física y su familia reversible. No se puede considerar que haber acertado una posición esté confirmado por la quiniela: las cabezas sorteadas no publican coordenadas. El único cotejo observable POST es coincidencia de la familia numérica producida por el recorrido con alguna de las cinco cabezas.

## Políticas PRE congeladas
1. `GEO_RAICES`: ordenar posiciones por **cantidad de eventos históricos ganadores independientes** que avalan la misma fuente+geometría, luego preferir posiciones que se hayan desplazado al menos dos filas desde alguna raíz, finalmente distancia máxima y desempate por fuente/fila/columna/recorrido. Nada de familias/cifras actuales en el orden.
2. `GEO_DESPLAZAMIENTO`: preferir posiciones desplazadas al menos dos filas, luego distancia máxima, luego cantidad de eventos ganadores antiguos distintos, y el mismo desempate geométrico. Mantiene el mismo inventario físico.
3. `NEUTRAL_UNIFORME`: en cada corte, 2.000 ordenamientos neutrales de **las mismas posiciones físicas elegibles**, antes de aplicar deduplicación numérica, con RNG de semilla fija. Se guardan las distribuciones Top3/5/10.

Se publican dos métricas en paralelo:
- **Presupuesto estricto de recorridos:** posiciones #1–#3, #1–#5, #1–#10; si distintos recorridos producen la misma familia, el total de familias únicas será inferior al cupo. Mostrar ese cupo efectivo.
- **Presupuesto normalizado de familias:** tras **congelar el orden de posiciones**, leer cifras y recorrerlo hasta obtener hasta 10 madres VT3 reversibles distintas; medir Top3, Top5, Top10 para comparar con exactamente el mismo cupo del VT3 oficial. Nunca usar los dígitos para desempatar, solo para deduplicar después de ordenar. Se verificará cuántos cortes alcanzan 10 madres distintas.

Las bases `OFICIAL` serán exactamente los Top3, Top5 y Top10 del laboratorio fuente. Se comprobarán contra 5/8/15 aciertos por corte.

## Control de fuga y de dependencia
El workflow retira físicamente `POST_115.json` y el diagnóstico nocturno antes de ejecutar PRE. El algoritmo valida SHA-256 del atlas de eventos y origen; genera PRE y SELLO; recién después devuelve los resultados y ejecuta POST. La neutralidad comparte inventario y presupuesto con el modelo físico. No se recompensa contar múltiples rutas de una misma raíz como resultados históricos independientes.

**Limitaciones importantes:** los 115 cortes ya fueron usados para seleccionar muchas reglas; ni un incremento ni un p-valor exploratorio avala poder de predicción. Las familias ganadoras pueden tener varios caminos y no existe coordenada de sorteo observable. Esta propuesta usa únicamente huellas históricas y geometría; no altera motor oficial, Tops, app, marcado, VT4 ni los PRE prospectivos ya sellados.
