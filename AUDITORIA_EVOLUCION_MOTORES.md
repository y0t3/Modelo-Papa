# Auditoría del motor semanal y Visual 6D (08-10-2026)

## Hallazgo verificado
- `src/predictive.ts`: utiliza D−7 para las plantillas, con D−14/D−21 como historial auxiliar. Proyecta figuras VT3 sobre las columnas disponibles. Asigna estados NACE/OBSERVAR/CONFIRMA/ACTIVA en función de soporte actual por columna, plantillas e historia semanal.
- `src/routeLife.ts`: calcula NACE, OBSERVAR, CONFIRMA, ACTIVA, DECAE y MUERE a partir de marcas ganadoras de semanas previas. Se utiliza en App.tsx para visualización (routeLives/routeStateStats).
- `src/analysisEngine.ts`: decide TOP 3/TOP 5/OBSERVAR/NO JUGAR a partir de familias y estados de `predictive.ts`, sin recibir `RouteLife`. No hay filtro de ciclo de vida conectado al selector.
- `src/visual5d.ts` (etiquetado Visual 6D): selector experimental separado, que se basa en firmas VT3 con continuidad entre jornadas consecutivas. No consume RouteLife.

## Inconsistencias que impiden tratar la clasificación como filtro probado
1. `routeLife.ts` usa únicamente la firma de movimiento para identificar una formación, sin `sourceId`: fusiona columnas físicamente independientes.
2. `routeLife.ts` recibe tres semanas anteriores y no una semana actual completada; sus estados se refieren a esas observaciones y no a un estado del objetivo confirmado.
3. `predictive.ts` llama NACE/OBSERVAR/CONFIRMA/ACTIVA a un **otro** clasificador (soporte actual y semanas), distinto del ciclo de vida.
4. No existe evidencia de que la secuencia NACE→OBSERVAR→CONFIRMA→ACTIVA→DECAE→MUERE se haya validado como una transición causal o como regla predictiva.

## Próximo ensayo recomendado
Sin alterar el motor activo:
- Reconstruir por fecha, turno y `sourceId` las plantillas VT3 ganadoras en D−21, D−14, D−7.
- Registrar presencia/ausencia y estado como **observación previa** a cada turno objetivo.
- Evaluar en una variante independiente si las decisiones congeladas, estratificadas por esos estados, difieren de referencias aleatorias y del selector original; informar coberturas, aciertos y tamaño de muestra sin optimizar sobre el mismo mes.
- No introducir el ciclo de vida como puntuación hasta que mejore fuera de muestra.

## Protección
No modifica `predictive.ts`, `analysisEngine.ts`, `routeLife.ts` ni el selector Visual 6D. Este documento es un registro técnico para no perder la separación entre motores.
