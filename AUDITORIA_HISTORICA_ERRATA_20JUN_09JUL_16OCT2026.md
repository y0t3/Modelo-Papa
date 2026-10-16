# ERRATA HISTÓRICA — fechas 20/06 y 09/07/2026

**16/10/2026. Este documento conserva la trazabilidad; no cambia resultados PRE ya sellados ni los motores originales.**

## Corrección fundamental

**Nunca eliminar una fecha completa porque sea feriado argentino.** Comprobar **jurisdicción y turno**: Montevideo puede tener sorteo aun cuando las cinco jurisdicciones argentinas estén vacías.

Según la Dirección Nacional de Loterías y Quinielas de Uruguay:
- **Sábado 20/06/2026:** Nocturno Montevideo **963 = `0963`**. Fuente oficial: https://www.loteria.gub.uy/ver_resultados.php?vano=2026&vdia=20&vmes=6
- **Jueves 09/07/2026:** Vespertino Montevideo **449 = `0449`**, Nocturno Montevideo **802 = `0802`**. Fuente oficial: https://www.loteria.gub.uy/ver_resultados.php?vano=2026&vdia=9&vmes=7

La API usada por la app solo reportó esas cabezas uruguayas en cada una de esas fechas; no reportó ninguna argentina. Se mantiene el vacío `----` para lo que no está publicado y nunca se imputan resultados de otra fecha.

**Efecto físico:**
- Antes de Previa **22/06**, la fuente real Nocturna anterior es 20/06 y sus seis parejas +11 son `--,--,--,--,--,74`.
- Antes de Previa **10/07**, la fuente real Nocturna anterior es 09/07 y sus parejas son `--,--,--,--,--,13`.
- No hay recorridos VT3 de tres casillas en esas fuentes aisladas, por lo tanto su Top3 PRE Previa puede estar vacío correctamente.

## Revisión retrospectiva cuantificada

Se repitieron exactamente **104 jornadas / 520 cortes / 2600 cabezas argentinas** sin los dos bloqueos de fecha y preservando sus Nocturnas válidas. Resultados comparativos:

| Métrica | Versión anterior | Con referencias verificadas |
|---|---:|---:|
| Cabezas con familia VT3 físicamente presente | 660 | **654** |
| Aciertos familiares VT3 Top3 Modelo Lalo | 14 | **13** |
| Aciertos familiares VT3 Top3 Geometría completa | 17 | **17** |

**35 cortes de siete fechas** cambiaron en algún aspecto: 22, 23, 27 y 29 de junio; 10, 11 y 17 de julio. Agosto-octubre no cambió. Las cifras de junio-julio publicadas anteriormente **con el bloqueo de esas fechas deben considerarse superadas o provisionales** hasta re-evaluarlas con fuentes reales. No extrapolar cambios retrospectivos a capacidad predictiva.

- Prueba corregida: https://github.com/y0t3/Modelo-Papa/actions/runs/38871916816
- Prueba anterior conservada para auditoría: https://github.com/y0t3/Modelo-Papa/actions/runs/38863258376
- Informe completo corregido: https://github.com/y0t3/Modelo-Papa/blob/lab/revision-520-pre-con-uruguay-verificado-16oct2026/auditorias/revision-fuentes-uruguay-520-16oct2026/RESUMEN.md
- Auditoría de 14 fechas API: https://github.com/y0t3/Modelo-Papa/blob/lab/verificacion-historica-jurisdiccion-turno-16oct2026/auditorias/verificacion-historica-fuentes-16oct2026/RESUMEN.md

## Garantía permanente en main

`scripts/test-historico-sorteos-parciales.ts` comprueba que `loadPreviousDraws` respete el último Nocturno válido de Uruguay, que conserve ceros a la izquierda, que se aplique +11 solo a los dígitos existentes, que sábado Uruguay no tenga un Matutino inventado y que nunca se llenen filas argentinas con valores de otra fecha. El workflow principal ejecuta esta regresión en cada cambio.

**IMPORTANTE:** la fuente web consultada no devuelve fecha efectiva documentada para cada resultado; la verificación de procedencia de otros feriados sigue abierta. La corrección de VT4 de panorama predictivo fue independiente de esta auditoría.
