# Aplicabilidad del híbrido 7+3 a VT3 Lalo (+11) — 31/10/2026

**Estado:** estudio de laboratorio **terminado**, tres verificaciones automatizadas exitosas. Rama: `lab/lalo-vt3-7mas3-formas-31oct2026`. **No se modifica MV1, la app ni la APK.**

## Pregunta

El laboratorio AUX había mostrado una mejora retrospectiva al conservar siete candidatas Top10 y reemplazar las tres últimas con familias del puesto 21 en adelante, priorizadas por antecedentes físicos. ¿Se reproduce el efecto en el **VT3 del tablero principal +11 de Lalo**, con sus propias reglas y antecedente geométrico?

## Diferencia de método: no copiar recorridos AUX

- El original `buildMotorLalo` ya toma ganadoras D−1 y D−7, proyecta sus figuras dentro de la **misma columna** de la hoja +11, registra bifurcaciones (compartir borde) y deduplica cabezas ganadoras independientes.
- **Nunca** usar trayectorias cruzando columnas en +11. La columna de la Nocturna anterior está disponible para Previa; las de Previa/Primera/Matutino/Vespertina se incorporan progresivamente **antes** del turno siguiente.
- Ya existe en `src/motorFormasPrimero.ts` un selector independiente `buildFormFirstMotor`: clasifica **posiciones y formas físicas**, con referencia a ganadoras verificadas de **seis jornadas anteriores**, **antes de leer los dígitos actuales**. El nuevo ensayo reutiliza esa implementación y la misma familia reversible VT3, sin introducir otra geometría.
- **Top10 original**, **Formas Primero Top10**, y seis híbridos de igual presupuesto: 9+1 y 7+3 candidatos, con familias (A) de **puesto 21+**, (B) **sin posición en MV1**, o (C) ambos grupos. Todos se filtran a familias realmente formables y con respaldo entre las primeras 100 propuestas de Formas Primero. Si no hay suficientes candidatas, quedan los lugares históricos restantes.
- Para cada combinación, **cinco controles neutrales** eligen el **mismo número de sustituciones** entre exactamente **las mismas familias elegibles** que podría haber elegido Formas Primero; no cambia la inversión de diez familias por corte. PRE reconstruido. POST solo compara cabezas ganadoras cuando ya están seleccionadas las listas.
- Solo cinco jurisdicciones evaluadas por turno, sin Montevideo en resultados. Se descartan 20/06 y 09/07 por datos incompletos. **119 jornadas completas:** 77 junio–agosto, 42 septiembre–octubre 12–29; 595 cortes (5 turnos diarios). El viernes 30/10 se evalúa **aparte**, al conocerse ya antes de formular esta hipótesis.
- Los datos se descargan de la misma fuente que la app y usan `nocturnaAnteriorPorJur` y `preSheetAtCut`, como los anteriores estudios de Lalo.

## Resultado VT3 Lalo (119 jornadas, 595 turnos)

| Selección de hasta 10 familias | Previa–Matutino: 357 cortes | Vespertina–Nocturna: 238 cortes | Total |
| --- | ---: | ---: | ---: |
| **Top10 MV1 original** | **34** | **14** | **48** |
| **Formas Primero independiente** | 35 | 21 | **56** |
| **7 originales + 3 del puesto 21+** | 34 | 17 | **51** |
| **7 originales + 3 formables sin puesto MV1** | 39 | 16 | **55** |
| **7 originales + 3 de ambos grupos** | 36 | 18 | **54** |
| Control neutral del 7+3 puesto 21+ (media 5) | 34,4 | 17,6 | **52,0** |
| Control neutral del 7+3 sin puesto (media 5) | 38,2 | 15,8 | **54,0** |

**La variante 7+3 específica que funcionó mejor en AUX (puesto 21+) NO se reproduce en Lalo:** solo +3 coincidencias frente a MV1 y está por debajo del control neutral (+4,0 frente a MV1). En cambio, elegir familias sin puesto da +7 frente al original, pero apenas +1 frente al control neutral, sin ventaja probada.

La mayor cantidad de coincidencias de `Formas Primero` de la propia +11 (**56**) es una referencia interesante y **sin mezclar motores**, aunque también se ajustó/estudió retrospectivamente y no es ventaja prospectiva validada.

### Contraste temporal: no persiste en el segundo tramo

| Método | Junio–agosto (77 días) | Septiembre–29 octubre (42 días) | Total |
| --- | ---: | ---: | ---: |
| MV1 Top10 | 31 | **17** | **48** |
| Formas Primero Top10 | **40** | 16 | **56** |
| 7+3 puesto 21+ | 35 | 16 | 51 |
| 7+3 sin puesto | **42** | 13 | 55 |
| Control neutral 7+3 sin puesto (media de 5) | 38,0 | 16,0 | 54,0 |

**La variante 7+3 sin puesto pierde 4 coincidencias frente al Top10 original en septiembre–octubre** (13 vs 17), pese a mejorar en junio–agosto (+11). Eso impide recomendarla como prioridad automática.

### Variabilidad al agrupar resultados por jornada completa

Bootstrap descriptivo de **10.000 remuestreos por día**, cinco turnos de una fecha agrupados:

| Selección | Diferencia frente a MV1 | Intervalo orientativo 95 % |
| --- | ---: | ---: |
| 7+3 de puestos 21+ | **+3** | −8 a +14 |
| 7+3 sin puesto | **+7** | −3 a +17 |
| 7+3 mixto | **+6** | −5 a +16 |

Todos los intervalos incluyen 0, sin corrección por múltiples variantes ni selección retrospectiva. La independencia entre fechas y las probabilidades individuales no están demostradas.

## Por qué la cobertura no prueba predicción

Las 753 apariciones de cabezas VT3 que eran físicamente formables en la +11 (119 jornadas, 595 turnos) se reparten en:

| Clase MV1 | Ganadoras que tenían recorrido |
| --- | ---: |
| Top10 | 48 |
| Puestos 11–20 | 62 |
| Puestos 21+ | 168 |
| Formables sin ranking MV1 | **475** |

Es una clasificación del **POST** por su posición PRE. El último grupo es amplísimo y domina porque contiene muchos más candidatos posibles; no equivale a una prioridad predictiva demostrada. Las exposiciones de familias por corte también fueron medidas y quedan en los archivos JSON.

## Viernes 30/10, corte independiente (1 día conocido)

| Momento | Cabezas VT3 físicamente formables en +11 | MV1 | Formas Primero | Cualquiera de los 6 híbridos |
| --- | ---: | ---: | ---: | ---: |
| Previa, Primera, Matutina | 1 | 0 | 0 | 0 |
| Vespertina, Nocturna | 3 | 0 | 0 | 0 |
| **Total** | **4** | **0** | **0** | **0** |

Ejemplos formables: Matutina Ciudad **4888** (VT3 888, ranking #30), Vespertina Córdoba **2197** y Entre Ríos **3276** (sin puesto), Nocturna Córdoba **4182** (sin puesto). No hubo rescates reales el viernes.

Advertencia: el día 30 ya había sido observado antes de diseñar el híbrido; no constituye un ensayo ciego de esta variante.

## Decisión

**Aplicable desde el punto de vista técnico, no validado como una mejora predictiva de VT3 Lalo.** No trasladar el 7+3 de AUX al motor oficial de Lalo. Esta prueba deja abierta la investigación de un enfoque complementario de **sitios físicos** desde Formas Primero, y especialmente la dispersión de las familias formables sin ranking histórico, pero recomienda conservar las diez candidatas MV1 originales en producción.

Además, reemplazar madres VT3 altera potencialmente las derivadas VT2/VT4: ninguna prueba debe moverlas automáticamente sin auditar genealogía, prefijo de cuarta cifra y presupuesto conjunto. El laboratorio actual **solo mide VT3** y deja esas derivadas intactas.

## Reproducibilidad

- `src/labLalo7mas3VT3.ts`: clasificador por fuente y selector Top10 con cupos de sustitución y controles pareados.
- `scripts/test-lalo-vt3-7mas3.ts`: valida presupuesto, clasificación, de-duplicación y estabilidad del Top original.
- `scripts/lab-lalo-vt3-7mas3.ts`: PRE reconstruido por turno, comparación exacta por cabeza, registro del embudo y cambio candidato por candidato.
- `.github/workflows/lab-lalo-vt3-7mas3.yml`: tres períodos con regresión del motor Lalo y de Formas Primero.
- [GitHub Actions, corrida completada](https://github.com/y0t3/Modelo-Papa/actions/runs/41173951254), tres jobs **success**, con artefactos JSON `lalo-vt3-7mas3-*`.
