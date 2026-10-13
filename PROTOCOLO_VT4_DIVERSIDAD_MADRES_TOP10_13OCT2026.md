# VT4 — reparto equilibrado de las diez plazas por madres VT3
**13/10/2026. Rama experimental:** `lab-vt4-diversidad-madres-top10-13oct2026`. No modificar motor oficial, `main`, sellos previos, la app ni predicciones publicadas.

## Pregunta
Tras corregir la identidad de VT4 para ser **madre VT3 reversible + cifra agregada + extremo de ampliación**, el Top10 sigue ocupado por seis hijas de la madre VT3 #1 y cuatro de la #2. ¿Qué cambia si repartimos **las mismas diez plazas** entre madres distintas? Nunca inventar una hija sin un camino real de cuatro casillas contiguas en su fuente ni invertir cuaternas enteras.

## Identidad y deduplicación
- Cada agrupación VT4 tiene madre VT3, cifra y extremo prefijo/sufijo, y cuenta con las variantes del par que **de verdad** tienen un recorrido propio; `3226/3622` no es `3226/6223`.
- Una misma cuaterna exacta puede aparecer en grupos de madres diferentes (`5485` de `485/584` y de `548/845`). Al seleccionar diez familias, **no se puede volver a gastar otra plaza en un grupo que comparta algún valor de cuatro cifras con los ya seleccionados**. Se lleva registro de grupos seleccionados y cuaternas físicas únicas representadas, por separado. Las cuaternas inversas completas no se deduplican por inversión numérica sin recorrido, sólo las cuaternas exactas compartidas entre grupos.
- La madre de un grupo se comprueba en VT3 admitido Top10 y en **sus tramos físicos reales**; el ranking original de todas las agrupaciones VT4 corregidas se conserva como referencia.

## Políticas predeclaradas
Para cada corte, a partir de la lista ordenada de familias VT4 corregidas:
1. `ORIGINAL_CORREGIDO`: primeras diez agrupaciones según prioridad absoluta de mejor madre, sin restricciones; sólo referencia.
2. `UNICO_NUMERO`: primeras diez agrupaciones sin repetir una misma cuaterna física entre agrupaciones; control que aísla el efecto de no duplicar cifras.
3. `CUPO_1`, `CUPO_2`, `CUPO_3`: recorrido voraz de la lista original, priorizando grupos cuya madre principal (mejor puesto VT3 propio) **aún no** ha agotado el cupo 1, 2 o 3; si no hay suficientes madres elegibles, completar hasta diez con otras hijas físicas válidas y registrar explícitamente cada plaza que **excede el cupo**. Conservar unicidad de cuaternas físicas. Estas son preferencias de reparto, no límites duros.
4. `RONDA_MADRES`: una ronda por madre VT3 según su puesto 1..10, eligiendo primero su hija mejor ranqueada que no colisiona numéricamente; repetir rondas hasta llegar a diez, aunque en rondas posteriores pueda usar otra hija legítima de la misma madre. No inventar madres ni cifras nuevas.
5. `BASE_NEUTRAL`: en cada corte seleccionar diez agrupaciones físicas distintas por hash determinista PRE, con unicidad numérica; control de cupo igual.

**Todos los métodos deben ocupar exactamente diez plazas; los cupos 1/2/3 son metas iniciales y pueden excederse mediante un pase de relleno registrado.** `RONDA_MADRES`, `UNICO_NUMERO` y `BASE_NEUTRAL` deben llenar diez, o el experimento abortará para ese corte si la bolsa física es menor que diez. Todas las políticas comparten el mismo motor de madres VT3, origen de rutas, fuentes y forma corregida.

## Procedimiento PRE/POST
- Histórico congelado de 30 fechas, 115 cortes a partir de 23 jornadas. Generar los PRE del fixture con todas las cabezas del turno objetivo y siguientes sustituidas por `----`. D−1/D−7 **sólo fechas anteriores**.
- **Antes de elegir rankings**, sacar físicamente del checkout los resultados POST y el fixture con los resultados futuros, dejando sólo las entradas PRE y el código. Construir por corte diez plazas, sus grupos madre y cuaternas físicas representadas, y guardar un `SELLO.json` con SHA256 de PRE, protocolo y script. Elegir las políticas ANTES de restaurar los objetivos.
- Sólo después restaurar resultados y verificar para cada una de las cinco cabezas argentinas si existe alguna cuaterna exacta físicamente recorrida en el Top3/Top5/Top10. Un grupo con dos valores reales puede explicar ambos pero sólo cuenta como **una** coincidencia del corte. No dar aciertos a cifras presentes en la **etiqueta teórica** pero sin camino físico.
- Reportar por política las plazas reales, grupos distintos, cobertura de madres distintas, cuaternas exactas distintas, cambios respecto del ranking corregido, rescates y pérdidas por corte (115), Top3/5/10, y semanales.
- Repetir diagnóstico ilustrativo sobre Primera y Matutina 13/10 usando las **mismas entradas** auditadas con el sello VT3 Matutino previo `067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41`. Ese cotejo del 13/10 es retrospectivo VT4: no afirmar sello antes de su sorteo.
- No elegir la «mejor» política mirando cabezas actuales. Sorteos aleatorios y corpus repetidamente investigado. Cualquier mejora descriptiva necesitaría prueba prospectiva nueva con VT4 explícitamente sellado antes del sorteo.

## Entregables
`scripts/lab-vt4-diversidad-top10.mjs`, `.github/workflows/lab-vt4-diversidad-top10.yml`, `auditorias/vt4-diversidad-madres-top10-115-13oct2026/{PRE_115.json,SELLO.json,POST_115.json,RESUMEN.json,13OCT_POST.json}` e informe Markdown. **Nunca modificar `src/motorLalo.ts` en este estudio**: éste usa el motor ya corregido en la rama madre como base.
