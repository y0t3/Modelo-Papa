# VT3: diagnóstico geométrico y controles de admisión — 13/10/2026

**Objeto**: por qué familias físicamente existentes no fueron admitidas en la reconstrucción del 13/10, y por qué algunas admitidas no llegan al Top10. Investigamos especialmente `1057`, `4625`, `9192` y `1234` **sólo después de crear un inventario íntegro de todas las familias físicas de los cinco turnos**. Este análisis es retrospectivo y no constituye validación predictiva.

**Entradas**: `auditorias/vt3-cotejo-nocturna-13oct2026/INPUT_PRE_13OCT.json` (cinco hojas construidas con sus turnos previos solamente), PRE sellado `PRE_13OCT.json`, sello previo Matutino `067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41`. Se ocultan de la fase PRE `OBJETIVOS_POST_13OCT.json` y `POST_13OCT.json`, además del fixture crudo. El criterio de auditoría se fija sin cotejar ganadores. La existencia de los resultados en el historial general impide cualquier afirmación de prueba ciega genuina.

**Fase PRE**:
1. Recalcular `buildMotorLalo` y verificar la lista íntegra de familias y rankings con el PRE histórico ya sellado.
2. Enumerar **todos** los recorridos físicos VT3 dentro de cada columna con DFS, adyacencia real y sin repetir casillas, deduplicados por simetría de recorrido. Verificar cada ruta admitida contra una ruta enumerada exacta. Jamás invertir una cuaterna ni cruzar columnas.
3. Clasificar las familias físicas en cuatro grupos excluyentes: admitidas Top3, admitidas 4–10, admitidas 11+, y físicas sin anclaje. Las inexistentes físicamente se analizan por separado en POST.
4. Para cada ruta física medir fuente, celdas, dígitos, bloque, formas normalizadas, origen TRASLADO/BIFURCACIÓN cuando existe, raíces propias D−1/D−7. Buscar raíces ganadoras históricas VT3 de la **misma fuente**, de la misma familia, de la misma geometría y sus intersecciones, así como rutas hermanas admitidas de igual familia/fuente con borde compartido. Distinguir **ausencia de raíz propia** de **existencia de geometría similar con raíz ajena**.
5. Preparar grupos de control negativos **sin mirar POST**: familias de la misma hoja con iguales atributos `admitida/sin raíz`, mismo conjunto de fuentes, mismos recorridos y bloques (grupo estricto), y grupo relajado con misma situación de raíz/fuentes/cantidad de caminos. Nunca mezclar una cabeza con su inversa como dos ejemplos.
6. Para cada admitida ordenar por el comparador auténtico: bifurcaciones primero, D−1, D−7, fuentes, bloques. Registrar umbral exacto de #3 y #10 y criterio decisivo. Mostrar si una candidata con D−7 fue superada por familias con mayor prioridad en bifurcación y/o D−1.
7. Guardar `PRE_5_TURNOS.json`, SHA256 y commit GitHub antes de fase POST de esta ejecución retrospectiva.

**Fase POST**:
Confrontar **solo los últimos tres dígitos** de las 25 cabezas oficiales con las familias físicas PRE; explicar por separado:
- (i) raíz nunca existente para la familia en las fuentes visibles;
- (ii) geometría potencial de otra familia sin traslado histórico propio;
- (iii) raíz propia con ranking lejano;
- (iv) sin recorrido físico en ese corte.
Cuantificar cuántas familias negativas indistinguibles por atributos PRE existían alrededor de los cuatro casos y cuántas de ellas fueron también observadas. Casos `1057` Matutino, `1234` Nocturno, `4625` Nocturno, `9192` Nocturno; si faltara un recorrido esperado, fallar la ejecución (nunca inventarlo).

**Regla de decisión**: no modificar `main`, código del motor ni Top3 oficial; esta fase prueba **mecanismos de admisión y concentración física**, no un algoritmo predictor. El origen D−7 se evalúa únicamente por trazos ganadores de la semana previa, mismos turnos/fuentes, no por semejanza retrospectiva de la cifra extra.