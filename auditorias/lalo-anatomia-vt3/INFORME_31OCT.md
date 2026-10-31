# Anatomía de las VT3 formables sin puesto en la hoja +11 de Lalo
**31/10/2026 | Rama:** `lab/lalo-vt3-anatomia-sin-puesto-31oct2026`  
**Estado:** auditoría descriptiva de laboratorio; **tres ejecuciones GitHub Actions exitosas**. El motor oficial, el Top10, las derivaciones VT2/VT4 y la APK **no cambiaron**.

## Pregunta

¿Por qué muchas VT3 que resultaron ganadoras podían formarse físicamente en la hoja +11 y, aun así, no recibieron puesto en el ranking Lalo? ¿Tienen las familias sin puesto una señal en **número de caminos**, **distribución por columnas** o **columna recién incorporada**, una vez medida la cantidad de candidatas formables del mismo tipo?

El diagnóstico anterior ya había examinado raíces físicas de 6 jornadas, movimientos de la silueta y varias sustituciones de Top10. **No repetir prioridades geométricas descartadas**. Esta vez el objetivo es medir exclusivamente oportunidades físicas, su clasificación y aciertos POST, **sin crear un selector nuevo**.

## Mecanismo del motor original

`buildMotorLalo` no enumera *todas* las VT3 formables y luego las puntúa. Parte de **cabezas reales ganadoras D−1 y D−7** con caminos válidos, proyecta sus trazas dentro de la **misma columna** y considera bifurcaciones del mismo tramo. Deduplica las cabezas ganadoras: varios dibujos no son varios votos. **Una VT3 formada que no procede de esos antecedentes no existe como candidata en el ranking**, aunque tenga un recorrido geométrico impecable.

`buildFormFirstMotor` es un control de laboratorio distinto, que elige sitios físicos a partir de activaciones verificadas de seis jornadas anteriores, antes de leer las cifras de hoy. Que encuentre una familia sin puesto en Lalo no prueba una ventaja futura.

## Universo y reglas

- **119 jornadas completas (595 cortes)**: junio–agosto 77 y septiembre–octubre 12–29 42. Dos fechas de junio–agosto quedaron excluidas por resultados incompletos (20/06 y 09/07).
- Cada turno aporta **cinco cabezas reales** POST (Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos), con las últimas cuatro cifras normalizadas en la carga; ninguna cabeza del turno objetivo entra en la selección PRE. Sin Montevideo en los cotejos.
- **3 celdas adyacentes, sin saltos, sin cruzar columnas +11, sin reutilizar casillas**; familia reversible equivale a un solo candidato. Las columnas entran progresivamente antes del turno.
- Para cada familia distinta que se pueda formar se cuentan **sitios físicos únicos** (un camino y el inverso en el mismo sitio cuentan una sola vez), **columnas distintas**, si aparece solo en la columna recién añadida, solo en anteriores o en ambas, y si está entre las 100 propuestas físicas de Formas Primero.
- La comparación correcta incluye **todas las familias físicamente disponibles** del mismo tipo, no solo las ganadoras, que se conocen POST.
- Para corregir el hecho de que una familia 123/321 contiene **dos terminaciones** mientras que 111/111 contiene **solo una**, se calcula un **valor nominal de referencia**: `(número de cabezas del corte) × (cantidad de orientaciones de la familia: 1 o 2) / 1000`. Este valor supone terminaciones de tres cifras independientes y uniformes. **Es un punto de comparación teórico, no un pronóstico ni evidencia de que los sorteos reales sean exactamente uniformes.**

## Resultado principal: 119 jornadas

| Tipo de familia PRE | Exposiciones (familias por turno, sumadas) | Cabezas VT3 reales que coincidieron | Valor nominal uniforme | Observado / nominal |
|---|---:|---:|---:|---:|
| Top10 Lalo | 5.937 | 48 | 56,86 | 0,84 |
| Puestos 11–20 | 5.804 | 62 | 56,54 | 1,10 |
| Puestos 21+ | 18.591 | 168 | 174,04 | 0,97 |
| **Físicamente formables sin puesto** | **50.619** | **475** | **474,79** | **1,00** |
| **Total familias físicas** | **80.951** | **753** | **762,23** | **0,99** |

**Hallazgo concreto:** los 475 resultados de familias sin puesto se corresponden prácticamente uno a uno con lo que permitiría esperar un criterio uniforme dada su enorme presencia física. **La cantidad por sí sola no identifica una falla seleccionable** ni justifica incorporar todas las familias al Top10.

Estos ratios no estiman la rentabilidad o probabilidad de apuestas: las candidatas de diferentes turnos de una misma fecha se solapan y las cabezas no se deben considerar experimentos perfectamente independientes. Tampoco se infiere que los números salgan realmente al azar; es una referencia para no confundir volumen con señal predictiva.

## ¿La columna nueva es distinta?

**Solo entre familias formables SIN puesto Lalo**, sin dividir aún por otros factores:

| Ubicación PRE de la familia | Familias expuestas | Ganadoras | Nominal uniforme | Ratio obs./nominal |
|---|---:|---:|---:|---:|
| Única columna disponible (Previa) | 3.564 | 31 | 33,32 | 0,93 |
| **Solo columna recién disponible (Primera–Nocturna)** | **13.613** | **128** | **127,75** | **1,00** |
| Solo columnas anteriores | 30.718 | 298 | 287,45 | 1,04 |
| En columna nueva **y** en anteriores | 2.724 | 18 | 26,28 | 0,68 |

La aparente concentración en columna nueva del viernes **30/10** no se repite como ventaja histórica: 128 coincidencias reales frente a 127,75 nominales. Las familias disponibles en la nueva y en columnas anteriores presentan una proporción inferior a la nominal, pero son relativamente pocas; **no se propone penalizarlas** sin un contraste independiente.

### Número de recorridos físicos

| Recorridos de la misma familia | Familias expuestas | Ganadoras | Nominal | Ratio |
|---|---:|---:|---:|---:|
| **Un camino** | 32.422 | 302 | 299,10 | 1,01 |
| Dos o tres caminos | 16.063 | 154 | 154,94 | 0,99 |
| Cuatro caminos o más | 2.134 | 19 | 20,75 | 0,92 |

**No aparece una ventaja consistente por multiplicidad**. Una familia con más recorridos es más visible sobre la hoja, pero sus caminos no deben transformarse en votos ni en mayor probabilidad. Los tres grupos quedan muy próximos a la referencia uniforme.

### ¿Ayuda Formas Primero entre las familias que Lalo no reconoce?

| Posición en Formas Primero | Ganadoras de familias sin puesto | Nominal |
|---|---:|---:|
| 1–10 | 18 | 16,02 |
| 11–30 | 33 | 39,79 |
| 31–100 | 184 | 177,24 |
| Fuera del top100 / sin posición | 240 | 241,75 |

La selección de sitios de **Formas Primero Top10** entre familias sin puesto obtuvo 15 casos frente a 10,09 nominales en junio–agosto, pero **solo 3 frente a 5,94** en septiembre–octubre. Ese cambio de dirección desaconseja promoverla como una mejora histórica estable.

## Meses por separado — sin puesto Lalo

| Mes 2026 | Familias expuestas | Ganadoras observadas | Nominal uniforme | Ratio |
|---|---:|---:|---:|---:|
| Junio | 9.830 | 96 | 91,65 | 1,05 |
| Julio | 11.586 | 102 | 108,90 | 0,94 |
| Agosto | 11.241 | 114 | 106,16 | 1,07 |
| Septiembre | 11.036 | 98 | 103,22 | 0,95 |
| Octubre (12–29) | 6.926 | 65 | 64,87 | 1,00 |

Alterna arriba y abajo de la referencia; ninguna persistencia suficiente para mejorar el ranking.

## Caso externo de diagnóstico: viernes 30/10 (ya conocido)

Ese viernes hubo **tres cabezas ganadoras** VT3 que podían formarse en +11 y carecían de puesto Lalo:

| Turno | Jurisdicción y cabeza | VT3 | Columna de la hoja donde se forma | Caminos |
|---|---|---|---|---:|
| Vespertina | Córdoba **2197** | 197/791 | **Matutino**, recién incorporada | 1 |
| Vespertina | Entre Ríos **3276** | 276/672 | **Matutino**, recién incorporada | 1 |
| Nocturna | Córdoba **4182** | 182/281 | **Vespertino**, recién incorporada | 2 |

**Las tres aparecieron exclusivamente en la nueva columna.** En esos dos turnos se registraron 63 candidatas físicas sin puesto exclusivas de la columna nueva, con nominal de **0,59** cabezas y tres observadas. Es llamativo, pero el día ya se conoce, y fueron muchas las jornadas/categorías examinadas. **En 119 jornadas previas ese mismo grupo dio 128 observadas vs 127,75 nominales**: no hay un patrón repetible que sostenga una nueva prioridad automática.

## Decisión

1. **No modificar** el Top10 Lalo, sus reglas físicas, VT2, VT4 o APK.
2. El problema de familias sin puesto está **explicado por la construcción del ranking**: no contar con una raíz ganadora D−1/D−7 proyectable a su formación. No es error de formabilidad.
3. No hay evidencia descriptiva clara de ventaja por **columna nueva**, **varios recorridos**, **varias columnas** ni ingreso al Top10 de Formas Primero. El gran número de ganadoras sin puesto es compatible con el enorme tamaño de ese universo.
4. Siguiente enfoque sensato: investigar **el criterio humano de Lalo para descartar o enfocar familias que sí ve en la hoja**, mediante observaciones previas fechadas/selladas de sus decisiones. **No** simular su interpretación con cientos de reglas elegidas después de ver las ganadoras. La aplicación puede exponer las figuras para facilitar la interpretación sin generar más apuestas automáticas.

## Reproducción

- `src/labLaloAnatomiaSinPuestoVT3.ts`: reconocimiento de sitios físicos válidos, columna más reciente, multiplicidad y cantidad de orientaciones.
- `scripts/test-lalo-anatomia-vt3.ts`: fuentes disponibles, ningún cruce, integridad de rutas y familias sin doble conteo por inversión.
- `scripts/lab-lalo-anatomia-sin-puesto-vt3.ts`: 595 cortes PRE, clasificaciones y denominadores; POST independiente; periodos por mes y turno.
- `.github/workflows/lab-lalo-vt3-anatomia.yml`: junio–agosto, septiembre–octubre y viernes 30/10, tres trabajos **success**.
- [Resultado verificado de GitHub Actions](https://github.com/y0t3/Modelo-Papa/actions/runs/41176821379); archivos JSON descargables como artefactos del workflow.
