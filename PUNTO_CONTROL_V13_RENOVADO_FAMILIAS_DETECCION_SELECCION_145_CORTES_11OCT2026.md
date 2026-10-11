# Punto de control — V13 renovado por familia: separar DETECCIÓN y SELECCIÓN sobre 145 cortes

**Fecha:** 11/10/2026 ART. Solo rama `auditoria-sorteo-10oct-2026`. NO se modificó `main`, `src/analysisEngine.ts`, selector oficial, motor actual ni APK. **Trabajo realizado, código reproducible, archivos PRE/POST y visores entregados en esta conversación**: `modelo-papa-v13-rescate-deteccion-seleccion-145-cortes.zip` (21 archivos, ZIP verificado sin error; paquete bajo `v13_familias_145/`).

## Qué prueba realmente

**29 jornadas, 145 cortes históricos** del 08/09 al 10/10/2026 (100 cortes septiembre entrenamiento + 45 octubre evaluación, 9 fechas). Se enumeraron **145.404 huellas físicas distintas por corte** entre VT2/VT3/VT4, identificadas por modalidad + pareja de columna fuente + celdas canónicas reversible. **Se cuentan como acierto la misma huella y la orientación inversa.** Las cabezas objetivo son solo las cinco jurisdicciones argentinas comunes a todo el tramo; no incluir Montevideo parcialmente disponible. Cruces entre turnos V8 prohibidos.

**No confundir:** enumerar TODOS los caminos garantiza cubrir todos los trazos que después se marquen; es una verdad de geometría, no capacidad de anticipar qué trazo será confirmado. Heredar una huella de D−1/D−7 es opcional, no restricción absoluta para el nuevo V13; si se impone la restricción, pierden candidatos antes de ranking.

## Fase 1: falla de detección de un embudo basado solo en historia (45 cortes octubre)

| VT | Familias geométricas que POST confirmó, 5 cabezas argentinas | Heredadas de D−1 o D−7 en PRE | Fuera de la bolsa histórica |
|---|---:|---:|---:|
| VT2 | **313** | **163** | **150** |
| VT3 | **104** | **5** | **99** |
| VT4 | **41** | **0** | **41** |

Si V13 recibe únicamente candidatas heredadas, **no tiene posibilidad de recuperar las otras 99 VT3** ni ninguna de las 41 VT4. En VT2 la bolsa heredada alcanza 41/45 cortes con al menos una huella positiva; VT3 solo 5/45; VT4 0/45. Evaluar candidatos heredados no prueba que se pueda distinguir cuál de ellos saldrá.

## Fase 2: selector individual sin fuga de resultados futuros en entrenamiento

Se creó `preparar_decisiones.py` para usar hojas PRE de los 145 cortes y entrenar únicamente con archivo de POST **de fechas < 01/10** (`SOLO_RESULTADOS_ENTRENAMIENTO_SEP.json`, 20 jornadas, 100 cortes). Un V13 experimental por modalidad usa regresión logística con 14 indicadores visuales (D−1/D−7, forma, fuente C0, contacto/exactitud anteriores, cantidad de figuras equivalentes y fuentes distintas), *solo para ranking*, no probabilidades calibradas. Se prepararon **540 decisiones PRE octubre** (9 días × 5 turnos × 3 VT × 4 políticas), cada una con Top3 ⊆ Top5 ⊆ Top10:
- ALEATORIO_FIJO: hash determinístico como control.
- REFERENCIA_HEREDADA: figuras D−7/D−1; puede abstenerse.
- V13_FIJO: ordenación descriptiva fija, no entrenada.
- V13_APRENDIDO: regresión logística con SOLO septiembre anterior, sin mirar POST objetivo octubre.

SHA256 congelado de decisiones octubre: **`b97bc80aa6ba701ad64fda8f385596ea15657bfba53e8b8b4692ec09aaf24445`**. Prueba anti-fuga real: retirar por completo el archivo que contiene los resultados POST de octubre, volver a entrenar/seleccionar con solo el archivo septiembre y obtener exactamente el mismo SHA. `cotejar_sin_reajuste.py` comprueba SHA y solo entonces abre POST octubre.

### Conteos de cortes con ≥1 familia exacta confirmada entre las K elegidas (45 cortes por VT)

| VT | Método | Top3 | Top5 | Top10 |
|---|---|---:|---:|---:|
| VT2 | Aleatorio fijo | 12 | 22 | 28 |
| VT2 | Heredada D−1/D−7 | 9 | 14 | 25 |
| VT2 | V13 fijo | 12 | 16 | 24 |
| **VT2** | **V13 aprendido** | **8** | **18** | **29** |
| VT3 | Aleatorio fijo | 1 | 1 | 4 |
| VT3 | Heredada D−1/D−7 | 1 | 1 | 1 |
| VT3 | V13 fijo | 1 | 1 | 2 |
| **VT3** | **V13 aprendido** | **2** | **2** | **2** |
| VT4 | Aleatorio fijo | 0 | 0 | 1 |
| VT4 | Heredada D−1/D−7 | 0 | 0 | 0 |
| VT4 | V13 fijo | 0 | 0 | 0 |
| **VT4** | **V13 aprendido** | **0** | **1** | **1** |

Expectativas aritméticas al elegir K huellas aleatorias por corte con igual número de oportunidades físicas: VT2 **12,34 / 18,33 / 28,34** para Top3/5/10, VT3 **1,24 / 2,04 / 3,92**, VT4 **0,16 / 0,26 / 0,51**. El V13 aprendido no muestra ventaja clara; en VT2 Top3 queda por debajo de control. Importa el **costo real**: una familia física puede cubrir **dos lecturas numéricas**, de modo que topK de figuras NO es automáticamente topK de números/apuestas.

La evaluación es **retrospectiva y exploratoria**: octubre no es holdout virgen porque sus resultados ya habían sido consultados en desarrollos anteriores. Los 45 cortes corresponden a nueve días con dependencia de fuentes previas y figuras persistentes; no afirmar 45 experimentos independientes, significancia ni rentabilidad.

## Conclusión de arquitectura

**La propuesta histórica de especialistas + selector individual + control final es razonable y recuperable**, pero el rendimiento del selector no ha sido validado. V13 renovado necesita bolsa completa de rutas válidas VT0, especialistas V7 (memoria D−7/D−1), V8 (explicación y concentración sin puentes), V9 (vida, reconfirmación y preferencia no obligatoria por C0). V12/V14 no deberían votar por un motor entero: servirían para comprobar cobertura, abstenerse y evitar sustituciones injustificadas solo con validación temporal convincente.

**Próxima investigación:** no seguir acumulando capas kNN/gates sin señal: estudiar **qué rasgos permiten separar físicamente a las familias confirmadas y las no confirmadas dentro de la bolsa previa** con un control por oportunidad, fuente y modalidad; y distinguir dos objetivos (selección de familia y cobertura de lecturas numéricas). Nada de puntajes en producción hasta que se demuestre en validación temporal genuinamente nueva.

## Archivos entregados

- Visor sin objetivos: `auditoria_v13_familias_145/ANTES_LISTAS_PRE_CONGELADAS.html` (no contiene etiquetas POST ni cabezas objetivos).
- Visor POST: `auditoria_v13_familias_145/DESPUES_COTEJO_SELECTORES.html`.
- `INFORME_DETECCION_Y_SELECCION_V13.md`, `UNIVERSO_PRE_EXHAUSTIVO.json.gz`, `DECISIONES_OCT_PRE_FIJADAS.json`, `COTEJO_COMPLETO_TODAS_LAS_HUELLAS.json.gz`, `RESULTADOS_CORTE_Y_MODELO.csv`, `COEFICIENTES_SOLO_DIAGNOSTICO.json`, `CONTROL_SIN_POST_FUTURO.txt`.
- `preparar_decisiones.py`, `cotejar_sin_reajuste.py`, `crear_informe_y_visores.py`, con `fuentes/` completos.
- Tests: conteos geométricos 145/145, identidad reversible, herencia existente, nested top3/top5/top10 540/540, digest inalterado sin POST octubre, pruebas de sintaxis JS, UI PRE y POST con Chromium (cambio fecha/turno/VT/método, selección de huella y SVG), ZIP íntegro verificado.
