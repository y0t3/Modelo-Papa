# Modelo Papá · Primera entrega del rediseño de interfaz · 12/10/2026

## Protección del motor y puntos de retorno
- Versión base congelada: `checkpoint-ui-motor-12oct2026` en commit **`7d9b2ce37a447f79a1d7b9c9d175cc3d750e46f1`**. No hacer commits en esta rama.
- Desarrollo: `ui-refactor-hoja-12oct2026`.
- `main` y `auditoria-sorteo-10oct-2026` no alteradas por el refactor.
- No se modifican los algoritmos `paths.ts`, `sheet.ts`, `predictive.ts`, `analysisEngine.ts`, `panoramaModel.ts`, `cabezas.ts` ni `routeLife.ts`. Las propuestas PRE originales son las mismas.

## Resumen de implementación
1. **Hoja**: `PanoramaSheet` compone `MarkedBoard` con todos los recorridos ya identificados, **sin dibujar líneas sobre los dígitos**. Bordes VT2 rosa, VT3 turquesa y VT4 dorado; suaves rellenos. Las modalidades superpuestas permanecen visibles a través de indicadores separados en los bordes.
2. **Cabezas bajo Hoja**: `TurnStrip` permite elegir Previa/Primera/Matutina/Vespertina/Nocturna horizontalmente; un turno por vez, **tablero fijo encima del carrusel**. `HighlightedHead` resalta sólo el sufijo de longitud correspondiente a la coincidencia real; VT4 prevalece visualmente sobre VT3/VT2, pero las tres etiquetas permanecen visibles. Cabezas no coincidentes siguen atenuadas, no desaparecen.
3. **Predictiva**: `MarkedBoard` usa la misma paleta y `buildPredictivePanorama` sin cambiar ranking ni reinterpretar rutas. La selección de una familia destaca todas las rutas del mismo `ownerId`. `MiniRoutePreview` muestra casilleros actuales con orden numérico y cabezas antiguas que figuran en los antecedentes de esa ruta. No es una captura del manuscrito, sino una **miniatura de la grilla reconstruida**.
4. **Predicción**: pestaña nueva visible, `PredictionSummary` renderiza fecha/turno, decisión `analyzePredictive` y Top3/Top5/Top10 anidados de `buildPredictive.hotFamilies`, en orden exacto de producción. Al tocar familia abre Predictiva enfocada en esa familia. **VT2 y VT4 no tienen selector Top propio en la app de partida**: se informa explícitamente “pendiente” en vez de generar cifras sin base.
5. **Cabezas**: pestaña propia `HeadsTable` con tabla 6 jurisdicciones ×5 turnos, resaltado de sufijos VT2/3/4 sólo ante coincidencia física y cabezas restantes atenuadas.
6. **Info**: `InfoDashboard` presenta familias con actividad/en formación y cantidad de **formas** que decaen. El ciclo del motor original agrupa figuras por firma y no se ha demostrado la asignación de declive a una familia específica: se explica al usuario, sin presentar porcentajes falsos.
7. **Navegación**: Hoja | Predictiva | Predicción | Cabezas | Info; análisis técnico permanece accesible desde Info.

## Contratos de los componentes
| Componente | Entradas principales | Responsabilidad |
|---|---|---|
| `MarkedBoard` | `columns: DailySheet['columns']`, `routes: PanoramaRoute[]`, `activeOwner: string|null` | Colorear celdas y solapamientos, sin decidir caminos |
| `HighlightedHead` | `group: PanoramaGroup`, `active`, `mode`, `onPress` | Resaltar sufijos y mantener cabezas sin acierto visibles |
| `TurnStrip` | `value: Turno`, `onChange` | Navegación horizontal de cabezas |
| `MiniRoutePreview` | `sheet: DailySheet`, `route: PanoramaRoute` | Miniatura física con orden de celdas y procedencia |
| `HeadsTable` | `data: CabezasDia|null`, `sheet: DailySheet|null` | Mostrar todas las cabezas por jurisdicción y turno |
| `PredictionSummary` | `date`, `turn`, `view: PredictiveView|null`, `analysis: AnalysisResult|null`, `onFocus` | Top VT3 **del selector vigente**, sin fabricar VT2/4 |
| `InfoDashboard` | `turn`, `view`, `lives: RouteLife[]`, `onDetails` | Traducción de estado a lenguaje corriente |

## Comprobaciones pendientes en teléfono
- Revisar el tamaño legible de casilleros en pantallas Android pequeñas (360 px o menos), en orientación vertical y con fuentes agrandadas.
- Confirmar que cambiar de turno con el carrusel no desplaza el tablero fuera de vista.
- Revisar solapamientos simultáneos VT2+VT3+VT4 con casos históricos densos (p. ej., 10/10).
- Comparar contra el checkpoint **el conjunto de caminos y el orden de las familias** con la misma fecha/turno; los cambios deben ser exclusivamente visuales.
- Abrir Predicción -> tocar VT3 -> revisar resaltado de las rutas y miniaturas de sus antecedentes.
- Comprobar el comportamiento con días parcialmente publicados, turnos sin cabezas y números que comienzan con cero.
- Ejecutar una compilación Android de la rama **sin publicar APK como si fuera versión validada**.

## Estado de validación
GitHub Actions `.github/workflows/validar-ui-refactor.yml` ejecuta `npm install` y `npx tsc --noEmit` al publicar cambios de la rama de interfaz. El primer conjunto de cambios pasó el chequeo; requerir el chequeo final del último commit antes de declarar la rama compilada. La interfaz móvil aún **no** se ensayó visualmente en un dispositivo físico.

## Continuidad
Conservar este punto como primera versión navegable **experimental**. Los laboratorios sobre 115 cortes, recuperación D−1, bifurcaciones y genealogía de hijas VT4 NO están fusionados en el motor oficial: no confundir los hallazgos de investigación con los Tops que la app entrega. La siguiente etapa es probar tamaños/táctil y registrar la evaluación PRE/POST de los Tops existentes sin alterarlos.
