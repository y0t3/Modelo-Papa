# Investigación paralela de movimientos físicos VT2 y VT3 — 29/10/2026

## Protocolo permanente del laboratorio

- **VT2 y VT3 se estudian de manera simétrica**: para cada jornada y cada turno debe haber dos cortes PRE, dos rankings independientes, dos auditorías de figura y dos evaluaciones POST.
- Compartir método de observación geométrica no significa mezclar familias VT2/VT3. Ninguna familia de 3 cifras se da por acierto VT2 si no coincidieron las **últimas 2**; tampoco se acredita VT3 por mero acierto VT2.
- Familias reversibles se contabilizan en su longitud propia. Siempre se conservan ceros iniciales y se truncan únicamente las cifras de 4/5 dígitos necesarias.
- Los recorridos de +11 permanecen dentro de una columna y sólo avanzan por casillas contiguas, incluidas diagonales; mostrar **todos** los recorridos válidos que forman cada cabeza. Comparar fuentes sólo como antecedentes de la misma silueta, nunca como permiso para cruzar columnas.
- PRE se reconstruye con turnos anteriores y las cabezas antiguas, jamás con el resultado objetivo. El POST sólo evalúa coincidencias, sin alterar prioridades MV1.
- Los rangos Top3, Top5, Top10 tienen igual tamaño en ambos estudios. La auditoría de **movimientos** usa particularmente el conjunto rescatado por Formas Primero fuera del Top10 de Lalo.
- No atribuir mejor pronóstico a un mayor número de rutas disponibles, a coincidencias numéricas, ni a una figura que pudo dibujarse después del resultado.

## Definiciones observables de movimiento

Cada candidatura de Formas Primero es **una posición concreta** (fuente + casillas + silueta), seleccionada antes de leer sus cifras actuales.

Antecedentes reales (últimas seis jornadas con publicación): sólo rutas que explicaron una cabeza ganadora anterior, con igual silueta normalizada y movimiento admitido por el motor.

Cinco categorías **no excluyentes** para una candidatura:
- **Misma posición:** existe una activación ganadora de la misma ruta física (idénticas casillas y misma fuente) en una jornada anterior.
- **Desplazamiento vertical:** misma silueta y fuente con distinta fila de anclaje, sin mover horizontalmente la figura.
- **Desplazamiento horizontal:** misma silueta, fuente y fila de anclaje, pero otro lado de la columna de dos dígitos.
- **Desplazamiento diagonal:** cambiaron a la vez fila y lado dentro de la misma columna.
- **Cambio de fuente:** existe activación de la silueta en otra columna fuente histórica; cada recorrido sigue siendo interno a su respectiva columna.

Las categorías se superponen cuando una figura tuvo antecedentes de varios tipos. Separar siempre "presencia de una silueta" de **activación por cabeza real**, no inferir trayectorias causales del sorteo.

## Datos estudiados

118 jornadas completas (junio–julio: 51; agosto–septiembre: 52; octubre 12–28: 15), con **590 cortes PRE por longitud** y 2.950 cabezas reales comunes. Las dos longitudes fueron calculadas conjuntamente sobre los mismos PRE. No son pronósticos prospectivos sellados.

### Rescates, controles y movimiento exacto

| Período | VT2 rescates | VT2 cabezas | VT2 esperadas por silueta+fuente | VT3 rescates | VT3 cabezas | VT3 esperadas por silueta+fuente |
|---|---:|---:|---:|---:|---:|---:|
| Junio–julio | 1.233 | 120 | 120,75 | 1.982 | 21 | 22,38 |
| Agosto–septiembre | 1.350 | 112 | 117,41 | 2.040 | 21 | 19,14 |
| Octubre | 401 | 25 | 27,51 | 621 | 3 | 3,68 |
| **Total** | **2.984** | **257** | **265,67** | **4.643** | **45** | **45,21** |

Control: alternativa físicamente formable en **misma silueta y fuente** pero fuera del Top10 de Lalo. Sus probabilidades se estiman por reparto uniforme entre familias del mismo conjunto elegible en el corte; NO equivale a muestreo de rutas con misma multiplicidad ni a validación de precisión superior.

### ¿Repetir exactamente una posición ganadora aporta señal?

| Longitud | Configuración del rescate | Exposiciones | Cabezas coincidentes | Control silueta+fuente |
|---|---|---:|---:|---:|
| VT2 | Mismo recorrido físico ya activado | 2.616 | 233 | 234,38 |
| VT2 | Sin raíz ganadora en posición exacta | 368 | 24 | 31,29 |
| VT3 | Mismo recorrido físico ya activado | 2.730 | 30 | 26,61 |
| VT3 | Sin raíz ganadora en posición exacta | 1.913 | 15 | 18,60 |

VT2 **no superó** al control en el grupo de ruta idéntica. VT3 tuvo 30 aciertos frente a 26,61 esperados, una diferencia pequeña dentro de múltiples subdivisiones. En octubre, el grupo VT3 de misma posición tuvo **3 aciertos frente a 2,17** esperados; solo tres eventos, por lo tanto no se puede inferir ventaja.

### Movimiento vertical y entre fuentes

En **VT2**, los **2.984 rescates** tenían antecedente ganador en otra fuente y **2.959 de 2.984** también antecedente de desplazamiento vertical estricto; son características **casi saturadas** y poco selectivas. La precisión al distinguir movimientos dentro de una columna también permitió ver **1.719 desplazamientos horizontales** (149 cabezas frente a 143,10 esperadas por silueta y fuente) y **1.938 diagonales** (169 frente a 165,05). Estas diferencias pequeñas fluctúan entre períodos y no demuestran señal.

En **VT3**:
- Desplazamiento vertical estricto presente: **3.220 propuestas, 26 coincidencias** (control ≈28,06).
- Horizontal presente: **129 propuestas y cero coincidencias** (control ≈0,91).
- Diagonal presente: **158 propuestas y una coincidencia** (control ≈1,49).
- Cambio de fuente presente: 3.391 propuestas, 35 coincidencias (control ≈32,70).
- Cambio de fuente ausente: 1.252 propuestas, 10 coincidencias (control ≈12,51).

Las clases de movimiento **pueden superponerse** por la diversidad de testigos históricos. Las oscilaciones tampoco muestran un sentido estable al dividir junio–julio, agosto–septiembre y octubre. Las combinaciones son exploratorias y no se deben convertir a filtros predictivos mirando el mismo histórico.

## Qué cambia en la app

En **Experimental** aparecen **dos paneles de Auditoría de figuras**, VT2 y VT3, con igual estructura y funciones: rescates, compartidos, sólo Lalo, minihoja PRE seleccionada, testigos ganadores anteriores, clasificación geométrica de movimiento, POST y todos los caminos válidos de cada cabeza.

El botón de cada candidata muestra cantidades de antecedentes **distintos por evento ganador** y movimientos de fuente/altura. Los resultados POST sólo se interpretan como coincidencias por terminación y recorridos formables, nunca como demostración del mecanismo físico del sorteo.

## Decisiones y próximo estudio

1. **No modificar Lalo MV1 ni reordenar automáticamente sus VT2/VT3**: el movimiento aislado no ha demostrado ventaja.
2. Conservar el mismo estudio gemelo en ambos motores. En VT2, donde las siluetas se saturan, la vía prometedora a **comprobar**, no dar por cierta, es seguimiento de **posición exacta y secuencia de activaciones/inactivaciones** (por ejemplo, primera activación, desaparición y reactivación), comparada con posiciones físicas equivalentes.
3. En VT3, investigar por separado el antecedente de **ruta exacta** frente a raíces desplazadas, con predicción congelada y controles emparejados. Ni los 30 eventos de este grupo ni las pequeñas diferencias retrospectivas justifican una prioridad.
4. Para comprobar cualquiera de estas hipótesis hacen falta predicciones PRE realmente guardadas **antes** de publicarse las cabezas; los replay históricos son estudio, no aciertos prospectivos.
5. Llevar adelante *ambos* estudios como requisito operativo de cualquier nueva prueba y mostrar sus datos en paralelo.

Código reproducible: `src/figureMotionAudit.ts`, `src/figureRescueAudit.ts`, `src/ui/FigureRescueAuditPanel.tsx`, `scripts/test-figure-motion-vt2-vt3.ts`, `scripts/lab-movimientos-figuras-vt2-vt3.ts`. Workflow: https://github.com/y0t3/Modelo-Papa/actions/runs/40878699029 (pruebas y 3 períodos aprobados).
