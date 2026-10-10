# Modelo Papá — evaluación de giro VT3 entre turnos de la tabla +11
Fecha de corte: 2026-10-10 · Rama \`experimento-analisis-visual-5d\`.

## Hipótesis única, fijada ANTES de cotejar resultados
Objetivo VT3 (máximo Top3). La tabla +11 se lee progresivamente
en los cinco turnos, sin pedir que D−7 autorice señales del día.

Se propuso priorizar, entre los valores VT3 YA ELEGIBLES del
adaptativo, una ruta que:
1. sea físicamente trazable en una sola columna de origen;
2. toque al menos una celda de un VT3 comprobado en algún turno
   ANTERIOR de la misma jornada, en esa misma columna;
3. tenga **otro sentido / secuencia de pasos** (giro) frente a
   esa figura previamente comprobada;
4. reciba apoyo adicional (clase «PUENTE») sólo si la forma de
   la figura del día que origina el giro también se vio ganadora
   en la última jornada anterior, en el mismo origen.

Se ordenan por clases:
\`PUENTE_AYER_HOY_GIRO\` > \`GIRO_HOY\` > \`SIN_GIRO\`.
En empate prevalece EXACTAMENTE el orden original del adaptativo.
Si no existen marcas de hoy, como antes de Previa, no se fuerza
una interpretación de giro. Esta regla es una **hipótesis de prueba**,
no un reconocimiento certificado del método manual del padre.

NO se enumeran candidatos nuevos, NO se cruzan celdas entre columnas,
NO se usan resultados del turno objetivo, NO se altera D−7,
NO se ajustan pesos según resultados.

## Resultados: mismo conjunto y mismo presupuesto por turno
| Período | Turnos evaluados | VT3 propuestos | Cambios efectivos al Top3 | VT3 base | VT3 con giro | Esperanza azar mismo pool |
|---|---:|---:|---:|---:|---:|---:|
| 2024 | 1499 | 4344 | 1469 | 24 | 22 | 23,983 |
| 2025 | 1491 | 4305 | 1414 | 18 | 14 | 20,384 |
| Ene-may 2026 | 584 | 1677 | 600 | 3 | 7 | 7,314 |
| Jun-sep 2026 | 483 | 1386 | 408 | 11 | 10 | 7,343 |
| **Total** | **4057** | **11712** | **3891** | **56** | **53** | **59,024** |

El control aleatorio conserva para cada turno el mismo número de
propuestas y el mismo conjunto adaptativo de VT3 elegibles:
\`n_seleccionados × (VT3 ganadores en pool / tamaño del pool)\`.
Los aciertos aleatorios esperados son una **media**, no un resultado
real de jugadas ni evidencia de manipulación de resultados.

La mejora +4 de enero-mayo de 2026 NO persistió: −2 en 2024,
−4 en 2025 y −1 en junio-septiembre. Globalmente el giro rindió
3 aciertos MENOS que el adaptativo base y 6,024 MENOS que el
control uniforme condicionado al pool. **No hay ventaja predictiva
demostrada** de esta regla ni del adaptativo base.

## Qué aprendimos técnicamente
- El lector es capaz de identificar cambios reales de dirección
  de VT3 entre rutas que comparten celdas y respetan la misma
  columna de origen, observadas antes del turno siguiente.
- Se corrigió, durante las pruebas, una inconsistencia de formato
  entre firmas de geometría (\`>\` y \`;\`): comparar secuencias
  normalizadas evita etiquetar una ruta idéntica como si hubiera
  girado.
- La lectura crece desde Nocturna anterior +11 hasta Vespertina
  +11 para Nocturna: no existe privilegio para ningún par fijo de
  turnos ni bloqueo por D−7.
- El observador conserva la procedencia
  \`RECONSTRUIDA_DE_MATCHES\`: no atribuir a papá caminos
  automáticos no confirmados en dibujos originales.

## Archivos y evidencia
- \`src/vt3QualitativeTransition7d.ts\`: selector espejo cualitativo
  con las tres clases y trazabilidad de la pareja actual/histórica.
- \`scripts/test-vt3-qualitative-transition7d.cjs\`: controla
  normalización de dirección, contacto físico, origen, falta
  de marca del día, cupo igual y fuga temporal.
- \`scripts/run-vt3-qualitative-transition7d.cjs\`: reporte
  cronológico mes, turno, candidatos originales vs propuestos.
- \`.github/workflows/vt3-qualitative-transition7d.yml\`:
  https://github.com/y0t3/Modelo-Papa/actions/runs/38029717553
  (cuatro períodos, resultado exitoso).

Dos módulos antiguos no relacionados con el selector, \`dualFocus7d.ts\`
y \`flowLifecycle7d.ts\`, tenían un paréntesis faltante en su llamada
a \`sort\`; se corrigió la sintaxis en la rama experimental para
permitir el control de TypeScript. No se alteró su lógica.

## Decisión
**NO integrar ni promover el criterio de giro como motor final.**
Conservar evidencia y rutas para interpretación visual posterior,
sin calibrar retrospectivamente niveles/umbrales para recuperar
los aciertos perdidos.

VT3 prioridad principal, VT2 íntegro como respaldo y VT4 físico/
extra experimental como estaba previsto. El Top3 no crece.

**Próximo requisito antes de otro ensayo:** establecer un caso
de interpretación visual completo y reproducible a partir de
varias columnas reales de la hoja +11, justificando por qué tres
VT3 específicos serían preferibles ANTES de revelar las cabezas,
y guardar sus movimientos originales, no solo etiquetas binarias
como «gira», «contacta» o «se repite».

Los datos 2024-2026 ya se utilizaron extensamente para explorar
hipótesis. No valen como prueba independiente de eficacia futura.
