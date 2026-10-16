# Revisión Geometría completa — jueves 15/10/2026

Estado: comparación retrospectiva, sin alterar la APK ni el motor oficial. El PRE se reconstruye sin las cabezas del turno objetivo. Los posibles PRE guardados en el teléfono están en almacenamiento local y no son verificables desde GitHub.

## Acierto físico

**Nocturno de Entre Ríos: 6624 → terminación 624 → familia 426/624.**

- **Geometría completa: Top 2**, ya presente desde la Previa.
- **Lalo oficial: puesto 16**, admitida pero fuera de Top10.
- Fuente actual: Nocturna anterior; recorrido 1 izquierda → 2 izquierda → 3 izquierda = 624 (6-2-4), tres celdas verticales contiguas.
- Raíz verificable: jueves 08/10, Ciudad Nocturno, cabeza 4534, terminación 534. Recorrido en la antigua Nocturna anterior: 6 derecha → 5 derecha → 4 derecha. Esa forma se traslada rígidamente y da 426 en sentido inverso al recorrido actual 624. La familia también dispone de ruta bifurcada.
- El motor oficial contabiliza un antecedente de la semana anterior, ninguno de ayer, un bloque bifurcado, dos bloques físicos y una fuente. Su criterio prioriza número de bifurcaciones y luego raíces recientes; Geometría completa da más prioridad a desplazamientos equivalentes de formas entre hojas.

## Tops geométricos de los cinco turnos

Los primeros tres puestos permanecieron idénticos de Previa a Nocturno:
1. 627/726.
2. 426/624.
3. 027/720.

Las tres tenían antecedente histórico propio. El mismo Top3 durante los cinco turnos indica **inercia del ranking**, no una selección temporal específica del Nocturno.

## Balance completo 15/10

| Turno | Familias físicas disponibles | Geometría Top3 | Geometría Top10 | Oficial Top3 | Oficial Top10 |
|---|---:|---:|---:|---:|---:|
| Previa | 44 | 0 | 0 | 0 | 0 |
| Primera | 90 | 0 | 0 | 0 | 0 |
| Matutino | 142 | 0 | 0 | 0 | 2 |
| Vespertino | 169 | 0 | 0 | 0 | 0 |
| Nocturno | 224 | **1** | **1** | 0 | 0 |
| **Total** | — | **1** | **1** | **0** | **2** |

Geometría acertó en una cabeza de tres cifras del Nocturno. No acertó una de cuatro cifras exacta. La bolsa física aumentó de 44 a 224 familias pero el Top3 nunca cambió.

**Conclusión:** Geometría encontró una familia físicamente anclada que Lalo ordenó muy abajo. No se puede inferir superioridad a partir de un día; tampoco debemos reemplazar o combinar motores sin comparación prospectiva.

## Prueba siguiente
- Mantener los motores separados. Guardar ambas selecciones antes de cada sorteo y registrar cuándo cambian por nueva columna.
- Evaluar prospectivamente aportes exclusivos de Geometría frente al oficial y controles de elección neutral de la misma bolsa de familias físicas.
- Estudiar el exceso de inercia del Top3 geométrico y comparar por separado dos tipos de pérdida: familia ya admitida, pero fuera de top (426/624) y familia física sin anclaje (242/242).
- No usar el resultado del 15/10 para reajustar el puntaje y luego atribuirse ese mismo acierto.

### Procedencia
GitHub Actions https://github.com/y0t3/Modelo-Papa/actions/runs/38845612815 ; artefacto COTEJO-15OCT2026. Código: src/vt3Shadow.ts, src/motorLalo.ts y scripts/lab-cotejo-jornada-15oct2026.ts de rama de laboratorio.
