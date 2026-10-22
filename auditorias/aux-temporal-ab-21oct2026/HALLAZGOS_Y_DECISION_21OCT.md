# AUX por etapas · evaluación exploratoria

**Estado: investigar sin incorporar cambios al motor estable.**
Replays ejecutados sobre 17 jornadas sorteables del 01 al 20/10/2026
(454 cabezas), con listados de familias PRE generados en el corte del turno
antes del cotejo POST. El análisis es retrospectivo: **no son apuestas
registradas prospectivamente**.

## Hipótesis temporal
- ANTERIOR: grilla 2x12 de Santiago y Neuquén del día sorteable anterior,
  24 cifras disponibles desde la Previa.
- INTRAJORNADA: grilla del día objetivo que se habilita progresivamente,
  0/8/16/24/24 cifras antes de Previa/Primera/Matutino/Vespertino/Nocturno.
- ETAPA_A: ANTERIOR en Previa, Primera y Matutino; INTRAJORNADA en
  Vespertino y Nocturno. No mezcla Tops ni duplica el presupuesto de familias.
- ETAPA_MAT_DUAL: ANTERIOR hasta Primera, familias de ambas intercaladas
  sin superar Top3/5/10 en Matutino, INTRAJORNADA en turnos finales.

## Resultado VT3 sin corregir por azar

| Método | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| Anterior puro | 2 | 3 | 3 |
| Intrajornada puro | 3 | 5 | 8 |
| Etapa A | 4 | 6 | 9 |
| Etapa Mat Dual | 3 | 6 | 10 |

En Vespertino+Nocturno INTRAJORNADA halló 7 VT3 Top10; ANTERIOR 1.
En Matutino hallaron 1 por modalidad y el alternado 2. Los aciertos
exclusivos **no implican** que haya aumentado la capacidad predictiva.

## Control contra azar, manteniendo los Tops fijos

Se permutaron 3.000 veces las terminaciones entre eventos del MISMO
turno; se conservaron los Tops originales, los cupos y el número de
cabezas por turno. Semilla 20261021. El p es la fracción de
redistribuciones con tantos o más aciertos que los reales.

| ETAPA A VT3 | Aciertos | Promedio permutado | p >= observado |
|---|---:|---:|---:|
| Top3 | 4 | 2,98 | 0,354 |
| Top5 | 6 | 4,97 | 0,370 |
| Top10 | 9 | 10,32 | 0,720 |

Ningún contraste anterior revela una mejora convincente frente al nulo.
Con solo 17 jornadas los intervalos son amplios. Hay además varias
configuraciones comparadas a posteriori: NO seleccionar la ganadora
histórica como si hubiera sido preinscrita.

## Rescate útil para diseño y experimentación

La fecha base y el corte de disponibilidad **sí** son diferentes y deben
representarse como hipótesis distintas, sin violar adyacencias, inventar
familias ni cruzar columnas del +11. Acierto de Top y recorrido
formable son dos mediciones diferentes. Antes de priorizar por etapas
falta un bloque futuro sellado, con política fija, un presupuesto
idéntico por modalidad y comparación con control nulo / MV1.

La app actual mantiene su AUX Anterior; MV1 no fue tocado.
Para resultados y Tops de cada corte, consultar el artefacto de
GitHub Actions: [Backtest 01–20](https://github.com/y0t3/Modelo-Papa/actions/runs/39712145419),
[Permutación](https://github.com/y0t3/Modelo-Papa/actions/runs/39713763544).
