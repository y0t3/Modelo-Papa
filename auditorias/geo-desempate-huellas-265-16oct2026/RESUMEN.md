# Desempate local de Geometría completa con huellas históricas

**Laboratorio finalizado · 16/10/2026 · no modifica APK ni motores estables.**

## Objetivo
Comprobar si las cabezas históricas ganadoras que explican **el recorrido físico testigo** permiten desempatar entre puestos 3, 4 y 5 de Geometría completa sin cambiar ni el 1.º ni el 2.º y sin pasar de tres familias por turno.

## Protocolo
- 53 jornadas (15/08–15/10), 265 cortes PRE reconstruidos, 1325 cabezas de cinco jurisdicciones argentinas. Montevideo alimenta la hoja cuando corresponde.
- Una raíz equivale a una cabeza completa comprobada `fecha|turno|jurisdicción|cabeza`; sus múltiples trazos no se contabilizan como eventos independientes.
- Para vincular una raíz a un testigo del ranking se exige la misma **fuente y forma geométrica**; los recorridos reales permanecen dentro de una columna con celdas adyacentes.
- Se compararon las posiciones cercanas **sin incorporar cabezas posteriores al corte al ranking**. Se contaron resultados solo al finalizar la reconstrucción.
- Los algoritmos oficiales no fueron editados. El Top3 original permanece reproducido exactamente.
- Las variantes fueron propuestas sobre un corpus **ya estudiado**; no son un experimento ciego independiente ni predicciones selladas en tiempo real.

## Primera serie: requisitos estrictos
1. Reemplazar el puesto 3 por el 4 si tienen igual fuente y forma, el tercero carece de raíz y el cuarto posee ≥1.
2. Considerar puestos 4 y 5 con misma fuente y forma y ≥2 cabezas históricas independientes, siempre que el tercero carezca de raíz.
3. Considerar puestos 4 y 5 de la misma fuente y ≥2 raíces, siempre que el tercero carezca de raíz.

**Resultado: 0 cambios y 11 aciertos Top3**, idéntico al original en los 265 cortes.

**Por qué:** en **257/265** cortes el tercero ya tenía al menos una raíz histórica; en los otros ocho el cuarto y quinto carecían de respaldo propio suficiente. Además, los recorridos representantes de tercero, cuarto y quinto no compartían una forma idéntica entre sí, por lo que exigir ese empate literal tampoco producía sustituciones.

## Segunda serie: ventaja relativa de dos raíces
Se fijó una regla más informativa **antes de evaluar qué cabezas acertaban**: mantener 1.º y 2.º; elegir la primera entre 4.º y 5.º que tenga **al menos dos cabezas históricas independientes más que el 3.º**, siempre que provenga de la misma fuente del recorrido representante. Cada ruta de la candidata entrante debe estar individualmente respaldada por la misma forma histórica, sin prestarle raíces de otra familia.

| Período | Cortes PRE | Top3 original | Top3 con desempate | Cambios de tercer puesto |
|---|---:|---:|---:|---:|
| 15/08–14/09 | 130 | 1 | 1 | 3 |
| 15/09–15/10 | 135 | 10 | 10 | 5 |
| **Total** | **265** | **11** | **11** | **8** |

- Los tres cambios del primer período corresponden al **27/08 (Previa, Primera, Matutino)**: 229/922 cede por 182/281, con una raíz vs tres, sin ninguna ganadora afectada.
- Los cinco del segundo período se concentran en **26/09 (Previa, Primera, Matutino, Vespertino, Nocturno)**: 002/200 cede por 040/040, también una raíz vs tres.
- En Nocturno del 26/09 ya había un acierto de otra familia entre los primeros dos puestos; permanece un acierto antes y después del cambio. **No hubo ganancias ni pérdidas** de cabeza por turno.

## Conclusión
Las cabezas históricas verificadas aportan **explicaciones físicas concretas**, pero los desempates ensayados no mejoraron la ubicación de familias ganadoras en estos 265 cortes. Incluso con una ventaja de **dos** antecedentes comprobados, el cambio no generó aciertos.

- **No modificar** Geometría, Modelo Lalo MV1 ni APK 0.3.5.
- No extender arbitrariamente la búsqueda a puestos más bajos conociendo ya los ganadores.
- Próximo estudio útil: **comparar los recorridos y las familias efectivamente acertadas frente a las formas priorizadas y no priorizadas**, estudiando qué rol juegan orientación, desplazamiento y fuente, con denominadores de todas las candidatas físicas. Evaluar en un bloque distinto cualquier cambio de prioridad antes de adoptarlo.
- Distinguir resultados retrospectivos de validación prospectiva. Estos aciertos de 3 cifras no implican éxito en 4 cifras ni probabilidad fiable al apostar.

## Evidencias
- Prueba GitHub Actions: https://github.com/y0t3/Modelo-Papa/actions/runs/38853800854
- Artefacto `HUELLAS-GANADORAS-265-CORTES`: `GEOMETRIA_DESEMPATE_HUELLAS_265_CORTES.json` y `GEOMETRIA_HUELLAS_GANADORAS_265_CORTES.json`.
- Código experimental: `scripts/lab-geo-tiebreak.ts`, integrado únicamente en `scripts/lab-geo-roots-265.ts`.
