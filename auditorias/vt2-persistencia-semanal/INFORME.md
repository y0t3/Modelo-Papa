# VT2 Lalo: movimiento entre turnos y persistencia del mismo día de la semana

**Auditoría exploratoria de 29/10/2026.** No se modifica el Modelo Lalo MV1, las familias, posiciones, Top10, Montevideo, la app ni los PRE históricos. El motor VT2 reproduce **635 cortes / 127 jornadas / 3.401 cabezas evaluables**, con Top3=220, Top5=351, Top10=674. Los datos de origen son [GitHub Actions #40823125962](https://github.com/y0t3/Modelo-Papa/actions/runs/40823125962); son **PRE reconstruidos**, no pronósticos sellados prospectivamente.

## Preguntas

1. ¿La familia reversible VT2 que ganó en el turno inmediato anterior y se mantiene en Top10 del objetivo vuelve a coincidir? ¿Tiene importancia que suba, baje o permanezca en el mismo puesto?
2. ¿Funciona algún empalme entre jornadas distintas, especialmente mismo turno **exactamente siete días antes** (D−7), como una lectura de posiciones o familias? Esto **no equivale** a trasladar recorridos físicos ganadores del padre: únicamente se compara persistencia de familias dentro de los Tops VT2 ya reconstruidos.
3. ¿Sirve una ventana de 2–6 jornadas para identificar de antemano cuándo aplicar la prioridad de familia del turno anterior?

En los tres casos las alternativas eligen **hasta dos familias entre las diez existentes**, completando desde el orden oficial y sin cambiar el motor. Siempre se conoce el Top PRE del objetivo antes de utilizar resultados POST del turno.

## A. Turno anterior: movimiento observado

Para **una familia que acertó en el turno inmediatamente anterior y que reaparece en el Top10 siguiente**, las exposiciones y cabezas coincidentes fueron:

| Turno objetivo | Familia sube (puestos / hits) | Permanece (puestos / hits) | Baja (puestos / hits) | Top2 original → prioridad a familia ganadora del turno previo |
|---|---:|---:|---:|---:|
| Primera | 16 / 2 | 28 / 4 | 47 / 6 | 20 → **26** |
| Matutino | 25 / 0 | 36 / 3 | 46 / 6 | **33** → 29 |
| Vespertino | 17 / 3 | 64 / 8 | 47 / 4 | **30** → 25 |
| Nocturno | 8 / 2 | 79 / 14 | 23 / 3 | 27 → **34** |

**Cautelas:** El 0/25 en Matutino para familias que suben es descriptivo y su base de casos es pequeña; no implica que subir impida ganar. El efecto de «sube» observado previamente en Nocturna (9 aciertos en 33 puestos) consideraba ganadoras de **todos los turnos anteriores**, no solamente de Vespertino. No confundir ambos universos.

Para todas las cuatro transiciones, se permutaron las etiquetas SUBE/IGUAL/BAJA entre familias que coincidieron antes, **dentro del mismo puesto del Top nocturno u objetivo y bloque temporal**, 8.000 iteraciones por turno. Ningún efecto de SUBE frente a BAJA fue concluyente (p unilateral aproximada para Primera 0,38; Matutino 0,92; Vespertino 0,18; Nocturno 0,44). La señal nocturna fuerte de la investigación anterior es un fenómeno acumulativo intradía, no del empalme inmediato solamente.

## B. La misma fecha de la semana anterior

Se comparó el turno T de una jornada con **ese mismo turno en la fecha calendario D−7**, únicamente cuando ambos pertenecen al conjunto auditado. Quedaron **119 pares de jornadas**; los feriados con registros parciales no se completaron ni se simularon.

| Turno objetivo | Top2 habitual | Priorizar familias que ya estaban en el Top10 de T en D−7 | Cambio |
|---|---:|---:|---:|
| Previa | **31** | 23 | −8 |
| **Primera** | 19 | **26** | **+7** |
| Matutino | 31 | **33** | +2 |
| Vespertino | **27** | 22 | −5 |
| Nocturno | 26 | **31** | +5 |

**Posición ganadora D−7, independientemente de la familia:** Previa 31→23; Primera 19→17; Matutino 31→28; Vespertino 27→21; **Nocturno 26→32**. Repetir la *familia ganadora* de la misma fecha una semana antes no ofrece mejora sostenida: Previa 31→31; Primera 19→21; Matutino 31→28; Vespertino 27→28; Nocturno 26→25.

### Primera: ¿consistencia temporal?

| Período | Top2 original | Familia ya presente en Top10 de Primera D−7 |
|---|---:|---:|
| Junio–julio (43 pares) | 9 | 9 |
| Agosto–septiembre (52 pares) | 8 | 11 |
| Octubre 1–24 (21 pares) | 2 | 4 |
| Octubre 26–28 (3 pares) | 0 | 2 |
| **Total (119 pares)** | **19** | **26** |

La ventaja pequeña de Primera aparece **después del primer bloque**, pero la magnitud muestral es baja. En análisis emparejado por cabeza, la variante aportó 16 aciertos exclusivos frente a 9 exclusivos del Top2, **p bilateral ≈0,2295 sin ajuste**, y bootstrap por jornada del saldo **95 % [-2, +17]**. **No es una mejora confirmada**.

Nocturno con los *puestos* ganadores D−7 obtuvo 26→32; prueba emparejada **p≈0,3075**, bootstrap del saldo **[-4, +16]**, también inconcluyente.

### ¿Simple persistencia de familia D−7 aporta aciertos por encima del tamaño del subconjunto?

La coincidencia *sin restringir a dos puestos* fue en Primera **23 cabezas** dentro de **227 puestos marcados / 1.190 puestos posibles**. Una permutación de las máscaras entre el **mismo mes y día de semana** esperaba **25,6** (percentiles 95 % [18,34], p unilateral de más aciertos ≈0,773). Por tanto el aumento Top2 19→26 **parece depender del reordenamiento de dos plazas**, no de que las familias presentes en D−7 tengan por sí mismas una concentración superior de hits dentro del Top10. La diferencia es esencial: evita presentar persistencia como mecanismo predictivo demostrado.

## C. Ventanas móviles de 2 a 6 jornadas del mismo turno

Se seleccionó ANTES del sorteo entre Top2 normal o dos familias ganadoras del turno inmediato anterior, según cuál llevaba saldo positivo sobre las últimas N jornadas. Empate vuelve al Top2. Comparación dentro del mismo conjunto de cortes elegibles para cada N.

| Turno | Historia 2 días (adaptativo / Top2 / familia fija) | Historia 5 días | Historia 6 días |
|---|---|---|---|
| Primera | **20 / 20 / 25** | **20 / 20 / 25** | **19 / 20 / 25** |
| Matutino | **32 / 33 / 29** | **28 / 32 / 27** | **27 / 31 / 27** |
| Vespertino | **29 / 30 / 25** | **30 / 30 / 25** | **27 / 28 / 25** |
| Nocturno | **31 / 27 / 34** | **30 / 26 / 33** | **29 / 26 / 33** |

Ninguna ventana distinguió una fase activa con fiabilidad suficiente. No conviene ajustar el número de días o seleccionar el turno de forma retrospectiva: las pruebas múltiples pueden generar ganancias aparentes.

## Decisión

- Mantener MV1 y el Top10 completo **sin alterar orden ni número de candidatos**.
- Probar visualmente **tres marcas independientes**: (a) ganó en turno anterior del día, (b) estuvo en Top10 del mismo turno D−7, (c) movimiento de posición entre cortes (no es desplazamiento geométrico).
- Para **Primera** observar la combinación Previa→Primera y presencia semanal, sin descartar ninguna familia del Top10.
- Para **Nocturno** observar la repetición acumulada de ganadoras de todo el día. No reemplazar esto por una regla basada solo en Vespertino ni por puestos de D−7.
- Ninguna ventaja probabilística ni económica ha quedado validada. Se requiere PRE auténtico con etiquetas fijadas antes del resultado y sin reajuste posterior.

## Reproducción y límites

Los scripts `vt2_transiciones_ampliadas_29oct.py`, `vt2_mismo_dia_semana_29oct.py` y `vt2_semana_controles_29oct.py`, más `vt2-posiciones-635.zip` y sus JSON, están incluidos en el paquete descargable del análisis. No se reescribió el motor ni se cambiaron historias de sorteos parciales. Este informe en GitHub registra el experimento, pero no debe tratarse como PRE sellado ni prueba de ventaja sobre la quiniela.
