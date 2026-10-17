# Auditoría retrospectiva — viernes 16/10/2026

## Alcance y reproducibilidad

Se ejecutó el motor **sin cambios** de `main` (versión 0.3.7, commit base `d15b2565`) mediante `scripts/lab-auditoria-vt3-16oct.ts` en GitHub Actions:
https://github.com/y0t3/Modelo-Papa/actions/runs/39016301530

- Cabezas actuales: 16/10, 25 cabezas de Ciudad, Provincia, Córdoba, Santa Fe y Entre Ríos. Montevideo participa únicamente como fuente de hoja +11 (Matutina / Nocturna), no como resultado objetivo.
- Previa usa Nocturna 15/10; Primera añade Previa 16/10; Matutina añade Primera; Vespertina añade Matutina; Nocturna añade Vespertina. Cada PRE se enmascara con `preSheetAtCut` y no ve su propia cabeza ni turnos siguientes.
- D−1: hoja del 15/10 construida desde Nocturna 14/10. D−7: hoja del 09/10 construida desde Nocturna 08/10.
- Fuentes: https://quinielahoy.net/quiniela-de-ayer , https://quinielahoy.net/resultados/2026-10-15 , https://quinielahoy.net/resultados/2026-10-14 , https://www.nacionalquiniela.com/resultados-quinielas.php?del-dia=2026-10-09 y https://www.nacionalquiniela.com/resultados-quinielas.php?del-dia=2026-10-08 .
- Esta es una **reconstrucción retrospectiva**, no la lectura de capturas locales PRE auténticamente selladas en teléfonos. Comparaciones de familia reversible VT3, no de 4 cifras exactas.

## Resultados por turno (5 cabezas argentinas cada uno)

| Turno | VT3 físico | VT3 admitido por Lalo | VT2 físico | VT4 físico | Lalo Top3 / Top5 / Top10 | Geometría Top3 / Top5 / Top10 | Nueva Top3 / Top5 / Top10 |
|---|---:|---:|---:|---:|---|---|---|
| Previa | 0 | 0 | 2 | 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Primera | 0 | 0 | 3 | 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Matutina | 1 | 1 | 2 | 0 | 0 / 0 / 0 | 0 / 0 / 1 | 0 / 0 / 1 |
| Vespertina | 0 | 0 | 5 | 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Nocturna | 2 | 0 | 5 | 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| **Total** | **3/25** | **1/25** | **17/25** | **0/25** | **0 / 0 / 0** | **0 / 0 / 1** | **0 / 0 / 1** |

## Tres recorridos familiares ganadores identificados

### 3253 (Matutina, Santa Fe), familia reversible 253/352

- Una ruta física en la Nocturna previa: casillas `5:0 → 4:1 → 4:0` (coordenadas cero-basadas, misma fuente).
- Un evento raíz propio D−1: Nocturna del jueves 15/10, Córdoba cabeza **6204**. Es antecedente geométrico transferido, **no la misma terminación**.
- Lalo **puesto 45**; Geometría Completa **puesto 6**; Nueva Prueba **puesto 7**.
- El candidato tenía una raíz D−1 y ninguna bifurcación (`branchBlocks=0`). El corte del Top3/Top10 oficial priorizaba **tener al menos una bifurcación**; por eso la cabeza físicamente presente y admitida quedó lejos del Top.

### 9132 (Nocturna, Córdoba), familia 132/231

- Dos rutas físicas independientes en la **Nocturna anterior**: `1:1 → 1:0 → 0:1` y `2:0 → 1:0 → 0:1`.
- Cero rutas admitidas, cero raíces históricas propias D−1/D−7; sin puesto oficial ni en el Top10 geométrico ni experimental.
- No equivale a ausencia física; equivale a ausencia de **anclaje admisible en el motor Lalo**.

### 5807 (Nocturna, Santa Fe), familia 708/807

- Una ruta física nacida al incorporar la columna **Vespertina**: `2:1 → 1:1 → 0:0`.
- No existía en las otras cuatro fuentes; sin raíces históricas propias D−1/D−7, no admitida en Lalo, tampoco Top10 geométrico.
- La tercera selección experimental toma su familia nacida durante el día de entre madres que **Lalo ya admite**; por ello tampoco rescata este caso nuevo, aunque sí sea físicamente real.

## Interpretación y siguiente hipótesis

1. **Cuello de botella geométrico:** solo tres de las 25 cabezas tenían una terna VT3 físicamente formada en las columnas válidas ANTES de su turno. Ningún método de ranking estrictamente físico puede incluir las otras 22 ternas sin romper reglas.
2. **Cuello de botella de prioridad:** el único evento con raíz D−1 propia (`253/352`) quedó 45º en el oficial debido al filtro prioritario de bifurcaciones. Es un caso concreto para estudiar el efecto de una prioridad excluyente.
3. **Cuello de botella de admisión:** la familia nueva `708/807` nace en la Vespertina y es válida físicamente; el tercer lector experimental depende de que Lalo la admita, y por eso no llega a su Top3 ni Top10.
4. No atribuir estos resultados a predicciones prospectivas: no se inspeccionaron las capturas locales efectivamente guardadas antes de cada sorteo.
5. No cambiar el motor oficial ni la regla familiar VT4 a partir de un único día. Investigar en varias jornadas ciegas el destino de familias con raíz única sin bifurcación y nacidas durante el día sin raíces, comparadas con controles físicos equivalentes.
