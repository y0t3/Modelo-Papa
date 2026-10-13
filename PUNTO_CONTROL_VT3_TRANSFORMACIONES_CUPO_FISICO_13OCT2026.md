# Punto de control VT3 — transformar bloques y controlar el cupo físico libre
13 de octubre de 2026 · Proyecto Modelo Papá.

## Verificaciones y ramas independientes
1. `lab-vt3-transformaciones-bloque-13oct2026`, [GitHub Actions 38360385393](https://github.com/y0t3/Modelo-Papa/actions/runs/38360385393). Protocolo PRE `PROTOCOLO_VT3_TRANSFORMACIONES_BLOQUE_13OCT2026.md`. Sus datos están en `auditorias/vt3-transformaciones-bloque-115-13oct2026/`.
2. `lab-vt3-cupo-fisico-controles-13oct2026`, [GitHub Actions 38360937559](https://github.com/y0t3/Modelo-Papa/actions/runs/38360937559). Protocolo independiente `PROTOCOLO_VT3_CUPO_FISICO_CONTROLES_13OCT2026.md`, salidas en `auditorias/vt3-cupo-fisico-controles-115-13oct2026/`.

Ambos laboratorios separaron PRE y POST físicamente antes de preparar sus Tops experimentales, comprobaron hashes y dejaron inalterados `main`, motor de producción, la hoja diaria +11, marcas, Top sellados, APK y VT4. **Ninguno es una prueba prospectiva**, porque las mismas 23 fechas ya han sido exploradas en muchas hipótesis.

## Laboratorio 1: cambios de bloques entre jornadas en una misma fuente

Cada bloque = tres celdas únicas. Para un mismo nombre reversible de familia, se comparó cada fuente física únicamente con la misma fuente del turno homónimo en la jornada operativa anterior. Se deduplicaron orientaciones de un bloque y se distinguieron formas idénticas, movimiento rígido posicional, cambio de una de tres celdas, separación completa y ausencia de fuente común anterior.

| Señal por familia × corte | Exposiciones en 115 cortes | Ganadoras posteriores |
|---|---:|---:|
| Bloque idéntico en la misma fuente de la jornada anterior | 86 | 3 |
| Algún bloque diferente que sólo cambia **una celda** | 597 | 5 |
| Igual forma normalizada, trasladada a otra zona de misma fuente | 282 | 2 |
| Sin ninguna fuente homónima con dicha familia en jornada anterior (`allSourcesNew`) | **12.908** | **125** |
| Cambio de forma normalizada entre bloques de fuente comparable | 1.617 | 12 |

Nota crítica: `allSourcesNew` es **muy amplio**: no significa necesariamente que una figura nació hoy. Puede existir en fuentes actuales y no haber existido en esas mismas fuentes en la jornada anterior; por ello hay 12.908 exposiciones, cerca de 85% de las 15.273 exposiciones físicas de familias. No confundir esta bandera con un suceso muy selectivo.

### Rankings con exactamente diez familias VT3
| Política | Top3 | Top5 | Top10 | Rescates/derrotas frente al original |
|---|---:|---:|---:|---|
| Original | 5 | 8 | **15** | — |
| Priorizar ancladas cuya misma forma se trasladó en la fuente | 4 | 6 | 13 | 0/2 |
| Priorizar ancladas con bloque que cambió una casilla | 5 | 8 | 15 | 1/1 |
| Priorizar ancladas con bloque idéntico | 5 | 9 | 15 | 0/0 |
| Priorizar ancladas sin fuente homónima anterior | 4 | 7 | 13 | 0/2 |
| Priorizar traslación y luego cambio de una casilla | 5 | 7 | 12 | 1/4 |
| **Reservar sólo el puesto 10** a un bloque no anclado que cambió una celda | 5 | 8 | **17** | 2/0 |
| **Reservar sólo el puesto 10** a una familia física sin fuente homónima anterior | 5 | 8 | **18** | 3/0 |
| Reservar puesto 10 a una forma física trasladada sin raíz | 5 | 8 | 15 | 0/0 |

Los tres nuevos cortes en la variante 18/115 fueron:
- **30/09 Nocturno**: familia `687/786`.
- **01/10 Matutino**: familia `384/483`.
- **03/10 Vespertino**: familia `429/924`.

## Hallazgo que exige cambiar la interpretación
El puesto **10** original no tuvo **ninguna** ganadora entre las 115 hojas, corroborado directamente en el POST original. Reemplazar sólo esa posición conserva automáticamente los quince cortes originales en **esta muestra**; el hecho de que no haya pérdidas no demuestra precisión de la selección física. El puesto nueve también carecía de coincidencias en este histórico, pero no se modificó en estas variantes.

El hecho de que se obtenga 18/115 en lugar de 15/115 tiene dos componentes:
1. Abrir **una plaza** física sin raíz, que por sí solo puede recuperar cabezas fuera de la bolsa anclada.
2. Escoger **cuál** de docenas de familias ocupa esa plaza, que es el verdadero problema discriminante.

## Laboratorio 2: 2.000 controles neutrales PRE con exactamente la misma elegibilidad
Elegibles = familias físicas sin raíz que, en el mismo turno de la jornada operativa anterior, no tenían recorridos en ninguna de sus fuentes actuales homónimas. **110/115** cortes tuvieron al menos una elegible; **7.403 exposiciones elegibles** en total, promedio **64,37 familias/corte** (máximo 170).

Políticas predefinidas para un único puesto 10, siempre los mismos nueve primeros originales:

| Selección de ese puesto 10 | Top10/115 | Corte(s) nuevos |
|---|---:|---|
| `RENEW_LAST_BLOCKS`: fuente recién disponible, mayor cantidad de bloques y alfabético | **18** | 30/09 N, 01/10 M, 03/10 V |
| Elegible con más bloques, luego última fuente | **17** | 01/10 M, 03/10 V |
| Elegible con más fuentes, luego más bloques | **16** | 03/10 V |
| Elegible con menos bloques | **15** | ninguno |
| Primera elegible alfabéticamente | **15** | ninguno |
| Última elegible alfabéticamente | **16** | 25/09 Previa |
| Selección neutra por hash fijo antes del POST | **15** | ninguno |
| VT3 original | **15** | — |

Además se guardaron **2.000 elecciones uniformes PRE**, una entre las candidatas elegibles en cada corte, con semilla 20261013. Resultados tras POST:
- Media Top10: **15,8185**; mediana **16**.
- Percentiles 5% y 95%: **15 y 18**.
- **101/2.000 (5,05%)** elecciones neutrales consiguieron **18 o más**, igualando/superando `RENEW_LAST_BLOCKS`.
- Máximo 20/115 en algunos controles neutrales; ninguno representa señal predictiva, precisamente porque son elecciones aleatorias.

Se comprobaron 30.000 reasignaciones de jornadas completas, conservando los cinco turnos por fecha; la mejora pareada +3 respecto al original resultó igual o mayor con estos promedios:
- Permutaciones libres: cola exploratoria **0,0392**.
- Sólo mismo día semanal: **0,1349**.
- Sólo mismo mes: **0,0615**.

Las comparaciones *contra hash fijo*, no contra el Top original, arrojan colas libres ~0,0381; por día semanal ~0,1334; por mes ~0,0684. Todos estos números son **descriptivos y posselección de hipótesis**; elegir la mejor de muchas variantes contra las mismas fechas desinfla su significado.

El ranking de «fuente recién incorporada + más bloques» mejora en esta muestra más que algunos desempates ingenuos. Pero los controles y su fragilidad al restringir el emparejamiento de fechas **no sustentan promocionarlo a producción**.

## Nocturna del 12/10: situación del 851
En el PRE de esa Nocturna **97 familias** sin raíz eran elegibles para ocupar el puesto 10 por la regla `allSourcesNew`. Entre ellas estaba **`158/851`**, pero NO ganó la elección: se eligió `124/421` por fuente más reciente y bloques. El 851 tenía una fuente y un bloque, ya disponible desde Primera, y no tenía anclaje propio. El `615` y el `242` sí estaban anclados, pero fuera del Top10; estas variantes que sólo sustituyen la plaza 10 con **familias sin raíz** no pueden incorporarlos. 290 y 264 no tenían ruta física PRE. Todo esto es análisis POST del sorteo ya conocido, no predicción sellada ese día.

## Decisión
- **Conservar** las variantes experimentales como hipótesis, con sus positivos y negativos, pero **sin modificar VT3 oficial**.
- No seguir sumando marcas de antigüedad como votos ni imponer cuota fija por `NACE/CONVERGE`. Medir qué propiedades del bloque nuevo *realmente reducen* las ~64 familias elegibles por corte sin seleccionar arbitrariamente por orden alfabético u otros desempates.
- Las dos preguntas siguen separadas: **admisión** (851) y **ranking de ancladas** (615 y 242). VT4 seguirá esperando.
- Si se implementa en una vista diagnóstica futura, etiquetar la elegibilidad como «sin presencia en fuentes homónimas ayer», NO «nacimiento físico hoy».
- Las loterías son sorteos aleatorios; encontrar forma en resultados anteriores **no implica ventaja demostrada**.

## Evidencia
- `auditorias/vt3-transformaciones-bloque-115-13oct2026/{PRE_115.json,SELLO.json,NOCTURNA_PRE.json,POST_115.json,NOCTURNA_POST.json,RESUMEN.json}`.
- `auditorias/vt3-cupo-fisico-controles-115-13oct2026/{PRE_115.json,RANDOM_PRE.json,SELLO.json,POST_115.json,NOCTURNA_PRE.json,NOCTURNA_POST.json,RESUMEN.json}`.
- [Actions 38360385393](https://github.com/y0t3/Modelo-Papa/actions/runs/38360385393), [Actions 38360937559](https://github.com/y0t3/Modelo-Papa/actions/runs/38360937559), ambos ejecutados satisfactoriamente.
