# Regla candidata VT3 congelada para próximos cortes: tercer puesto D−1

**Fecha de definición:** 13 de octubre de 2026, antes de obtener evidencia prospectiva de los cortes a partir del 14/10/2026.

Este documento define una política de prueba de investigación, **no es una predicción comprobada ni una modificación del motor oficial**.

## Selección PRE, sin resultados del turno

Para un día `D` y turno `T`, usar la salida del motor oficial reconstruida **antes** de conocer las cinco cabezas del turno. Validar que no haya resultado de `(D,T)` en el objeto de construcción, y que todas las raíces de ejemplo correspondan a fechas anteriores a `D`. Conservar los rangos oficiales `vt3` y la documentación de recorridos reales en esa hoja.

1. Tomar las diez primeras **familias VT3** del ranking oficial; mantener fijas las posiciones originales **#1 y #2**.
2. Considerar para la tercera plaza sólo las familias originales de rangos **#3 a #10**, sin introducir ni excluir una familia del Top10.
3. Elegir la familia con el mayor número de **eventos ganadores D−1 propios e independientes**, tal como los agrupa `d1Roots` del motor: una misma cabeza ganadora con varios recorridos cuenta como **un evento**, no múltiples votos.
4. Empatar por: mayor `d7Roots` propio; después mayor `physicalBlocks` físico; finalmente menor rango original.
5. Adelantar la elegida al tercer lugar. Las demás se desplazan conservando el orden relativo. Las ten primeras familias y la hoja física permanecen iguales.

**Baselines paralelos**: (a) Top3 oficial original; (b) Top3 con tercer puesto elegido por hash determinista `sha256(date+'|'+turn+'|'+family)` entre #3–#10, sin ninguna cabeza objetivo. La selección exacta, variantes, parámetros y su hash deben quedar guardados en GitHub con commit y hora anteriores a cada sorteo; si no existe prueba temporal del sello, clasificar ese corte como retrospectivo y no como prospectivo.

## Cotejo posterior inmutable

En cada corte se reciben cinco cabezas de cuatro dígitos, pero se contrasta VT3 **únicamente con sus tres últimos dígitos**, agrupados en familia reversible (`abc/cba`). Medir por separado: coincidencia Top3 por corte, cuántas cabezas, rango final y su camino/raíz, Top5 y Top10; contrastar contra ambas líneas de base. No conceder aciertos VT4 mediante inversión de cuaternas.

**Tramo mínimo fijado:** 115 cortes nuevos completos (23 jornadas de cinco turnos) o toda la secuencia natural equivalente de turnos a partir del primer corte PRE efectivamente sellado, sin seleccionar días favorables. Publicar resultados favorables y desfavorables, señalando la cobertura real y sin alterar reglas durante el tramo. Los cortes de referencia ya inspeccionados (15/09–10/10 y 12/10) **no cuentan** como prueba prospectiva.

## Limitaciones

El histórico de desarrollo fue reanalizado y muchos criterios fueron ensayados. La diferencia histórica de 8 Top3 vs 5 oficiales tuvo cola neutral ~15,6 %, insuficiente para demostrar capacidad predictiva. Los sorteos siguen siendo aleatorios. Ningún mecanismo de apuestas o recomendación de dinero se habilita por este protocolo.

**Estado:** regla definida y versionada; **aún no sellada para un corte nuevo** porque hay que disponer del tablero PRE real de ese corte. No se inventarán futuras columnas, sorteos ni señales físicas.
