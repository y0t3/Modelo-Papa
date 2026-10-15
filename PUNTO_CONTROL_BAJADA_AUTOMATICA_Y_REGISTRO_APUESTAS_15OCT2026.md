# Pestaña LALO — «bajalo» automático y propuesta de caja de apuestas

## Cambio implementado: PRE personal V3

- Cuando Lalo selecciona una ruta de **cuatro cifras**, se registra una sola ruta VT4 elegida por él y, de forma automática, se habilitan las terminaciones de **tres y dos cifras** de ese mismo recorrido. Ejemplo **3044 → 044 → 44**. El sufijo de 3 usa las últimas tres celdas, el de 2 las últimas dos. Sólo el prefijo de VT4 se añade a la izquierda de la madre VT3 al formar la cuaterna.
- El texto «↓ Bajado de VT4» acompaña las candidatas automáticas VT3 y VT2; pueden coexistir otros recorridos agregados manualmente, sin duplicar la misma ruta. Seleccionar **sólo dos o sólo tres cifras** no crea por defecto ninguna jugada adicional.
- Una misma familia VT2/VT3 puede tener varios testigos físicos, pero cuenta como **una jugada familiar en el análisis de coincidencias**, para no inflar sus estadísticas.
- `expandDownPicks` calcula las derivadas de modo determinista y no depende del ranking automático VT3/VT4. La selección original se conserva íntegra, sin añadir «caminos inventados».
- La captura de pronóstico se almacena con `PAPA_PRE_V3` y su hash; el PRE contiene los recorridos originales y las derivadas se obtienen siempre del mismo recorrido congelado. Los PRE anteriores **V1 y V2** siguen válidos y no reciben bajadas ni nuevos aciertos retroactivos.
- No se modifican ranking ni física del motor oficial VT2/VT3/VT4; son reglas del pronóstico **manual de Lalo**.

## Diseño propuesto, AÚN no implementado: registro monetario

Incorporar tercer subapartado `MI PRONÓSTICO | APUESTAS | RESUMEN` dentro de LALO. Cada apuesta real se vincula a una captura PRE, pero **el pronóstico guardado no equivale a haber apostado dinero**.

- Una **boleta/apuesta** contiene fecha, turno, jurisdicción real, alcance (a la cabeza/primeras cinco/diez/veinte posiciones), número **literal** con 2, 3 o 4 cifras, importe individual y comprobante optativo.
- Una selección VT4 con «bajalo» genera tres renglones de apuestas potenciales; los importes podrán distribuirse a cada renglón. **No** se presume que se apostó ni se cobra automáticamente nada sin confirmación del usuario.
- Se fija la tabla de premios según la jurisdicción/modalidad/alcance, preferiblemente leyendo montos reales del comprobante o definiendo tabla configurable; no inventar coeficientes.
- Tras el sorteo, la app puede indicar **coincidencias con cabezas verificadas**. Para apuestas a varias posiciones se requieren las 20 extracciones oficiales; como hoy sólo se guardan cabezas, no se podrá declarar una apuesta perdida ni ganadora de 5/10/20 posiciones con datos incompletos.
- Estado sugerido `borrador | confirmada | pendiente de resultado | resultado verificado | cobrada`. Ganancia neta = premio efectivamente cobrado menos inversión. No confundir «coincidencia de familia VT3» con premio por número exacto (044 y 440 son apuestas distintas).
- Balance diario/semanal/mensual: total gastado, total en premios cobrados, resultado neto, premios pendientes, apuestas sin resultados aún; exportación/backup antes de borrar datos de Android.
- Limitarse a registro descriptivo, sin herramientas de cálculo para sugerir cuánto arriesgar ni presentar tendencias como garantía de beneficio.

### Pregunta pendiente de confirmar

Cuando Lalo pide «bajalo», ¿pone **el mismo importe en las 4, 3 y 2 cifras** o reparte **una cifra total** entre las tres? Esta regla determina el cálculo automático de gastos y el formulario de carga.

## Archivos

- `src/papaPronostico.ts`: PRE V3, derivadas por sufijos y cotejo sólo de registros V3.
- `src/ui/PapaPronostico.tsx`: vista «bajalo» con todas las modalidades y etiqueta de procedencia.
- `scripts/test-pronostico-papa.ts`: cobertura de terminaciones, deduplicación, testigos y compatibilidad de PRE anteriores.
- No APK todavía.
