# Top10 VT3 de Lalo: leer SOLAMENTE las dos últimas cifras

**Estudio corregido, 30/10/2026**  
Rama aislada: `lab/top-vt3-ultimas-dos-exactas-30oct`  
Motivo: el usuario corrigió explícitamente la interpretación anterior: NO se deben cortar recorridos físicos ni crear familias `13/31` a partir de cada par. Quiere las dos terminaciones exactas de las dos lecturas VT3 **tal como están mostradas, en el MISMO puesto Top10**.

## Regla exacta

Una fila `#N ABC / XYZ` se representa como `#N BC / YZ`: se toman literalmente los dos últimos caracteres de CADA uno de los dos números. **No se hacen inversiones adicionales, normalizaciones, combinaciones ni búsquedas de aristas o rutas**. Ejemplos del usuario:
- `513 / 351` -> `13 / 51`.
- `412 / 214` -> `12 / 14`.
- `310 / 013` -> `10 / 13`, conservando el cero.
- `513 / 315` -> `13 / 15`.

Nota técnica: las familias de Lalo **en la aplicación** son habitualmente pares reversibles (por ejemplo, `315 / 513`). El ejemplo `513 / 351` no es una pareja reversible, pero la transformación literal `13 / 51` sería correcta *si ese par fuese efectivamente mostrado*. La transformación siempre toma la pareja real almacenada, sin corregirla por supuestos.

**Siempre hay diez puestos**, cada uno con dos lecturas terminadas en VT2; algunas terminaciones coinciden entre puestos y otras pueden ser iguales dentro de un mismo puesto. En octubre hubo un promedio de **15,04 terminaciones distintas**, no veinte familias nuevas.

### PRE / POST

El mismo motor `buildMotorLalo` reconstruye los top10 VT2 y VT3 anteriores al sorteo objetivo. Los únicos datos que usa el medidor al crear `#N BC/YZ` son la fecha, el turno y el Top10 VT3 ya calculado por Lalo. **Las cabezas reales de ese turno se leen únicamente POST**, para comparar `head.slice(-2)` contra cada pareja. Se registran los aciertos repetidos de un puesto pero cada cabeza se cuenta una sola vez al evaluar cobertura global.

El Top10 VT2 original conserva sus familias reversibles y se evalúa exactamente con sus dos lecturas actuales. El Top10 paralelo NO hereda la reversibilidad de VT2: esto permite cuantificar lo que realmente no estaba en VT2.

## Reproducción histórica

Con datos PRE reconstruidos de Ciudad, Provincia, Córdoba, Santa Fe y Entre Ríos; Montevideo queda excluido por calendario especial. Las 5 cifras, cuando aparezcan, se aceptan para comparar su sufijo; la muestra completa usada tenía 4 por jurisdicción.

| Corte | Jornadas | Cortes | Cabezas | Coincidencias del Top10 VT2 | Coincidencias de las terminaciones VT3 | Solo terminaciones VT3, fuera del Top10 VT2 | Cobertura combinada |
|---|---:|---:|---:|---:|---:|---:|---:|
| Junio–septiembre | **103** | **515** | **2.575** | 510 | 376 | **143** | **653** |
| Octubre 12–29 | **16** | **80** | **400** | 70 | 68 | **29** | **99** |
| **Total** | **119** | **595** | **2.975** | **580** | **444** | **172** | **752** |

**Más cobertura no significa mejor selectividad ni probabilidad de ganar**: las terminaciones VT3 amplían el conjunto de números considerados. Aunque se mantengan diez filas, son en promedio 15 números VT2 distintos por turno adicionales en su forma visual (varios solapados con VT2).

### Desglose por turno: cabezas exclusivas agregadas por las terminaciones VT3

| Turno | Junio–septiembre | Octubre 12–29 |
|---|---:|---:|
| Previa | 13 | 3 |
| Primera | 21 | 4 |
| Matutino | 27 | 5 |
| Vespertino | 35 | 5 |
| Nocturno | **47** | **12** |

No hay que postular un motor nuevo para mostrar estas coincidencias: la simple lectura literal ya explica el fenómeno que observó el usuario.

### Nocturna, específicamente

- Junio–septiembre: 515 cabezas, VT2 Top10 original **96**, terminaciones VT3 **91**, superposición **44**, **47 aportes exclusivos**, unión **143**.
- Octubre: 80 cabezas, VT2 Top10 **11**, terminaciones VT3 **15**, superposición **3**, **12 aportes exclusivos**, unión **23**.
- Puestos #7 y #8 en junio–septiembre: **13 jornadas con ≥1 coincidencia cada uno**, pero esto NO significa una racha PRE explotable.

Ejemplos VERIFICADOS del 29/10 y fechas próximas:
- 27/10 Nocturno: `#2 277/772 → 77/72` y `#4 177/771 → 77/71` coinciden ambos con **Entre Ríos 3877**; esa cabeza solo suma **una** cobertura, aunque figure en dos puestos.
- 28/10 Nocturno: `#5 646/646 → 46/46`, `#7 046/640 → 46/40`, `#9 648/846 → 48/46` coincidieron con **Provincia 3946**. `#3 466/664 → 66/64` y `#10 668/866 → 68/66` coincidieron con **Santa Fe 6666**. Se cuentan dos cabezas, no cinco aciertos independientes.
- 29/10 Nocturno: `#3 106/601 → 06/01` coincidió con **Córdoba 6906**.

Estos ejemplos se obtuvieron tras conocer los resultados; **no constituyen pronósticos previos sellados**.

## ¿Se puede declarar una racha de un puesto específico?

Ensayo PRE simple: un puesto #N en el MISMO turno activa una alerta si sus dos terminaciones coincidieron con al menos una cabeza de **dos de las tres Nocturnas anteriores**. Para fechas sin historial completo no se activa ninguna.

| Período de Nocturna | Alertas PRE (2 en 3) | Aciertos posteriores en alertas | Aciertos entre puestos sin alerta |
|---|---:|---:|---:|
| Junio–septiembre | 30 | 3 | 91 de 970 |
| Octubre 12–29 | 1 | 0 | 21 de 129 |

El mecanismo no ofrece ventaja estable. Con dos de las **cinco jornadas anteriores**:
- Junio–septiembre: **11 aciertos en 82 alertas**, contra **82 en 898 observaciones sin alerta**.
- Octubre: **0 en 6 alertas**, frente a **18 en 104 sin alerta**.

Hay casos de puestos que tuvieron aciertos repetidos, pero la persistencia del puesto todavía **no demuestra predictibilidad para la próxima jornada**. Evitar identificar un #7 o #8 como «activo» únicamente por una ventana histórica que resultó favorable.

## Implementación mínima de visualización

En `src/ui/PredictionSummary.tsx`, cada tarjeta VT3 de **Lalo** ahora agrega una línea **«Últimas 2: 15 / 13»** (siguiendo exactamente el orden almacenado del par VT3) y marca **✓** en cada terminación que coincide con una cabeza ya publicada. Son las mismas diez tarjetas y NO aparece ningún panel extra, ningún listado por aristas ni un tercer Top10. Los resultados del sorteo jamás participan en la derivación de las terminaciones.

**IMPORTANTE**: esto está en rama de laboratorio y no ha sido fusionado ni publicado como APK. La implementación anterior en otra rama que mostraba **dos aristas físicas** resolvía otra pregunta distinta y **no debe usarse** como fundamento de este estudio. Se mantiene aislada, sin modificar motores oficiales.

## Reproducibilidad

- `src/labVt3Terminations.ts`: transformación directa de dos lecturas VT3 a dos sufijos, cotejo POST y seguimiento por puesto/turno.
- `scripts/test-vt3-ultimas-dos.ts`: casos de usuario, ceros, duplicaciones y regla 2/3 sin fuga temporal.
- `scripts/lab-vt3-ultimas-dos.ts`: replay 119 jornadas / 595 cortes, totales por puesto/turno y alertas 2/3, 2/5 y 3/5.
- `.github/workflows/lab-vt3-ultimas-dos.yml`: TypeScript UI, pruebas unitarias, regresión MV1, períodos junio–septiembre y octubre. Artefacto `vt3-dos-ultimas-lalo-jun-oct`.

Las pruebas históricas son reconstrucciones con resultados anteriores y cotejo POST; **no se ha demostrado ventaja predictiva ni rendimiento monetario**.
