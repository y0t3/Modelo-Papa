# VT3 — control negativo de vigencia y contraste Nocturna 12/10
Fecha 13/10/2026. Continuación exploratoria de `PROTOCOLO_VT3_VIGENCIA_FISICA_13OCT2026.md`, cuyo PRE de 115 cortes ya se generó y selló **antes del POST de esa ejecución**, aunque el diseño de políticas fue posterior al conocimiento histórico de los sorteos.

## Contraste 1: prioridad de siete jornadas
- Regla congelada: `NUEVA_7` del PRE ya sellado; Top3, Top5 y Top10, comparado como **diferencia pareada** frente a `OFICIAL` del mismo corte. Incluir como control desfavorable `ACTIVA_1`, además de `NACE_HOY` descriptivo.
- Control negativo: 22 desplazamientos no nulos de **jornadas completas** sobre las 23 jornadas históricas; 20.000 permutaciones de jornadas completas (sin romper sus cinco turnos) y 20.000 dentro de cada día de semana, semilla 20261013. Conservar cada familia y Top PRE inalterados.
- Reportar no sólo las coincidencias absolutas, sino la distribución de `NUEVA_7 - OFICIAL` para Top3/5/10, a fin de distinguir mejora de la regla de una coincidencia común con la misma bolsa y turnos.
- Retener intervalos de 80 cortes con ventanas completas: 7 jornadas operativas previas (no equivale a 7 días calendario). El corpus ya fue explorado; ningún p exploratorio es confirmatorio.

## Contraste 2: Nocturna 12/10 ya conocida
- Entrada previa del 12/10: `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/NOCTURNA_SIMULACION.json` construida de fuentes físicas del tablero antes del sorteo. La corrida es retrospectiva y **no reemplaza** el sello de 18:56 del 12/10.
- Aplicar `NUEVA_1, NUEVA_2, NUEVA_7, ACTIVA_1, ACTIVA_2, ACTIVA_7` con historiales PRE de **Nocturno de fechas anteriores** únicamente. Se comparan candidatas `A_ORIGINAL` ancladas del mismo corte, sin sumar familias.
- Diagnosticar en POST 851,615,242,290,264 como familias reversibles: presencia en inventario físico, admisión anclada, rango de cada prioridad. `851` no puede ingresar mediante sólo cambiar el orden si carece de anclaje; distinguir esa limitación de calidad del selector. Nunca pasar a VT4.
- Guardar `NOCTURNA_PRE.json` sin resultados y `NOCTURNA_POST.json` con resultados, y los controles en JSON permanente, con SHA.
