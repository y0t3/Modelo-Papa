# Protocolo congelado — aprendizaje semanal de recorridos VT3

**Fecha:** 13/10/2026. **Rama:** `lab-vt3-aprendizaje-semanal-13oct2026`. **Ámbito:** sólo auditoría retrospectiva; `main`, `src/motorLalo.ts`, la hoja diaria, las rutas reales, los Tops sellados y VT4 permanecen intactos.

## Hipótesis del usuario

Mostrar al aprendiz las cabezas **ya conocidas** de la semana X, y **todas** sus formas VT3 válidas en las hojas PRE de esa semana (sin obligar a que una cabeza físicamente inexistente aparezca). Formar con esas positivas y con todas las familias físicas **negativas** una descripción estadística simple de los trazados. Pasar el modelo a la semana X+1 **sin sus resultados**, producir Tops de diez familias distintos según la política de admisión y examinar los resultados después. Ver si aprendió geometría transferible o sólo memorizó la semana X. No hay garantía de que el azar de la quiniela sea anticipable.

## Fechas y pruebas

Las 23 fechas disponibles se particionan por **semana calendario lunes–domingo de Argentina** según la fecha del sorteo, no bloques arbitrarios de siete observaciones (incluye semanas parciales). En cada semana posterior a la primera:

- `SEMANA_ANTERIOR`: entrenar sólo con los cortes de la semana calendario anterior; predecir **todos** los cortes de la semana X+1 antes de usar sus cabezas.
- `ACUMULATIVO`: entrenar sólo con las semanas estrictamente anteriores a la semana X+1, sin filtrar resultados de X+1 por turno.
- Las configuraciones, pesos, suavizados, presupuesto de 10 familias y controles se fijan **antes de ejecutar POST** y no cambian por rendimiento; reportar cada semana.
- No reoptimizar por comparar con la Nocturna 12/10, que no pertenece a estas 23 fechas.

## Insumos PRE y garantías

Fuente histórica `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json` SHA256 **`be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`**. La fuente da todos los testigos de caminos físicamente adyacentes dentro de una única fuente por familia, más la bolsa original anclada y su ranking. Los ganadores están **exclusivamente** en el `POST_115.json` correspondiente.

Workflow GitHub: durante la generación de fichas PRE, **todos los POST históricos fuera del checkout**. Fichas por familia/corte no contendrán objetivo, ganadora ni etiqueta. Registrar SHA256 de código, protocolo y PRE. En fase POST, recorrer por fechas; crear el modelo de la semana X usando las etiquetas **sólo de semanas anteriores**; ninguna llamada de entrenamiento toma índices del período evaluado. Registrar semanalmente en la salida los índices/fechas visibles durante el ajuste para auditar causalidad temporal. La separación por fecha se hace a nivel de jornada, preservando cinco turnos y cinco jurisdicciones.

## Qué aprende exactamente

Unidad positiva: **familia reversible VT3 físicamente válida en el PRE del corte**, cuya terna o inversión coincida con la terminación de alguna de las cinco cabezas del resultado. Unidad negativa: todas las demás familias físicamente posibles en ese mismo PRE. Los 5 resultados pueden incluir familias físicas ausentes: éstas se cuentan como `FUERA_DE_ALCANCE` y no se inventa un trazado ni un aprendizaje positivo. Una ganadora con múltiples recorridos aporta **una observación positiva por familia/corte**, no tantos votos como orientaciones.

Extraer señales PRE:
- Patrones de tres celdas físicas adyacentes **normalizados por traslación y por reverso**, sin incluir dígitos de la terna o nombre de familia.
- Segmentos/orientaciones consecutivas, fuente actual vs fuente anterior visible, zona de fila (arriba/medio/abajo), fuentes y bloques propios y antigüedad intradía del camino.
- Separadamente, contexto de admisión: caminos propios anclados, raíces reales D−1/D−7, bifurcaciones/bloques, rutas ancladas por fuente. No prestar raíces por proximidad.
- Agregar **tokens únicos** de familia/corte, no multiplicar una misma orientación repetida. Para evitar que familias con múltiples rutas sumen votos, usar promedio de evidencia por token y máximo de tres formas geométricas por ficha, más contadores agregados capados.

Modelo de aprendizaje interpretable: en entrenamiento, para cada token calcular `log(P(token | cabeza físicamente ganadora) / P(token | familia física no ganadora))` con suavizado Beta(2,2), sin optimización de pesos por los resultados del examen. Puntuar por promedio de contribuciones de tokens de la familia, sin usar dígitos específicos. Separar entrenamiento `FORMA` de `FORMA_Y_RESPALDO`.

## Tops de exactamente 10 familias

Por cada corte evaluado y modo semanal/acumulativo:
- `OFICIAL`: diez familias originales, control inmutable.
- `FORMA_RAIZ`: ordenar las familias **ancladas originales** por el aprendizaje de geometría pura (sólo forma), desempate puesto original.
- `CONTEXT_RAIZ`: ordenar ancladas por geometría + respaldo propio.
- `CONSERVADOR_RAIZ`: puntuar 60 % prioridad original por rango normalizado, 40 % aprendizaje de contexto; idéntica bolsa anclada, 10 familias.
- `FORMA_FISICA`: seleccionar diez del inventario físico completo mediante geometría pura, incluso sin raíz (sirve para ver si la forma por sí sola aporta señal).
- `MIX_9_1`: nueve familias con raíz según `CONTEXT_RAIZ` y una sin raíz por aprendizaje de contexto.
- `MIX_8_2`: ocho con raíz y dos sin raíz por aprendizaje de contexto.
- `NEUTRAL_9_1`, `NEUTRAL_8_2`: mismas cantidades, usando nueve/ocho **primeros originales** más una/dos familias físicas sin raíz elegidas por hash determinista `20261013|date|turn|family|control` — control de simple apertura de cupo. Sin modelo.
- `ORACULO_FISICO_POST` sólo como techo de cobertura, **no** se considera método de predicción: cuántas de las cinco cabezas tenían alguna familia físicamente formable, y si es posible construir un top retrospectivo de 10 que las contenga todas.
- Cada lista debe tener diez familias **distintas** en el sentido terna/inversión, respetar las rutas reales y no modificar la familia de números VT4. Si hay menos no ancladas de las necesarias, completar con siguientes ancladas; avisar.

## Medición

Se guardan los Tops y fichas puramente PRE antes de exponer POST, pero las listas **aprendidas** sólo se pueden generar secuencialmente después, cuando se han mostrado etiquetas de semanas anteriores. Se registra qué objetivos entrenaron cada ronda y se evalúa la semana siguiente sin incluirla al entrenar. No llamar sello prospectivo a una simulación retrospectiva.

Reportar: número de cortes/semana, familias ganadoras físicamente posibles, familias imposibles, aciertos Top3/5/10, ganadoras por exposición, rescates/pérdidas vs oficial, medidas por modalidad, semana test y Nocturna/turno. Los controles neutros y el oráculo físico permiten entender si el aprendizaje discrimina o no.

**Principal contraste:** `SEMANA_ANTERIOR CONTEXT_RAIZ` vs `OFICIAL` y `SEMANA_ANTERIOR MIX_9_1` vs `NEUTRAL_9_1`. Reportar otras variantes como exploratorias, sin promover la mejor elegida en retrospectiva.

**Importante:** la propia idea de las variables de recorrido y el archivo de 23 fechas provienen de muchas investigaciones anteriores; aun respetando la secuencia X→X+1, esto NO es una evaluación nueva e independiente. La quiniela es aleatoria y un ajuste geométrico no implica ventaja predictiva futura.
