# Configuraciones conectadas de recorridos ganadores → hoja +11 PRE → VT3

**Laboratorio retrospectivo, 17/10/2026. Sin modificar MV1, Geometría Completa, Nueva Prueba, la app ni APK.**

Ejecución final validada: https://github.com/y0t3/Modelo-Papa/actions/runs/39031015822

## Procedimiento y fundamentos conservados

Esta hipótesis surge de que una figura histórica ganadora puede no ser solo un recorrido VT3 de tres casillas, sino **un conjunto de dos recorridos conectados**, marcado exclusivamente por cabezas realmente publicadas.

1. Reconstruir la hoja +11 de cada día histórico con sus fuentes válidas, turnos reales y Montevideo solo cuando hubo sorteo.
2. Conservar **todos** los caminos físicos VT3 que explicaron la terminación de una cabeza real en su turno, fuente y casillas; invertir un camino no crea otra cabeza ni otro sorteo.
3. Para formar una configuración histórica exigir **dos cabezas independientes** de la misma jornada cuyas rutas estén **en la misma fuente** y compartan una casilla, compartan dos o se toquen por vecindad inmediata. La figura conjunta NO procede de un dibujo arbitrario.
4. Canonizar la posición RELATIVA de ambas ternas dentro de las seis filas y dos columnas de una sola fuente. No rotar, reflejar ni atravesar fuentes: solo permitir traslación vertical conservando las dos trayectorias y sus contactos.
5. Para el siguiente corte PRE, tomar **solo** las seis jornadas previas y la hoja D−7 del mismo día semanal (sin duplicarla cuando ya está incluida). Buscar si la configuración histórica cabe físicamente en alguna columna +11 disponible **antes del sorteo objetivo**.
6. Leer las cifras de **ambas ternas en la hoja actual**, nunca las cifras históricas como candidatas. Agrupar en familias reversibles VT3. El resultado objetivo interviene únicamente después, al evaluar.
7. Ordenar con criterio fijo y previo al objetivo: cantidad de jornadas distintas con configuración comprobada, apoyo D−7, cantidad de parejas de cabezas independientes, menor traslado de filas, desempate físico estable.
8. Conservar negativos: todas las demás familias físicamente disponibles, comparables en el mismo PRE por primera fuente, banda de rutas y cantidad de fuentes.

**No son configuraciones VT4** ni deben invertirse cifras de cuatro dígitos; ninguna regla oficial VT4 fue alterada.

## Datos auditados

- **104 jornadas / 520 PRE / 2600 cabezas argentinas**; 51 días junio-julio (255 cortes) y 53 días 15/agosto–15/octubre (265 cortes).
- **654 cabezas** disponían físicamente de su familia VT3 antes del turno. Se reproduce idéntica cifra de las auditorías históricas corregidas.
- Se detectaron **1.912 configuraciones históricas** distintas *por día/fuente/relación/patrón* en **121 días de historia disponible**, incluido el tramo de preparación anterior al período de evaluación:
  - **770** por compartir exactamente una casilla.
  - **517** por compartir dos casillas.
  - **625** por roce entre dos ternas sin superposición.
- La misma pareja de cabezas y forma no se cuenta múltiples veces por caminos inversos.
- Cada PRE normal contiene muchas formas físicamente disponibles. La modalidad más prometedora permite 57.802 apariciones de familias a lo largo de los 520 cortes, aproximadamente 111 por corte. El Top es una **selección** sobre muchas familias, no la aparición de una configuración exclusiva.

## Comparación de modalidades: Top3 / Top5 / Top10

| Transferencia de la configuración | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| Comparten una casilla, MISMA fuente | 13 | 22 | 50 |
| Comparten dos casillas, MISMA fuente | 10 | 20 | 35 |
| Solo roce, MISMA fuente | 15 | 22 | 47 |
| Solapadas (una o dos casillas), MISMA fuente | 14 | 19 | 45 |
| **Solapadas, trasladadas a OTRA fuente** | **20** | **37** | **68** |
| **Geometría Completa** | 17 | 27 | 50 |
| **Modelo Lalo oficial** | 13 | 29 | 50 |

El cambio de fuente se refiere a la **fuente del dibujo**. Se conserva la misma geometría de casillas, se reproduce dentro de la nueva columna +11 y allí se leen las cifras diferentes. No se cruzan columnas durante la construcción física del candidato.

El criterio *dos cabezas comprobadas + solape + traslado a otra fuente* quedó como hipótesis exploratoria más interesante. Se eligió al comparar múltiples alternativas sobre este mismo histórico: **no es una regla validada fuera de muestra**.

### Control de familias negativas

Entre familias físicamente comparables en los mismos PRE, para la modalidad solapada que cambia de fuente:

| Bloque | Familias ganadoras observadas en estratos comparables | Neutral esperado |
|---|---:|---:|
| Junio-julio | 157 | 148,43 |
| Agosto-octubre | 166 | 155,98 |
| **Total** | **323** | **304,42** |

Las cifras son exposiciones de familias × turno, **no 323 sorteos independientes**. El control iguala primera fuente, cantidad física de caminos y número de fuentes actuales, pero no demuestra causalidad predictiva. Los turnos de la misma jornada comparten memoria.

## Sensibilidad temporal (solapadas trasladadas a otra fuente)

| Período utilizado como memoria | PRE con ≥3 candidatas | Top3 | Top5 | Top10 |
|---|---:|---:|---:|---:|
| Últimas tres jornadas reales | 515 | 15 | 23 | 50 |
| **Últimas seis jornadas reales** | **518** | **20** | **37** | **68** |
| Últimas seis + D−7 | 518 | 20 | 37 | 68 |
| Jornadas 7–12 anteriores (memoria antigua) | 518 | 17 | 26 | 52 |
| Solo D−7 | 442 | 15 | 24 | 41 |

**Advertencia:** en esta muestra D−7 ya estaba comprendido en las últimas seis jornadas reales: sumarlo no aportó un período nuevo. El contraste de antigüedad es descriptivo y el método de selección ya fue escogido observando el histórico.

Distribución de la fuente HISTÓRICA del primer candidato en los 518 PRE con configuraciones: Nocturna anterior **257**, Previa **152**, Primera **86**, Matutino **16**, Vespertino **7**. Esta proporción describe a qué fuente apunta el ranking configurado, **no demuestra por sí sola dónde nacen más figuras ganadoras**.

## ¿Complementa Geometría Completa?

En Top3, Configuraciones Conectadas encontró **20** cabezas y Geometría Completa **17**. Apenas **2** cabezas fueron acertadas simultáneamente por ambos lectores. Quedan **18 casos solo de Configuraciones** y **15 solo de Geometría**.

Cuatro fusiones fijas que toman 1–2 puestos de uno y completan con el otro produjeron entre **19 y 20 Top3**, por lo que **no superaron al nuevo lector**.

### Comparación estricta con seis familias candidatas, no números sueltos

| Estrategia de 6 familias VT3 | Junio-julio | Agosto-octubre | Total |
|---|---:|---:|---:|
| Geometría Completa, Top6 | 14 | 19 | **33** |
| Dos Tops3 independientes (Geometría + Conectadas) | 12 | 23 | **35** |
| **Configuraciones Conectadas, Top6** | **25** | **22** | **47** |

La unión de dos Tops3 distintos tiene en promedio **5,89 familias únicas por PRE**; completarla hasta seis familias sin duplicar no agregó coincidencias. La diferencia 47 vs 33 favorece al Top6 experimental en AMBOS bloques, pero ambos bloques forman parte del corpus altamente explorado: **no equivale a una evaluación ciega ni una tasa de éxito futuro**.

En este experimento, para el límite de seis familias, conservar los seis primeros de Configuraciones resulta mejor que mezclar automáticamente con Geometría. El algoritmo oficial y la APK no se modificaron.

## Ejemplos físicos concretos

### 02/06, Nocturna de Santa Fe: cabeza publicada **3548**

**Hecho previo comprobado:** en la hoja histórica 01/06, las cabezas **9472** y **0152** generaron dos ternas solapadas válidas dentro de la fuente **Previa**.

**PRE del 02/06 Nocturna:** la misma configuración se traslada a una fuente DISTINTA: **Matutino**. Un recorrido de la configuración pasa por las casillas `1:1 → 1:0 → 2:0`, donde se leen **845**, familia reversible **548/845**. La cabeza publicada después termina en **548**.

Este ejemplo representa una lectura real de configuración física + cifras nuevas, no una repetición de números históricos.

### 19/08, Vespertina: cabeza publicada **0801**

**Hecho previo:** dos cabezas reales históricas **6638** y **6376** habían comprobado una configuración solapada en la columna **Previa** del 12/08.

**PRE del 19/08 Vespertina:** la figura reaparece íntegra en la columna **Matutino**, casillas de una terna `1:0 → 2:0 → 2:1`, que ahora contienen **801**, familia **108/801**. Posteriormente sale **0801**. Los números antiguos no se tomaron como candidatos.

## Limitaciones y decisión

- Historial **no ciego**, ya examinado reiteradamente; además se compararon varias variantes de conectividad, posición, horizonte y mezcla. Una ventaja retrospectiva puede ser selección accidental de reglas.
- El ranking produce muchas familias físicamente válidas y necesita validar que su orden resista resultados **no usados para diseñarlo**. Los 20 Top3 / 47 Top6 NO son probabilidades fiables de apostar.
- Aún no se ha comprobado en dispositivo móvil la representación de configuraciones compuestas ni se ha fusionado nada en `main`.
- **Recomendación de laboratorio:** conservar esta nueva lectura como experimental AISLADO. Próxima comprobación: auditoría sobre turnos posteriores a 15/10, preservando para cada turno un PRE sellado si existe; si falta sello, etiquetar reconstrucción retrospectiva. No reajustar el criterio al ver resultados.
- No convertir la unión de dos recorridos en VT4 ni violar la columna única de origen. Las dos ternas pertenecen a la misma fuente histórica, y su reproducción posterior se hace íntegramente dentro de una nueva fuente.

## Archivos auditables

- [Ejecución final GitHub Actions — TypeScript, pruebas y los 520 PRE](https://github.com/y0t3/Modelo-Papa/actions/runs/39031015822), resultado **success**.
- `scripts/lab-vt3-configuraciones-conectadas.ts`: detector de cabezas ganadoras independientes, relación física de recorridos y reproducción en PRE.
- `scripts/test-lab-vt3-configuraciones-conectadas.ts`: validación sin cruces, traslación, ausencia de cabezas futuras, inversión familiar.
- `scripts/lab-figuras-comprobadas-a-pre.ts`: contraste completo, cinco modalidades de conectividad, negativos y controles de 3/6/12 jornadas y combinaciones Top3/Top6.
- Artefacto `LAB-CONFIGURACIONES-CONECTADAS-520`: `FIGURAS_COMPROBADAS_A_PRE_520.json`, con 520 cortes, testigos, cifras PRE, candidatos, resultados posteriores y controles.
- Rama: `lab/configuraciones-vt3-conectadas-17oct2026`. Motores oficiales y `main` sin cambios.
