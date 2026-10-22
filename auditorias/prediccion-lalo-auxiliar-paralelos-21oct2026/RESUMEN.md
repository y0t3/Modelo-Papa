# Predicción correcta: Modelo Lalo MV1 y Modelo Lalo Auxiliar independientes

**Rama experimental:** `lab/prediccion-lalo-auxiliar-paralelos-21oct2026`  
**Compilación y pruebas:** [GitHub Actions aprobada #39698557644](https://github.com/y0t3/Modelo-Papa/actions/runs/39698557644).  
**No se modifica `main`, MV1 congelado, ni la APK instalada.**

## Corrección de arquitectura solicitada

La pestaña **Predicción** ya NO utiliza **Lalo Integral** como segundo motor. Lalo Integral conserva su implementación de investigación (`src/motorLaloIntegral.ts`), pero queda fuera del selector visible.

Los dos únicos motores seleccionables son:

1. **MODELO LALO**, que ejecuta `buildMotorLalo` y construye sus familias **exclusivamente desde la hoja +11**, con trayectorias dentro de su propia columna.
2. **LALO AUXILIAR**, que ejecuta `buildMotorLaloAuxiliar` en `src/motorLaloAuxiliar.ts` y construye las familias **exclusivamente desde la hoja cruda Santiago–Neuquén y sus marcas históricas POST D−1 y D−7**. La interfaz de datos del lector AUX no recibe ningún tablero +11, ni `LaloView` ni posiciones/rankings MV1. Está permitido el cruce entre franjas PRE/Primera/Matutino por celdas físicamente adyacentes. No se suman 11.

El motor auxiliar conserva VT2 y VT3 en familias reversibles por contacto; VT4 se limita a extensiones físicamente formadas de las **primeras diez madres VT3 del propio motor AUX**, sin invertir la cabeza de cuatro cifras ni inventar nuevas madres.

### UI: vista idéntica de Top3, Top5 y Top10

Ambos motores utilizan `src/ui/PredictionSummary.tsx` y conservan la pestaña por modalidad VT2 / VT3 / VT4, listas verticales de familias y selector Top3/Top5/Top10. Cada motor mantiene íntegros su orden y sus candidatos. Lalo es el botón predeterminado.

Cuando una familia también aparece en el Top10 del otro motor, su ficha se destaca y muestra la posición equivalente. En AUX, al tocarla se ven las franjas Santiago–Neuquén, antecedentes ganadores, cantidad de recorridos y terminaciones realmente cubiertas. No se presenta un botón de +11 sobre familias que solo tienen formación auxiliar.

### Panel fijo: TOP GENERAL · FAMILIAS COINCIDENTES

A continuación del Top del motor seleccionado, se muestra **sin pulsar ni cambiar de motor** el panel fijo `src/ui/ParallelPredictionCompare.tsx`.

- Se elige Top3 / Top5 / Top10 para las tres modalidades.
- Solo se muestran como **familias compartidas** las presentes en el corte TopN de ambos motores. Se ordenan por suma de las posiciones en ambos, con desempates reproducibles. **Este panel NO constituye un nuevo motor ni genera candidatas distintas.**
- Indica los rangos Lalo #N / Auxiliar #M, y también cuántas familias siguen siendo exclusivas de cada uno.
- Cuando ya hay cabezas publicadas, se resaltan POST las que coincidieron con MV1, AUX o ambos, por modalidad. **Una cabeza cuenta como «ambos» solo si el sufijo exacto está en las terminaciones físicamente cubiertas por los dos motores.** Una misma familia compartida VT4 no significa acierto de ambos si la orientación exacta no fue recorrida por una hoja.
- La familia reversible se compara por normalización de orientaciones: `12/21` equivale a `21/12`. En VT4 la familia se agrupa por madre válida, sin crear nuevas cuatro cifras por inversión completa.
- Un POST no altera jamás los Tops PRE ni acredita dinero cobrado si no se hizo una apuesta efectiva.

### Datos cargados por la app

Al actualizar la fecha, `App.tsx` sigue creando las referencias históricas MV1 exclusivamente de +11. En paralelo recupera las fuentes históricas Santiago–Neuquén de las mismas fechas D−1/D−7 y extrae **solo** marcas auxiliares ganadoras anteriores. Si AUX no se puede descargar o faltan raíces, **MV1 sigue funcionando** y el bloque auxiliar presenta una explicación en lugar de candidatos inventados.

`buildMotorLaloAuxiliar` se calcula para el turno elegido solo con el auxiliar actual y `AuxiliarHistory[]`. No recibe ni depende del resultado de `buildMotorLalo`. El comparador recibe ambos Tops PRE como lectura, sin modificarlos.

### Verificaciones de código

**Aprobadas en CI**:
- `npx tsc --noEmit` compila React Native y TypeScript.
- Pruebas de geometría auxiliar RAW y correspondencia Santiago/Neuquén.
- `scripts/lab-lalo-auxiliar-paralelos-test.ts`: independencia, no fuga de Matutino futuro al PRE Matutino, familia VT2 compartida inversa, cabeza VT3 AUX sin Lalo, VT4 `3226` exacta y rechazo de falso acierto `6223`, sin cambio en los rangos originales.
- `scripts/lab-prediccion-paralela-20oct.ts`: 20/10/2026 real, PRE→POST por cinco turnos con cabezas ya corroboradas. **Nocturna de Ciudad `2697` fue acertada por AUX VT3 Top3 y no por MV1 Top3**. En Previa, el auxiliar legítimamente no dispone de tablero ni familias; Lalo identificó `4805` en VT2.
- Se actualizaron scripts de test antiguos que todavía exigían la estructura de Lalo Integral.

La compilación y los tests **no reemplazan una prueba visual o táctil de la interfaz instalada en Android**. No se ha creado ni distribuido una nueva APK.

## Archivos

- `src/motorLaloAuxiliar.ts`: motor separado sin entrada +11.
- `src/motorLaloIntegral.ts`: permanece como laboratorio, se ajustó el tipo del lector AUX para exigir datos auxiliares exclusivamente.
- `App.tsx`: dos botones MV1/AUX, carga de dos memorias independientes, Top general siempre debajo.
- `src/predictionParallel.ts`: normalización de familias y comprobación por terminación exacta, sin fusionar Tops.
- `src/ui/PredictionSummary.tsx`: componente común de Top3/5/10.
- `src/ui/ParallelPredictionCompare.tsx`: panel fijo del Top general de coincidencias.
- `scripts/lab-lalo-auxiliar-paralelos-test.ts`: tests de fidelidad.
- `scripts/lab-prediccion-paralela-20oct.ts`: caso real controlado.
- `.github/workflows/lab-lalo-auxiliar-paralelos.yml`: pipeline reproducible.

## Decisión

**Arquitectura de la app: Lalo +11 y Lalo Auxiliar en paralelo, con un comparador fijo de coincidencias debajo.** Lalo Integral 65/35 **NO** participa en la predicción visible.

Ningún Top se modifica por consultar el otro; VT2, VT3 y VT4 tienen exactamente la misma dignidad como modalidades de acierto. Continuar las pruebas históricas y, tras revisión visual en Android, evaluar si publicar una APK experimental.
