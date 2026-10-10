# Protocolo bloqueado — comparación posterior del tablero PRE auténtico del 10/10/2026

Rama aislada: `auditoria-sorteo-10oct-2026`. Esta nota se registra **antes de ejecutar el cotejo**.

## Material que debe existir antes de leer resultados

GitHub Actions `38050639551`, artefacto `PREVIA-10-OCT-2026-SOLO-TABLERO-SIN-PRONOSTICO`, fecha de foto `2026-10-10T12:04:33.017Z` (09:04:33 ART), SHA256 **`19d3357c82e59dbf5050ed7941f160b7e4c04a1a0875fb5e25de9147a245ea4b`**, fecha objetivo 10/10 y **turno único previsto `Previa`**. Se verifica que no incluye cabezas de ningún turno del 10/10, 0 selecciones humanas y 0 pronósticos. Bases: 09/10 (D−1; 11 anotaciones), 03/10 (D−7; 15 anotaciones), fuente física única `prevNocturno`, para el turno Previa.

**No cambiar ni reconstruir las líneas PRE con el resultado.** Únicamente leer los 11+15 trazos que fueron almacenados.

## Contabilidad cerrada antes del cotejo

1. Dos lecturas numéricas **permitidas**, directa e inversa, de cada huella conservada; no reinterpretar el dibujo como dos figuras. Deduplicar la misma geometría física por `modalidad|fuente|secuencia de celdas canónica bajo inversión` **dentro de D−1, dentro de D−7 y en su unión**. La anotación de múltiples cabezas antiguas sobre una huella queda asociada, no la multiplica.
2. Para cada figura, comparar su terminación completa de VT2, VT3 o VT4 con **todas las cabezas reales de las seis jurisdicciones de Previa**. Guardar explícitamente cada cabeza completa, jurisdicción, sufijo, dirección coincidente, si coincidió con alguna orientación antigua y cuáles cabezas antiguas generaron la figura.
3. Separar `COINCIDE`, `NO_COINCIDE`, `INDETERMINADA` para VT2/VT3/VT4, incluyendo TODOS los negativos y toda evidencia parcial. Si faltan jurisdicciones, un camino con cero coincidencias NO se convierte en fracaso.
4. Registrar conteos **para D−1 y D−7 por separado**, coincidencias físicas compartidas entre ambas memorias, y unión de figuras únicas. No tratar recuerdos repetidos como señales independientes. Reportar denominadores, coberturas, ambas orientaciones, coincidencias y no coincidencias.
5. Comparar con una **línea base descriptiva** de todos los caminos contiguos VT2/3/4 posibles de la columna fuente que quedó congelada, sin usar el resultado para escogerlos ni llamarlos pronósticos. Esto sirve para saber si hubo selectividad más allá de mirar cualquier figura. Es exploratorio y expuesto a sesgos; no demostrar ventaja de una muestra.
6. **Solo Previa permite cotejo desde este registro auténticamente anterior**. Los resultados de Primera, Matutino, Vespertino y Nocturno del 10/10 pueden generar aparte una **hoja cerrada retrospectiva** con todas sus marcas, pero NO adjudicarles predicciones previas, porque el registro de las 09:04 no contenía las columnas añadidas después.
7. Guardar `JSON` completos por origen y por figura + informe Markdown + visor HTML de la foto PRE y sus reconfirmaciones. Los resultados POST nunca se escriben de nuevo dentro de la foto PRE.

## Advertencia fundamental

**No existió elección humana sellada.** Cualquier coincidencia es **acierto retrospectivo de alguna ruta preexistente** dentro de múltiples caminos y orientaciones, **NO acierto de pronóstico, ni evidencia de que tu papá haya elegido esa ruta**. Aun así, sirve para ver objetivamente cuáles rutas viejas del tablero existían ANTES del sorteo y cuáles resultaron compatibles con las cabezas conocidas después.

Solo archivos de la nueva rama de auditoría; **sin tocar `main`, selector, motor ni APK oficial**.