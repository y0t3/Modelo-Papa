# Protocolo VT3 — vecindad geométrica en fuente, 13/10/2026

Rama exclusiva `lab-vt3-vecindad-geometrica-13oct2026`. Investigación exploratoria sin tocar `main` ni motor de producción ni VT4. **15/115** cortes con coincidencias originales y **cero en el puesto 10 original**; por tanto rescatar casos con un cupo libre no demuestra por sí solo selección superior.

## Pregunta
Una familia física sin raíz puede compartir casilleros/bloques con familias ancladas de la MISMA fuente sin recibir las raíces de éstas. ¿Los contactos *estructurados* distinguen entre las ~64 candidatas elegibles por corte, más allá del número de bloques o de que la fuente sea reciente?

## Entradas y aislamiento
- Entrada congelada `auditorias/vt3-cupo-fisico-controles-115-13oct2026/PRE_115.json`, SHA256 `d5d641d02bdaa7a7ae14878ecfaa3ebdf6a3295fac44b1fa1fbf70eaabafbb0a`; su sello SHA `125d07d3de95242b0d523419a88ee2b4d111d8b3c0bfbd8e36b78d9c3acef551`.
- Testigos físicos `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`, SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`.
- Ventana: exactamente las mismas familias **no ancladas, sin fuente homónima anterior** preseleccionadas por el laboratorio previo, para los 115 cortes. No ampliar elegibilidad. Una elegida ocupará sólo el puesto 10; primeros nueve originales permanecen íntegros.
- Antes de crear los PRE de este laboratorio, workflow aparta físicamente del checkout los POST de estos laboratorios y Nocturna. Guarda sello de programa, reglas y PRE, luego incorpora las cabezas y evalúa.

## Geometría estricta y contabilidad
Se usa cada ruta de 3 celdas distintas contiguas dentro de una sola fuente, sin cruzar fuentes. La familia se agrupa valor/inverso exacto. Rutas iguales invertidas equivalen en geometría; bloques equivalen por las mismas tres celdas sin orden.

Para una familia sin raíz candidata, sólo buscar caminos de **otras familias ancladas** cuyo propio camino tenga `anchored:true` y al menos un `rootId`. No se atribuirá ningún `rootId` a la familia candidata.
- **Tramo en común**: comparten uno de los segmentos físicos entre celdas consecutivas (dos celdas). Comparar dentro de la misma fuente.
- **Pivote**: comparten ese segmento y además el casillero central de ambos caminos coincide; el bloque de tres casilleros es distinto (tercera casilla alternativa). No confundir con permutar dígitos.
- **Bloque compartido**: usan exactamente el mismo conjunto de tres casilleros, aunque sean familias distintas. No confundirlo con la misma terna inversa.
- **Vecinos diversos**: cantidad de familias ancladas distintas a las que toca la candidata en un tramo; `2+` significa dos familias, **NO dos raíces independientes**.
- **Fuentes de contacto**: en cuántas fuentes físicas diferentes existe al menos una de esas coincidencias.
- **Densidad de contactos**: número de familias distintas tocadas por tramo, dividido por cantidad de bloques físicos propios. No premiar automáticamente los tableros más llenos. Medir centro de pivote distinto de mero recuento de caminos.
- **Control de posición**: cuántas familias tienen al menos 1 vecino anclado; reportar distribuciones de bloques/fuentes por las elegidas y las descartadas.

## Políticas fijadas ANTES de POST
Mismo Top10. Si elegible sin raíz, ocupar puesto 10; si no, mantener original. Todas toman exactamente el mismo conjunto de candidatas del PRE anterior:
- `ORIGINAL`, sin cupo.
- `BASE_RENOVADA`: reproducir exactamente `RENEW_LAST_BLOCKS`, selección por última fuente disponible, después número de bloques, desempate alfabético (18/115 previo).
- `G_PIVOTE`: más familias ancladas que comparten pivote genuino; después más bloques con pivote; después desempate de BASE.
- `G_VECINOS`: más familias ancladas distintas que comparten tramo físico; después mayor número de fuentes de contacto; luego BASE.
- `G_FUENTES`: más fuentes físicas con contacto a recorridos anclados; después más familias vecinas; luego BASE.
- `G_BLOQUE`: más familias ancladas que comparten exactamente un bloque físico; después más caminos con ese bloque; luego BASE.
- `G_DENSIDAD`: más vecinos por bloque; después menos bloques, luego BASE.
- `G_UMBRAL2`: familias con **al menos dos vecinas ancladas** por segmento primero; dentro de ellas, densidad; luego BASE.
- `CONTROL_HASH`: entre elegibles, menor SHA256(`20261013|date|turn|family`), neutro.
- `CONTROL_BLOQUES`: más bloques, luego BASE; contrasta si la estructura solo resume densidad de caminos.
- `CONTROL_SIN_VECINOS`: primero familias con cero vecinos por tramo, luego BASE; control negativo espacial.
Protocolo no permite rescatar 615 ni 242 mediante estos rankings sin raíz; tampoco asegura rescatar 851.

## Comparaciones
- 115 cortes por Top3, Top5, Top10, con ganancias/perdidas pareadas contra original y `BASE_RENOVADA`; por mes/turno y familias exactas rescatadas.
- Números de elegibles y proporción con contactos/pivotes y bloque anclado, incluidas **negativas**.
- Repetir 2.000 elecciones neutrales uniformes sobre elegibles (selladas PRE) para comparación de cobertura y percentil del método, sin seleccionar resultado ganador entre ellas.
- Negativos adicionales por 10.000 permutaciones de **jornadas completas** (los cinco turnos juntos), y 10.000 sólo entre mismo día semanal, comparando diferencias pareadas contra BASE y control de bloques. Todos los cálculos usan PRE sellados antes de exponer POST del laboratorio, pero todo el diseño es retrospectivo en un histórico ampliamente reutilizado.
- Nocturna 12/10 diagnosticada por separado desde `NOCTURNA_SIMULACION.json` PRE físico; jamás reemplazar la predicción original sellada a las 18:56.
- No promoción automática de ganadoras; de hecho, la quiniela es un sorteo aleatorio y una figura bonita no implica probabilidad mayor.

## Producto
Scripts, workflow, PRE sellado, POST, resumen y punto de control en esta rama. Mantener todos los recorridos físicos intactos y no trabajar VT4.
