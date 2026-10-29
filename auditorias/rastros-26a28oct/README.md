# Investigación VT3 — recorridos físicos, reconocimiento y alternativas (26–28/10/2026)

**Rama:** `lab/seguimiento-vt3-26a28oct-controles`. Se ejecutaron pruebas reales en GitHub Actions; **no se alteró `main`, MV1, las prioridades VT4, los motores auxiliares ni la APK**.

## 1. Los cortes nuevos: qué pasó con las familias ganadoras de +11

Se reconstruyeron de forma estrictamente **PRE** cinco cortes por jornada del **26, 27 y 28 de octubre**; **POST** identifica únicamente las cabezas que ya salieron. Se preservaron las Nocturnas previas auténticas por jurisdicción y la restricción de recorridos sin saltos ni cruces de columna. Cada “formable” significa que la terminación **exacta** del resultado se puede trazar, no solo que su inversa pertenece a la misma familia VT3.

**Primera muestra verificada (80 cabezas de fuente, antes de recibir la última Nocturna Santa Fe):**
- **18** cabezas tenían VT3 físicamente formable en +11.
- **1** estaba en Lalo Top10: Montevideo Matutino 28/10 `9176`, familia `176/671`, **puesto 7**.
- **3** estaban reconocidas **debajo del Top10**: Entre Ríos Primera 26/10 `4056`, familia `056/650`, Lalo **#13**; Provincia Primera 28/10 `5279`, familia `279/972`, Lalo **#19**; Entre Ríos Vespertino 28/10 `2569`, familia `569/965`, Lalo **#35**.
- **14** tenían recorrido válido pero **ningún reconocimiento oficial** en el ranking VT3.
- Los **17** aciertos físicos que no estaban en el Top10 se dividen en **3 casos de mala prioridad** y **14 de ausencia de reconocimiento**.

**Nueva lectura del proveedor de la app:** Santa Fé Nocturno 28/10 comenzó a responder `6666`, que sería un **19.º VT3 formable y 15.º no reconocido**, ampliando la muestra a **81 cabezas**; este resultado NO pudo corroborarse todavía con una segunda fuente pública, que mostraba los datos hasta el 27/10. Se deja **provisional**. Su incorporación no altera los Tops ganadores de ninguno de los motores examinados.

Casos experimentales con aporte de fuente independiente: **26/10 Primera Entre Ríos `4056`** ya reconocida por Lalo en #13 pero **Geometría #3**; **27/10 Nocturno Provincia `2299`** no reconocida por Lalo pero **Conectadas #3**. AUX AYER (`1308` el 27) y AUX HOY (`9153` el 28) reconocieron otras cabezas, **no necesariamente formables en +11**: nunca mezclar ambas geometrías para afirmar “rescate de +11”.

## 2. Control negativo de falsas alarmas (15 cortes)

El denominador fue de **1.703 exposiciones familia×corte físicamente posibles fuera de Top10 Lalo**, incluidas las no ganadoras; no se trata de 1.703 números distintos, ni apuestas. Los resultados PRE solo usan seis jornadas anteriores y las posiciones del turno actual. Se rotularon ganadoras POST, con **5.000 permutaciones de ganadoras por corte** condicionadas al número de familias y aciertos de ese corte. Los conteos de aciertos corresponden a la muestra de **81 incluyendo `6666` provisional**; sin ella hay una ganadora menos y se reducen los éxitos de memoria SAME6 de 9 a 8.

| Criterio PRE entre familias fuera del Top10 | Exposiciones elegibles | Aciertos con recorrido exacto | No ganadoras |
|---|---:|---:|---:|
| Raíz ganadora de misma fuente, últimos 6 días (SAME6) | 932 | 9* | 923* |
| Misma silueta ganadora en dos días y hasta 2 filas | 279 | 1 | 278 |
| **Dos días, misma fuente, hasta 1 fila** | **168** | **0** | **168** |
| Fuente vecina reciente | 773 | 5 | 768 |
| Paso reciente hacia derecha | 221 | 2 | 219 |
| Vector vertical constante | 0 | 0 | 0 |
| Geometría Top3 | 21 | 1 | 20 |
| Conectadas Top3 | 34 | 1 | 33 |
| Algún lector independiente Top10 | 270 | 2 | 268 |
| **Dos o más lectores independientes Top10** | **19** | **0** | **19** |
| Dos días misma fuente (±1) **y** lector independiente | 48 | 0 | 48 |

*Con la muestra de 80 cabezas independientemente pendientes de corroboración, SAME6 da 8 éxitos y 924 negativas.*

Los testigos de **dos días / una fila** que parecían interesantes en el histórico junio–septiembre **no rescataron ninguna** de las 17 cabezas VT3 físicas fuera del Top10 en estos días. Las firmas de Geometría y Conectadas sí rescataron **una cada una** con pocos cupos, pero sus controles intra-corte no alcanzaron ventaja estadística convincente (fracciones unilaterales de permutación de **0,226** y **0,345**, respectivamente). El criterio de “dos motores confirman” tampoco rescató una cabeza, por lo que **no hay base para otorgar prioridad automática a una coincidencia doble**.

Los 80 datos anteriores y los 81 del proveedor nuevo se mantienen separados para no fabricar precisión sobre la cabeza de Santa Fe.

## 3. Comprobación larga independiente: 635 cortes, junio–28/10

Se reutilizaron los motores oficiales y experimentales **sin cambiar sus algoritmos** sobre **127 jornadas, 635 cortes y 3.402 cabezas del proveedor** (incluye `6666` provisional). Los **620 cortes y 3.321 cabezas anteriores hasta el 24/10** reprodujeron exactamente la base oficial de estudio **VT3 17/35/59 (Top3/5/10)**.

| Motor | VT3 Top3 | VT3 Top5 | VT3 Top10 |
|---|---:|---:|---:|
| Lalo MV1 | 17 | 35 | 60 |
| Geometría Completa | 20 | 32 | 57 |
| Nueva Prueba (derivada) | 16 | 32 | 57 |
| **Configuraciones Conectadas** | **25** | **46** | **81** |

Los Top10 conservaron el mismo presupuesto de diez familias por corte (exceptuando cortes excepcionales donde el motor oficial dio menos de diez). Conectadas se basa en dos cabezas ganadoras antiguas independientes que compartían celdas y en proyectar esa **configuración física** a una fuente actual, manteniendo las reglas de contacto.

### La ventaja de Conectadas NO es estable

| Período | Lalo Top10 | Conectadas Top10 | Diferencia |
|---|---:|---:|---:|
| Junio–julio | 24 | 37 | +13 |
| Agosto–septiembre | 20 | 34 | +14 |
| Octubre 1–24 | **15** | 9 | −6 |
| Octubre 26–28 | 1 | 1 | 0 |
| **Total** | **60** | **81** | **+21** |

Pareado *cabeza a cabeza*, ambos motores compartieron **12** hits Top10, Lalo tuvo **48** exclusivos y Conectadas **69** exclusivos. Una prueba binomial exacta bilateral sobre los resultados discordantes dio **p≈0,064**, no confirmatoria. El remuestreo por jornada da intervalos diferentes al ensayo por cabeza, pero las comparaciones de numerosos períodos y reglas, y la caída de octubre, impiden atribuirle ventaja estable.

Como referencia geométrica, una selección **uniforme de diez familias físicamente posibles por corte** tendría una expectativa teórica de **63,83** cabezas cubiertas, frente a 60 de Lalo y 81 de Conectadas. Esta expectativa no es un modelo de azar de los sorteos y no constituye prueba de que Conectadas pueda anticipar premios.

Geometría registra 57 Top10 en todo el período, Nueva Prueba también 57; y esta última depende estructuralmente de Geometría. **Ninguna justifica alterar MV1** a partir de estos resultados.

## 4. Decisión de investigación

1. **Mantener Lalo MV1 oficial sin cambios.** El cuello de botella tiene dos causas distintas: familias formables no reconocidas y familias reconocidas que quedan en puestos bajos; no corregir ambas inflando la lista.
2. **Conservar Conectadas como investigación activa prioritaria**, no como selección automática. Explicar por qué tiene diferencia junio–septiembre positiva y octubre negativa; medir geometría, pares históricos y antigüedad de eventos, sin ajustar por la misma muestra y declararlo mejora.
3. **Conservar Geometría como lector complementario** para estudiar movimientos y rescates de familias ya reconocidas en puestos inferiores.
4. **Nueva Prueba** es derivada; no contarla como una tercera confirmación independiente.
5. **No promover “dos motores coinciden” ni “dos raíces en una misma columna”**: ambos fallaron como discriminadores de las ganadoras omitidas en estas jornadas.
6. **AUX AYER y AUX HOY** siguen independientes: cabezas que forman en Santiago/Neuquén no deben etiquetarse como formables en +11 salvo que tengan rutas independientes verificadas.
7. **Sellar los próximos PRE auténticos** por motor y turno, con exportación y estado de integridad; nunca acreditar reconstrucciones del teléfono como pronósticos prospectivos.

## Ejecuciones y evidencia

- [Diagnóstico físico y controles de los 15 cortes](https://github.com/y0t3/Modelo-Papa/actions/runs/40803763988): recorridos VT3 exactos, familias reconocidas y no reconocidas, permutaciones dentro del corte, regresiones oficiales y prueba de fugas temporales.
- [Ensayo 635 cortes, pares Lalo vs alternativos y controles geométricos](https://github.com/y0t3/Modelo-Papa/actions/runs/40804471448): cuatro lectores, prueba pareada binomial y remuestreo por jornada.
- [Registro de los 18 formables verificados y 19 del proveedor](RESULTADOS-VERIFICADOS.json).
- [Resultados completos de los 635 cortes](635-CORTES-VERIFICADOS.json).
- `scripts/lab-rastros-26a28oct-controles.ts` y `scripts/lab-vt3-historico-635-cortes.ts` para reproducción. Ambos mantienen MV1/VT4 intactos.

**Limitación principal:** todas las comparaciones históricas, salvo el PRE auténtico previamente sellado de la Previa del 26/10, son reconstrucciones con ventanas PRE correctas, no sellos prospectivos de la app. No se puede afirmar una ventaja explotable de quiniela con estos datos.
