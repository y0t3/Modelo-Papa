# Punto de control parcial — prioridad VT3 D−7 frente a D−1

**Fecha de análisis:** 14/10/2026 (datos hasta Nocturna del 13/10).
**Rama:** `lab-vt3-prioridad-d7-contra-d1-14oct2026`.
**Estado del laboratorio:** prueba dirigida de los **cinco cortes del 13/10 completada** directamente a partir del PRE y POST ya versionados. El script integral para los 115 cortes anteriores, y el protocolo de separación PRE/POST, están preparados en esta rama, pero **la corrida de 115 aún no se ha ejecutado**: la creación del nuevo GitHub Actions workflow no quedó autorizada en esta sesión. No se presentan cifras históricas inventadas ni se afirma que el experimento completo esté sellado.

## Modelo de prueba

Ranking original VT3 de grupos físicamente admitidos: `[bifurcación>0, cantidad de bifurcaciones, D−1, D−7, fuentes, bloques]`.

Control aislado: mantener *idénticos* los recorridos, familias y bifurcaciones, invirtiendo sólo el orden de las dos raíces, `[bifurcación>0, cantidad de bifurcaciones, D−7, D−1, fuentes, bloques]`. Mantener desempate lexicográfico por familia. No se incluyen ternas sin raíz en el ranking oficial.

El PRE proviene de `auditorias/vt3-cotejo-nocturna-13oct2026/PRE_13OCT.json`, que había sido validado contra el Top Matutino sellado antes de su sorteo. La hipótesis de invertir raíces surge **después** de conocer la Nocturna, por lo que las mediciones aquí son retrospectivas.

## Resultados del 13/10

| Turno | Familias admitidas VT3 | D−7 sin D−1 | D−1 sin D−7 | Ambas | Top3 oficial / invertido | Top10 oficial / invertido |
|---|---:|---:|---:|---:|---|---|
| Previa | 19 | 5 | 13 | 1 | 0 / 0 | 0 / 0 |
| Primera | 43 | 22 | 10 | 11 | 0 / 0 | 1 / 1 |
| Matutina | 59 | 29 | 16 | 14 | 0 / 0 | 0 / 0 |
| Vespertina | 70 | 40 | 16 | 14 | 0 / 0 | 0 / 0 |
| Nocturna | 78 | 40 | 24 | 14 | 0 / 0 | 0 / 0 |
| **Total cinco cortes** | **269 registros** | **136 registros** | **79 registros** | **54 registros** | **0 / 0** | **1 / 1** |

Los 269 son **registros de familia por turno**, no 269 familias diferentes. Los cinco cortes tienen 25 cabezas de 4 dígitos en total.

El ranking invertido sigue dando Top5 **1/5**, Top3 **0/5** y Top10 **1/5**, exactamente como el oficial.

### Tres familias admitidas que coincidieron con las cabezas

- **Primera / 5485**: familia `485/584`, con D−1 y D−7, puesto oficial **#5** y con D−7 primero también **#5**. Único acierto Top10 del día.
- **Primera / 8857**: familia `758/857`, sólo D−7, rango **#42 → #34**. No llega a Top10.
- **Nocturna / 1234**: familia `234/432`, sólo D−7, rango **#21 → #11**. No llega a Top10.

### El cuello de botella exacto: once familias empatadas para una plaza

En la Nocturna, el ranking con D−7 antes de D−1 presenta el siguiente **empate perfecto de prioridad** entre puestos #10 y #20:

`037/730`, `234/432`, `268/862`, `324/423`, `428/824`, `435/534`, `439/934`, `548/845`, `619/916`, `669/966`, `768/867`.

Todas tienen la tupla de comparación **[bif>0=1, bif=1, D−7=1, D−1=0, fuentes=1, bloques=2]**. El puesto #10 corresponde a `037/730`, y `234/432` queda #11 por **desempate alfabético**, no por una diferencia física de esas seis variables.

En esa Nocturna había **40 familias D7_SOLO** admitidas, de las cuales **11** estaban entre los puestos oficiales #11 y #30, incluso antes de cambiar el orden. El resultado `1234` no se podía individualizar mediante los pesos de D−1/D−7 de este mismo comparador.

## Exposición y negativos (sin reclamos de predicción)

Entre las 25 cabezas del 13/10 y 5 cortes:

| Clase de familia físicamente admitida | Registros familia/corte | Cabezas observadas | Esperadas si la terminación fuera uniforme |
|---|---:|---:|---:|
| D−7 solamente | 136 | **2** | 1,320 |
| D−1 solamente | 79 | **0** | 0,755 |
| Ambas memorias | 54 | **1** | 0,540 |

La expectativa se calcula con cinco cabezas por corte y el número exacto de ternas de tres cifras distintas incluidas por cada familia reversible; los palíndromos sólo cuentan una orientación. Son **referencias de exposición**, no una prueba de que alguno de los grupos tenga capacidad predictiva ni una validación de independencia probabilística. Con cinco cortes y un modelo propuesto después de observarlos, las diferencias 2 frente a 1,32 y 0 frente a 0,755 no permiten elegir una regla fiable.

## Interpretación y continuidad

**Conservar el motor oficial.** Un cambio global de orden D−7/D−1 no rescata a `1234` en el Top10. La pregunta investigable no es simplemente subir D−7, sino establecer **criterios prospectivos independientes de los resultados** para separar once familias con exactamente la misma prioridad histórica/física. Ya hubo estudios extensos de desempates y geometrías; hay que contrastar cualquiera de esas propuestas con controles dentro del mismo grupo y no seleccionar una por el acierto conocido.

Se versionaron `PROTOCOLO_VT3_PRIORIDAD_D7_D1_14OCT2026.md` y `scripts/lab-vt3-prioridad-d7-d1.mjs` para un ensayo histórico de 115+5 cortes con dos mil controles. **No confundir código preparado con ensayo ejecutado o con sello PRE/POST válido**.

Datos origen: `auditorias/vt3-cotejo-nocturna-13oct2026/PRE_13OCT.json` y `OBJETIVOS_POST_13OCT.json`; el PRE Matutino conservó su sello oficial `067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41`.

**No cambiar la app ni sustituir en VT4 un grupo madre mediante inversión de la cuaterna completa.**
