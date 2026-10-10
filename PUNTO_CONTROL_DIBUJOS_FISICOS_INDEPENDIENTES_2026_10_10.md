# Modelo Papá — Dos dibujos independientes versus dos cabezas históricas

Fecha: 10/10/2026. Rama `experimento-analisis-visual-5d`.
Continuación de `PUNTO_CONTROL_TOPOLOGIA_CONTACTOS_NEGATIVOS_2026_10_10.md`.

## Hallazgo geométrico adicional, verificado después de una nueva auditoría

Para una formación de VT2, VT3 o VT4, hay que distinguir:

1. **Cabeza histórica:** sorteo ya ocurrido que aportó una terminación coincidente.
2. **Recorrido histórico ordenado:** columna física + secuencia exacta de celdas, sentido incluido.
3. **Dibujo físico único:** columna física + huella de celdas, considerando la secuencia y SU INVERSIÓN como la **misma geometría física** a efectos de contar formas. Dos caminos distintos pueden tocarse o cruzarse, pero no se identifican entre sí si no son la misma secuencia ni su inversa.

Varias cabezas diferentes pueden explicar una sola geometría repetida. El hecho de leer ABC y CBA por la misma huella invertida NO suma una segunda figura físicamente independiente. Los tests automáticos incluyen rutas invertidas y cabezas repetidas.

### Comparación antes de Matutina (sin usar todavía su resultado para construir el dibujo)

| Corte y familia VT3 | Cabezas antiguas distintas | Caminos históricos (por cabeza) | Dibujos físicos únicos (sin contar inversa dos veces) | Marcas previas de hoy que tocaban |
|---|---:|---:|---:|---|
| 29/09 `289/982` | 2: **8037**, **1760** | 2 | **2** | **4983** de Primera |
| 29/09 `384/483` | 2: **2949**, **7949** | 4 | **1** | **0154** y **4983** de Primera |
| 30/09 `778/877` | 2: **4983**, **7289** | 2 | **2** | **4107** de Primera |

Todas esas relaciones se encontraban en la columna física `prevNocturno` (Nocturna anterior +11). Los dibujos no cruzaron columnas. El mismo criterio se aplicó a TODOS los recorridos de los 30 cortes ciegos, no únicamente a estas tres familias.

**Detalles físicos del 29/09:**
- `289/982`: huella antigua de cabeza 8037 `3:1→3:0→2:0`; huella antigua de cabeza 1760 `2:0→2:1→3:1`. Son dos figuras distintas; ambas contactaron la marca VT3 de cabeza 4983 publicada en Primera del 29.
- `384/483`: huellas antiguas de 2949 `0:0→0:1→1:1` y `1:1→0:1→0:0`; las **mismas** huellas aparecen también ligadas a 7949. Los cuatro registros cabeza-ruta se reducen a **UNA** huella física cuando no duplicamos la inversión.
- `778/877`: huella antigua de 4983 `3:1→2:1→1:1` y huella antigua de 7289 `2:0→2:1→3:1`. Dos trazos diferentes, ambos contactados por recorridos VT2 de la cabeza conocida 4107 de Primera del 30.

**Verificación retrospectiva separada:** Matutina del 29 confirmó VT3 289 (cabeza completa 7289), Matutina del 30 confirmó VT3 778 (cabeza completa 6778), mientras que VT3 384/483 NO apareció entre las seis cabezas Matutina del 29. **Estos son matches retrospectivos; no son pronósticos realizados.**

### Otro límite imprescindible

La cabeza 7342 del 29 dejó dos recorridos VT3 diferentes que antes de Matutina 30 se releían como `304/403`. Es decir, **dos dibujos físicos distintos tampoco implican dos cabezas históricas diferentes**. La distinción es doble: procedencia histórica y procedencia geométrica.

Otras familias VT2 con múltiples contactos y dibujos pueden fallar (por ejemplo en Matutina del 24/25/28). Por tanto, el doble origen geométrico **NO** se declara predictor general, ni se descarta VT2/VT4, ni se agrega una regla de puntuación.

## Evidencia reproducible

GitHub Actions, pruebas superadas: https://github.com/y0t3/Modelo-Papa/actions/runs/38046160100

Atlas de 30 cortes, con cantidades de dibujos distintos, cada camino y marcas tocadas:
https://github.com/y0t3/Modelo-Papa/actions/runs/38046160100/artifacts/11667644195

Resultados guardados posteriormente y en otro archivo:
https://github.com/y0t3/Modelo-Papa/actions/runs/38046160100/artifacts/11667244628

`scripts/run-contact-topology-observer7d.cjs` cuenta ahora las **huellas únicas sin orientación** en cada familia y verifica que una cabeza duplicada o una inversión no se conviertan en una segunda forma. No se modificó la app principal ni el selector.

## Hipótesis cualitativa para EXAMINAR fuera de la muestra donde surgió

**Pregunta preespecificada antes de mirar otra semana** (NO criterio predictivo validado): antes de Matutina, ¿surge una figura VT3 desde **dos cabezas históricas distintas y dos huellas físicas distintas**, dentro de una columna +11 disponible, donde ambas huellas muestran continuidad/contacto con marcas ya comprobadas de Primera? ¿Surgen muchas figuras así o sólo una? ¿Qué pasa con las figuras que muestran igual anatomía y NO coinciden?

**Reglas de registro para la comparación, sin ajustes después de conocer los resultados:**
- Se reconstruye toda hoja histórica marcada en secuencia temporal, conservando VT2/VT3/VT4, todas las rutas, sus cabezas completas y su origen. No se inventan caminos en tablero vacío.
- Una ruta y su inversión **no** cuentan como dos dibujos físicos; deben ser dos secuencias diferentes no invertibles.
- No se mezclan celdas entre columnas; la familia se lee sólo en fuentes disponibles antes del turno.
- Se registran TODAS las familias que satisfacen la descripción, sin elegir por la cifra ni por resultados; si hay más de una, registrar **AMBIGUO / OBSERVAR** (no forzar un Top). Si no hay ninguna, también se registra OBSERVAR.
- Se conservan por separado las dos orientaciones numéricas posibles, sin presentarlas como una apuesta VT3 única ni como dos confirmaciones independientes.
- La eventual coincidencia se compara únicamente después, contra las seis cabezas publicadas; faltantes quedan indeterminados.
- La comparación fuera del pequeño período usado para formular esta hipótesis será otra semana anterior, por ejemplo **16–23/09/2026**. Aunque se realice sin consultar primero las cabezas objetivo de esos cortes, seguirá siendo una prueba histórica retrospectiva, NO un ensayo prospectivo real.

**Estado:** nueva distinción físicamente verificada; hipótesis predictiva todavía NO demostrada. No hay recomendación de apuesta derivada de este hallazgo.
