# Continuación VT2 · priorizar hasta dos familias ya coincidentes (sin modificar MV1)

**29/10/2026 · Investigación aislada.** Se analizaron **127 jornadas, 635 cortes PRE reconstruidos, 3.401 cabezas evaluables** de junio a octubre de 2026 mediante el motor original Lalo VT2, manteniendo Montevideo sin raíces históricas como en producción. En el conjunto, Lalo VT2 reproduce exactamente **Top3 220 / Top5 351 / Top10 674**. La comparación nocturna utiliza únicamente información publicada **ANTES de Nocturna**, sin revisar las cabezas nocturnas para seleccionar.

## Definición de familia: dos orientaciones, no dos puestos

Ejemplo: `67/76` puede interpretarse como **67 o 76**; si sus dos dígitos son iguales (`44/44`), es una sola terminación. La familia reversible **no equivale** a confirmar que ambas orientaciones tienen recorridos físicos de idéntico peso. Se registran sus caminos y orientación cuando existen, sin exigir la misma orientación ganadora al estudiar relaciones familiares.

De **49 cabezas nocturnas Top10** que repitieron una familia VT2 ya ganadora durante la jornada, **23** conservaron alguna orientación antes acertada y **26** aparecieron en la orientación inversa respecto de todas las anteriores. La familia conjunta captura ambos comportamientos.

## Experimento de dos familias con cupo fijo

- **Referente:** familias del #1 y #2 del Top10 VT2 de Nocturna.
- **Familias del mismo día:** de los diez puestos, marcar las familias que ya habían coincidido en un turno anterior de ese día; primero elegir **hasta dos familias marcadas**, siguiendo el orden original de Lalo; si hay menos de dos, completar con los primeros puestos no seleccionados.
- **Control seis jornadas:** igual cupo y desempate, pero priorizando familias que tuvieron aciertos VT2 en cualquiera de las seis jornadas anteriores, sin exigir que acertaran hoy.
- **No hay reordenación del Top10 oficial**: son selecciones paralelas de observación.

| Turno (127 cortes cada uno) | Top2 Lalo | Dos familias priorizadas por acierto del día |
|---|---:|---:|
| Primera | 20 | **26** |
| Matutino | 33 | 33 |
| Vespertino | 30 | 30 |
| **Nocturno** | **27** | **41** |

Previa carece de turnos anteriores en el mismo día y permanece en **34/34**.

Para Nocturna, el control basado en ganadoras de las seis jornadas anteriores consiguió **28** coincidencias, cerca de las **27** del Top2: el efecto no se reproduce simplemente dando prioridad a familias que hayan acertado en otro día.

### Nocturno por períodos

| Período | Top2 original | Prioridad al acierto previo del día | Control seis días |
|---|---:|---:|---:|
| Junio–julio (51 noches) | 7 | **12** | 5 |
| Agosto–septiembre (52 noches) | 15 | **21** | 15 |
| Octubre 1–24 (21 noches) | 4 | **8** | 8 |
| Octubre 26–28 (3 noches) | **1** | 0 | 0 |
| **Total 127 noches** | **27** | **41** | 28 |

Sobre **140 cabezas Top10 nocturnas**, las dos familias de prioridad recuperaron 41 frente a 27 del Top2. Coincidieron ambos métodos en 14 cabezas; **27** cabezas fueron exclusivas del método de prioridad y **13** exclusivas del Top2, con saldo +14. Prueba exacta bilateral exploratoria por cabeza discordante: **p≈0,038 sin ajuste**; bootstrap por jornada del saldo acumulado, percentiles 95 % ≈ **[+2,+26]**. Los análisis son múltiples y post hoc, y el tiempo de desarrollo del motor ya incluyó estas jornadas; el intervalo no supone que exista una ventaja futura confirmada.

### Control de jurisdicciones de destino

Separando Nocturna según jurisdicción **ganadora**, sin alterar la alimentación de la hoja:
- Cinco jurisdicciones argentinas: Top2 **22** → priorización **33**.
- Montevideo: Top2 **5** → priorización **8**.

La diferencia no depende exclusivamente del resultado uruguayo.

## Fase de cinco/seis jornadas: útil como contexto, no como interruptor

Las 49 repeticiones nocturnas ocurrieron en 44 Nocturnas: **14/53** cabezas Top10 en junio–julio, **24/60** en agosto–septiembre, **11/24** en octubre 1–24 y **0/3** en octubre 26–28.

Por ejemplo, la condición retrospectiva «al menos tres de las cinco Nocturnas previas presentaron alguna repetición de familia del mismo día» se cumplía antes de **34 Nocturnas**. Allí el método priorizado obtuvo **14** coincidencias frente a **10** del Top2, pero el tramo 26–28 también habría estado marcado como activo y no se acertó ninguna familia repetida. **No utilizar umbrales elegidos a posteriori para determinar apuestas o descartar candidatos.**

Estos resultados respaldan examinar la transición entre fases y conservar visualmente las coincidencias, pero **no convertir una racha en una ley**.

## Correcciones de UI acordadas para después, sin implementarlas en esta rama

1. **Predicción: mostrar Top10 completo de entrada** para cada lector y VT2/VT3/VT4 donde corresponda, sin filtros Top3/Top5. Las coincidencias POST deben resaltarse en cuanto se abre la pestaña, aunque estén en los puestos 4–10. No alterar PRE sellados.
2. **Agregar capa de familias VT2 coincidentes**: mostrar si el número ya acertó hoy como familia reversible, en qué turno y puesto, y el recorrido físico, con rastro de 5–6 jornadas. Separar inequívocamente «familia» de «posición».
3. **Retirar «Nueva Prueba» de la comparación experimental visible** por no aportar una lectura diferencial suficiente; preservar compatibilidad con registros PRE históricos y evitar pérdida silenciosa de datos almacenados.
4. **No modificar rankings Lalo MV1 ni Montevideo como raíz**, no fusionar motores ni ampliar el presupuesto de selección, y no sustituir observaciones del ojo humano por recomendaciones automáticas.

## Reproducción

- `scripts/lab-vt2-posiciones-libres.ts` — 635 cortes Lalo oficiales reproducidos, resultados por jornada.
- `scripts/lab-vt2-relaciones-familias.ts` — familias repetidas, máscaras y ventanas 5–6 jornadas.
- `scripts/lab-vt2-dos-familias.ts` — 2 familias con cupo fijo vs Top2 y referencia seis jornadas; `auditorias/vt2-relaciones-familias/dos-familias-resumen.json`, `dos-familias-cortes.json`.
- [GitHub Actions, ejecución satisfactoria](https://github.com/y0t3/Modelo-Papa/actions/runs/40826825298).

**Estado:** laboratorio reproducible, no estudio prospectivo validado. La hipótesis de priorizar familias ya acertadas durante el día muestra un saldo interesante en Nocturna, pero no se recomienda cambiar MV1, ocultar candidatos o suponer probabilidad cierta de acierto por esa razón.
