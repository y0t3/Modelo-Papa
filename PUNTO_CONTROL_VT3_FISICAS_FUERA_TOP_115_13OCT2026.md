# VT3: ternas físicas fuera del Top — punto de control 13/10/2026

Rama: `lab-vt3-termas-fisicas-fuera-top-13oct2026`.
GitHub Actions: [ejecución definitiva #38499397330](https://github.com/y0t3/Modelo-Papa/actions/runs/38499397330), **completada correctamente**.
`main`, `src/motorLalo.ts`, app y sellos oficiales: **sin modificaciones**.

## Control de coberturas, no confundir familia / cabeza / Top

**115 cortes, 575 cabezas** (5 jurisdicciones por corte). En el histórico, 64 registros de familia VT3 ganadora caían en el inventario de raíces admitidas y 79 estaban disponibles físicamente sin raíz, sumando los 143 registros del inventario VT3 físico total. Estas cifras son **familias ganadoras por corte**, no cabezas únicas ni resultados Top.

La nueva prueba descompuso cada corte en sus **1000 terminaciones posibles `000`…`999`**. Una familia reversible se asigna a una sola categoría, aunque tenga dos orientaciones, y cada orientación numérica cuenta una terminación distinta (en ternas palindrómicas, sólo una). Nunca se cuenta dos veces una misma terminación exacta.

### Exposición observada frente a referencia uniforme

| Bolsa disjunta | Terminaciones disponibles medias/corte | Cabezas observadas | Cabezas esperadas |
|---|---:|---:|---:|
| Admitidas VT3 puestos #1–3 | 5,58 | 5 | 3,21 |
| Admitidas VT3 puestos #4–10 | 13,47 | 12 | 7,75 |
| Admitidas VT3 desde #11 | 86,21 | 47 | 49,57 |
| **Físicas no admitidas: nuevas en el turno, una fuente** | 39,97 | **19** | **22,98** |
| Físicas no admitidas: persistentes en el día, varias fuentes | 13,84 | 6 | 7,96 |
| **Físicas no admitidas: persistentes, una fuente** | 80,20 | **47** | **46,12** |
| Físicas no admitidas: Previa (sin turno previo comparable) | 9,60 | 7 | 5,52 |
| No físicamente construibles | 751,13 | 432 | 431,90 |

Los estratos de físicas nuevas con **varias fuentes** tienen **cero exposición** por la geometría de acumulación de columnas: una familia que acaba de aparecer no tiene todavía caminos en dos fuentes de distintos turnos. Esta falta de exposición **no significa cero aciertos predictivos de una clase sustantiva**.

**Total admitidas:** 64 familias ganadoras registradas, con **~60,5 cabezas esperadas** por volumen numérico bajo uniformidad.
**Total sin raíz física:** 79 registros/cabezas observadas, **~82,6 esperadas**. Ningún estrato individual mantuvo una diferencia significativa después de ajustar por las diez categorías. La referencia supone cabezas uniformes independientes sólo para orientación descriptiva, sin demostrar independencia de sorteos.

## Prueba de una plaza real del Top10

Se conservaron **las primeras 9 familias oficiales** y se sustituyó **solo el puesto 10** (siempre Top de diez familias físicas válidas):

| Política (selección previa al resultado) | Top3 | Top5 | Top10, cortes | Ganancias vs oficial | Pérdidas |
|---|---:|---:|---:|---:|---:|
| Oficial | 5 | 8 | 15 | 0 | 0 |
| Sustituir puesto 10 por admitida #11 | 5 | 8 | 16 | 1 | 0 |
| Elegir física nueva | 5 | 8 | 16 | 1 | 0 |
| **Elegir física persistente con más bloques** | 5 | 8 | **18** | **3** | 0 |
| Elegir más fuentes físicas | 5 | 8 | 16 | 1 | 0 |
| **Elegir más formas geométricas** | 5 | 8 | **18** | **3** | 0 |
| Control hash fijo | 5 | 8 | 15 | 0 | 0 |

Las dos variantes que llegaron a **18/115** obtuvieron el mismo conjunto de cortes nuevos: **21/09 Primera, 01/10 Matutino y 03/10 Vespertino**. Eso no son seis confirmaciones independientes de un mecanismo. Como no se modificaron las nueve primeras plazas, el **Top3 y Top5 permanecen necesariamente constantes**; este ensayo no demuestra una solución para elevar ganadoras al Top3.

### Contraste contra 2000 decisiones neutrales del mismo inventario PRE

Se guardaron/sellaron **2000 conjuntos de 115 decisiones** antes de restaurar las cabezas objetivo. Todos eligen una sola terna física sin raíz y preservan las nueve primeras familias.

- Media neutral: **15,8785** cortes Top10.
- Percentil 5 a 95: **15–18**.
- Al menos 18: **117/2000** simulaciones (5,85 %); empírico con suavizado **118/2001 ≈ 0,0590**.
- Algunas selecciones neutrales lograron 19–20 cortes.

Por eso **18/115 no demuestra una mejora robusta**, máxime con varios métodos explorados, muchos ensayos previos y sólo 23 jornadas.

## Causas y siguiente decisión

1. **El problema de inventario está cuantificado:** las 79 coincidencias físicas sin raíz no se concentran por encima de lo esperable por la cantidad de ternas. Es incorrecto equiparar «se forma en hoja» con «es candidata fuerte».
2. **La continuidad física intradía merece seguimiento** porque una sola plaza persistente logró tres rescates históricos. No significa que debamos eliminar raíces VT3 ni cambiar su orden actual.
3. Una futura prueba realmente predictiva exige fijar de antemano **un único criterio** (y su control neutral) y obtener cortes *nuevos, aún desconocidos*, idealmente midiendo familia y cabeza concreta por separado. La repetición de 115 cortes antiguos no es una prueba externa.

## Reproducibilidad

- `PROTOCOLO_VT3_TERMAS_FISICAS_FUERA_TOP_13OCT2026.md`
- `scripts/lab-vt3-termas-fisicas-fuera-top.mjs`
- `auditorias/vt3-termas-fisicas-fuera-top-115-13oct2026/PRE_115.json`
- `auditorias/vt3-termas-fisicas-fuera-top-115-13oct2026/NEUTRAL_PRE_2000.json`
- `auditorias/vt3-termas-fisicas-fuera-top-115-13oct2026/SELLO.json`
- `auditorias/vt3-termas-fisicas-fuera-top-115-13oct2026/POST_115.json`
- `auditorias/vt3-termas-fisicas-fuera-top-115-13oct2026/RESUMEN.json`
- `auditorias/vt3-termas-fisicas-fuera-top-115-13oct2026/LECTURA.md`

**Importante:** las categorías se diseñaron tras examinar repetidamente estos datos. Estos cálculos, incluidos p-valores y controles neutrales, son diagnósticos y no implican capacidad de predicción de la quiniela.