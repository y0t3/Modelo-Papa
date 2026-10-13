# Protocolo VT3 — replay cronológico y prueba de concentración de antecedentes
Fecha: 13/10/2026. Rama: `lab-vt3-replay-cronologico-13oct2026`.

## Objetivo
Continuar probando SIN esperar sorteos nuevos y SIN alterar motor `main`. El anterior ensayo de diversidad COB20_P3 obtuvo 17/115 versus 15/115, pero los mismos 23 días fueron ya repetidamente analizados. En esta prueba no se proponen pesos ni se buscan nuevos candidatos: **se somete a estrés una familia preexistente de cinco algoritmos fijos y se recorre el histórico en orden real**.

La pregunta es doble: (1) ¿hay un patrón de situaciones PRE —concentración de antecedentes— en que la regla diversificadora sea más útil?, (2) ¿podría una decisión operativa seleccionarse con **sólo resultados anteriores** al corte correspondiente, sin escoger después la regla ganadora de un día conocido?

**Advertencia:** aunque cada decisión del replay use exclusivamente días anteriores, la elección de las políticas y esta línea de investigación se apoyó en el mismo histórico conocido. No se denominará validación prospectiva ni evidencia independiente de predicción. La quiniela es aleatoria.

## Origen e integridad
- PRE congelado de 115 cortes: `auditorias/vt3-diversidad-antecedentes-115-13oct2026/PRE_115.json` SHA256 `b190ed0a4715220501f564dee3300264c32efeccef7bc49fbfb1dee10999908e`.
- Se conservan todos los Tops y métricas PRE ya generados de la rama de diversidad: en particular `OFICIAL`, `COB20_P3`, `COB20_P5`, `CONTROL_MAS_EVENTOS_20`, `VENTANA10_P3`, `COB40_P3`. Sus nombres son familias reversibles ancladas por raíces físicas propias. No se permiten transformaciones retrospectivas de familias ni nuevas raíces.
- Durante PRE el workflow apartará TODO el directorio de auditorías anteriores, incluidos POST y RESUMEN, dejando disponibles sólo los archivos PRE estrictamente necesarios; construirá un `PRE_REPLAY_115.json` con listas ya fijadas, métricas de concentración, decisiones puramente geométricas y sello SHA256. Se restaura POST sólo después.
- Cada evento raíz = `fecha|D−1/D−7|turno|jurisdicción|cabeza completa`; deduplicar rutas adicionales del mismo evento. La concentración por cabeza se mide como **número máximo de familias del Top10 oficial que comparten un evento**, NO como número de caminos ni probabilidad.

## Estrategias PRE de concentración (umbrales fijos, sin optimizar)
- `COND5`: usar `COB20_P3` solamente si máximo de familias que comparten el mismo antecedente en Top original es **5 o más**; en caso contrario mantener `OFICIAL`.
- `COND6`: igual para 6 o más.
- `CONTROL_ABUNDANCIA`: `CONTROL_MAS_EVENTOS_20` fijo; sirve para separar la diversidad del mayor número de raíces.
- Registrar cuántos cortes cumplen cada umbral, cuántas familias se sustituyen y su desglose por mes/turno. No se recalibrarán 5 ni 6 a posteriori con resultados.

## Replay walk-forward, decisión de política día a día
Una jornada son sus cinco turnos en el orden: Previa, Primera, Matutino, Vespertino, Nocturno. Se consideran fechas completas; no se usan resultados de un turno del día objetivo para cambiar otro turno del mismo día.

Tres políticas elegibles de decisión: `OFICIAL`, `COB20_P3` y `CONTROL_MAS_EVENTOS_20`. Dentro del periodo de entrenamiento, puntuar cada candidata por **cortes acertados Top10** (un corte suma uno aunque acierten varias familias) y escoger la de mayor total. Los empates se resuelven siempre de forma conservadora `OFICIAL` > `COB20_P3` > `CONTROL_MAS_EVENTOS_20`, no por aciertos futuros.

- `FWD7_EXP`: empezar con **7 jornadas completas** de entrenamiento (primeras 35 observaciones); para cada una de las 16 jornadas restantes elegir la política con más aciertos sobre TODAS las jornadas estrictamente anteriores y usarla en sus cinco cortes.
- `FWD7_ROLL`: también empezar tras siete jornadas, pero elegir según las **últimas 7 jornadas completas anteriores**, ventana móvil. Nadie ve la jornada actual.
- `FWD10_EXP`: empezar tras 10 jornadas completas; 13 jornadas de prueba restantes, con entrenamiento acumulativo.
- Reportar cada jornada, política elegida, resultados de entrenamiento disponibles antes de elegir, Top PRE de los cinco turnos y cotejo POST sólo después. Se comparará en EXACTAMENTE LOS MISMOS días de prueba contra OFICIAL fijo, COB20_P3 fijo y CONTROL_MAS_EVENTOS_20 fijo; no comparar el replay de 16 días con Top10 oficial sobre 23 días.
- Estos algoritmos son simulaciones históricas de decisiones tomadas secuencialmente, no un holdout real ni ensayos ciegos anteriores a 2026.

## Controles de falsación
- Diferencias pareadas frente al oficial y `COB20_P3` estático en los días exactos de cada replay; ganar tres y perder dos implica ganancia neta uno, no «tres aciertos».
- Contrastar `COND5` y `COND6` contra versiones fijas y contra tasa original en cortes con igual concentración.
- Reportar concentración media real PRE y cobertura/HHI de cada estrategia SIN confundirla con corrección de resultados.
- 20.000 reasignaciones **completas de jornadas**: 10.000 libres y 10.000 manteniendo mismo día semanal; conservar los cinco turnos juntos. Repetir *dentro de cada permutación* todo el aprendizaje cronológico sólo con los días objetivos previos. Anotar distribución de delta replay − original en su ventana de test y delta diversidad estática − original.
- 10.000 remuestreos de **jornadas enteras** con reemplazo para intervalo descriptivo de la diferencia COB20_P3 − original; no suponer independencia de los cinco turnos o familias.
- Asegurar en código que las decisiones en fecha i son función sólo de los objetivos históricos j<i, con etiquetas de ventana y listado auditable; no agregar el día actual a los conteos antes de seleccionar la política.
- Desglosar Sep/Oct y grupos cronológicos sin cambiar thresholds después de resultados.
- Dejar tanto positivos como negativos, y si mejora menos que la política fija, anotarlo explícitamente.

## Prohibiciones y continuidad
No tocar VT4, no modificar producción, Top oficial ni fechas/sellos anteriores. Si falla un SHA o se detecta una fuga temporal, abortar la corrida. Aunque una diferencia salga favorable, **no declarar pronósticos mejores que azar**, pues el mismo corpus ya fue examinado para construir estas variantes.

## Entregables
`scripts/lab-vt3-replay-cronologico.mjs`, workflow dedicado, `auditorias/vt3-replay-cronologico-115-13oct2026/{PRE_REPLAY_115.json,SELLO.json,POST_REPLAY_115.json,RESUMEN.json}`, informe Markdown firmado por ejecución GitHub Actions.
