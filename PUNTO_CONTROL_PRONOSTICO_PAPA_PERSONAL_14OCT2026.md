# Pronóstico Papá: trazado manual, lectura automática, PRE local y balance semanal

Nueva pestaña **PAPÁ**, independiente de **PREDICTIVA** (candidatos de Motor Lalo).

## Flujo de uso
1. Elegir fecha y actualizar hoja como en la app actual; seleccionar turno. La pantalla PAPÁ presenta el tablero +11 de todas las fuentes disponibles hasta ese turno.
2. El usuario elige una de las columnas y toca **2, 3 o 4 casillas vecinas**, en orden físico, sin saltar fuentes ni reutilizar casillas. El número se **lee automáticamente de los dígitos cargados**. Puede deshacer o borrar el trazado y guardar varios recorridos por familia.
3. VT2 y VT3 se agrupan en familias reversibles. Para VT4 **el valor se registra y verifica como cuatro dígitos exactos**; NO se invierte arbitrariamente la cuaterna ni se generan madres ajenas. La madre de las tres primeras cifras se indica como explicación del recorrido 4D elegido.
4. La lista de candidatos muestra todas las rutas guardadas y distingue «número de recorridos» de «jugadas únicas». Los borradores se guardan automáticamente por fecha y turno.
5. **Congelar pronóstico antes del sorteo** requiere que la fecha sea *hoy* en el teléfono y que no haya cabezas del turno cargadas. Tras confirmar, almacena una copia de cada fuente y de cada recorrido seleccionado. No admite cambios ni segundas capturas de esa fecha y turno desde la app.
6. El POST se añade exclusivamente al registro ya congelado. Los resultados se consultan de la fuente de cabezas conocida por la app, inicialmente para la fecha visible y opcionalmente para las fechas con PRE de la semana seleccionada.
7. **Resumen semanal** (lunes–domingo) presenta número de PRE registrados, turnos realmente cotejados, número de cabezas verificadas y turnos pendientes, más jugadas y coincidencias VT2/VT3/VT4. No inventa «90 sorteos»: el denominador se calcula con los resultados efectivamente registrados de las cinco jurisdicciones de Ciudad, Provincia, Córdoba, Santa Fé y Entre Ríos.

## Reglas de conteo

Una misma familia con varios recorridos físicos cuenta como **una jugada por turno y modalidad**; se guardan todas las rutas para entender por qué fue elegida. Una familia VT2/VT3 se considera acertada si coincide con la terminación de la cabeza en su lectura normal o reversa. VT4 se compara **literalmente con los cuatro dígitos de la cabeza**. Si dos jurisdicciones sortean la misma terminación elegida, son dos coincidencias de jugada en dos cabezas diferentes. La misma cabeza puede confirmar más de una modalidad; las coincidencias VT2/VT3/VT4 no deben sumarse como si fueran «cabezas distintas».

## Alcance de protección

- SHA-256 verifica la integridad de la captura PRE guardada y la app **no ofrece sobrescritura ni edición** de ese registro.
- El sello y la hora provienen del dispositivo y AsyncStorage; **no son pruebas cronológicas externas**. Para validar predicciones con rigor contra terceros, publicar PRE y SHA en GitHub antes del sorteo.
- La app necesita conexión para consultar cabezas, pero las elecciones selladas y los balances ya almacenados quedan **localmente** en el dispositivo. Si se borran datos o se pierde el celular sin exportación, se pierden.
- El sistema no infiere causalidad ni ventaja estadística: sirve para observar cómo el usuario elige y cómo resultan sus pronósticos.
- Se respeta el mismo motor Lalo y el selector oficial de VT2/VT3/VT4; este módulo **no modifica sus prioridades ni ensayos retrospectivos**.

## Archivos
- `src/papaPronostico.ts`: reglas físicas, tipos, normalización, congelado puro, validación y evaluación semanal.
- `src/papaRegistro.ts`: persistencia independiente AsyncStorage de borradores, PRE y POST.
- `src/ui/PapaPronostico.tsx`: tablero visual, celdas interactivas, selección, captura y reportes.
- `App.tsx`: sexta pestaña **PAPÁ**.
- `scripts/test-pronostico-papa.ts`: test de geometría, reversible VT2/VT3, VT4 exacto, sello, deduplicación y estadística.

**Importante:** no compilar APK todavía; queda disponible para próximas funcionalidades.
