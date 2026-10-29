# Cómo aprovechar los motores Formas Primero sin contaminar Lalo — auditoría 29/10/2026

## Pregunta
¿Qué usos prácticos aportan los lectores de figuras VT2 y VT3 aparte de construir otro Top10? Estudio con los JSON de las auditorías reconstruidas (590 cortes; junio-septiembre y 12–28 octubre). **No hay PRE realmente sellado ni evidencia de rentabilidad o ventaja estadística.**

## 1. Mezclar 10 candidatos de manera fija
Cada Top mixto conserva exactamente diez **familias únicas** por turno: toma los primeros N de Lalo, agrega los primeros 10−N de Formas que no estén ya presentes, y si quedan lugares libres los completa con familias de Lalo y después de Formas (sin usar POST).

| Política Top10 | VT2 (590 cortes) | VT3 (590 cortes) |
| --- | ---: | ---: |
| 10 Lalo | **576** | 48 |
| 8 Lalo + 2 Formas | 559 | 54 |
| 5 Lalo + 5 Formas | 550 | 54 |
| 10 Formas | 546 | **56** |

La mejora de VT3 al mezclar se mide sobre apenas unas decenas de coincidencias y no demuestra señal; para VT2 la mezcla empeora frente a Lalo. **No cambiar MV1 ni recomendar aumentar el número de apuestas.**

## 2. Coincidencia (consenso) vs aciertos exclusivos

Exposición = presencia de una familia en el Top10 de ese corte; aciertos = cabezas publicadas del mismo corte con terminación de dicha familia. Varias cabezas pueden compartir familia, por eso la tasa aciertos/exposición NO debe interpretarse como probabilidad independiente.

| Motor / grupo de familias | Exposiciones familia×corte | Cabezas coincidentes | Coincidencias por 100 exposiciones |
| --- | ---: | ---: | ---: |
| VT2 ambos Top10 | 2914 | 289 | 9,92 |
| VT2 sólo Lalo | 2984 | 287 | 9,62 |
| VT2 sólo Formas | 2984 | 257 | 8,61 |
| VT3 ambos Top10 | 1257 | 11 | 0,88 |
| VT3 sólo Lalo | 4630 | 37 | 0,80 |
| VT3 sólo Formas | 4643 | 45 | 0,97 |

Acuerdo entre motores **no valida** por sí solo un candidato, especialmente con VT2 de alto índice de presencia física y VT3 con muy pocos aciertos.

## 3. Reordenar únicamente Lalo (sin ingresar familias nuevas)
Control de consenso: entre las **diez familias ya elegidas por Lalo**, subir al principio las que están también en Top10 de Formas y respetar el orden original entre empatadas. No se ingresan ni borran candidatos.

| Política Top3 | VT2 jun–sep | VT2 oct | VT2 total | VT3 total |
| --- | ---: | ---: | ---: | ---: |
| Lalo original | 158 | 25 | 183 | 14 |
| Lalo, coincidencias primero | 167 | 24 | 191 | 15 |

Pese a ganar en acumulado VT2, **en octubre retrocede**. No existe justificación para promocionar esta regla al motor oficial: los cortes anteriores ya fueron examinados y el efecto podría ser azar o sobreajuste.

## 4. VT2 como confirmación de madres VT3: advertencia
Una madre VT3 admite dos familias VT2 físicas consecutivas. Se examinó si contar con una de ellas en el Top3 de Formas VT2 confirmaba un candidato del Top10 Lalo VT3.

- Con respaldo VT2 Formas Top3: **7 cabezas** entre 1.594 exposiciones candidatas VT3 (0,44 por 100).
- Sin respaldo de ese tipo: **41 cabezas** entre 4.293 exposiciones candidatas VT3 (0,96 por 100).

Esta comparación exploratoria **NO respalda** usar VT2 Formas Top3 como filtro excluyente o amplificador automático de VT3. Las cabezas no son observaciones independientes y no corresponde interpretarlo como causalidad.

## 5. Plan útil de investigación, evitando repetir errores

**A. Auditoría de aciertos exclusivos, figura primero.** En cada candidato, guardar PRE: silueta normalizada, ruta de celdas, columna, altura, antecedentes históricos ganadores verificados (máximo seis jornadas), cantidad de días con una activación, traslación vertical, cambio de fuente y si coincidía con Lalo. POST: registrar cabeza real y si la figura coincide físicamente. Las coincidencias por número no prueban que el recorrido priorizado acertó su forma.

**B. Comparar aciertos y fallos de la MISMA configuración, no sólo familias.** Dividir: figura repetida con misma fuente; vecina; reaparecida; sin antecedente; y explorar si las activaciones con cambio real de posición separan positivamente acierto de no-acierto. El control debe emparejar exposición real de caminos/siluetas, para no confundir formas ubicuas con señal.

**C. Experimento de rescate VT3 congelado, no ampliación automática.** Medir fuera del Top10 Lalo sólo los candidatos de Formas con una raíz física precisa (evento ganador, posición y fuente). Cada propuesta se guarda antes de sorteo, se evalúa aparte, y se compara con otros candidatos fuera del Top10 en idéntico tamaño de lista. Si no supera el control, no promocionar.

**D. VT2 como control de forma y genealogía VT3.** Usarlo para explicar visualmente los segmentos reales de una figura madre VT3 y para detectar rutas inválidas, **no** como filtro de aprobación de familia por número. Los cuatro tipos básicos de forma VT2 son muy frecuentes, por lo que aportan escasa selectividad como predictor autónomo.

**E. Panel de auditoría, no otro Top mágico.** La app puede representar para cada candidata: figura actual + antecedentes ganadores de esa misma figura + de qué motor proviene + estado PRE/POST + explicación del motivo de admisión o descarte. Máximo seis candidatos por longitud si se activa protocolo Visual Puro; manteniendo comparaciones top3/5/10 en sus respectivos laboratorios.

**F. Prueba temporal rigurosa.** Con reglas congeladas, seguir cortes futuros verdaderamente sellados, sin usar su propio POST, sin adaptar el ranking a las cabezas ya publicadas. Evaluar por jornadas completas, no exagerar por múltiples cabezas dentro de un mismo corte. No modificar MV1 mientras las mejoras no sobrevivan prueba temporal y control aleatorio.

## Resultado general
La principal utilidad actual de los nuevos motores es **encontrar dónde difiere la lectura geométrica de la selección por familias**, generar hipótesis verificables y hacer comprensible la selección física de Lalo. No existe evidencia para usarlos como autorización automática de apuestas, fusionar sus Tops ni como confirmación predictiva de un número.
