# Punto de control VT3 — diversidad de antecedentes históricos de las familias
**13/10/2026** · rama experimental `lab-vt3-diversidad-antecedentes-13oct2026`.

GitHub Actions **ejecución final correcta**: [38370831548](https://github.com/y0t3/Modelo-Papa/actions/runs/38370831548). Protocolo anterior a la evaluación en `PROTOCOLO_VT3_DIVERSIDAD_ANTECEDENTES_13OCT2026.md`; script reproducible `scripts/lab-vt3-diversidad-antecedentes.mjs`. Ningún cambio a `main`, `src/motorLalo.ts`, app, hoja, marcas POST, Top sellados, APK ni VT4.

## Hipótesis diferente de las investigaciones anteriores
Hasta ahora se puntúa cada familia reversible según sus propios recorridos/raíces y se toman las diez primeras. En la Nocturna del 12/10 observamos que **ocho de las diez** tenían entre sus antecedentes la **misma cabeza 0564**, correspondiente a **10/10 Nocturna, Entre Ríos**. La diversidad pregunta si escoger familias por **cobertura de eventos históricos distintos del conjunto** mejora la selección, sin fabricar apoyo ni atribuir predicción a una cabeza anterior.

**Unidad de raíz independiente para este diagnóstico:** `fecha|D−1/D−7|turno|jurisdicción|cabeza completa`. Deduplicar varias orientaciones, caminos, bloques y fuente de traslado de la misma cabeza. Todos los caminos propios conservan sus `rootIds` íntegros y su fuente; se admiten sólo familias ANCLADAS previamente por motor original. No usar familias meramente físicas sin raíz; no pueden rescatar 851 ni otras en esa situación.

## Separación temporal estricta
El workflow **movió todo el directorio de auditorías anteriores fuera del checkout** durante PRE: había sólo dos archivos de datos disponibles, `PRE_115.json` original (SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`) y `NOCTURNA_SIMULACION.json` física PRE. Construyó todas las listas de diez nombres, métricas, **2.000 selecciones uniformes** y **500 permutaciones completas de conjuntos de raíces entre familias** antes de restaurar cualquier POST. Generó `SELLO.json` con hashes de entradas, script, protocolo y cada salida PRE. Recién después cruzó las cabezas históricas POST. **No es un holdout prospectivo**, porque este corpus ya se estudió y sirvió para proponer la hipótesis; la ausencia de fuga computacional dentro del workflow no borra el riesgo de sobreajuste.

## Políticas prespecificadas y resultados históricos
Mismo histórico: **23 jornadas, 115 cortes, cinco jurisdicciones por corte**. Siempre **diez familias ancladas**, tres o cinco puestos oficiales protegidos. La ganancia marginal de una familia = cantidad de cabezas históricas distintas de apoyo que todavía **no están representadas** en las familias elegidas. Empate de ganancia marginal → mejor rango original. «Top10 acierta» significa **al menos una** familia coincidente en ese corte, no diez apuestas individuales.

| Política | Top3/115 | Top5/115 | Top10/115 | Eventos históricos distintos cubiertos por Top, promedio | Cambios de familia×corte |
|---|---:|---:|---:|---:|---:|
| VT3 oficial | 5 | 8 | **15** | **7,63** | 0 |
| COB20_P3: conservar 3, diversidad entre primeras 20 | 5 | **9** | **17** | **8,97** | 136 |
| COB40_P3: conservar 3, diversidad entre primeras 40 | 5 | 6 | 16 | 9,68 | 213 |
| COB20_P5: conservar 5, diversidad entre primeras 20 | 5 | 8 | **17** | 8,90 | 121 |
| COB40_P5 | 5 | 8 | 16 | 9,48 | 177 |
| VENTANA5_P3: considerar 5 mejores disponibles por plaza | 5 | 8 | 15 | 8,30 | 60 |
| VENTANA10_P3 | 5 | 8 | **17** | 8,92 | 124 |
| HASH20_P3 sin evaluar raíces | 5 | 10 | 12 | 7,70 | 464 |
| CONTROL_MAS_EVENTOS_20: más raíces propias sin variedad marginal | 5 | 7 | **17** | 7,90 | 287 |
| CONTROL_REV_RANGO_20: invertir preferencia por ranking | 5 | 7 | 13 | 7,34 | 799 |

**COB20_P3**: 3 cortes recuperados y **1 perdido** vs Top original:
- Rescata **16/09 Matutino**, **02/10 Matutino**, **05/10 Vespertino**.
- Pierde **18/09 Nocturno**.
- Top10 15 → 17, **ganadoras familia×corte** 17 → 19.
- Septiembre 10/70 → 10/70; octubre **5/45 → 7/45**. Matutino 8 → 10, Vespertino 0 → 1, Nocturno 3 → 2; Previa 3 y Primera 1 sin cambios.
- Aumentó diversidad de 7,6348 a **8,9652 eventos** por Top, bajó la máxima concentración por cabeza de media 4,513 a **4,270 familias** y el índice HHI de incidencias de eventos de 0,1894 a **0,1722**.

**La relación diversidad/acierto NO es monótona:** COB40_P3 cubre más eventos distintos (9,68) pero solo 16 cortes, con dos pérdidas. Esto es una falsación directa de que «cuantos más antecedentes distintos, más aciertos».

**Control importante:** premiar simplemente el mayor número absoluto de eventos de cada familia, sin penalizar coincidencias con cabezas ya presentes, también logró **17/115**. Sin embargo cambió **287 exposiciones** vs las 136 de COB20_P3 y cubrió únicamente 7,90 eventos distintos promedio. La variedad marginal produce una composición distinta y menos invasiva, **pero el resultado Top10 no demuestra superioridad frente a esta regla simple**.

## Controles negativos

**2.000 selecciones uniformes PRE:** preservar tres primeras familias y elegir otras siete de los puestos 4..20, sin información de raíces. Distribución de Top10/115: media **13,8885**, mediana 14, percentil 95 **17**, máximo 22; **10,3 %** alcanzó o superó los **17** de COB20_P3.

**500 permutaciones PRE de conjuntos de antecedentes:** redistribuir entre candidatos 4..20 sus conjuntos **completos** de raíces, sin alterar la relación real familia→cabeza usada para evaluar el resultado; después aplicar exactamente el algoritmo de cobertura marginal. Media **14,946** cortes, mediana 15, percentil 95 **17**; **11 %** logró al menos 17. Esta comparación desaconseja interpretar el aumento de Top10 como prueba de que la asociación específica con esas raíces sea predictiva.

**Permutaciones cronológicas de jornadas completas:** 10.000 controles libres dan cola unilateral exploratoria ≈ **0,1421** para diferencia COB20_P3 − original de +2 cortes; otros 10.000 preservando día de semana dan ≈ **0,0602**. La divergencia importa; además ya se han probado muchas hipótesis en las mismas 23 jornadas. **NO prueba ventaja por encima de azar.**

## Nocturna del 12/10 ya conocida
Esto es **POST retrospectivo** a partir de una reproducción PRE física. NO modifica el Top auténtico sellado a las 18:56 del 12/10.

| | VT3 oficial | COB20_P3 |
|---|---:|---:|
| Antecedentes históricos distintos cubiertos | 8 | **9** |
| Nº máximo de familias que comparten una misma cabeza | **8** | **7** |
| Familia con raíz nueva en selección | — | **487/784** |
| Su propio antecedente | — | **5918**, Provincia Matutina 10/10 |
| Coincidencias de esa Nocturna en Top10 | 0 | 0 |

COB20_P3 sustituyó **255/552** por **487/784**, introduciendo un evento histórico realmente nuevo para ese Top, aunque **ninguna** coincidió con una de las cinco cabezas resultantes.

**851/158:** físicamente posible pero sin raíz D−1/D−7; no puede participar en políticas de diversidad anclada.
**615/516:** sí estaba anclada, **rango 54**, fuera de los grupos de 20/40.
**242/242:** sí estaba anclada, rango **25**; aunque una variante abre hasta rango 40, tampoco la seleccionó.
**290/092 y 264/462:** sin camino físico válido PRE.

## Decisión fundada
El cambio de perspectiva produce un hecho verificable: **la selección oficial estaba altamente concentrada en algunas cabezas de apoyo, y la variante diversificada reduce esa concentración conservando el Top3 original.** El conteo histórico 15 → 17 es una señal exploratoria, **no validación estadística**; las pruebas de controles uniformes, raíz permutada y permutaciones cronológicas no justifican llevarla a producción.

El candidato experimental más estable conceptualmente para **congelar antes de nuevos resultados** sería `COB20_P3`: mantiene 3 mejores del original, limita distancia a rango 20 y añade como máximo siete familias por diversidad marginal de eventos históricos. `COB20_P5` se guarda como control conservador adicional. Mantener el Top oficial también, siempre **PRE sellado anterior al sorteo**, y comparar *exactamente las mismas cabezas y cortes futuros* durante una cantidad predeterminada de fechas sin retocar parámetros.

No seguir optimizando la regla con los 115 cortes antiguos: cualquiera sea el nuevo máximo histórico, eso incrementaría el riesgo de sobreajuste. VT4 permanece en espera.

## Evidencia permanente
`auditorias/vt3-diversidad-antecedentes-115-13oct2026/PRE_115.json`: 115 Tops por política con antecedentes propios, cobertura y concentración; `NOCTURNA_PRE.json`; `CONTROLES_PRE.json`: 2.000 selecciones neutrales y 500 raíces permutadas; `SELLO.json`: SHA256 de cada etapa; `POST_115.json`, `NOCTURNA_POST.json`, `RESUMEN.json`: cotejos cronológicos y negativos. [GitHub Actions 38370831548](https://github.com/y0t3/Modelo-Papa/actions/runs/38370831548) completado correctamente. Ningún Top oficial modificado.
