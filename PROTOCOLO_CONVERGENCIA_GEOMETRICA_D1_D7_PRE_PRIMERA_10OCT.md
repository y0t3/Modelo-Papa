# Protocolo congelado — prueba de convergencia espacial D−1 / D−7 sin esperar Primera

**Fecha del laboratorio:** 10/10/2026, antes de Primera (12:00 ART). Se toman solo capturas anteriores a Previa y Primera, selladas por GitHub.

**Datos fijos e inmutables:** PRE Previa run 38050639551, SHA256 `19d3357c82e59dbf5050ed7941f160b7e4c04a1a0875fb5e25de9147a245ea4b`; PRE Primera run 38057490657, SHA256 `99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9`. NO leer hoy Primera ni turnos posteriores. Cotejo puramente físico, sin criterio numérico de acierto.

**Hipótesis de investigación descriptiva:** las huellas físicas antiguas de D−1 y D−7 se superponen más de lo que cabría esperar si dos conjuntos de rutas del mismo tamaño hubieran sido elegidos uniformemente dentro de cada par `fuente|VT`. No afirmar que el método elige rutas uniformemente: el modelo nulo es únicamente un control geométrico, y las huellas viejas están sesgadas por los resultados de jornadas anteriores.

**Cómputos prespecificados:**
1. Distinguir figura física canónica `VT|sourceId|celdas reversibles` y registrar todos los históricos que la dibujaron; una inversión NO añade figura.
2. Enumerar **todos** los recorridos físicamente contiguos sin repetir celdas de 2, 3 y 4 celdas en cada una de las dos columnas disponibles, deduplicando inversiones. No atravesar ni saltar columnas ni filas; respetar el vacío.
3. Por `sourceId|VT`: universo N, figuras antiguas únicas de ayer A, de D−7 B, intersección k, intersección esperada `A*B/N` y probabilidad hipergeométrica de observar k o más superposiciones si B fuese muestreo uniforme sin reemplazo entre N (A fijo).
4. Estadístico primario: **suma de coincidencias físicas VT2 + VT3 en ambas columnas**, con distribución exacta obtenida por **convolución** de las hipergeométricas por estrato. Reportar valor observado, esperanza, P(X>=observado) y P(X<=observado); mostrar también VT2 y VT3 por separado solo descriptivamente. VT4 puede no tener anotaciones históricas y se mantiene en las tablas.
5. Secundario: medir contacto espacial (una celda / dos o más) de antiguas figuras con las marcas confirmadas de Previa ya publicadas, separando columnas, sin considerar contacto entre fuentes distintas. Comparar contra prevalencia de contacto entre **todos** los recorridos válidos de esa misma fuente y VT. La marca confirmada de Previa no es un resultado futuro de Primera, pero estos controles son descriptivos y posteriores a Previa, NO predictivos.
6. Evaluar qué tan concentrada está la memoria compartida por fila y fuente, y cuáles antiguas cabezas completas justificaban cada ruta común. Incluir **todas** las rutas rivales no compartidas para prevenir selección retrospectiva.
7. Mostrar la doble hoja, cifras completas, rutas comunes y no comunes, con visualización sin esconder las demás al seleccionar una cabeza. Guardar JSON completo, informe Markdown, y ZIP para inspección.

**Interpretación obligatoria:** cualquier p-valor depende de un supuesto de muestreo uniforme que no describe necesariamente el proceso de marcas del padre; no evidencia un poder predictivo ni probabilidad de acertar. Este experimento **no elige candidatos ni orientaciones**, conserva la abstención de 0 pronósticos antes de Primera, y no modifica main, motor, selector ni APK.