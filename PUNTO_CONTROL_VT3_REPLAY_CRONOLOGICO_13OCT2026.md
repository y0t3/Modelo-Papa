# Punto de control VT3 — replay cronológico sin usar resultados futuros

**13 de octubre de 2026.** Rama `lab-vt3-replay-cronologico-13oct2026`. GitHub Actions [38372424649 — completada correctamente](https://github.com/y0t3/Modelo-Papa/actions/runs/38372424649).

## Alcance
**23 jornadas históricas completas, 115 cortes**. Todo el estudio continúa exclusivamente con la información disponible, sin esperar sorteos nuevos y **sin tocar** `main`, `src/motorLalo.ts`, Top oficiales sellados, app, hoja +11, APK o VT4. Se utilizaron exactamente los Tops PRE ya fijados en la auditoría de diversidad; NO se recalcularon las familias por haber mirado las cabezas.

Archivo de origen `auditorias/vt3-diversidad-antecedentes-115-13oct2026/PRE_115.json`, SHA256 `b190ed0a4715220501f564dee3300264c32efeccef7bc49fbfb1dee10999908e`. El workflow ocultó físicamente el resto del directorio de auditorías, dejando **sólo ese PRE**; escribió `PRE_REPLAY_115.json` y `SELLO.json` y entonces restauró POST, creando registros con decisiones del replay (por fecha) y controles.

**Límite epistemológico:** en este replay no hay fuga de resultados de la jornada actual hacia sus decisiones (se entrena con índices de jornada `j<i`), pero la hipótesis y políticas fueron ya desarrolladas mirando las 23 jornadas. Es una **simulación histórica paso a paso**, no una auténtica validación fuera de muestra ni prueba de predicción de sorteos aleatorios.

## 1. Diversidad fija frente al ranking original

| Política de igual tamaño, diez familias | Top3 | Top5 | Top10 | Rescates vs original | Pérdidas |
|---|---:|---:|---:|---:|---:|
| Original | 5 | 8 | **15/115** | — | — |
| COB20_P3, diversidad marginal de antecedentes, primeros tres intactos | 5 | **9** | **17/115** | 3 | 1 |
| COB20_P5, primeros cinco intactos | 5 | 8 | **17/115** | 3 | 1 |
| CONTROL_MAS_EVENTOS_20, más raíces propias sin diversidad marginal | 5 | 7 | **17/115** | 4 | 2 |
| COND5, diversidad sólo si una cabeza respalda al menos 5 de 10 familias oficiales | 5 | 8 | 16/115 | 1 | 0 |
| COND6, idem si respalda al menos 6 | 5 | 8 | 16/115 | 1 | 0 |

COB20_P3 rescató **16/09 Matutino, 02/10 Matutino y 05/10 Vespertino**, pero perdió **18/09 Nocturno**. El control de más eventos logró 17 aciertos también, **con cuatro rescates y dos pérdidas**, un conjunto distinto.

**No hay evidencia de una ventaja específica de la diversidad frente al recuento absoluto de raíces**. En la muestra, ambos empatan en Top10. COB20 cambia menos familias y produce mayor variedad de eventos, pero no implica una ganancia futura.

## 2. ¿Activa la concentración la variante correcta?

La concentración = **número máximo de familias del Top10 oficial que comparten una misma cabeza histórica D−1/D−7**, no número de caminos. Umbrales 5 y 6 fueron fijados antes del POST.

| Población | Cortes | Original | COB20_P3 | Ganancia del diversificador |
|---|---:|---:|---:|---:|
| Alta concentración ≥5 | 42 | 5 | 6 | **+1** |
| Concentración <5 | 73 | 10 | 11 | **+1** |
| Alta concentración ≥6 | 26 | 3 | 4 | **+1** |
| Concentración <6 | 89 | 12 | 13 | **+1** |

Una mitad de la ganancia de +2 aparece en cada lado del umbral 5. Por tanto, **activar diversidad sólo por saturación de una cabeza histórica no captura los dos rescates netos**. La variante condicional 5 o 6 produce 16/115. Es evidencia EN CONTRA de usar la concentración simple como interruptor de política.

Dato contraintuitivo: en los 42 cortes con concentración ≥5, COB20 elevó el número de eventos históricos distintos una media de **0,69**; en los 73 restantes lo elevó **1,70**. La mejora en diversidad de eventos fue mayor en los Tops menos concentrados bajo esa métrica. No equivale a efecto predictivo.

## 3. Replay cronológico: elegir sólo con resultados ANTERIORES

En cada fecha `D`, se evaluaron las tres candidatas `OFICIAL`, `COB20_P3` y `CONTROL_MAS_EVENTOS_20` sobre todas las fechas `j<D` permitidas por la ventana; la que tenía más cortes acertados era fijada para **los cinco turnos de D** sin usar ni un resultado de D. Empate: elegir en orden conservador OFICIAL, COB20, ABUNDANCIA.

| Replay | Jornadas previas para arrancar | Jornadas de evaluación | Oficial fijo en esas fechas | Diversidad fija en esas fechas | Replay adaptativo |
|---|---:|---:|---:|---:|---:|
| **FWD7_EXP**: entrenamiento acumulativo | 7 | 16 (80 cortes) | 10 | **12** | **10** |
| **FWD7_ROLL**: últimas siete jornadas | 7 | 16 (80 cortes) | 10 | **12** | **11** |
| **FWD10_EXP**: acumulativo tras diez jornadas | 10 | 13 (65 cortes) | 7 | **9** | **8** |

**Cambiar de variante por el rendimiento histórico reciente quedó igual o por debajo de la diversidad fija** en todos los tres modos. No justifica añadir un selector adaptativo al motor. El detalle por fecha y todos los Tops seleccionados están en `POST_REPLAY_115.json`, sección `chronologicalDecisions`, con rangos `trainingFrom` y `trainingToExclusive` verificables para cada día.

Ejemplos reveladores:
- 02/10 Matutino: COB20 produjo un rescate respecto al oficial. El selector adaptativo acumulativo seguía favoreciendo `CONTROL_MAS_EVENTOS_20`, que **no lo recuperó**.
- 05/10 Vespertino: el selector pasó a COB20 y sí aprovechó el rescate.
- 24/09: el aprendizaje acumulativo aún eligió abundancia y perdió frente al oficial de esa jornada.
Ningún turno del día en curso fue utilizado para reentrenar los otros turnos de la misma fecha.

## 4. Controles de estabilidad y azar

**Mes:** septiembre = oficial 10/70 y COB20 10/70; octubre = oficial **5/45** y COB20 **7/45**. El efecto neto se concentra en octubre, no se repite por ambos meses.

**Cuatro bloques cronológicos:** fechas 15–21/09 empatan 4/30; 22–28/09 empatan 4/30; 29/09–05/10 **5 frente a 7/30**; 06–10/10 empatan 2/25. La mejora histórica se concentra en **seis jornadas consecutivas**, no se distribuye uniformemente.

**Intervalo descriptivo de 10.000 remuestreos de JORNADAS completas**, diferencia total COB20−original: observado +2, percentiles 2,5 % a 97,5 % **[-2, +6]**; **22,44 %** de réplicas tuvieron diferencia no positiva. Esto no constituye intervalo probabilístico fiable de eficacia futura dada la selección retrospectiva de hipótesis.

**20.000 permutaciones de resultados por jornadas completas**, 10.000 libres y 10.000 con mismo día semanal:
- Mejora fija COB20 +2 contra original: cola unilateral libre **0,1421** y restringida por día semanal **0,0573**.
- FWD7_ROLL mejora +1: cola libre **0,2302**, mismo día semanal **0,2707**.
- FWD10_EXP mejora +1: cola libre **0,2061**, mismo día semanal **0,2415**.
- FWD7_EXP delta 0: cola libre **0,7672**, mismo día semanal **0,7638**.
- Ningún replay adaptativo presenta evidencia suficiente de superioridad frente al original ni frente a COB20 fijo. Estos son controles exploratorios, no pruebas confirmatorias de habilidad predictiva.

## 5. Qué está decidido

1. **No pasar `COB20_P3` al motor VT3 oficial por ahora**, y no modificar VT4.
2. **Descartar como mejoras propuestas** el interruptor de concentración ≥5/≥6 y la elección adaptativa de política en ventanas 7/10: no superaron el diversificador fijo y aumentan complejidad.
3. Mantener por separado el valor *descriptivo* de la diversidad de cabezas históricas: el Top original cubrió 7,635 eventos de media, mientras COB20 cubrió 8,965 y redujo la concentración media máxima de 4,513 a 4,270 familias.
4. El siguiente bloque de pruebas útil con los **mismos datos, sin esperar otro sorteo**, sería analizar rigurosamente la diferencia **COB20 vs CONTROL_MAS_EVENTOS** mediante selección emparejada por posiciones y eventos, y examinar por qué el Top10 cambia de ganador específicamente en 16/09 Matutino, 18/09 Nocturno, 02/10 Matutino y 05/10 Vespertino. Esto sirve para diagnosticar el mecanismo y posibles defectos del algoritmo sin declarar pronóstico.
5. No reoptimizar los umbrales en los 115 cortes para subir el resultado in-sample: el riesgo de sobreajuste es alto y las loterías son sorteos aleatorios.

## Archivos respaldados
- `auditorias/vt3-replay-cronologico-115-13oct2026/PRE_REPLAY_115.json` — las 115 selecciones existentes y las etiquetas PRE de concentración;
- `SELLO.json` — huellas de código, protocolo, fuente y PRE;
- `POST_REPLAY_115.json` — todos los resultados, decisiones secuenciales y Tops de los cinco turnos que utilizó cada regla;
- `RESUMEN.json` — tablas cronológicas, por turno/mes/concentración, remuestreos y permutaciones.
- [GitHub Actions correcta 38372424649](https://github.com/y0t3/Modelo-Papa/actions/runs/38372424649).
