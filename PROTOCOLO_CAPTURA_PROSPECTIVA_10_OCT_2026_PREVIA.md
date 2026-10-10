# Protocolo de PRIMERA captura prospectiva sin selección — 10/10/2026

**Definición previa a ejecutar:** sábado 10/10/2026, turno **Previa**, horario oficial anunciado por Lotería de la Ciudad **10:15 hora de Buenos Aires**, con margen de seguridad para finalizar la captura **antes de las 10:05**. Referencia oficial: https://quiniela.loteriadelaciudad.gob.ar/ (programación semanal, sábado 10/10).

**Objetivo limitado:** crear una foto verificable en GitHub de la tabla +11 utilizable ANTES de Previa del 10/10 y de la hoja completamente marcada de la jornada anterior, sin usar cabezas del turno objetivo. Este primer archivo NO es una predicción. Toda selección humana deberá ser realizada aparte por el usuario/padre y sellada por GitHub antes de la hora del sorteo.

## Condiciones técnicas estrictas

1. Tomar el instante UTC de GitHub Actions en un job iniciado por `push` en la rama experimental y abortar si supera las 10:05 ART (13:05Z). Guardar instante UTC y plazo oficial en metadatos, así como identificador y enlace de la ejecución Actions.
2. Consultar los resultados del día por `src/cabezas.ts`, y **rechazar** si existe **cualquier cabeza** para Previa o cualquiera de los cuatro turnos posteriores. No reinterpretar un turno publicado como «aún pendiente».
3. Requerir antecedentes completos: 09/10 con Nocturno efectivo (el anterior inmediato), 08/10 con Nocturno para construir la hoja previa completa. Admitir cabezas ausentes por jurisdicción como `----`; no fabricar resultados.
4. Reconstruir `buildSheet(09/10,08/10)` y `buildVisualMarkedSheet7D` con todos los recorridos VT2/VT3/VT4 **reales de las cabezas históricas de 09/10**. La tabla objetivo se construye con `buildSheet(10/10,09/10)`, mostrando **sólo** la columna `prevNocturno` para la Previa. Todos los trazos heredados se releen sobre esas celdas; no se generan recorridos nuevos de tabla vacía.
5. Guardar JSON preobjetivo, visor offline, hoja anterior marcada, las lecturas reversibles de todos los dibujos, todas las cabezas anteriores y SHA256 de la entrada. Las columnas no existentes, las marcas de Previa del 10/10 y los sorteos posteriores NO entran al paquete.
6. Guardar el paquete como **artefacto de GitHub Actions creado antes de la hora**; no basta con una fecha anotada por un usuario. No emitir acierto, ranking, selección de número, apuesta ni recomendación.
7. Si no hay datos suficientes, si se produjo cualquier sorteo, si el timestamp es posterior al plazo o si falla una comprobación, **abortar sin producir artefacto**, documentando el fallo.

El cuaderno visual puede permitir elección manual y exportar un registro JSON, pero la hora local de exportación **no certifica** la anterioridad. Solo un commit/carga remota fechado antes del turno podría respaldar esa afirmación, y la selección no será hecha automáticamente por el modelo.

**No tocar `main`, motor, selector ni APK oficial.** Solo rama `experimento-analisis-visual-5d`.