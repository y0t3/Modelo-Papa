# Modelo Papá — Contraste de doble foco y próximos criterios
Fecha: 2026-10-10. Rama: `experimento-analisis-visual-5d`.
Estado: resultado de ensayos históricos, **no decisión de integración**.

## Hipótesis congelada
¿Mejora la lectura VT2 si, manteniendo la figura original D−7, se prioriza
una traslación físicamente contigua y previamente seguida cuando la figura raíz
entra en reposo?

El experimento solo cambia la lectura de las candidatas VT2 del lector
`combinedReader7d.ts`. **No prueba un motor de dos focos completamente autónomo**
ni permite elegir otras raíces. El número de candidatas de cada turno es
idéntico al lector original. No se permite utilizar el resultado objetivo
para seleccionar la traslación.

## Métodos
- Reglas físicas, fechas, fuente y controles del `PRINCIPIO_RECTOR_7D.md`.
- Primera variante: `REPOSO_Y_RECONFIRMACION`, exige reposo de la raíz y
  traslación con reactivación reconfirmada ANTES del objetivo.
- Segunda variante, regla ya definida anteriormente:
  `REPOSO_Y_ACTIVIDAD`, exige reposo de la raíz y apoyo vigente de la trasladada.
- En ambos casos la pareja raíz/traslación se fija en una oportunidad
  posterior a D−7 anterior al turno objetivo. Las observaciones se reconstruyen
  en orden cronológico de sorteos terminados. La raíz se conserva.
- Código: `src/dualFocusShadow7d.ts`.
- Ensayo repetible: `scripts/run-shadow7d.cjs`.
- Prueba de causalidad y presupuesto: `scripts/test-shadow7d.cjs`.
- `main`, selector semanal oficial, APK y pesos de `combinedReader7d.ts`:
  **sin cambios**.

## Resultados: política estricta
En los tres períodos evaluados inicialmente —2025, enero-mayo de 2026
y junio-septiembre de 2026— hubo **cero promociones** y por ello exactamente
los mismos aciertos que el lector original.

Diagnóstico para esos tres períodos, en observaciones de candidatas (no sorteos independientes):
- 2025: 834 raíces en reposo, 3 traslaciones reconfirmadas, 0 casos con ambas condiciones.
- Enero-mayo 2026: 323, 1, 0.
- Junio-septiembre 2026: 295, 0, 0.

## Resultados: política de actividad (presupuesto igual por turno)
| Período | Turnos | Candidatas VT2 | Traslados efectuados | Aciertos raíz | Aciertos con traslado | Ganó turnos | Perdió turnos |
|---|---:|---:|---:|---:|---:|---:|---:|
| 2024 | 1499 | 3839 | 88 | 215 | 213 | 5 | 7 |
| 2025 | 1491 | 3844 | 93 | 216 | 220 | 7 | 3 |
| Ene-may 2026 | 584 | 1509 | 31 | 96 | 96 | 1 | 1 |
| Jun-sep 2026 | 483 | 1245 | 29 | 89 | 89 | 0 | 0 |

2024 es un período adicional no utilizado en las comparaciones inmediatamente anteriores.
Sin embargo, sigue siendo una prueba histórica y no prospectiva.
La ventaja +4 de 2025 **no se generaliza en 2024** (−2) ni mejora los
dos períodos de 2026 (0). La muestra de cambios con aciertos distintos
es escasa. No optimizar más esa regla sobre los mismos datos.

## Evidencia reproducible
- Actividad 2024: https://github.com/y0t3/Modelo-Papa/actions/runs/38022607915
- Actividad 2025 y 2026: https://github.com/y0t3/Modelo-Papa/actions/runs/38022395071
- Regla estricta 2025 y 2026: https://github.com/y0t3/Modelo-Papa/actions/runs/38022220132
- Prueba prospectiva Previa 2026-10-10 (ABSTENCIÓN: cero candidatos):
  https://github.com/y0t3/Modelo-Papa/actions/runs/38022542712

Los artefactos JSON conservan cada turno, sus cabezas, raíces,
coordenadas trasladadas, estados previos y candidatos congelados.

## Decisión
**No promover ninguna regla de doble foco al selector final.**
Mantener el lector combinado D−7 corregido como referencia y los
estados de raíz/traslación como observadores experimentales.
La variante no aporta mejora generalizable con el ensayo actual.

## Próxima investigación delimitada
Antes de programar más estados o tocar umbrales, estudiar qué evidencia
de las hojas marcadas D−7 y de los sorteos intermedios anticipa realmente
éxitos VT2 con el presupuesto actual. Distinguir observación visual
(retorno, continuidad, bifurcación, altura y cambio de columna/turno)
de confirmación numérica exacta. No aumentar artificialmente número
de candidatos ni trasladar rutas entre columnas físicas.

En paralelo registrar prospectivamente predicciones y abstenciones
**antes** de cada sorteo; no declarar ventaja predictiva sin validación
sobre resultados posteriores al congelamiento.

NO volver a V7, NO reabrir los recorridos ya definidos, NO integrar todavía
un motor experimental a la APK.
