# Contraste histórico separado: VT2 Nocturna, 1 al 14 de agosto de 2026

**17/10/2026 · 12 jornadas completas, sin evaluar la jornada actual parcial · sin cambiar motores ni APK.**

GitHub Actions exitoso, con pruebas y tres ejecuciones separadas: https://github.com/y0t3/Modelo-Papa/actions/runs/39069182659

## Objetivo y limitaciones

Se aplicó el **mismo código congelado** de selección Lalo VT2, Geometría VT2 derivada de sus madres VT3 y Configuraciones Conectadas VT2 derivadas de las primeras diez madres VT3. La regla conectada no se ajustó al mirar las cabezas de agosto.

El intervalo **01–14/08/2026** no formó parte de las 104 jornadas/520 PRE usadas para elegir reglas en las últimas pruebas (junio-julio y 15 agosto–15 octubre); aun así, otras investigaciones del proyecto ya habían examinado parte de agosto. Por ello es un **contraste histórico adicional y no una validación externa verdaderamente ciega**.

Solo días con sorteos reales, comprobando automáticamente **12 fechas completas × 5 turnos × 5 jurisdicciones argentinas = 60 PRE / 300 cabezas**. Para la comparación principal se tomaron únicamente las **12 Nocturnas × 5 cabezas = 60 cabezas**; Montevideo se usa como fuente +11 únicamente cuando existe su sorteo. El motor no ve resultados del turno objetivo al ordenar familias.

Se verifican los 60 PRE del bloque completo (en los que cada Nocturna tiene sus cuatro turnos previos disponibles) y se guardan en un archivo distinto del histórico principal. Se preservan todos los recorridos y las cabezas reales que los explicaron.

## Resultados Top6 VT2 Nocturna: 12 días y 60 cabezas

| Lector | Coincidencias de familia VT2 |
|---|---:|
| **Modelo Lalo oficial** | **11** |
| Geometría derivada de VT3 | 8 |
| Configuraciones Conectadas derivada de VT3 | 6 |

Top6 = máximo seis **familias VT2**, no seis cifras individuales. Se considera la familia reversible de las **últimas dos cifras** de cada cabeza completa; no se contó como acierto de 4 cifras.

**52 de las 60 cabezas** tenían alguna ruta VT2 física disponible antes de Nocturna. La ventaja de Lalo se produce en un conjunto donde la mayoría de las cabezas tiene alguna terminación VT2 física: no supone ganancias de apuestas.

Lalo tuvo más coincidencias que Conectadas en **5 jornadas**, Conectadas en **1**, empataron en **6**. Por cabeza: **2** aciertos compartidos, **9** exclusivos de Lalo y **4** exclusivos de Conectadas.

### Auditoría día por día

| Fecha | VT2 físicas | Top6 Lalo | Top6 Geometría derivada | Top6 Conectadas |
|---|---:|---:|---:|---:|
| 01/08 | 4 | 2 | 1 | 1 |
| 03/08 | 4 | 0 | 0 | 0 |
| 04/08 | 5 | 1 | 2 | 0 |
| 05/08 | 5 | 2 | 0 | 0 |
| 06/08 | 4 | 1 | 1 | 1 |
| 07/08 | 4 | 0 | 3 | 0 |
| 08/08 | 4 | 0 | 0 | 0 |
| 10/08 | 5 | 1 | 1 | 0 |
| 11/08 | 5 | 1 | 0 | 2 |
| 12/08 | 3 | 0 | 1 | 0 |
| 13/08 | 5 | 2 | 0 | 1 |
| 14/08 | 4 | 1 | 2 | 1 |
| **Total** | **52** | **11** | **8** | **6** |

No se incluyeron los domingos 02/08 y 09/08, ni la jornada aún parcial del 17/10.

## ¿Qué muestran los controles de columnas?

De 12 × 6 = **72 puestos seleccionados** en Conectadas:
- **66** familias tomaban su recorrido físico actual de **Matutino**.
- **6** familias tomaban su recorrido físico actual de **Previa**.
- No se seleccionaron familias desde Primera, Vespertina o Nocturna anterior en el Top6 de este bloque.

En la comparación contra candidatas VT2 igualmente físicas dentro del mismo PRE y respetando la proporción de columnas del lector:
- **6** coincidencias conectadas observadas.
- **6,09** coincidencias neutrales esperadas.
- Control neutral sobre su universo total de familias físicas derivadas de las diez madres: **7,32** esperadas.

La selección conectada NO mostró exceso respecto del control neutral por fuente. Su Top6 tampoco mejoró por solo priorizar Matutino o Nocturna anterior: ambos criterios lograron **6**, igual que el orden conectado sin reordenar. Matutino como única fuente produjo **5**.

Estos controles son descriptivos, no una prueba de hipótesis independiente. Seleccionar las reglas a partir del histórico original puede haber sobreajustado su ventaja anterior.

## Ejemplos de familias exclusivas y antecedentes reales

**11/08 Nocturna**: la cabeza **5132**, familia VT2 **23/32**, figuró dentro del Top6 conectado y fuera del Top6 de Lalo. La madre VT3 de la hoja PRE era **234/432**. Su configuración histórica estaba comprobada por las cabezas **3871** y **0567**, con origen en **Nocturna anterior**. En la misma jornada, **5186** (familia **68/86**) fue acierto compartido, desde madre VT3 **386/683**.

**13/08 Nocturna**: la cabeza **1896**, familia **69/96**, fue exclusiva de Conectadas, desde madre **269/962**; testigos previos **8397** y **9368** de una configuración ganadora cuya fuente histórica era Previa.

**14/08 Nocturna**: cabeza **5653**, familia **35/53**, fue exclusiva del conectado, desde madre VT3 **536/635** respaldada por las cabezas históricas **6295** y **3503** (fuente histórica Previa).

Estos ejemplos comprueban que el lector genera familiares físicamente rastreables, pero **no** demuestran discriminación superior de Top6 en el período.

## Conclusión operativa

1. **Mantener Lalo VT2 oficial como selector principal.** El bloque 01–14 agosto invierte el signo histórico de la comparación conectada (11 vs 6 frente al 70 vs 48 del bloque de desarrollo).
2. **No promover** una prioridad por Matutino o Nocturna anterior ni la configuración conectada como reemplazo: 6 observado vs 6,09 neutral por fuente no sostiene esa decisión.
3. Guardar las configuraciones conectadas como **instrumento visual trazable**, conservando cabezas verificadas, fuente histórica, casillas, recorrido físico actual y familia derivada.
4. El análisis global de VT2 y VT4 en el corpus de desarrollo también queda sin cambios; no se modifican madres VT3 oficiales, regla VT4, app, APK ni `main`.
5. Aguardar a la jornada **completa** del 17/10 antes de cualquier análisis de ese día; **seguir investigando con historia completa** sin interpretar reconstrucciones como predicciones selladas.

## Reproducibilidad

- Rama `lab/vt2-nocturna-controles-17oct2026`.
- Script `scripts/lab-figuras-comprobadas-a-pre.ts` ejecutado con `LAB_AGOSTO_01_14=1`. Modo de agosto aislado y sin tocar las selecciones de los dos períodos originales.
- `scripts/lab-vt2-nocturna-auditoria.ts`, mismos controles PRE y fuente que en la auditoría base.
- Ejecución GitHub Actions aprobada: https://github.com/y0t3/Modelo-Papa/actions/runs/39069182659.
- Artefacto `LAB-VT2-NOCTURNA-CONTROLES-520`, con **tres archivos distintos**: 520 cortes originales, 525 con 16/10 y **60 cortes agosto inicial** en `FIGURAS_COMPROBADAS_A_PRE_AGOSTO_01_14.json`.
