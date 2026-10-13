# Punto de control VT3 — voto geométrico único en aprendizaje semanal

**13/10/2026 · rama `lab-vt3-voto-unico-geometrico-13oct2026` · GitHub Actions [38390236410 — éxito](https://github.com/y0t3/Modelo-Papa/actions/runs/38390236410).**

## Pregunta

La auditoría previa de actualización turno a turno mostró que, en 43/90 cortes donde cambió la tercera candidata, los ejemplos nuevos de X+1 votaban a favor de formas **ya presentes** en la semana X. El motor geométrico experimental contaba ejemplos distintos como tres votos aunque compartieran la misma geometría normalizada.

Esta prueba fijó **antes de revelar POST** dos cambios:
1. `FIRMA_UNICA`: un voto por **conjunto de formas** distintas que representa un ejemplo físico ganador; repetición exacta de ese mismo conjunto no incrementa su voto.
2. `FORMA_UNICA`: un voto por cada **forma física normalizada individual**, aun si aparece en varios turnos o familias anteriores.

Se conservaron las rutas reales, las raíces propias, las familias físicamente disponibles y **las mismas diez plazas**: primeras dos familias del Top3 original, una tercera externa propuesta por aprendizaje y siete candidatos oficiales restantes hasta Top10. No se generan rutas entre fuentes ni se leen cifras VT4. Ambas variantes se evaluaron con memoria semanal X fija y memoria X actualizada únicamente con turnos previos conocidos de X+1. Se añadió un control de firmas de **ejemplos físicos no ganadores** de X.

## Datos, separación y reproducibilidad

- 23 fechas y 115 cortes históricos PRE; tres pares semanales X→X+1, 90 cortes de examen (18 días×5 turnos). Los 90 Tops de referencia fueron generados en el experimento anterior.
- Fuente PRE `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/PRE_115.json`, SHA256 `42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e`.
- El workflow movió físicamente todas las auditorías POST fuera del checkout; conservó únicamente ese PRE, construyó `PRE_90.json` con inventarios de candidatas físicas, `CONTROL_PRE.json` con la política neutral (2.000 réplicas), y `SELLO.json` con hashes de código, protocolo, PRE y control.
- Después del sellado se restauraron memorias supervisoras X y resultados ya publicados de semanas anteriores. Cada decisión de X+1 usó sólo índices temporales estrictamente **menores** al corte evaluado. Se comprobó en los **90 casos** que `ORIGINAL_STATIC` y `ORIGINAL_ONLINE` reproducían **idénticos Top10 ordenados** del laboratorio previo de memoria corta; el script abortaba al encontrar un cambio.
- Las métricas se computaron después de fijar los Tops: cortes con ≥1 familia ganadora en Top3/5/10; rescates y pérdidas por corte, no tratamos las cinco jurisdicciones como ensayos independientes.
- Los controles de 2.000 terceras candidatas neutrales por política tomaron (a) cualquier externa física y (b) externas con la **misma condición de raíz propia y clase de cantidad de caminos** que la propuesta experimental. Siempre conservaron las primeras dos, la capacidad Top3 y los siete miembros oficiales de relleno.

## Resultado principal: 90 cortes iguales para todas las variantes

| Selección | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| **VT3 oficial** | **3** | **6** | **11** |
| Original, memoria semanal fija | **4** | 5 | **12** |
| **Firma única**, memoria fija | 3 | 4 | 11 |
| **Forma única**, memoria fija | 3 | 4 | 11 |
| Original, memoria X+ejemplos recientes | **4** | 5 | **12** |
| **Firma única**, memoria X+recientes | 3 | 4 | 11 |
| **Forma única**, memoria X+recientes | 3 | 4 | 11 |
| Firmas de ejemplos **no ganadores**, control fijo | 3 | 4 | 11 |

Todas las variantes deduplicadas quedaron sin ninguna tercera familia ganadora en los 90 cortes. **Perdieron precisamente el único rescate de la memoria original:** `2026-09-21 Vespertino, familia 246/642`. No rescataron ninguna nueva. El control de firmas de no ganadoras logró exactamente la misma cobertura de corte que las variantes positivas deduplicadas: **ninguna prueba de especificidad favorable a éstas**.

**Precaución:** ni el +1 del método original ni el empate de las variantes con el oficial constituyen evidencia confirmatoria, porque la muestra es reducida y se exploró repetidamente en ensayos anteriores.

## ¿Se modificó realmente el ranking?

| Deducción | Familias terceras que cambian de 90 respecto al original del mismo horizonte | Número medio de votos distintos por corte | Promedio de candidatas empatadas en el mejor puntaje |
|---|---:|---:|---:|
| Original fijo | 0 | **36,67 ejemplos** | **10,03** |
| Firma única fija | **70** | **29 firmas** | **8,48** |
| Forma única fija | **87** | **18,33 formas** | **109,68** |
| Original online | 0 | **53,60 ejemplos** | **15,66** |
| Firma única online | **80** | **39,57 firmas** | **14,40** |
| Forma única online | **84** | **18,91 formas** | **114,49** |

**Conclusión técnica clave:**
- Quitar votos repetidos por conjunto de formas cambia **70/90** terceras familias aunque no recupera ninguna nueva ganadora. El peso de ejemplos duplicados influye muchísimo en la selección, pero **no se demostró que esa influencia sea perjudicial**.
- La versión de **forma individual** crea un problema adicional: el índice Jaccard de una sola forma contra una candidata con muchos caminos empata a una cantidad enorme de familias; hubo en promedio **109,68 candidatas empatadas** en primer lugar con memoria fija. Una cifra así significa que el desempate por raíz/rango original, no una señal geométrica fina, resuelve gran parte de la elección. Esa representación destruye capacidad de diferenciación del ranking y **no conviene adoptarla**.
- La versión de firma única preserva más estructura que la de forma individual, pero tampoco mostró aciertos adicionales.

### Controles del mismo presupuesto

En 2.000 réplicas neutrales:
- Para **firma única fija**, el control físico general obtuvo de media **3,6825 Top3/90** y el control pareado por anclaje+clase de rutas **3,4075**, frente a **3 Top3** de la firma única.
- Para **forma única fija**, el control físico general obtuvo de media **3,6975 Top3/90** y el control pareado **3,5325**, frente a **3 Top3**.
- Para las versiones online, neutral general **3,652** (firma) y **3,675** (forma), pareado **3,4185** y **3,497**, respectivamente.
- El **100 %** de las 2.000 muestras neutrales de cada comparación obtuvo al menos 3 Top3, el valor observado para las variantes deduplicadas. Éstas no superan esos controles.

### Primeros días de X+1

| Ventana | Cortes | Oficial Top3/Top10 | Original fijo | Firma única fija | Forma única fija |
|---|---:|---:|---:|---:|---:|
| Primer día | **15** | 0 / 1 | **1 / 2** | 0 / 1 | 0 / 1 |
| Primeros 2 días | **30** | 0 / 3 | **1 / 4** | 0 / 3 | 0 / 3 |
| Primeros 3 días | **45** | 1 / 4 | **2 / 5** | 1 / 4 | 1 / 4 |

Eliminar la repetición también descartó el único rescate temprano observado antes; no ofrece evidencia a favor de la hipótesis de que la memoria con geometrías únicas sea más útil inmediatamente después de entrenarse.

## Interpretación

**La redundancia de ejemplos es un mecanismo real de la selección**, probado al cambiar los terceros de 70–87 cortes sin alterar la hoja. Pero deduplicar y quitar votos no mejoró el resultado, sino que perdió el único rescate histórico, que tampoco era estadísticamente más convincente que el azar neutral. El control negativo muestra que **una forma aprendida de una ganadora** y una aprendida de una no ganadora **no se distinguieron por resultados con estas políticas**.

No podemos concluir que repetir una geometría haga más probable acertar, ni que suprimirla sea mejor: ambos serían extrapolaciones no justificadas desde 90 sorteos con tres/cuatro aciertos Top3. Los resultados son compatibles con la naturaleza aleatoria de la quiniela.

## Implicaciones para VT3

1. **No modificar el ranking oficial** ni reemplazar el aprendizaje geométrico original por voto único. La prueba no ofrece mejora robusta.
2. El estudio sí identifica un límite de la **representación geométrica por sí sola**: mucha similitud y demasiados empates, especialmente cuando se reduce todo a formas individuales normalizadas.
3. El camino metodológico siguiente, antes de inventar más pesos retrospectivos, es medir si cada familia tiene **identidad física y respaldo propio distinguibles** dentro de los grandes grupos empatados, y cuántas ganadoras posibles permanecen físicamente fuera del Top3/Top10. Pero cualquier sustitución propuesta deberá compararse contra las mismas plazas y controles neutrales.
4. Nunca confundir el dominio 60/60 de la semana X por **memoria supervisada de respuestas conocidas** con un modelo capaz de predecir X+1; esa distinción queda preservada.

## Archivos de evidencia
- `PROTOCOLO_VT3_VOTO_UNICO_GEOMETRICO_13OCT2026.md`.
- `scripts/lab-vt3-voto-unico-geometrico.mjs`.
- `.github/workflows/lab-vt3-voto-unico-geometrico.yml`.
- `auditorias/vt3-voto-unico-geometrico-90-13oct2026/PRE_90.json`, `CONTROL_PRE.json`, `SELLO.json`.
- `POST_90.json`: para 90 cortes, los siete terceros propuestos, los grupos geométricos con ejemplos físicos correspondientes, rankings y éxito/fallo.
- `RESUMEN.json`: Top3/5/10, cambios pareados, primeros días, semanas, empates y 2.000 controles neutral por variante.
- [GitHub Actions 38390236410 — exitosa](https://github.com/y0t3/Modelo-Papa/actions/runs/38390236410).

**VT3 oficial, hojas, sellos y VT4 permanecen intactos.**
