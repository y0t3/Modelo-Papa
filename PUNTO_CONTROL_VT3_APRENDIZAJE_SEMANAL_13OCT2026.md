# Punto de control VT3 — aprendizaje semanal de recorridos físicamente ganadores

**13 de octubre de 2026** · rama experimental `lab-vt3-aprendizaje-semanal-13oct2026` · [GitHub Actions 38376586094 — ejecución correcta](https://github.com/y0t3/Modelo-Papa/actions/runs/38376586094).

## Hipótesis del usuario y qué se probó realmente

Enseñar al motor las cabezas ya extraídas de una semana X, registrar **todos** sus recorridos de familia VT3 físicamente disponibles, aprender los rasgos comunes de esas figuras frente a otras familias físicamente disponibles que NO ganaron, y llevar ese aprendizaje a la **semana X+1**, sin usar los resultados de X+1 para seleccionar candidatos.

**El laboratorio ejecutó esa versión de aprendizaje de rasgos geométricos y antecedentes**, no una inteligencia artificial de visión profunda ni la copia exacta de cada bloque posicional ganador D−7. El aprendizaje usa una ficha por familia×corte, independientemente de cuántos caminos explican la cabeza. Los tokens no incluyen los dígitos de las ternas ni el nombre de familia para evitar memorizar números particulares.

Un control separado de **réplica literal de recorridos de D−7** quedó protocolizado en `PROTOCOLO_VT3_REPLICA_D7_13OCT2026.md`, pero su script **no pudo ser registrado ni ejecutado** en este turno. No atribuirle cifras de este experimento.

## Corpus y partición auténticamente semanal
23 fechas operativas históricas y 115 cortes, organizados en 4 semanas calendario lunes-domingo de Argentina:

| Semana que comienza | Cortes en histórico | Uso |
|---|---:|---|
| 14/09/2026 | 25 | Primera semana de entrenamiento |
| 21/09/2026 | 30 | Examen 1 |
| 28/09/2026 | 30 | Examen 2 |
| 05/10/2026 | 30 | Examen 3 |

En cada examen se entrenó con la **semana calendario inmediatamente anterior** (`SEMANA_ANTERIOR`) o con todas las semanas estrictamente anteriores (`ACUMULATIVO`). Ninguna cabeza de la semana del examen forma parte de sus datos de ajuste. Se registraron los índices, fechas y número de ejemplos etiquetados de cada entrenamiento.

Workflow: antes de crear fichas PRE se **movió fuera del checkout el directorio completo de auditorías históricas**, reintroduciendo exclusivamente el `PRE_115.json` original SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`. El script validó geometrías físicamente adyacentes dentro de fuente, generó `PRE_115.json`, `SELLO.json` con SHA256 de código, protocolo e insumo, y sólo entonces volvió a tener acceso a cabezas POST para entrenar **en orden semanal** y evaluar. Quedaron almacenadas todas las listas producidas y sus ganadoras.

## Aprendizaje y techo de cobertura

La etiqueta positiva del entrenamiento es familia reversible con una ruta válida PRE y coincidente con una de las cinco cabezas ya conocidas. No obliga a existir a ternas físicamente ausentes; no inventa caminos. Se aprendieron 45 rasgos geométricos de forma/orientación/zona/edad/fuentes/bloques y 66 rasgos geométricos más contexto de raíces propias/bifurcaciones. Para cada rasgo: estadística `log(P(rasgo|ganadora física)/P(rasgo|otra física))` con suavizado y penalización por soporte limitado, sin ajuste a la semana del examen.

| Semana | Cortes con al menos una familia ganadora físicamente disponible | Exposiciones de familias ganadoras disponibles | Familias ganadoras no formables físicamente |
|---|---:|---:|---:|
| 14/09 | 19/25 | 37 | 86 |
| 21/09 | 20/30 | 32 | 118 |
| 28/09 | 21/30 | 41 | 108 |
| 05/10 | 20/30 | 33 | 117 |
| **Total** | **80/115** | **143** | **429** |

**Nota de denominador:** las 143 y 429 son exposiciones de **familias reversibles ganadoras únicas por corte**, no cantidades de cabezas independientes (puede haber jurisdicciones con la misma familia). No mezclar exposición, corte y número específico. El oráculo retrospectivo que conoce las cabezas puede incluir las ≤5 familias físicamente posibles dentro de un Top10: por construcción conseguiría al menos una coincidencia en los 80 cortes físicamente alcanzables, pero eso **no es un pronóstico**.

En los **90 cortes de examen**, 61 contenían al menos una familia ganadora físicamente disponible, y hubo 106 exposiciones de familias ganadoras disponibles en total. Por tanto había muchas oportunidades geométricas, pero seleccionar un Top10 acertado sigue siendo difícil.

## Comparativa de igual tamaño: diez familias, 90 cortes de examen

| Método | Aprendizaje semana anterior Top3 / Top5 / Top10 | Aprendizaje acumulativo Top3 / Top5 / Top10 |
|---|---:|---:|
| **VT3 oficial sin cambios** | **3 / 6 / 11** | **3 / 6 / 11** |
| `FORMA_RAIZ`, reordenar bolsa anclada según geometrías | 1 / 5 / **9** | 1 / 5 / **8** |
| `CONTEXT_RAIZ`, geometría + raíces propias | 2 / 5 / **7** | 2 / 6 / **8** |
| `CONSERVADOR_RAIZ`, 60 % rango + 40 % aprendizaje | 3 / 6 / **11** | 3 / 6 / **11** |
| `FORMA_FISICA`, diez formas con o sin raíz | 2 / 3 / **11** | 1 / 2 / **9** |
| `MIX_9_1`, nueve ancladas aprendidas + una sin raíz aprendida | 2 / 5 / **5** | 2 / 6 / **6** |
| `MIX_8_2`, ocho ancladas aprendidas + dos sin raíz aprendidas | 2 / 5 / **7** | 2 / 6 / **6** |
| `NEUTRAL_9_1`, nueve oficiales + una no anclada por hash fijo | 3 / 6 / **13** | 3 / 6 / **13** |
| `NEUTRAL_8_2`, ocho oficiales + dos no ancladas por hash fijo | 3 / 6 / **13** | 3 / 6 / **13** |

**Contraste principal previsto:** `CONTEXT_RAIZ` entrenado en la semana anterior **7/90 vs oficial 11/90**, diferencia neta **−4**: cuatro cortes rescatados y ocho perdidos. Mezcla aprendida 9+1 hizo 5/90 vs el control neutral 9+1 de 13/90. Mantener la prioridad oficial mayoritaria sin alterar demasiado los rangos consiguió empate 11/90, no mejora.

Las dos variantes neutrales por hash fijo conservaron el núcleo oficial y añadieron dos coincidencias sin pérdidas **en esta muestra**, pero son controles de un único hash, NO una demostración de que elegir al azar sea superior ni una razón para implementar ese hash.

## ¿Se generalizó de una semana a otra?

Top10 por semana de examen, `SEMANA_ANTERIOR`:

| Semana que comienza | VT3 oficial | FORMA_RAIZ | CONTEXT_RAIZ | FORMA_FISICA | MIX_9_1 |
|---|---:|---:|---:|---:|---:|
| 21/09 | 4/30 | 4/30 | 3/30 | 4/30 | 2/30 |
| 28/09 | 4/30 | 3/30 | 2/30 | 4/30 | 2/30 |
| 05/10 | 3/30 | 2/30 | 2/30 | 3/30 | 1/30 |

Ni el entrenamiento inmediatamente anterior ni acumularlo mejoró regularmente la cobertura del Top10. `CONTEXT_RAIZ` acumulativo recuperó 5/30 en la semana del 28/09, pero 0/30 en la siguiente del 05/10: comportamiento inestable, no regla transferible clara.

### Qué significa el «Top perfecto» durante entrenamiento

Al conocer los resultados de la semana de entrenamiento, se pueden seleccionar todas sus familias ganadoras **físicamente posibles** —nunca más de cinco por corte— y completar el Top10 con otras. Eso da un resultado retrospectivo perfecto *respecto del techo físico*, aun si no se aprendió ninguna generalización. De las 25 hojas de la primera semana, **19** tenían al menos una familia ganadora físicamente disponible y un oráculo podría cubrirlas. La prueba relevante es seleccionar sin conocer los objetivos de la semana siguiente, donde los modelos de geometría ensayados no superaron al oficial.

## Conclusión y precauciones

1. **Se comprobó la hipótesis de aprendizaje semanal de rasgos, no una ventaja predictiva.** El programa reconoció las figuras físicas de semanas ya sorteadas, extrajo variables y trasladó un modelo a semanas posteriores sin etiquetas futuras. En los 90 exámenes el resultado fue igual o peor que VT3 original.
2. **No es prueba de imposibilidad universal.** Se ensayó un aprendizaje sencillo e interpretable, no todas las formas de comparar caminos ni una red neuronal entrenada sobre un corpus suficiente.
3. **Quedó pendiente el experimento más fiel al método manuscrito**: comparar las rutas ganadoras de D−7 en sus celdas y fuentes reales con las rutas de D del mismo día/turno, sin ajustar pesos ni mirar D. Se creó el protocolo, pero no se ejecutó: no inventar resultados.
4. **Este corpus es pequeño y reutilizado**: 23 fechas, tres semanas de examen y numerosas decisiones conceptuales inspiradas por ellas. Incluso un mejor número en esta simulación sería exploratorio, no certificación prospectiva. La quiniela tiene resultados aleatorios.
5. **No modificar VT3 oficial ni comenzar VT4** por estos resultados. Conservar las fichas, Tops, etiquetas de las rondas y ejemplos negativos en GitHub.

## Evidencia verificable
- `scripts/lab-vt3-aprendizaje-semanal.mjs`, `PROTOCOLO_VT3_APRENDIZAJE_SEMANAL_13OCT2026.md`.
- `auditorias/vt3-aprendizaje-semanal-115-13oct2026/PRE_115.json`, `SELLO.json`, `POST_115.json`, `RESUMEN.json`.
- [GitHub Actions 38376586094 — finalizada correctamente](https://github.com/y0t3/Modelo-Papa/actions/runs/38376586094).
