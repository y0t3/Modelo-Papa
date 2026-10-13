# Punto de control — ampliar madres VT3 respaldadas y techo físico VT4 sin aumentar diez plazas

**13/10/2026. Rama `lab-vt3-apertura-madres-vt4-cobertura-13oct2026`.** GitHub Actions [#38486148174, ejecutada correctamente](https://github.com/y0t3/Modelo-Papa/actions/runs/38486148174). **No se modificó `main`, `src/motorLalo.ts`, app instalada ni sellos o Tops oficiales anteriores.**

## Resultado principal

Sobre 115 cortes (23 jornadas × 5 turnos), se inspeccionaron los **575 resultados de cuatro cifras** de las cinco jurisdicciones argentinas. Para cada corte construimos en PRE, a partir de la hoja física, una tabla ciega de los **10.000 números completos posibles (`0000`…`9999`)** indicando:
1. Posición **más alta** (número más bajo) de una madre VT3 con **recorrido de tres casillas propio admitido y traslado histórico propio**, desde el cual existe un recorrido físico completo VT4 exacto de cuatro casillas.
2. Existencia de una ruta física VT4 completa incluso si todos sus posibles tramos maternos carecieran de raíces.

Las familias VT4 siempre usan **madre VT3 reversible + cifra fija + lado prefijo/sufijo**, sin inversión completa de la cuaterna como etiqueta ni cifras añadidas sin camino; no se mezclan fuentes ni se reutilizan casillas. Cuando una cuaterna es alcanzable por varias madres se cuenta como **una cabeza exacta**.

### Cobertura física posterior, NO aciertos de Top

| Hasta qué puesto admitimos madres VT3 | Cortes con al menos una cabeza exacta construible | Cabezas distintas construibles por corte (sumadas sobre los 115) | Media de números VT4 elegibles distintos **por turno** |
|---|---:|---:|---:|
| Madres #1–#3 | 1/115 | 1 | 44,1 |
| Madres #1–#5 | **6/115** | **7** | 69,8 |
| Madres #1–#10 | 7/115 | 8 | 132,2 |
| Madres #1–#25 | **17/115** | **18** | 332,4 |
| **TODAS las madres VT3 admitidas con raíz** | **32/115** | **38** | **645,7** |
| Todas las geometrías de cuatro cifras, incluso sin raíz materna | 48/115 | 67 | 1.242,3 |

**Incrementos de números ganadores físicamente alcanzables por abrir cada tramo materno:**
- Top3→Top5: **+6** cabezas.
- Top5→Top10: **+1** cabeza, `1977` (15/09 Matutina, madre #7).
- Top10→Top25: **+10** cabezas, incluyendo `7175` (15/09 Previa, madre #11), `6174` (15/09 Nocturna, madre #18), `1438` (17/09 Previa, madre #18), `0724` (22/09 Nocturna, madre #22), `6371` (30/09 Matutina, madre #23).
- Top25→todas las admitidas: **+20** cabezas con mejor madre admitida #26 o posterior, p. ej. `8070` (16/09 Nocturna, #61), `3757` (26/09 Vespertina, #66), `2428` (07/10 Vespertina, #46).
- Madres admitidas→todas las físicas sin anclaje: **+29** cabezas (otras 16 jornadas pasan a tener alguna), por ejemplo `3686` (02/10 Vespertina) y `8393` (10/10 Primera). **No tienen raíz materna comprobada**, por lo que abrir esa última bolsa sería una admisión de otra naturaleza, no simplemente bajar en el ranking VT3.

El techo de cobertura pasa de **7 cabezas / 6 cortes** con las primeras cinco madres a **38 cabezas / 32 cortes** con todas las madres VT3 admitidas. El aumento es **+31 cabezas, +26 cortes**, pero requiere competir contra MUCHOS más números.

### Control de tamaño de la bolsa: ¿más alcance prueba predicción?

No. Bajo la simple referencia hipotética de que cada una de las 575 cabezas fuera **uniforme entre `0000` y `9999` e independiente de nuestros inventarios PRE**, las coincidencias físicas esperadas aproximadamente serían:

| Bolsa | Cabezas físicas observadas | Referencia uniforme aproximada: 575 × (números PRE medios / 10.000) |
|---|---:|---:|
| Madres hasta Top5 | 7 | ≈4,0 |
| Hasta Top10 | 8 | ≈7,6 |
| Hasta Top25 | 18 | ≈19,1 |
| **Todas admitidas** | **38** | **≈37,1** |
| **Todas físicas** | **67** | **≈71,4** |

**Conclusión importante:** cuando abrimos todas las raíces, los **38** números observados se parecen notablemente a los **37,1** que corresponderían al mero tamaño de la bolsa bajo esa referencia aleatoria idealizada. Y las 67 cabezas físicas sin requisito de raíz no superan los 71,4 de ese mismo punto de comparación. Estas referencias no son pruebas formales de independencia o ausencia de patrones: son una comprobación elemental de que **aumentar el inventario eleva naturalmente las coincidencias retrospectivas**.

## Selección VERDADERA de sólo diez plazas VT4

| Política (siempre diez grupos completos válidos) | Top3 | Top5 | Top10 | Cabezas exactas acertadas | Madres distintas medias |
|---|---:|---:|---:|---:|---:|
| **BASE: dos hijas de madres VT3 #1–#5** | 0 | 0 | **4** | **4** | 5,000 |
| Una hija de cada madre #1–#10 | 0 | **3** | 3 | 3 | 10,000 |
| Mantener ocho plazas de BASE + dos de madres #6–#10 | 0 | 0 | 0 | 0 | 6,000 |
| Mantener ocho plazas de BASE + dos de madres #11+ | 0 | 0 | 0 | 0 | 6,000 |
| Cinco hijas (una por cada madre #1–#5) + cinco de madres #6+ | 0 | **3** | 3 | 3 | 10,000 |
| Cinco hijas base + cinco de madres #11+ | 0 | **3** | 3 | 3 | 9,983 |
| Reparto estratificado previamente probado | 0 | 0 | 1 | 1 | 4,930 |

**No aumentó Top10 con ninguno de estos repartos. Ninguno consiguió un Top3.** Dos estrategias con ocho posiciones BASE + dos nuevas sufrieron pérdidas porque ocho plazas BASE preservan las madres #1–#4 y eliminan ambas plazas de la madre #5: tres de las cuatro cabezas previas provenían de esa madre. No interpretar esos dos métodos como prueba de que ningún ranking alternativo con madres lejanas podría funcionar.

El reparto de cinco madres primeras y cinco #11+ conserva tres aciertos base, pero **no recuperó ninguna cabeza realmente premiada de las nuevas madres** en esta muestra. Sólo un método de estratos antiguo rescató `7175` de madre #11, perdiendo las cuatro cabezas BASE. Abrir madres más lejanas a diez plazas obliga a sacrificar hijos de las madres actuales.

**Límite decisivo: acceso a una bolsa de 38 cabezas ganadoras retrospectivamente alcanzables NO supone la capacidad de escoger cuáles serán las diez familias que salgan.**

## Cómo se protegió la prueba

- Las 115 entradas `INPUT_PRE_115.json`, el inventario de raíces histórico D−1/D−7 y el motor de familia corregida estaban disponibles **antes** de contrastar con sus resultados objetivos; el workflow movió físicamente a `/tmp` tanto `OBJETIVOS_POST_115.json` como el fixture histórico completo, ocultándolos durante construcción PRE.
- Se creó **para todos los 115 cortes y sus 10.000 valores posibles** un mapa binario de rango mínimo de madre VT3 con ruta propia admitida (código uint16, ausentes `65535`) y presencia de ruta física, comprimido gzip-base64 y guardado `MAPAS_FISICOS_PRE_115.json`; se guardaron a la vez **las siete propuestas de 10 plazas** en `PRE_115.json`.
- El workflow commitió PRE y su `SELLO.json` con hashes del código, protocolo, entradas y mapa antes de volver a leer objetivos.
- Verificación automatizada **115/115**: `TOP5_CUPO2` reproduce exactamente el Top10 guardado del laboratorio de diversidad; `TOP10_CUPO1` reproduce exactamente la política de una hija por madre del mismo; y el estrato recupera la política del laboratorio de admisión anterior.
- Se volvió a corregir un conteo auxiliar de tamaño de bolsa: el centinela `65535` de «madre ausente» **NO** debe contarse dentro de «todas las raíces». Las cifras de arriba corresponden a la ejecución definitiva con esa corrección, GitHub Actions [#38486148174 — completada correctamente](https://github.com/y0t3/Modelo-Papa/actions/runs/38486148174). El sello nuevo sustituye al primer ensayo de la rama; ninguna predicción oficial previa fue tocada.

## Decisión y trabajo siguiente

**1. Diagnóstico VT3:** el Top5 limita de manera muy fuerte la disponibilidad de cuatro cifras; la mayor expansión física dentro de las madres con respaldo aparece más allá del Top10 e incluso del Top25. No basta reordenar hijas de cinco madres, y no debemos confundir «familia VT3 admitida» con «madre dentro de Top5».

**2. Diagnóstico VT4:** asignar plazas a nuevas madres no aportó una mejora retrospectiva con las reglas neutrales fijas que probamos. El problema real será encontrar **criterios PRE verificables** que favorezcan de forma sostenible una madre VT3 de puesto bajo cuando su **ruta propia** tenga señales históricas distintas, conservando **diez plazas** para VT4.

**3. Siguiente laboratorio posible sin esperar sorteos:** estudiar dentro de las **31 cuaternas físicamente recuperadas** al abrir de Top5 a todas las madres admitidas, qué características verdaderamente propias de su madre/ruta (D−1/D−7, convergencia, dibujo, reutilización de geometrías **ganadoras**) las diferencian de las muchas hijas no ganadoras, con comparación **X→X+1** y controles neutrales del **mismo tamaño de bolsa y mismo número de plazas**. No aceptar aprendizaje basado en memorización de familias o resultados de X+1.

**4. Riesgos:** la quiniela es aleatoria y los mismos 115 cortes han sido explorados repetidamente. Todo dato predictivo requiere contraste independiente; ni los 38 números físicamente recuperables ni los cuatro aciertos Top10 son prueba de ventaja estadística.

## Archivos y enlaces reproducibles

- `PROTOCOLO_VT3_APERTURA_MADRES_VT4_COBERTURA_13OCT2026.md`
- `scripts/lab-vt3-madres-vt4-cobertura.mjs`
- `.github/workflows/lab-vt3-madres-vt4-cobertura.yml`
- `auditorias/vt3-madres-vt4-cobertura-115-13oct2026/PRE_115.json`
- `auditorias/vt3-madres-vt4-cobertura-115-13oct2026/MAPAS_FISICOS_PRE_115.json`
- `auditorias/vt3-madres-vt4-cobertura-115-13oct2026/SELLO.json`
- `auditorias/vt3-madres-vt4-cobertura-115-13oct2026/POST_115.json`
- `auditorias/vt3-madres-vt4-cobertura-115-13oct2026/RESUMEN.json`
- [Ejecución GitHub Actions 38486148174](https://github.com/y0t3/Modelo-Papa/actions/runs/38486148174)

**No se promovieron cambios a producción.**
