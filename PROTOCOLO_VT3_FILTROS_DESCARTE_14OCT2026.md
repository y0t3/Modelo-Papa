# Protocolo preregistrado — filtros de descarte VT3
**14/10/2026 — 115 cortes retrospectivos, rama experimental, motor oficial intacto.**

## Pregunta
¿Alguna definición temporal PRE de "estabilidad" o repetición de una familia VT3 permite descartar un subconjunto del universo físico completo, conservando familias que luego coinciden con las cinco cabezas, sin destruir los Top3/Top5/Top10 del ranking geométrico completo? Igual cantidad de familias únicas en todos los tops: se excluyen familias y se *rellena desde el ranking físico original* sin recalcular puntuaciones.

## Unidad y temporalidad
El universo base por corte es el archivo sellado `vt3-geometria-completa-vs-anclada-115-14oct2026/PRE_115.json`: todas las rutas de 3 casillas, fuente, clave canónica sin invertir indebidamente VT4, cifras PRE y rasgos geométricos. Reconstruir su orden físico `F_D1` completo (NO sólo diez posiciones), comprobando que sus primeras diez familias sean exactamente las del PRE original. La identidad de candidato es la familia reversible VT3 para no descontar dos veces un mismo número con distintos recorridos.

Comparar hojas **del mismo turno y misma fuente**, en fechas anteriores estrictas; D−1, D−7, D−14 exactos calendarios. Las fechas faltantes son INDETERMINADAS, nunca ausencia. No se reemplazan las columnas intradía; Previa es primer corte y las fuentes se acumulan. Cualquier regla sin historia completa queda inactiva para ese corte.

## Filtros PRESUPUESTOS y congelados antes de POST
1. `REPETIDA_RUTA_D1`: misma familia, misma fuente y mismo conjunto físico de tres celdas (ruta reversible) en el corte PRE del mismo turno **exactamente un día antes**.
2. `REPETIDA_RUTA_D7`: mismo requisito en D−7 calendario.
3. `REPETIDA_FUENTE_D1`: misma familia y misma fuente en D−1 (aunque cambie su bloque), independiente de la primera condición.
4. `PERSISTE_FAMILIA_D7_D14`: la familia figura físicamente en D−7 y D−14 del mismo turno (fuentes cualesquiera, dentro de cada hoja).
5. `PERSISTE_RUTA_D7_D14`: alguna ruta de la misma familia, fuente y mismas tres celdas existe también en **ambas** fechas D−7 y D−14.
6. `ESTABLE_INTRADIA_Y_D1`: ningún camino de esa familia nace en la columna nueva del corte actual (no se aplica a Previa) Y coincide su familia+fuente con D−1. Es un control de interacción predefinido, no sinónimo de cuatro semanas.
7. `PERSISTE_4_SEMANAS`: exigir coincidencia exacta en D−7, D−14, D−21 y D−28. **Solo analizar si hay cobertura temporal auténtica para las cuatro fechas anteriores**; no falsificar ventanas faltantes ni tratar ausencia de archivos como estado=0. Dado el corpus conocido del 15/09 al 10/10, previsiblemente cero cortes elegibles. Quedará marcado NO EVALUABLE, no como señal negativa.

*No* inferir el filtro a partir de resultados POST. Los términos tienen definiciones previas e independientes de los aciertos.

## Comparación auditada
Para cada filtro:
- `exposiciones`: familias presentes en cortes elegibles temporalmente; `descartadas`; `retención` = (familias físicamente ganadoras conservadas)/(familias ganadoras físicamente presentes), en cortes elegibles.
- Mantener las 10 primeras familias **no excluidas** de la lista geométrica completa ya ordenada; evaluar Top3/5/10 sobre el mismo número de familias. Reportar cuántas selecciones acertadas se eliminan y cuántas se recuperan por reposición, por corte.
- **Control neutral por filtro**: 2.000 asignaciones aleatorias de igual número de familias excluidas en CADA corte, todas partiendo del mismo orden geométrico. Mantener cobertura observada y mejores/peores controles; calcular distribuciones Top3/5/10 y familias ganadoras descartadas.
- Separar septiembre y octubre y enumerar fechas elegibles; registrar diferencias entre cortes correlacionados de una misma jornada.
- Comparar además con `VT3 OFICIAL` (5/8/15), con `F_D1` original (8/10/16), sin pretender que se pueda rellenar el Top10 oficial si faltan candidatos fuera de ese Top10.

## Política de aceptación
No alterar producción por hallazgo retrospectivo. Filtro con interés EXPLORATORIO sólo si alcanza simultáneamente: reducción material (>20 % de candidatas en cortes elegibles), retención >=95 % de familias ganadoras presentes y ganancia Top3/5/10 contra reposición neutral de igual descarte, observada en subperíodos distintos. Aun así exigir PRE auténticos posteriores para adopción.
