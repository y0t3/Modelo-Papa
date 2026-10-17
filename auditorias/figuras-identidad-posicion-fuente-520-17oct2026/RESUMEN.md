# Identidad de figura, fuente y desplazamiento sobre hoja +11

**17/10/2026 · Investigación histórica concluida sin alterar Modelo Lalo MV1, Geometría Completa, el experimental de la app ni VT4.**

[GitHub Actions — ejecución definitiva y pruebas aprobadas](https://github.com/y0t3/Modelo-Papa/actions/runs/39029787018).

## Pregunta central

El padre reconoce **figuras físicas que explicaron cabezas reales en hojas históricas**, sigue su historia y después busca su reproducción dentro de las columnas +11 **disponibles antes del siguiente turno**. Solo al localizar esa figura lee las cifras nuevas y propone familias. No sigue cifras históricas como identidad del patrón.

Las investigaciones previas de fases AAB, pausas, retornos y fuentes dieron señales débiles e inestables. ¿La falla es que se utiliza una identidad de figura excesivamente genérica? ¿Conviene conservar fuente y desplazamiento en filas?

## Hecho estructural nuevo: solo 19 formas generales de tres casillas

Enumeración exhaustiva de un tablero +11 de **6 filas por 2 columnas** (casillas distintas, contacto inmediato vertical, horizontal o diagonal, sin huecos), recorridos **VT3 de tres casillas**, considerando equivalentes ida/vuelta y traslación geométrica:

- **19 formas distintas**.
- Sobre los **520 PRE históricos**, en **518/520** están físicamente disponibles **LAS 19 formas** dentro de alguna columna. En los otros dos cortes especiales con Nocturna uruguaya parcial no hay VT3 disponible; se conservan como cero, no se inventa una base.
- Promedio de figuras distintas disponibles por PRE: **18,93/19**; mediana **19/19**; se observaron las 19 formas en el histórico.
- Media de formas con al menos una coincidencia VT3 comprobada dentro de las seis jornadas reales anteriores: **18,38/19**. Es historial de formas ganadoras, **no** reconocimiento de una nueva cabeza ganadora.

**Corrección obligatoria de todas las posiciones físicas:** el primer barrido experimental descartaba una segunda posición si una misma cabeza, forma y fuente poseía más de un recorrido válido. Se corrigió la identidad del recorrido con el conjunto físico de casillas, **sin duplicar eventos independientes de cabeza**. En la base de las hojas históricas quedaron **1.516 testigos físicos** frente a **1.506 registros únicos de cabeza/forma/fuente/turno/fecha**; los **10 recorridos adicionales** permanecen. La repetición elevó el resultado Top3 del método desplazado de 20 a **21**, pero no altera el diagnóstico de inestabilidad temporal. Los resultados del documento son los definitivos **posteriores** a la corrección.

**Conclusión física:** “esta forma reapareció” sin fuente/posición/historia particular distingue muy poco. La geometría permite casi todo y las formas generales tienen muchas oportunidades de coincidir. Esto explica por qué rastrear únicamente un zigzag o un quiebre no alcanza.

## Método de evaluación

**104 jornadas, 520 PRE, 2.600 cabezas argentinas y 654 cabezas con VT3 físicamente realizable** antes del sorteo. Montevideo es fuente válida únicamente donde hubo sorteo; controles previos de 20/06 y 09/07 inalterados.

Se extraen únicamente recorridos de terminaciones de **cabezas realmente publicadas en jornadas ANTERIORES** (fecha, turno, jurisdicción, cabeza completa, fuente, forma, casillas). Se deduplican inversiones y múltiples rutas de la misma cabeza en la misma fuente/forma. En cada PRE se buscan recorridos válidos de esas formas dentro de la misma columna y **se leen entonces sus cifras ACTUALES**, convertidas a familia reversible. Las cabezas objetivo no intervienen hasta la evaluación.

Se compararon seis criterios separados, fijados antes de ejecutar este barrido:
1. `FORMA_GLOBAL`: figura histórica idéntica sin exigir fuente.
2. `MISMA_FUENTE`: la figura había explicado cabezas reales en esa misma fuente.
3. `CERCA_1_FILA`: misma fuente, con primera fila física a una diferencia máxima de una fila.
4. `MISMAS_CASILLAS`: misma fuente, mismas tres casillas exactas (no confundir inversas).
5. `DESPLAZADA_2_FILAS`: misma fuente, figura física trasladada por lo menos dos filas desde una coincidencia histórica real.
6. `CAMBIO_FUENTE`: figura con antecedentes verificados en una fuente distinta de la que genera las cifras actuales.

Ordenamiento interno por número de **jornadas de marcas ganadoras distintas**, refuerzo del mismo día semanal anterior, antigüedad y número de cabezas independientes; en desempates fuente y posición física. Sin conocer la cabeza del turno objetivo. No se incluyen candidatos puramente geométricos sin antecedente comprobado bajo el criterio correspondiente.

## Comparación Top3/5/10

| Identidad | Top3 junio-julio | Top3 agosto-octubre | Top3 total | Top5 total | Top10 total |
|---|---:|---:|---:|---:|---:|
| Forma general, sin fuente | 4 | 4 | **8** | 22 | 45 |
| Forma + misma fuente | 8 | 9 | **17** | 29 | 43 |
| Forma + misma fuente, fila cercana (±1) | 6 | 8 | **14** | 21 | 48 |
| Forma + fuente y exactamente mismas casillas | 7 | 8 | **15** | 25 | 49 |
| **Forma + fuente, desplazada al menos dos filas** | **13** | 8 | **21** | 26 | 57 |
| Forma en otra fuente | 9 | 2 | **11** | 23 | 43 |
| **Geometría Completa actual** | 6 | **11** | **17** | 27 | 50 |
| Modelo Lalo oficial | 7 | 6 | 13 | 29 | 50 |

Los mismos **518 cortes que admiten VT3** sirven de comparación con el motor Geometría. Los dos cortes sin VT3 aportan cero para todos. El aumento global **21 frente a 17** del desplazamiento es exploratorio: **13 vs 6** en junio-julio, pero **8 vs 11** en agosto-octubre. No hubo reproducción de la aparente ventaja en el tramo temporal posterior.

El criterio desplazado tenía **29.083 exposiciones de familias candidatas** en los 520 cortes (~56 por corte con VT3). Es más selectivo que "cualquier figura" pero todavía un conjunto demasiado numeroso para justificar un Top3 sin evidencia adicional.

## Control contra familias negativas equivalentes

Dentro del mismo PRE, se compararon familias elegibles contra familias igualmente físicas no elegibles, estratificando por primera fuente, fuente exacta del testigo y banda de rutas. **No** se usa una cabeza posterior para elegir testigo o estrato; las cabezas solo determinan si coincidió después.

| Identidad | Cabezas con criterio presentes en estratos mixtos | Neutral esperado | Diferencia |
|---|---:|---:|---:|
| Figura global | 139 | 139,25 | −0,25 |
| Misma fuente | 329 | 325,19 | +3,81 |
| Cercanía ±1 fila | 297 | 300,33 | −3,33 |
| Mismas casillas | 179 | 167,98 | +11,02 |
| **Desplazada ≥2 filas** | **233** | **233,93** | **−0,93** |
| Cambio de fuente | 219 | 219,69 | −0,69 |

La aparente ventaja Top3 del desplazamiento **NO** coincide con una ventaja global entre familias equivalentes. Es compatible con un efecto particular de ordenación de candidatos, no con una regla confirmada. El control de casillas exactas tiene exceso retrospectivo en familias, pero **no** generó un Top3 mejor y el corpus fue analizado reiteradamente; no modificar la app por ese indicio.

## Desglose de los 20 aciertos Top3 por turno

| Turno | Desplazada ≥2 filas | Geometría Completa |
|---|---:|---:|
| Previa | 4 | 3 |
| Primera | 3 | 2 |
| Matutina | 6 | 5 |
| Vespertina | 5 | 4 |
| Nocturna | 3 | 3 |
| **Total** | **21** | **17** |

No se observó concentración exclusiva en una única modalidad; el problema decisivo sigue siendo **la falta de repetición temporal** de esa ventaja.

## Ejemplos con recorridos y cifras nuevas, nunca con números históricos reciclados

### 03/06, antes de Matutino — cabeza posterior **0039**, VT3 familia **039/930**

La figura física es una línea vertical de tres casillas. Antes del sorteo, en la columna **Previa**, casillas actuales `0:1 → 1:1 → 2:1`, se formaba **930**, cuya inversa familiar **039** coincide con la terminación de la cabeza **0039**.

La misma forma, comprobada históricamente en la **misma fuente Previa**, había explicado cabezas **9052** del **27/05** y **7900** del **02/06**, en posiciones `2:0 → 3:0 → 4:0`. La distancia de fila es 2. Las cifras antiguas no son la causa de selección; el trazado histórico y la fuente son los antecedentes.

En aquel PRE Geometría Completa no había colocado **039/930** entre sus tres primeras.

### 16/06, antes de Matutino — cabeza posterior **4476**, VT3 familia **476/674**

La forma es un quiebre contiguo. Había explicado cabezas reales **4100** el **09/06** y **3769** el **11/06**, desde la **Nocturna anterior**, con casillas de filas 3–4. La figura reapareció en el +11 predictivo de **Nocturna anterior** en `0:1 → 1:1 → 1:0`, formando **674**, familia **476/674**. La cabeza sorteada después fue **4476**. El desplazamiento físico fue de **3 filas**.

Ambos ejemplos son reconstrucciones retrospectivas físicamente auditables, no predicciones guardadas antes del sorteo.

## Decisión y enfoque siguiente

- Está verificado que las 19 formas genéricas aparecen prácticamente siempre: no conviene usarlas solas como identidad de una “figura activa”.
- Conservar **fuente y desplazamiento físico** aporta descripciones más fieles al seguimiento visual del padre. La ventaja Top3 de desplazamientos `≥2` es **inestable temporalmente**, y no separó las familias ganadoras del control negativo: **NO modifica Geometría Completa, Modelo Lalo ni la app**.
- Para seguir usando lo que ya tenemos, el próximo contraste debería estudiar **conjuntos de recorridos comprobados que se tocan o bifurcan entre sí** en la hoja histórica, en lugar de únicamente ternas de tres casillas aisladas: eso conserva la figura más amplia que el padre podría estar observando y puede generar una identidad geométrica más discriminante que las 19 formas elementales.
- Seguir marcando solo recorridos que explicaron cabezas reales, guardando absolutamente todos los trazos válidos; reproducirlos sin cruzar columnas en el +11 futuro, leer nuevas cifras y evaluar con negativos y posterior tramo temporal separado.
- Advertencia metodológica: este histórico ha sido examinado muchas veces; cualquier ventaja hallada explorando reglas aquí es **generación de hipótesis**, no una prueba futura, independiente ni recomendación de apuestas.

## Reproducibilidad

- Rama `lab/figuras-identidad-posicion-fuente-17oct2026`.
- [Ejecución completa con compilación TypeScript y pruebas aprobadas](https://github.com/y0t3/Modelo-Papa/actions/runs/39029586100).
- `scripts/lab-vt3-figura-identidad.ts`: las 19 formas e identidades por fuente y casillas.
- `scripts/test-lab-vt3-figura-identidad.ts`: inversas, distancias, deduplicación, no usar POST.
- `scripts/lab-figuras-comprobadas-a-pre.ts`: comparativa física 520 PRE.
- Artefacto `LAB-VT3-FIGURA-POSICION-FUENTE-520` → `FIGURAS_COMPROBADAS_A_PRE_520.json` con detalle de los 520 cortes, negativos, rankings y testigos históricos.
