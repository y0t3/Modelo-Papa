# INFO — Movimiento PRE de candidaturas VT2/VT3/VT4

**15/10/2026. Reemplaza el antiguo movimiento POST VT3 como vista predeterminada.**

## Qué representa
Al elegir un turno objetivo, los cuadros se construyen **todos para ese mismo turno** y van revelando únicamente los resultados anteriores a él:
- **Inicio**: base de la Nocturna anterior, sin ninguna cabeza de hoy.
- **Tras Previa**, **Tras Primera**, **Tras Matutino**, **Tras Vespertino**: sólo aparecen si esas cabezas ya fueron registradas y si los sorteos anteceden realmente al objetivo; etapas ausentes no se inventan.
- **PRE · [turno]**: último corte disponible, sin agregar otra cabeza. No es un sorteo nuevo.

Cada etapa enmascara a `--` las columnas de fuentes futuras y vacía los `heads/matches` de turnos aún no conocidos, **antes** de ejecutar `buildMotorLalo`. Se conservan las mismas raíces anteriores D−1 y D−7 de la aplicación original. Los cortes reconstruidos en una fecha histórica usan datos ya archivados, así que son **reconstrucciones sin fuga hacia adelante**, no sellos PRE históricos emitidos por el sistema el día real del sorteo.

## Vista predeterminada
**Panorama** combina **las primeras 10 familias admitidas por cada VT**. Las casillas nunca reciben un color sólido fusionado: se muestran hasta 3 puntos distintos, cada uno con el color existente de VT2, VT3 o VT4 y una intensidad relativa calculada **dentro de esa misma modalidad y fuente**. Los filtros VT2, VT3 y VT4 conservan cada capa por separado.

Para evitar que una ubicación equivalente de celdas de distintos tableros parezca una misma columna física, los mini-tableros de la etapa seleccionada se muestran **por fuente** (Nocturna anterior/Previa/Primera/Matutina/Vespertina). El usuario puede tocar una casilla y ver las familias analíticas de su fuente real que la atraviesan.

## Cómo contamos el respaldo
Unidades = una familia y una fuente por modalidad. Múltiples recorridos alternativos de la misma familia en la misma fuente **no suman nuevos respaldos independientes**, y una casilla ocupada por varios recorridos de la misma familia sólo aporta una unidad a la intensidad de esa modalidad.

## Secuencia visual
Los cuadros muestran la fuente con mayor número de familias físicas para la modalidad seleccionada; abajo se desglosan todas las fuentes. El botón Reproducir/Pausar avanza por los cortes registrados cada 1,55 segundos y permite detenerse en cualquiera para inspeccionarlo. No es un archivo GIF: la vista es interactiva y usa únicamente tableros y rutas calculadas.

El resumen textual compara ingreso/salida de **familias de los Tops** entre dos cortes, sector físico y fuente que más respaldos reúne. No pronostica un desplazamiento futuro ni sugiere cantidades de apuesta.

## Protección del motor y los datos
- Sólo se añadieron `src/infoCandidatos.ts`, `src/ui/InfoCandidateMovement.tsx` y una sustitución focalizada de la tarjeta INFO.
- App conserva el estado de filtro y cuadro al volver usando Atrás de Android.
- Sin alteraciones a `src/motorLalo.ts`, `src/papaPronostico.ts`, `src/laloApuestas.ts`, `src/sheet.ts`, firmas ni claves de AsyncStorage.
- La prueba de regresión cambia resultados *del objetivo* y demuestra que la secuencia PRE permanece idéntica, y cambia una cabeza tardía para confirmar que los cuadros anteriores no varían.
