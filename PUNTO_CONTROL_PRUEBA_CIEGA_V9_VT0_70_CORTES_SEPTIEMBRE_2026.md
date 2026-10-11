# Punto de control — primera selección ciega retrospectiva V9+VT0, 70 cortes históricos

**Resultado obtenido en el laboratorio el 10/10/2026, después de conocer y analizar históricamente septiembre.** No es un pronóstico humano prospectivo ni un holdout virgen. No se modificó `main`, la APK, el selector ni el motor predictivo oficial.

## Datos y regla fijada antes del cotejo dentro del script
Fuente: 20 hojas digitales de septiembre 2026, atlas recuperado de GitHub Actions run `38059506764`; 14 pares del mismo día de la semana anterior **D−7** y 5 turnos por fecha: **70 cortes**. Además se consultó la jornada anterior efectiva **D−1** solo para determinar refuerzos geométricos. Comparación de cinco jurisdicciones argentinas (sin Montevideo para mantener coherencia de cobertura).

- **Referencia D−7:** elegir determinísticamente la primera huella VT3 válida de D−7, leyendo en el mismo sentido que su cabeza antigua.
- **Prueba V9+VT0:** elegir a lo sumo **una** VT3 en sentido antiguo de D−7, **solo si** tiene coincidencia de forma con marcas D−1 dentro de la misma columna y modalidad, o si la misma figura física ya quedó confirmada en un turno anterior de ese día. Se prefiere misma huella física exacta D−1 y luego refuerzos ya confirmados; desempate determinístico por fuente y coordenadas.
- Si no existe figura que cumpla requisitos, abstenerse. No se invierte el sentido después del sorteo, no se cruzan columnas ni se escoge un ganador de una lista completa.
- Dos criterios POST: (a) misma figura física y sentido marcada por una cabeza del turno objetivo y (b) misma terminación VT3 en **cualquier** cabeza del turno, aunque fuese otra ruta. Ambos dieron el mismo saldo.
- Se serializaron **todas las 70 elecciones PRE**, con tablas hasta el turno objetivo y sin cabezas de ese turno ni posteriores, **antes** de evaluar contra las marcas conocidas.

## Resultados exactos

| Método | Cortes | Selecciones VT3 | Abstenciones | Aciertos (figura y lectura) | Aciertos (terminación, cualquier figura) |
|---|---:|---:|---:|---:|---:|
| D−7 (referencia determinística) | 70 | 68 | 2 | **0** | **0** |
| V9+VT0 reforzado | 70 | 47 | 23 | **0** | **0** |

Últimas 7 fechas D−7 (35 cortes, separación cronológica **retrospectiva y no virgen**): D−7 escogió 34 VT3, V9+VT0 escogió 20; **ningún acierto** en ninguno.

**Diagnóstico de TODAS las opciones, no solo las elegidas:** existían **683 rutas VT3 dirigidas heredadas D−7** a través de los 70 cortes; exactamente una figuraba entre las marcadas posteriormente: **Nocturna 17/09, terna 464 de Santa Fé 1464, fuente prevNocturno**, geometría `vt3|prevNocturno|1:0>1:1>2:0`. Ninguna regla la escogió. Carecía de apoyo adicional D−1 / confirmación previa intradía.

## Control de ausencia de fuga de resultados

La prueba automatizada volvió a calcular las 70 elecciones después de **borrar las marcas del turno objetivo y todos los posteriores** y después de **vaciar las columnas futuras**. El conjunto de opciones y ambas elecciones permanecieron **exactamente iguales en 70/70 cortes**. Además validó geometría con y sin inversión, vecindad, celdas no repetidas, marcador positivo artificial y lectura contraria no coincidente.

Huella SHA256 del JSON de 70 fotografías PRE `be2f9d057b00ef28b390ee3505d8637450b958d4d0f8bea5e8689fb9267d435a`.

## Interpretación

- **V9+VT0 no mostró mejor capacidad de selección** que la referencia al elegir una sola terna en estos cortes. Abstenerse más no produjo aciertos.
- **No significa que el Modelo Papá en su conjunto no funcione**; se evaluó **una regla muy concreta**, enfocada en VT3, una lectura por turno, con desempate automático en lugar de decisión visual humana.
- El tamaño efectivo de fechas es **14**, no 70 experimentos independientes; predicciones extremadamente infrecuentes no permiten estimar ventajas con precisión.
- La referencia lexicográfica es un control fijo, no una simulación de lo que hacía el padre.
- Los positivos POST dependen de la exhaustividad de hojas digitales reconstruidas, aún sin cotejar con los videos manuscritos originales.

## Archivos reproducibles entregados en la conversación

`prueba-ciega-v9-vt0-70-cortes-septiembre.zip` (aproximadamente 780 KB) con `index.html`, **70 hojas interactivas PRE**, `CORTES_PRE_SIN_RESULTADOS.json`, `COTEJO_POST_COMPLETO.json`, `INFORME_PRUEBA_CIEGA.md`, `CONTROL_DE_INTEGRIDAD.md`, ambos scripts Python 3 (`replay_ciego.py`, `verificar_sin_fuga.py`) y copia exacta del atlas fuente.

**No incorporar puntuación de V9 ni VT0 a motor/selector** sobre estos resultados. Sí conservar sus herramientas de identidades reversibles, observaciones por fuente y distinción entre disponible y confirmado. La prueba siguiente debería requerir decisiones visuales **antes de sorteos futuros** o validar otra única hipótesis explícita manteniendo todos los negativos.
