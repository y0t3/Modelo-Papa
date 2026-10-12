# Atlas de persistencia física VT4: todo el tablero frente a Top 10 · 115 cortes

**12/10/2026. Prueba completada sobre las hojas históricas disponibles** (23 jornadas, 115 cortes). No se esperó otro sorteo y no se modificaron `main`, los motores oficiales, los Tops V7–V14, el marcado automático de cabezas de la hoja +11 ni la APK. Es exploración retrospectiva, no un pronóstico futuro.

## Pregunta resuelta

Al estudiar reapariciones de hijas VT4 entre jornadas, **la desaparición del Top 10 no equivale a desaparición de la familia física**. Por eso se enumeraron exhaustivamente **todas las trayectorias legales de cuatro celdas** de cada una de las 115 grillas fecha×fuente de 6×2: vecinos incluida diagonal, cuatro celdas distintas, sin vacíos ni cruces de columna de fuente, lecturas reversibles. No se añadieron marcas manuales a la hoja: se trata de un **inventario de posibilidades físicas**, no de los recorridos marcados automáticamente a partir de cabezas publicadas.

Para evitar duplicar hasta cinco veces una misma pareja de fuentes vista en Previa/Primera/Matutina/Vespertina/Nocturna, los comparadores D−1 y D−7 contabilizan **una pareja de fechas/fuente sólo una vez**.

## Comparación cronológica por fecha y misma fuente

| Indicador | Última jornada con sorteo (D−1 operativa) | D−7 |
|---|---:|---:|
| Parejas fecha×fuente comparadas | **110** | **85** |
| Familias físicas VT4 reversibles compartidas | **499** | **253** |
| Con al menos una forma relativa compartida | **12** | **4** |
| Con el mismo recorrido de cuatro casilleros | **6** | **3** |
| **Bloques físicos de cuatro casilleros independientes**, deduplicados | **1** | **2** |
| Jaccard promedio familias físicas por fuente | **1,7095 %** | **1,1177 %** |

Se reconstruyeron **15.542 exposiciones familia×fecha×fuente** en 115 fuentes. Si se repitieran los mismos bloques para cada uno de los cinco cortes del día, serían **1.425** reapariciones D−1 en 330 exposiciones corte×fuente, pero **NO 1.425 casos geométricos independientes**. La cantidad correcta es **499 reapariciones por parejas únicas de fecha/fuente**.

La antigua comparación **sólo entre madres Top10** obtuvo **39 reapariciones de hija×fuente seleccionadas en ambas hojas** sobre las 110 parejas fecha×turno, **0** con los mismos cuatro casilleros y **0** con convergencia espacial estricta en ambas. Al deduplicar fecha×fuente, **19 de las 499 reapariciones físicas** entraron a Top10 de ambas jornadas en al menos un turno comparable. Por tanto, el Top10 es demasiado estrecho para servir como catálogo morfológico completo; **esto NO es una razón para ampliar las apuestas ni alterar los Top**.

### Corrección física: seis familias no son seis figuras

En **24→25/09, fuente Vespertina +11**, las seis familias reversibles `0023`, `0032`, `0203`, `0230`, `0302`, `2003` conservaron un recorrido de cuatro celdas. **Todas pertenecen al mismo bloque de posiciones `(4,0), (4,1), (5,0), (5,1)`**. Seis lecturas de un mismo conjunto de celdas no son seis testimonios geométricos independientes. Los 3 casos D−7 de continuidad exacta corresponden a dos bloques.

## Control temporal sin inventar futuros

Se comparó cada día/fuente contra una jornada previa real elegida uniformemente entre las ya disponibles (10.000 re-muestreos con semilla 20261011), conservando siempre el tablero objetivo y la fuente. Para D−7 sólo se eligieron referencias al menos siete días anteriores.

- **D−1**: 1,7095 % frente a referencia **1,3687 %**. Diferencia **+0,3407 puntos porcentuales**, intervalo bootstrap agrupado en las 22 transiciones completas **[−0,0313; +0,7722] pp**; cola aleatoria nominal descriptiva 0,0581.
- **D−7**: 1,1177 % frente a referencia **1,2256 %**; cola nominal descriptiva 0,6857.

No hay continuidad temporal suficientemente robusta para crear una regla predictiva. Los días Sept/Oct fueron investigados muchas veces; no son muestra confirmatoria independiente.

**POST separado:** de 330 exposiciones corte×fuente correspondientes a reapariciones D−1, **cero familias repetidas** coincidieron con las cinco cabezas objetivo de esos turnos. La cobertura del subconjunto repetido es mínima; ese cero no justifica vetar familias por repetición.

## Archivo de conversación reproducible

**`modelo-papa-transiciones-vt4-tablero-completo-115-cortes-12oct2026.zip`**, 11 archivos, **724.653 bytes**, **SHA256 `33229b0f7c4de96d85591105ad0c65ebd682add2090ea5d852c1b28f66aae0f4`**. Incluye:
- `FUENTE_PRE.json` — corpus de convergencias previo congelado, hash `d16c83088fb8c6f740dfb21af5b54c6d59bf502145f201d94a8e1b60078623c4`.
- `FUENTE_POST.json` — los resultados históricos, físicamente separables.
- `analizar.py pre|post|verify`, `visores.py pre|post` — Python 3 estándar sin dependencias.
- `TRANSICIONES_PRE.json` — **hash `cfc21c1de1b29cfbd5e1405d1ec20cde0c3d917cd784ca0d274eebfbd8e3e991`**, comprobado sin ningún fichero POST.
- `TRANSICIONES_POST.json` — **hash `0aff3bb99a6b599dc4b538e0ab80f417ab943f789bc3845000603b270a707dd8`**.
- `RESUMEN_POR_FUENTE.csv`, `INFORME.md`, `LEEME.md`.
- `VISOR_TRANSICIONES_PRE.html` y `VISOR_TRANSICIONES_POST.html` — ambas hojas, todos los caminos de cada familia, filtros D−1/D−7, fuente, turno, familia, misma forma, mismas celdas, presencia en ambos Top10; el POST añade cabezas objetivo después de su cálculo.

**Verificación independiente real:** ZIP íntegro, extraído en carpeta nueva, eliminado físicamente **TODO archivo POST**, ejecutado `analizar.py pre`, `verify` y `visores.py pre`: mismo hash PRE, CSV y visor byte a byte. Luego se repuso POST y se regeneraron **cinco salidas idénticas** (PRE/POST JSON, CSV, dos HTML). Auditoría por lectura de celdas, vecindad y reversibilidad. **Ambos visores probados en Chromium**: 25/09 D1 fuente Vespertina, «mismos casilleros» = seis familias, búsqueda `0203`, dos SVG, sin errores JavaScript. PRE no contiene campo `targetHeads`.

## Decisión de diseño

**Para el observatorio visual utilizar un catálogo de rutas completo independiente de los Top**, pero mantener las propuestas predictivas oficiales inalteradas. Separar e identificar:
1. Repetición de **la misma familia numérica**.
2. Repetición de **firma de forma**.
3. Repetición de **casilleros físicos exactos** (deduplicados por conjunto de celdas).
4. **Traslado de una huella histórica confirmada a otra familia numérica** — el mecanismo central D−7, diferente a los tres anteriores.
5. Dos **cabezas completas históricas independientes** que llegan a una misma hija VT4 físicamente testificada, sin prestar evidencia entre hermanas.

Siguiente análisis factible hoy con fuentes existentes: aplicar el inventario completo a las **transiciones de FORMAS antiguas confirmadas que PRODUCEN NUEVAS FAMILIAS**, deduplicando rutas equivalentes, en vez de limitarse a preguntar por la repetición literal VT4.
