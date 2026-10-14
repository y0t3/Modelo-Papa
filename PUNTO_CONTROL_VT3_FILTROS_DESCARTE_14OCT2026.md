# Punto de control VT3 — filtros negativos de persistencia y conservación de madres
**14/10/2026 · laboratorio completado · 115 cortes retrospectivos / 23 jornadas.**

## Resultado principal
**NO incorporar ninguno de estos filtros como exclusión automática del VT3 oficial.** El filtro de familias estables produce descartes, pero **ninguno** de los filtros predefinidos aumentó un solo acierto Top3, Top5 ni Top10 sobre el mismo ranking geométrico con reposición. Los más grandes eliminan ganadoras físicamente disponibles. Los que conservan todas las ganadoras eliminan tan poco inventario que no son una mejora útil. Esta constatación responde sólo a las definiciones y horizontes medidos; **no evalúa cuatro semanas completas**.

Motor oficial intacto, no hubo modificación de `src/motorLalo.ts`, VT4, `main`, marcas sobre la hoja ni sellos prospectivos ya realizados.

## Protocolo y fuentes
- Ranking PRE fijo de base: `F_D1` del laboratorio geometría completa vs anclada. Antes de los filtros se reconstruyó **todo su orden de madres VT3** a partir de rutas físicas, fuentes y posiciones; se verificó que las diez primeras familias coincidieran exactamente con el PRE geométrico registrado en cada uno de los 115 cortes.
- Cada familia se elimina enteramente (no solo una de sus rutas). Los huecos del Top10 se rellenan usando el **orden original PRE congelado**, sin recalcular score ni leer resultados objetivo. La quiniela se coteja en familias VT3 reversibles, no en coordenadas sorteadas.
- D−1, D−7 y D−14 **exactos calendarios**, mismo turno y fuente; una hoja inexistente en el corpus se trata como **no disponible**, no como cero. D−7 y D−14 se requieren simultáneamente para persistencia de dos semanas.
- Los resultados POST originales y del laboratorio predecesor se movieron temporalmente fuera del repositorio durante el PRE y se restituyeron solo después de escribir `PRE_115.json` y `SELLO.json`.
- 2.000 descartes neutrales por filtro, con la misma cantidad de familias eliminadas **en cada corte** y misma reposición del orden geométrico original.

## Resultado completo
| Regla de descarte PRE | Cortes evaluables | Familias excluidas | Reducción dentro de cortes evaluables | Ganadoras descartadas / ganadoras presentes | Cambios Top3 / Top5 / Top10 | Cambios en aciertos Top3 / Top5 / Top10 |
|---|---:|---:|---:|---:|---:|---:|
| Misma familia + ruta física D−1 | 95 | 41 | 0,32 % | 0 / 118 | 0 / 2 / 4 | **0 / 0 / 0** |
| Misma familia + ruta física D−7 | 85 | 27 | 0,24 % | 0 / 103 | 0 / 0 / 0 | **0 / 0 / 0** |
| Misma familia + fuente D−1 | 95 | 1.543 | 12,12 % | 10 / 118 | 6 / 14 / 38 | **0 / 0 / 0** |
| Familia presente D−7 y D−14 | 55 | 704 | 9,50 % | 4 / 61 | 7 / 15 / 24 | **0 / 0 / 0** |
| Misma ruta física D−7 y D−14 | 55 | 0 | 0 % | 0 / 61 | 0 / 0 / 0 | **0 / 0 / 0** |
| Sin caminos en nueva fuente y repite familia+fuente D−1 | 76 | 936 | 8,06 % | 5 / 104 | 4 / 7 / 25 | **0 / 0 / 0** |
| Persistencia exacta 4 semanas | **0** | — | **NO EVALUABLE** | — | — | — |

Los descartes representan exposiciones familia×corte: una misma familia puede aparecer en distintos turnos. La proporción de ganadoras retenidas por las reglas con mayor reducción fue **91,525 %** (misma familia y fuente D−1), **93,443 %** (D−7 y D−14) y **95,192 %** (estable intradía y D−1), respectivamente.

**Hallazgo crucial:** las tres reglas más amplias descartaron respectivamente **67, 48 y 41** posiciones que ocupaban un puesto del Top10 original, pero **ninguna** de esas posiciones eliminadas era una familia ganadora en ese corte. A pesar de ello, el Top3/5/10 no recuperó aciertos: sus reemplazos tampoco coincidieron. Es decir, hubo un **descarte razonablemente seguro de parte del Top10 histórico** en esta muestra, pero sin mejora efectiva para elegir la terna ganadora.

## Controles neutrales igualando descarte por corte
Entre los filtros amplios:
- `REPETIDA_FUENTE_D1`: se eliminaron **10** exposiciones ganadoras, frente a una media neutral de **14,8545** y cola neutral de pérdidas <=10 **0,11094**; 12,12 % de las familias fueron descartadas. No se ganó ningún Top3/5/10.
- `PERSISTE_FAMILIA_D7_D14`: **4** ganadoras eliminadas vs media neutral **5,8355**, cola <=4 **0,28886**; sin ganancia de Top.
- `ESTABLE_INTRADIA_Y_D1`: **5** vs media neutral **9,1125**, cola <=5 **0,10695**; sin ganancia de Top.

Estos resultados sugieren como mucho una **posible tendencia exploratoria** de excluir algunas familias perdedoras desproporcionadamente, pero las muestras son correlacionadas, las reglas se evalúan en fechas ya reutilizadas en numerosos laboratorios y **no pasan el control de mejora del Top**. No confundir colas de Monte Carlo con valores confirmatorios de significancia.

## Advertencia crítica sobre la propuesta de cuatro semanas
El rango original (15/09–10/10, 23 jornadas reales en 26 días calendario) no contiene historia D−28 anterior completa para ningún corte. La condición propuesta de «sin cambio en las últimas cuatro semanas» tendría requerimientos que no se cumplieron. Este laboratorio sólo probó **sustitutos definidos explícitamente** con ventanas D−1, D−7 y D−14 y su interacción intradía. No atribuirle a la regla de 4 semanas un resultado positivo o negativo.

## Comparación contra el ranking original
Antes de filtrar, `F_D1` obtuvo **8/115 Top3, 10/115 Top5, 16/115 Top10**. El VT3 oficial obtuvo **5/115, 8/115, 15/115**. Al aplicar cualquiera de los filtros y rellenar hasta completar el cupo original, los **totales de aciertos quedaron idénticos a 8/10/16** en estos 115 cortes, aunque **algunas listas Top sí cambiaron de integrantes**.

## Decisión y próximo criterio
- Preservar filtros únicamente como **etiquetas informativas, no eliminaciones oficiales**, hasta obtener evidencia temporal no reutilizada.
- Para investigar cuatro semanas necesitamos más PRE históricos verificables previos a cada objetivo o esperar a acumular continuidad prospectiva. Nunca tratar faltantes como ceros.
- Evaluar dos objetivos por separado: (a) depurar presentación del inventario, sin tocar la predicción; (b) demostrar una mejora reproducible en los Tops con reemplazo a igual presupuesto. Este laboratorio sólo permite aspirar a (a), de forma cautelosa; (b) **no se consiguió**.
- Mantener la comparación con controles neutrales **en cada corte**, no solo por cantidad global descartada. Congelar cualquier regla candidata antes de próximos sorteos.

## Archivos reproducibles
- [GitHub Actions final sin errores, PRE aislado y POST contrastado](https://github.com/y0t3/Modelo-Papa/actions/runs/38525504032)
- `PROTOCOLO_VT3_FILTROS_DESCARTE_14OCT2026.md`
- `scripts/lab-vt3-filtros-descarte.mjs`
- `auditorias/vt3-filtros-descarte-115-14oct2026/PRE_115.json`, `SELLO.json`, `POST_115.json`, `RESUMEN.json`
