# VT3 — transferencia del Top3 docente por geometría exacta D−7
13 de octubre de 2026. Rama `lab-vt3-top3-transferencia-d7-13oct2026`. No tocar main, motor, app, sellos, marcas físicas ni VT4.

## Pregunta
El ensayo `lab-vt3-top3-aprendizaje-dirigido-13oct2026` mostró que las cabezas conocidas pueden colocarse en un Top3 DOCENTE si poseen ruta física real, pero un modelo de rasgos genéricos no generalizó. ¿Sirve mejor conservar **las rutas específicas de los ganadores enseñados de D−7**, copiar su posición/fuente a la hoja actual y leer las nuevas ternas? Es más fiel al método manuscrito de comparar ganadoras del mismo día de semana anterior.

## Insumos, aislamiento y oportunidades
PRE original: `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`, SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`. Contiene rutas físicas válidas de 3 celdas, con una única fuente, para cada familia reversible. POST original sólo en fase de enseñanza y evaluación.

**En todos los 115 cortes** preparar un inventario físico PRE con lista de rutas absolutas y geometrías normalizadas con orientación reversible; no incluir cabezas futuras. En D−7, leer únicamente las cabezas de esa jornada anterior y formar un **Top3 DOCENTE** de hasta tres familias físicamente disponibles y verdaderamente ganadoras. Si hay más de tres familias ganadoras, tomar primero las ancladas mejor situadas y luego las no ancladas en orden alfabético; documentar que las restantes no caben. El docente da acierto en cada corte D−7 donde alguna ganadora es físicamente posible, pero no se considera pronóstico.

Para examinar D, tomar solamente el corte del **mismo turno** con fecha **exactamente 7 días anteriores**. Excluir y registrar los cortes sin D−7 disponible. Conservar los cinco turnos y jurisdicciones correctas. No utilizar las cabezas del día D hasta que sus Tops estén completamente construidos y sellados en memoria.

## Modelos congelados, sin entrenar con D
Las plantillas son todos los recorridos propios físicamente válidos de las **familias ganadoras seleccionadas por el docente D−7**. Las variantes asignan a cada familia PRE del día D cuántas rutas propias diferentes corresponden a alguna de esas plantillas:
- `ABS`: mismas 3 casillas en la **misma fuente**, orden del camino o reverso equivalente. No buscar el mismo número y nunca atravesar fuentes.
- `FORMA_FUENTE`: misma forma normalizada por traslado, sin cambiar la fuente; geometría reversible.
- `FORMA_LIBRE`: misma forma normalizada en cualquier fuente actual, pero cada ruta permanece en una fuente individual. Control más permisivo.
Cada variante tiene selección sobre **ancladas** y sobre **todas las familias físicas**, siempre Top3 de tres familias. Empate: ancladas con mejor rango oficial, luego alfabético. Un Top10 experimental comienza por su Top3 y completa los siete restantes con familias originales sin repetir.
- `NEGATIVO_ABS`: tomar **igual número de familias físicamente no ganadoras en D−7** y usar sus rutas ABS como plantillas de control. Elegir negativas con hash fijo por fecha/turno/familia (no optimizar después).
- `OFICIAL`: Top3 y Top10 VT3 originales.

Unidad de voto = número de **rutas físicas únicas** que coincidieron con plantillas D−7; no contar cabezas históricas repetidas ni asignar raíz por roce. Reportar cantidad de plantillas y cuántas familias de D realmente coincidían con alguna, independiente de aciertos.

## Resultados
Contrastar Top3 y Top10 del exacto D−7, por semana destino y turnos, y techo físico de la semana objetivo. Registrar rescates y pérdidas pareadas frente al original, ganadoras de D−7 físicamente aprendidas y destinos con rutas coincidentes. No modificar parámetros después de observar resultados, no promocionar ninguna variante sólo por máximo histórico.

El workflow moverá todas las auditorías POST fuera del checkout, dejando sólo el PRE original, creará PRE/SELLO antes de permitir resultados. En post ejecutar cada corte D→: testigo ya anterior, cabezas del destino totalmente ocultas al seleccionar. Los 23 días ya inspiraron muchas hipótesis: esta transferencia cronológica no equivale a validación externa, y los sorteos de quiniela son aleatorios.
