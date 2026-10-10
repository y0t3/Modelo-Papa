# Caso 7 de octubre de 2026 — cabeza 0261

## Procedimiento REAL del Modelo Papá

El 7 de octubre, en **Provincia Vespertino**, salió la cabeza completa **0261**.
DESPUÉS de ese resultado se revisa si su terminación VT3 **261** aparece
formando una trayectoria válida en las columnas +11 que existían ANTES
de Vespertino: `prevNocturno`, `Previa`, `Primera` y `Matutino`.

En este caso se reconstruyeron tres trayectorias:

| Columna +11 | Forma | Celdas (base cero) |
|---|---|---|
| Primera | L | `2:0 → 2:1 → 1:1` |
| Primera | recta | `3:1 → 2:1 → 1:1` |
| Matutino | otro quiebre | `2:1 → 3:0 → 2:0` |

**Las tres son coincidencias históricas legítimas, porque se localizaron
después de conocer la cabeza y sobre columnas que ya existían antes de
ese turno.** Se trazan las coincidencias y se registra **0261 completa
debajo de la hoja**, una sola vez por cabeza/jurisdicción, aun cuando
admita varios trazos y/o modalidades VT2/VT3/VT4.

Ninguno de estos caminos fue una **predicción previa del 0261**;
todos son información histórica para observar el movimiento de
figuras y estudiar posibles continuidades ANTES de otros sorteos.

## ¿Para qué sirve la foto manuscrita?

Sólo para verificar la reproducción exacta del papel: qué caminos
se ven dibujados, colores, orden de flechas, etc. Si hay tres recorridos
físicamente válidos, no hace falta imaginar una elección oculta ni
exigir que esté digitalizada una foto original para reconstruir
la hoja por coincidencias matemáticamente comprobadas.

La auditoría `AUDITORIA_VISUAL.html` de la biblioteca describe
fotogramas manuscritos, pero los fotogramas originales no pudieron
abrirse en esta sesión. Por eso no afirmamos cuáles trazos tienen
tinta visible en la foto; **esto NO bloquea la reconstrucción
retrospectiva de las tres coincidencias válidas**.

## Código y alcance

- `src/sheet.ts`: columna +11 por turno y búsqueda de cabezas
  conocidas en las fuentes disponibles antes de su sorteo.
- `src/markedSheet7d.ts`: reconstruye rutas históricas VT2/VT3/VT4.
- `src/markedSheetAfterDraw7d.ts`: representa explícitamente
  las cabezas completas que se anotan debajo, con sus rutas físicas.
- `scripts/test-marked-sheet-after-draw7d.cjs`: caso real
  Provincia Vespertino **0261** y sus tres rutas VT3, una única
  cabeza completa anotada debajo y exclusión de columnas futuras.
- `src/markedSheetEvidenceReader7d.ts`: herramienta AUXILIAR
  para verificar fidelidad a fotogramas; **no condiciona
  la reconstrucción de los recorridos históricos**.

## Problema de investigación auténtico

Una vez reconstruidas las hojas **marcadas tras los resultados**,
leerlas como un conjunto visual: recorridos, contactos, zonas,
desplazamientos, bifurcaciones y cambios entre jornadas y turnos.
Recién después formular una proyección sobre las columnas +11
disponibles para un turno FUTURO, congelarla y evaluarla tras el sorteo.

Ni fórmula general, ni tablero vacío, ni ranking como sustituto
de interpretación, ni pretendida selección previa de rutas que
en realidad se trazaron después de salir la cabeza.

El número máximo de candidatos sigue siendo un presupuesto
experimental, no una exigencia de rellenar tres espacios.
