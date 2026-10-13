# Punto de control VT3 — un voto por forma vs tres ejemplos repetidos

**13/10/2026, rama `lab-vt3-voto-unico-forma-13oct2026`.** Ejecución GitHub Actions [38391609255](https://github.com/y0t3/Modelo-Papa/actions/runs/38391609255), terminada satisfactoriamente. No se modificaron `main`, VT3 oficial, VT4, hoja diaria, sellos, app ni APK.

## Hipótesis y diseño
Ensayamos el hallazgo anterior: el aprendiz da tres votos a tres familias positivas previas que pueden poseer la **misma** forma geométrica. ¿Si cada firma o figura recibe a lo sumo un voto mejora la selección?

Se utilizaron **90 cortes** de 18 días de tres transiciones semana X→X+1, con los mismos 115 PRE históricos y las mismas familias físicas. Toda variante conserva Top1 y Top2 originales, elige **una sola tercera** de fuera del Top10 según puntuación de memoria, y rellena siete plazas con Top3–Top9 VT3 originales. Ninguna forma crea caminos inválidos o raíces prestadas; todas proceden de testigos físicos originales.

El workflow separó **todos los POST** del checkout durante PRE, selló el inventario y código/protocolo (`PRE_90.json`, `SELLO.json`), y recién después restauró las cabezas para los ensayos semanales. Los resultados del turno X+1 actual nunca entrenan su propio Top; sólo el de turnos posteriores en modalidad online. **El selector `ORIGINAL_3_EJEMPLOS` reproduce exactamente los 90 Top10 ya congelados** tanto en versión estática como acumulativa.

## Cinco criterios predefinidos

1. `ORIGINAL_3_EJEMPLOS`: media de las tres similitudes Jaccard más altas contra familias positivas históricas, permitiendo firmas repetidas.
2. `FIRMA_CONJUNTO_3`: fusiona ejemplos con conjuntos completos de formas exactamente idénticos, después utiliza tres similitudes.
3. `FORMA_INDIVIDUAL_3`: cada forma geométrica normalizada única se convierte en un solo testigo; media de los tres testigos de forma más similares.
4. `FORMA_INDIVIDUAL_1`: máximo de similitud con una figura única, sin votos múltiples.
5. `PRESENCIA_FORMAS`: Jaccard entre **conjunto total de formas únicas de la candidata** y conjunto total de formas únicas de la semana X (o semana X + sorteos previos conocidos). Es diferente de promediar top3 de ejemplos.

## Resultado histórico

La versión **ESTATICA X** y la **ONLINE X + resultados pasados** dieron los mismos contadores Top3/Top5/Top10 en los 90 cortes, aunque algunas terceras seleccionadas difirieron.

| Modelo | Top3 /90 | Top5 /90 | Top10 /90 | Cambio de tercero contra aprendiz original, estática / online |
|---|---:|---:|---:|---:|
| VT3 oficial | 3 | 6 | 11 | — |
| Original tres ejemplos | **4** | 5 | **12** | 0 / 0 |
| Firma única de conjuntos | 3 | 4 | 11 | 70 / 80 |
| Tres formas únicas | 3 | 4 | 11 | 87 / 84 |
| Una forma única más parecida | **4** | 5 | **12** | 64 / 51 |
| **Presencia del conjunto de formas** | **5** | **6** | **13** | 90 / 90 |

**Una firma única o tres formas individuales no mejoraron la selección:** perdieron el único rescate `246/642` de 21/09 Vespertino. Elegir una sola forma más semejante conservó ese rescate, pero tampoco agregó otros.

**PRESENCIA_FORMAS encontró otros dos aciertos, nunca ambos en la misma semana:**
- **28/09 Matutino**, nuevo corte ganado en Top3/Top10, sin pérdida de aciertos VT3 originales.
- **06/10 Vespertino**, otro rescate nuevo, sin pérdida de aciertos VT3 originales.
- En estos dos cortes, el selector original por tres ejemplos **no** había rescatado ninguna cabeza. A la inversa, PRESENCIA_FORMAS ya no seleccionó `246/642` el 21/09 Vespertino, y por eso no es correcto sumar los tres rescates.

Al separar las tres semanas de examen por Top3/Top10:
| Semana de examen | VT3 oficial | Aprendiz tres ejemplos | Presencia de formas |
|---|---:|---:|---:|
| 21/09 | 0/4 | **1/5** | 0/4 |
| 28/09 | 2/4 | 2/4 | **3/5** |
| 05/10 | 1/3 | 1/3 | **2/4** |
| **Total** | **3/11** | **4/12** | **5/13** |

En la **primera jornada** de cada semana (15 cortes), original tres ejemplos obtuvo 1/15 Top3 y 2/15 Top10, y presencia de formas también obtuvo 1/15 y 2/15 —pero por **otro** corte (28/09 Matutino en vez de 21/09 Vespertino). No prueba duración mayor de la memoria.

## Por qué no promoverlo al motor todavía

El resultado más alto **5/90 Top3 y 13/90 Top10** ya lo había conseguido el control de seleccionar la familia externa con **más recorridos físicos propios** en `lab-vt3-control-tercer-puesto-13oct2026`. Ese control y la nueva PRESENCIA_FORMAS seleccionan candidatas de manera distinta; su empate en número de aciertos **no** supone que sean los mismos casos.

En el control neutral previo de presupuesto idéntico, reemplazar una plaza al azar entre externas físicas produjo **al menos 5/90 Top3 en cerca de 15,26 % de 5.000 réplicas**, y **al menos 13/90 Top10 en 12,62 %**. Dado que las cinco variantes actuales fueron planteadas después de ver repetidamente las mismas 23 fechas históricas, estos porcentajes son **comparaciones exploratorias**, no valores p de un experimento nuevo independiente; tampoco avalan causalidad ni predictibilidad del sorteo de quiniela, que es aleatorio.

La opción PRESENCIA_FORMAS elimina la multiplicación de votos por ejemplos, pero **favorece matemáticamente cierta superposición de conjuntos geométricos**. No demuestra que las figuras repetidas fueran un sesgo malo en general; simplemente cambió el criterio y ganó dos cortes donde el anterior no ganó. La modificación tampoco logró más aciertos con actualización online que con X fija.

## Próxima comprobación técnica razonable

Antes de integrar cualquiera de esos criterios a VT3, verificar la procedencia de los dos aciertos de PRESENCIA_FORMAS:
- ¿Qué familia exacta recuperó el 28/09 Matutino y el 06/10 Vespertino y cuántos recorridos físicos propios tenía?
- ¿Qué proporción de las formas de esa familia existía ya en la memoria X y en cuántos ejemplos distintos?
- ¿Por qué el Jaccard de presencia la favorece cuando el original de tres ejemplos no lo hacía?
- **Comparar el mismo presupuesto contra el selector de mayor número de rutas**, sin elegir ganador sólo porque acertó dos veces.

Podemos hacer esa explicación sin alterar ni una decisión ni los archivos del motor oficial. Mantener VT3/VT4 intactos.

## Reproducibilidad
- `PROTOCOLO_VT3_VOTO_UNICO_FORMA_13OCT2026.md` — reglas fijadas.
- `scripts/lab-vt3-voto-unico-forma.mjs` — implementación física cronológica y test exacto contra Tops previos congelados.
- `.github/workflows/lab-vt3-voto-unico-forma.yml`.
- `auditorias/vt3-voto-unico-forma-90-13oct2026/{PRE_90.json,SELLO.json,POST_90.json,RESUMEN.json}`.
- [Ejecución 38391609255, exitosa](https://github.com/y0t3/Modelo-Papa/actions/runs/38391609255).

No modificar producción por estos resultados.
