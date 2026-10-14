# Laboratorio VT3: exposición física por rango materno (13/10/2026)

**Análisis exploratorio retrospectivo de 115 cortes.** Rama independiente; no cambiar `main`, app, ranking ni sellos anteriores.

## Pregunta
¿Las cabezas VT4 históricas se concentran en madres VT3 #1–3, #4–5, #6–10, #11–25 o #26+ más de lo esperable por el número de cuaternas físicamente construibles en cada banda?

## Fuente PRE
Usar exclusivamente `auditorias/vt3-madres-vt4-cobertura-115-13oct2026/MAPAS_FISICOS_PRE_115.json`, cuyo contenido se selló antes de revelar resultados. Para cada uno de los 10.000 valores y cada corte, clasificar por la **menor posición** de madre VT3 con ruta propia y anclaje: 1–3, 4–5, 6–10, 11–25, 26+, física sin raíz o no físicamente existente. Categorías mutuamente excluyentes: no prestar respaldo histórico entre recorridos.

## Cotejo POST
Observar la clase física real de cada una de las cinco cabezas de las cinco jurisdicciones por corte, sin crear nuevas candidatas. Reproducir los 115 cortes sellados; verificar SHA256 de `PRE_115.json`, mapas, y bytes descomprimidos. Reportar por banda número de números elegibles por corte, observado vs esperado `5*n/10000`, desviación y valor p bilateral bajo referencia nula de sorteos independientes uniformes; cálculo de distribución Poisson-binomial exacta para los 575 valores y para 115 indicadores de al menos una cabeza por corte. Corrección conservadora de Bonferroni por las siete bandas.

## Reglas de interpretación
La hipótesis se eligió después de explorar estos mismos 115 cortes. Las pruebas y p-valores son **diagnósticos exploratorios** y no confirman eficacia de VT3/VT4. Comparar además septiembre/octubre para detectar inestabilidad. No convertir la bolsa física, sus resultados futuros o la banda que resulte favorecida en una regla oficial sin nueva prueba cronológica verdaderamente independiente. Las cinco cabezas y turnos podrían no ser perfectamente independientes; el contraste uniforme es sólo referencia.

## Archivos
`scripts/lab-vt3-rangos-exposicion-vt4.mjs`, `.github/workflows/lab-vt3-rangos-exposicion-vt4.yml`, `auditorias/vt3-rangos-exposicion-vt4-115-13oct2026/` (resultado y resumen).