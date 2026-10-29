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
