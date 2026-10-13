# VT3 · diversidad de antecedentes históricos físicos (13/10/2026)

**Rama experimental exclusiva:** `lab-vt3-diversidad-antecedentes-13oct2026`. Creado antes de ejecutar la evaluación POST. No modificar main, `src/motorLalo.ts`, hoja +11, rutas POST, Top oficiales sellados, aplicación ni VT4.

## Hipótesis y problema a resolver

El VT3 original puntúa **cada familia reversible aisladamente** y puede concentrar muchas plazas del Top10 en familias vinculadas al mismo **evento histórico de cabeza**. Ejemplo de observación, no hipótesis adaptada a su resultado futuro: PRE Nocturna 12/10, **8 de 10 familias del Top oficial están relacionadas con la cabeza 0564, Entre Ríos Nocturna 10/10**. La hipótesis es si seleccionar un **conjunto de 10 familias ancladas con eventos históricos diversos**, manteniendo los más fuertes del ranking, amplía cobertura sin descartar ganadoras oficiales. No se afirma que los sorteos aleatorios tengan memoria ni que la diversidad de raíces mejore probabilidades por sí misma.

## Definiciones inalterables

- Base completa PRE `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`, SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`. Sus `witnesses` incluyen **TODOS** los caminos físicos de cada familia, fuente y `rootIds` propios.
- Unidad de respaldo = **evento histórico único de cabeza**. Un `rootId` tiene estructura `fecha|D−1 o D−7|turno|jurisdicción|cabeza de 4 cifras|vt3|fuente|celdas`. Se toma la clave `fecha|tipo de raíz|turno|jurisdicción|cabeza`. Múltiples caminos de la misma cabeza se cuentan como **UN antecedente**, aunque haya varias orientaciones y caminos. El campo `fuente` del recorrido sigue existiendo en auditoría pero NO convierte la misma cabeza en dos eventos.
- Candidaturas = exclusivamente la **bolsa ORIGINAL anclada** del corte con raíces D−1/D−7 comprobadas. Ninguna familia física sin raíz recibe raíz prestada. Densidad no reemplaza respaldo propio; cada ruta de 3 celdas permanece en su fuente sin cruzar columnas.
- Familia = terna y reverso exactos, como `643/346`, no combinaciones con dígitos de VT4.
- Diez posiciones exactamente. Todo ranking comienza protegiendo las **tres** o **cinco** familias oficiales que originalmente encabezan; sólo los restantes lugares son reordenados. Si la bolsa original tiene menos candidatos que el corte requerido, abortar; los 115 cortes tienen al menos 10.

## Criterios de selección PRE prespecificados

La ganancia marginal de la familia es `# de eventos propios de cabeza que NO apoyaban a ninguna familia ya elegida`. No se suman los caminos adicionales del mismo evento. Empate de ganancia marginal → mejor rango oficial. El Top se genera **secuencialmente**, agregando candidatos, no barajando toda la bolsa ni ordenando luego por alfabetización.

- `OFICIAL`: primer Top10 original.
- `COB20_P3`: preservar primeros 3 oficiales y elegir los 7 restantes de los primeros **20** anclados, uno a uno maximizando eventos nuevos.
- `COB40_P3`: como el anterior con primeros **40** anclados.
- `COB20_P5`: preservar primeros 5 y elegir otros 5 entre primeros 20.
- `COB40_P5`: primeros 5 preservados y ampliar bolsa a primeros 40.
- `VENTANA5_P3`: primeros 3 protegidos. Para cada siguiente plaza considerar los **5 mejores rangos oficiales aún libres de entre primeros 20**; elegir el que más eventos nuevos aporte, empate por rango. Mitiga el salto desde un puesto bajo sólo por un evento novedoso.
- `VENTANA10_P3`: igual pero revisar los **10 mejores rangos originales aún libres**, de los primeros 20.
- `COB20_P3_HASH`: control fijo: primeros 3 + siete familias por hash determinista `20261013|date|turn|family` dentro de primeros 20 (sin mirar raíces).
- `CONTROL_MAS_EVENTOS_20`: primeros 3 fijos + siete de primeros 20 con mayor **cantidad absoluta** de eventos propios, sin calcular novedades de eventos ya representados. Separa la diversidad marginal de la simple riqueza en raíces.
- `CONTROL_REV_RANGO_20`: primeros 3 + los siete **últimos** por rango original entre puestos 4..20, negativo.
- `ALEATORIO_UNIFORME_2000`: 2.000 selecciones uniformes **sin reemplazo** de siete familias de puestos 4..20 después de proteger las tres primeras. Generadas y selladas ANTES de observar POST (comparación necesaria: seleccionar desde top20 puede dar rescates por casualidad).
- `RAICES_PERMUTADAS_500`: 500 experimentos PRE donde se permutan **conjuntos completos de eventos** entre las familias de los rangos 4..20, manteniendo fijo el Top3. Luego se aplica `COB20_P3` a las raíces permutadas, pero se evalúan los nombres seleccionados reales. Desacopla estructura específica de raíces de la elección.
- Si `rank>20` o `rank>40`, jamás se incluye en las variantes respectivas. Todo Top10 sigue teniendo exactamente 10 familias ancladas.

Estas políticas responden a la composición del conjunto y no a cuotas por estados, contactos con familias no ancladas ni preferencias retrospectivas por cabezas conocidas.

## Diagnósticos PRE a conservar

Por corte y política guardar:
- Lista ordenada de diez familias, sus raíces/eventos propios y cantidad de *nuevos* eventos que aportó cada una al entrar.
- Total de eventos históricos **distintos** cubiertos por el Top10.
- Máximo de familias del Top10 que comparten **un evento** (concentración máxima).
- Para cada evento: cantidad de familias del Top respaldadas por él; índice de concentración de sumas de incidencias (HHI). Conservar todos los eventos (aunque el Top no los elija) para auditoría.
- Cantidad de familias reemplazadas respecto al Top10, desplazamiento de rango de las incorporadas, número de familias de la bolsa oficial.
- Presencia y fuentes de D−1/D−7 (sin usar futuro), para impedir tratar dos caminos de una cabeza como dos antecedentes independientes.

## POST y controles negativos

1. Workflow aparta físicamente los POST originales del checkout antes de ejecutar PRE (incluida Nocturna POST). Escribe `PRE_115.json`, `ALEATORIOS_PRE.json`, `NOCTURNA_PRE.json` y `SELLO.json`; sólo después devuelve POST y calcula resultados.
2. Evaluar sobre 23 jornadas (115 cortes), Tops 3/5/10, número de cortes rescatados/perdidos pareados, familias ganadoras por corte y por turno/mes, y comparaciones **de mismas diez posiciones**.
3. Calcular distribución Top10 de 2.000 selecciones uniformes y 500 reetiquetados aleatorios de conjuntos de raíces; ambos generan lista PRE sellada.
4. Hacer 10.000 reasignaciones de jornadas completas (mismos cinco turnos juntos) y 10.000 sólo entre jornadas del mismo día semanal, evaluar **diferencias de cobertura por corte** contra VT3 original, no solamente conteos absolutos.
5. Analizar Nocturna 12/10 por separado a partir de `NOCTURNA_SIMULACION.json`, fijando PRE con 9851/1615/7242/8290/3264 inaccesibles hasta POST. Esta simulación de 13/10 **NO** reemplaza el Top auténtico sellado el 12/10 antes del sorteo.
6. Reportar **también** si el Top se diversifica físicamente pero pierde coincidencias; no sobreseleccionar el método que más acertó luego de ver el resultado. Evaluación retrospectiva entre muchas reglas ya ensayadas **no es validación predictiva**.

## Decisión

Sólo observar si la composición del Top10 es artificialmente concentrada por el motor. En ausencia de mejora robusta contra controles neutrales y diferentes períodos, ninguna política se lleva a producción. No alterar VT4.
