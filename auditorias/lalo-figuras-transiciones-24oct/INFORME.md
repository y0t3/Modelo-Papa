# Movimiento de figuras VT3 — informe 24/10/2026

**Alcance:** investigación histórica del Modelo Lalo +11, código aislado en
ramas LAB. No cambia la APK, `main` ni el MV1 congelado.

## Protocolo y alcance temporal

- 125 jornadas no dominicales de junio–23 de octubre 2026, 3.298 cabezas
  efectivamente publicadas, 625 cortes PRE de los cinco turnos.
- El motor genera familias con huellas físicas validadas y fuentes
  conocidas al momento del corte. Cada selector reordena exclusivamente
  las **mismas 10 familias VT3**, sin crear rutas ni atravesar columnas.
- El resultado POST del turno objetivo se consulta solo para puntuar.
- Los recorridos físicos originales de VT2 y VT4 no se modifican;
  los estudios de selección comparan una lista VT3 local, no alteran
  jerarquías de las madres que alimentan VT4.
- PRE: se construye con resultados de los turnos anteriores y Nocturna
  previa; D−1 y D−7 son hojas completas realmente anteriores.
- Se agregan **señales geométricas**, nunca nuevos números:
  (1) nace solo en última fuente; (2) repite forma en fuente anterior,
  incluso si la cifra/familia cambia; (3) mismo trazo trasladado 1–2
  filas entre fuentes; (4) misma forma en igual columna D−7; (5) forma
  de cabeza ganadora D−7 que se observa una columna más a la derecha.

## Resultados globales

| Prioridad | VT3 Top3 | VT3 Top5 | VT3 Top10 |
| --- | ---: | ---: | ---: |
| Lalo original | 16 | 35 | 58 |
| Bifurcación > D−1 | **22** | **36** | 58 |
| Eco de misma figura entre columnas, números distintos | 21 | 31 | 58 |
| Figura trasladada 1–2 filas entre columnas | 20 | 31 | 58 |
| Eco visible desde 2 columnas previas | 20 | 32 | 58 |
| Figura ganadora semanal en MISMA fuente, misma forma | 21 | 34 | 58 |
| Figura ganadora semanal UNA fuente a la derecha | 16 | 31 | 58 |
| Figura del D−1 UNA fuente a la derecha | 16 | 31 | 58 |
| Figura semanal derecha > D−1 | 19 | 36 | 58 |

Los resultados de movimiento de figuras se contrastaron con
la referencia D−1 calculada con el MISMO motor y la MISMA población.

## Desglose mensual (junio a octubre)

| Mes | Lalo Top3 | Eco interno de figura Top3 | D−1 Top3 |
| --- | ---: | ---: | ---: |
| Junio | 5 | 6 | 7 |
| Julio | 2 | 1 | 3 |
| Agosto | 4 | 4 | 4 |
| Septiembre | 3 | 3 | 5 |
| Octubre 1–23 | 2 | **7** | 3 |

El eco físico repuntó del 3 al 13 de octubre; en el 14–23/10
no obtuvo aciertos Top3 adicionales. **No permite inferir que el
estado seguirá activo durante próximas jornadas.**

Ejemplos específicos de cambios de ranking por eco:
- 03/10 Matutino Córdoba 2592: VT3 familia 295/592 #5 -> #3.
- 03/10 Matutino Entre Ríos 5832: 238/832 #4 -> #2.
- 05/10 Matutino Santa Fe 3729: 729/927 #5 -> #1.
- 08/10 Matutino Entre Ríos 7071: 071/170 #7 -> #3.
- 13/10 Primera Ciudad 5485: 485/584 #5 -> #3.

La misma **forma** aparece en una columna anterior con otra familia;
la comparación es geométrica, no un recorrido válido que cruce columnas.

El control de junio sin reajustar recuperó 2 aciertos Top3 con el eco,
pero perdió 1; Top5 cayó de 10 a 9. El efecto global de eco (21 vs 16)
es un saldo de 7 recuperados menos 2 perdidos en el Top3.

## Cuánto aporta el eco por sí solo

- 6.201 apariciones de familias Top10 en el estudio semanal;
  58 coincidencias de familia VT3 Top10.
- Figura ganadora semanal que reaparece **una fuente a la derecha**:
  834 apariciones, con 4 coincidencias Top10.
- Resto: 5.367 apariciones, 54 coincidencias Top10.
- Misma forma en MISMA fuente semanal: 2.881 apariciones,
  26 coincidencias; resto 3.320 apariciones, 32 coincidencias.
- La forma derecha **no presentó enriquecimiento** para este
  criterio operacional estrecho. Esto NO refuta el método completo
  del padre (podría involucrar otras transformaciones de figura).
- El eco idéntico de la misma familia entre dos fuentes contiguas
  fue demasiado escaso: solo 8 de 4.914 apariciones en julio–octubre,
  sin una sola coincidencia Top10. Por eso se ensayó el eco ignorando
  la identidad numérica.

## Controles comparativos y azar

El control condicional seleccionó al azar 3 puestos de los Top10
existentes en cada corte, preservando la multiplicidad de cabezas por
familia. Se ejecutaron 40.000 réplicas con semilla fija 20261024
en una comprobación analítica complementaria:
- Media nula: **17,40** cabezas Top3; desviación 3,45.
- Motor original 16: P(nulo ≥ 16) ≈ 0,703.
- D−1 (22): P(nulo ≥ 22) ≈ **0,117**.
- Eco (21): P(nulo ≥ 21) ≈ **0,184**.

Contrastes pareados exploratorios frente a Lalo Top3:
- D−1: 9 incorporaciones, 3 pérdidas, p unilateral ≈ 0,073.
- Eco de figura: 7 incorporaciones, 2 pérdidas, p unilateral ≈ 0,090.
- Semana misma fuente: 8 incorporaciones, 3 pérdidas (no prueba de
  significación ajustada a métodos múltiples).

Estas cifras describen un *replay* retrospectivo. **No prueban
capacidad predictiva ni mejor desempeño frente a sorteos aleatorios.**
Se ensayaron distintas formas de ordenar familias sobre un histórico
ya disponible, por lo que ningún valor p exploratorio supera por sí
solo la selección múltiple ni constituye validación prospectiva.

## Decisión

1. Conservar VT3 original y el experimento D−1 por separado.
2. NO crear submotor, NO activar eco ni movimiento a derecha en APK.
3. Para el próximo análisis focalizado de 5–6 jornadas, mirar
   transiciones de **estado de la figura** —nace, permanece, cambia
   de fuente, desaparece— sin aumentar cupos. Congelar hipótesis
   antes de ver resultados si se intenta mejorar el ranking.
4. Mantener intactas las reglas de contacto, mismo origen de
   columna y VT4 con cuarta cifra antepuesta a su madre VT3.

## Evidencia reproducible

- [Transición misma familia y última columna](https://github.com/y0t3/Modelo-Papa/actions/runs/40154451918)
- [Eco de forma sin identidad numérica](https://github.com/y0t3/Modelo-Papa/actions/runs/40154702327)
- [Control de junio](https://github.com/y0t3/Modelo-Papa/actions/runs/40154859638)
- [Desplazamiento semanal entre fuentes](https://github.com/y0t3/Modelo-Papa/actions/runs/40155169591)
- Los workflows publican por cabeza, fuente, forma y puesto, con
  candidatos PRE guardados antes del contraste POST.
