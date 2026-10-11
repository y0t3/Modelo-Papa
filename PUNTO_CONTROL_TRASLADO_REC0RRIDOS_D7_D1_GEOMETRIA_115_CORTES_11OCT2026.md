# Punto de control — traslado físico de recorridos D−7 y D−1

**11 de octubre de 2026.** Prueba efectivamente ejecutada. **No** se modificaron `main`, motor predictivo oficial, selector, configuración ni APK. Este documento corresponde solamente a la rama de auditoría.

## Hipótesis exacta y honestidad de procedencia

Se reconstruyeron de modo **digital y retrospectivo** TODOS los recorridos físicos que explicaron al menos una de las cinco cabezas argentinas de una jornada anterior: D−7 (misma fecha semanal) o D−1 (jornada de sorteos previa). Se proyectaron sus mismas casillas, o la misma secuencia de pasos trasladada rígidamente dentro de la **misma fuente** en el tablero PRE actual. Se preservaron fuente, casillas, cabeza histórica de cuatro cifras, turno, jurisdicción, familia numérica reversible y todos los testigos. No cruza parejas de columnas, no salta huecos, no repite casillas. Dos lecturas inversas son **una familia**, nunca dos candidatos independientes. La fuente Nocturna anterior no es obligatoria.

Se usó D−7 de una jornada COMPLETA anterior (todas las cabezas viejas estaban disponibles en el corte actual); también se contrastó utilizar solo las marcas confirmadas en el mismo turno viejo. **No se afirma que esas rutas viejas sean las seleccionadas exactamente a mano por el padre:** faltaría contrastarlas con su tinta/vídeos originales. El universo aquí es reconstrucción digital de posibilidades, no verificación de la elección ocular real. La evaluación es retrospectiva: octubre ya estaba explorado.

## Cobertura

29 jornadas y **145 cortes reconstruidos**; **23 jornadas/115 cortes** contienen D−7 real dentro del tramo (70 septiembre, 45 octubre). Las selecciones PRE D−1/D−7 se separaron de las cabezas POST actuales. Cuatro modalidades de traslado diferenciadas: D−7 todos los turnos viejos, D−7 mismo turno, D−1 todos los turnos viejos, coincidencia D−1+D−7; cada una con transferencia EXACTA (mismas casillas y fuente) o FORMA TRASLADADA (movimiento rígido dentro de la fuente).

## Top de familias de octubre, 45 cortes por VT

| VT y estrategia | Top3 | Top5 | Top10 | Esperanza Top10 por azar dentro de esa misma bolsa PRE |
|---|---:|---:|---:|---:|
| VT2 D−7 todas las marcas, forma movible | 18 | 24 | **33** | **30,43** |
| VT2 D−7 exacta misma posición | 17 | 24 | **31** | **30,23** |
| VT2 D−7 solo mismo turno viejo, forma movible | 11 | 17 | **30** | **25,96** |
| VT2 D−1 todas las marcas, movible | 17 | 23 | **29** | **29,96** |
| VT2 D−1+D−7 intersección familias | 17 | 23 | **30** | **30,40** |
| VT3 D−7 forma movible | 0 | 0 | **1** | **2,16** |
| VT3 D−7 exacta | 0 | 1 | **1** | **1,77** |
| VT3 D−1 forma movible | 1 | 2 | **3** | **3,73** |
| VT4 D−7 forma movible o exacta | 0 | 0 | **0** | **0** (sin positivos en esa bolsa) |

La ordenación del Top es una regla heurística reproducible a priori: cantidad de orígenes históricos distintos, turnos viejos, misma posición, número de fuentes y eventos históricos, con desempate estable. No es la decisión visual certificada del padre ni un modelo aprendido/calibrado.

## Control de AZAR por geometrías viejas, más exigente

Se comparó la transmisión de las verdaderas posiciones confirmadas en D−7 contra **3.000 grupos de geometrías viejas elegidas uniformemente por fuente y VT y con igual cantidad de caminos antiguos**, manteniendo las mismas posiciones sorteadas a lo largo de todos los turnos de cada fecha actual (dependencia intrajornada).

| Periodo | VT | Cortes con ≥1 ruta confirmada desde D−7 EXACTA | Media bajo selección de ruta antigua al azar |
|---|---|---:|---:|
| Septiembre (70 cortes) | VT2 | **60** | **57,71** |
| Octubre (45 cortes) | VT2 | **39** | **37,69** |
| Septiembre | VT3 | **5** | **7,81** |
| Octubre | VT3 | **2** | **3,86** |
| Septiembre | VT4 | **0** | **0,18** |
| Octubre | VT4 | **0** | **0,15** |

La VT2 muestra grandes números brutos porque una pareja de cifras tiene muchas oportunidades geométricas. **No hay evidencia sólida de superioridad de la geometría históricamente ganadora respecto de rutas antiguas aleatorias equivalentes.** VT3/VT4 no mejoran.

## Casos trazables

- **02/10 Primera**, D−7=25/09: familia VT2 física `36/63` (puesto 3 entre las trasladadas), luego Santa Fe cabeza completa **1263**. En el mismo corte `79/97` puesto 9, luego Entre Ríos **0197**. Conservar también las familias negativas y todos los trazos.
- **05/10 Matutina**, D−7=28/09: VT3 `729/927` figuraba en bolsa pero **puesto 20**, Santa Fe **3729**. Nunca elevar retrospectivamente al Top ni convertir esa VT3 en un acierto VT4.
- **10/10 Primera**, D−7=03/10: VT2 `37/73` figura en puesto 3 y después coincide con Entre Ríos **2473**. Ejemplo explicativo, NO evidencia selectiva independiente.

## Integridad y entrega

Datos y código local reproducibles (entregados al usuario en el chat) en ZIP `modelo-papa-traslados-d7-d1-misma-geometria-115-cortes.zip` (26 archivos, SHA256 `d96b33a1b18207b9899f99daf492bd047dd478e1c414b324e838ec7faa6078b8`); contenido:
- `ANTES_TRASLADOS_D7_PRE.html` — hojas antiguas y actuales lado a lado, Top de familias, todas las rutas alternativas, cabeza antigua; sin cabezas actuales.
- `DESPUES_TRASLADOS_D7_POST.html` — mismo PRE más las cinco cabezas nuevas y aciertos.
- `INFORME_TRASLADOS_D7_D1.md`, `BALANCE_AGREGADO.csv`, `BALANCE_POR_CORTE.csv`, `CONTROL_AZAR_RUTAS_POR_JORNADA.csv`, `CONTROL_POSICION_EXACTA_POR_CORTE.csv`; PRE completo y POST separado; scripts 1–6.
- Tres archivos fuentes (universo físico PRE 145 cortes, fuentes PRE de tableros, cabezas POST) incluidos en `fuentes/` para reproducibilidad autónoma.

**PRE SHA256 `eff020c1b5c11139d2f34efe15cc9dc196bb36e51c49025a7f70eab1668325f9`**. Control 145×3 modalidad-cortes, **25.833 apariciones de familias candidatas, 37.856 testigos físicos, 55.883 antecedentes de origen** auditados. Prueba contrafactual eliminando cabezas/resultados actuales de 19/09, 02/10 y 10/10: **15 decisiones PRE resultaron idénticas** (5 cortes por fecha), sin fuga objetivo. PRE y POST probados en **Chromium/Playwright en vista móvil**, sin errores JS, resaltado correcto de dos hojas y cada alternativa. ZIP verificado íntegro y se volvió a correr **en una carpeta nueva y aislada desde los propios insumos del ZIP**, reproduciendo SHA PRE y cotejo POST.

## Decisión

Mantener como módulo de investigación el traslado visual fiel y la conservación de todos los testigos y negativos. **No transferir la puntuación a V7/V8/V9/V13/V12/V14 oficiales**: aún no hay superioridad convincente contra controles por oportunidad. Si se recuperan rutas auténticas del lápiz del padre (videos/fotogramas), clasificarlas explícitamente aparte de las reconstruidas, porque eso permitiría evaluar una selección ocular *específica*, no todos los caminos que numéricamente coincidieron a posteriori.
