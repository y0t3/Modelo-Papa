# Punto de control: posición #3 VT3, control geométrico con las mismas 10 familias

**13/10/2026; rama de laboratorio** `lab-vt3-tercer-puesto-geometria-13oct2026`.
GitHub Actions [#38502975146](https://github.com/y0t3/Modelo-Papa/actions/runs/38502975146): completada correctamente. El primer intento falló por una carpeta de salida ausente, se reparó la inicialización y se ejecutó correctamente el ciclo PRE→SELLO→POST. El motor original, la app, `main` y los sellos anteriores no cambiaron.

## Protocolo comparativo exacto

Cada corte mantiene **exactamente las mismas diez familias VT3**, los mismos recorridos y las mismas raíces. Se conservan #1 y #2 y se selecciona la tercera entre las ocho madres elegibles #3–#10; las demás se desplazan sin suprimir familias. Por eso todos los Top10 equivalen **por definición** al oficial. Objetivo: **orden de VT3**, no admisión, no inventar geometría y no agregar números.

Se reconstruyeron 115 cortes. Se verificó el hash de la fuente PRE `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`; se escondieron los objetivos y fixture antes de generar y comprometer `PRE_115.json` y `NEUTRAL_PRE_5000.json`. Se reveló POST sólo después. Se comparó contra 5000 terceros elegidos neutralmente desde la misma bolsa de ocho familias, por corte.

| Política tercer puesto | Cortes con Top3 ganador | Cortes con Top5 ganador | Cortes con Top10 ganador | Veces tercera familia ganadora |
|---|---:|---:|---:|---:|
| Oficial | 5 | 8 | 15 | 0 |
| Puesto #5 fijo (control **post hoc**) | **8** | 8 | 15 | **4** |
| Mayor respaldo D−1 propio | **8** | **9** | 15 | 3 |
| Mayor respaldo D−7 propio | 6 | 6 | 15 | 1 |
| Más antecedentes independientes de #1 y #2 | 7 | 8 | 15 | 2 |
| Mayor variedad de formas físicas | 6 | 8 | 15 | 1 |
| Persistencia intradía | 6 | 8 | 15 | 1 |
| Más rutas ancladas desde la fuente más reciente | 7 | 8 | 15 | 2 |
| Hash neutral fijo | 6 | 7 | 15 | 1 |

### Casos recuperados por mayor D−1

- **15/09 Matutino**: entra una familia ganadora que era elegible entre las diez originales.
- **29/09 Matutino**: segunda familia ganadora recuperada.
- **05/10 Matutino**: tercera familia ganadora recuperada.

En 69/115 cortes el criterio D−1 cambió realmente el puesto #3. Como el tercero oficial había tenido **cero** coincidencias, las pérdidas Top3 frente al Top oficial son automáticamente cero para cualquier intercambio que conserve los dos primeros; **ese resultado no demuestra que el nuevo tercero sea mejor**.

### Controles neutrales

Los 5000 controles recuperaron en promedio **6,3816** cortes Top3, con percentiles 5–95 entre **5 y 8**. Un total de **777/5000** controles alcanzaron 8 o más (probabilidad empírica suavizada **778/5001 ≈ 0,1556**). En el máximo hubo 11/115. Por lo tanto, el Top3 8/115 de mayor D−1 (y del control #5) **no es evidencia robusta de una ventaja predictiva**.

**Partición temporal:** D−1 produjo cinco Top3 en septiembre (vs tres oficiales) y tres en octubre (vs dos oficiales). Siguen siendo cortes históricos utilizados reiteradamente en análisis previos, no test externo.

### Decisión

Conservar la política oficial VT3 sin cambios. Congelar como única **challenger experimental** para prueba prospectiva el criterio de mayor respaldo D−1, únicamente para **la tercera plaza**. Mantener dos primeros puestos oficiales, universo Top10 igual, desempate por D−7 propio, bloques físicos, rango original. Acompañar obligatoriamente el control neutral fijo (hash) y baseline oficial. Registrar la selección antes del próximo sorteo y sólo evaluar tras conocer las cabezas, sin optimizar sobre los sorteos nuevos hasta completar un tramo fijo.

El puesto #5 fijo debe mantenerse sólo como placebo retrospectivo post hoc, **no** se propone como challenger. Estos datos no permiten una inferencia causal entre las raíces D−1 y la próxima quiniela.

Archivos: `PROTOCOLO_VT3_TERCER_PUESTO_GEOMETRIA_13OCT2026.md`; `scripts/lab-vt3-tercer-puesto-geometria.mjs`; `auditorias/vt3-tercer-puesto-geometria-115-13oct2026/{PRE_115.json,NEUTRAL_PRE_5000.json,SELLO.json,POST_115.json,RESUMEN.json,LECTURA.md}`.
