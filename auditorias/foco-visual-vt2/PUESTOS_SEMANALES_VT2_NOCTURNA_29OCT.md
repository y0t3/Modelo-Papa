# Auditoría de posiciones VT2 — continuidad entre semanas y Nocturnas (29/10/2026)

**Laboratorio histórico, no predictor validado.** Repositorio `y0t3/Modelo-Papa`. Solo lectura de archivos de corte PRE ya reconstruidos. No se alteraron MV1, AUX, VT4, APK ni prioridades.

## Qué se preguntó

¿Hay un **puesto del Top10 VT2** que coincide con cabezas más a menudo en semanas cortas o consecutivas, independientemente de qué familia numérica ocupa el puesto? Los dos ejemplos manuales Nocturna (Montevideo 1876 del 26/10, Córdoba 4510 del 28/10) habían sido reconstruidos con **VT2 #7**, pero eso no permite asumir que el puesto #7 resulte útil en general.

## Fuentes y alcance

1. **118 Nocturnas** (118 jornadas completas, 590 cortes de cinco turnos), 01/06–28/10/2026, pero con períodos de octubre discontinuos; **cinco jurisdicciones, sin Montevideo**, y 590 cabezas de Nocturna. Fuente: artefactos `Formas-Primero-VT2-jun-jul`, `Formas-Primero-VT2-ago-sep`, `Formas-Primero-VT2-octubre` de [GitHub Actions 40858316696](https://github.com/y0t3/Modelo-Papa/actions/runs/40858316696), archivos `cortes-*.json` que contienen, para cada corte PRE, `date`, `turn`, `lalo` (10 familias VT2 en orden) y `heads` (cabezas reales + familia), sin necesidad de recalcular prioridades con datos POST.
2. **28 Nocturnas** (140 cortes, 756 cabezas en los cinco turnos) con seis jurisdicciones, **incluida Montevideo**, en las seis semanas elegidas del laboratorio VT2→VT3. Fuente: artefacto `lab-vt2-a-vt3-historico` de [Actions 40949550197](https://github.com/y0t3/Modelo-Papa/actions/runs/40949550197), archivo `resultado.json`, `cases[].variants.LALO_RONDAS.motherTop`. Esta muestra no contiene todos los días entre junio y octubre; la cabeza Santa Fe del 28/10 era provisional, no modifica el rango #7 de ese resultado.

Se cuentan coincidencias de **las dos cifras finales**, agrupadas por familia reversible VT2. **No son aciertos de VT3 o VT4**, ni garantía de que la ruta geométrica concreta haya sido la que escogió el lector humano. Todos los Tops son reconstrucciones históricas PRE y no sellos de la APK.

## Histograma Nocturna (cinco jurisdicciones, 118 jornadas)

106 cabezas tuvieron coincidencia con algún puesto Top10 VT2:

| Puesto | #1 | #2 | #3 | #4 | #5 | #6 | #7 | #8 | #9 | #10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Coincidencias | 8 | 12 | 10 | 9 | 9 | 12 | **16** | 10 | 11 | 9 |

El #7 fue el **más frecuente**, con 16/106 coincidencias y apareció al menos una vez en **14 de 21 semanas** con datos. Excluyendo semanas muy incompletas (mínimo cinco Nocturnas registradas), aparece en **13 de 19 semanas**. Hubo cinco semanas consecutivas con al menos una coincidencia (ISO semanas 24–28, junio–julio). Esto es un hallazgo **descriptivo** de rango, no una señal confirmada.

Por mes:

| Mes | Nocturnas observadas | Coincidencias Top10 VT2 | Coincidencias #7 |
|---|---:|---:|---:|
| Junio | 25 | 16 | 3 |
| Julio | 26 | 28 | 5 |
| Agosto | 26 | 26 | 2 |
| Septiembre | 26 | 26 | 3 |
| Octubre (muestra parcial) | 15 | 10 | 3 |

## La secuencia visual de octubre, con Montevideo

| Fecha | Familia VT2 #7 | Cabeza coincidente #7 | Jurisdicción |
|---|---|---|---|
| Jue 22/10 | **67/76** | **8067** | Entre Ríos |
| Vie 23/10 | **89/98** | **2498** | Entre Ríos |
| Sáb 24/10 | 36/63 | No hubo coincidencia | — |
| Lun 26/10 | **67/76** | **1876** | Montevideo |
| Mar 27/10 | 23/32 | No hubo coincidencia | — |
| Mié 28/10 | **01/10** | **4510** | Córdoba |

La ampliación con Montevideo (el 26/10) permite ver **cuatro de seis Nocturnas** del tramo con coincidencia de VT2 #7. Dos casos, 26 y 28, son las interpretaciones manuales relatadas por Lalo. **No significa que el motor haya pronosticado cuatro o tres cifras.**

## ¿Persisten posiciones de una semana a otra?

En las **104 comparaciones con el mismo día de la semana anterior** donde ambos Nocturnos estaban disponibles:
- La **misma familia VT2** ocupó exactamente el **#7 solo tres veces** (3/104).
- La familia que había ocupado el #7 apareció en **cualquier posición del Top10 de la semana siguiente 16/104 veces**.
- El traslape medio total de Top10 en el mismo día de la semana siguiente fue **1,76 familias de diez**.

Es importante: la «persistencia» observada es del **puesto que coincide con cabezas**, **no** de las cifras que permanecen estáticas en ese puesto. El ejemplo 67/76 ocupando #7 tanto jueves 22 como lunes 26 es real, pero no es una regla semanal.

### ¿Si una posición viene coincidendo, vale elegirla la semana siguiente?

Se ensayó una política sencilla, definida *sin mirar* la semana evaluada: observar cuál rango reunió más cabezas VT2 coincidentes en la semana anterior (empates, menor puesto) y conservarlo en la semana próxima. **17 pares de semanas consecutivas** suficientemente completas (al menos cuatro Nocturnas en ambas):

| Selección hecha SOLO con semana anterior | Coincidencias la semana siguiente | Referencia neutral aprox. |
|---|---:|---:|
| Un puesto líder | **9** entre 99 coincidencias Top10 | **9,9** |
| Dos puestos líderes | **18** entre 99 | **19,8** |

También se probó una ventana móvil de **cinco Nocturnas anteriores** (113 cortes evaluables, 104 coincidencias Top10): el puesto más frecuente anteriormente coincidió en la siguiente Nocturna **7** veces frente a **10,4** esperadas para un puesto uniformemente elegido; los dos puestos más frecuentes coincidieron **11** veces frente a **20,8** esperadas para dos puestos. Estas comparaciones son exploratorias: las frecuencias son números de cabezas, no independencia de sorteos ni probabilidades aplicables a jugadas.

En este backtest, **seguir al puesto más activo de los cinco días anteriores no mejoró**; de hecho quedó por debajo del control neutral.

## Control contra «el puesto ganador» descubierto después

Se hicieron **100.000 permutaciones internas por Nocturna** que conservan los casos acertados en ese turno (también si dos cabezas coinciden con la misma familia), pero asignan sus posiciones entre las diez de manera uniforme:

- Que **el #7 preseleccionado** tenga **16 o más** cabezas VT2 coincidentes ocurrió en aproximadamente **6,1 %** de las permutaciones.
- Que **alguno de los diez puestos** (elegido *después de ver los resultados*) alcance **16 o más** ocurrió en aproximadamente **51,8 %**.

Se hizo adicionalmente un control de **150.000 permutaciones** para semanas con alguna coincidencia: obtener **14 o más semanas** en **un puesto dado** ocurre aprox. **0,8 %**; que **cualquier puesto** alcance al menos 14 semanas ocurre aprox. **8,4 %**. En 19 pares de semanas consecutivas, obtener 9 continuidades del mismo puesto, buscando entre diez puestos, dio aprox. **14,0 %**. Son controles condicionales aproximados: no demuestran ventaja en una lotería ni contemplan toda la búsqueda previa de estrategias y períodos.

La conclusión principal no cambia: **el #7 destaca descriptivamente y tiene rachas**, pero su continuidad temporal no está suficientemente demostrada para una selección anticipatoria de ese puesto.

## Uso visual sugerido, sin filtros rígidos

En «Info» / «Predictiva» experimental sería útil una **cinta de cinco o seis Nocturnas**, con diez posiciones, una marca ● por cabeza realmente coincidente con ese rango, ○ si no coincidió y un acceso a la minihoja de cada marca real. La cinta mostraría **qué familia ocupó cada rango en cada fecha**, porque las cifras cambian mucho. Mostrar todos los rangos; resaltar el #7 si el historial lo justifica visualmente, sin convertirlo en obligación de apostar ni descartar los demás.

**No se recomienda modificar ahora Lalo MV1, AUX, VT3, VT4 ni la APK.** Primero comprobar con nuevos cortes sellados que una regla de foco temporal predefinida supera a un control; si no, la cinta es solo una herramienta de observación.
