# PUNTO DE CONTROL — recuperar el motor predictivo (2026-10-08)

## Objetivo único
Construir y validar predicciones de cabezas de quiniela **antes del sorteo**, explicando el recorrido físico que originó cada candidata. Evitar cambios especulativos en reglas.

## Referencia congelada
**Motor semanal original**, archivos `src/predictive.ts`, `src/analysisEngine.ts`, `src/routeHistory.ts`. Compara D−7 y usa D−14/D−21 como antecedentes. No modificar estos módulos durante la evaluación.

## Experimento separado
Visual 6D (`src/visual5d.ts`, `src/visualMemory5d.ts`, `src/visualEvolution5d.ts`, `src/drawHistory.ts`) es **exploratorio**; sus resultados NO sustituyen al motor semanal ni prueban efectividad. Seis jornadas significa seis días con sorteos efectivos; no equivale al intervalo semanal D−7.

## Ciclo de vida
`src/routeLife.ts` informa estados NACE/OBSERVAR/CONFIRMA/ACTIVA/DECAE/MUERE, pero `src/analysisEngine.ts` no lo utiliza como filtro directo. No adjudicarle mejoras predictivas.

## Protocolo de trabajo, sin excepciones
1. Guardar una versión estable de referencia del motor semanal y no modificarla.
2. Evaluar en orden cronológico con **exactamente** la información que existía antes del turno objetivo, incluidos cierres previos y domingos/feriados sin sorteos.
3. Por cada turno: fecha, jurisdicción, candidato, fuente/columna, celdas de su recorrido, criterio de decisión, resultado posterior, acierto VT2/VT3/VT4 o abstención.
4. Informar cobertura, aciertos y comparación con referencia al azar sobre datos no utilizados para ajustar reglas. Diferenciar observaciones retrospectivas de pronósticos prospectivos.
5. Antes de editar reglas, formular una sola hipótesis, registrar resultados y exigir mejora fuera de la muestra.
6. Si el motor no mejora, indicarlo sin inventar hallazgos y mantener intacta la referencia.

## Próxima acción
Verificar que el motor semanal de `main` sigue intacto y establecer el mismo conjunto de fechas para una evaluación independiente. No añadir más selectores ni ventanas por ahora.

Este documento es una decisión de alcance; no implica que el motor ya tenga ventaja predictiva demostrada.
