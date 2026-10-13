# VT3 — ensayo de un voto por forma geométrica
**13/10/2026 · rama experimental `lab-vt3-voto-unico-forma-13oct2026`.** No tocar `main`, motor oficial, hoja, sellos históricos, app, APK ni VT4.

## Hipótesis
El aprendiz anterior asigna a cada candidata la media de las tres similitudes Jaccard más altas contra **ejemplos**, por lo que ejemplos de cabezas anteriores con la misma forma pueden ocupar varias plazas. Queremos comprobar si colapsar geometrías redundantes antes de elegir la tercera familia mejora la discriminación en X+1.

## Geometría y memoria
- Fuente PRE histórica: `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/PRE_115.json`, SHA256 `42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e`.
- Para entrenar semana X se conocen exclusivamente sus cabezas **ya sorteadas**, y se enumeran sus familias positivas físicamente válidas con sus rutas propias, siempre dentro de la fuente y con adyacencia.
- Para predecir semana X+1 se prohíbe consultar objetivos actuales o futuros. Los ejemplos recién sorteados en X+1 pueden incorporarse **después** de cada turno en la política online.
- Comparar `ESTATICA_X` (semana X congelada) y `ONLINE_X_MAS_PASADO` (X más ejemplos positivos de turnos anteriores de X+1).
- Bolsa de elección: todas las familias VT3 físicas **fuera del Top10 oficial**; conservar Top1 y Top2 oficiales, poner propuesta como tercera, completar Top10 con Top3…Top9 originales. Misma capacidad en todos los modelos, sin usar VT4.
- Empate por raíz legítima propia, rango oficial y familia, idéntico a laboratorio previo.

## Comparaciones establecidas antes de resultados
- `ORIGINAL_3_EJEMPLOS`: media Jaccard de los 3 ejemplos más semejantes, referencia ya congelada.
- `FIRMA_CONJUNTO_3`: reducir todo el banco a una observación por conjunto de formas normalizadas **idéntico** (firma ordenada), conservar tres vecinos más similares.
- `FORMA_INDIVIDUAL_3`: reducir todas las **formas individuales únicas** presentes en los ejemplos a una sola observación por geometría, y contar hasta 3 mejores formas que la candidata comparte. Ninguna forma se multiplica por repetirse entre ejemplos.
- `FORMA_INDIVIDUAL_1`: igual reducción, pero contar sólo la forma más semejante, control para aislar la diferencia entre diversidad y cantidad.
- `PRESENCIA_FORMAS`: índice Jaccard de la unión de formas únicas de la candidata contra la unión de formas únicas del banco X.
Todos son criterios geométricos; ninguno identifica un número concreto como favorito por haber ganado antes.

**Precisión:** `FORMA_INDIVIDUAL_3` usa la media de 3 Jaccard entre cada forma única del historial (representada como conjunto singleton) y el conjunto de formas de la candidata; es distinto de la media por familia ejemplar. Guardar ambas métricas y conteo de votos eliminados.

## Auditoría
Primera fase PRE: GitHub Actions mueve fuera TODO POST y guarda exclusivamente el PRE original. Genera listas candidatas, fechas, control de rango y `SELLO.json` con hashes de protocolo+código+datos. Segunda fase: restaura resultados, construye cada memoria sólo con semana X o turnos anteriores de X+1, genera listas y **verifica que `ORIGINAL_3_EJEMPLOS` reproduce exactamente los Tops congelados anteriores**. Únicamente después de generar cada Top para el corte se consulta su resultado.

Entregables: Tops para 90 cortes y variantes fija/online, Top3/5/10 comparados por fecha y semana, rescates/pérdidas y diferencia entre opciones con/sin repetición. Si uno mejora, comparar con controles ya existentes de una tercera física neutral; no declarar éxito predictivo por escoger la mejor de varias variantes sobre el mismo historial. **Sorteos aleatorios y corpus exhaustivamente explorado**.
