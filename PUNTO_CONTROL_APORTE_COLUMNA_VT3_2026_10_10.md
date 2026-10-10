# Modelo Papá — auditoría de qué cambia al agregar cada columna +11
Control: 2026-10-10 · Rama \`experimento-analisis-visual-5d\`

## Alcance
Se analiza el efecto MARGINAL de cada columna recién construida, leyendo
siempre las 1→5 columnas progresivas Nocturna anterior, Previa, Primera,
Matutina y Vespertina para el turno OBJETIVO siguiente.
No se habilitan rutas que crucen columnas físicas, no se suman candidatos
ni se convierte a D−7 en requisito.

No se atribuyen a papá decisiones manuales que provienen del adaptativo:
esta es una **auditoría de comportamiento interno**, no un nuevo criterio
predictivo. Las cabezas del objetivo siguen ocultas hasta la evaluación.

## Qué medimos, por transición
1. Valores VT3 distintos físicamente posibles en la(s) columna(s) disponible(s),
   separados de ternas ELEGIBLES para el adaptativo.
2. Ternas que entraron al conjunto elegible desde la nueva columna, las
   recién habilitadas en columnas que ya existían, y las que dejaron de
   ser elegibles por el seguimiento temporal.
3. El Top3 original antes y después de completar cada turno, retenidos,
   ingresados y salientes, con origen, recorrido y forma.
4. Nuevas marcas ganadoras VT3 del turno cerrado, relaciones de
   forma dentro de la misma columna o analogía entre columnas SIN
   mezclar celdas.
5. Estado de vida previo / posterior para los tres VT3 anteriores;
   se registra explícitamente si desaparecieron del conjunto.

**No se asignan nuevos puntos ni se reordena el motor.**

## Caso: 30 de septiembre de 2026
| Transición | Nueva columna +11 | Nuevos VT3 elegibles | Entraron al Top3 |
|---|---|---:|---:|
| Previa→Primera | Previa | 8 | 0 |
| Primera→Matutino | Primera | 0 | 3 |
| Matutino→Vespertino | Matutino | 39 | 3 |
| Vespertino→Nocturno | Vespertino | 11 | 3 |

La transición **Primera→Matutino** es relevante:
- Antes: \`058, 073, 187\`, los tres en estado **ACTIVA**.
- Después: \`043, 304, 376\`, los tres en estado **NACE**.
- Ninguna nueva marca VT3 ganadora comprobada en Primera.
- Ningún nuevo valor VT3 elegible en el pool adaptativo.
- Los tres \`ACTIVA\` anteriores quedaron **FUERA DEL POOL**,
  no simplemente desplazados unos lugares.
- El reloj \`adaptive7d.ts\` evalúa primero la antigüedad; al
  superar el umbral \`stale>=5\` clasifica como DECAE,
  y luego no admite ese estado como candidato. Esa
  regla explica un cambio brusco SIN nueva confirmación VT3.

Esto no implica que el orden anterior fuese mejor, ni que la
nueva columna fuera visualmente irrelevante: podía contener
figuras físicas que no fueran elegibles para el adaptativo.
Diferenciar «nueva geometría física», «marca ganadora comprobada»,
«nuevo valor elegible» y «cambio heurístico de rango» es esencial.

## Contraste descriptivo en septiembres completos
| Período | Jornadas | Transiciones | Transiciones con cambio de Top3 | Sin nuevas marcas VT3 y sin nuevos elegibles, pero cambió el Top3 |
|---|---:|---:|---:|---:|
| Septiembre 2025 | 26 | 104 | 61 | 1 |
| Septiembre 2026 | 26 | 104 | 52 | 3 |
| **Total** | **52** | **208** | **113** | **4** |

Casos específicos:
- 2025-09-17, Vespertino→Nocturno: dos OBSERVAR
  salieron del conjunto y otra pasó a NACE.
- 2026-09-03, Previa→Primera: una OBSERVAR
  salió del conjunto y dos quedaron en rangos inferiores.
- 2026-09-26, Primera→Matutino: tres CONFIRMA
  desaparecieron y fueron reemplazadas por NACE.
- 2026-09-30, Primera→Matutino: tres ACTIVA
  desaparecieron y fueron reemplazadas por NACE.

## ¿Conviene retener el Top3 cuando no hay marca ni nuevo elegible?
Regla conservadora predefinida:
- Si la última jornada/turno cerrado NO agregó marcas VT3
  ni valores nuevos elegibles, y los tres VT3 anteriores
  siguen físicamente formables, conservar provisionalmente
  los tres previos.
- De lo contrario: continuar EXACTAMENTE con la salida adaptativa.
- Mismo presupuesto por turno, cero nuevas propuestas. No se
  cambian puntajes ni el selector original.
- Comparar solo los turnos que efectivamente cambian frente
  al control uniforme del conjunto reunido de Top3 viejo y nuevo.

| Período | Transiciones con cambio sometidas a la regla | Aciertos adaptativo en esos cortes | Aciertos con retención |
|---|---:|---:|---:|
| 2024 | 19 | 1 | 0 |
| 2025 | 20 | 0 | 0 |
| Ene–may 2026 | 12 | 0 | 0 |
| Jun–sep 2026 | 8 | 0 | 0 |
| **Total** | **59** | **1** | **0** |

El control aleatorio de la unión de ambos Top3 da
una esperanza de \`0,50\` aciertos en todos los cortes modificados.
La evidencia es extremadamente escasa y retrospectiva.

**Decisión: NO promover la retención conservadora ni
cambiar el vencimiento de figuras por estos resultados.**
Mantener registro de estados y explicar cuándo una figura
desaparece SOLO por decaimiento temporal.

## Material comprobable
- \`src/vt3ColumnEvolution7d.ts\`: censo de fuentes físicas,
  nuevos valores, rango, marcas ganadoras y posición.
- \`scripts/test-vt3-column-evolution7d.cjs\`: progresión en
  cuatro saltos, mantenimiento del Top3, no-lookahead y rutas.
- \`scripts/run-vt3-column-evolution7d.cjs\`: historial de
  septiembre 2025, septiembre 2026 y caso 30/09/2026.
- https://github.com/y0t3/Modelo-Papa/actions/runs/38031794976
- \`src/vt3StabilityGuard7d.ts\`: alternativa conservadora
  CONGELADA como ensayo; no cambia motor oficial.
- \`scripts/test-vt3-stability-guard7d.cjs\`: presupuesto igual
  y exclusión del sorteo objetivo.
- \`scripts/run-vt3-stability-guard7d.cjs\`: cuatro tramos
  retrospectivos 2024–2026.
- https://github.com/y0t3/Modelo-Papa/actions/runs/38031989605

## Siguiente foco conceptual
La señal de la nueva columna no equivale a «hubo un VT3
ganador previo» ni a «un reloj produjo DECAE».
Para estudiar la lectura de papá debemos hacer explícitas
las **relaciones VISUALES de la tabla actual completa**:
formas que pueden leerse dentro de cada columna, vínculos
de orientación/contacto entre figuras sin cruzar celdas,
qué cambió realmente al sumarse la columna y antecedentes
que ayuden a interpretar ese movimiento.

No reiniciar la investigación desde D−7 ni inventar
bonificaciones de ranking tras ver resultados. Mantener
Top3 de referencia, memoria VT2 independiente y VT4
físico o extra experimental, sin promover una ventaja
frente al azar que todavía no se demostró.
