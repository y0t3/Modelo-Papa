# Modelo Lalo · Línea de tiempo visual de familias PRE / POST

**Fecha:** 21/10/2026  
**Rama aislada:** `lab/linea-tiempo-familias-21oct2026`  
**Estado:** integrada al código experimental de la pantalla AUX; compilación y pruebas automatizadas aprobadas. **No se modificaron MV1, los rankings oficiales, `main` ni la APK instalada.**

## Objetivo

Visualizar lo que el padre observa en las hojas a medida que avanzan los turnos del día, diferenciando tres hechos:
1. **PRE:** una familia VT2, VT3 o VT4 **se puede formar físicamente** en +11, Santiago–Neuquén o ambas, sin haber explicado todavía una cabeza anterior publicada.
2. **POST:** una cabeza publicada de las seis jurisdicciones tiene la terminación **exacta** y todos sus recorridos válidos en el tablero PRE de su propio turno, de modo que puede marcarse como cabeza comprobada.
3. **PRE posterior:** esa familia marcada puede **persistir** en sus fuentes anteriores o adquirir una **columna física adicional**, que se identifica con nombre y hoja de procedencia, no con cantidad de rutas.

No se confunden marcas POST con pronósticos PRE, ni se asume que observar una coincidencia implique una apuesta jugada o dinero ganado.

## Implementación visual

En `src/ui/AuxiliarySheetPanel.tsx` se mantiene la vista de **Todas las marcas ganadoras** y **Seguir familia**, y se añade la tercera opción **«Historia de familias · PRE / POST»**.

- Filtros interactivos VT2 / VT3 / VT4, todos disponibles sin relegar VT2.
- Selector de **familias efectivamente comprobadas POST** antes o durante el corte de revisión; no introduce familias al azar como si fueran ganadoras.
- Cinco hitos visibles: **Previa → Primera → Matutino → Vespertino → Nocturno**; los posteriores al corte seleccionado quedan **bloqueados, sin datos ni resultados simulados**.
- Por turno, PRE indica si la familia existía físicamente, sus fuentes +11 y auxiliares separadas, cuántas cabezas reales anteriores la marcaron, y qué fuentes aparecieron por primera vez.
- Por turno, POST muestra únicamente **jurisdicción, cabeza de cuatro cifras, terminación exacta VT2/VT3/VT4, hoja que aportó el recorrido y número de testigos**, sin sumar un voto independiente por cada recorrido.
- Cuando la persona toca una familia, las cifras consultadas se pueden resaltar en el tablero auxiliar PRE; la iluminación de consulta **no se presenta como marca ganadora**.
- Compatible con la paleta clara/oscura existente; ninguna modalidad desaparece por seleccionar otra. Al cambiar VT2/VT3/VT4 se limpian los resaltados de la modalidad anterior.

El cálculo usa `sameDaySequence(..., through)`: **no procesa** etapas posteriores al turno elegido. El modelo de presentación `timelineForFamily` rechaza explícitamente una secuencia que contenga etapas posteriores a ese corte. Las marcas del turno actual solo aparecen en su casillero POST si ya se publicaron, y nunca entran como raíces del PRE de ese mismo turno.

## Reglas respetadas

- Hoja **+11**: siempre dentro de una columna de origen, sin cruces.
- Hoja Santiago–Neuquén: **cabezas crudas sin +11**, 2 filas × 12 columnas, cruces permitidos solo entre casillas adyacentes; no huecos ni saltos.
- Auxiliar sin células antes de Previa y sin nuevas células después de incorporar Matutino.
- VT2 / VT3: familias por sentido; POST requiere el sufijo **exacto** de la cabeza.
- VT4: cuarta cifra incorporada a una madre VT3 válida; **no invertir las cuatro cifras para inventar otra madre**, ni atribuir números sin testigos físicos.
- Una marca viene de una cabeza real, no de una trayectoria dibujada como predicción.
- Fuente nueva = **una columna distinta** de las anteriores, no otra ruta del mismo origen.

## Auditoría real: martes 20/10/2026

Los datos Santiago–Neuquén se cotejaron con los seis valores previamente verificados:

- Santiago: Previa `8067`, Primera `6142`, Matutino `9634`.
- Neuquén: Previa `0469`, Primera `0245`, Matutino `0210`.

La reconstrucción confirmó los cinco PRE y sus POST por jurisdicción. El script `scripts/lab-linea-tiempo-20oct.ts` publica casos concretos de continuidad:

### VT2 familia 37/73: cabeza anterior, fuente nueva, nueva cabeza

| Hito | Estado |
|---|---|
| **Primera POST** | Provincia **3273**: terminación exacta **73** y dos rutas en +11. Familia marcada comprobada. |
| **Matutino PRE** | Entra **Primera +11** como una **fuente adicional** donde vuelve a formarse 37/73. Antecedente real de una cabeza de Primera. |
| **Matutino POST** | Santa Fe **8637**: terminación **37**, mismo grupo reversible, cuatro rutas PRE +11. Otro evento ganador de la jornada. |
| **Vespertino / Nocturno PRE** | La marca persiste; no se vuelve a contabilizar una fuente vieja como si acabara de entrar. |

Es una reconstrucción fiel del calendario de fuentes y cabezas, **no un Top histórico sellado ni evidencia de ganancia monetaria**.

### VT2 familia 05/50: refuerzo sin nueva cabeza ganadora

- Previa POST: Provincia **4805**, terminación exacta **05**, dos rutas +11.
- Vespertino PRE: incorporó las franjas **Primera y Matutino auxiliares** como soporte físico, sin cabeza previa adicional del mismo grupo.
- Vespertino y Nocturno POST: **ninguna cabeza adicional comprobada de esta familia**. Esto impide afirmar que un respaldo nuevo necesariamente anticipa un acierto.

### Familias realmente comprobadas durante el martes

El script auditó **16 familias VT2, 10 VT3 y 6 VT4** que explicaron al menos una cabeza del día en alguna de las dos hojas; no son cantidades de Tops ni candidatos nuevos.

También registra en Nocturno POST, por ejemplo:
- Ciudad **2697** → VT3 **697/796**, **tres recorridos AUX** físicos, sin trayectoria VT3 +11.
- Provincia **7310** → VT3 **013/310**, **un recorrido AUX**.
- Córdoba **2647** → VT3 **647/746**, **tres recorridos +11**.

Estas cabezas solo pasan a POST después de su sorteo; no se trasladan a turnos anteriores.

## Pruebas

1. `npx tsc --noEmit`: toda la app, incluida la pantalla React Native, tipada sin errores.
2. Geometría de auxiliar: pruebas físicas previamente implementadas.
3. Continuidad intrajornada: regresión de 17 comprobaciones, incluyendo ausencia de cabezas posteriores.
4. `scripts/lab-linea-tiempo-test.ts`: **17 comprobaciones** de corte estricto, marcas PRE/POST, raíz antigua, fuente nueva y futuros bloqueados. Cambiar Vespertino y Nocturno **no altera** la línea construida hasta Matutino.
5. `scripts/lab-linea-tiempo-20oct.ts`: datos realmente publicados y secuencia auditada del martes 20/10.

**Esto valida compilación, lógica temporal y datos comprobados de la auditoría. No equivale a una prueba visual manual en un teléfono ni a haber generado una APK.**

## Archivos

- `src/withinDayMarkContinuity.ts`: secuencia física del día, ahora también con `post` por turno y límite `through`.
- `src/withinDayTimeline.ts`: opciones de familias ya comprobadas y sus cinco hitos de línea temporal con estados explícitos.
- `src/ui/WithinDayFamilyTimeline.tsx`: nuevo visor interactivo de familias, fuentes +11/AUX y entradas PRE/POST.
- `src/ui/AuxiliarySheetPanel.tsx`: botón de nuevo modo y coordinación de resaltados.
- `scripts/lab-linea-tiempo-test.ts`: prueba de fuga temporal.
- `scripts/lab-linea-tiempo-20oct.ts`: auditoría de caso real.
- `.github/workflows/lab-linea-tiempo-familias.yml`: ejecución CI.

## Decisión

Conservar como **mejora experimental de representación**, no como ranking predictivo: los trabajos anteriores hallaron continuidad geométrica comprobable, pero no una ventaja estable en sorteos futuros. **MV1 sigue congelado**, ningún Top fue modificado y no se construyó ni publicó APK. La pantalla quedará disponible en esta rama para evaluación visual antes de considerar cualquier integración.
