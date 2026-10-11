# Punto de control: observatorio visual V8 por 29 jornadas (11/10/2026)

Se implementó un visor HTML autocontenido de laboratorio, entregado en la conversación como el ZIP **observatorio-visual-v8-modelo-papa-29-jornadas.zip** y archivo **observatorio_v8_geometria_29_dias/index.html**. Contiene también un núcleo experimental en TypeScript y pruebas.

- 29 cortes de Primera, con las dos fuentes realmente disponibles antes de ese turno.
- 8.259 ternas-fecha y 18.096 recorridos dirigidos: **todos** los conteos cotejados automáticamente contra el ranking original V8 y la ablación sin puentes.
- 1.226 anotaciones históricas D−1/D−7 recuperadas de las fechas verificadas; cabezas originales completas con todos sus recorridos físicos. Cuando faltan antecedentes verificados, la interfaz informa ausencia de documentación, no ausencia de figuras.
- 142 marcas de Previa previamente conocida, reconstruidas únicamente dentro de la fuente Nocturna anterior.
- Antes de Primera del 10/10, fotografía auténtica 10:53 ART comprobada por SHA256 **99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9**. 54 anotaciones originales D−1/D−7 y candidato 393: dos lecturas dirigidas, una única huella física, **cero caminos válidos**, dos cruces entre columnas.
- UI con selector de fecha y terna, cabezas históricas D−1 y D−7, capa de resultados ya conocidos Previa, trazos permitidos verdes, puentes inválidos V8 rojos discontinuos, y puntajes originales/ablados exclusivamente explicativos. Resultados de Primera inicialmente ocultos, pero herramienta retrospectiva, NO verdadera prueba prospectiva.
- Prototipo TypeScript observacional sin rankings, validación de contigüidad, no reutilización ni celdas vacías, fuente individual, identidad reversible, comparación de cabezas completas, y reconfirmación entre turnos (nunca simple persistencia acumulada).
- Tests automáticos del generador e integridad de 8.259 ternas, tests TypeScript pasados, y simulación de interacción de interfaz con Chromium pasada.

**No se modificaron:** motor actual, enumerador oficial, selector, app Android, rama main ni APK. Los cruces de V8 solo pueden verse como fenómeno histórico separado, **no** como rutas válidas del Modelo Papá. V8 original 1/29 primeras selecciones compatibles en el backtest retrospectivo; ablación 0/29. No se ha demostrado una ventaja predictiva.

Se propone la siguiente etapa: registros verdaderamente anteriores a próximos sorteos, con figura, orientación, fuente y opción de abstenerse, sin reordenar después según el resultado.
