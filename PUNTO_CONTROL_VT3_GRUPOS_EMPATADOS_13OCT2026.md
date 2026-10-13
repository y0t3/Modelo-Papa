# Punto de control VT3 — grupos empatados completos de la frontera Top10
**13/10/2026 · Laboratorio concluido en `lab-vt3-grupos-empatados-frontera-13oct2026`.** GitHub Actions: [corrida completada 38366596487](https://github.com/y0t3/Modelo-Papa/actions/runs/38366596487).

## Qué se comprobó
La familia reversible que ocupa el puesto 10 y la del puesto 11 tienen EXACTAMENTE la misma tupla del motor en **62 de 115** cortes: existencia de bifurcaciones, cantidad de bloques bifurcados, raíces D−1, raíces D−7, fuentes y bloques físicos. Si las seis magnitudes empatan, VT3 acaba desempantando por orden alfabético de la familia, no por un recorrido con mayor respaldo histórico.

Este laboratorio no se limitó a comparar los dos puestos: reconstruyó **la clase completa de igualdad**, desde la primera hasta la última familia con la misma tupla, preservando las **primeras ocho posiciones originales** y cualquier familia entre puestos 9–10 con prioridad estrictamente superior. Por construcción, no se crean raíces, no se admiten familias sin anclaje y el Top sigue teniendo **diez familias**.

**Datos físicos antes de POST:** `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`, SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`. Protocolo `PROTOCOLO_VT3_GRUPOS_EMPATADOS_13OCT2026.md`, script `scripts/lab-vt3-grupos-empatados.mjs`. Workflow movió POST fuera del checkout, generó y selló PRE, **2.000 elecciones uniformes** y sólo entonces restauró POST y cotejó. El diseño se hizo sobre un histórico previamente observado en varios laboratorios; el sello evita fuga computacional durante esta ejecución, pero **no convierte la evaluación en prospectiva**.

## Anatomía exacta de los empates
- 62 grupos completos que atraviesan el límite 10/11; tamaño mínimo **2**, máximo **14**, media **6,26 familias**.
- Al proteger las ocho primeras posiciones, quedaron **334 registros de familias competidoras**: 29 cortes donde una sola plaza era disputable y 33 donde lo eran dos.
- **Sólo 4/62 cortes** tuvieron una familia ganadora en las competidoras de la frontera. **En sólo 2** esa familia podía recuperar un corte fallado por el Top original; en los otros 2 el Top original ya había acertado por otra familia.
- El promedio condicional uniforme calculado exactamente de cada corte (`plazas × familias ganadoras / elegibles`) fue **1,2762 exposiciones de familia ganadora escogida** sobre los 62 cortes. Las 2.000 muestras uniformes PRE dieron **1,288** en promedio. No hay anomalía geométrica evidente.

### ¿Qué diferencias físicas existen dentro de clases con tupla igual?
De los 62 grupos, cantidad de cortes con al menos dos competidoras de rasgos distintos:
| Variable física adicional PRE | Grupos que la diferencian |
|---|---:|
| Número de bloques distintos anclados | **0/62** |
| Tramos físicos anclados únicos | 14/62 |
| Casilleros centrales de rutas ancladas | 18/62 |
| Fracción de caminos que llevan raíz | 48/62 |
| Fuente más reciente con ruta anclada | 35/62 |
| Alguna ruta propia anclada en última fuente visible | 20/62 |
| Ausencia física en jornada anterior del mismo turno | 40/62 |
| Ausencia de raíz en jornada anterior del mismo turno | 28/62 |

**No equivale a ocho criterios predictivos:** muchos atributos sólo describen distintas cantidades/orientaciones de los mismos recorridos. El número de bloques anclados propios fue directamente idéntico en los 62 grupos: por ese criterio la clasificación no puede resolver la frontera y recurre al orden oficial.

## Selecciones fijadas antes de cotejar
| Desempate dentro de grupos completos | Top3 | Top5 | Top10 | Rescates/pérdidas vs original |
|---|---:|---:|---:|---|
| Original alfabético | 5 | 8 | **15** | — |
| Más bloques anclados propios, luego tramos | 5 | 8 | 15 | 0/0 |
| Más tramos propios con raíz, luego centros | 5 | 8 | 15 | 0/0 |
| Ruta propia con raíz en fuente más reciente | 5 | 8 | 15 | 0/0 |
| Ausente físicamente en jornada previa | 5 | 8 | 15 | 0/0 |
| Mayor proporción de rutas con raíz propia | 5 | 8 | 15 | 0/0 |
| Orden alfabético inverso | 5 | 8 | **16** | **1/0** |
| Hash fijo como desempate neutro | 5 | 8 | **16** | **1/0** |

Las dos últimas opciones seleccionaron la familia `087/780` del **16/09 Matutino**, antes en puesto 12, que tenía prioridad idéntica a `079/970` (puesto 10) y `080/080` (puesto 11). **El ranking geométrico por tramos favorecía a 079/970**, de modo que este rescate no justifica sumar diversidad de tramos como indicador.

Otros casos concretos:
- **15/09 Previa:** familia `175/571` en puesto 11 dentro de grupo de cinco competidoras (puestos 9–13). Había **una sola ruta anclada de dos rutas físicas**, y los dos integrantes originales del Top con la misma prioridad tenían una proporción anclada de 100 %. Todos los desempates geométricos ensayados conservaron el Top y omitieron 175.
- **15/09 Matutino:** `365/563` en grupo de puestos 10–16 coincidió, pero el Top original ya había acertado por otro miembro; moverla al límite no recupera ese corte.
- **18/09 Nocturno:** `798/897` en un grupo de puestos 7–13 (miembros disputables a partir de 9) coincidió; el Top original ya tenía otra familia ganadora, por lo que no genera rescate adicional.
- **16/09 Matutino:** `087/780` puesto 12 podía rescatar el corte, y lo hizo sólo bajo desempates neutrales inverso y hash fijo.

Las cuatro observaciones se documentan con todas las familias, fechas, recorridos y perfiles PRE en `PRE_115.json`, y las ganadoras exclusivamente en `POST_115.json`.

## Controles negativos: ¿es destacable acertar 16 en vez de 15?
- **2.000 elecciones uniformes selladas** en grupos completos: Top10 medio **15,738**, mediana 16, percentil 95 **17**, máximo 17. **60,75 %** de las elecciones alcanzó o superó 16. Es decir, el +1 del hash o alfabeto inverso es **totalmente compatible con selección neutral**.
- **20.000 permutaciones de jornadas completas**: cola de mejora pareada **+1 o superior** del hash ≈ **0,211**, y alfabeto inverso ≈ **0,221**.
- **20.000 reasignaciones entre jornadas del mismo día de semana**: cola de +1 del hash ≈ **0,170**, alfabeto inverso ≈ **0,314**.
- Las cinco prioridades físicas fueron **15/115**, sin ventaja respecto al Top original. Ninguna encontró las dos recuperaciones factibles a la vez.
- Desglose por mes: septiembre Top10 original 10, inverso/hash 11; octubre 5 con todos. No hay repetición mensual suficiente.

Todos los controles son exploratorios. Haber descubierto el empate, elegido rasgos y comprobado los 115 resultados muchas veces hace posible el sobreajuste, aun si el programa de este ensayo no abrió POST durante la etapa PRE. Los resultados de quiniela son aleatorios; ninguna preferencia de empate implica probabilidad superior futura.

## Conclusión operativa
**La clase de empate explica por qué la décima y undécima familias son arbitrariamente separadas, pero NO encontramos una medida geométrica de desempate que haya mejorado VT3.** El nivel de respaldo anterior está realmente igualado; si los atributos extra también fallan frente a negativos, no conviene inventar votaciones de recorrido, sumar raíces prestadas ni ascender el alfabeto inverso.

Lo que sí está técnicamente justificado como información diagnóstica: mostrar **«Empate físico/histórico en la frontera del Top10»**, su tupla de respaldo, miembros completos y trazos válidos, destacando qué quedó dentro/fuera por desempate sin afirmar que todos sean aciertos. Cualquier alteración de ranking debe pasar una evaluación realmente independiente.

**VT3 oficial no modificado, rama `main` intacta, VT4 todavía en espera.** Tampoco se modificó hoja diaria, rutas POST, sellos anteriores ni APK.

## Evidencia permanente
`auditorias/vt3-grupos-empatados-frontera-115-13oct2026/PRE_115.json`, `AZAR_PRE_2000.json`, `SELLO.json`, `POST_115.json`, `RESUMEN.json`; `scripts/lab-vt3-grupos-empatados.mjs`, su workflow y [Actions 38366596487](https://github.com/y0t3/Modelo-Papa/actions/runs/38366596487).
