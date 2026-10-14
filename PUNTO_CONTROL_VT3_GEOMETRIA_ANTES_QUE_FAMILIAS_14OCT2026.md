# Punto de control — Selección de posiciones ANTES de leer familias VT3
**14/10/2026 · 115 cortes históricos, 23 jornadas · rama `lab-vt3-posiciones-14oct2026`.**

## Qué se ha probado
Cambio de unidad de **selección**, sin alterar motor Lalo. Antes de consultar valores de las posiciones actuales se selecciona una secuencia ordenada de rutas VT3 físicas (tres casillas consecutivas en una sola fuente). Los ancestros son huellas verificadas por cabezas PRE de jornadas anteriores. La candidatura física se reconstruye como producto de `sourceId+firma relativa` histórica y posición actual físicamente disponible; **NO se seleccionan familias por su nombre numérico**. Sólo después de congelar el orden de rutas se leen las ternas y se deduplican familias reversibles. No hay un «acierto de coordenada» observable: sólo se constata coincidencia de las ternas leídas con cabezas publicadas.

Se compararon dos reglas geométricas:
- `GEO_RAICES`: más cabezas históricas independientes por firma+fuente; luego desplazamiento >=2 filas y distancia.
- `GEO_DESPLAZAMIENTO`: privilegia traslado >=2 filas, luego mayor desplazamiento, después cabezas antiguas distintas.
Ambas usan el mismo inventario de rutas y desempates por fuente y coordenadas, NO valores. Control neutral: 2.000 selecciones uniformes de esas posiciones, presupuesto hasta 3/5/10 **familias únicas** (cifras leídas sólo tras elegir posiciones); los mismos cinco resultados por turno.

## Corpus y trazabilidad
- **27.900 rutas físicas** en 115 cortes: todas las rutas del atlas PRE anterior (sin cambiar forma ni fuente).
- **8.053 oportunidades posicionales elegibles** mediante vínculo geométrico fuente+firma con una huella histórica verdaderamente confirmada (sin exigir familia numérica específica).
- 2.168 registros de rootId por corte y 1.151 antecedentes de cabeza histórica distintos contabilizados por corte, no observaciones sorteadas independientes entre cortes.
- Los 115 cortes alcanzaron diez familias distintas tras ordenar la geometría y deduplicar las ternas.
- Archivos `PRE_115.json`, `SELLO.json`, `POST_115.json` y `RESUMEN.json` bajo `auditorias/vt3-posiciones-geometricas-115-14oct2026/`.
- GitHub Action PRE protegido sin `POST_115.json`; luego restaura resultados y corre controles. [Acción final verificada](https://github.com/y0t3/Modelo-Papa/actions/runs/38519912392).

## Resultados por corte (mismo cupo de familias)
| Modelo | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| VT3 oficial | **5** | **8** | **15** |
| Geometría — raíces independientes | 5 | 8 | 14 |
| Geometría — desplazamiento físico | **8** | **9** | 14 |

`GEO_DESPLAZAMIENTO` ganó Top3 en seis cortes donde el oficial no acertó y perdió tres Top3 que el oficial sí había captado. Top10 ganó nueve cortes y perdió diez, por tanto **pierde un corte**. Geometría primero no domina al ranking actual.

Control uniforme por 2.000 repeticiones: Top3 media **3,48**, P95=7 y cola exploratoria >=8: **0,01849**; Top5 media 5,7155, P95=9; Top10 media 10,916, P95=15. **No interpretar 0,01849 como prueba estadística confirmatoria**: fechas y reglas reutilizadas, 2 alternativas de geometría y 3 presupuestos observados, selección múltiple previa, dependencias por jornada.

## Consistencia mensual — hallazgo que limita mucho la hipótesis
| Mes | Cortes | Oficial Top3 | Geometría por desplazamiento Top3 | Oficial Top10 | Geometría Top10 |
|---|---:|---:|---:|---:|---:|
| Septiembre | 70 | 3 | **6** | 10 | 12 |
| Octubre (01–10) | 45 | 2 | **2** | **5** | 2 |

**La ganancia Top3 estuvo toda en septiembre y no se mantuvo en octubre.** Un criterio reproducible en el código puede seguir siendo espurio para los sorteos. No convertirlo en regla de producción por ahora.

## Presupuesto geométrico estricto: impacto de los duplicados
Si se eligen las primeras 3/5/10 rutas físicas *sin rellenar huecos de familias repetidas*, `GEO_DESPLAZAMIENTO` genera, por corte, medias de **3,00 / 4,9478 / 9,6348** familias únicas respectivamente, y consigue Top3 **8**, Top5 **9**, Top10 **13** (frente a 14 cuando se completan 10 familias tras deduplicación). Esto prueba que el número de rutas seleccionadas y el número de apuestas únicas son métricas distintas. Los controles principales utilizan igual presupuesto de 3/5/10 familias únicas que el ranking oficial.

## PRE genuino, separado
La idea posicional queda congelada **para la Previa del 14/10**, sin conocer ninguna cabeza objetivo. Su PRE independiente se generó a las **03:01:46 ART** en [GitHub Actions #38519816300](https://github.com/y0t3/Modelo-Papa/actions/runs/38519816300) con rama `prospectivo-vt3-posiciones-previa-14oct2026`, respetando los PRE auténticos anteriores.

En ese corte: 72 rutas físicas posibles en la única columna disponible, 21 posiciones elegibles desde cinco recorridos históricos verificados, cuatro eventos antiguos independientes. Las dos políticas geométricas convergieron al **mismo** Top3: `458/854`, `063/360`, `354/453`; no contarlas como dos predicciones independientes. Oficial auténtico Top3: `063/360`, `036/630`, `033/330`. Control hash de posiciones Top3: `364/463`, `448/844`, `458/854`.

**Siguiente criterio de evaluación:** cotejar prospectivamente esas tres líneas ya selladas, contar coincidencias de familias VT3 sobre cinco cabezas (no coordenadas no observadas) y comparar Top3/5/10 sin reescribir sellos. Exigir repetición en más de un sorteo nuevo para interpretar cualquier aparente beneficio.

## Decisión
- Conservar **el principio geométrico primero** como laboratorio paralelo: técnicamente es viable y cambia positivamente ciertos resultados históricos.
- No modificar `main`, `src/motorLalo.ts`, elección oficial VT3, VT4, visual de hoja +11, marcado automático, APK o sellos existentes.
- **No afirmar ventaja predictiva**: el cambio Top3 es históricamente inestable. Las loterías son aleatorias; la geometría de la hoja es construcción de resultados pasados y no altera probabilidades del sorteo siguiente.
