# Modelo Lalo — transiciones efectivas de figuras VT3 (25/10/2026)

**Rama experimental. NO modificar `main`, la APK ni el Modelo Lalo MV1 congelado.**

## Pregunta
¿El nacimiento, la interrupción/reaparición y el avance horizontal de una figura **activada por una cabeza publicada** permite recuperar familias VT3 ausentes o reordenar mejor las diez familias ya reconocidas?

### Restricciones
- Evaluación cronológica PRE en 124 jornadas (junio–24/10), 620 cortes y 3.321 cabezas.
- Fuentes de cada hoja: última Nocturna **real por jurisdicción**, también en D−1, D−7 y seis jornadas históricas.
- Cada trayectoria de tres celdas es físicamente contigua **dentro de una sola columna** de la hoja +11, sin saltos ni cruces de columnas. Una figura histórica y otra actual pueden tener fuentes diferentes, pero **eso NO habilita** trazar un camino que cruce columnas en una hoja.
- La figura se define por la silueta de la ruta (admite inversión y desplazamiento vertical), **no por los dígitos** que ocupa.
- Una cuadrícula completa de 6×2 siempre permite una gran cantidad de siluetas abstractas: la presencia geométrica por sí sola no constituye una activación. Solo se registra como **activación** la silueta de un recorrido que explicó una cabeza real publicada en el pasado.
- Los resultados de los sorteos del objetivo quedan separados para contrastar POST.
- Las cifras VT4 y las familias madres del MV1 no cambian.

## Definiciones PRE congeladas
1. **PULSO_101:** figura activa en la misma fuente/sitio (±2 filas) la jornada anterior, inactiva en la penúltima y activa nuevamente en cualquiera de las cuatro jornadas anteriores (patrón 1–0–1 en la ventana histórica de seis).
2. **RACHA_11:** misma figura/fuente activa durante las dos jornadas inmediatamente anteriores.
3. **MARCHA_DERECHA:** figura activada hace ≤6 jornadas en la fuente `s−2`, luego activada cronológicamente en `s−1` (separación entre eventos ≤2 jornadas), y hoy forma físicamente candidato en la fuente `s`. Siluetas iguales y anclas verticales a distancia ≤2 filas. Los eventos antiguos pertenecen a diferentes jornadas previas.

## Primera comprobación: recuperar familias ausentes del motor
Corrida [#40178621823](https://github.com/y0t3/Modelo-Papa/actions/runs/40178621823).

| Regla | Cortes con alguna alternativa nueva | Ganados al incorporar #10 | Desplazados | Cambio neto Top10 |
|---|---:|---:|---:|---:|
| PULSO_101 | 0 | 0 | 0 | 0 |
| RACHA_11 | 0 | 0 | 0 | 0 |
| MARCHA_DERECHA | 342 | 2 | 1 | +1 |

La inexistencia de `PULSO_101` y `RACHA_11` dentro de **familias no reconocidas** es coherente con el motor: ambas exigen actividad en la misma fuente el día anterior, y ese testigo D−1 permite el traslado que ya genera la familia candidata.

Para `MARCHA_DERECHA`, se eligió una alternativa entre **8,54 familias elegibles por corte de elección**, en promedio. En 10.000 simulaciones aleatorias condicionales, la media de aciertos nuevos fue **3,65**, por encima de los dos observados. Fracción que igualó o superó el resultado: **0,9065**. En octubre, ganó una cabeza y desplazó una: neto cero.

**Resultado:** no justifica incorporar familias nuevas a los Tops.

## Segunda comprobación: reordenar las MISMAS diez familias
Corrida [#40178793583](https://github.com/y0t3/Modelo-Papa/actions/runs/40178793583).

Se reordenó exclusivamente el Top10 **ya reconocido por MV1**, priorizando cada señal en tres versiones independientes, sin agregar, quitar ni sustituir familia alguna. Ante empate se conservó el orden MV1.

| Bloque cronológico | MV1 Top3 | PULSO_101 Top3 | RACHA_11 Top3 | MARCHA_DERECHA Top3 |
|---|---:|---:|---:|---:|
| Junio–julio | 8 | 5 | 13 | 8 |
| Agosto–septiembre | 7 | 10 | 4 | 7 |
| Octubre (hasta 24/10) | 2 | **7** | 1 | 2 |
| **Total** | **17** | **22** | **18** | **17** |

Top5 total: base **35**, pulso **32**, racha **36**, derecha **32**. Top10: **59 en las cuatro versiones**, porque se trata del mismo conjunto de familias.

### Control aleatorio condicional del Top3
10.000 permutaciones por período. En cada corte se eligen **tres de las mismas familias del Top10** sin reemplazo. Este control no estima la probabilidad general de predecir la quiniela: comprueba únicamente si el criterio de orden es superior a una selección aleatoria del mismo conjunto.

| Período | Top3 con pulso | Media aleatoria | Percentil 95 | Fracción aleatoria ≥ resultado |
|---|---:|---:|---:|---:|
| Junio–julio | 5 | 7,189 | 11 | 0,8869 |
| Agosto–septiembre | 10 | 6,032 | 10 | 0,0515 |
| Octubre | 7 | 4,518 | 7 | 0,1246 |
| Total | 22 | 17,714 | 24 | 0,1375 |

La racha dio 13 aciertos frente a 8 base en junio–julio (fracción de simulaciones ≥ resultado: 0,0113), pero **empeoró** en agosto–septiembre y octubre. Por lo tanto, no es una señal estable.

### Interpretación y decisión
- El **pulso de reactivación** produjo un aumento histórico del Top3 de 17 a 22, especialmente en octubre, pero no superó con claridad el azar condicionado y redujo el Top5.
- El período de octubre es pequeño (105 cortes, 15 cabezas ganadoras en el Top10); además ya se exploraron diversas reglas y períodos. Los valores anteriores son **exploratorios**, no evidencia estadística confirmatoria.
- No agregar familias por pulso o racha: ya estaban reconocidas por el motor.
- No adoptar ninguna nueva prioridad en MV1.
- **Hipótesis a congelar para prueba futura independiente:** `PULSO_TOP10`, exactamente como está definida aquí (señal binaria de reactivación 1–0–1, desempate por puesto MV1, sin cambiar el Top10). Contrastar prospectivamente antes de mirar resultados de jornadas posteriores al 24/10; no ajustar la fórmula tras los sorteos.

## Archivos reproducibles
- Recuperación de familias: `scripts/lab-vt3-transiciones6.ts` en `lab/lalo-vt3-transiciones-6j-25oct2026` y [Actions #40178621823](https://github.com/y0t3/Modelo-Papa/actions/runs/40178621823), con `cabezas.json`, `cortes.json`, `transiciones.json`.
- Reordenamiento de las mismas diez familias: `scripts/lab-vt3-transiciones-orden-top10.ts`, [Actions #40178793583](https://github.com/y0t3/Modelo-Papa/actions/runs/40178793583). El artefacto `vt3-top10-pulsos-marcha` incluye `resumen.json`, `cabezas.json`, `cortes.json`, `perfiles-top10.json`.
- Las dos ejecuciones corrieron controles automatizados de MV1, y la primera también los de la Nocturna histórica por jurisdicción.
