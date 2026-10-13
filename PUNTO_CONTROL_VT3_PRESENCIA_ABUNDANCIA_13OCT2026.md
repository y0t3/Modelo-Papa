# Punto de control VT3 — presencia de formas vs abundancia física y memoria placebo

**13 de octubre de 2026 · rama `lab-vt3-presencia-vs-abundancia-13oct2026`.** GitHub Actions [38395607091](https://github.com/y0t3/Modelo-Papa/actions/runs/38395607091). No se modifican `main`, motor VT3/VT4 oficial, app, hojas, rutas ni sellos originales.

## Por qué hicimos esta prueba
El modelo `PRESENCIA_FORMAS` había obtenido Top3 **5/90**, Top10 **13/90** eligiendo una tercera familia física fuera del Top10, con las dos primeras y otras siete familias oficiales conservadas. Dos rescates: **28/09 Matutino `067/760`** y **06/10 Vespertino `226/622`**. El control que escoge la familia externa de **más recorridos físicos** obtuvo exactamente los mismos dos rescates. Revisamos no sólo los ganadores sino **todas las 90 decisiones**.

## Diseño y prevención de fuga de resultados
- Los `PRE_115.json` originales de inventario físico y de perfiles fueron los **únicos dos archivos** disponibles al generar las fichas de las 90 pruebas y el `SELLO.json` SHA256. Fuentes:
  - `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/PRE_115.json` SHA256 `42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e`.
  - `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json` SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`.
- Sólo después del sello se restauraron cabezas y Tops congelados. **Se reprodujeron exactamente los 90 terceros** del `PRESENCIA_FORMAS` anterior y del control `RECUENTO_RUTAS` anterior, contra sus archivos POST previamente escritos. Un fallo de reproducción aborta la prueba.
- En cada una de las tres parejas semana X→X+1, la unión de formas aprendidas se construye **sólo** con las cabezas reales de semana X; los 30 Tops de X+1 se seleccionan **antes** de consultar cualquier resultado de X+1.
- Todos los modelos eligen una única familia **físicamente disponible y externa al Top10 original**. Mantienen Top1 y Top2 originales y completan el Top10 con Top3–Top9 originales. No conectan celdas entre fuentes, no prestan raíces y no mezclan VT3 con VT4.
- Controles placebo (500 réplicas uniformes + 500 emparejadas): sustituyen en X cada positiva física por una familia física distinta al azar del mismo corte, conservando el número de positivas. El placebo emparejado respeta si la positiva tenía anclaje histórico propio y su clase de número de rutas (1, 2–3, 4–7, 8+); tras congelar cada banco placebo, reproduce la puntuación en X+1. La cantidad y clase de positivas X se conocen porque **X es pasada**; nunca se usan cabezas futuras de X+1 en el entrenamiento.

## 1. El dato geométrico clave: el aprendiz casi agotó las formas posibles

El inventario de perfiles físicos de los 115 cortes posee **19 formas geométricas normalizadas diferentes**, bajo las reglas de tres celdas adyacentes, fuente única y reverso equivalente.

| Semana de entrenamiento X | Ganadoras físicamente representables usadas | Formas distintas cubiertas por las ganadoras | Formas disponibles en todas las familias físicas de X |
|---|---:|---:|---:|
| 15–19/09 | 37 apariciones de familias×corte | **19** | **19** |
| 21–26/09 | 32 | **18** | **19** |
| 28/09–03/10 | 41 | **18** | **19** |

El banco de ganadoras **ya conocía todas o casi todas las formas físicas posibles** al terminar de ver X. No hacía falta ser una familia ganadora para reproducir alguna de esas 18–19 geometrías en la hoja siguiente. Por eso el criterio `PRESENCIA_FORMAS` carece de mucho poder discriminatorio en sí mismo cuando la unión está casi saturada.

### Relación cuantificada con abundancia
- **83/90** terceras familias propuestas por PRESENCIA tenían **todas sus propias formas ya incluidas** en la memoria X. Cobertura media propia **99 %**.
- Correlación de Pearson media, calculada **por corte entre todas las familias físicas externas** y luego promediada sobre 90 cortes:
  - score `PRESENCIA_FORMAS` vs cantidad de rutas físicas: **0,954749**;
  - score `PRESENCIA_FORMAS` vs cantidad de formas físicas distintas: **0,964102**.
- La tercera de PRESENCIA tenía de media **5,17 rutas físicas**, y la del control máximo de rutas **5,33 rutas**.
- Los dos métodos escogieron **la misma familia en 66/90** cortes. En los **24 desacuerdos no acertó ninguna de las dos terceras propuestas**. Ambos capturaron **exactamente las mismas dos familias ganadoras**.

**Interpretación:** en este tablero limitado a 19 formas, la presencia de geometría aprendida actúa principalmente como una transformación del **recuento de figuras y caminos físicos**. El algoritmo aprende etiquetas ganadoras de X, pero al saturar casi todas las formas disponibles, el resultado en X+1 queda fuertemente determinado por la diversidad de caminos de las familias actuales y los desempates.

## 2. Los dos rescates: evidencia física real, sin convertirla en regla

### 28/09 Matutino — `067/760`
Cabezas de los cinco sorteos: `2949`, `4319`, `6107`, `8262`, `1760`. La familia `067/760` era una de cuatro físicamente disponibles entre las cinco.

- La familia tenía **4 caminos físicos únicos**, **3 formas normalizadas distintas**, todos en la fuente `prevNocturno`.
- Dos rutas no tenían anclaje histórico propio:
  - `1:0 → 2:1 → 3:1` produce `760`;
  - `2:0 → 2:1 → 3:1` produce `760`.
- Dos recorridos poseían el **mismo** evento raíz D−7 propio, por lo que se computa **una sola cabeza histórica independiente**, no dos:
  - `3:1 → 4:1 → 4:0` produce `067`;
  - `4:0 → 4:1 → 5:1` produce `760`.
  - evento compartido: `2026-09-21 | D−7 | Primera | Entre Ríos | 0722`.
- El ranking original anclado asignaba a esa familia **puesto 18**. Entre **145 externas físicas**, PRESENCIA y MAYOR_RUTAS la promovieron a tercera.
- El banco ganador de X contenía **18 de las 19 formas posibles**; las tres formas propias de `067/760` estaban incluidas. Puntuación Jaccard **3/18 = 0,166667**.
- En el puntaje de PRESENCIA había **empate exacto** con otras familias que también tenían 3/18, como `779/977`, `697/796` y `497/794`; se eligió `067/760` por desempate de raíz y mejor rango. No fue una forma exclusiva ni un máximo inequívoco del aprendizaje.

### 06/10 Vespertino — `226/622`
Cabezas: `9226`, `8809`, `2010`, `8001`, `8483`. **Sólo** `226/622` era representable físicamente en esa hoja.

- **5 rutas físicas propias, 5 formas distintas**, repartidas entre dos fuentes:
  - **Previa:** `2:0 → 3:0 → 4:1` (`622`); `3:0 → 4:1 → 4:0` (`226`); `4:0 → 3:0 → 4:1` (`622`).
  - **Matutino:** `3:0 → 4:0 → 3:1` (`226`); `3:1 → 3:0 → 4:0` (`622`).
- **Ninguna ruta anclada; ningún evento D−1/D−7 propio.** La candidatura era válida como formación física, pero no se le inventó respaldo.
- Había **175 candidatas externas**. En semana X el banco ganador también había cubierto **18/19 formas**, y las cinco formas de `226/622` aparecían entre ellas: score Jaccard **5/18 = 0,277778**.
- La familia externa `269/962` tenía exactamente **5 rutas, 5 formas y la misma puntuación 0,277778**, también sin raíz; se impuso `226/622` por el desempate alfabético. Se trata de una **igualdad de formas**, no de una preferencia aprendida inequívoca por 226.

**Ambas coincidencias fueron físicamente legítimas, pero la discriminación frente a candidatos empatados no estuvo sustentada por un recorrido ganador específico único.**

## 3. Resultados del mismo presupuesto en los 90 cortes

| Método (una tercera externa, mismas otras nueve familias) | Top3 | Top5 | Top10 | Rescates adicionales frente a oficial |
|---|---:|---:|---:|---|
| VT3 original sin cambio | **3** | **6** | **11** | — |
| `PRESENCIA_FORMAS`, ganadoras X | **5** | **6** | **13** | 28/09 Matutino; 06/10 Vespertino |
| `MAYOR_RUTAS` física sin aprendizaje | **5** | **6** | **13** | Los mismos dos |
| `MAYOR_FORMAS` distintas sin aprendizaje | **4** | 5 | **12** | Sólo 06/10 Vespertino |
| `BANCO_TODAS_FISICAS_X` sin saber ganadoras | **4** | 5 | **12** | Sólo 06/10 Vespertino |
| `BANCO_TOP10_X` sin saber ganadoras | **4** | 5 | **12** | Sólo 06/10 Vespertino |

La distinción entre máximo de **rutas** y máximo de **formas únicas** importa: una familia puede tener más de un recorrido de la misma geometría, por lo que sus cantidades no son equivalentes.

La bolsa de formas de **todas** las familias físicas de X contiene 19/19 formas y produce 4/90 Top3, al igual que la bolsa de las diez originales de cada corte X. El resultado ganador de 5/90 de la bolsa de verdaderas ganadoras es sólo **un corte por encima** de estas bolsas no supervisadas.

## 4. Los placebos de memoria docente X
Se crearon 500 bancos de **positivas falsas uniformes** y 500 bancos de **positivas falsas emparejadas por anclaje y clase de rutas** en las semanas X, y se emplearon para generar terceras sobre las mismas semanas X+1.

| Banco de enseñanza | Top3 medio /90 | Top10 medio /90 | Réplicas con Top3 **≥5/90** | Réplicas con Top10 **≥13/90** |
|---|---:|---:|---:|---:|
| Positivas **reales** | **5** | **13** | — | — |
| Placebo uniforme (500) | **4,096** | **12,096** | **16,6 %** | **16,6 %** |
| Placebo mismo anclaje+rutas (500) | **4,130** | **12,130** | **16,4 %** | **16,4 %** |

Que bancos ficticios de enseñanza puedan obtener cinco coincidencias sin aprender ganadoras verdaderas en **aproximadamente una de cada seis réplicas** impide afirmar una ventaja específica de la memoria de ganadoras sobre estos datos.

El 16 % es una frecuencia empírica exploratoria de este protocolo retroactivo, no una probabilidad objetiva de éxito futuro ni un valor confirmatorio: el método surgió de muchas investigaciones sobre las mismas 23 fechas.

## 5. Qué conseguimos para el motor y qué no
**Sí:** explicación completa de por qué el ranking de presencia prefiere familias con más caminos; diferenciación de rutas físicas y de geometrías únicas; captura de la raíz propia sin inflar por caminos múltiples; reporte de los empates exactos y del caso sin anclaje.

**No:** evidencia fiable de que la memoria X pueda discriminar candidatos ganadores X+1 mejor que simples propiedades del inventario físico. En concreto, el banco positivo suele estar geométricamente saturado y el ranking se convierte en uno de *abundancia*, con correlaciones de 0,95/0,96. El mismo par de rescates fue identificado por `MAYOR_RUTAS` sin entrenamiento supervisado.

**Decisión:** no cambiar VT3 oficial ni VT4, no elegir la variante ganadora por el total exploratorio de cinco casos Top3; mantener como diagnóstico visual los caminos y sus raíces por familia. El paso metodológicamente más informativo es **validación prospectiva de Tops sellados antes de sorteos nuevos**, con políticas congeladas y controles neutros de igual capacidad. Los sorteos de quiniela son aleatorios y no hay señal predictiva estable identificada aquí.

## Reproducción
- `PROTOCOLO_VT3_PRESENCIA_ABUNDANCIA_13OCT2026.md`
- `scripts/lab-vt3-presencia-abundancia.mjs`
- `.github/workflows/lab-vt3-presencia-abundancia.yml`
- `auditorias/vt3-presencia-abundancia-90-13oct2026/PRE_90.json`, `SELLO.json`, `POST_90.json`, `RESUMEN.json`
- [Actions 38395607091](https://github.com/y0t3/Modelo-Papa/actions/runs/38395607091)

Todo en rama experimental, sin modificación a producción.
