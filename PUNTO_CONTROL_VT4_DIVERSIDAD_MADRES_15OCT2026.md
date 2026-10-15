# VT4 · distribución por madres VT3, sin monopolio del Top10

## Problema

El motor antiguo ordenaba VT4 primariamente por `motherRank`. Si `044/440` era VT3 #1 y tenía 6 extensiones físicas posibles, ocupaba seis plazas consecutivas antes de pasar a la mejor hija de la madre #2. Así una hija de VT3 #5 podía quedar fuera del Top10 **por volumen de hijas de otras madres, no por ausencia de evidencia física propia**.

## Solución: prioridad por rondas

La fase de formación física **no cambia**. VT4 sigue siendo `cuarta cifra (izquierda) + madre VT3`, con las cuatro casillas contiguas en una sola fuente, jamás extensión a derecha, jamás inversión completa.

Se construye el catálogo íntegro de candidatas físicas VT4 como antes y se calcula el mismo orden **dentro de cada madre** (fuentes físicas y bloques independientes). Luego se intercala:

- **Ronda 1:** mejor hija de VT3 #1, mejor hija de VT3 #2, etc., hasta la madre #10 que tenga al menos una hija.
- **Ronda 2:** segunda hija de VT3 #1, segunda hija de VT3 #2, etc.
- **Rondas sucesivas:** restantes hijas, siempre conservando el mismo orden de fuerza física intramadre.

No se reserva un espacio para una madre sin una hija válida; el sistema la salta automáticamente. Con 10 madres que generen hijos, el Top10 tiene 10 madres representadas. Con 5 madres válidas, las 5 primeras plazas van a una hija por madre, y el Top10 se completa con segundas o terceras hijas.

### Ejemplo intuitivo

| Puesto | Antes: madres | Por rondas: madres |
| ---: | --- | --- |
| 1 | VT3 #1 hija A | VT3 #1 hija A |
| 2 | VT3 #1 hija B | VT3 #2 hija A |
| 3 | VT3 #1 hija C | VT3 #3 hija A |
| 4 | VT3 #1 hija D | VT3 #4 hija A |
| 5 | VT3 #1 hija E | VT3 #5 hija A |
| 6 | VT3 #1 hija F | VT3 #6 hija A |

## Garantías

- **VT3 oficial no cambia**, ni el conjunto de candidatas, ni las rutas, ni sus raíces, ni la prevención de filtración POST.
- Sólo se alteran **las posiciones VT4**, que ahora son intercaladas entre madres; Top3, Top5 y Top10 de VT4 cambian por diseño.
- La selección dentro de cada madre mantiene el criterio físico anterior.
- Si una misma hija tiene múltiples padres registrados se le asigna, para ordenarla, la madre VT3 de mejor puesto, **sin duplicar la hija**.
- Es un criterio de **diversidad de familias madres, no una fórmula estadística**; no se ha demostrado que produzca más aciertos ni ganancias. Para validar éxito hay que congelar PRE de la versión nueva antes de nuevos sorteos. No reescribir pronósticos anteriores.
- El lector experimental `vt3Shadow` y la sección de pronóstico manual LALO siguen separados de la priorización VT4 automática.

## Verificaciones

`scripts/test-vt4-diversidad-madres.ts`: simula una madre con 6 hijas y comprueba que las demás madres con hijas ocupan su primera ronda; verifica continuidad de segundas rondas, ausencia de duplicados, ranking 1..N, casos con madres sin hijas, PRE sin fuga y recorridos VT4 izquierda físicamente propios. El resto de las pruebas siguen activas en `validar-lalo-unificado.yml`.

**No se genera APK en esta revisión.** Queda preparada para una próxima compilación conjunta si el usuario desea evaluar visualmente esta política.
