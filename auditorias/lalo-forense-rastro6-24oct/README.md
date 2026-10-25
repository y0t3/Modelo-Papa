# Informe forense — sábado 24/10: VT3 y genealogía VT4

**25 octubre de 2026.** Investigación retrospectiva en ramas `lab/`. **No cambiar MV1, el repositorio `main`, los Tops oficiales ni la APK.** Los sellados de 24/10 son reconstrucciones estrictas *como si* se estuviera antes de cada turno; **no** tienen sello temporal anterior al sorteo. El sello verdaderamente prospectivo del lunes 26/10 es un experimento distinto y no se modificó.

## Dos fallas distintas que NO se deben confundir

En cada uno de los cinco cortes del sábado se reconstruyó `buildMotorLalo` con las Nocturnas reales por jurisdicción y con solo las cabezas del sábado **ya publicadas en turnos anteriores**. El ranking completo del motor reprodujo exactamente los Tops sellados para VT2, VT3 y VT4 en la rama antecesora.

- **Física:** cinco cabezas VT3 podían dibujarse en las columnas disponibles, sin cruzar columnas ni saltar casillas. Dos cabezas VT4 también tenían trayectoria completa y madre sufijo físicamente válida.
- **Reconocimiento:** las cinco familias VT3 eran **ausentes del ranking completo**, no simplemente puestos superiores a 10. Las dos VT4 tampoco fueron generadas; sus madres VT3 estaban ausentes del reconocimiento del motor.
- **Causa inmediata:** ninguna de las cinco familias VT3 tuvo un antecedente histórico de la misma figura **en la misma columna** en las hojas D−1 (23/10) o D−7 (17/10), las dos raíces del motor.
- **No son fallos de prioridad:** modificar Top3, Top5, Top10 o invertir las cuatro cifras no recupera candidatos que el modelo nunca construyó.

### Los cinco casos

| Turno, jurisdicción | Cabeza | VT3 (familia reversible) | Caminos VT3 | Rastro geométrico más cercano en seis jornadas |
|---|---:|---|---:|---|
| Primera, Provincia | `9379` | `379/973` | 1 | **22/10**, misma columna `Previa`; cabeza histórica Ciudad `8578` |
| Primera, Córdoba | `1573` | `375/573` | 1 | **19/10**, columna vecina (`prevNocturno` → `Previa`); Córdoba `2099` |
| Matutino, Ciudad | `9321` | `123/321` | 1 | **20/10**, misma columna `Previa`; Santa Fé `8568` |
| Vespertino, Provincia | `5693` | `396/693` | 2 | **22/10**, vecina (`Primera` → `Matutino`); Ciudad `9760`, Entre Ríos `8067` |
| Nocturno, Córdoba | `5739` | `739/937` | 2 | **21/10**, vecina (`Primera` → `Matutino`); Córdoba `1746` |

**IMPORTANTE:** igual silueta en otra jornada/columna no demuestra causalmente que una figura “caminó” hasta ahí; es un testigo **compatible** con ese movimiento. Esas cabezas anteriores no se repiten numéricamente: aquí seguimos geometría, no cifras ganadoras.

### VT4: madres físicas ausentes

| Cabeza | Fuente que forma las cuatro | Caminos | Construcción válida | Madre VT3 | Diagnóstico |
|---|---|---:|---|---|---|
| `1573` | Previa | 1 | `1` + `573` | `375/573` | Madre no reconocida; la hija VT4 ni siquiera se genera |
| `5739` | Previa | 1 | `5` + `739` | `739/937` | Madre no reconocida; la hija VT4 ni siquiera se genera |

No se permitió invertir toda VT4 ni fabricar madres diferentes. Ambas extensiones cumplen adyacencia estricta de cuatro celdas.

## Prueba de memoria de 6 jornadas: el problema de discriminación

Se verificaron **seis jornadas completadas**: 17, 19, 20, 21, 22 y 23/10 (de más antigua a más reciente). Los testigos son figuras ganadoras realmente verificadas del pasado; el objetivo 24/10 **no** se consultó al construir la lista elegible PRE.

Se construyeron dos condiciones independientes y su unión puramente **descriptiva**:
- **Misma fuente 6:** hay la misma silueta, columna y proximidad vertical (≤2 filas) en alguna de las seis jornadas previas.
- **Fuente vecina 6:** hay la misma silueta en una columna inmediatamente vecina y proximidad vertical (≤2 filas) en alguna de las seis jornadas previas.
- **Misma O vecina 6:** unión, contada una sola vez por familia y turno. NO equivale a selección de candidatas Top10.

| Corte | Familias VT3 formables no reconocidas | Testigo misma fuente | Testigo vecina | Unión testigos | Cabezas del sábado cubiertas por la unión |
|---|---:|---:|---:|---:|---:|
| Previa | 30 | 17 | 10 | 24 | 0 |
| Primera | 85 | 39 | 52 | 75 | 2 |
| Matutino | 103 | 40 | 62 | 84 | 1 |
| Vespertino | 120 | 42 | 76 | 97 | 1 |
| Nocturno | 149 | 53 | 81 | 109 | 1 |
| **Total de exposiciones familia×corte** | **487** | **191** | **281** | **389** | **5** |

Las **389 exposiciones** representan familias **por corte**, no 389 familias únicas ni 389 aciertos. La unión explica las cinco cabezas VT3 históricamente observadas pero deja muchos competidores; meter todas esas familias en el sistema no sería una selección predictiva. Tampoco permite inferir eficacia estadística con solo cinco coincidencias posteriores.

Una madre VT3 adicional solamente debe poder generar su VT4 cuando su **recorrido físico concreto**, su columna y el prefijo de la hija permitan las cuatro casillas de manera contigua; nunca se asignan VT4 por parecido numérico o por invertir una cuaterna completa.

## Decisión y siguiente línea de investigación

**No adoptar memoria de seis jornadas para ampliar automáticamente el Top10.** El precedente general ya mostró que cambiar solo el puesto 10 según misma fuente seis jornadas ganó 8 cabezas históricas en 620 cortes, pero el control aleatorio condicionado no fue concluyente (aprox. 0,064 de réplicas lo igualaron o superaron).

Lo que sí amerita estudio es si hay continuidad temporal **independiente**, medible sin ver el resultado, que reduzca **antes del sorteo** decenas de figuras físicamente parecidas a muy pocas trayectorias con activaciones sucesivas. La coincidencia aislada de silueta, o la repetición de un mismo evento por varios dibujos, no alcanza. Separar siempre: candidato formable, reconocido, seleccionado y posteriormente acertado.

## Trazabilidad GitHub

- Forense de los cinco reconocimientos, madres VT4 y fuentes físicas: `scripts/lab-forense-vt34-sabado24oct.ts`; [Actions #40185799811](https://github.com/y0t3/Modelo-Papa/actions/runs/40185799811).
- Orígenes geométricos de las seis jornadas y competidores PRE: `scripts/lab-forense-rastro6-24oct.ts`; [Actions #40186178693](https://github.com/y0t3/Modelo-Papa/actions/runs/40186178693).
- Archivos versionados completos: `diagnostico-vt34.json` y `seis-jornadas.json`.
- No se editaron las fuentes del motor oficial. Regresiones MV1 y Nocturna por jurisdicción aprobadas en la primera ejecución; regresión MV1 aprobada en la segunda.
