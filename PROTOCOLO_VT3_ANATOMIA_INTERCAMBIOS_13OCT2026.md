# VT3 — anatomía de intercambios por diversidad de cabezas (13/10/2026)

Rama `lab-vt3-anatomia-intercambios-13oct2026` creada desde `lab-vt3-replay-cronologico-13oct2026`. Laboratorio de **diagnóstico físico y falsación**, no rediseño del Top. Main, motor oficial, app, cabezas selladas y VT4 permanecen intactos.

## Pregunta
COB20_P3 cambió 136 exposiciones de familias del Top10 en 115 cortes y obtuvo 17/115 frente a 15/115; `CONTROL_MAS_EVENTOS_20` también consiguió 17/115 cambiando muchas más exposiciones. ¿Qué *antecedentes propios* aportan las familias que entran al Top, qué se pierde al sustituir las que salen, y qué sucede en las numerosas sustituciones **negativas**? No escoger sólo aciertos para deducir una regla.

## Entrada PRE, integridad y prohibiciones
`auditorias/vt3-diversidad-antecedentes-115-13oct2026/PRE_115.json`, SHA256 `b190ed0a4715220501f564dee3300264c32efeccef7bc49fbfb1dee10999908e`; rango original y conjunto de eventos físicos propios de `pool`, primeras 40 ancladas por corte. No reconstruir raíces, alterar rutas ni contar varias veces un `rootId` de misma cabeza. Evento deduplicado: fecha, D−1/D−7, turno, jurisdicción y cabeza histórica completa. Ningún recorrido entre fuentes ni préstamo de raíz a otra familia.

**Etapa PRE:** Workflow aparta todas las carpetas de auditorías salvo este `PRE_115.json`; debe ser imposible leer `POST_115.json` o cualquier registro de ganador. Genera por corte:
1. Intersección `I` de las familias del Top10 original y del Top10 alternativo (diversidad o más raíces).
2. Entrantes `E = alternativo − original`, salientes `S = original − alternativo`, sin emparejar arbitrariamente una familia con otra. Desglosar familia, puesto original, raíces únicas, bloque físico, bifurcación, raíz D−1/D−7, eventos presentes en `I` y eventos exclusivamente aportados por `E` o `S`.
3. **Cobertura marginal** de cada familia entrante/saliente respecto a una base común: (E_f \setminus R(I)); distinto de raíz independiente nueva para la lotería. Distancia al rango oficial del Top10.
4. Cobertura alternativa contra oficial: eventos históricos nuevos `R(ALT) − R(OFICIAL)`, eventos perdidos `R(OFICIAL) − R(ALT)`, número de familias distintas por evento, concentración máxima y HHI. Distinguir aumento neto de cobertura de incorporación de eventos nuevos.
5. Competencia por los puestos 4–20: todas las familias **no seleccionadas por el original** en ese rango como negativos de oportunidad, sus eventos nuevos contra las primeras tres familias protegidas y los otros anclajes ya representados.
6. Comparación COB20 y ABUNDANCIA: solapamiento entre ambas, familias exclusivas, causas de diferencia y cobertura del conjunto, sin identificar «causalidad» con cuatro casos seleccionados después.

No construir nuevas reglas de selección en este experimento. **Tops originales y alternativos son los ya sellados**. El diagnóstico parte de todos los 115 cortes, no solamente de las cuatro fechas donde una política ganó/perdió.

## POST y controles
- Incorporar las 5 cabezas objetivo por corte exclusivamente después de sellar PRE; etiquetar cortes `ambos aciertan`, `sólo diversidad`, `sólo original`, `ninguno`; para abundancia lo mismo.
- Medir ganadoras del conjunto de familias entrantes vs salientes, tanto para diversidad como abundancia; examinar cuántas de las 136 entrantes *no* ganaron, y si las salientes tenían mejor rango pero raíz compartida.
- En cada corte determinar si existe alguna familia ganadora entre puestos 11–20, sin reinterpretar la existencia retrospectiva como regla elegible previa. Esta cota superior conceptual es **oráculo ex post**, no una predicción.
- Perfil de **todos** los cortes con intercambios y análisis focales para 16/09 Matutino, 18/09 Nocturno, 02/10 Matutino, 05/10 Vespertino: familia entrante/saliente, puntaje físico, antecedentes nuevos/perdidos y comparadores negativos del mismo corte.
- Reutilizar 2.000 selecciones **neutrales PRE** ya selladas en `auditorias/vt3-diversidad-antecedentes-115-13oct2026/CONTROLES_PRE.json`, verificando su hash; nunca elegir réplicas ganadoras a posteriori.
- Desglose por mes/turno y resultado de ambas políticas frente al original, incluida exposición en cortes fallidos.
- Controles cronológicos con 10.000 permutaciones por fecha completa y 10.000 entre el mismo día semanal sobre delta **COB20−ABUNDANCIA** (no sólo contra VT3 original); no volver a reoptimizar políticas.

## Interpretación obligatoria
Las cabezas de quiniela son sorteos aleatorios. Diversidad de eventos, recencia y número de raíces pueden describir cómo opera el motor, **pero no son probabilidades de resultados futuros**. Los mismos 23 días ya han inspirado numerosas hipótesis y no constituyen datos independientes nuevos; también un PRE sellado retrospectivo puede sobreajustarse. Si no hay distinción robusta, documentar hallazgo negativo sin crear un peso.

Entregables: `scripts/lab-vt3-anatomia-intercambios.mjs`, workflow Actions, `auditorias/vt3-anatomia-intercambios-115-13oct2026/{PRE_115.json,SELLO.json,POST_115.json,RESUMEN.json}` e informe Markdown consolidado, sólo en rama lab.
