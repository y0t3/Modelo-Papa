# Modelo Papá — Continuidad de figura VT3 D−14 → D−7 → D
Fecha de control 2026-10-10 · Rama experimental `experimento-analisis-visual-5d`.

## Hipótesis
El padre comparaba la hoja del mismo día de la semana anterior y podía
estudiar recorridos marcados. Una hipótesis precisa: una figura VT3
ganadora con **idéntico recorrido físico** marcado en D−14 y D−7
podría merecer prioridad al proyectarse a D.

Identidad geométrica estricta = misma secuencia ordenada de celdas,
mismo turno de salida y misma columna física. NO exige que el número
de la cabeza sea igual entre semanas. Se reconstruyeron todas las
rutas ganadoras VT3 de las dos hojas, no sólo una ruta ilustrativa.
Sólo si ambas fechas existen y están completas se incluye D en el ensayo.

El lector base sigue ordenando VT3 sobre D−7, con cupo Top3. La variante
no introduce nuevas candidatas; solamente da prioridad binaria a un VT3
si ALGUNA de sus rutas físicas válidas en D−7 había sido marcada también
en D−14. Dentro de cada clase persiste el orden anterior. El resultado
de D se revela únicamente después de congelar ambos listados.
Se registran los sufijos VT2 sin contarlos como segundo evento autónomo.

## Resultado frente al mismo cupo VT3
| Período | Turnos con D−14 y D−7 | Candidatas VT3 | Candidatas con ruta repetida | Cambios al Top3 | Aciertos base | Aciertos con prioridad |
|---|---:|---:|---:|---:|---:|---:|
| 2024 | 1449 | 2394 | 18 | 5 | 13 | 13 |
| 2025 | 1441 | 2347 | 17 | 3 | 12 | 12 |
| Ene–may 2026 | 524 | 861 | 5 | 2 | 5 | 5 |
| Jun–sep 2026 | 453 | 738 | 8 | 2 | 7 | 7 |
| **Total** | **3867** | **6340** | **48** | **12** | **37** | **37** |

El reducido número de cambios se debe a la escasez de rutas VT3
idénticas ganadoras en ambas hojas semanales. El resultado no sostiene
una ganancia adicional; pero **no descarta desplazamientos, giros y
otras conexiones geométricas** entre hojas, que eran parte del método
visual del padre. En esta prueba específica, exactamente repetir la
misma ruta fue demasiado restrictivo para priorizar VT3.

Los totales de aciertos no son los mismos que en el estudio VT3 Top3
general porque se **excluyeron fechas al principio de cada período
sin D−14 disponible**. No se deben sumar ni comparar sin esa salvedad.

## Evidencia
- `src/vt3RepeatedD14d7.ts`: mantiene las rutas y sus dos cabezas
  históricas por separado de la proyección D.
- `scripts/test-vt3-repeat-d14d7.cjs`: confirma ruta D−14/D−7,
  misma columna, fecha previa, sin fuga temporal, cupo igual.
- `scripts/run-vt3-repeat-d14d7.cjs`: informe turno a turno y por mes.
- `.github/workflows/vt3-repeat-d14d7.yml`: cuatro ejecuciones verdes
  y archivos JSON con las huellas físicas y resultados.
- https://github.com/y0t3/Modelo-Papa/actions/runs/38024592604

## Decisión
NO modificar el selector VT3 original ni promover esta repetición
exacta como criterio definitivo. Conservarla como señal descriptiva.
Las memorias VT2 originales, la prioridad VT3 y el VT4 físico/extra
se mantienen tal como fueron acordados. Nada se integra aún en APK.

## Siguiente prueba única
Investigar continuidad de VT3 cuando **la misma geometría relativa se
DESPLAZA de posición**, manteniendo dirección de pasos y columna física
D−14 → D−7; también registrar giros si aparecen, sin equipararlos
automáticamente a una ruta idéntica. No aumentar presupuesto ni
reajustar resultados ya observados.

La comparación deberá seguir con D−7 → D, por mismo día de semana,
todas las rutas históricas válidas, mismo Top3 y sin información de D
para construir candidatos.
