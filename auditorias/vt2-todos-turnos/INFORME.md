# VT2 Lalo · complementariedad de señales en los cinco turnos

**Laboratorio histórico 29/10/2026.** Sin cambios en el motor MV1, `main`, la APK, los rankings Top10 ni la exclusión predeterminada de Montevideo como raíz histórica. Se reproducen **127 jornadas, 635 cortes PRE reconstruidos, 3.401 cabezas**, con Top3/5/10 **220/351/674**. Todos los cortes seleccionan **dos familias VT2 reversibles** como máximo; ninguna cabeza futura entra en su cálculo. La selección priorizada mantiene el orden original de Lalo dentro de cada grupo.

## Tres estados históricos independientes

- **HOY**: la familia ganó en cualquier turno anterior de la jornada y sigue dentro del Top10 PRE actual. En Previa no existen cabezas previas del mismo día.
- **D−7**: la familia estaba presente en el Top10 del **mismo turno**, exactamente siete días calendario antes; no se exige que hubiese ganado entonces. Se excluyen fechas D−7 no representadas en la auditoría, sin simular sorteos.
- **D−1 homogéneo**: presencia en el Top10 del mismo turno de la última jornada archivada, solo si **las seis filas de Nocturna base** del tablero actual se alimentaron efectivamente de esa fecha. Esto excluye empalmes parciales y mixtos.

La combinación `HOY_D7` elige primero las familias con aciertos previos de hoy, luego las de D−7 si quedan puestos, y finalmente las primeras familias oficiales. **No exige que se cumplan ambas marcas ni amplía el presupuesto de dos**.

## Comparación justa en las mismas 119 fechas D−7 (familias acertadas)

| Turno | Top2 de Lalo | HOY | HOY + D−7 | Diferencia vs HOY |
|---|---:|---:|---:|---:|
| Previa | **29** | 29 | 22 | −7 |
| Primera | 19 | 24 | **29** | **+5** |
| Matutino | 29 | 29 | **31** | +2 |
| Vespertino | **26** | 25 | 24 | −1 |
| Nocturno | 26 | **39** | 38 | −1 |

La comparación de familias evita contar varias cabezas de distintas jurisdicciones como varias familias. En cambio, el análisis de cabezas discordantes (mismas fechas y dos candidatos) detecta, al reemplazar HOY por HOY+D−7:

| Turno | Cabezas acertadas nuevas | Cabezas acertadas desplazadas | Saldo |
|---|---:|---:|---:|
| Previa | 9 | 17 | −8 |
| Primera | **14** | 8 | **+6** |
| Matutino | 10 | 8 | +2 |
| Vespertino | 0 | 1 | −1 |
| Nocturno | 1 | 2 | −1 |

Por tanto D−7 **no es un refuerzo universal**; mejora la selección retrospectiva solo en Primera y ligeramente en Matutino.

## Control de referencia semanal

Se permutaron **12.000 veces por turno** las máscaras de presencia D−7 entre fechas del **mismo mes y mismo día de semana**, dejando fijos el Top10, las ganadoras anteriores del día, las cabezas objetivo y el cupo de dos. Los resultados de familias acertadas con HOY+D−7:

| Turno | Observado | Promedio control | Intervalo 95 % control | p unilateral exploratoria |
|---|---:|---:|---|---:|
| Previa | 22 | 25,0 | 19–31 | 0,868 |
| Primera | **29** | 26,7 | 21–32 | 0,255 |
| Matutino | 31 | 28,8 | 25–33 | 0,209 |
| Vespertino | 24 | 25,8 | 23–28 | 0,949 |
| Nocturno | 38 | 38,3 | 36–40 | 0,784 |

**Ningún turno mostró una ventaja concluyente por añadir D−7**. Se exploraron múltiples patrones y períodos del mismo histórico; no hay evidencia de mejor pronóstico futuro ni de ventaja sobre el azar.

## Fases temporales en 119 referencias semanales

Celdas = **Top2 / HOY / HOY+D−7** (familias acertadas):

| Turno | Jun–Jul (43 cortes) | Ago–Sep (52) | Oct 1–24 (21) | Oct 26–28 (3) |
|---|---|---|---|---|
| Primera | 9 / 9 / 8 | 8 / 12 / **14** | 2 / 2 / **5** | 0 / 1 / **2** |
| Matutino | 7 / 11 / **14** | 13 / 10 / 13 | **9** / 7 / 3 | 0 / 1 / 1 |
| Vespertino | 5 / 9 / 9 | **15** / 11 / 10 | **6** / 5 / 5 | 0 / 0 / 0 |
| Nocturno | 6 / **11** / 10 | 15 / **21** / 20 | 4 / 7 / **8** | **1** / 0 / 0 |

Lo que parece favorecer Matutino en junio–julio se invierte en octubre. También Vespertino cambia de fase: las ganadoras anteriores del día fueron más útiles en junio–julio, pero no en agosto–octubre. Esas variaciones **no justifican activar un filtro cuando una racha parece continuar**, porque otras pruebas de ventanas móviles de 5/6 jornadas no lograron anticipar su final.

## D−1 con seis fuentes de Nocturna coherentes

En **121 jornadas comparables**, familias acertadas usando «ganó HOY» vs. «ganó HOY, y luego presencia D−1 si falta completar»:
- Previa: **32→28**
- Primera: **25→26**
- Matutino: **30→28**
- Vespertino: **27→27**
- Nocturno: **38→36**

No aporta una mejora sostenida. Es deliberado que no usemos una «jornada ayer» global cuando Montevideo y otras jurisdicciones pudieron haber tenido resultados parciales distintos.

## Alternativa secundaria: puesto Matutino poco acertado en cinco jornadas

En **122** Matutinas con cinco jornadas anteriores disponibles, seleccionar los dos puestos con menos aciertos recientes produjo **37 familias coincidentes** contra **30** del Top2, pero la mejora aparece en junio–septiembre y desaparece en octubre. Es descriptiva, seleccionada luego de explorar varias hipótesis y no validada.

## Recomendaciones de lectura visual (no de apuesta)

1. **Primera:** mostrar por separado «acertó en Previa» y «presente en Primera D−7», sin sumar artificialmente la fuerza de ambas ni reorganizar el Top10.
2. **Matutino:** observar familias de hoy / semana anterior y puestos fríos cinco jornadas; **nunca descartar el Top10** por un período históricamente favorable.
3. **Vespertino:** dar prioridad a leer el ranking oficial; no hay indicio consistente para elevar marcadores diarios o semanales.
4. **Nocturno:** observar familias ganadoras en *todos* los turnos anteriores de la jornada. La presencia semanal no añadió capacidad selectiva.
5. **Previa:** las referencias D−7 y D−1 no recuperaron el Top2; conservar como contexto, no como prioridad.

Los cambios de interfaz ya acordados permanecen pendientes de una actualización separada: Top10 visible en todos los motores, coincidencias desde primera vista, familias VT2 y retirar la vista «Nueva Prueba» conservando compatibilidad de datos antiguos.

## Reproducción

- `scripts/lab-vt2-posiciones-libres.ts` reconstruye los 635 cortes originales.
- `scripts/lab-vt2-todos-turnos.py` calcula todas las políticas y permutaciones, generando `auditorias/vt2-todos-turnos/resultados.json` con cada uno de los 635 cortes.
- [GitHub Actions: comparación y regresión MV1, ejecución exitosa](https://github.com/y0t3/Modelo-Papa/actions/runs/40835768625).

**Todos los resultados son retrospectivos, con múltiples pruebas y sin PRE prospectivos sellados; no prueban mejora futura ni expectativa positiva de apuestas.**
