# Modelo Papá — anticipar VT3 primero, analizar VT4 después

**Punto de control 12/10/2026. Trabajo ejecutado con 23 jornadas históricas y 115 cortes ya disponibles** (70 septiembre, 45 octubre). **La app, hoja +11 automática, motores oficiales V7–V14, Tops en producción y APK permanecen intactos.** Rama experimental `auditoria-sorteo-10oct-2026`.

## Decisión metodológica del usuario

Se dio prioridad a **explicar y anticipar físicamente una familia VT3 ANTES del resultado**. Sólo tras analizar su efectividad se estudiará completar VT4. No sumar arbitrariamente un dígito VT4 ni premiar un acierto de la hermana por la ruta de la otra.

Las marcas originales de la hoja siguen siendo **TODAS** las figuras físicamente válidas que coincidieron con **cabezas ya conocidas**: jamás una marca predictiva puesta a mano. El motor de anticipación interpreta esas huellas históricas de D−7 dentro de la misma fuente, respetando la grilla +11 6×2 y todas las rutas reales (sin vacíos, saltos, celdas reutilizadas ni cruce de origen). La hoja actual sólo tiene fuentes anteriores al turno objetivo. Familias VT3 reversibles se cuentan **como UNA** familia (`729/927`), conservando una o dos lecturas numéricas reales.

## Etapa VT3 separada y auditada

- **115 cortes**, **3.655 exposiciones de madres elegibles por D−7**, **15.273 exposiciones de familias VT3 físicamente posibles** en fuentes conocidas de cada corte, sin filtrar por huellas D−7.
- Entre los cinco resultados de cada corte, al menos una terminación VT3 reversible estaba **físicamente disponible en 80/115**; **recuperada por las huellas confirmadas D−7 en 27/115**. Sólo 31 exposiciones de madre D−7 fueron coincidencias, distribuidas en esos 27 cortes.
- **Cobertura limitada de D−7:** 35 cortes no tenían familia ganadora físicamente posible en fuentes pre; otros 53 sí tenían pero no quedaron dentro del inventario trasladado de D−7; de los 27 alcanzables, 11 quedaron fuera del Top10 de bifurcaciones y 16 dentro. Los 35+53+11+16 son disjuntos y suman 115.
- Tres criterios VT3 congelados **sin mirar POST**: número de cabezas completas antiguas diferentes; número de huellas VT3 D−7 trasladadas y fuentes; número de nuevas formas VT3 que conservan un tramo de dos celdas con una ruta madre heredada. Los desempates constan en `vt3.py` dentro del ZIP.

### Resultados Top de familias VT3: cortes con al menos una coincidencia / 115

| Criterio VT3 | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| D7_CABEZAS_INDEPENDIENTES | **3** | **3** | **8** |
| D7_CONTINUIDAD_DE_HUELLAS | **1** | **3** | **8** |
| D7_BIFURCACIONES_DE_TRAMO | **5** | **8** | **16** |
| Nulo aleatorio exacto, misma bolsa D−7 y cupo | **2,534** | **4,190** | **8,210** |
| Nulo uniforme entre todas las VT3 físicamente disponibles | **3,291** | **5,428** | **10,578** |

Con el mismo Top, no presupone igual número de lecturas por palíndromos: D7_BIFURCACIONES_DE_TRAMO propuso **339 puestos de familia y 638 lecturas** en Top3; **563 y 1.065** en Top5; **1.104 y 2.117** en Top10.

**Bifurcaciones Top10**: septiembre **10/70**, octubre **6/45**. La bolsa D−7 era alcanzable respectivamente en 20/70 y 7/45. **No** son períodos de validación independientes: ambos fueron investigados retrospectivamente muchas veces.

### Importantes controles por volumen de caminos

Priorizar bifurcaciones puede favorecer madres con gran número de rutas; por eso el nulo de 8,21 puede ser ingenuo.

| Control dentro de bolsa D−7, Top10 | Esperanza de cortes coincidentes |
|---|---:|
| Random uniforme sin condicionar | 8,210 |
| Misma cantidad de rutas físicas actuales (4 bandas) | **11,701** |
| Mismas bandas de fuente y rutas físicas | **11,773** |
| Bandas de fuentes, rutas físicas y número de huellas heredadas | **13,459** |

Top10 por bifurcaciones observado **16**; frente al control más exigente diferencia **+2,541**, intervalo de remuestreo de las **23 jornadas completas** **[−1,43;+6,45] cortes**, compatible con cero.

Placebo intercambiando objetivos **entre jornadas dentro del mismo turno**, manteniendo PRE fijo: media **10,006**, banda simulada 95% **[5,16]**, cola nominal **0,031**. Es exploratoria y **no valida una regla** porque se probaron muchas ideas con estos mismos días. No bonificar bifurcaciones automáticamente ni cambiar los motores.

### Caso crítico 05/10 Matutina, separado de VT4

Madre reversible VT3 `729/927`. Un antecedente D−7 `517/715` confirmado por la cabeza completa histórica **`2517` de 28/09**, trasladado a la fuente Primera de la hoja pre actual, genera esa madre mediante un recorrido VT3 físico; tres nuevas copias comparten algún tramo de dos celdas con rutas heredadas.

- Rango VT3 por bifurcaciones: **6.º** (Top10).
- Por cabezas antiguas independientes: **17.º**.
- Por continuidad de huellas: **38.º**.
- Cabeza histórica objetivo POST Santa Fe **`3729`** tiene terminación `729`; la etapa VT3 acertó la familia sin escoger aún la cifra VT4. Elegir `3` y entre las hijas `3729/9273` y `3927/7293` **sigue siendo un problema distinto**.

## Integridad y archivo completo de conversación

**Paquete ejecutable** `modelo-papa-anticipacion-vt3-independiente-115-cortes-12oct2026.zip`, **19 archivos**, **917.066 bytes**, SHA256 **`1a0d5797d35980ee99b28af73c09f36ecc2f16247bc2540d230124e1f05c587e`**, prueba ZIP íntegra. Contiene entradas PRE/POST separadas, código Python 3 estándar `vt3.py pre|post|verify|report`, `controles.py`, pruebas sintéticas, dos visores HTML autocontenidos, CSV por cada corte, informes, y capturas.

- **PRE** `VT3_PRE.json`, SHA256 **`8df602b822be888bb09f77bd24e9296231403904fb2b9e6e82addb3f80f8b75e`**.
- **POST** `VT3_POST.json`, SHA256 **`dbf59fd86a9a254c8060d9933fef16817fa229e9366745517b8b99855b92ca4e`**.
- **Reproducción real desde ZIP en carpeta nueva**: quitar `RESULTADOS_POST.json` y cualquier otro resultado POST; volver a generar PRE y visor PRE, hash idéntico y 115 cortes válidos; añadir POST y regenerar cotejo, controles e informes: **8 archivos byte a byte idénticos**.
- Los dos visores PRE y POST contienen 23 fechas / 115 cortes; seleccionan turno, criterio, cupo, madre y fuente, dibujan grilla D−7 y PRE actual, todas las rutas VT3, distinguendo heredada/bifurcada/otra, y las **cabezas históricas completas antiguas**. POST solamente agrega las cabezas objetivo. **Ambos probados con Chromium/Playwright, 05/10 Matutina, `729/927`, seis trayectos actuales, sin errores JS**.
- La prueba incluyó sintéticos para fuente única, continuidad de tres celdas, inversión, deduplicación y prohibición de saltos/reutilización. No se usaron algoritmos de VT4 en ninguna política.

## Decisión siguiente, basada en el diagnóstico

**No retornar por ahora a la elección de la cuarta cifra**. Primero estudiar visualmente las **53 ocasiones en que la VT3 objetivo existía físicamente en la hoja pero faltaba entre las madres trasladadas D−7**. Distinguir nuevos patrones de huellas confirmadas de simple multiplicación de rutas; mantener bolsa y Top, y medir contra controles equivalentes. En paralelo, revisar los **11 cortes alcanzables donde el Top10 de bifurcaciones dejó fuera la familia**. Sólo tras tener un VT3 con cobertura/orden explicable seguir con VT3→VT4 y sus dos hijas independientes.

Ni resultados históricos ni intervalos aquí demuestran una capacidad predictiva prospectiva.
