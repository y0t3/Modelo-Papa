# Evaluación VT4 — Primera y Matutina del martes 13/10/2026

**Rama experimental:** `lab-vt4-primeramatutino-13oct2026`. **No tocar VT3/VT4 del motor, sellos originales, app ni main.**

El usuario observa dos cabezas completas de cuatro cifras con marcas retrospectivas VT4 en su hoja: **5485** de Ciudad en Primera y **1057** de Provincia en Matutina. Se comprobarán por separado:

1. **Existencia física VT4**: cuaterna completa o invertida, recorridos de 4 casillas distintas contiguas dentro de una sola fuente, sin cruzar turnos ni inventar raíces.
2. **Admisión como hija VT4 de Lalo**: ruta nacida físicamente de **una madre VT3 de las diez priorizadas** en ese turno. La familia numérica de tres dígitos no equivale a agregar una cifra arbitraria. Hay que comprobar en cada ruta los tramos contiguos de tres casillas y si corresponden realmente a una ruta concreta de esa madre.
3. **Ranking**: si está admitida, puesto exacto en VT4 y Top3/Top5/Top10, número de fuentes, bloques de cuatro celdas y madres propias. Si no está admitida, explicar por qué, sin ascenderla artificialmente al Top10.
4. **Comparar las otras cabezas del turno**, y mostrar por separado cinco jurisdicciones argentinas y seis incluyendo Montevideo en Matutina.
5. **Integridad temporal**: reconstruir las entradas PRE del 13/10 usando únicamente el lunes 12/10, martes D−7 06/10 y turnos publicados anteriores del 13/10. Exigir que toda la **lista VT3 de Matutina coincida** con el sello previo de las 13:52 Argentina, SHA256 `067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41`, y que el VT3 de Primera coincida con la reconstrucción que ya se guardó. **El sello de las 13:52 contenía Top3/Top10 VT3, pero NO contenía el ranking VT4. Por ello VT4 de ambos turnos es una reconstrucción histórica posterior, no una selección de VT4 que podamos demostrar sellada antes de sus sorteos**. No llamarla «acierto prospectivo sellado».
6. Congelar todas las propuestas VT4 reconstruidas en un archivo PRE propio, verificar motor/fuentes y luego cotejar las cabezas de la captura del usuario. Al haber pasado ya el sorteo, esta nueva congelación sólo permite auditoría reproducible, no validar capacidad de predicción futura.

Fechas/fuentes y reglas históricas idénticas a `scripts/lab-vt3-en-vivo-13oct2026.mjs`. La captura aporta Primera Ciudad 5485 y Matutina Provincia 1057, más las cinco/seis cabezas completas previamente anotadas. **No confundir 5485 con la VT3 485/584, ni 1057 con 057/750**.

## Archivos a generar
`scripts/lab-vt4-13oct2026.mjs`, workflow GitHub Actions separado y `auditorias/vt4-13oct2026/{RECONSTRUCCION_PRE_VT4.json,SELLO.json,POST.json,RESUMEN.json}`; informe Markdown tras ejecución. Los Tops y datos oficiales originales no se alteran.

**La quiniela es aleatoria. Un acierto aislado no valida VT4 y toda esta prueba se reconstruye después de los sorteos.**
