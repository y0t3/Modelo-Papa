# VT4 — complementariedad de recorridos históricos D−1 y D−7 en el mismo corte
**Rama:** `lab-vt4-complementariedad-d1-d7-13oct2026`. **Sin cambios en `src/motorLalo.ts`, `main`, app instalada, hojas ni sellos anteriores.**

## Pregunta
En Matutina 03/10 coincidieron dos cabezas VT4 diferentes: `2592` con una geometría ganadora D−7 trasladada y `5832` con recorrido ganador D−1 exacto. ¿Ocurre esta **complementariedad de evidencias previas** en muchos cortes o fue una excepción? ¿Sirve para ordenar hijas reales de las mismas cinco madres VT3 y los mismos diez puestos, en jornadas diferentes?

## Integridad física
Una candidata pertenece a una **madre VT3 reversible y una ampliación por dígito y extremo**; la familia teórica `3226/3622` no se convierte en una inversión completa `3226/6223`. Cada cabeza elegible debe poseer una ruta propia de cuatro celdas adyacentes de una sola columna de turno. Una cabeza compartida por dos madres no ocupa dos plazas. Los respaldos D−1/D−7 cuentan **eventos ganadores físicos anteriores**, no cualquier forma posible ni una marca predictiva creada luego; se mantienen por **ruta específica**, no se prestan a la madre o a hermanas.

## Separación previa de diagnóstico y ranking
Medir, sin mirar resultados actuales:
- Cortes en los que existen a la vez **alguna hija** con ruta histórica D−1 y **alguna otra hija** con ruta D−7 (forma trasladada o exacta), si corresponden a madres diferentes o iguales.
- Cortes en que el **Top10 base** o el **Top10 combinado anterior** contienen ese par real de apoyos de períodos distintos.
- Familias hijas con apoyo D−1 exacto y D−7 traslado, números distintos y madres físicas que compiten por los puestos, comparando cuántas rutas/cabezas históricas independientes respaldan cada una.

Distinguir **presencia física previa** de **éxito de los resultados** de las cinco jurisdicciones argentinas. Ninguna cabeza del corte evaluado se utiliza para generar elecciones.

## Métodos de diez plazas definidos antes de cotejar cabezas
1. `BASE_CUPO2`: reproducir exactamente el Top10 de dos hijas por las madres VT3 #1–#5 (el original corregido).
2. `D7_D1_COMBINADO`: reproducir exactamente el experimento sellado anterior, que tuvo 5 cabezas VT4 y 4 cortes Top10.
3. `DOBLE_POR_MADRE`: elegir la pareja de hijas de cada madre que cubra ambas evidencias D−1 y D−7 **cuando existan entre sus hijas**, luego cantidad de coincidencias exactas, luego trasladadas y después puesto original.
4. `COBERTURA_GLOBAL`: seleccionar pares por madre privilegiando primero períodos históricos todavía no representados entre las madres escogidas, después respaldo exacto y formas trasladadas.
5. `EQUILIBRIO_PERIODOS`: madres #1, #3 y #5 priorizan D−7; madres #2 y #4 D−1; para cada una, la segunda hija tiene preferencia por evidencia del período contrario. Es una regla fija PRE (no optimizada por cabezas).
6. `SOPORTE_TOTAL`: dentro de cada madre priorizar diversidad de períodos D−1/D−7 y cantidad de eventos, sin imponer cuotas cruzadas.
7. `HASH_NEUTRAL`: orden neutral reproducible por hash de fecha, turno, madre, identidad de grupo.

Todos seleccionan **dos hijas distintas por cada madre #1–#5**, diez plazas por corte, sin repetir un valor exacto de cuatro cifras entre agrupaciones seleccionadas. Los empates usan clasificación nativa, no etiquetas POST. El contraste original de huellas y sus controles 500 permutaciones permanecen como referencia, no se redefinen.

## Fases y métricas
Usar los 115 PRE previamente sellados `auditorias/vt4-transferencia-rutas-ganadoras-115-13oct2026/{PRE_115.json,INVENTARIO_RUTAS_PRE_115.json}`, y los perfiles maternos de `auditorias/vt4-hermanas-geometricas-115-13oct2026/PRE_115.json`. En GitHub Actions se **retiran físicamente** el archivo con cabezas POST y el fixture completo antes de ejecutar esta nueva fase PRE, que guarda sus diez plazas y estadísticas de complementariedad y SHA256 en un commit propio. Después se restauran resultados y se contrasta **Top3, Top5, Top10 por corte y cantidad de cabezas completas únicas**, incluyendo rescates y pérdidas, distribuciones por semanas y análisis puntual del 03/10.

**Limitaciones:** corpus intensamente investigado; cualquier ventaja retrospectiva es exploratoria, no prueba de habilidad predictiva en sorteos aleatorios. Si la complementariedad es frecuente o no discrimina resultados, ése será el resultado. No modificar producción.
