# Protocolo — Enseñanza supervisada VT3 con Top3 de la semana X (13/10/2026)

**Rama aislada:** `lab-vt3-top3-aprendizaje-dirigido-13oct2026`. **Sin cambios** a `main`, motor VT3 oficial, hojas, sellos históricos, app o VT4.

## Pregunta concreta
El usuario propone enseñar al motor las cabezas verdaderas de una semana X hasta que sus Top3 por corte las identifiquen siempre que hayan sido físicamente representables, y después transferir **lo aprendido** a la semana X+1, cuyas cabezas están ocultas. Queremos medir si esa enseñanza agrega una señal útil al ranking VT3 original.

**Separar tres cosas:** (A) `DOCENTE_TOP3`, demostración con respuestas conocidas, que coloca hasta tres familias físicamente ganadoras en el Top3 de X y completa sin mirar apuestas futuras. Debería acertar cada uno de los cortes de X con al menos una familia física presente; no es un predictor y **no se aplica como tal a X+1**. (B) `AJUSTE_TOP3`, aprender un criterio de puntuación compartido, sin identificadores de fecha, turno, cifra ni familia, optimizando la **cobertura Top3 en la propia semana X** entre las familias físicas disponibles. (C) `EXAMEN_X+1`, congelar esa función de puntuación y aplicarla al PRE de la semana siguiente sin usar las cabezas de esa semana para entrenar.

## Datos fijos y corpus
- PRE de 115 cortes, 23 fechas repartidas en cuatro semanas calendario lunes–domingo de Argentina: `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`, SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`.
- Los `witnesses` forman recorridos legítimos de tres celdas contiguas de **una única fuente**, sin saltos. Conservar todas las rutas físicas para extraer rasgos; normalizar orientación inversa de ruta. Familia reversible `643/346`, no VT4.
- Los resultados oficiales de cinco jurisdicciones por corte están SOLO en el `POST_115.json`. Durante preparación PRE, workflow mueve afuera el directorio completo de auditorías y vuelve a copiar exclusivamente el PRE original. Guardar `PRE_115.json` de fichas y su sello de protocolo+código+SHA256 antes de restaurar POST.
- Una cabeza cuya terna no está en la bolsa física **no se puede enseñar ni exigir al Top3**, pero se reporta como caso físicamente imposible. Algunas hojas pueden contener más de tres familias ganadoras distintas, por lo que ni el docente puede incluir las cinco si supera las tres plazas. La métrica primaria es «al menos una ganadora física en Top3 por corte»; también contar cuántas de las ganadoras disponibles caben efectivamente en tres.
- Una familia reversible con varios recorridos ganadores cuenta **una sola vez por corte**. No asignar raíces a familias no ancladas por contactos; respetar `rootIds`.

## Las tres etapas por cada pareja de semanas consecutivas
1. **DOCENTE_TOP3(X)**: seleccionar hasta tres familias físicas coincidentes con los resultados de X y completar con primeras del VT3 oficial/físico. Es un límite superior con respuesta conocida, no hay puntaje aprendido.
2. **AJUSTE_TOP3(X)**: calcular un vector por candidata/corte con geometría/soporte físico: caminos, bloques, fuentes, tipos de tramos, orientación, zonas, edad respecto de última fuente visible, forma normalizada sin dígitos, indicadores de raíces D−1/D−7 propias, bifurcación, rutas ancladas, puesto oficial (en modelo mixto). Ajustar un **único puntaje lineal común a toda X**, con un algoritmo codificado de antemano (varios arranques deterministas, aprendizaje competitivo de pares y regularización, escoger mayor Top3 EN X, desempatar por menor norma). No usar identificador de fecha, dígitos de la terna o nombre de familia como rasgo.
3. **EXAMEN(X+1)**: conservar pesos aprendidos; generar exactamente Top3 y Top10 experimental en cada corte de X+1. Para Top10, poner las tres familias del Top3 aprendido en las primeras posiciones y llenar siete plazas con familias originales aún disponibles, sin repetir familias. Mostrar el Top10 oficial inmutable. **Ningún resultado de X+1 entra en el entrenamiento o selección.**

Evaluar dos bolsas distintas para no confundir admisión con ordenación:
- **`ANCLADAS`**: el puntaje opera solamente sobre familias que ya tienen raíces históricas VT3 legítimas; sirve para saber si mejora la priorización del motor.
- **`FISICAS`**: puntaje opera sobre todas las formaciones VT3 físicamente posibles, inclusive no ancladas; sirve para saber si puede recuperar candidatos como 851, sin fingir respaldo histórico.
Comparar para cada bolsa `TOP3_AJUSTADO` y `TOP10_AJUSTADO` con `TOP3_OFICIAL` y `TOP10_OFICIAL`. Comparar también con el docente que conoce el resultado, solo en su semana de entrenamiento.

### Política de aprendizaje fija
- Rasgos numéricos de geometría y soporte, todos acotados. No incluir nombres de familia, fechas o dígitos.
- Optimizador determinista por perceptrón de ranking en pases, con tres inicializaciones predeterminadas: cero, prioridad física histórica, y pesos geométricos sin anclaje. Tasas de aprendizaje, épocas y regularización fijas antes de POST; seleccionar modelo por éxito Top3 **en la misma X** con desempate por suma de rangos recíprocos y norma menor. Es deliberadamente permisivo al sobreajuste, para contestar si «hacerle acertar X» mejora la transferencia.
- Si no hay ninguna positiva físicamente válida para un corte, el ajuste no recibe ejemplo positivo de ese corte. La falta se reporta en el techo de cobertura física. Esos cortes siguen evaluándose en el examen.
- Un `DOCENTE_TOP3` específico de una semana puede conseguir el máximo físico con las respuestas conocidas; no se debe atribuir ese resultado a una regla compartida ni reutilizar esa lista de números exactos en la semana siguiente.
- Los dos modos aprenden por semana X y examinan X+1 **separadamente** (14/09→21/09, 21/09→28/09, 28/09→05/10). No cambiar pesos por acertar o fallar dentro de X+1.

## Controles y conclusiones
- Por semana: objetivo del docente, máximo físicamente posible en Top3, puntuación que realmente logró el ranker **en X**, resultado del mismo ranker aplicado a X+1, VT3 oficial de X+1, rescates y pérdidas pareadas, resultado del Top10 al insertar Top3 aprendido.
- Control sin aprendizaje: escoger Top3 anclado original. Para la bolsa física, control simple alternativo: Top3 oficial, que constituye un uso de tres plazas fijas.
- Si el modelo logra muchos Top3 en X pero no en X+1, mide **memorización/sobreajuste**, no una ventaja predictiva. Si ni siquiera logra X, confirma incapacidad del modelo sencillo para representar todos los ejemplos simultáneamente, no invalida la idea de estudiar recorridos.
- Estandarizar observaciones por corte, nunca tratar 5 jurisdicciones o caminos de la misma familia como ensayos independientes.
- Sin cambio al motor oficial independientemente de resultado. Este corpus ya inspiró muchas hipótesis anteriores: el experimento puede verificar un procedimiento causal secuencial, **pero no es un holdout externo independiente ni prueba de ventaja sobre sorteos aleatorios**.

## Entregables
`scripts/lab-vt3-top3-dirigido.mjs`, `.github/workflows/lab-vt3-top3-dirigido.yml`, `auditorias/vt3-top3-dirigido-115-13oct2026/{PRE_115.json,SELLO.json,POST_115.json,RESUMEN.json}`, informe de prueba en Markdown. GitHub Actions debe completar satisfactoriamente.
