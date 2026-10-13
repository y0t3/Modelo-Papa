# VT3: inventario completo y prioridad de bifurcaciones — resultado

13/10/2026. Continúa el diagnóstico de 851/615/242 de la Nocturna del 12/10. 815 fue un error de tipeo corregido por el usuario. Foco exclusivo VT3. No cambia producción.

## Ejecución y trazabilidad

- Rama: `lab-vt3-cobertura-bifurcaciones-13oct2026`.
- Código, protocolo y hash PRE congelados antes del POST local en `7d92595471ab35e11b4706fac7dd6c61afd418d9`.
- [GitHub Actions 38346306572](https://github.com/y0t3/Modelo-Papa/actions/runs/38346306572): todos los pasos correctos. El workflow exige que los hashes regenerados coincidan con `SELLO_ESPERADO.json` publicado antes del contraste.
- Resultados permanentes respaldados por Actions en commit `1ecd580d964ec49c6e5595e03d918037f8ce809c`.
- PRE 115 SHA256: `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`.
- Simulación separada 12/10 SHA256: `9cf1cc482996a5d3c1e8d7d2e0f218e28bf23e8098c64008b3dc04b22c9d9962`.

Protocolo: `PROTOCOLO_VT3_COBERTURA_BIFURCACIONES_13OCT2026.md`. Script: `scripts/lab-vt3-cobertura-bifurcaciones.mjs`. Node 24, sin dependencias externas. PRE no carga objetivos POST; los turnos objetivo/futuros se excluyen de la entrada de cada corte. Se reproduce el original 5/8/15 y su cobertura 46, 64 familias ganadoras y 6.389 familias acumuladas.

## Cambios comparados

1. **A Original:** bolsa y ranking intactos.
2. **B Inventario:** todos los recorridos VT3 físicamente válidos y sus familias; prioridad original. Fuentes y bloques describen el inventario completo, pero raíces y bifurcaciones conservan exactamente el respaldo original.
3. **C Sin prioridad absoluta de bifurcación:** misma bolsa original; primero D−1, D−7, fuentes y bloques, después bifurcaciones.
4. **D Ambos:** inventario completo y orden C.

Diez familias siempre, no diez números ni diez recorridos. Familias reversibles sin mezclar permutaciones. Las rutas agregadas tienen `anchored:false` y `rootIds:[]`; no se les prestan raíces. No se crean nuevas bifurcaciones. Completar el inventario no equivale a demostrar un anclaje histórico.

El inventario se enumeró con un DFS y se verificó contra `findPaths`, que usa la hoja. Se conservan los **27.900 recorridos familia×corte** físicos, sin duplicar reversos exactos; **10.808** estaban admitidos por el motor. No son 27.900 recorridos independientes. Todos quedan en PRE con fuente, casillas, lectura y procedencia.

## Resultados en 115 cortes / 23 jornadas

| Método | Top3 | Top5 | Top10 | Cortes con ganadora en bolsa | Exposiciones ganadoras | Familias acumuladas |
|---|---:|---:|---:|---:|---:|---:|
| A Original | 5 | 8 | 15 | 46 | 64 | 6.389 |
| B Inventario | 5 | 8 | 15 | 80 | 143 | 15.273 |
| C Bifurcación al final | 9 | 12 | 16 | 46 | 64 | 6.389 |
| D Ambos | 9 | 12 | 15 | 80 | 143 | 15.273 |

TopN cuenta cortes con una o más coincidencias. Exposiciones ganadoras cuenta familias×corte; no confundir con cantidad de cortes. La referencia uniforme condicionada a cada bolsa y cupo Top10 suma 10,631 para A/C y 10,578 para B/D: descripción, no prueba confirmatoria ni probabilidad de lotería.

**Cobertura:** el inventario incluye 79 exposiciones de familias ganadoras antes ausentes, y alcanza 34 cortes adicionales. Pero más que duplica las familias ofrecidas. Ninguna familia nueva sin anclaje entra al Top10 en ninguno de los 115 cortes, bajo ninguno de los cuatro métodos. En B/D hay cero plazas Top10 sin anclaje. Las reglas siguen dando prioridad a familias con raíces; por eso ampliar la bolsa no resuelve la selección de las nuevas familias.

**Ranking:** retrasar la bifurcación mejora Top3/5 retrospectivamente, pero Top10 apenas cambia: cuatro cortes ganados y tres perdidos. Combinarlo con inventario completo pierde uno más y vuelve a 15/115. No hay criterio nuevo listo para producción.

## Ganancias y pérdidas Top10 contra el original

- B: gana 15/09 Previa; pierde 18/09 Nocturno. Neto cero. Cambia el orden o integrantes Top10 en 88 cortes.
- C: gana 15/09 Previa, 21/09 Vespertino, 21/09 Nocturno, 28/09 Matutino; pierde 18/09 Nocturno, 24/09 Previa, 03/10 Matutino. Neto +1. Cambia los Tops en los 115 cortes.
- D: mismas cuatro ganancias de C, mismas tres pérdidas y además 10/10 Nocturno. Neto cero.

Dos ganancias de C/D ocurren el mismo día 21/09. No son observaciones independientes.

## La diferencia no se sostiene igual en octubre

| Período | Método | Top3 | Top5 | Top10 |
|---|---|---:|---:|---:|
| Septiembre, 70 cortes | A | 3 | 4 | 10 |
| Septiembre, 70 cortes | B | 3 | 4 | 10 |
| Septiembre, 70 cortes | C | 7 | 9 | 12 |
| Septiembre, 70 cortes | D | 7 | 10 | 12 |
| Octubre, 45 cortes | A | 2 | 4 | 5 |
| Octubre, 45 cortes | B | 2 | 4 | 5 |
| Octubre, 45 cortes | C | 2 | 3 | 4 |
| Octubre, 45 cortes | D | 2 | 2 | 3 |

Mover bifurcaciones al final tampoco elimina la concentración en la fuente Nocturna anterior: con la misma bolsa y la misma definición de ruta admitida, sus presencias entre familias Top10 aumentan de **707/1.150 plazas** (A) a **843/1.150** (C). Son presencias de esa fuente, no fuentes exclusivas; una familia puede pertenecer a varias. El orden alternativo sigue priorizando raíces D−1/D−7 y favorece fuertemente familias ya ancladas.

## Nocturna del 12/10 — diagnóstico separado, resultado conocido

| VT3 | A Original | B Inventario | C Bifurcación al final | D Ambos |
|---|---:|---:|---:|---:|
| 851 | Ausente | 127 | Ausente | 127 |
| 615 | 54 | 43 | 54 | 43 |
| 242 | 25 | 23 | 24 | 22 |
| 290 | Ausente | Ausente | Ausente | Ausente |
| 264 | Ausente | Ausente | Ausente | Ausente |

Bolsa A/C: 61 familias; B/D: 172. Los cuatro Top10 quedan en cero en esta Nocturna. 851 entra al inventario pero no recibe raíces nuevas; 615 mejora por su segunda fuente física; 242 mejora por completar su segundo bloque. Ninguna de esas correcciones alcanza para subirlas al Top10.

Esta simulación no altera el PRE original ni su resultado prospectivo. Es una auditoría POST de reglas inspiradas en un resultado conocido, no validación externa.

## Conclusión y siguiente pregunta

Se verificó una pérdida de cobertura por el filtro histórico, pero completarla no mejora por sí sola la selección. La prioridad absoluta de bifurcaciones tampoco explica sola el problema: al moverla aparecen mejoras de Top3/5 históricas, una mejora mínima de Top10 y retrocesos en octubre. El orden por raíces sigue cerrando el Top a toda familia sin anclaje D−1/D−7.

No elegir una nueva regla para forzar 851/615/242. La pregunta siguiente sigue siendo qué evidencia visual **anterior al turno objetivo** permite distinguir familias físicamente disponibles. No queda aprobado otro ranking por esta ejecución.

### Evitar repetir líneas ya investigadas

Se revisaron los puntos de control anteriores antes de fijar la continuación:
- `PUNTO_CONTROL_VT3_OCHO_SIN_BOLSA_ONCE_FUERA_TOP_D2_Y_CONTACTO_115_12OCT2026.md` ya registraba el techo físico **80/115** y media **132,81 familias/corte**, igual al inventario reconstruido aquí. Por tanto, ese techo es una reproducción, no un descubrimiento nuevo. También registraba cuotas de bifurcaciones 7+3 y 5+5 inferiores al ranking D−7 original, y ampliación por contactos sin mejora suficiente.
- `PUNTO_CONTROL_CONTACTOS_FISICOS_PRE_VS_POST_95_CORTES_2026_10_10.md` ya ensayó contacto con marcas anteriores del día: VT3 10/304 con contacto frente a 5/138 sin contacto, muchos empates en comparaciones por fecha/turno/fuente y falsas alarmas. Su decisión fue **no bonificar contacto, celdas compartidas o cantidad de cabezas**. No presentar esa idea como inédita ni volver a agregarla por defecto.

La aportación específica de este ensayo es aislar los dos cambios en **el motor Lalo vigente** y medir cómo afectan su orden y sus rutas, manteniendo los mismos diez puestos. No reemplaza los ensayos anteriores con otras bolsas.

La continuación deberá partir de las hojas completas marcadas y comparar recorridos candidatos con alternativas negativas físicamente equivalentes, documentando fuente, posición y disponibilidad temporal; cualquier selección visual nueva debe registrarse antes de un resultado desconocido. Los 115 cortes reutilizados sirven para diagnóstico, pero no permiten convertir esta búsqueda acumulada en una validación nueva. VT4 permanece en pausa.

## Archivos permanentes

En `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/`:
- `PRE_115.json`: inventario completo, procedencia de cada ruta y cuatro rankings por corte.
- `SELLO_ESPERADO.json` y `SELLO.json`: hashes prepublicados y reproducidos.
- `POST_115.json` y `RESUMEN.json`: contraste por corte, mes, turno y jornada, con pérdidas.
- `NOCTURNA_SIMULACION.json` y `NOCTURNA_POST_DIAGNOSTICO.json`: caso 12/10 separado.

No se modifica `src/motorLalo.ts`, la APK ni las propuestas selladas. VT4 permanece fuera del foco.
