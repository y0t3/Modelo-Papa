# Modelo Lalo · Continuidad intrajornada de marcas comprobadas en ambas hojas

**21/10/2026 · Rama experimental:** `lab/continuidad-intrajornada-21oct2026`  
**Ejecución completa:** https://github.com/y0t3/Modelo-Papa/actions/runs/39667802284  
**MV1, TOPS, `main` y APK:** **sin cambios**.

## Qué pregunta responde esta prueba

En el cuaderno del padre, las figuras se marcan **después** de que sale una cabeza de las seis jurisdicciones, no se pintan candidatos arbitrarios como si hubieran acertado. Estas huellas comprobadas quedan disponibles al analizar turnos posteriores del **mismo día**.

Esta prueba pregunta si, entre familias VT2, VT3 y VT4 **comprobadas POST en turnos anteriores**:

- Una figura que ya se puede formar conserva sus fuentes físicas (**PERSISTE**).
- Esa figura suma **otra fuente de +11 o de Santiago/Neuquén**, incorporada al avanzar el día (**NUEVA_FUENTE**).
- La figura está disponible físicamente pero no cuenta aún con una cabeza anterior del propio día que la haya marcado (**SIN_MARCA**).
- La terminación ganadora posterior no aparece físicamente en ninguna de las dos hojas (**SIN_GEOMETRIA**).

**NUEVA_FUENTE no es una marca nueva**: se aplica **solo** cuando la familia ya tenía una cabeza previa realmente sorteada y un camino POST comprobado; debe incorporar después una columna/franja física diferente. Varias rutas en la misma fuente no aumentan el número de fuentes.

### Geometría

- **+11:** se mantiene estrictamente **una sola columna de origen** por recorrido. Se agregan `prevNocturno`, `Previa`, `Primera`, `Matutino`, `Vespertino` al llegar a sus turnos pertinentes; no se cruzan columnas.
- **Auxiliar:** 2 filas × 12 posiciones con cabezas reales de Santiago y Neuquén, SIN +11, fuentes Previa/Primera/Matutino. Sí permite cruzar franjas por celdas adyacentes, sin saltos, huecos ni reutilización. Antes de Previa no hay auxiliar; antes de Primera solo Previa, etc. Después de Matutino no crecen las tres fuentes auxiliares.
- **VT2 y VT3:** las orientaciones reversibles representan una **familia**, aunque en la marcación POST se exige el sufijo exacto de la cabeza publicada.
- **VT4:** prefijo/cifra añadida + **madre VT3**; no se invierte VT4 completa ni se cuentan como cubiertas cuatro cifras que no tengan recorrido físico.
- **Recuento:** la unidad de prueba de un acierto es `jurisdicción × turno × cabeza × modalidad`, **una vez por cabeza**, no una vez por camino físico.

## Procedimiento sin fuga

1. Reconstruir cada jornada a partir de la Nocturna anterior y cabezas auxiliares, usando solamente las fuentes PRE permitidas en el turno objetivo.
2. Conservar la **bitácora de marcas anteriores** solo de turnos ya finalizados en esa jornada; registrar una marca únicamente si el sufijo exacto fue **ganador y físicamente formable en el PRE de su turno** en +11 o AUX.
3. Comparar las fuentes físicas de cada familia comprobada entre el PRE anterior y el PRE actual: fuente nueva real, mera persistencia y eventual incorporación de la otra hoja como soporte.
4. **Solo después** comparar con la cabeza que efectivamente salió en el turno objetivo para medir coincidencia posterior. Los resultados objetivo no forman ni puntúan las familias antes de ese momento.
5. No se generan Tops nuevos ni selecciones de apuestas. Se cuenta el número **total de terminaciones exactas formables por categoría** para calcular una expectativa de azar uniforme sobre la misma exposición: `número de cabezas observadas × terminaciones cubiertas / 10^n`.

Se evaluaron **69 jornadas, 276 cortes PRE y ~1.500 cabezas** en cada uno de los períodos 1 de agosto–20 de octubre de **2024, 2025 y 2026**, exclusivamente los turnos Primera, Matutino, Vespertino y Nocturno; Previa no tiene marcas previas del mismo día. Los conteos son retrospectivos, no pronósticos originalmente sellados.

## VT2: acierto legítimo y grupo de fuentes nuevas

| Período | VT2 con otra fuente nueva | Referencia uniforme correspondiente | VT2 persistente | Referencia uniforme persistente |
|---|---:|---:|---:|---:|
| 2024 | 58 | 64,26 | 111 | 111,83 |
| 2025 | 70 | 74,01 | 127 | 123,03 |
| 2026 | **83** | 66,88 | **140** | 118,19 |
| **Total** | **211** | **205,15** | **378** | **353,05** |

En 2026 hubo un exceso VT2 respecto de la referencia uniforme tanto en marcas con fuente nueva como en persistentes. **No se observó el mismo patrón para fuentes nuevas en 2024–2025**, por lo cual sería incorrecto ascender automáticamente sus familias al Top.

Las categorías ocupan distintas cantidades de terminaciones: VT2 fuente nueva ocupó **1.176 / 1.354 / 1.220** terminaciones-corte en 2024/25/26; las persistentes **1.976 / 2.183 / 2.099**. Una familia reversible puede corresponder a dos terminaciones, y no debe entenderse cada familia como una sola apuesta.

## VT3: una segunda fuente no fue suficiente como criterio

| Período | VT3 fuente nueva: aciertos / esperables | VT3 persistente: aciertos / esperables |
|---|---|---|
| 2024 | 0 / 1,361 | 5 / 8,138 |
| 2025 | 0 / 1,269 | 11 / 8,119 |
| 2026 | 0 / 1,219 | 10 / 8,286 |
| **Total** | **0 / 3,849** | **26 / 24,543** |

En VT3 las familias previamente marcadas y que recibieron otra columna **no explicaron posteriormente ninguna de las cabezas medidas** en los tres años. El conjunto fue pequeño —229 a 245 terminaciones-corte anuales—, por lo que el cero **no prueba una propiedad negativa permanente**. Sí desautoriza otorgar automáticamente mayor peso predictivo a una familia simplemente por ganar una segunda fuente.

VT3 persistente aportó algo más de resultados que el control uniforme agregado, pero sin consistencia suficiente por año para modificar MV1.

## VT4 exacto

| Período | VT4 fuente nueva: aciertos / referencia uniforme | VT4 persistente: aciertos / referencia uniforme |
|---|---|---|
| 2024 | 0 / 0,0139 | 0 / 0,2122 |
| 2025 | 0 / 0,0130 | 1 / 0,2342 |
| 2026 | 0 / 0,0111 | 1 / 0,2151 |

Muestras absolutamente insuficientes. La fuente nueva VT4 apareció en **11–14 cortes** anuales como familia previamente marcada, no en todos los miles de recorridos geométricos VT4 disponibles. Esta diferencia es crucial: *geometría disponible* y *marca realmente comprobada* no se deben confundir.

## De dónde surge el respaldo nuevo

El laboratorio contó, por **familia × corte**, el número de familias anteriores marcadas que incorporaron nueva fuente:

| Año | VT2: +11 nuevo / AUX nuevo | VT3: +11 nuevo / AUX nuevo | VT4: +11 nuevo / AUX nuevo |
|---|---|---|---|
| 2024 | 421 / 250 | 82 / 48 | 8 / 6 |
| 2025 | 497 / 269 | 75 / 48 | 6 / 7 |
| 2026 | 451 / 245 | 67 / 57 | 2 / 9 |

Estas cifras **no son eventos ganadores adicionales**. Un mismo evento de cabeza histórica puede persistir varios cortes y varios caminos físicos pueden compartir la misma fuente. En consecuencia, se informa aparte la trayectoria familiar y los eventos POST comprobados.

En **Nocturno** no ingresan columnas nuevas a la hoja Santiago–Neuquén, aunque sí puede ingresar **Vespertino +11**. Nocturno no debe sumar respaldos auxiliares nuevos por mera permanencia de celdas antiguas.

### Ejemplo inspeccionado: martes 20/10/2026

La prueba usa el mapeo Santiago/Neuquén verificado en Vivitusuerte por el usuario:

- Santiago: **8067 / 6142 / 9634**
- Neuquén: **0469 / 0245 / 0210**

La cabeza Matutina de Santa Fe **8637** registró una coincidencia **VT2 = 37**, perteneciente a una familia que ya había quedado marcada en un turno anterior del día y que había incorporado otra fuente **+11**. Es una explicación física POST de un acierto VT2 posterior, **no evidencia de que se haya apostado 37**.

En esa Nocturna **no se registraron cabezas VT2/VT3/VT4 adicionales** respaldadas por marcas ganadoras anteriores de la misma jornada; otras terminaciones ganadoras sí fueron físicamente formables sin tener un antecedente ganador intrajornada. Distinguir ambas categorías evita que se atribuyan predicciones acertadas a dibujos trazados solamente después del resultado.

## Interpretación final

- Se ha logrado separar **cabeza POST comprobada**, **familia PRE construible**, **familia persistente** y **fuente genuinamente nueva** en ambas hojas, para las tres modalidades.
- El refuerzo físico es información de geometría y procedencia válida en el método manuscrito, **no un aumento automático de la probabilidad de ganar**.
- VT2 sigue siendo tan legítimo como VT3 y VT4 para detectar coincidencias; para calcular cobros se necesitaría saber qué terminaciones se jugaron efectivamente y a qué posiciones.
- **No se sustituye MV1, no se modifica `main` y no se publica APK.**
- El laboratorio no intenta elegir el mejor Top mirando los resultados conocidos: conserva estados y clasificaciones útiles para revisar visualmente el movimiento real del cuaderno.

## Archivos reproducibles

- `src/withinDayMarkContinuity.ts`: familias físicamente disponibles, raíces POST exactas y transiciones de fuentes por turno.
- `scripts/lab-intrajornada-test.ts`: prueba de no fuga temporal, aparición de segunda hoja para un VT2 realmente marcado, persistencia y doble recuento.
- `scripts/lab-intrajornada-historica.ts`: 2024, 2025 y 2026 con desglose por turno, modalidad, familia y cabeza.
- `.github/workflows/lab-continuidad-intrajornada.yml`: auditoría CI con tres años.
- [Ejecución correcta](https://github.com/y0t3/Modelo-Papa/actions/runs/39667802284).

**Precaución:** toda la evidencia proviene de replays históricos; la reconstrucción física correcta no es demostración de ganancia futura.
