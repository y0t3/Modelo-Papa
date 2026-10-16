# Pares físicamente semejantes de familias VT3 — junio a octubre de 2026

**Auditoría completada el 16/10/2026 · copia experimental. Sin cambios en APK Modelo Lalo 0.3.5, Modelo Lalo MV1 ni `src/motorLalo.ts` / `src/vt3Shadow.ts`.**

## Pregunta

Tras comprobar que *nacimiento → permanencia → refuerzo* por sí solo no separa consistentemente las familias ganadoras, se realizó un control **más físico**: comparar caminos completos de familias reversibles VT3 dentro del **mismo PRE**, del mismo origen y con posibilidades semejantes. ¿Aporta algo específico **reproducir la misma figura en otra fuente**, o simplemente **tener dos diagonales**?

El diseño tiene dos partes **independientes**:

1. **Toda la población:** 70.643 exposiciones de familia en 520 cortes PRE (104 jornadas de junio–julio y agosto–octubre), 660 apariciones de cabeza cuya VT3 estaba realmente en el tablero.
2. **Parejas observacionales:** para cada aparición ganadora físicamente posible se buscó una **familia no ganadora** en la misma hoja, mismo origen, estado, cantidad de fuentes y banda de número de caminos; después se seleccionó la de mayor semejanza geométrica de *fuente + forma*, variedad de formas y distancia de fila. Las parejas se construyeron **conociendo los resultados** para inspeccionar diferencias, por lo tanto NO son un clasificador ni predicción prospectiva. No se fabricó ningún recorrido.

No hay cruces entre columnas, saltos de casillas, rutas sin tres contactos ni creación de familias VT4 inversas. Se comprueba que las casillas publicadas en una fuente no mutan al añadir otra; cabezas objetivo entran **después** del PRE. Se omitieron expresamente 20/06 y 09/07 del calendario histórico de esta reconstrucción.

## Parejas de familias

- **660** exposiciones ganadoras con familia VT3 físicamente disponible.
- Para **646/660** se pudo encontrar una familia no ganadora comparable dentro del **mismo corte PRE**, igual origen, mismo estado físico, mismo número de fuentes y banda de cantidad de recorridos.
- **444/660** encontraron incluso una negativa con **idéntico conjunto de tipos de dos pasos geométricos por fuente** (coincidencia morfológica al 100%). Eso **NO exige las mismas casillas exactas**, las mismas cifras ni el mismo recorrido testigo; comparar fuente+figura es menos estricto que comparar tres celdas idénticas.
- La mediana de semejanza por los conjuntos exactos `fuente|forma` de la pareja elegida fue **1/3**, con muchas más coincidencias de **clase** que de figura geométrica precisa.
- **Ejemplo 02/06 Vespertino:** familia que coincidió `455/554`, y familia no ganadora `679/976`, ambas de Previa, un solo recorrido vertical de tres celdas, una en la columna derecha (`0:1→1:1→2:1`) y otra en la izquierda (`0:0→1:0→2:0`). Igual movimiento aparente, distinto número y distinto resultado.
- La auditoría guarda otras 23 parejas muy semejantes, junto a casillas, lecturas, fuentes, raíces semanales y estado. Se preparó también un **comparador HTML offline** que representa sus recorridos en la grilla 6 × 2 sin rellenar dígitos desconocidos.

## Hipótesis A: repetir una figura en la nueva columna

De **4.843 exposiciones de familia** que recibieron una fuente nueva:
- **679** mostraban en esa fuente al menos una figura que también podían trazar en una fuente anterior; **7 coincidencias ganadoras**.
- **4.519** sumaban alguna figura no presente en las fuentes anteriores; **36 coincidencias**. **Estas categorías pueden superponerse**: 355 exposiciones reproducían una figura vieja y además añadían alguna distinta.
- Control neutral por **mismo PRE + origen + estado + número de fuentes + banda de rutas actuales + cantidad de rutas nuevas**: **7 coincidencias observadas frente a 7,72 esperadas**.
- Control adicional manteniendo D−1 y D−7 como presencia/ausencia de huellas históricas por fuente/forma: **7 frente a 6,26**.
- **Control espacial más estricto**, que iguala también el conjunto exacto de fuentes, banda de diversidad de formas y tercio de ubicación vertical (además de D−1/D−7): **7 frente a 6,95**, intervalo descriptivo de remuestreo por jornada para la diferencia **[−1,67; +2,26]**. Solo 84 estratos contienen tanto familias marcadas como no marcadas; no sobregeneralizar esta prueba más estrecha.

**Interpretación:** no se observó capacidad discriminante estable por repetir la misma figura en otra columna. El parecido físico explica una continuidad visual, no una predicción superior.

## Hipótesis B: existencia de un camino de dos diagonales

En las 70.643 exposiciones físicas de familia:
- **10.416** tenían *algún* recorrido de tres celdas con **dos pasos diagonales**, y entre ellas hubo **118 coincidencias de cabeza**. Una familia puede también tener otras formas.
- Control neutral mismo PRE, origen, estado, número de fuentes y banda de rutas físicas: **118 frente a 100,73**. Bootstrap descriptivo por jornada de la diferencia: **[−0,14; +34,25]**; incluye cero.
- Condicionado adicionalmente a D−1 y D−7: **118 frente a 105,07**, intervalo **[−1,98; +28,29]**.
- Control espacial más estricto, incluyendo conjunto de fuentes, diversidad de formas y zona vertical: **118 frente a 109,36**, intervalo **[−4,26; +22,93]**. También incluye cero.
- **Junio-julio:** 61 frente a 53,53 esperadas (control espacial); **agosto-octubre:** 57 frente a 55,83. La mayor parte del pequeño exceso procede del período antiguo, no se observa mejora homogénea.

**Interpretación:** algunos casos de doble diagonal coinciden, pero no hay evidencia robusta ni independiente para otorgarles prioridad automática. Esto concuerda con pruebas anteriores: imponer doble diagonal en el Top3 ganó tres exposiciones y perdió tres sobre agosto-octubre.

## Notas metodológicas

1. Todos los resultados son **retrospectivos y de corpus repetidamente explorado**. Incluso cuando se calcula un intervalo, no es una prueba confirmatoria de predicción.
2. Las 70.643 observaciones son familia × corte; una familia puede repetirse varios turnos del mismo día. **Las muestras no son independientes**; el bootstrap descriptivo toma jornadas completas, no familias sueltas.
3. Familia reversible VT3 ≠ acierto exacto de cuatro cifras; tampoco cuenta una coincidencia de dos cifras como éxito VT3.
4. Las raíces D−1/D−7 son coincidencias **de figura y fuente con cabezas anteriores verificadas**, no implican que los números anteriores fueran la misma familia.
5. Emparejar *a posteriori* una ganadora con una no ganadora muy semejante es una **ilustración útil de la ambigüedad física**, no una forma viable de elegir a cuál apostar antes del resultado.
6. No usar el ranking del Top3 oficial para seleccionar controles; se emparejan familias físicas disponibles dentro del mismo PRE. La mención «ganadora» se usa solo en análisis posterior.
7. La población se reconstruyó con resultados históricos descargados; fechas y hashes quedaron archivados en el laboratorio predecesor. No sustituir la necesidad de pruebas selladas antes de sorteo.

## Qué se decide

**No cambiar ninguno de los motores ni la APK.** Dos familias prácticamente gemelas a nivel visual pueden tener resultados distintos. Más adelante podemos usar el comparador para comprender *cómo* se forman y **mostrar todos los caminos de cada familia**, pero no confundirlo con una regla que haya demostrado poder discriminante.

El siguiente paso válido para medir predictividad exige **congelar antes de nuevos sorteos** un criterio de selección, guardar tres familias propuestas con fecha, turno, huellas y evidencia de estado, y evaluar sin tocar las reglas después de ver resultados. Continuar optimizando sobre estas fechas puede producir mejoras aparentes.

## Reproducción

- GitHub Actions final: https://github.com/y0t3/Modelo-Papa/actions/runs/38867602580
- Código nuevo: `scripts/lab-vt3-pares-trazos.ts`.
- Reconstrucción de todas las rutas: `scripts/lab-vt3-secuencias-movimiento.ts`.
- Rama: `lab/vt3-pares-trazos-morfologia-16oct2026`.
- Artefacto `LAB-VT3-SECUENCIAS-JUN-OCT-2026`: `VT3_PARES_MORFOLOGIA_520_CORTES.json` (controles, bootstraps y recorridos de 24 pares) junto a `VT3_SECUENCIAS_EMPAREJADAS_520_CORTES.json` y `VT3_MOVIMIENTOS_COLUMNAS_JUN_OCT_2026.json`.
