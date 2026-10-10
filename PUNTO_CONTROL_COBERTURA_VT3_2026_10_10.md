# Modelo Papá — Punto de control: cobertura REAL de VT3
Fecha 2026-10-10 · Rama \`experimento-analisis-visual-5d\`

## Hallazgo principal
El motor VT3 combinado D−7 no falla primordialmente por no ordenar bien las
candidatas que considera. Su límite mayor es **qué rutas admite como
candidatos**: exige que ya hayan sido ganadoras exactamente D−7, después
reproduce esas celdas sobre el tablero del objetivo D.

Hasta ahora se probaron múltiples reordenamientos del mismo conjunto
(sufijos VT2 independientes, rutas repetidas, traslaciones, etc.) con
poca o nula mejora. No seguir retocando esos pesos sin resolver
primero la COBERTURA de rutas.

## Auditoría de cobertura, D−7, D−14 y red física
Una terna ganadora se cuenta sólo una vez POR TURNO aunque tenga varias
cabezas coincidentes o recorridos válidos. Es la sufijación VT3 de las
cabezas reales, comparada POSTERIORMENTE con conjuntos de valores
que se construyeron sin ver el sorteo objetivo.

| Período | Terminaciones VT3 ganadoras distintas | En alguna ruta física del tablero D | En ruta ganadora D−7 proyectada | Aciertos Top3 D−7 | Adicionales cubiertas por D−14, no D−7 |
|---|---:|---:|---:|---:|---:|
| 2024 | 7919 | 2013 | 19 | 14 | 21 |
| 2025 | 7869 | 2072 | 19 | 13 | 21 |
| Ene–may 2026 | 3022 | 789 | 5 | 5 | 10 |
| Jun–sep 2026 | 2569 | 662 | 8 | 7 | 4 |
| **Total** | **21379** | **5536** | **51** | **39** | **56** |

Estos valores de COBERTURA NO son predicciones ni aciertos reales de
otra política. Son **cotas retrospectivas**:
- El máximo de selección entre el conjunto D−7 habría sido 51
  coincidencias VT3, independientemente de cómo se ordenaran sus rutas.
- El Top3 congelado logró 39.
- La unión de TODOS los recorridos ganadores D−7 y D−14 ampliaba
  la cobertura retrospectiva total a 107 terminaciones VT3.
- El conjunto de TODOS los recorridos físicos posibles, sin restringirse
  a ganadores previos, contenía 5536 terminaciones ganadoras.
  Ello NO demuestra que esas cifras fueran anticipables.
- Las otras 15843 terminaciones VT3 no eran físicamente formables en
  la hoja previa al turno. La idea de papá sigue siendo visual y no se
  deben fabricar recorridos fuera del tablero para VT3 físico.

## Red histórica de VT3
Se reconstruyó el grafo de recorridos VT3 ganadores del mismo turno y
columna, eliminando duplicados de la misma ruta física asociados a
diferentes cabezas. Se registraron nodos compartidos, bifurcaciones,
convergencias, formas relativas, zonas y traslaciones D−14→D−7.
Estas métricas son descriptivas; sus caminos superpuestos NO son
sorteos independientes y sus cantidades no equivalen a prioridad.

Código:
- \`src/vt3NetworkCoverage7d.ts\`
- \`scripts/test-vt3-network-coverage7d.cjs\`
- \`scripts/run-vt3-network-coverage7d.cjs\`
- \`.github/workflows/vt3-network-coverage7d.yml\`

Ejecución completa (cuatro años/ventanas, todo verde):
https://github.com/y0t3/Modelo-Papa/actions/runs/38025567948

Los JSON de la ejecución incluyen cada fecha, turno, resultado y
metadatos de bifurcaciones y cobertura. El cálculo de D−14 y D−7
ocurre ANTES de abrir la cabeza D.

## Ensayo adicional de generación: reserva D−14 en cupos vacíos
Para NO arruinar el lector actual se realizó un ensayo optativo:
- Preservar estrictamente todos los candidatos VT3 que ya eligió D−7.
- Sólo si el Top3 tiene plazas sin ocupar, rellenarlas con rutas
  ganadoras de D−14, proyectables físicamente en D.
- Excluir las cifras presentes en cualquier recorrido ganador D−7,
  aunque no hayan entrado en el Top3.
- Orden predeclarado neutro: columna de origen y celdas de lectura.
- Hasta un máximo de tres VT3 por turno. No ampliar más.
- El sorteo D se usa SOLO para cotejar. Control: mismo número de
  reservas sorteadas aleatoriamente del mismo conjunto D−14 exclusivo.

| Período | VT3 Top3 D−7 | Reservas agregadas | VT3 con reservas | Ganancia | Ganancia esperada al azar de igual presupuesto |
|---|---:|---:|---:|---:|---:|
| 2024 | 14 | 919 | 21 | +7 | 6,533 |
| 2025 | 13 | 976 | 17 | +4 | 5,453 |
| Ene–may 2026 | 5 | 383 | 9 | +4 | 3,643 |
| Jun–sep 2026 | 7 | 288 | 9 | +2 | 1,433 |
| **Total** | **39** | **2566** | **56** | **+17** | **17,062** |

La reserva encontró 17 VT3 adicionales pero agregó 2566 candidatos, por
lo que quedó **a nivel del azar físico D−14 de igual presupuesto**.
NO promover la regla neutra de reservas como selección definitiva.
Tampoco equiparar «17 adicionales» con 17 aciertos independientes
causados por una memoria mejor: se aumentó el número de propuestas.

Código:
- \`src/vt3D14Reserve7d.ts\`
- \`scripts/test-vt3-d14-reserve7d.cjs\`
- \`scripts/run-vt3-d14-reserve7d.cjs\`
- \`.github/workflows/vt3-d14-reserve7d.yml\`
- https://github.com/y0t3/Modelo-Papa/actions/runs/38025737890

## Decisión de investigación — nueva división imprescindible
Dos problemas distintos:
1. **GENERACIÓN:** ¿de dónde obtener las ternas geométricas físicas
   candidatas en D sin limitarse a las rutas ganadoras D−7?
2. **SELECCIÓN:** ¿qué evidencia visual observada ANTES del sorteo
   realmente discrimina cuáles de esas ternas tienen más posibilidades?

Ninguna propuesta nueva queda integrada en el selector principal ni APK.
\`main\`, regla +11, continuidad de rutas, prohibición de cruces entre
columnas y registros VT2/VT4 siguen preservados.

## Próximo trabajo propuesto
En vez de inventar más pesos de prioridad, explorar visualmente
**qué figuras nacen de bifurcaciones, convergencias y desplazamientos
con continuidad histórica**, y clasificar su geometría/columna/zona
sin proyectar aciertos retrospectivos como si fueran prospectivos.
Cualquier selector deberá mantener cupo fijo y superar contra un
CONTROL físico de igual presupuesto en varias ventanas y,
posteriormente, en un período prospectivo sin ajustes.

VT3 prioridad principal; VT2 memoria de apoyo sin borrar; VT4
físico o extra como extensión separada, nunca contabilizar un
VT2 contenido como sorteo independiente.
