# Modelo Papá — primer expediente visual completo VT3 de hoja +11
Fecha de elaboración: 2026-10-10 · Rama `experimento-analisis-visual-5d`.

## Objetivo y precaución
Primer caso de lectura **CUALITATIVA, reproducible y legible** para
verificar cómo la tabla +11 evoluciona de Nocturna anterior a Nocturna.
Se escogió antes de revisar aciertos del caso la jornada **2026-09-30**,
que ya había sido estudiada en el proyecto. Esto es una
**reconstrucción retrospectiva con corte causal simulado**, NO
cinco apuestas realmente registradas antes de los sorteos.

Se mantienen tres VT3 principales o menos por turno: son los del lector
adaptativo preexistente, que no superó una referencia de azar equivalente.
Se muestran tres alternativas del MISMO conjunto elegible
**sólo para cotejo visual, no para agregarlas a una jugada**.

## Cinco cortes causales reconstruidos
| Sorteo todavía no visible | Columnas +11 previas | Top3 adaptativo anterior |
|---|---:|---|
| Previa | 1 | 058, 073, 187 |
| Primera | 2 | 058, 073, 187 |
| Matutino | 3 | 043, 304, 376 |
| Vespertino | 4 | 335, 370, 778 |
| Nocturno | 5 | 151, 821, 912 |

La estabilidad Previa→Primera y los cambios posteriores son
resultados del **ranking heurístico existente**, no conclusiones
sobre recorridos más propicios ni prueba de predicción.

## Qué contiene cada expediente `ANTES`
- Seis filas por todas las columnas +11 disponibles al comenzar
  cada turno (1, 2, 3, 4 o 5).
- Top3 original y tres cifras siguientes SOLO de comparación.
- Cada recorrido físico del valor VT3 sobre cualquier columna
  visible: origen, dígitos, celdas ordenadas, movimiento relativo,
  y huella original propuesta por el adaptativo.
- Coincidencias anteriores de hoy, analogías de formas entre
  distintas columnas, y referencias a ayer y D−7 cuando existan.
- Cabeza, turno, fecha, origen y ruta de cada antecedente
  reconstruido, sin atribuir autoría manual al padre.
- VT2 contenido como terminación de la cifra VT3, sin
  contarlo como un evento ganador independiente.
- Explicación explícita cuando no hay prueba geométrica directa
  en hoy/ayer/semana. El estado adaptativo NO es certeza de salida.

**Nada de lo anterior utiliza la cabeza del sorteo objetivo**.
El archivo `99-DESPUES.json` tiene la comprobación histórica
separada de los cinco documentos `<turno>-ANTES.md`.

## Código y pruebas
- `src/vt3VisualDossier7d.ts`: objeto previo y versión Markdown.
- `scripts/test-vt3-visual-dossier7d.cjs`: cinco cortes 1→5,
  verificación de todas las rutas contra los 12 dígitos de cada
  columna física, cupo intacto, ni una cabeza futura.
- `scripts/run-vt3-visual-dossier7d.cjs`: un caso real, genera
  Markdown y JSON previos y resultados históricos posteriores.
- `.github/workflows/vt3-visual-case7d.yml`: prueba y guarda
  los documentos como artefacto descargable.
- Ejecución exitosa: https://github.com/y0t3/Modelo-Papa/actions/runs/38030861168
- Archivo completo: https://github.com/y0t3/Modelo-Papa/actions/runs/38030861168/artifacts/11661803336

Se corrigió una confusión de clasificación entre `CONTACTO`
dentro de una misma columna y `MISMA_FORMA` de columnas
distintas. No se deben presentar como la misma relación:
comparación de figura NO implica unión física de celdas.

## Siguiente decisión experimental
El **valor de este expediente** es revisar visualmente qué hace
preferible a una de las tres cifras frente a las otras figuras
elegibles, ANTES de destapar el resultado, utilizando recorrido,
contactos, direcciones, concentración, fuentes y flujo de jornada.
No tomar las cabezas posteriores como justificación ni volver a
ajustar pesos mirando cuáles ganaron.

Si esa diferencia sigue siendo ambigua, registrar
`OBSERVAR / NO JUGAR`, no inventar confianza a partir de un
patrón intuitivo. Para demostrar eficacia, aplicar un criterio
explícito congelado a sorteos genuinamente futuros y compararlo
con azar de igual cupo.

No se modifica `main`, el selector oficial ni la APK.
VT2 continúa independiente; VT4 sigue experimental.
