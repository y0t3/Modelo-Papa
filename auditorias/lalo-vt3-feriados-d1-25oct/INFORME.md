# Modelo Lalo +11 · secuencias VT3 y memoria D−1 en jornadas parciales
**25 de octubre de 2026 · Experimento aislado · APK / MV1 / main intactos**

## Investigación completada
Se estudiaron las activaciones **comprobadas** de recorridos VT3 en las
seis jornadas completas anteriores, sin usar cabezas del turno objetivo:
- Seguimiento del mismo recorrido, con clave fuente + secuencia exacta
  de tres posiciones (se considera igual su reverso).
- Seguimiento de la misma forma desplazada hasta una o dos filas
  **dentro de una misma fuente**.
- Aciertos y denominadores de TODAS las familias físicamente disponibles
  en PRE, incluyendo las que el motor Lalo no reconoce; control de azar
  de 10.000 selecciones dentro de los mismos conjuntos elegibles.

## Resultado de secuencias (124 jornadas, 620 cortes PRE, 3.321 cabezas)

| Condición de familia no reconocida | Cortes elegibles | Recuperaciones Top10 |
| --- | ---: | ---: |
| Mismo recorrido, racha de dos activaciones | 3 | 0 |
| Mismo recorrido, activación tras pausa | 3 | 0 |
| Mismo recorrido, intermitente | 3 | 0 |
| Misma forma +/-1 fila, racha | 6 | 0 |
| Misma forma +/-1 fila, rebote | 3 | 0 |
| Misma forma +/-2 filas, racha | 6 | 0 |
| Misma forma +/-2 filas, rebote | 3 | 0 |

**No existe ventaja demostrada.** La poca elegibilidad no se debe
interpretar como una predicción rara y potente: se concentra en
dos jornadas con **antecedentes D−1 anormalmente incompletos**.
No se crea otro selector ni se toca MV1.

## Hallazgo estructural: fechas parciales y hoja Nocturna anterior

`previousDrawDay` solo salta domingos. Esto devuelve 20/06 como
precedente de 22/06 y 09/07 como precedente de 10/07, aunque ambas
fechas son parciales para las jurisdicciones argentinas:

| Fecha | Resultados publicados reales | Precedente completo |
| --- | --- | --- |
| 20/06 | Montevideo Nocturno **0963**; demás sin resultado | 19/06 |
| 09/07 | Montevideo Matutino **0449**, Nocturno **0802** | 08/07 |

**NO llenar fechas de sorteos inexistentes.** La reconstrucción de
Nocturna anterior válida para el objetivo debe ser **por jurisdicción**,
preservando las cabezas reales de Montevideo.
- 22/06 Nocturna previa: Ciudad 8461, Provincia 7601, Córdoba 6238,
  Santa Fe 6210, Entre Ríos 0626 (todos 19/06);
  Montevideo **0963** (20/06).
- 10/07 Nocturna previa: Ciudad 6828, Provincia 5071, Córdoba 8367,
  Santa Fe 3980, Entre Ríos 1309 (todos 08/07);
  Montevideo **0802** (09/07).

Son seis filas válidas de orígenes anteriores distintos, no cabezas
inventadas ni reemplazos globales de fechas.

## Comparación de variantes, datos separados de jerarquía

Cada variante se probó sin usar resultados futuros, con el mismo motor
físico y las mismas raíces D−7; solo cambia la preparación de D−1 o la
fuente Nocturna anterior:

| Política | Cabezas con VT3 dibujable en PRE | Aciertos familiares VT3 Top10 |
| --- | ---: | ---: |
| Código original: previa de calendario + raíces D−1 de esa fecha | 852 | 58 |
| Solo raíces históricas D−1 desde última jornada completa | 852 | 59 |
| **Sustituir toda la Nocturna anterior** por última fecha completa (no correcto cuando Montevideo sorteó) | 858 | 59 |
| Hoja compuesta por jurisdicción, sin corregir raíces D−1 | 858 | 58 |
| **Hoja compuesta por jurisdicción Y raíces D−1 corregidas** | **858** | **58** |

VT3 Top3: **16** en todas. VT3 Top5: **35** en todas.
La hoja compuesta reconstruye **seis oportunidades físicas nuevas**
sin fabricar recorridos ni borrar números recientes de Montevideo,
pero no añade aciertos Top10. Algunos puestos y familias reconocidas
sí cambian.

Ejemplos de cabeza POST explicativa (no pronósticos):
- 22/06 Matutino Ciudad **9721**, familia 127/721: antes no se
  formaba en la hoja; al componer Nocturna anterior por jurisdicción
  se vuelve físicamente formable y alcanza puesto #27 en la variante
  completa (no Top10).
- 10/07 Matutino Provincia **6469**, familia 469/964: al corregir
  solo las raíces D−1 sube de ausente a #7; al reconstruir la hoja
  por jurisdicción y D−1 pasa al puesto #13, por lo que **ya no es
  acierto Top10**.
- 10/07 Matutino Santa Fe **5872**, familia 278/872: se dibuja
  tras reconstruir la hoja, pero queda #11 con composición por
  jurisdicción y D−1.

La prueba que reemplazaba toda la fecha de Montevideo conseguía un
Top10 adicional porque cambiaba artificialmente el tablero; esa
ganancia no avala esa modificación.

## Interpretación y límites

1. Es una **corrección potencial de fidelidad de datos**, no un
   motor predictivo nuevo.
2. La definición operativa de «jornada completa» (`>=20` cabezas)
   es exclusiva del experimento y puede no funcionar con turnos
   parciales/reglas de sábado. Una implementación necesita buscar
   el antecedente válido por **jurisdicción y turno**, conservando
   la fecha original de cada cabeza. No descartar legítimos sorteos
   de Uruguay ni rellenar por aproximación.
3. El origen de hoja +11 debe distinguir la última Nocturna de cada
   jurisdicción de la memoria geométrica D−1/D−7: son políticas
   relacionadas pero NO idénticas.
4. No se modificaron `main`, `src/dates.ts`, `App.tsx`, APK ni
   MV1. Antes de integrar cualquier cambio, validar sábados,
   feriados y cabezas excepcionales con pruebas de regresión.
5. Rendimiento predictivo: muestra retrospectiva, condicionada por
   decisiones de ranking ya exploradas; no prueba ventaja sobre azar.

## Reproducción
- [Seis días, camino inmóvil](https://github.com/y0t3/Modelo-Papa/actions/runs/40166302828)
- [Seis días, desplazamientos verticales](https://github.com/y0t3/Modelo-Papa/actions/runs/40166428510)
- [Auditoría D−1 de jornada completa](https://github.com/y0t3/Modelo-Papa/actions/runs/40166850352)
- [Auditoría +11 por jurisdicción](https://github.com/y0t3/Modelo-Papa/actions/runs/40166987993)
- Código `scripts/lab-lalo-nocturna-por-jur.ts` y
  `scripts/lab-lalo-previo-completo.ts` en ramas LAB;
  cada ejecución archiva `resumen.json`, `dias-afectados.json`,
  `cabezas.json` y `cambios-cabezas.json`.

**Decisión:** no adoptar selector nuevo. Retener el hallazgo de
jornadas parciales como prueba de preparación histórica en laboratorio
y estudiar su integración solo con política explícita por jurisdicción.
