# Punto de control VT4 — comparar hijas de una misma madre VT3

**13 de octubre de 2026 · Rama `lab-vt4-hermanas-geometricas-13oct2026`.** GitHub Actions [#38476320080 — completada](https://github.com/y0t3/Modelo-Papa/actions/runs/38476320080) y [auditoría de tres hijas ganadoras descartadas #38476560478 — completada](https://github.com/y0t3/Modelo-Papa/actions/runs/38476560478).

## Qué investigamos

Tras formar las familias VT4 correctamente como **madre VT3 reversible + cifra añadida + extremo**, las diez plazas se reparten entre dos hijas de cada una de las cinco madres VT3 mejor ranqueadas (`CUPO_2`). Pregunta: dentro de cada madre, ¿la geometría física de una hija discrimina mejor que el orden anterior?

El laboratorio no cambió `main`, `src/motorLalo.ts`, la app, los puestos del motor oficial ni sellos históricos.

## Prueba rigurosamente comparativa

- **115 cortes, 23 jornadas** de septiembre y octubre. Todos los Tops usan **diez agrupaciones VT4, dos por cada madre VT3 #1–#5**. Ningún recorrido que atraviese fuentes, repita celdas o agregue cifra sin vecindad.
- Se documentaron todas las rutas propias y se puntuó exclusivamente según **número de caminos, formas geométricas normalizadas, fuentes, bloques, convergencias o diversidad relativa**. Control PRE de orden por hash. Identidad numérica deduplicada: dos grupos que compartan una cuaterna completa no ocupan dos plazas.
- Workflow separó **físicamente** `OBJETIVOS_POST_115.json` y el fixture de cabezas futuras antes de calcular y sellar PRE; guardó `PRE_115.json` y `SELLO.json`, luego restauró POST. **Los 115 Top10 del método BASE_CUPO2 reproducen exactamente** los del laboratorio anterior de diversidad.
- Modelo semanal `MEMORIA_X_GANADORA`: entrenamiento con los ejemplos realmente ganadores de semana X y examen siguiente X+1, tres transiciones cronológicas, **90 cortes de examen**. `MEMORIA_X_NO_GANADORA` como control negativo. Ninguna etiqueta de X+1 decide su propia lista.
- El cotejo posterior cuenta una cabeza de cuatro cifras sólo si esa **cuaterna exacta está leída por al menos una ruta física de una agrupación seleccionada**, no por aparecer en el texto teórico del par.

## Resultado global: 115 cortes

| Criterio para elegir las dos hijas de cada madre | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| **BASE_CUPO2 — ranking previo corregido** | 0 | 0 | **4** |
| Mayor número de rutas físicas propias | 0 | 0 | 3 |
| Mayor diversidad de formas de cuatro celdas | 0 | 0 | 3 |
| Convergencia: fuentes, bloques y caminos | 0 | 0 | 3 |
| Menos repetición interna de formas | 0 | 0 | 3 |
| Orden neutral determinista por hash PRE | 0 | 0 | 2 |

**Ninguna de las cuatro políticas geométricas rescata un corte que BASE_CUPO2 había perdido.** Todas pierden **24/09 Previa, cabeza 3159**, sin recuperar otra. El control hash pierde dos de los cuatro aciertos anteriores. **Top3=Top5=0** bajo todos los métodos.

El recuento de cuaternas físicas efectivamente representadas en las diez agrupaciones aumentó levemente en algunos modelos (baseline media **17,757** valores distintos, más caminos **18,443** y menos repetición **18,461**); eso **no aumentó los aciertos**. Diversidad de candidatos por sí sola tampoco demuestra anticipación del sorteo.

## Memoria semanal: tres transferencias independientes en el tiempo del sorteo

| Método sobre los 90 cortes X+1 | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| BASE_CUPO2, sin entrenar en X | 0 | 0 | **4** |
| `MEMORIA_X_GANADORA`, formas positivas aprendidas X | 0 | 0 | 2 |
| `MEMORIA_X_NO_GANADORA`, control de formas no ganadoras | 0 | 0 | 0 |

Cantidad de **grupos positivos disponibles en cada semana de entrenamiento X**: **1**, **1** y **2** respectivamente (formas distintas observadas 4, 7 y 10). El problema no es sólo la fuerza del algoritmo: **tenemos poquísimos ejemplos ganadores VT4 entre las hijas elegibles** para distinguir hermanas. Una memoria de cuatro ejemplos muy dispersos no respalda una regla general de geometría capaz de superar 4/90.

## Techo de cobertura física con las cinco madres vigentes

Buscamos las cabezas completas que **alguna hija física de las cinco madres permitidas** podía formar en cada uno de los 115 cortes, incluso cuando no fue elegida en las diez plazas.

- **6/115 cortes** tenían al menos una cabeza físicamente representable dentro de ese universo de madres.
- **7 cuaternas ganadoras físicas** en total, porque 03/10 Matutina tenía dos distintas.
- BASE_CUPO2 seleccionó **4 de esas 7 cuaternas** y acertó **4 de los 6 cortes**.
- Por consiguiente, **6/115** es el máximo retrospectivo posible **si sólo se reordenan hijas de esas cinco madres y se tienen suficientes plazas**. No es una estimación de lo que se puede predecir: es un techo calculado después de conocer los resultados para diagnosticar el límite del inventario.

### Tres hijas físicas legítimas omitidas en los 115 cortes

| Corte | Cabeza y familia VT4 correcta | Madre VT3 propia | Puesto entre hermanas de esa madre según ranking | Recorridos físicos | Por qué no entró |
|---|---|---|---:|---:|---|
| **18/09 Vespertino** | **2735** · `2735/3725` | `273/372` (#3) | **5 de 12** | 4 | Las dos seleccionadas tenían también 4 rutas pero **3 bloques** cada una; la ganadora 2 bloques |
| **03/10 Matutina** | **5832** · `5238/5832` | `238/832` (#4) | **5 de 10** | 6 | Una hermana seleccionada tenía 3 rutas y 3 bloques, otra 6 rutas y 3 bloques; la ganadora tenía **6 rutas y 3 bloques** |
| **05/10 Matutina** | **3729** · `3729/3927` | `729/927` (#5) | **4 de 12** | 5 | Las dos seleccionadas tenían **12 rutas y 6 bloques** cada una; la ganadora 5 rutas y 4 bloques |

Estos casos muestran **por qué ordenar sólo por abundancia no separa inequívocamente las hermanas ganadoras**:
- El 18/09 las hermanas elegidas tenían la misma cantidad de caminos que la ganadora, pero más bloques.
- El 03/10 la ganadora compartía 6 caminos y 3 bloques con una hermana elegida; un recuento de rutas no la distinguía.
- El 05/10 las dos elegidas tenían más de dos veces los caminos que la ganadora, pero no salieron.

Por tanto, **no basta premiar más rutas, ni siempre menos rutas, ni más formas, ni fuentes**. Necesitamos una señal de **historia física transferible** realmente distinta de esos conteos, si existe, y no fabricar una regla para estos tres casos después de verlos.

### Primera 13/10, cabeza completa 5485
La cuaterna físicamente legítima `5485` de Ciudad salió de la madre `485/584` (#5 VT3), agrupación `5485/5584`, **dos recorridos propios en la fuente Previa**. El `CUPO_2` había elegido sus hermanas `4857/5847` y `4859/5849`; el nuevo experimento sobre las 115 fechas **no modifica ni se entrena con 5485**. Este caso del 13/10 no cuenta entre los 115 cortes ni tiene sello VT4 previo a Primera. Es otra demostración de que una madre correctamente admitida puede tener una hija ganadora entre otras no seleccionadas.

## Decisión por ahora

**Formación VT4 madre orientada: corregida y verificada estructuralmente.**

**Cupo 2 por madre: conservar como mejor referencia exploratoria**, no como mejor predictor demostrado. Las nuevas variantes de caminos, diversidad de formas y aprendizaje de X a X+1 rindieron peor y no deberían sustituirlo.

El siguiente lugar técnicamente interesante para investigar con las hojas actuales es la **convergencia histórica de geometrías ganadoras D−7/D−1 realmente marcadas, aplicada a rutas propias de una hija concreta** (no a la madre entera ni a formas genéricas). Una prueba así deberá evaluar cuántos antecedentes reales VT4 tiene: puede haber demasiado pocos, y eso también sería un resultado válido. Evitar ajustar parámetros retrospectivamente a las tres cabezas omitidas.

**Ningún ajuste se incorpora todavía al motor de la app**; sorteos de quiniela aleatorios, muestra histórica reutilizada repetidamente y ausencia de ventaja predictiva prospectiva validada.

## Reproducción
- `PROTOCOLO_VT4_HERMANAS_GEOMETRICAS_13OCT2026.md`
- `scripts/lab-vt4-hermanas-geometricas.mjs`
- `scripts/lab-vt4-hermanas-atribucion-post.mjs`
- `.github/workflows/lab-vt4-hermanas-geometricas.yml`
- `.github/workflows/lab-vt4-hermanas-atribucion.yml`
- `auditorias/vt4-hermanas-geometricas-115-13oct2026/PRE_115.json`, `SELLO.json`, `POST_115.json`, `RESUMEN.json`, `ANALISIS_HERMANAS_GANADORAS.json`.
- [Actions principal 38476320080](https://github.com/y0t3/Modelo-Papa/actions/runs/38476320080), [auditoría 38476560478](https://github.com/y0t3/Modelo-Papa/actions/runs/38476560478).

**App instalada, `main`, motor oficial y predicciones selladas intactos.**
