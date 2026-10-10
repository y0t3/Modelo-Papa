# Modelo Papá — Ensayo VT3 con apoyo VT2 genuinamente independiente
Fecha de control: 2026-10-10. Rama: `experimento-analisis-visual-5d`.

## Qué se probó
La última prioridad acordada es VT3. VT2 mantiene su propia memoria y VT4 queda
como extensión física o extra experimental, sin mezclarse con los aciertos VT3.

Hipótesis: una ruta VT3 heredada de D-7 podría ser más confiable si su
terminación geométrica VT2 estuvo respaldada por una **cabeza anterior distinta,
en otro sorteo**, que generó una ruta VT2 físicamente conectada.

La variante no inventa nuevas cifras: reordena las rutas VT3 físicamente
admisibles de D-7 y conserva **exactamente el mismo Top 3 por turno**. La
estrategia base es el lector combinado VT3 Top3 previamente congelado.

Para aceptar un apoyo VT2, se exige:
- Coincidencia VT2 real registrada después de D-7 y antes del sorteo D.
- Mismo turno de salida, misma columna física de origen.
- La marca VT2 NO puede ser simplemente el sufijo de la ruta VT3 derivada de
  esa misma cabeza histórica en ese sorteo.
- Evidencia EXACTA si coincide la huella de las dos celdas finales;
  CONTACTO si comparte alguna de esas celdas sin identidad de ruta.
- Máximo un apoyo de cada sorteo; EXACTA precede a CONTACTO.
- Orden predefinido: más sorteos con EXACTA, luego CONTACTO, luego el ranking
  anterior para desempatar. Este orden es experimental, no validado.

## Resultados con igual presupuesto
| Tramo | VT3 Top3 seleccionados | Cambios de selección | Aciertos originales | Con apoyo VT2 | Referencia física aleatoria |
|---|---:|---:|---:|---:|---:|
| 2024 | 2456 | 390 | 14 | 14 | 14.044 |
| 2025 | 2420 | 397 | 13 | 16 | 14.686 |
| Ene–may 2026 | 923 | 139 | 5 | 5 | 4.500 |
| Jun–sep 2026 | 790 | 146 | 7 | 5 | 6.012 |
| **Total** | **6589** | **1072** | **39** | **40** | **39.242** |

Como suma adicional descriptiva, sufijos VT2 contenidos en candidatas VT3:
359 original frente a 360 con apoyo independiente. **No son aciertos adicionales
independientes** del VT3 de la misma cabeza.

El +3 de 2025 NO se reproduce en el resto: −2 en el tramo reciente,
0 en 2024 y principios de 2026. La diferencia total es +1 en 6589
candidatas, sin ganancia demostrada frente al azar físico equivalente.

## Decisión
No integrar el reordenamiento VT2→VT3 como selector final. Preservarlo como
**observador y trazabilidad** de recorridos, no como garantía de mejor acierto.
No manipular pesos, umbrales o geometrías para recuperar retrospectivamente
los aciertos que perdió.

## Código y evidencia en GitHub
- `src/vt3IndependentSupport7d.ts`: selección y auditoría cronológica.
- `scripts/test-vt3-independent7d.cjs`: control de D-7, exclusión de VT2
  heredado de VT3 en el mismo sorteo, mismo cupo y fuga temporal.
- `scripts/run-vt3-independent7d.cjs`: comparación por fecha, turno y mes.
- `.github/workflows/vt3-independent-vt2.yml`: cuatro períodos.
- Ejecución completada, cuatro trabajos verdes, JSON completo por fecha,
  marca, columna y ruta: https://github.com/y0t3/Modelo-Papa/actions/runs/38024371474
- Batería 7D experimental: https://github.com/y0t3/Modelo-Papa/actions/runs/38024371526

## Qué NO inferir
No se comprobó que las figuras más apoyadas predigan las cabezas.
Los cuatro períodos ya fueron objeto de ensayos exploratorios; no hay
validación prospectiva de una mejora.
Un VT3 acertado implica su VT2 sufijo, pero en la misma cabeza;
VT4 extra sigue en investigación independiente.

## Próxima observación delimitada
Antes de crear otra variante con umbrales o pesos, comparar **la continuidad
de una MISMA figura VT3 entre D-14 y D-7** (mismo día de la semana,
mismo turno, misma columna física), y si esa continuidad fue visible antes
de proyectar D. Dejar aparte trayectorias simplemente conectadas y
lecturas numéricas. Mismo Top3 y control físico; si no hay suficientes
reconfirmaciones, reportar ese límite sin inventar señales.
