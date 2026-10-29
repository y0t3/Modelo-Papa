# Modelo Lalo Auxiliar — control PRE de VT2, VT3 y VT4 (29/10/2026)

**Rama experimental:** lab/aux-vt234-pre-controles-29oct2026. **Sin cambios en main, MV1, APK ni prioridades oficiales.**

## Protocolo auditado

15 jornadas sorteables entre el 12 y el 28 de octubre; cinco turnos × dos modos: **150 cortes PRE reconstruidos**. Se evaluaron **400 cabezas reales verificadas por modo**. El proveedor también entregó Santa Fé Nocturno 28/10 = 6666, aún provisional; se calcularon ambos escenarios. Incluirla o excluirla no cambia los aciertos Top10 ni la formabilidad aquí informados.

- **AUX AYER:** grilla completa de Santiago/Neuquén de la jornada anterior desde Previa.
- **AUX HOY:** sin celdas para Previa; en Primera solo columna Previa; en Matutino dos columnas; desde Vespertino tres columnas.
- Los rankings se construyen **antes** de consultar la cabeza objetivo. Después, POST verifica formabilidad exacta por rutas contiguas y reconocimiento en el ranking.
- **VT2 y VT3** se cotejan por familia reversible; **VT4**, por valor físico exacto, con madre VT3 reconocida entre las diez primeras de ese modo.
- Las filas AYER/HOY usan las **mismas cabezas reales**, por lo que no son predicciones independientes que deban sumarse.

## Resultados: 400 cabezas por modo, sin el dato provisional

| Modo | Tipo | Formables exactas | Reconocidas en ranking total | En Top10 | En Top2 |
|---|---|---:|---:|---:|---:|
| AYER | VT2 | 226 | 226 | 79 | 15 |
| AYER | VT3 | 91 | 74 | 3 | 1 |
| AYER | VT4 | 34 | 0 | 0 | 0 |
| HOY | VT2 | 127 | 127 | 47 | 12 |
| HOY | VT3 | 50 | 25 | 5 | 2 |
| HOY | VT4 | 13 | 0 | 0 | 0 |

### Embudo VT3

**AYER:** 17 de 91 VT3 formables quedaron sin reconocimiento, 71 fueron reconocidas **por debajo del Top10** y tres llegaron al Top10.

**HOY:** 25 de 50 formables quedaron sin reconocimiento, 20 fueron reconocidas **por debajo del Top10** y cinco llegaron al Top10.

Los cuellos de botella no son iguales: debemos distinguir **no reconocida** de **reconocida pero mal posicionada**, sin aumentar artificialmente los cupos.

### Embudo VT4: madre VT3 frente a ruta histórica

- **AYER:** de 34 VT4 formables, solo **2** tenían una madre VT3 dentro del Top10; **26** tenían madre por debajo del puesto 10 y **6** madre no reconocida.
- **HOY:** de 13 VT4 formables, solo **1** tenía madre en Top10; **5** estaban por debajo y **7** no tenían madre reconocida.
- **Ninguno de los tres casos con madre habilitada fue reconocido como VT4**. La falta de rutas/raíces históricas trasladadas es un obstáculo adicional al filtro de madres; no se debe generar una hija inversa ni incluirla sin recorrido físico.

### Controles de continuidad, presupuesto de dos candidatas VT2

En la muestra AYER: Top2 original **15** cabezas; priorizar las familias que habían ganado antes de ese mismo día **20**; preferir familias con presencia en los últimos seis Tops anteriores del mismo turno **20**. HOY: respectivamente **12, 14 y 10**. Son hipótesis retrospectivas, con muestra pequeña y comparaciones múltiples; **no justifican alterar prioridades**. La persistencia de ranking no representa movimiento físico de celdas.

## Inspección individual de las tres VT4 con madre Top10

Se repitió el ensayo imprimiendo el **recorrido físico PRE**, su modalidad y las hijas VT4 con raíces históricas trasladadas. Las tres formaciones son físicamente legítimas, pero **no son una predicción retrospectiva ganadora del motor**.

| Fecha y turno | Modo | Cabeza real | Madre VT3 | Forma física PRE | Hijas VT4 reconocidas de esa madre |
|---|---|---|---|---|---|
| 15/10 Matutino, Provincia | AYER | **4942** | 249/942 **#3** | 3 recorridos en la franja Matutino | Solo **9942** (puesto #1 de VT4); **4942 ausente** |
| 20/10 Nocturno, Ciudad | HOY | **2697** | 697/796 **#2** | 1 recorrido válido, cruzando en contacto Primera y Previa | **Ninguna** |
| 23/10 Matutino, Santa Fé | AYER | **4862** | 268/862 **#8** | 2 recorridos en la franja Previa | **Ninguna** |

En el primer caso, el motor sí proyectó una **hija diferente de la misma madre**, pero no el recorrido 4942. Los otros dos casos no generaron ninguna hija VT4 de su madre. Esto descarta que una simple reordenación de las familias VT4 existentes pudiera recuperar esos tres resultados. La geometría física **sí existe**; lo que falta es una ruta histórica ganadora proyectada que reconozca esa cuatro cifras como candidata. Inyectarla por haber salido sería fuga POST.

**Siguiente control geométrico recomendado:** comparar las siluetas de estas rutas con testigos VT3 antiguos de la madre y medir también cuántas **no ganadoras** tienen rutas similares. No aprobar automáticamente una cuarta cifra física sin evidencia selectiva y contrastes fuera de muestra.

[Prueba de tres casos y rutas en GitHub Actions](https://github.com/y0t3/Modelo-Papa/actions/runs/40845566809).

## Control negativo: ¿qué ocurriría al incorporar todas las VT4 físicas con madre Top10?

Sin modificar los motores, se enumeraron los **valores completos distintos** de cada corte con recorrido continuo válido y madre VT3 dentro del Top10, y se retiraron los valores VT4 ya reconocidos. Luego, usando exclusivamente el POST para el cotejo, se contó qué parte de esas nuevas candidatas realmente salió.

| Modo | Exposiciones valor×corte adicionales | Valores que coincidieron | Exposiciones sin coincidencia |
|---|---:|---:|---:|
| AUX AYER | **5.425** | **2** | **5.423** |
| AUX HOY | **4.023** | **1** | **4.022** |

Esto corresponde a **75 cortes por modalidad**, no a 5.425 números globalmente distintos ni apuestas reales. Un valor con varios caminos **cuenta una sola vez en cada corte**. Las dos modalidades comparten cabezas observadas y NO pueden sumarse como confirmaciones independientes.

El control negativo incluye exactamente los tres casos físicos anteriormente inspeccionados (4942, 2697, 4862) distribuidos en sus respectivos modos. Las restantes miles de exposiciones habrían añadido números que no coincidieron. Las familias que sí salieron se identificaron solo POST: no es legítimo seleccionarlas retrospectivamente y después atribuirles poder de pronóstico.

**Decisión:** no incorporar por defecto todas las hijas VT4 de madres Top10. La formación física de cuatro cifras sigue siendo condición necesaria para nuestras representaciones, pero no sirve por sí sola para priorizar. Cualquier nuevo filtro debe medirse en las **no ganadoras** de manera simétrica y congelarse para controles futuros.

[Ejecución de universo negativo validada](https://github.com/y0t3/Modelo-Papa/actions/runs/40847123722). El JSON por corte deja los denominadores `negativeVt4` y el agregado `negativeControl`.

## Próximo paso de interfaz

Agregar al **Info Auxiliar**, previa verificación de diseño, el historial de cada raíz ganadora al tocarla: minihoja de su fecha real y minihoja del corte actual, con modo AYER/HOY, columnas realmente disponibles, orden de recorrido y fuente. Mostrar por separado el reconocimiento/puesto de VT3 y el motivo de exclusión de su VT4 física. No pintar rutas inventadas ni mezclar los movimientos AUX con los de +11. Conservar el Top10 fijo y los aciertos POST ya implementados.

## Reproducción

- [Script de estudio](../../scripts/lab-aux-vt234-pre-controles.ts)
- [Workflow de ensayo](../../.github/workflows/lab-aux-vt234.yml)
- [Ejecución de GitHub Actions](https://github.com/y0t3/Modelo-Papa/actions/runs/40845211344) con regresiones de Lalo/AUX y artefacto auxiliar-vt234-pre-ayer-hoy-29oct, que contiene el JSON por corte y las dos versiones del cotejo.
- Los PRE son reconstrucciones cronológicamente correctas, **no sellos prospectivos guardados por la app**.

**Decisión:** preservar MV1 y los motores AUX tal como están; estudiar visualmente los **tres VT4 con madre Top10** antes de formular una nueva regla. Los sorteos son aleatorios y no existe ventaja predictiva validada aquí.
