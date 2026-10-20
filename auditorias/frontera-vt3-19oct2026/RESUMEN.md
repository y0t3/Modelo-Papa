# Frontera VT3 del 19/10/2026: diagnóstico de las tres cabezas físicas no priorizadas

**Laboratorio retrospectivo; sin alterar MV1, APK, Geometría Completa ni Configuraciones Conectadas.**

Ejecución comprobada: https://github.com/y0t3/Modelo-Papa/actions/runs/39362563074

## Qué se comprobó

La auditoría descargó las cabezas de la misma fuente que utiliza la app, reconstruyó cada +11 con Nocturna anterior y ocultó las columnas futuras por turno. Para Lalo reprodujo D−1/D−7; para Conectadas tomó un máximo de seis jornadas con resultados reales. Construyó todos los caminos VT3 físicamente posibles, comparó contra los resultados *solo en POST* y determinó si una cabeza física está admitida o priorizada por cada lector. El laboratorio reprodujo exactamente el Top10 geométrico y conectado antes de calcular sus rangos extendidos (sin alterar código productivo).

**Corrección de terminación:** la cabeza 8701 termina en **701**, y su familia reversible oficial es **107/701**. La denominación anterior 017/710 era errónea y no se utilizó para los cálculos.

| 19/10 | Familia | Testigo físico exacto (fila:col base 0) | Lalo oficial | Geo total | Conectadas total |
|---|---|---|---|---:|---:|
| Vespertina Provincia 8701 | 107/701 | Previa: 3:0 → 2:1 → 2:0; lectura **701** | NO admitida | 149/175 | 99/153 |
| Vespertina Córdoba 5073 | 073/370 | Previa: 2:1 → 3:0 → 4:1; lectura **073** | NO admitida | 158/175 | NO admitida |
| Nocturna Ciudad 3419 | 419/914 | Vespertino: 2:1 → 1:0 → 0:1; lectura **419** | NO admitida | 196/218 | 180/196 |

Todas las cifras están dentro de **una misma fuente por recorrido**, sin saltos. Cada familia tuvo **un solo recorrido físico válido** en el PRE correspondiente y una sola fuente disponible. Ninguna tenía raíces comprobadas D−1/D−7 que admitiera el motor oficial; no se trata de candidatas en el puesto 11 o 20.

**Geometría:** el ranking extendido encuentra las tres con evidencia geométrica antigua de tipo figura/posición, pero sin raíces de cabezas ganadoras (rootEvents=0). Todas obtuvieron el mismo vector ordinal `[1,2,1,2,0,0,0]`; su desempate y la competencia con otras figuras las hunden en el ranking. El orden completo se replicó desde el código del lector, no se dedujo mirando los resultados.

**Conectadas:** 107/701 proviene de una configuración histórica solapada comprobada por **0244 y 6204**, trasladada a otra fuente; recibe respaldo de una sola jornada. 419/914 procede de una configuración comprobada por **7823 y 2033**, también de una única jornada. 073/370 no reproduce ninguna de las configuraciones conectadas elegibles: presencia física no implica elegibilidad para este lector.

## Control histórico idéntico en 12, 13, 14, 15, 16, 17 y 19 de octubre

35 cortes PRE (5 turnos × 7 jornadas); 175 cabezas argentinas; **44** disponían de alguna ruta VT3 física válida antes del sorteo.

| Selector fijo de seis familias | Cabezas que recuperó en Top6 |
|---|---:|
| Lalo VT3 oficial | **4** |
| Geometría Completa | **3** |
| Configuraciones Conectadas | **1** |
| Control simple: más fuentes físicas, luego más recorridos | **1** |

En Top10, Lalo VT3 encontró 6 de las 44 físicamente posibles; en Top3, 0. Los resultados son casos de cabeza por turno, no porcentajes de probabilidad futura.

Separación de control:
- 12/10: físico 7; Top6 Lalo 1 / Geo 0 / Conectadas 0 / control 0
- 13/10: físico 7; Top6 Lalo 1 / Geo 1 / Conectadas 0 / control 0
- 14/10: físico 6; Top6 Lalo 0 / Geo 0 / Conectadas 0 / control 1
- 15/10: físico 8; Top6 Lalo 1 / Geo 1 / Conectadas 0 / control 0
- 16/10: físico 3; Top6 Lalo 0 / Geo 1 / Conectadas 0 / control 0
- 17/10: físico 8; Top6 Lalo 0 / Geo 0 / Conectadas 1 / control 0
- 19/10: físico 5; Top6 Lalo 1 / Geo 0 / Conectadas 0 / control 0

El control por cantidad de fuentes y recorridos, aunque coherente físicamente, **no mejora** la selección en esta ventana: 1 frente a 4 de Lalo. Tampoco basta con priorizar todas las figuras que aparecen en la hoja: hay entre 175 y 218 familias posibles en los cortes del 19/10.

## Conclusión disciplinada

Los tres casos son **familias físicas sin respaldo ganador elegible**, no rutas inválidas. Su exclusión en Lalo es *consecuencia de su regla de admisión*, y en los experimentales consecuencia de admisión/priorización distinta.

La presencia de dos pruebas conectadas en puestos 99 y 180 demuestra que estos recorridos pueden proyectarse por memoria histórica de configuraciones, pero **no justifica** elevarlos al Top6 con estos datos.

**Decisión:** no cambiar MV1 ni fomentar inversiones VT4 indebidas. Próximo control razonable: distinguir visualmente en el laboratorio entre (a) familia físicamente presente, (b) respaldada y admitida, y (c) dentro del Top. Cualquier ranking alternativo debe validarse antes en jornadas excluidas de su diseño y respetar máximo seis familias propuestas.
