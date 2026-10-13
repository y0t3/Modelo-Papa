# Punto de control — VT3 sin esperar nuevos sorteos (13/10/2026)

## Alcance
Tres laboratorios recientes sobre las mismas 23 jornadas / 115 cortes; no son nueva muestra. Único motor productivo original, Tops de producción, fuente de heads, hoja marcada, historial y VT4 intactos. Todos los experimentos en ramas aisladas; GitHub Actions completados, resultados POST conservados con PRE sellado.

### 1. Inventario vs prioridades (preexistente)
- `lab-vt3-cobertura-bifurcaciones-13oct2026`: original Top3/5/10 = 5/8/15, inventario completo = 5/8/15 y cobertura 80 vs 46 cortes; prioridad de bifurcación al final = 9/12/16, retroceso en octubre.
- Caso Nocturna 12/10 (conocido y externo a los 115): 851 no anclada (físicamente disponible), 615 anclada con segunda fuente física, 242 anclada con otro centro. Ninguno llegó Top10; simular POST no altera sello genuino.

### 2. Reasignaciones negativas de fechas
Rama `lab-vt3-placebos-cronologicos-13oct2026`.
Ejecución Actions [38350425301](https://github.com/y0t3/Modelo-Papa/actions/runs/38350425301), correcta.
- Control = mover jornadas de resultados completas (cinco turnos y cinco cabezas de cada uno), **sin tocar PRE**. 22 desfases + 20.000 permutaciones libres + 20.000 de igual día semanal + 20.000 del mismo mes, semilla fija 20261013.
- Top10 original real 15/115. Controles promedios: libre 9,7423 (cola >= real 0,0572), mismo día semanal 9,2161 (0,0195), mismo mes 10,0486 (0,0629).
- Inventario físico completo real 80/115, frente a libre 81,309, mismo día semanal 80,250 y mismo mes 82,681. **La cobertura física en sí no supera los controles.**
- C cambiar el orden para aplazar bifurcaciones: real Top10 16, media permutación libre 9,922 y mismo día semanal 11,413. Pero su mejora sobre original es +1; la distribución placebo de esa DIFERENCIA permite diferencias similares frecuentemente (cola unilateral 0,453 libre, 0,768 mismo día semanal). No atribuir superioridad de C sobre original por el número absoluto.
- Top3 idéntico en los cinco cortes del día: 3/23 jornadas. Top10 idéntico en los cinco: 0/23. Familias distintas entre los cinco Top10 diarios, media 18,565; familias presentes en los cinco, media 3,565. No equiparar arrastre parcial a congelamiento total.

### 3. Descomposición por turno y procedencia
Rama `lab-vt3-por-turno-13oct2026`. Actions [38350726526](https://github.com/y0t3/Modelo-Papa/actions/runs/38350726526), correcta.

| Turno (23 cortes cada uno) | Cobertura física (cortes) | Bolsa anclada (cortes) | Top10 (cortes) |
|---|---:|---:|---:|
| Previa | 11 | 6 | 3 |
| Primera | 10 | 3 | 1 |
| Matutino | 20 | 15 | 8 |
| Vespertino | 18 | 9 | 0 |
| Nocturno | 21 | 13 | 3 |

- Matutino tiene 9 familias acertadas en 8 cortes (dos familias en 03/10). Cinco de esas 9 ya estaban en Top10 oficial del turno anterior; cinco éxitos de septiembre tenían ruta anclada propia en fuente `prevNocturno`, cuatro éxitos de octubre en `Primera` (uno también físicamente en Previa, pero anclaje en Primera).
- Vespertino 18 cortes con alguna familia física coincidente, nueve con al menos una anclada, **cero Top10**.
- Permutación libre por turno Top10 Matutino: real 8/23, media 2,126, cola unilateral 0,00070. Restringida al día semanal: media 3,830, cola 0,01315. Bonferroni simple sobre cinco turnos da 0,00350 y 0,06575, respectivamente. Estos no son p confirmatorios: el turno se eligió al observar POST y existen múltiples hipótesis previas. Sirven para ubicar la anomalía, no para concluir predictibilidad.

### 4. Arbitraje de fuentes y persistencia SIN más candidatos
Rama `lab-vt3-arbitraje-fuentes-13oct2026`. Actions [38350996204](https://github.com/y0t3/Modelo-Papa/actions/runs/38350996204), correcta. Código, protocolo y PRE sellados antes del POST de esta ejecución; **las cinco reglas se inspiraron en casos ya observados**, de manera que siguen siendo retrospectivas.

Se preserva EXACTAMENTE la misma bolsa original de familias VT3 ancladas, el mismo cupo 10 y el orden original como desempate. No se toma ninguna ruta de otra fuente como prueba de anclaje para una familia.

| Política | Top3 | Top5 | Top10 | Matutino Top10 | Vespertino Top10 |
|---|---:|---:|---:|---:|---:|
| Original | 5 | 8 | 15 | 8 | 0 |
| Prioridad a última fuente intradía real | 6 | 9 | 14 | 5 | 2 |
| Fuente distinta de Nocturna anterior primero | 4 | 6 | 10 | 4 | 2 |
| Familia persistente del Top10 anterior primero | 6 | 10 | 14 | 6 | 0 |
| Familia ausente del Top10 anterior primero | 6 | 10 | 13 | 6 | 1 |

El criterio de fuente reciente gana tres cortes al original (15/09 Nocturno; 30/09 Vespertino; 07/10 Vespertino) pero pierde cuatro (15/09 Matutino; 22/09 Primera; 25/09 y 29/09 Matutino). No presentarlo como mejora general. Distingue la naturaleza del problema de Vespertino pero desplaza ganadoras en otros turnos.

**Inestabilidad por mes:**
- Original Top10 Septiembre 10/70, Octubre 5/45.
- Fuente reciente Septiembre 8/70, Octubre 6/45.
- Persistencia primero Septiembre 12/70, Octubre 2/45.
- Noveles primero Septiembre 7/70, Octubre 6/45.

## Hallazgo operativo
No basta una regla de `más rutas`, `más fuentes`, `menos bifurcaciones`, `más nuevo` o `más persistente`: hay ganancias y pérdidas compensadas. El cuello de botella demostrado es **cómo ordenar diez madres VT3 ancladas según qué fuente y qué estado físico tienen disponible ANTES del sorteo**, no sólo cobertura del tablero. Matutino representa un caso donde el criterio actual rinde relativamente mejor en este histórico; Vespertino, uno donde falla aun teniendo familias ancladas. No hay regla universal nueva aprobada.

## Continuación sin esperar sorteos
Diagnosticar por corte (con PRE congelado) los **eventos de cambio físico**: qué fuentes incorporan rutas nuevas, qué raíces D−1/D−7 cambian de posición, qué familias suben/bajan sin recibir apoyo nuevo, si la fuente nueva aporta verdaderos bloques propios, y qué papel juega la persistencia. Para cada posible criterio PRE, simular siempre 10 familias y controles negativos en los mismos cortes y reportar pérdidas además de ganancias. Separar análisis histórico exploratorio de validación prospectiva; no tocar producción mientras no haya soporte más convincente.

No atribuir ventaja de apuestas o poder de anticipación demostrado a los resultados.
