# Punto de control VT3: hermanas de una misma huella histórica — 115 cortes

**Fecha:** 14/10/2026. **Estado:** relectura histórica terminada; rama experimental aislada y motor oficial intacto. Análisis ejecutado sobre archivos GitHub `PRE_115.json` y `POST_115.json` de los 115 cortes (23 jornadas). Se dejaron `scripts/lab-vt3-huellas-hermanas-115.mjs` para reproducir el cálculo y `auditorias/vt3-huellas-hermanas-115-14oct2026/RESUMEN_VERIFICADO.json` para respaldar cifras. **No se ejecutó un GitHub Action nuevo.** La comprobación original fue realizada directamente con el conector y los datos íntegros de GitHub. No presentar este examen como resultado prospectivo.

## Hipótesis controlada

Analizar si una familia hija es preferible a sus hermanas cuando reproduce **la misma ruta ganadora antigua**, en la misma fuente, pero a otra altura de la tabla.

La unidad de grupo es `evento ganador completo + fuente + tres casillas antiguas (misma orientación o inversa)`. La coincidencia geométrica se confirma usando las tres casillas actuales que se obtienen de **una única traslación rígida válida** del recorrido antiguo (mismos movimientos físicos, sin salir de una fuente ni saltar filas). Si una bifurcación heredó la raíz de una hermana, **no se cuenta como un traslado directo adicional**. Se preserva la raíz, pero no se le adjudica otra confirmación geométrica.

## Inventario histórico

**6.389 registros de familias admitidas por turno**, todos con alguna traslación directa validada. Se observaron **2.168 grupos raíz física/corte con dos o más familias hermanas** y **100 registros de grupos que contenían al menos una familia ganadora**.

**Atención:** estos 100 grupos positivos no son 100 cabezas ni 100 aciertos independientes. Una cabeza ganadora puede coincidir con una familia respaldada simultáneamente por múltiples huellas antiguas y repetirse entre cortes.

### Desplazamiento mínimo físico por familia

| Distancia de la huella ganadora antigua a su aparición actual | Registros familia/corte | Registros coincidentes con alguna cabeza |
|---|---:|---:|
| Desplazamiento cero | **1.924** | 16 |
| Una casilla | **2.277** | 21 |
| Dos o más casillas | **2.188** | 27 |

La distancia es el **menor** desplazamiento absoluto de todas las raíces trasladadas directamente a esa familia. No es una distancia elegida después del acierto ni una transición entre columnas. Estos recuentos no permiten deducir probabilidades de sorteos y no son series independientes.

### Una candidata por grupo de hermanas

Cada grupo ofrece múltiples familias con la **misma huella antigua**. Se evaluó elegir una por grupo con tres criterios mecánicos **antes de cotejar cada grupo con la familia ganadora**, pero definidos en un análisis histórico ya conocido:

| Criterio de elección de hermana | Grupos donde fue seleccionada una familia ganadora |
|---|---:|
| Recorrido actual con **menor** desplazamiento | **18** |
| Recorrido actual con **mayor** desplazamiento | **30** |
| Familia **mejor ubicada en el ranking VT3 oficial** | **39** |
| Elección uniforme entre hermanas, expectativa matemática | **22,89** |

Se generaron **3.000 controles neutrales**: una elección por grupo mediante hash FNV32 con semilla de réplica, conservando la misma preferencia raíz/familia al repetirse entre turnos. Obtuvieron promedio **22,72** grupos seleccionados con ganador, percentiles 5–95 de **16–30**, y rango de **9–37**.

La elección por mayor distancia alcanzó 30, el límite superior del intervalo central neutral; en el control unilateral 6,16% de las réplicas alcanzaron 30 o más. **No hay evidencia suficientemente consistente para imponer «cuanto más lejos mejor».** La elección por menor distancia obtuvo 18, por debajo del promedio neutral.

La selección por mejor ranking VT3 obtuvo 39, encima de las 3.000 réplicas neutrales. Es una observación interesante de la **capacidad del orden oficial para distinguir familias hermanas dentro de esta muestra histórica**, pero **NO** es un Top3 ni un Top10; **NO** es evidencia confirmatoria debido al reuso de los 115 cortes, a las múltiples reglas analizadas anteriormente y a que los mismos resultados pueden aparecer en varios grupos interdependientes. No sustituir pruebas futuras selladas antes de sortear.

### Inestabilidad entre meses

| Mes | Grupos de hermanas | Selección distancia mínima | Selección distancia máxima | Mejor rango VT3 |
|---|---:|---:|---:|---:|
| Septiembre (70 cortes) | 1.373 | 13 | 25 | 24 |
| Octubre hasta 10/10 (45 cortes) | 795 | 5 | 5 | 15 |

La supuesta preferencia por mayor desplazamiento **desaparece en octubre**: ambas políticas empatan 5–5. Por ello no convertir distancia en prioridad del motor.

## La continuidad intradía tampoco es evidencia independiente

Entre las **4.774 apariciones de familias ya presentes en el turno anterior del mismo día**, hubo **4.774** que todavía conservaban al menos una ruta física exacta. Esto se explica por la mecánica de la hoja diaria, que retiene fuentes anteriores y añade nuevas columnas. La continuidad de esa ruta no constituye una nueva cabeza ganadora ni respaldo autónomo D−1/D−7. Es diferente de que una familia gane una **nueva fuente física** o una **nueva raíz histórica**.

## Cierre del caso del 13/10: 234/432 vs 768/867

En Nocturna del 13/10, las familias **`234/432` y `768/867`** nacieron de la misma terna antigua `226` de `9226` (Ciudad Vespertina 06/10), con la misma secuencia de casillas de la fuente Matutino:

- Huella vieja: `3:0 → 4:0 → 3:1`.
- `234/432`: huella nueva `2:0 → 3:0 → 2:1` (−1 fila), acertó la terminación de `1234`.
- `768/867`: huella nueva `0:0 → 1:0 → 0:1` (−3 filas), no coincidió con las cabezas nocturnas.

Que la primera haya acertado **no justifica seleccionar sistemáticamente el traslado más cercano**. En los 115 cortes reanalizados, esa preferencia no fue favorable.

## Decisión técnica

1. **Conservar VT3 oficial, sus familias reversibles y sus raíces físicas verificadas**. No introducir nuevos recorridos ni invertir VT4 completa para crear falsas madres.
2. Al describir la evidencia de una familia, distinguir claramente `evento ganador`, `recorrido antiguo exacto`, `traslado directo`, `bifurcación derivada`, `familias hermanas de ese recorrido` y `presencia física que persiste entre turnos`. No sumar automáticamente hermanas como múltiples antecedentes.
3. **Descartar por ahora el criterio «más cerca es mejor»**; «más lejos es mejor» tampoco presenta consistencia suficiente, y la ventaja del rango oficial en el análisis condicionado no valida pronósticos.
4. El próximo control genuino debe ser un PRE anterior al sorteo, con reglas congeladas. Hasta entonces no modificar el top.

## Integridad

Datos origen `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/{PRE_115.json,POST_115.json}`; respaldos `auditorias/vt3-huellas-hermanas-115-14oct2026/RESUMEN_VERIFICADO.json`; script `scripts/lab-vt3-huellas-hermanas-115.mjs`. **No hay flujo GitHub Actions nuevo ejecutado ni sello prospectivo** para este ensayo. Es una relectura independiente y honesta de los mismos datos históricos.
