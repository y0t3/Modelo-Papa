# Cotejo VT3 AUX de la jornada del viernes 30/10/2026

**Fecha de auditoría:** 31/10/2026, después de la Nocturna del viernes. **Período para contrastar:** 30/10, primer día completo posterior al 29/10, fecha máxima de los estudios históricos anteriores.

**Estado:** 10 cortes comparados (cinco turnos × AUX Ayer/Hoy). La fuente utilizada es la misma de la app (API de Viví tu Suerte) y se verificaron 25 cabezas objetivo (Ciudad, Provincia, Córdoba, Santa Fe y Entre Ríos). No se incorporó Montevideo. **Todos los scripts completaron correctamente y sin saltarse la fecha.**

## Resultado por turno

| Turno | AUX Ayer: cabezas físicamente formables | AUX Ayer: Top10 / 11–20 / Formas Primero | AUX Hoy: cabezas formables | AUX Hoy: Top10 / 11–20 / Formas Primero |
|---|---:|---|---:|---|
| Previa | 0 | 0 / 0 / 0 | 0 | 0 / 0 / 0 |
| Primera | **1** | 0 / 0 / **1** | 1 | 0 / 0 / 0 |
| Matutino | 0 | 0 / 0 / 0 | 0 | 0 / 0 / 0 |
| Vespertino | 0 | 0 / 0 / 0 | **3** | 0 / 0 / 0 |
| Nocturno | 0 | 0 / 0 / 0 | 1 | 0 / 0 / 0 |
| **TOTAL** | **1** | **0 / 0 / 1** | **5** | **0 / 0 / 0** |

Los otros selectores históricos experimentales (prioridad de sitio exacto, figura desplazada, dispersión de eventos, concentración, recencia, número de eventos y los intercambios de uno/dos puestos) consiguieron **cero** cabezas en ambas hojas durante esta jornada. Controles neutrales sobre familias físicas en AUX Hoy: 0, 0, 1, 0, 3 cabezas; el azar puede diferir mucho en un día y no representa un método válido de pronóstico.

## Las seis cabezas con recorrido VT3 válido

| Turno y jurisdicción | Cabeza real | Familia reversible de 3 cifras | Hoja donde se forma | Ranking original | Formas Primero |
|---|---:|---|---|---|---|
| Primera, **Córdoba** | **5514** | **415/514** | **AUX Ayer** | **#80** | **#3 — acierto** |
| Primera, Provincia | 6364 | 364/463 | AUX Hoy | Sin puesto | No Top10 |
| Vespertina, Provincia | 9810 | 018/810 | AUX Hoy | #38 | No Top10 |
| Vespertina, Santa Fe | 5781 | 187/781 | AUX Hoy | Sin puesto | No Top10 |
| Vespertina, Entre Ríos | 3276 | 276/672 | AUX Hoy | Sin puesto | No Top10 |
| Nocturna, Santa Fe | **8734** | **437/734** | **AUX Hoy** | Sin puesto | No Top10 |

**Diagnóstico de embudo en 30/10:** 4 de 6 cabezas formables estaban **sin posición histórica** y las otras 2 estaban en puestos muy bajos (**#38 y #80**). No hubo ninguna en 1–20. El método de Formas Primero alcanzó una de esas cabezas (#80) desde su tercer puesto por priorizar sitios físicos antes que familia numérica.

### Qué no se debe concluir

- Estas seis filas no representan seis oportunidades independientes: son **cabezas de una única jornada** en varias jurisdicciones, y se evaluaron en hojas separadas.
- Que un número se pueda recorrer en AUX no significa que fuese una predicción del modelo. Hay que distinguir **formabilidad física, clasificación histórica y Top10**.
- Los resultados previos hasta 29/10 **ya se conocían** al definir las variantes. El 30/10 es primer contraste posterior y fuera de muestra respecto de esos intervalos, pero la evaluación fue **PRE reconstruido y POST cotejado después del sorteo**, no una predicción sellada antes de ocurrir.
- Un solo día **no valida ni descarta** estadísticamente Formas Primero, aunque su acierto de Córdoba merece seguimiento; tampoco justifica ampliar apuestas ni cambiar la APK.

## Resultados completos del 30/10 que cotejó la fuente

| Turno | Ciudad | Provincia | Córdoba | Santa Fe | Entre Ríos |
|---|---:|---:|---:|---:|---:|
| Previa | 1057 | 0784 | 5841 | 4277 | 2487 |
| Primera | 5489 | 6364 | 5514 | 6232 | 8785 |
| Matutino | 4888 | 5879 | 3509 | 2286 | 9305 |
| Vespertina | 0305 | 9810 | 2197 | 5781 | 3276 |
| Nocturna | 2979 | 6066 | 4182 | 8734 | 4707 |

**Auditoría GitHub:**
- [Cotejo de baseline, Formas Primero, Top20 y variantes](https://github.com/y0t3/Modelo-Papa/actions/runs/41165226574), success.
- [Detalle completo de las cabezas y posiciones](https://github.com/y0t3/Modelo-Papa/actions/runs/41165316456), success.
- Archivos del laboratorio: `scripts/lab-aux-30oct-detalle.ts` y `.github/workflows/lab-aux-vt3-jornada-30oct.yml`.
- No hay modificaciones en `main`, los motores Lalo oficiales, la app ni la APK.

## Próximo contraste fijado

Mantener **Top10 oficial**, Formas Primero y los selectores existentes sin recalibración al 30/10. Medir nuevas jornadas completas con la misma metodología. La señal principal a seguir es el embudo **formable sin raíz original**; en las cinco familias físicamente disponibles en AUX Hoy, cuatro carecían de ranking original. No inventar raíces ni introducir formaciones inválidas. Seguir el candidato de Formas Primero como **control geométrico**, no criterio ya validado para las apuestas.
