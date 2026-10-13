# Punto de control · Independencia física de raíces VT3, 115 cortes

**13/10/2026. Laboratorio ejecutado en GitHub Actions** en la rama `lab-raices-independientes-13oct2026`, derivada de `modelo-lalo-motor-unificado-vt234`. No se modifican `main`, `src/motorLalo.ts`, el ranking productivo, la APK ni el tablero +11.

## Ejecución reproducible
- Código: `scripts/auditar-independencia-raices-115.ts`.
- Workflow: `.github/workflows/lab-raices-independientes-115.yml`.
- Ejecución final: https://github.com/y0t3/Modelo-Papa/actions/runs/38343071308
- Artefacto temporal: https://github.com/y0t3/Modelo-Papa/actions/runs/38343071308/artifacts/11787233971 (los artefactos de Actions tienen plazo de retención).
- Base histórica: 30 días crudos, SHA256 de contenido descomprimido `7e393c54b073cae83ae972b8511e533b61fbc087fe574a8dde84ae9100530217`.
- Se ejecutó `replay-lalo115.ts prepare`, se extrajo `OBJETIVOS_POST_115.json` del área de trabajo, se calculó la clasificación PRE y sólo después se restauró POST para comparación.
- Registro de GitHub: `INDEPENDENCIA_PRE_OK 115 cortes`, `INDEPENDENCIA_POST_OK`, workflow correcto y artefacto emitido.
- Control del ranking oficial reproducido: VT3 Top3 **5/115**, Top5 **8/115**, Top10 **15/115**.
- Las 6.389 exposiciones familia×corte contienen 64 coincidencias elegibles POST, distribuidas sobre 46 cortes con alguna familia VT3 ganadora en la bolsa completa.

## Regla física
Todos los caminos se conservan y verifican: tres celdas sin repetición, movimientos horizontales/verticales/diagonales adyacentes, misma fuente, lectura reversible exacta. Una misma tripleta de casillas es un solo bloque físico aunque exista más de una lectura o dibujo.

Cada familia se describe por:
- número de eventos históricos distintos `(fecha, turno, jurisdicción, cabeza completa)`;
- bloques de origen `(fecha histórica, fuente, conjunto de 3 celdas)`;
- bloques actuales `(fuente, conjunto de 3 celdas)`;
- número de fuentes físicas; y procedencia D−1/D−7.

Las clases son excluyentes con prioridad D→C→B→A: D, más de una fuente; C, varios bloques actuales en una sola fuente; B, antecedentes históricos distintos confluyendo en un solo bloque actual; A, una sola raíz/bloque actual. Ninguna clase implica una predicción en sí.

## Resultados observacionales — misma bolsa y mismos tops

| Clase | Exposiciones | Coincidencias POST | Referencia proporcional dentro de la bolsa PRE |
|---|---:|---:|---:|
| A: una raíz y bloque actual | 2.895 | 31 | 29,138 |
| B: varias raíces, mismo bloque actual | 642 | 4 | 7,103 |
| C: varios bloques actuales, una fuente | 2.614 | 29 | 25,210 |
| D: varias fuentes | 238 | 0 | 2,550 |
| **Total** | **6.389** | **64** | **64,001 (redondeo)** |

La referencia por corte es `elegibles_del_corte × tamaño_del_grupo / tamaño_de_bolsa`; no es control causal, independencia estadística ni probabilidad de ganar. Los 115 cortes y 23 jornadas se han reutilizado en numerosos ensayos. Los grupos A–D NO son observaciones independientes.

## Subdivisión del grupo C
| Bloques actuales en una fuente | Exposiciones | Coincidencias | Referencia | Coincidencias en exposiciones Top10 |
|---|---:|---:|---:|---:|
| Una cabeza histórica | 1.558 | 14 | 14,660 | 7 |
| Varias cabezas históricas | 1.056 | 15 | 10,549 | 10 |

Dentro de los **1.056** registros con varias cabezas:
- **1.046** también proceden de *bloques históricos distintos*: 15 coincidencias frente a referencia 10,367; 10 exposiciones Top10 coincidentes.
- Sólo **10** tenían varias cabezas sobre un único bloque histórico: 0 coincidencias frente a 0,182 esperadas.

La diferencia para cabezas y bloques históricos distintos es **una pista exploratoria**, no prueba de mejora. No se estima significación; el número de hipótesis previas y la correlación por turnos impiden inferencias confirmatorias.

## Nocturna 12/10/2026 (validación separada)
Sello PRE previo al sorteo: https://github.com/y0t3/Modelo-Papa/actions/runs/38313639450 , 12/10 18:56 hora argentina. Las cinco cabezas nocturnas del 12/10 fueron Ciudad 9851, Provincia 1615, Córdoba 7242, Santa Fe 8290, Entre Ríos 3264, corroboradas por fuentes publicadas con fecha explícita. **VT2, VT3 y VT4: cero cortes con familia ganadora en Top10**, un corte evaluado para cada modalidad. Aún no se midió su cobertura fuera de Top10 desde el archivo PRE sellado. No mezclar con los 115 históricos ni reajustar criterios según este desenlace.

## Decisión y siguiente ensayo
No bonificar automáticamente cantidad de fuentes ni raíces; no mover los Tops oficiales. En la siguiente prueba, comparar **familias VT3 con múltiples bloques antiguos y actuales realmente distintos** frente al criterio original al seleccionar exactamente diez madres y comprobar si la puerta VT4 genera hijas ganadoras físicamente posibles sin préstamos de recorridos. Debe hacerse con PRE congelado, POST separado, controles de densidad y nuevos cortes prospectivos. Conservar todos los negativos.

**Advertencia:** estos números son descriptivos sobre resultados de azar y no acreditan poder de pronóstico ni justifican apuestas.
