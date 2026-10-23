# Modelo Lalo · Auditoría VT3 — jornadas hasta 22/10/2026

**Estado:** laboratorio de análisis, SIN modificaciones a MV1, AUX AYER, AUX HOY o APK.

## Problema investigado

En el 22/10 cinco cabezas tenían sufijos VT3 físicamente contiguos en al
menos una hoja Santiago–Neuquén, pero ninguna llegó al Top10 del motor
correspondiente. Se conservaron todos los recorridos, las familias reversibles,
los cortes cronológicos PRE/POST y las raíces D−1 / D−7.

El selector AUX actual ordena: **raíces totales, D−1, D−7, cruce entre
franjas, cantidad de recorridos, nombre de familia**.

## Cinco casos, sin reinterpretarlos como aciertos

| Turno y cabeza | Hoja | VT3 | Rank actual | Evidencia histórica del candidato |
| --- | --- | --- | ---: | --- |
| Matutino, Entre Ríos 7886 | HOY | 886 | 20 | 2 raíces D−1; 1 camino; 1 fuente |
| Matutino, Montevideo 8970 | AYER | 970 | 63 | 2 raíces D−7; 2 caminos |
| Vespertino, Ciudad 0684 | HOY | 684 | 68 | 1 raíz D−1; 3 caminos POST exactos, 1 camino transferido en ranking |
| Vespertino, Córdoba 3622 | AYER | 622 | 61 | 2 raíces D−7; 4 caminos POST exactos, 2 transferidos; cruce |
| Vespertino, Entre Ríos 3340 | AYER | 340 | 26 | 3 raíces D−7; 2 caminos; cruce |
| Vespertino, Entre Ríos 3340 | HOY | 340 | 16 | 2 raíces D−1; 1 camino; cruce |

La diferencia entre rutas exactas POST y caminos transmitidos desde raíces
PRE es intencional: una figura puede existir físicamente aunque el motor
tenga poca evidencia histórica para priorizarla.

**3340/340** entra al Top10 solo bajo prioridades contrafactuales:
- HOY priorizando cruces: #6; priorizando diversidad de fuentes: #7.
- AYER priorizando D−7: #10.

Los otros cuatro casos no entran en Top10 con ninguna de las seis
estrategias predefinidas. No promover cruce o D−7 únicamente para
recuperar el 340 del 22/10.

## Estabilidad retrospectiva previa al 22/10

Cada estrategia conserva las mismas familias, recorridos y límite
de Top3/Top5/Top10; solo cambia su orden. Los resultados se
reconstruyeron en cortes PRE antes de mirar las cabezas de cada turno.
NO son predicciones selladas prospectivamente.

| Método VT3 | Periodo | Cabezas | Top3 | Top5 | Top10 |
| --- | --- | ---: | ---: | ---: | ---: |
| AYER actual | 15–30 sep | 376 | 1 | 2 | 10 |
| AYER D−1 primero | 15–30 sep | 376 | 1 | 3 | 11 |
| AYER actual | 1–21 oct | 481 | 2 | 3 | 3 |
| AYER D−1 primero | 1–21 oct | 481 | 1 | 1 | 7 |
| HOY actual | 15–30 sep | 376 | 2 | 2 | 4 |
| HOY fuentes primero | 15–30 sep | 376 | 3 | 3 | 5 |
| HOY actual | 1–21 oct | 481 | 3 | 5 | 8 |
| HOY fuentes primero | 1–21 oct | 481 | 2 | 5 | 6 |

En **857 cabezas** (septiembre + octubre) AUX AYER pasa:
- Top10 actual **13**, alternativa D−1 primero **18**: cinco casos
  adicionales, **cero pérdidas** respecto al Top10 anterior.
- Top5 actual **5**, alternativa **4**.
- Top3 actual **3**, alternativa **2**.

Comparación pareada de cinco diferencias favorables sin ninguna desfavorable:
valor p bilateral exacto aproximado **0,0625**, sin ajuste por las
diversas variantes que examinamos ni correlación entre cabezas de un
mismo turno. No demuestra superioridad estadística ni ventaja frente al azar.

AUX HOY: el orden original sigue competitivo. Anteponer fuentes/cruces
puede recuperar el 340 del 22/10, pero pierde Top10 de octubre
(HOY original 8; fuentes 6; cruces 5).

## Decisión de ingeniería

1. **No modificar los rankings de producción** ni reinterpretar
   recorridos imposibles como válidos.
2. Rescatar **D−1 primero** como ranking *sombra* experimental en
   AUX AYER, claramente etiquetado y sin sustituir el Top3 actual.
3. Conservar el orden original en AUX HOY por ahora.
4. Si se decide incorporar al producto, presentarlo separado con
   identificadores de evidencia D−1/D−7, nunca mezclar las dos hojas
   para ampliar artificialmente el cupo Top10.
5. Validar prospectivamente con los Tops sellados antes de cada turno;
   preservar la fecha de sellado y auditar las jornadas completas.
6. Mantener métricas independientes de **formación física**, **Top**
   y **cabezas realmente acertadas**, especialmente VT3 vs VT2.

## Evidencia reproducible en Actions

- [22/10, replay exacto PRE/POST](https://github.com/y0t3/Modelo-Papa/actions/runs/39904574268)
- [Cinco casos y prueba del 1–21 octubre](https://github.com/y0t3/Modelo-Papa/actions/runs/39914829292)
- [Validación adicional 15–30 septiembre](https://github.com/y0t3/Modelo-Papa/actions/runs/39915225840)

Los artefactos de los tres runs incluyen JSON por cabeza, ranking de
familias y rasgos geométricos. El código de los experimentos permanece
solo en la rama **lab/auditoria-22oct2026-motores**.
