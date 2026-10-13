# VT3 — dominio de la semana X, Top3/Top5 y traslado a X+1

**13/10/2026 · rama aislada `lab-vt3-dominio-semanal-top3-top5-13oct2026`**. No modificar `main`, `src/motorLalo.ts`, hoja diaria, rutas POST, tops sellados, app ni VT4.

## Objetivo decidido por el usuario
Tomar cada turno de la semana X, enseñar las cinco cabezas reales y **todos los recorridos VT3 físicamente válidos** de sus familias reversibles, y exigir que al ejecutar el aprendiz sobre la **misma semana X sin mostrarle de nuevo el POST** sitúe todas las familias ganadoras físicamente disponibles dentro de **Top3 si hay ≤3**, o **Top5 si hay 4–5**. Luego congelar lo aprendido y pasarlo a la semana siguiente X+1 sin usar sus resultados para seleccionar. La ausencia física se anota y jamás se rellena con una ruta ficticia.

## Dos significados distintos de «dominar X»
1. **DOCENTE**: en entrenamiento se ven los resultados de X y se marcan en fichas físicas sus familias y caminos. No es predicción.
2. **MEMORIA_VERIFICADA**: un aprendiz serializa un libro de casos de X (huella de tablero PRE, fecha/turno, familias físicas positivas y ejemplos de recorridos de cada una). Al **volver a ejecutarlo sin consultar POST** sobre los mismos PRE, debe reproducir el Top3/Top5 del docente en todos los cortes alcanzables. Aun si acierta 100 %, es un modelo de reconocimiento/memorización del entrenamiento, **no una regla que anticipe el azar**.
3. **TRANSFERENCIA**: sobre X+1, las hojas que no están en el libro de casos se analizan por **similitud de recorridos** aprendidos de los positivos de X. Esta fase no accede a las cabezas de X+1 hasta después de fijar el ranking. Se miden los nuevos aciertos y las pérdidas respecto a VT3 oficial.

### Aprendizaje autónomo en hojas nuevas
Sin filtrar por dígitos exactos de la familia, cada positivo X transfiere:
- su *forma física normalizada* (orientación y reverso equivalente, sin saltos);
- *ruta exacta por fuente y casillas* y *forma en misma fuente*, almacenadas como claves distintas;
- conteos de bloques, fuentes, rutas y evidencia física propia D−1/D−7 en un vector predefinido;
- tipo de fuente y ubicación del recorrido, manteniendo todas las rutas por familia sin trasladar raíces a otras.

Políticas congeladas antes de leer X+1, diez familias y Top3/Top5:
- `OFICIAL`: Top10 actual fijo.
- `PATRON_GLOBAL`: mayor similitud de formas y tramos físicos de la candidata X+1 con las positivas de X, sin identificadores de familia ni cifra.
- `PATRON_MISMO_TURNO`: igual pero privilegia ejemplos del mismo turno (si no existen, resto de X).
- `CASILLAS_FUENTE`: coincidencia exacta de caminos propios fuente/casilleros con ejemplos positivos X; no prestar anclaje.
- `VECINO_GEOMETRICO`: similitud k-NN con vectores físicos de positivos X, sin número ni fecha.
- `VECINO_RESPALDO`: similitud k-NN con geometría y respaldo histórico propio.
- `FUSION_CONSERVADORA`: mantiene las primeras 2 del Top oficial, y agrega 1 (o 3 si Top5 excepcional) por similitud geométrica entre el resto, sin cambiar el núcleo.
- `CONTROL_NEGATIVAS`: usar como ejemplos las familias de X que no ganaron, con la misma cantidad de fichas que las positivas; control para comprobar si la supuesta señal ganadora es especial.
Todos los empates se resuelven por mejor rango VT3 original, luego alfabético. No probar parámetros en POST.

## División y oportunidades
La muestra conocida comprende 23 fechas, 115 cortes, semanas calendario 14/09 (25 cortes), 21/09 (30), 28/09 (30), 05/10 (30). Pares X→X+1: tres, evaluación total 90 cortes. Cada ronda entrena y memoriza sólo X. Generación de PRE mediante el insumo histórico SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`; los POST se retiran **físicamente** del checkout en la primera etapa y se restaura después del sello. Dentro de POST se ejecutan rondas secuenciales; toda decisión de X+1 se fija con entrenamiento de X, y **recién después** se comparan resultados de X+1.

## Verificaciones
- En X se registra número de positivas físicas por corte, cantidad con 0 (inalcanzables), 1–3 (Top3) y 4–5 (Top5). Repetir la inferencia de X desde el **libro de casos serializado**, sin cargar objetivos: todas las positivas deberán estar incluidas en el rango permitido. Abortar si falla la reproducción, si hay un camino inválido o si aparece una cabeza POST durante generación de fichas PRE.
- Distinguir **acierto de todas las familias ganadoras formables** en la semana X vs «al menos un acierto por corte».
- En X+1 para cada política: Top3 y Top10 según mismo criterio, extensión Top5 sólo si la política por su propia decisión lo requiere; **no** usar la cantidad de ganadoras de X+1 para decidir si mostrar Top5, pues eso filtraría el futuro. En examen, presentar siempre Top3 y Top5 anidados de una lista ordenada de 10 y medir ambos; en entrenamiento se extiende sólo si X tiene 4 o 5 positivos físicos.
- Comparar resultados físicos alcanzables, raíces propias, ranking original, oportunidades de rescate/perdidas, puntaje completo y pruebas negativas. No confundir un Top10 con diez cabezas distintas de cinco jurisdicciones.
- Si la exactitud del libro X llega al 100 % pero la transferencia a X+1 fracasa, significa **memorización del entrenamiento**, no falla técnica: describe con precisión lo que sí y no aprendió.

**Advertencia:** quiniela aleatoria; 23 fechas intensamente investigadas anteriormente, por lo que la secuencia causal de este laboratorio no constituye validación independiente. Ninguna mejora in-sample se llevará a producción.
