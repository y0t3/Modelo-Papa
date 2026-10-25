# Lalo VT3 — cadenas de activación consecutiva (25/10/2026)

**Estado: LABORATORIO. MV1, `main` y APK intactos. No activar estas reglas como predicción oficial.**

## Pregunta
La comparación del sábado 24/10 mostró cinco cabezas VT3 físicamente posibles pero no reconocidas por el motor, y antecedentes con la misma figura dentro de las últimas seis jornadas. ¿Exigir dos activaciones **consecutivas** de una misma forma, con desplazamiento de posición y fuente compatible con el aterrizaje actual, mejora la selección frente a figuras con antecedentes aislados?

## Protocolo PRE/POST
- 124 jornadas, **620 cortes**, junio al 24/10, con fechas sin sorteo omitidas según el histórico.
- Fuentes actuales y de historia basadas en última Nocturna **real por jurisdicción**, sin inventar sorteos de Montevideo. Los turnos publicados de Montevideo se incluyen si efectivamente hay cabeza, incluso Matutino.
- Para cada corte se construye una hoja nueva con únicamente las cabezas del **mismo día de los turnos anteriores**; no incorpora el turno objetivo ni sus resultados posteriores.
- La figura histórica solo existe como *activación* cuando un recorrido válido explicó una **cabeza publicada de una jornada previa**. Misma silueta geométrica, valor numérico diferente admitido; misma figura no significa mismo número.
- Una jornada anterior cuenta como consecutiva si es la siguiente jornada efectiva con resultados en el histórico, omitiendo domingos/feriados sin sorteo.
- VT3: caminos contiguos de **tres celdas de una misma columna +11**, rotación/inversión de madre permitido, sin atravesar columnas. Las comparaciones **entre fuentes** no son recorridos dentro de una hoja.
- Cada pareja de eventos de cabezas ganadoras históricas se contabiliza **una vez**, aunque admita distintos caminos o anclas. Evita inflar prioridad por figuras densas.
- Solo compiten las familias físicamente posibles **ausentes del ranking completo MV1**. Se sustituye, como máximo, el puesto **#10**. Los puestos #1–9, VT2 y VT4 no se modifican.
- Aciertos medidos POST frente al turno objetivo. Controles condicionales de 10.000 simulaciones por periodo, eligiendo al azar dentro del **mismo conjunto elegible** de cada corte y con el mismo cupo.

## Reglas geométricas ensayadas
1. `CHAINS`: activaciones reales en dos jornadas previas consecutivas, con **misma silueta**, salto horizontal de fuente de máximo una columna y cambio de ancla vertical de máximo una fila entre las dos; aterrizaje actual a máximo una columna y una fila de la activación más reciente.
2. `VERTICAL`: caso anterior pero las tres figuras permanecen en la **misma fuente** y el cambio firmado de fila (arriba, quieto o abajo) es exactamente el mismo entre el antecedente más antiguo, el más reciente y la figura actual.
3. `RIGHT`: caso anterior pero la silueta pasa de fuente s−2 a s−1 y el candidato actual se encuentra en s, **una fuente a la derecha por paso**. No se recorre la frontera entre columnas de una hoja; son tres apariciones en hojas diferentes.

Orden de desempate PRE: mayor número de **parejas distintas de eventos ganadores**, pareja más reciente, número de eventos recientes, familia en orden léxico. Las tres reglas se probaron independientemente; no se eligió la más favorable antes de mirar resultados futuros.

## Reproducción exacta del control histórico
**620 cortes** y coincidencias MV1 Top3 **17**, Top5 **35**, Top10 **59**. Una aserción bloquea la ejecución si esas cantidades no se reproducen.

| Regla | Cortes con alguna elegible | Familias elegibles promedio por corte con opción | Nuevos | Desplazados | Top10 resultante | Réplicas aleatorias con al menos tantos nuevos aciertos |
|---|---:|---:|---:|---:|---:|---:|
| CHAINS | 605 | 17,88 | 3 | 3 | **59** | **94,19%** |
| VERTICAL | 331 | 1,83 | 5 | 1 | **63** | **52,79%** |
| RIGHT | 280 | 5,34 | 1 | 1 | **59** | **100%** |

La `VERTICAL` entregó cinco aciertos nuevos, pero el control comparable produjo en promedio **4,65** nuevos y la misma regla obtuvo un valor de **52,79%** de controles igual o mejor. Eso no es evidencia de ventaja estadística.

### Resultados por períodos

| Período | Lalo Top10 | CHAINS | VERTICAL | RIGHT |
|---|---:|---:|---:|---:|
| Junio–julio | 24 | 26 | 27 | 25 |
| Agosto–septiembre | 20 | 20 | 20 | 20 |
| Octubre (hasta 24/10) | 15 | 13 | 16 | 14 |
| **Total** | **59** | **59** | **63** | **59** |

El criterio `CHAINS` empeoró en octubre. El patrón `VERTICAL` apenas aporta +1 neto en octubre y 0 en agosto–septiembre; no muestra estabilidad suficiente.

## El sábado 24/10 — cinco testigos que NO forman cadena consecutiva

| Turno | Cabeza | Madre VT3 física | Parejas válidas CHAINS | VERTICAL | RIGHT |
|---|---|---|---:|---:|---:|
| Primera, Provincia | `9379` | `379/973` | 0 | 0 | 0 |
| Primera, Córdoba | `1573` | `375/573` | 0 | 0 | 0 |
| Matutino, Ciudad | `9321` | `123/321` | 0 | 0 | 0 |
| Vespertino, Provincia | `5693` | `396/693` | 0 | 0 | 0 |
| Nocturno, Córdoba | `5739` | `739/937` | 0 | 0 | 0 |

Por ejemplo, antes de **Nocturno** había 149 familias físicamente posibles no reconocidas; de ellas solo **9** cumplían `CHAINS`, **1** cumplía `VERTICAL` y **0** `RIGHT`. La cabeza ganadora `5739` no cumplía ninguna de esas reglas. Lo mismo sucedió con los otros cuatro casos.

**Interpretación:** los cinco casos del sábado tienen antecedentes geométricos históricos aislados o no consecutivos. Forzar una cadena continua deja de recuperarlos; la continuidad más exigente filtra sin demostrar mejora predictiva.

## Límites y decisión
- Estos resultados proceden de experimentos exploratorios sobre datos que ya se investigaron. Varios criterios y períodos han sido probados; ningún valor obtenido aquí valida un método de apuesta ni predice una lotería aleatoria mejor que el azar.
- Ninguna regla crea una madre VT3 nueva oficial, ni cambia la cuarta cifra de VT4. `VERTICAL` se conserva solo como ensayo aislado reproducible, no se adopta en MV1.
- La siguiente comparación, si se realiza, debería tratar de modo explícito **reapariciones discontinuas** en ventana corta con control de candidatos elegibles, no asumir que toda figura viajó entre todas las jornadas.
- Un camino de comparación más fiable es seguir elecciones selladas antes de nuevos sorteos, sin elegir fórmulas tras ver los resultados.

## Archivos y ejecución
- `scripts/lab-vt3-cadenas-activadas.ts` — reconstrucción PRE, parejas históricas, elecciones alternativas, control aleatorio y resumen POST.
- [GitHub Actions #40187770081](https://github.com/y0t3/Modelo-Papa/actions/runs/40187770081) — ejecución con resultado exitoso y pruebas automáticas de motor MV1 y Nocturnas por jurisdicción aprobadas.
- `resumen-verificado.json` — copia versionada del resultado reproducible, cinco testigos y desglose cronológico.
- Artefacto de ejecución `laboratorio-vt3-cadenas-consecutivas` — `resumen.json` y `cortes.json` para todas las familias/cortes.
