# Motor experimental «Formas Primero» — investigación 29/10/2026

## Estado de las experiencias anteriores

Se habían construido lectores geométricos, no un motor puramente posicional. El Motor Lalo traslada recorridos ganadores y después agrupa por familia numérica antes de ordenar el Top. Geometría Completa también calcula relevancia por silueta, pero al seleccionar Top10 de VT3 elige familias. Los experimentos de movimientos de seis días reordenaban familias, a menudo sólo las diez ya admitidas por Lalo.

## Regla nueva: forma y posición primero, número después

Implementada en src/motorFormasPrimero.ts, independiente y sin modificar MV1.

1. Recupera sólo marcas ganadoras físicamente verificadas de las seis jornadas anteriores. Una cabeza no genera más de un evento independiente aunque tenga varios recorridos.
2. Enumera todos los caminos contiguos de tres celdas dentro de cada columna +11 disponible al corte PRE. Nunca forma un número cruzando columnas ni saltando casillas.
3. Clasifica posiciones físicas por silueta reversible, fuente, distancia vertical, activaciones por jornada y eventos ganadores independientes. La referencia de una fuente vecina sólo sirve para comparar historia, no para formar un número cruzando fuentes. El orden se establece sin mirar los dígitos actuales. La primera pasada da diversidad de siluetas.
4. Una vez elegidas las posiciones, lee sus tres cifras y obtiene familias reversibles sólo para compararlas con Lalo. No se usan cifras actuales para ordenar posiciones.
5. Sin raíces ganadoras verificadas, no inventa candidatas. Se muestra la minihoja del antecedente real y de la figura PRE actual.
6. La versión inicial prueba únicamente VT3; no cambia genealogías VT4 ni VT2.

No es una reproducción exacta de la intuición humana, sino una regla geométrica fija que puede auditarse.

## Pruebas técnicas

scripts/test-motor-formas-primero.ts comprueba que cambiar TODOS los dígitos del tablero, conservando la misma geometría física, mantiene el orden de posiciones seleccionadas; pero cambia la lectura final. También verifica raíces ganadoras, adyacencia, inversión de ruta, ausencia de fuga POST y que no nazcan candidatas sin testigos.

CI aprobado: https://github.com/y0t3/Modelo-Papa/actions/runs/40855886647

## Replay PRE octubre (12 al 28, inclusive)

15 jornadas completas, 75 cortes PRE, 375 cabezas de las cinco jurisdicciones evaluables. Ambos modelos reciben exactamente la misma hoja antes del turno; Lalo usa D−1/D−7, Formas Primero toma hasta seis jornadas previas; los POST se abren sólo tras producir los Tops.

| VT3 | Top3 | Top5 | Top10 |
| --- | ---: | ---: | ---: |
| Lalo MV1 | 0 | 4 | 6 |
| Formas Primero | 3 | 3 | 4 |
| Azar entre familias físicas (esperanza aproximada) | 2,01 | 3,36 | 6,71 |

Coincidencias de Formas Primero fuera del Top10 de Lalo:
- 15/10 Nocturno Entre Ríos 6624 → 426/624, #1 de Formas.
- 19/10 Previa Córdoba 2099 → 099/990, #10 de Formas.
- 22/10 Primera Córdoba 7967 → 769/967, #2 de Formas.

Caso compartido 15/10 Matutino Santa Fe 0244 → 244/442: Formas #2; Lalo #10.

No es un reordenamiento del mismo Top10. Sin embargo, Lalo obtuvo seis coincidencias Top10 y Formas cuatro. Tres aciertos en Top3 no prueban ventaja estadística; el control aleatorio esperado ronda dos.

## Auditoría ampliada

Junio-julio y agosto-septiembre se ejecutan como períodos independientes con reglas congeladas, sin ajustar parámetros según los POST. Los PRE son RECONSTRUCCIONES RETROSPECTIVAS, no capturas prospectivas selladas.

La aplicación estable, los Tops oficiales de MV1 y los motores auxiliares no se modifican. Sólo aparece como estudio en Experimental.


## Resultados completos — tres períodos independientes

El estudio se amplió SIN cambiar la regla de formas fijada para octubre. Se reconstruyeron 590 cortes PRE, con 2.950 cabezas de 118 jornadas completas. Se excluyeron las jornadas sin el mínimo de resultados; Lalo y Formas se compararon en idénticos cortes.

| Período | Cortes | Cabezas | Lalo Top3 | Formas Top3 | Lalo Top5 | Formas Top5 | Lalo Top10 | Formas Top10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Junio–julio | 255 | 1275 | 8 | 6 | 13 | 11 | 23 | 27 |
| Agosto–septiembre | 260 | 1300 | 6 | 7 | 9 | 14 | 19 | 25 |
| Octubre 12–28 | 75 | 375 | 0 | 3 | 4 | 3 | 6 | 4 |
| **TOTAL** | **590** | **2950** | **14** | **16** | **26** | **28** | **48** | **56** |

Control aleatorio simple entre familias VT3 físicamente presentes: expectativas acumuladas Top3 16,64; Top5 27,73; Top10 55,46. Formas Primero obtuvo 16, 28 y 56, respectivamente. Es una referencia neutral aproximada, **no** una distribución aleatoria plenamente equiparada por número de rutas geométricas.

### Comparación apareada, por cabeza real

| Corte | Ambos aciertan | Sólo Lalo | Sólo Formas | Diferencia Formas−Lalo |
|---|---:|---:|---:|---:|
| Top3 | 2 | 12 | 14 | +2 |
| Top5 | 3 | 23 | 25 | +2 |
| Top10 | 11 | 37 | 45 | +8 |

Control exacto de casos discordantes (aproximación binomial bajo hipótesis de igual oportunidad): valores bilaterales Top3 0,845; Top5 0,885; Top10 0,440. Remuestreo de 118 jornadas completas, 6.000 réplicas con semilla fija: intervalo de diferencia Top3 **[−8, +12]**, Top10 **[−8, +24]**. Ambos contienen cero. No hay respaldo estadístico suficiente para afirmar superioridad general de Formas Primero.

### Interpretación

- Se demuestra la **independencia efectiva de selección**: aparecen candidatas fuera del Top10 de Lalo, y se pierden otras de Lalo.
- El motor de figuras puede servir como **fuente complementaria para investigación**; la superposición es reducida en los aciertos (sólo 11 de Top10 compartidos).
- No se demuestra que elegir una forma en vez de una familia dé una ventaja sobre un control neutral; por tanto, **NO integrar al Top oficial ni prometer más aciertos**.
- Se necesitan pruebas prospectivas con PRE sellado externamente antes de cualquier cambio de prioridades.
- Resultados completos auditables: CI https://github.com/y0t3/Modelo-Papa/actions/runs/40855886647 (octubre) y https://github.com/y0t3/Modelo-Papa/actions/runs/40856188284 (junio a septiembre).

Los reportes de cortes, cabezas reales y ordenamientos Top10 PRE quedan guardados como artefactos de esas ejecuciones; la app oficial no fue alterada.
