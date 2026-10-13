# Punto de control VT3 — anatomía física de los intercambios de candidatos

**13 de octubre de 2026.** Rama experimental `lab-vt3-anatomia-intercambios-13oct2026`. [GitHub Actions 38373827489 — completada correctamente](https://github.com/y0t3/Modelo-Papa/actions/runs/38373827489).

## Pregunta, límites y protección temporal

¿En qué se distinguen **TODAS** las familias introducidas por diversidad de antecedentes de las familias que expulsa? ¿Qué diferencia hay con introducir las de mayor cantidad absoluta de raíces, que también produjo 17/115? Para responder se evaluaron los **115 cortes existentes, 23 fechas**, con los mismos Tops de diez familias ya sellados: `OFICIAL`, `COB20_P3` y `CONTROL_MAS_EVENTOS_20`. Ningún candidato nuevo ni peso nuevo se construyó desde resultados POST.

El workflow aisló los datos en `/tmp` antes de preparar PRE. Sólo se dejaron a disposición del generador **dos fuentes PRE anteriores**, con SHA256 verificados:
- `auditorias/vt3-diversidad-antecedentes-115-13oct2026/PRE_115.json`: `b190ed0a4715220501f564dee3300264c32efeccef7bc49fbfb1dee10999908e`.
- `CONTROLES_PRE.json` del laboratorio anterior: `c59b509ba99d5c484f331885007c9e3c8f995b0d58669e9fd9aeeba0fcc36346`.

Se generó `PRE_115.json` con TODOS los intercambios y rasgos físicos, `CONTROLES_PAREADOS_PRE.json` con 2.000 variantes neutrales para cada selector y `SELLO.json` que autentica ambos y el script/protocolo. Sólo después se restauraron las cabezas y se generaron POST y `RESUMEN.json`. Ningún cambio a `main`, `src/motorLalo.ts`, hoja +11, marcas de recorridos POST, sello de predicción, app, APK ni VT4.

**Importante:** la muestra ya fue observada múltiples veces para proponer las hipótesis; el sellado de este nuevo programa no es una prueba prospectiva ni evidencia de pronóstico sobre el azar.

## 1. Comparación de las dos políticas de 17 aciertos

| Indicador durante los 115 cortes | Diversidad marginal COB20_P3 | Mayor cantidad absoluta de antecedentes |
|---|---:|---:|
| Top10, cortes con al menos una coincidencia | **17** | **17** |
| Cortes donde cambia alguna familia | **73** | **89** |
| Apariciones de familias incorporadas (= desplazadas) | **136** | **287** |
| Apariciones incorporadas que luego ganaron | **3** | **4** |
| Apariciones incorporadas que no ganaron | **133** | **283** |
| Apariciones ganadoras desplazadas | **1** | **2** |
| Eventos de cabeza históricos nuevos cubiertos, sumados corte a corte | **153** | **72** |
| Eventos históricos únicos perdidos, sumados corte a corte | **0** | **42** |
| Cortes con cobertura de eventos aumentada | **68/73 cambiados** | **27/89 cambiados** |
| Cortes con cobertura de eventos disminuida | **0** | **21** |
| Rango original medio de familia incorporada | **15,01** | **14,62** |
| Rango original medio de familia desplazada | **8,57** | **7,49** |

**Interpretación:** la diversidad mejora de forma consistente la *composición histórica* del conjunto: obtuvo más antecedentes distintos sin perder ningún evento de cabeza que antes estuviera exclusivamente representado. Eso NO equivale a preservar todas las familias ganadoras. El resultado Top10 es exactamente igual al de la estrategia simple de cantidad de antecedentes: 17/115.

Por familia incorporada, COB20 trae **1,82 eventos propios**, frente a **1,32** en las desplazadas. En novedad respecto a las familias conservadas en común, las incorporadas tienen **1,21 eventos no representados**, frente a **0,07** de las salientes. Esa diferencia es esperada por construcción de la regla de diversidad; NO se debe usar como prueba estadística independiente de su virtud.

## 2. ¿Qué está realmente al alcance de los candidatos 11–20?

Había **1.131 exposiciones de familia en los puestos 11 a 20** a lo largo del historial, de las que **13** coincidieron después con una familia extraída. **Sólo en 9 cortes** una de esas familias podía rescatar un fallo del Top10 original: en los otros cuatro el Top original ya había acertado por otra familia.

COB20 rescató **3 de esas 9 oportunidades** y la estrategia de cantidad de raíces rescató **4**. Ninguna recuperó todas y ambas desplazaron aciertos oficiales en otras fechas.

El hallazgo discriminante para nuestra hipótesis es éste, entre las 1.131 exposiciones fuera del Top:

| Antecedentes propios que aún NO aparecen en el Top3 original | Exposiciones | Exposiciones ganadoras |
|---|---:|---:|
| **0 eventos nuevos** | **543** | **7** |
| **1 evento nuevo** | **468** | **4** |
| **2 o más** | **120** | **2** |
| **Total** | **1.131** | **13** |

**Siete de las trece** familias ganadoras ya tenían antecedentes representados por las tres primeras. El criterio «tener algún evento histórico no cubierto» no es condición necesaria para acertar una terna. Que otra familia comparta una cabeza histórica no invalida la ruta física propia de la candidata.

Las ganadoras de puestos 11–20 con cero novedad incluyeron, entre otras, `175/571` (15/09 Previa, rango 11), `076/670` (24/09 Nocturno, rango 15), `037/730` (28/09 Primera, rango 16), `067/760` (28/09 Matutino, rango 18) y `748/847` (01/10 Previa, rango 19). Estos ejemplos son **POST**, no sugerencias para sorteos siguientes.

## 3. Casos positivos y negativo de las cuatro fechas decisivas

### 16/09 Matutino — recupera `087/780`
- La cabeza 6087 correspondió a la familia `087/780`, rango oficial **12**.
- COB20 incorpora `087/780` y `386/683`; desplaza `097/790` (rango 8) y `079/970` (rango 10).
- El Top experimental añade dos antecedentes no representados y **pierde cero eventos**.
- La estrategia de más raíces también incorpora `087/780` y recupera el corte.

### 18/09 Nocturno — **pierde** `173/371`
- La cabeza 3173 formó la familia `173/371`, que era **rango oficial 8**.
- COB20 la desplaza junto a `172/271` y `258/852`. Incorpora `487/784` (rango 17), `285/582` (20) y `367/763` (14).
- Aunque **añade cuatro cabezas históricas distintas y no pierde ningún evento histórico cubierto**, pierde el acierto que el original sí había seleccionado.
- **Este ejemplo muestra la principal limitación:** conservar diversidad de raíces no es lo mismo que conservar a una familia ganadora. También en la bolsa 11–20 estaba `798/897`, pero el Top original ya acertaba por `173/371`.

### 02/10 Matutino — recupera `075/570`
- La cabeza 4570 corresponde a `075/570`, rango **18**.
- COB20 la incorpora junto a `657/756` y `366/663`; desplaza rangos 6, 7 y 10.
- Aporta tres eventos nuevos de origen distinto sin pérdida de eventos ya cubiertos.
- **La política de contar raíces absolutas no sustituye ninguna familia ese corte** y no recupera `075/570`; aquí sí difieren las dos estrategias.

### 05/10 Vespertino — recupera `799/997`
- La cabeza 8799 corresponde a `799/997`, rango **15**.
- COB20 incorpora `799/997`, `097/790` y `284/482`, sustituye rangos 8, 9, 10.
- La estrategia de cantidad de raíces también incorpora `799/997`. Las dos recuperan el corte, pero completan sus Tops con otras familias.

## 4. Controles más exigentes: mismas plazas expulsadas, otros reemplazos

Además del control neutral general anterior, esta prueba fijó **el mismo núcleo de familias conservadas y el mismo número de sustituciones** en cada corte. Sólo varió, uniformemente, cuáles de las familias ancladas elegibles en los puestos 11–20 ocupaban las plazas abiertas. Se sellaron **2.000 elecciones por cada una de las dos estrategias** antes de POST.

| Métrica | COB20_P3 (diversidad) | Más antecedentes absolutos |
|---|---:|---:|
| Top10 observado | **17/115** | **17/115** |
| Top10 promedio de sus 2.000 controles de igual presupuesto | **15,48** | **15,68** |
| Porcentaje de controles que alcanzaron o superaron su Top10 | **16,45 %** | **25,60 %** |
| Ganadoras seleccionadas entre incorporadas | 3 | 4 |
| Ganadoras esperadas en reemplazos neutrales, promedio | 1,58 | 3,56 |
| Porcentaje de controles con al menos tantas ganadoras incorporadas | **19,20 %** | **50,60 %** |

En particular, el +2 absoluto de COB20 **no es excepcional** dentro de las selecciones neutrales de igual presupuesto y mismo núcleo. Las 2.000 comparaciones están archivadas en el archivo PRE sellado, no se seleccionó la que dio mejor.

## 5. COB20 vs mayor número de antecedentes: mismo Top10, distintos aciertos

Entre ambos sistemas hubo **99 cortes con Tops distintos**, aunque ambos acabaron en 17/115:
- **Sólo diversidad acierta:** 24/09 Previa y **02/10 Matutino**.
- **Sólo cantidad de raíces acierta:** 15/09 Previa y 29/09 Nocturno.
- **Ambos aciertan:** 15 cortes.
- **Ambos fallan:** 96 cortes.

Las 10.000 reasignaciones de jornadas completas y otras 10.000 del mismo día semanal produjeron diferencias COB20−cantidad de raíces tanto positivas como negativas; la diferencia histórica real es **cero**. Ni la selección geométrica diversificada ni la simple abundancia se separan mediante el rendimiento observado. Separar fuentes D−1/D−7 tampoco se puede promover como «porcentaje» sin otra prueba.

## 6. Conclusión operativa

1. **Sí**: COB20 tiene un mecanismo real y verificable para evitar redundancia en el Top10; en 73 cortes modificados nunca redujo la cobertura de antecedentes históricos únicos. La producción actual no está rota: ordena cada familia individualmente, mientras COB20 ordena un conjunto con otra finalidad.
2. **No**: conservar antecedentes únicos no asegura conservar ni seleccionar la familia ganadora. `173/371` el 18/09 demuestra ese límite.
3. **No**: no hay evidencia de que premiar novedad de raíz discrimine una familia ganadora futura; 7 de 13 ganadoras fuera del Top tenían cero novedad frente al Top3, y los controles de igual presupuesto son compatibles con azar.
4. **No hacer**: cambiar automáticamente VT3 oficial, aumentar Top10, reemplazar familias por estética de la hoja o pasar a VT4.
5. **Dirección para otra prueba sin esperar sorteos:** estudiar cada **evento de raíz concreta en su fuente y turno de origen**, separando corroboración independiente de réplicas del mismo evento, y comparar su aporte dentro de grupos de familias con raíz compartida. Con el corpus ya muy explotado, utilizar indicadores de estabilidad/estructura del motor y no optimización por éxitos conocidos. Una alternativa de ingeniería defendible es **mostrar ambos Tops y el diagnóstico de redundancia** sin afirmar ganancia predictiva.

## Archivos verificables

- `PROTOCOLO_VT3_ANATOMIA_INTERCAMBIOS_13OCT2026.md`.
- `scripts/lab-vt3-anatomia-intercambios.mjs` (con pruebas y aserciones).
- `auditorias/vt3-anatomia-intercambios-115-13oct2026/PRE_115.json` — cada entrada/salida y su respaldo propio, sin cabezas futuras.
- `CONTROLES_PAREADOS_PRE.json` — 2.000 selecciones neutrales de igual presupuesto para cada estrategia; `SELLO.json` con todos los SHA.
- `POST_115.json`, `RESUMEN.json` — resultados observados, los 115 cortes, cada grupo negativo, casos, per-turno/per-mes y placebos.
- [GitHub Actions 38373827489 — completada correctamente](https://github.com/y0t3/Modelo-Papa/actions/runs/38373827489).

**VT3 oficial permanece intacto y VT4 en espera.**
