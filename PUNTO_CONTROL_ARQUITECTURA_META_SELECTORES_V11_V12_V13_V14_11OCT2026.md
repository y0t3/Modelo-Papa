# Auditoría arquitectónica VF antiguo V7/V8/V9/V11/V12/V13/V14 → Modelo Papá (11/10/2026)

**Propósito:** recuperar la intención real del diseño en capas (proponentes → selectores → top10/top5/top3), evaluar fallos verificables y proponer rescate experimental. **Solo documentación en rama `auditoria-sorteo-10oct-2026`; no se modificó main, APK ni ningún módulo de producción.**

## Intención y composición real que se recuperó

| Versión | Papel | Evidencia |
|---|---|---|
| V7 | Generar ternas VT3 con +11, patrones de frecuencia histórica | `VF-Quiniela/src/engine.ts`, `motor_v7.py`. Todos los motores posteriores heredaban `candidatos`, con cruces no permitidos entre pares de turno |
| V8 | Priorizar por contacto con primera fuente Nocturna anterior, cobertura de fuentes, horizontalidad y caminos | Pesos originales .55/.30/.05/.10, ranking sobre rutas dirigidas V7 |
| V9 | Aparición/persistencia/convergencia entre fuentes, con bonus primera fuente | Pesos fijos, `persist` sobre tableros acumulados; sin aprender de reconfirmaciones de cabezas |
| V11 | Selector global: **elige V7, V8 o V9**, por `kNN(k=40)` a partir de telemetría del **primer candidato** de cada motor; entrega íntegra la lista del elegido | `v11Action`, `calcularVF` |
| V12 | **Regime Gate** experimental para proteger V7 de switches de V11; evidencia previa consigna k=120, gate=0.005, ancla V7. **No encontrado como código en el repo VF final.** | `02_resultados_v12.csv` y anteriores registros históricos. Ene–Ago 2026 V7=30, V11=32, V12=34; cambios V11 242, V12 121. Septiembre V7=8, V11=5, V12=7; cambios V11 35, V12 23. No afirmar superioridad sobre V7 en septiembre. |
| V13 | **Meta-ranker por candidato** sobre unión de **Top10** V7, V8, V9 (a lo sumo 30; muchos duplicados); características: posiciones, presencia, consenso entre motores y z-scores, kNN(k=180) | `v13Rank`, training 2024Q2–Q3. V13 no ve ninguna familia descartada por los tres filtros Top10 |
| V14 | **Gate final** kNN(k=350) sobre tres *acciones*: conservar lista V7 / lista de motor elegido por V11 / nueva lista V13, con protección umbral .01 frente a V7 | `v14Action`, `calcularVF` |

**Punto de arquitectura crítico:** `calcularVF` realmente arma `final` como **una** lista Top5 íntegra de V7, del motor elegido por V11, o de V13. `top2 = final.slice(0,2)`. No hay **Top3 entrenado ni optimización conjunta de Top10→Top5→Top3** en el VF final; el primer nivel V13 sí reordenaba candidatos individuales, pero al final el gate reemplazaba listas completas. El Modelo Papá moderno posee un TOP3/5 heurístico propio y distinto.

**Origen del error en común:** los Top10 V7/V8/V9 se derivan de un mismo enumerador V7 que permitía cruces entre columnas y de un V9 que confundía persistencia física con reconfirmación por cabezas. Un meta-selector no corrige falta de candidatos, geometría contaminada o evidencia correlacionada. El caso 393 de Primera Ciudad 10/10: fue top1 V8 por dos lecturas de un único puente prohibido (con empate de score). En 29 Primeras V8 original 1/29 top1 y V8 sin cruces 0/29; no prueba una ventaja repetible.

## Entrenamientos realmente inspeccionados en archivos históricos

Se leyeron CSV originales con `csv.DictReader` **sin transformar ni entrenar datos**:

- `vf_v11_training_2025.csv`: **1.457 cortes** (304 fechas de 2025); positivos Top5: V7 **40 (2,75 %)**, V8 **36 (2,47 %)**, V9 **41 (2,81 %)**. k=40 con eventos positivos raros puede dar decisiones volátiles.
- `vf_v13_training_2024_q2_q3.csv`: **18.182 filas de candidatos**, **96** con `y=1` (**0,528 %**), 729 grupos fecha/turno, 91 grupos con al menos un candidato positivo. La tasa muy baja hace que k=180 tenga en promedio menos de un caso positivo en un barrio de similar prevalencia. La etiqueta `y` representa acierto de candidato numérico, NO una huella física validada bajo Modelo Papá, y `sources` es la cantidad **de motores que lo listan**, NO la cantidad de fuentes/celdas +11 independientes.
- `vf_v14_training_2025_eneago2026.csv`: **2.417 cortes**, 504 fechas desde enero 2025 hasta agosto 2026; positivos de acciones V7 **70**, V11 **73**, V13 **72** (todas ~3 %). El archivo de entrenamiento incluye explícitamente Ene–Ago 2026, de modo que NO puede llamarse evaluación independiente de V14 sobre el mismo período **salvo que se acredite cálculo out-of-fold/entrenamiento truncado en cada evento**. `V14` (evaluación histórica) tiene valores no vacíos en solo **960 filas**; no equiparar ausencia con negativos.
- `02_resultados_v12.csv`: 2 filas resumidas; no da rutas ni decisiones evento por evento. Documentar V12 como *experimento con resultados* y no fingir reconstrucción exacta de su código.

Los modelos fueron entrenados para `V?_T5`, `y` y `A_V?` = **éxito de números / terminaciones**; **NO** etiqueta moderna `sourceId+VT+huella canónica reversible` confirmada en cualquier orientación. Se necesita remapear etiquetas y reconocer familias, a la vez que se mantiene un recuento comparable de lecturas/dígitos para no inflar oportunidades por inversión.

## Evaluación de diseño

**La arquitectura de especialistas y decisión por candidato fue acertada conceptualmente.** Falló principalmente por:
1. **Candidato vs motor:** V11/V14 escogen una lista completa; el posible buen candidato aislado de otro motor queda descartado.
2. **Censura prematura:** V13 solo considera candidatos ya presentes en los tres Top10; lo descartado no puede recuperarse aguas abajo, aunque tenga buena huella física.
3. **Geometría y procedencia:** caminos inter-turno no permitidos, sentidos inversos duplicados como caminos, métricas de cobertura de motores dependientes de un mismo enumerador V7, persistencia acumulada confundida con reconfirmación verdadera.
4. **Objetivos de aprendizaje:** predicción numérica de 3 cifras no equivale a selección física VT2/VT3/VT4 que define nuestro Modelo Papá. Inversión válida es acierto por familia, pero informar además sentido y costo efectivo de cubrir ambas lecturas.
5. **Capa estadística/validación:** tasas muy bajas, kNN y scores llamados `conf` y `EV` sin calibración estadística verificada, tuning post-hoc, muestras altamente correlacionadas entre turnos/días; V14 usa entrenamiento que abarca el tramo previo de validación.
6. **C0 de V9:** si Nocturna anterior aparecía más en un día era en gran parte porque estuvo disponible durante cinco turnos; medir por fuente y oportunidad, hipótesis flexible sin bonus fijo.

## Arquitectura experimental corregida y fases

**A. Hoja +11 íntegra y geométrica VT0.** Generar exhaustivamente TODOS los caminos legítimos VT2/VT3/VT4, dentro de la fuente, contiguos, sin reuso ni huecos, identidad canónica reversible. Cabezas completas y D−1/D−7 solo antecedentes verificables. Los puentes V8 son un diagnóstico **aparte**, nunca VT válida.

**B. Especialistas independientes y transparentes (no votantes numéricos):**
- V7-vigía: antecedentes de figuras D−7, D−1 y recurrencia exacta en hoja comparable.
- V8-vigía: recuentos de huellas físicas distintas, formas, orientación y concentración por fuente; comparables por oportunidad física; cruces inválidos en panel diagnóstico separado.
- V9-vigía: bitácora `NACE / SIGUE DISPONIBLE / CONFIRMADA / RECONFIRMADA` por fuente y huella; C0 primera fuente como hipótesis opcional y explicable, no obligatoriedad.

**C. Bolsa universal de FAMILIAS con evidencia.** No cortar en top10 antes de la selección. Una única ficha por `fecha|turno|sourceId|VT|huella canónica`, con lecturas directa/inversa, antecedentes, confirmaciones anteriores y denominador de oportunidades. Cada especialista añade *razones* a la misma ficha, pero no votos falsamente independientes.

**D. V13 renovado: selector por figura/candidato.** Decide Top10 de familias, luego Top5 y Top3 **anidados**, con capacidad real de abstenerse `OBSERVAR/NO JUGAR`. Registrar candidatos descartados, cambios y empates; nunca premiar una familia por duplicar sus dos sentidos. Si se entrena, exigir especificación de selección de geometrías o lectura numérica y reglas para comparar presupuestos (una familia puede cubrir 1 o 2 números).

**E. V12/V14 renovado: árbitro de intervención y seguridad**, no elección de motor entero. Decide si la evidencia basta para publicar listas cortas y si hace falta anular una sustitución injustificada, conservando el desempeño de un baseline fijo. Sin umbral adaptado según resultado objetivo.

**F. Prueba sin fugas:** separación cronológica por jornada completa; generar PRE y congelar hash antes de POST. Entrenar solo con fechas previas, evaluación en días posteriores con walk-forward/out-of-fold para niveles apilados (evitar que V14 vea predicciones de V11 formadas con entrenamiento del mismo período), controles aleatorios equiparados por fuente/VT/costo de lectura. Métricas `recall candidatas`, `acierto de huella exacta independiente del sentido`, `acierto numérico`, top3/top5/top10 anidados, abstenciones y falsos positivos. Los resultados 2024–2026 ya utilizados son análisis exploratorios, no validación futura virginal.

**Decisión:** rescatar arquitectura en laboratorio con **una fase adicional por candidato**, no sumar automáticamente los pesos antiguos. Ningún cambio del motor oficial, selector de producción, `main` ni APK.