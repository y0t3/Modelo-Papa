# Tres lectores experimentales: cobertura, PRE y decisión de mantenimiento

**Fecha del estudio:** domingo 25/10/2026. **Rama:** `lab/auditoria-tres-experimentales-25oct2026`. **La rama oficial MV1, la APK y los rankings no fueron modificados.**

## 1. Qué verifica el código que usa el teléfono

`src/ui/Vt3Parallel.tsx` calcula tres lectores VT3 (Geometría Completa, Nueva Prueba y Configuraciones Conectadas). Las familias mostradas pueden provenir de un **PRE auténtico** o de una **reconstrucción posterior**, dependiendo de si existe `loadFrozen(date,turn)`.

El guardado reside en **AsyncStorage del dispositivo**, bajo `modelo-lalo:vt3-pre-v1:<fecha>:<turno>` y no en GitHub. No hay sincronización/respaldos automáticos externos. Una reinstalación puede eliminar los PRE. No es posible, a partir del repositorio, saber cuáles se guardaron efectivamente en el teléfono del usuario.

El bloque automático en `App.tsx`:
1. Corre como efecto mientras la app está abierta, cargó la hoja, datos e historial, y la fecha coincide con el día local del dispositivo.
2. Identifica solamente el **primer turno sin ninguna cabeza publicada** (próximo pendiente) y solicita su sellado.
3. Abandona silenciosamente el error, incluso si fue por falta de datos, carrera de actualización o falla de AsyncStorage (`catch{}`).
4. No tiene una tarea de fondo para guardar los turnos mientras la app está cerrada y no recupera un PRE de un turno cuando ya hay una cabeza publicada. Esto **es correcto para impedir predicciones tardías**, pero produce huecos al faltar un sellado auténtico.
5. `saveFrozen` rechaza una jornada que no es la actual o un turno con cualquier cabeza publicada, y **nunca sobrescribe un PRE anterior**. Esa integridad debe mantenerse.
6. Las versiones antiguas del esquema pueden carecer de `trial` o `connected` aunque sí incluyan `geometric` y `official`, porque esos lectores se añadieron después. Nunca deben acreditarse retroactivamente como predicción.
7. **Posible confusión en pantalla:** el POST visual de `Vt3Parallel` utiliza `sections[].values`, que puede provenir de rankings reconstruidos aun cuando el lector carezca de PRE guardado. Abajo hay avisos de reconstrucción, pero los recuentos y el símbolo ✓ pueden confundirse con aciertos prospectivos. Debe corregirse antes de usar esta pantalla como auditoría fiable.

## 2. Ensayo histórico homogéneo 1–24 octubre

Se reconstruyeron **21 jornadas, 105 cortes PRE, 561 cabezas reales**, con último Nocturno auténtico por jurisdicción y raíces D−1/D−7, hoja +11 y los mismos resultados publicados para los cuatro lectores. La cabeza del turno objetivo se añade **solo POST** para la medición. Se evitó el cruce de columnas +11 y se conservaron familias VT3 reversibles.

| Lectura VT3 | Top3 | Top5 | Top10 | Aciertos Top3 no presentes en Top3 de MV1 |
|---|---:|---:|---:|---:|
| Modelo Lalo oficial | 2 | **11** | **15** | — |
| Geometría Completa | **3** | 4 | 9 | 2 |
| Nueva Prueba | **3** | 5 | 10 | 2 |
| Configuraciones Conectadas | **3** | 3 | 9 | 3 |

Los tres experimentales generaron Top10 de diez familias en **todos los 105 cortes** del replay. Por eso la falta de un PRE almacenado no equivale a que sus motores no puedan calcular candidatos, y tampoco es prueba de que predijeran correctamente antes de salir las cabezas.

La muestra no es una evaluación de apuestas reales ni un ensayo prospectivo sellado. La mejora de un acierto en Top3 respecto de MV1 es muy pequeña y puede ser casual o consecuencia de múltiples reglas examinadas. La debilidad a Top5/Top10 es clara.

### Comportamiento por bloques

| Fecha | MV1 Top3/Top10 | Geometría | Nueva Prueba | Conectadas |
|---|---|---|---|---|
| 1–10/10 | 2 / 8 | 2 / 5 | 2 / 6 | 2 / 5 |
| 11–17/10 | 0 / 6 | 1 / 4 | 1 / 4 | 1 / 3 |
| 18–24/10 | 0 / 1 | **0 / 0** | **0 / 0** | **0 / 1** |

El bloque más reciente coincide con la percepción del usuario: pocos o ningún acierto experimental.

## 3. Qué mide realmente cada lector

- **Geometría Completa:** ranking de siluetas físicas de todas las terminaciones formables, distancia entre posiciones D−1/D−7 y testigos ganadores del MV1, sin limitarse al ranking oficial. Es útil como *control de cobertura y desplazamiento geométrico*, no hay evidencia de que reordene mejor que Lalo en Top10.
- **Nueva Prueba:** sus posiciones #1 y #2 son las primeras dos de Geometría; intenta ubicar en #3 una familia Lalo que nace de una fuente del mismo día, y rellena lo demás con Geometría. **No es un motor independiente**, por lo que darle el mismo peso que a Geometría duplicaría evidencia.
- **Configuraciones Conectadas:** utiliza dos cabezas históricas independientes con recorridos que comparten alguna celda y proyecta esa relación a **otra** fuente física de la hoja del corte. Es una hipótesis estructural independiente y de interés para observación, no para integrar Tops. En octubre sus aciertos Top3 no fueron duplicados por Top3 MV1 (3 casos), pero quedaron pocas coincidencias en conjunto.

## 4. Propuesta

**Mantener el código de Geometría y Conectadas como laboratorios complementarios; archivar Nueva Prueba como control derivado, sin borrarlo. No sustituir ni mezclar el Top principal con ninguno.**

Antes de evaluar supuestos aciertos, reforzar el sistema de sellos:
- Mostrar una matriz verificable por fecha y turno con `Guardado`, `Falta PRE`, `Lector no existía en esta versión`, `Error de integridad`.
- Evitar el símbolo ✓ POST y los recuentos de *aciertos prospectivos* cuando `!stored` o cuando falte `stored.pre.<lector>`. La reconstrucción puede mantenerse visible con etiqueta inequívoca «RETROSPECTIVO · NO SELLADO».
- Informar fallos del guardado automático y ofrecer «Guardar el PRE del turno» mientras siga siendo válido; registrar fecha/hora/hash del registro.
- Habilitar exportación y respaldo externo explícitos de PRE históricos, sin alterar sellos antiguos ni inferir PRE de resultados publicados. Evitar eliminar datos de AsyncStorage en actualizaciones.
- Comparar prospectivamente cuatro grupos: MV1, Geometría, Conectadas y familia compartida, manteniendo el mismo número de candidatas y el sello PRE anterior al sorteo. Nueva Prueba como derivación/control, no voto independiente.

## 5. Fuentes verificadas

- [Actions #40261013181](https://github.com/y0t3/Modelo-Papa/actions/runs/40261013181): replay PRE/POST de octubre, regresión del motor MV1 y prueba física de Conectadas aprobadas.
- `scripts/lab-auditar-tres-experimentales.ts`: reconstrucción y separación de ranking PRE/resultados POST.
- `auditorias/tres-experimentales-25oct/RESUMEN-VERIFICADO.json`: cifras y bloques.
- Artefacto `laboratorio-tres-lectores-vt3-octubre`: `replay-resumen.json` y `replay-cortes.json` por fecha/turno.
- `src/vt3Snapshot.ts`: formato y persistencia local con hash; `App.tsx`: guardado automático; `src/ui/Vt3Parallel.tsx`: reconstrucción y presentación.

**Decisión técnica actual:** No afirmar que hay PRE perdidos a causa de un bug específico sin acceder a los datos reales del dispositivo; el diseño actual contiene causas suficientes de huecos y problemas de comunicación POST para justificar la corrección, sin atribuir incorrectamente un fallo único.
