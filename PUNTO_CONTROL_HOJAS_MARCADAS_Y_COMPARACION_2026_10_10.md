# Modelo Papá — hojas marcadas completas y comparación ocular de jornadas
Fecha de trabajo: 2026-10-10 · Rama experimental `experimento-analisis-visual-5d`

## Regla central, corregida con el usuario
La HOJA se construye **DESPUÉS** de conocer cada cabeza sorteada:
- Se buscan todas las coincidencias **VT2, VT3 y VT4**, nunca sólo VT3 ni únicamente la coincidencia más larga.
- Se buscan únicamente en las columnas +11 ya disponibles **ANTES** del turno en el que salió la cabeza (progresión Nocturna anterior → Previa → Primera → Matutina → Vespertina).
- Se marcan TODOS los recorridos contiguos válidos, dentro de UNA columna por camino.
- Se anota la **cabeza completa** debajo de la hoja si coincidió al menos una modalidad. Por ejemplo, salió `3621`: pueden marcarse `21`, `621` y `3621`; si sólo está `21`, se marca sólo VT2 y se escribe `3621` completa debajo. Sin coincidencia, no anotar.
- Las marcas históricas son la **entrada** del futuro análisis visual, no pronósticos de los sorteos que ya terminaron.
- Las fotos manuscritas sirven para comprobar fidelidad a la tinta, no como requisito para reconstruir los recorridos históricos a partir de las cabezas conocidas.
- No introducir fórmulas de ranking ni empezar de cero buscando todos los posibles candidatos en una tabla sin marcas.

## Lo implementado
`src/visualMarkedSheet7d.ts` crea un objeto gráfico autocontenido, a partir de
`src/markedSheetAfterDraw7d.ts` y `src/sheet.ts`:

- Seis filas por jurisdicción, dos dígitos +11 por columna, todas las columnas visibles a cada etapa.
- **VT2 / VT3 / VT4** en colores diferentes como caminos superpuestos sobre sus **dígitos REALES**; los trazos son los de cabezas ya sorteadas.
- Listado debajo, por turno y jurisdicción, de las **cabezas COMPLETAS**, con las modalidades y la cantidad de rutas de cada una.
- La persona puede **tocar una cabeza** para iluminar sus caminos, apagar/encender una modalidad y volver a mostrar todo. No hay candidato ni puntuación.
- Tras terminar un turno, muestra también la nueva columna +11 incorporada para el siguiente, pero con **borde punteado** porque esa columna NO intervino en la búsqueda retrospectiva de la cabeza que recién salió.
- Salida HTML autónoma, sin internet ni librerías externas; JSON paralelo con fuente, cabeza, modalidad y celdas de cada trazo.

`scripts/run-visual-marked-sheets7d.cjs` descarga historia real y emite cinco etapas por fecha, un `index.html` y un `comparar.html` para ver **dos días consecutivos lado a lado, en el mismo turno**.

`scripts/test-visual-marked-sheet7d.cjs` confirma:
- `3621` produce caminos de las tres modalidades cuando existen;
- cuando sólo se forma `21`, se marca sólo VT2 pero debajo se anota la cabeza completa;
- sin coincidencia, no se anota;
- ninguna cabeza o columna futura puede alterar la hoja de un turno cerrado;
- las cinco etapas conservan una reconstrucción progresiva causal.

## Hojas históricas efectivamente reconstruidas
Período: **29 y 30 de septiembre de 2026**, cinco etapas por fecha (10 hojas).

| Jornada posterior a Nocturno | Cabezas completas anotadas | VT2 caminos | VT3 caminos | VT4 caminos |
|---|---:|---:|---:|---:|
| 29/09/2026 | 13 | 23 | 12 | 2 |
| 30/09/2026 | 17 | 43 | 18 | 2 |

No confundir caminos con sorteo independiente o poder predictivo.
El incremento de marcas no implica mejora de aciertos futuros.

## Archivos y pruebas
- `src/visualMarkedSheet7d.ts`
- `scripts/test-visual-marked-sheet7d.cjs`
- `scripts/run-visual-marked-sheets7d.cjs`
- `.github/workflows/visual-marked-sheets7d.yml`
- Ejecutado con éxito: https://github.com/y0t3/Modelo-Papa/actions/runs/38038905168
- Artefacto de 10 hojas + comparador: https://github.com/y0t3/Modelo-Papa/actions/runs/38038905168/artifacts/11665385183

Dentro del ZIP: abrir `index.html` para acceder a las diez etapas o
`comparar.html` para mirar ambas fechas lado a lado y cambiar el turno.
También se incluyen archivos JSON con cada coincidencia.

## Próxima tarea: RAZONAMIENTO VISUAL, no otra fórmula
Sobre las dos hojas **marcadas**, identificar manualmente recorridos
específicos que se conservaron, se desplazaron, se bifurcaron o se
superpusieron entre 29 y 30 de septiembre, distinguiendo cada camino
con su cabeza completa, turno, origen, celdas y modalidad (VT2/3/4).

No decidir automáticamente cuáles figuras «predicen» el turno posterior,
no añadir candidatos por un conteo más alto, no puntuar repetición de
formas que la cuadrícula siempre permite. Registrar hipótesis visuales
concretas ANTES de revelar el sorteo posterior para su evaluación futura.

`main`, APK y selector oficial permanecen intactos.
