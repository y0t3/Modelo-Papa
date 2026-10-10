# Protocolo preregistrado: atlas de **seguimiento geométrico** por zona, dirección y orientación

Fecha de fijación: 10/10/2026. Rama aislada `auditoria-sorteo-10oct-2026`.
Este protocolo se registra **antes de generar los resultados**.

## Universo y temporalidad
- Usar las 20 hojas reconstruidas de sorteo completo del 08 al 30/09/2026 (incluida la cabeza completa, turno ganador, jurisdicción, tabla +11 y **todos** los recorridos físicos VT2/VT3/VT4 válidos marcados después de cada sorteo). Son datos **retrospectivos**, NO un pronóstico prospectivo ni necesariamente idénticos a cada línea de la tinta original.
- Comparar por separado (A) hoja completa del día con la del **mismo día semanal D−7**, y (B) con la **jornada de sorteo anterior D−1 efectivo**, conservando fecha exacta, no confundir D−7 con ayer.
- Cada registro de una hoja lleva `turno`, `jurisdicción`, `cabeza completa`, `origen/columna física`, `modalidad`, secuencia de celdas, lectura y sus posibilidades de inversión. Las cinco columnas de cada hoja completa están disponibles **solamente a posteriori**. No buscar resultados futuros para construir líneas históricas.
- **Nunca** atribuir valor a una huella que cruza una columna. Una ruta física y su inversión tienen una sola identidad espacial: `VT|origen|secuencia canónica`. Conservar TODAS las cabezas históricas que comparten esa figura física; no duplicar figuras cuando varias cabezas las usaron.
- Validar vecindad sin saltos, sin reusar celdas, fila 0..5, lado 0..1, casilleros rellenos y cifras correspondientes.

## Clasificación física, exhaustiva por cada figura vieja
Comparar figura vieja contra **todas** las figuras confirmadas nuevas de la misma VT y columna de origen, sin selección posterior por resultado:
1. `MISMA_HUELLA`: idénticas celdas en idéntico orden o inverso.
2. `MISMA_FORMA_DESPLAZADA`: idénticos desplazamientos entre celdas (o su inversión) pero otras coordenadas. Informar desplazamiento real y zona vieja/nueva.
3. `TOQUE_EN_EXTREMO`: comparte por lo menos un extremo inicial/final de figura física, sin ser misma forma/huella.
4. `TOQUE_INTERNO`: comparte alguna celda restante, sin relación superior.
5. `SIN_CONTACTO`: ninguna figura nueva de igual VT y fuente comparte celdas con ella.
6. `SIN_FIGURA_COMPARABLE`: no existe ninguna figura confirmada nueva de igual VT y fuente, y se guarda como ausencia explícita; **no** se transforma en prueba de que la formación numérica fuese imposible.

Las clases anteriores se asignan con prioridad preestablecida. Conservar además TODAS las relaciones contra figuras nuevas, incluidas `SIN_CONTACTO`, de forma que la relación prioritaria no esconda rivales. Separar coincidencia **con turno ganador igual** y con turno ganador diferente; misma columna de origen no significa mismo turno ganador.

## Zona y dirección: variables visuales, sin confusión con pronóstico
- Zona calculada de las filas de la huella: `ARRIBA` 0–1, `CENTRO` 2–3, `ABAJO` 4–5; si abarca varias, registrar `ARRIBA→CENTRO`, etc., sin forzar una sola zona.
- Distinguir *topología* de la forma (pasos relativos y cambios de dirección, deduplicando inversión) y *sentido numérico marcado por la cabeza* (secuencia dirigida de las celdas). El sentido `SUBE`, `BAJA`, `HORIZONTAL` o `MIXTO` corresponde a lectura **de ese trazo marcado**, no a un vector de predicción. Conservar si se marcaron **ambos** sentidos en el mismo dibujo.
- Para una misma huella reaparecida, anotar si la lectura antigua y nueva tiene misma orientación, solo inversa o ambas, conservando las cabezas reales que las marcaron; la inversión no crea segundo dibujo.
- Proveer visor doble interactivo por fecha D−7 y D−1: **todos** los recorridos visibles de ambas hojas de entrada; al tocar una cabeza antigua se encienden **todos** sus recorridos y sus correspondencias presentes sin esconder los demás. Figuras viejas sin correspondencia conservan marca «no reapareció» en ese contraste.
- Enumerar todas las figuras nuevas sin relación con ninguna vieja para evitar sesgo de supervivencia.

## Reportes/controles
- Cobertura: número real de pares D−7 y D−1, figuras viejas únicas por VT/fuente, nuevas únicas, 6 clases con denominadores y todos los negativos, tipos de dirección, cambios de zona, casos concretos.
- Controlizar para cada par el número de **todas** las figuras VT2/3/4 físicamente posibles en la hoja nueva y el número de figuras marcadas. Este control describe la abundancia geométrica y por sí mismo **no demuestra ventaja predictiva**.
- Subanálisis **mismo turno ganador** sin reemplazar el criterio general.
- Pruebas automáticas obligatorias para inversión, dirección arriba/abajo, traducción, contacto, ausencia, cambio de turno ganador, cruces imposibles, exhaustividad de clases y fecha D−7.

No modificar `main`, motor, APK oficial, selector ni la rama de diseño. No inventar número candidato, acierto prospectivo o resultado.