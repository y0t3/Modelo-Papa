# VT4 EXTRA — prefijo de memoria sin recorrido físico obligatorio
Punto de control 2026-10-10 · Modelo Papá / rama experimental

## Decisión conceptual
Mantener **VT3 como objetivo predictivo primario** y VT2 completo como apoyo, sin borrar
antecedentes ni trayectorias. VT4 se divide en:
1. **VT4 FÍSICO**: las cuatro cifras se leen mediante un único recorrido contiguo
   en una misma columna +11, sin saltos.
2. **VT4 EXTRA DE MEMORIA**: una terna VT3 ya elegida antes del sorteo recibe
   **un solo prefijo izquierdo** del 0 al 9, generado exclusivamente con resultados
   pasados. Se guarda \`physicalVT4=false\` cuando ese prefijo no es prolongable
   físicamente; no simular rutas inexistentes.

Ejemplo: VT3=371; VT2 incluido=71; la memoria puede sugerir 6371. En una
cabeza concreta VT3 acertado implica VT2, pero son el MISMO evento: no
multiplicar aciertos independientes. **La probabilidad de acertar una
única cifra por azar es 1/10 condicionada a que la terna ya haya acertado**
bajo prefijos equiprobables. Si dos cabezas con el mismo VT3 tienen distintos
prefijos, el control se ajusta por la cantidad de prefijos ganadores.

El Principio Rector 7D ya contemplaba esta extensión opcional desde el 8/10.
No modifica el motor semanal original, \`main\`, ni el selector de la APK.

## Experimento realizado — Top3 VT3 congelado
Código experimental: \`src/vt4Extra7d.ts\`.
Reglas comparadas (todas sin resultados del turno objetivo):
- \`ULTIMO_VT2\`: prefijo de la cabeza histórica más reciente del mismo turno
  cuyo VT2 coincide con el VT2 del candidato; si no existe se abstiene.
- \`ULTIMA_CABEZA\`: prefijo de la última cabeza disponible del mismo turno.
- \`MODA_6D\`: cifra de millar más repetida en las últimas seis jornadas previas
  del mismo turno; desempate por aparición más reciente y valor.
Son **hipótesis exploratorias fuera del tablero**, no reglas validadas del método
manual. Se elige un único prefijo por candidato, nunca los diez.

## Resultados exactos VT4 sobre ternas VT3 Top3 ya preseleccionadas
| Período | VT3 exactos | ULTIMO_VT2 | ULTIMA_CABEZA | MODA_6D | Esperanza azar para estrategia completa |
|---|---:|---:|---:|---:|---:|
| 2024 | 14 | 0 | 3 | 0 | 1,4 |
| 2025 | 13 | 0 | 1 | 1 | 1,3 |
| enero-mayo 2026 | 5 | 0 | 0 | 1 | 0,5 |
| junio-septiembre 2026 | 7 | 0 | 0 | 2 | 0,7 |
| **Total** | **39** | **0** | **4** | **4** | **3,9** |

La regla \`ULTIMO_VT2\` se abstiene bastante: no tiene 39 oportunidades
condicionales completas, por lo cual no corresponde compararla con la
misma expectativa 3,9 de las reglas de cobertura total.
\`MODA_6D\`: de sus cuatro VT4 exactos, tres eran extrapolaciones sin
trayectoria VT4 física compatible; uno sí tenía extensión física.
\`ULTIMA_CABEZA\`: sus cuatro VT4 acertados fueron extrapolados no físicos.

**Conclusión:** alguna extensión no física acertó, pero cuatro aciertos
frente a ~3,9 esperados en el control de prefijo equiprobable NO demuestra
ventaja predictiva, ni permite escoger la regla ganadora ex post.
Los períodos usados siguen siendo material exploratorio.

## Pruebas y trazabilidad
- Archivo \`scripts/test-vt4extra7d.cjs\`: asegura que una cabeza futura no
  altera el prefijo seleccionado y etiqueta \`EXTRA_SIN_TRAZO_FISICO\`.
- Archivo \`scripts/run-vt4extra7d.cjs\`: prueba cronológica con cuatro períodos
  y control condicionado a VT3 acertado.
- Workflow de GitHub \`.github/workflows/vt4-extra-study.yml\`.
- Ejecución y artefactos con detalle por fecha y turno:
  https://github.com/y0t3/Modelo-Papa/actions/runs/38023760729
- El sellado pre-sorteo \`scripts/freeze-prospective7d.cjs\` incluye desde
  ahora las propuestas de VT4 extra **con su procedencia**, únicamente como
  anexo experimental, sin influir en las candidatas VT3/VT2 del lector.

## Regla de continuación
Conservar la posibilidad opcional VT4 en el motor de investigación,
etiquetada y sin confundirla con un recorrido físico. No promover
\`MODA_6D\`, \`ULTIMA_CABEZA\` ni \`ULTIMO_VT2\` al motor final sin
comprobación prospectiva. La prioridad de trabajo permanece en
**seleccionar mejor las figuras VT3** por su evolución visual.
