# Laboratorio: Geometría completa frente a Lalo · 15/09–15/10/2026

**Estado: exploratorio y retrospectivo, NO validación prospectiva.** El código de los motores no fue modificado. Se reconstruyó cada PRE con información disponible de las columnas de turnos previos y con hojas del día anterior y del mismo día semanal anterior. Se evaluó contra la cabeza conocida **solo después** de generar los Top. Todas las cifras son familias VT3 reversibles, no exactos VT4.

## Muestra y límites
- 27 jornadas · **135 cortes de turno** · **675 cabezas** de Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos.
- La fila de Montevideo se incluyó en la hoja como fuente física cuando correspondía; no se contó entre los 675 resultados objetivos.
- Dos períodos descriptivos: **15/09–10/10**, 23 jornadas / 115 cortes / 575 cabezas (histórico reiteradamente explorado); **12/10–15/10**, 4 jornadas / 20 cortes / 100 cabezas (posterior a parte de los experimentos anteriores, pero **no un holdout completamente nuevo**).
- Fuente de cifras: API VivíTuSuerte, descargada durante la reconstrucción; no demuestra qué datos parciales conocíamos a la hora real de cada sorteo (p.ej. Santa Fe Nocturna del 14/10 faltaba en un PRE realmente sellado de la Previa del 15/10). Los resultados de esta prueba NO reemplazan ese sello PRE.
- Los motores se congelan tal como figuran en `main` al ejecutar la auditoría; no se ajustan a la respuesta.
- Archivo detallado: workflow https://github.com/y0t3/Modelo-Papa/actions/runs/38846804735 — artefacto `LAB-GEOMETRIA-LALO-HISTORICO-2026`.

## Comparación por cabeza
| Período | Cabezas | Geometría Top3 | Lalo Top3 | Geometría Top5 | Lalo Top5 | Geometría Top10 | Lalo Top10 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 15/09–10/10 | 575 | **9** | 5 | 13 | 10 | 20 | 17 |
| 12/10–15/10 | 100 | **1** | 0 | 1 | 3 | 3 | **5** |
| **Total** | **675** | **10** | **5** | **14** | **13** | **23** | **22** |

De 135 cortes, Geometría encontró una o más cabezas ganadoras Top3 en 10 cortes y el oficial en 5. En Top10 ambos cubrieron **19 cortes** (aunque con 23 y 22 cabezas respectivamente); conviene no confundir cortes con cabezas.

### Top 3 exclusivo
- **8 cortes únicamente Geometría**: 15/09 Matutino (1977), 19/09 Matutino (6801), 21/09 Vespertino (4246) y Nocturno (7173), 24/09 Matutino (0189), 26/09 Nocturno (4283), 01/10 Matutino (9598), 15/10 Nocturno (6624).
- **3 cortes únicamente Lalo**: 17/09 Nocturno (1464), 30/09 Matutino (6778), 10/10 Nocturno (0564).
- **2 cortes coincidieron ambos en Top3**: 17/09 Previa (9446), 02/10 Previa (8935).
- En la muestra histórica usada, los eventos de diferencia se concentran en pocos días; los turnos del mismo día son dependientes. Una remuestra exploratoria por 27 jornadas (40.000 extracciones con reemplazo, semilla fija) de la diferencia de aciertos Geometría − Lalo da aproximadamente un intervalo de **−2 a +12**. Es un intervalo descriptivo, NO prueba de superioridad y no corrige la selección retrospectiva del método.

## Control de bolsa física
- Solo **171 de 675 cabezas** tenían una terminación VT3 físicamente trazable en las columnas disponibles.
- Elegir al azar tres familias distintas dentro de la **misma bolsa física existente en cada PRE** daría una esperanza de aproximadamente **3,99 aciertos por cabeza** en 135 cortes (Top10: 13,30). Geometría observó 10 (Top10: 23). Este control es referencia matemática, **no test de significación**: no modela dependencia entre turnos, repetición de familias y selección histórica de la regla.
- En el Top3 geométrico se observaron **3 selecciones sin anclaje histórico** sumando los 135 cortes (405 plazas), por lo que no parece que la diferencia del Top3 provenga simplemente de introducir familias sin raíz.
- El ranking geométrico cambió el conjunto de sus tres primeras familias en **8 de 108** pasos entre turnos; permaneció igual en 100 (92,6 %). Puede perder oportunidad de incorporar nueva información; requiere análisis independiente.

## Comparación por turno (Top3 / Top10)
| Turno | Geometría Top3 | Lalo Top3 | Geometría Top10 | Lalo Top10 |
|---|---:|---:|---:|---:|
| Previa | 2 | 2 | 5 | 4 |
| Primera | 0 | 0 | 1 | 2 |
| Matutino | **4** | 1 | 6 | **11** |
| Vespertino | 1 | 0 | 2 | 0 |
| Nocturno | **3** | 2 | **9** | 5 |

## Qué investigar ahora sin esperar sorteo nuevo
1. **Geometría contra control neutral de formas**, manteniendo la misma bolsa de familias, con simulaciones agrupadas por fecha y sin optimizar parámetros usando sus resultados. Ver cuánto del exceso de aciertos supera realmente una elección no informada.
2. **Ablaciones geométricas**: en copias de laboratorio, comparar regla vigente frente a orden sin distancia D−1, sin distancia D−7 y con foco en nuevas columnas, sobre semanas anteriores con validación por bloques temporales separados. No tocar el motor oficial.
3. **Inercia de Top3:** distinguir cuándo una familia ya estaba en Previa y cuándo aparece por una columna nueva, cuántas veces las novedades consiguen superar a las familias heredadas y si los aciertos vienen de ambos tipos.
4. **Complementariedad:** simular exactamente tres puestos, por ejemplo dos del oficial y uno exclusivo geométrico, frente a tres oficiales y tres geométricos. No aumentar cupos ni decidir los pesos según el mismo día con el que se puntúa.
5. **Después**, utilizar sorteos futuros pre-sellados solamente para corroborar el criterio ya escogido; mantener registro externo con hora.

### Limitación fundamental
La reconstrucción sin fuga del resultado objetivo evita una trampa, pero **no equivale a haber escogido y registrado el método antes de conocer esos resultados**. Muchas reglas geométricas ya se habían evaluado sobre estas mismas semanas. No usar estos números como tasa predictiva demostrada, tampoco extrapolar una probabilidad de acertar al jugar.
