# LALO · Apostar a la cabeza en todas las jurisdicciones del turno

## Regla confirmada

Lalo juega **siempre a la cabeza** y, normalmente, en todas las jurisdicciones que sortean el turno:
Ciudad, Provincia, Córdoba, Santa Fé, Entre Ríos, y **Montevideo sólo si tiene sorteo**.
Cada número seleccionado recibe el mismo importe por jurisdicción; si Lalo dice «bajalo», las 4, 3 y 2 cifras literales reciben **cada una** ese mismo importe.

**Ejemplo:** 3044 → 044 → 44, $1.000 por modalidad y por jurisdicción:
- Previa (cinco argentinas): 3 × 5 × $1.000 = **$15.000**.
- Matutino o Nocturno entre lunes y viernes (más Montevideo): 3 × 6 × $1.000 = **$18.000**.
- El importe total visible es **por todas las jurisdicciones**, no por una sola.

## Montevideo: horario real y equivalencia de columnas

El calendario habitual de la Dirección Nacional de Loterías y Quinielas de Uruguay establece **quiniela vespertina 15 h de lunes a viernes** y **nocturna 21 h de lunes a sábado**. No realiza Previa o Primera, ni sorteo vespertino uruguayo sábados y domingos.
Fuentes oficiales:
- https://www.loteria.gub.uy/tablero_online.php
- https://www.loteria.gub.uy/horarios_publico.php?xopc=3

**Equivalencia con nuestro tablero (por horario):**
- Uruguay **Vespertina, 15 h** = turno de la app **Matutino**, no `Vespertino` argentino (18 h).
- Uruguay **Nocturna, 21 h** = **Nocturno** de la app.

El calendario es **habitual**, no certifica que todos los feriados tengan sorteo. Al confirmar una apuesta, se muestran los seis nombres con casillas y se permite quitar/agregar jurisdicciones antes de confirmar para registrar **sólo lo efectivamente pagado**. En domingo la selección por defecto es vacía.

## Implementación

- `src/laloJurisdicciones.ts`: calendario Montevideo y valores predeterminados. Las cinco argentinas se seleccionan por defecto lunes-sábado; excepciones se corrigen manualmente.
- `src/laloApuestas.ts`: `prepareTickets`, `plannedSpend` y `withTickets`; genera una boleta individual por jurisdicción sobre el mismo PRE congelado y permite cotejo literal a la cabeza de Montevideo. Boletas antiguas V1 válidas sin migraciones.
- `src/laloLibroStorage.ts`: una sola escritura AsyncStorage para un lote multijurisdicción; rechazo de duplicados idénticos en el mismo día/turno/jurisdicción.
- `src/ui/LaloLibroApuestas.tsx`: selección múltiple, calendario y gasto total multiplicado por cantidad de jurisdicciones, con confirmación explícita antes de registrar dinero.
- `src/papaPronostico.ts`: conserva Montevideo en POST local cuando se conoce su cabeza; **no se altera el denominador histórico de las cinco argentinas** que usa el motor predictivo.
- `scripts/test-lalo-libro-apuestas.ts`: prueba calendarios jueves/sábado/domingo, 5/6 jurisdicciones, $15.000/$18.000, deduplicación y lectura de POST Montevideo.

**No se cambian fórmulas VT2, VT3, VT4 ni el orden por rondas de VT4.** No se genera APK hasta que el usuario quiera probar la nueva interfaz. Ganancias en pesos siguen siendo importes efectivamente cobrados y registrados manualmente; no se inventan multiplicadores de premios.
