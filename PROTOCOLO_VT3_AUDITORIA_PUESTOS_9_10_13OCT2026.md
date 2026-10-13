# Protocolo: auditoría del puesto 9 y 10 del VT3 oficial (13/10/2026)

Rama de investigación aislada `lab-vt3-auditoria-puestos-9-10-13oct2026`. No modificar `main`, `src/motorLalo.ts`, aplicación, recorridos, Tops sellados, APK ni VT4.

## Hallazgo que motiva el estudio
En 115 cortes (23 jornadas × 5 turnos) el puesto 9 y el 10 de `A_ORIGINAL` no registraron coincidencias con cabezas posteriores, aunque el Top10 sumó 15 cortes con coincidencia. Un puesto concreto puede tener cero por azar: **no inferir defecto del motor ni licencia para dejarlo libre** por sí solo.

## Entradas y separación PRE/POST
- Fuente PRE original `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json` SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`.
- Fuente POST correspondiente `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/POST_115.json`, sólo disponible en la fase POST tras sellar PRE.
- El workflow retira POST de checkout antes de generar los perfiles de puestos, empates y controles seleccionados. El PRE no contiene cabezas objetivo ni sus aciertos. Comprobar el SHA256 del PRE de origen, del código y de la configuración de políticas.
- Bolsa oficial A: familias VT3 reversibles con raíces históricas propias; todas las rutas físicas ya auditadas; el ranking se conserva idéntico al original en cada corte.

## Diagnóstico físico por *familia × corte × puesto*, sin inventar respaldo
Para cada rango 1..30 si existe, registrar:
- `bif` (bloques bifurcados reales, máximo 15 a efectos de prioridad), `d1` y `d7` (eventos de raíz histórica únicos, topados a 10), `sources` (fuentes propias), `blocks` (bloques físicos), `anchoredPaths`, `rank`, `family`.
- Tupla lexicográfica ORIGINAL VT3: `[bif>0, min(bif,15), min(d1,10), min(d7,10), sources, blocks]`; desempate final alfabético por familia. Confirmar que los 115 listados son compatibles con esa prioridad; **abortar** si falla una aserción de ordenación.
- Frecuencia de igualdad exacta de tupla de los puestos 8/9, 9/10, 10/11 y 11/12, y los casos en que la décima familia sólo vence por orden alfabético a la undécima.
- Persistencia de familias idénticas entre turnos adyacentes de un mismo día en posiciones 8, 9 y 10; tasa de cambios, amplitud de variantes en jornada, si se repite 9/10 dentro de mismo top.
- Desglose de puesto 1..30 por mes y turno, recuento de apariciones, **ganadoras por rango** y cobertura. Las cifras son registros por corte, NO sorteos independientes ni probabilidades.

## Controles fijos PRE
- `OFICIAL` 10 primeras familias (control).
- `REEMPLAZAR_9_10_POR_11_12`: conservar primeras ocho oficiales, luego incluir 11 y 12 en orden original. No se adelanta VT4 ni se inventan nuevas familias.
- `REEMPLAZAR_10_POR_11`: conservar primeras nueve, luego familia de rango 11.
- `MEZCLAR_EMPATES_9_10`: mismo Top10, con permutación **sólo de familias de prioridad lexicográfica idéntica que toquen puestos 9/10**. Determinista por hash `20261013|fecha|turno|familia`; los puestos 1..8 permanecen iguales siempre, incluso si el empate atraviesa ese límite.
- `RAND_CANDIDATA_11_A_20`: 2.000 selecciones uniformes predefinidas entre las familias ancladas de puestos 11..20 para cubrir el puesto 10; se salvan listas de selección y sello PRE **antes de POST**, nunca se elige la mejor retrospectivamente.
- `RAND_EMPATES_9_10`: 2.000 permutaciones de empates al borde del puesto 10, también selladas PRE; distinguir los cortes donde no hay posibilidad real de empate.
- En casos con pool <12 familias no inventar rangos: usar original o candidatos disponibles, respetando diez familias siempre.
- Empates sólo si la tupla **completa** coincide. Si no hay empate con candidato más allá del puesto 10, `MEZCLAR_EMPATES_9_10` = original.

## Falsación
- Verificar con POST que posiciones 9/10 = 0 y recomputar todas las posiciones, top3/5/10 y ganadoras únicas por corte. Una fecha con dos familias ganadoras en el Top10 cuenta **un solo corte**, pero dos exposiciones individuales.
- Comparar alternativas de la misma bolsa con original, plus rescates **y pérdidas pareadas**, en septiembre/octubre y cinco turnos.
- Reasignar los resultados completos de las 23 jornadas a PRE de otras fechas, conservando el orden de los cinco turnos y los cinco resultados de cada corte. Para la cifra de aciertos de puestos 9/10, computar **cola inferior P(recuento <= 0)**, no cola superior. 22 rotaciones exactas y 20.000 permutaciones libres más 20.000 entre jornadas del mismo día semanal, semilla 20261013.
- Controles seleccionados de forma fija antes de POST pueden mejorar retrospectivamente por azar. El histórico entero ya ha sido usado repetidamente para desarrollar muchas variantes: *ninguna ganancia in-sample valida pronóstico*, y cero aciertos en 2 posiciones no obliga a suprimirlas.
- Mantener igual presupuesto de diez familias. Diagnóstico Nocturna 12/10 opcional pero sólo desde PRE histórico sellado y comparado en POST de forma retrospectiva.

## Entregables
Script `scripts/lab-vt3-auditoria-puestos.mjs`, GitHub Actions workflow, `auditorias/vt3-auditoria-puestos-115-13oct2026/{PRE_115.json,SELLO.json,POST_115.json,RESUMEN.json}` y resumen Markdown con comprobaciones y controles. Ningún cambio de producción.
