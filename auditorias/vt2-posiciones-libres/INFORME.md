# Investigación: posiciones del Top VT2 Lalo y puestos todavía sin acierto

**29/10/2026 — estudio exclusivamente retrospectivo — 127 jornadas / 635 cortes PRE reconstruidos, 3.401 cabezas evaluables.** Lalo MV1, `main`, APK y reglas físicas no se modifican.

## Dos hipótesis, dos pruebas distintas

**H1: puesto estable por turno.** Se registró el puesto exacto 1..10 que ocupaba la familia VT2 reversible de cada cabeza ganadora, **en el Top construido antes de ese turno**. Una cabeza sin puesto Top10 no es un acierto. En la tabla hay cabezas, no días: varias jurisdicciones pueden coincidir en el mismo puesto.

**H2: Nocturna en puestos «libres».** A cada corte nocturno, definimos el conjunto U de puestos 1..10 que **aún no habían acertado en los turnos anteriores del mismo día**. Solo se marca un puesto como usado cuando una cabeza real anterior coincidió con su Top VT2 PRE. No se marca usado por una propuesta, ni se confunde con un número/familia constante: #7 de Previa y #7 de Nocturna pueden ser dos familias diferentes. Ningún resultado de Nocturna entra en U.

Se utilizó la misma base Nocturna de seis jurisdicciones, por fila, y las raíces históricas D−1/D−7 y los puestos de Lalo **sin Montevideo como raíz**, tal como está MV1. El dato pendiente de Santa Fé Nocturna 28/10 se excluyó de las etiquetas, no de la alimentación cronológica de días posteriores (no existe en la ventana del ensayo). Control de reproducción exigido: 635 cortes, 3.401 cabezas, Lalo VT2 Top3/5/10 = **220/351/674**.

## Resultado H2: puestos «libres» antes de Nocturna

- **127 Nocturnas** con hasta 10 posiciones: **1.270 posiciones**, de las cuales **830 (65,4 %)** no habían acertado antes ese día, **440 (34,6 %)** sí habían acertado.
- Hubo **140 coincidencias VT2 Top10 nocturnas**: **86 (61,4 %)** cayeron en puestos libres y **54 (38,6 %)** en puestos usados.
- Elegir solo puestos libres habría supuesto **6,54 candidatos por noche** en promedio, pero **perder 54/140 aciertos** de los que sí estaban en el Top10.
- Densidad descriptiva: 86/830 = **10,4 %** de cabeza coincidente por puesto libre / noche vs. 54/440 = **12,3 %** por puesto usado / noche. No son probabilidades de ganar por apuesta.
- Monte Carlo: 20.000 permutaciones de la **máscara de puestos usados** entre jornadas del mismo **mes y día de semana**, conservando fijos los rangos y resultados reales de Nocturna, además de la cantidad de puestos que habían acertado previamente en cada jornada. Se esperaban **89,2** aciertos en puestos libres (percentiles 95 % **[79,99]**), frente a los **86** observados; p unilateral de **más** aciertos en puestos libres ≈ **0,771**. No favorece la hipótesis.

| Período | Puestos libres entre disponibles | Aciertos nocturnos en puestos libres | Total aciertos nocturnos |
|---|---:|---:|---:|
| Junio–julio | 330/510 | 31 | 53 |
| Agosto–septiembre | 339/520 | 37 | 60 |
| Octubre 1–24 | 144/210 | 15 | 24 |
| Octubre 26–28 | 17/30 | **3** | **3** |
| **Total** | **830/1.270** | **86** | **140** |

**Importante:** las tres coincidencias de las tres Nocturnas recientes 26–28 efectivamente fueron en puestos libres. Ese resultado puntual puede dar la impresión de racha; el contraste de 127 jornadas no respalda generalizarla. La permutación estratificada octubre 26–28 no identifica un efecto (cada estrato contiene una fecha).

## Resultado H1: conteos por posición VT2 Lalo en 127 jornadas

| Turno | #1 | #2 | #3 | #4 | #5 | #6 | #7 | #8 | #9 | #10 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Previa | 16 | 18 | 18 | 9 | 11 | 9 | 16 | 6 | 16 | 5 | 124 |
| Primera | 11 | 9 | 10 | 15 | 18 | 12 | 12 | 14 | 13 | 19 | 133 |
| Matutino | 14 | 19 | 15 | 15 | 17 | 14 | 17 | 14 | 19 | 14 | 158 |
| Vespertino | 18 | 12 | 17 | 11 | 9 | 12 | 13 | 14 | 6 | 7 | 119 |
| **Nocturno** | 13 | 14 | 16 | 15 | 11 | 14 | **20** | 12 | 15 | 10 | **140** |

La posición #7 tiene más aciertos nocturnos (20) y #9, 15. Juntas **35/140 = 25 %** con 2 puestos de 10 (20 % de los lugares). No se demostró que sea estable ni especialmente superior tras examinar múltiples puestos y turnos.

### Prueba de «puestos frecuentes» con ventana de entrenamiento fija

Se escogieron los dos puestos más frecuentemente acertados **solo entre junio y julio** para cada turno (empates resueltos por número de posición) y se congelaron sin volver a ver los resultados posteriores.

| Turno | Dos puestos definidos desde junio–julio |
|---|---|
| Previa | #1 y #7 |
| Primera | #5 y #10 |
| Matutino | #5 y #9 |
| Vespertino | #1 y #3 |
| Nocturno | #3 y #7 |

| Período | Total aciertos Top10 | Aciertos dentro de los dos puestos elegidos | Proporción |
|---|---:|---:|---:|
| Junio–julio (entrenamiento, NO validación) | 264 | 79 | 29,9 % |
| Agosto–septiembre | 279 | 57 | **20,4 %** |
| Octubre 1–24 | 114 | 34 | 29,8 % |
| Octubre 26–28 | 17 | 6 | 35,3 % |

El control elige **dos puestos aleatorios por turno, congela el par a través de todo el período y mide cuántas cabezas capturan** (40.000 simulaciones).

- Agosto–septiembre: 57 observados vs. **55,8** promedio del control, **p unilateral ~0,439**. Sin beneficio.
- Octubre 1–24: 34 vs. **22,8** promedio del control, **p unilateral ~0,021** sin ajustar por mirar períodos/patrones; señal **exploratoria** que requiere validación prospectiva. No legitima optimizar un ranking retrospectivamente.
- Octubre 26–28: 6 vs. **3,4** esperado, **p unilateral ~0,126**. Tamaño insuficiente.

No considerar `TOTAL` como validación: incluye junio–julio usado para elegir los puestos. La aparente reaparición en octubre, luego de no superar el control agosto–septiembre, **no permite definir una regla automática**. El usuario ya observó puestos antes de este análisis y el algoritmo Lalo fue construido usando parte del período histórico; por tanto incluso octubre no es verdaderamente ciego de desarrollo del sistema.

## Interpretación y siguiente etapa

**No cambiar MV1 ni reducir a «puestos vacíos» automáticamente.** Tomar rangos no usados eliminaría casi **39 %** de los aciertos Top10 nocturnos del histórico. Tampoco adoptar una tabla «puesto fijo por turno»: agosto–septiembre no confirma su ventaja pese al aparente rendimiento de octubre.

Sí merece probar en paralelo con **PRE auténticos sellados**, antes de conocer el resultado:
1. Congelar el Top10 VT2 oficial por cada turno.
2. Marcar puestos que ya acertaron en los turnos anteriores, únicamente con resultados efectivamente disponibles a ese corte.
3. Registrar **sin cambiar los candidatos** las dos hipótesis: posiciones favoritas prefijadas y posiciones «libres».
4. Comparar cupos idénticos (p. ej., 2 puestos elegidos contra 2 puestos control y 10 puestos originales) y resultados por turno/jurisdicción; no sumar ni cambiar el presupuesto después.

Esta es una prueba de selección de **posiciones**, no de la cifra: puede reducir candidatos, pero si se eligen dos puestos y se falla el rank correcto, no crea aciertos.

## Reproducción

- `scripts/lab-vt2-posiciones-libres.ts`: replay cronológico 635 cortes; genera `resultados.json` y `resumen.json`.
- `scripts/lab-vt2-congelar-puestos.ts`: entrenamiento junio–julio y validación sin reajustar; genera `seleccion-congelada.json`.
- [.github/workflows/lab-vt2-posiciones-libres.yml](https://github.com/y0t3/Modelo-Papa/blob/lab/vt2-posiciones-libres-intradia-29oct2026/.github/workflows/lab-vt2-posiciones-libres.yml) — ejecución exitosa [#40823125962](https://github.com/y0t3/Modelo-Papa/actions/runs/40823125962), con artefactos completos.

**Calificación de evidencia:** retrospectiva, múltiples hipótesis probadas, sin demostración de ventaja futura frente al azar. Cifras y conteos reproducidos por GitHub Actions.
