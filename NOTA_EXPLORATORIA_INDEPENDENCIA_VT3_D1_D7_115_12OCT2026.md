# Modelo Lalo — Auditoría exploratoria de independencia VT3 (D−1 / D−7)
**12/10/2026 · Continuación del checkpoint PUNTO_CONTROL_LALO_VT3_RENOVACION_VT4_MISMAS_10_MADRES_115_12OCT2026.md.**

## Alcance y resguardo
No se cambiaron el motor Lalo activo, la APK, el marcado automático ni los rankings. Este documento registra un estudio observacional PRE/POST sobre los **mismos 115 cortes/23 jornadas** de septiembre-octubre. Se excluyeron los cuatro cortes del 12/10 que también aparecían en los visores, para no mezclarlos con la muestra retrospectiva congelada. Los resultados POST se utilizaron **sólo para cotejo**, no para crear candidatos PRE. Sin validación prospectiva.

## Control de integridad y universo
Fuentes leídas de los archivos de proyecto:
- `VISOR_APOYO_VT3_PRE.html` y `VISOR_APOYO_VT3_POST.html`: la variable integrada `rows` contiene 119 cortes en total, 115 históricos + cuatro del 12/10.
- `VISOR_TRAMOS_VT3_PRE.html`: conserva bordes heredados, alternativas y raíces D−1/D−7, pero es un **observatorio de alternativas**, no el testigo individual del motor para toda familia.
- Informe congelado: `INFORME_RENOVACION_VT3_VT4.md`.

En 115 cortes hay 6.389 exposiciones familia×corte: 690 inicio, 4.563 mismo respaldo, 1.042 familias nuevas del turno y 94 que agregaron fuente. Los objetivos POST coinciden con **64 exposiciones ganadoras elegibles**; Top3 5/115 y Top10 15/115 (Top10 acumula 17 exposiciones de familia ganadora, pero sólo 15 cortes distintos).

## Una primera lectura temporal, sin atribuir independencia física
| Raíces visibles | Exposiciones familia×corte | Exposiciones con coincidencia POST | Esperanza condicionada uniforme dentro de cada bolsa/corte |
|---|---:|---:|---:|
| Sólo D−1 (d1Roots>0 y d7Roots=0) | 2.734 | 33 | 26,32 |
| Sólo D−7 (d1Roots=0 y d7Roots>0) | 2.598 | 23 | 27,66 |
| Ambas (d1Roots>0 y d7Roots>0) | 1.057 | 8 | 10,02 |
| Total | 6.389 | 64 | 64,00 |

Referencia nula exploratoria: por cada corte se sumó `objetivos elegibles × tamaño de la clase / tamaño de bolsa`. No es una probabilidad válida de acertar números ni ajusta la búsqueda de hipótesis; los 6.389 registros no son independientes entre sí.

Otros cortes descriptivos: 238 exposiciones con ≥2 fuentes físicas, 0 coincidencias frente a expectativa exploratoria 2,55; 1.935 exposiciones con ≥2 raíces D−1/D−7 sumadas, 19 coincidencias frente a 20,20 esperadas; 1.057 exposiciones con ambos horizontes temporales, 8 frente a 10,02. Las comparaciones NO prueban ventaja ni desventaja predictiva.

## El punto metodológico que NO debemos saltarnos
El campo `d1Roots/d7Roots` cuenta antecedentes temporales agregados, pero **no identifica por sí solo independencia de la geometría actual**. Una cabeza histórica, un bloque de tres celdas, distintas lecturas reversibles, bifurcaciones sobre el mismo borde y fuentes físicas de columnas diferentes NO son la misma unidad.

Se probó un cruce exploratorio ingenuo del antiguo `VISOR_TRAMOS_VT3_PRE.html`: atribuir a cada familia alternativa todos los antecedentes D−1/D−7 de su mismo borde. Esa atribución infla las etiquetas (aparecían 1.263 casos de 'ambos períodos' dentro de sólo 1.867 familias emparejadas, frente a 1.057 en TODO el universo de 6.389 del visor actual). **Descartamos esas cifras como evidencia de independencia**; identifican un error de asociación en el procedimiento exploratorio, NO un defecto comprobado del motor oficial. Un borde compartido no autoriza 'prestar' todas sus raíces a cada alternativa.

Regla para el próximo contraste estricto:
1. Preservar `(fecha_corte, turno, familia_reversible, columna_fuente)`.
2. Adjuntar **testigos propios**: tripleta exacta de celdas actuales (sin cruces de columna, saltos, vacíos ni inversión de cifras que altere la familia), lectura, cabeza completa histórica, fecha D−1/D−7, tripleta histórica y traslación geométrica.
3. Desduplicar por bloque actual físico `(columna, conjunto_3_celdas)`, por antecedente histórico `(fecha, cabeza_completa, columna, bloque_histórico)` y por raíz transferida; no contar como apoyos nuevos las meras bifurcaciones que reutilicen un mismo bloque o raíz.
4. Separar: **A** repeticiones de misma raíz y bloque; **B** raíces históricas distintas sobre un único bloque actual; **C** bloques actuales físicamente distintos en una fuente; **D** bloques distintos en fuentes separadas; y anotar aparte si procede de D−1, D−7 o de ambos.
5. Examinar las distribuciones por corte/jornada, después cotejar POST. No reordenar Top3/5/10 ni ampliar diez madres VT3 de la puerta VT4; no seleccionar reglas retrospectivamente.

## Ejemplo operativo del 12/10 (fuera de los 115)
- `565/565` Vespertina: puesto 1, cinco bifurcaciones, **una fuente** (Nocturna anterior), `d1Roots=2`, `d7Roots=0`; la permanencia no indica apoyo nuevo.
- `365/563`: dos fuentes, `d1Roots=1`, `d7Roots=3`; **no** atribuir automáticamente cuatro respaldos independientes sin deduplicar bloques y raíces.
- `536/635`: dos fuentes, `d1Roots=1`, `d7Roots=2`; misma precaución.

## Estado
Se corroboró el checkpoint de GitHub del 12/10; se auditó la separación temporal completa con visores PRE/POST, y se detectó el límite del cruce amplio por bordes. **Pendiente y no afirmado:** independencia física exacta de cada testigo histórico del motor actual, su eventual relación con aciertos y mejora prospectiva VT4. No impulsar ningún cambio productivo con estos números.
