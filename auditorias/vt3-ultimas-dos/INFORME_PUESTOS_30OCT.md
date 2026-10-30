# Auditoría preliminar: ¿hay un puesto VT3 que destaque como el famoso #7?

**Modelo Lalo — 30/10/2026 · lectura exacta de las dos terminaciones del Top10 VT3.**

## Método correcto

Cada puesto aporta exclusivamente los dos sufijos de las dos lecturas VT3 que ya publica Lalo: por ejemplo `513/315→13/15`. NO se invierten las cifras extraídas, NO se crean familias VT2 y NO se cortan ni amplían recorridos. Una jornada cuenta como coincidencia de un puesto si una de sus dos terminaciones aparece entre las cinco cabezas reales del turno. Varios puestos pueden compartir la misma terminación: **sus coincidencias por puesto NO deben sumarse como cabezas independientes**.

El motor se reconstruyó PRE en 119 jornadas completas (103 de junio a septiembre y 16 del 12 al 29 de octubre), cinco turnos, cinco jurisdicciones base sin Montevideo por su calendario. Los resultados publicados se usan POST para cotejar. Los totales por puesto se extrajeron de la prueba validada: [GitHub Actions 41017620733](https://github.com/y0t3/Modelo-Papa/actions/runs/41017620733), artefacto `vt3-dos-ultimas-lalo-jun-oct`.

## Candidatos a seguir: puesto #8

| Puesto y turno | 103 jornadas junio–septiembre | 16 jornadas octubre | 119 jornadas totales |
|---|---:|---:|---:|
| **#8 · Vespertino** | **13** | **4** | **17** |
| **#8 · Nocturna** | **13** | **4** | **17** |
| #7 · Nocturna | 13 | 1 | 14 |
| #3 · Nocturna | 12 | 3 | 15 |
| #5 · Nocturna | 12 | 3 | 15 |
| #6 · Vespertino | 13 | 1 | 14 |

Cada número es la cantidad de **jornadas con ≥1 cabeza coincidente en ese puesto**. Las tasas del #8 fueron 13/103 (12,6 %) en el historial previo y 4/16 (25 %) en octubre; 17/119 (14,3 %) en conjunto. Una jornada podía registrar más de una cabeza o contener números repetidos en varios puestos; aquí se cuenta cada jornada una vez por puesto.

En las **50 combinaciones** observadas de cinco turnos por diez puestos, las **dos puntuaciones brutas más altas** fueron precisamente los #8 de Vespertino y Nocturna con 17/119; las siguientes puntuaciones fueron 15/119. Esa comparación fue escogida POST entre muchos puestos y no acredita predicción.

**Control interno de puestos:** el promedio de los diez puestos en Vespertino fue 8,9 jornadas coincidentes de 103 en junio–septiembre y 1,7 de 16 en octubre. Para Nocturna fue 9,9 de 103 y 2,3 de 16. El #8 supera esos promedios en ambos períodos, pero el número de puestos explorados es elevado y hay solapamientos.

No se trata de una diferencia robusta demostrada. Un control matemático muy básico, suponiendo 2 terminaciones distintas y 5 cabezas uniformes por sorteo, daría una coincidencia por puesto con probabilidad `1−(98/100)^5 ≈ 9,61 %`; 17/119 tendría una cola binomial aproximada del 6,3 % **si el puesto hubiera sido seleccionado por adelantado**. Esa suposición no captura dependencia, terminaciones duplicadas, distintas jurisdicciones o búsqueda posterior entre **50 combinaciones de turno×puesto**. Por lo tanto, NO da una evidencia estadística suficiente para marcar el #8 como predictor.

## Ejemplos reales que explican por qué no basta con contar aciertos por puesto

- **27/10, Nocturna:** #8 `899/998→99/98` coincidió con Provincia **2299**. Pero esta cabeza **NO figura entre los aciertos exclusivos de las terminaciones VT3** de ese corte; el Top10 VT2 ya cubría su sufijo. Así que cuenta como coincidencia del #8, **no como mejora exclusiva**.
- **28/10, Nocturna:** #8 `050/050→50/50` no coincidió; ese puesto exponía **una** terminación distinta, no dos.
- **29/10, Vespertino Y Nocturna:** el #8 conservó `117/711→17/11` en ambos turnos y **no coincidió**. La persistencia intrajornada de la familia no implica una señal predictiva.

Estos tres ejemplos proceden del detalle de los cortes guardado en el JSON histórico; no son pronósticos publicados antes del resultado.

## Hipótesis de rachas cortas: contrastada con los resultados actuales

En Nocturna, con el criterio PRE **2 coincidencias en las 3 jornadas anteriores en el MISMO puesto**, hubo:
- Junio–septiembre: **30 alertas**, de las cuales **3** coincidieron en la jornada siguiente; entre no alertadas coincidieron 91 de 970 observaciones.
- Octubre 12–29: **1 alerta**, **0** coincidencias posteriores.
  
Con 2 de 5 jornadas, junio–septiembre: **11 coincidencias de 82 alertas** versus 82 de 898 sin alerta; octubre: **0 de 6**. No hay ventaja estable en estas reglas; no las integrar en el radar como "activación" por el momento.

## Qué habría que exigir antes de declarar un puesto destacado

La distinción crítica es **coincidencias brutas** vs **aciertos exclusivos frente al Top10 VT2 de Lalo**. Las 119 jornadas sumaron **172 cabezas de aporte exclusivo** para el conjunto completo de terminaciones VT3, pero **los resúmenes históricos publicados no reparten esas 172 cabezas exclusivamente por puesto**. Sería incorrecto adjudicar al #8 una parte concreta sin ejecutar y auditar ese nuevo desglose.

La rama `lab/puestos-vt3-vt2-unicos-30oct` añade un evaluador puro `src/labVt3TopPositions.ts` y pruebas `scripts/test-vt3-puestos-unicos.ts`, para medir por puesto:
1. Las dos terminaciones distintas disponibles y cuántas están **fuera** del Top10 VT2 (cero, una o dos).
2. Cabezas captadas por ese puesto que **no cubre el Top10 VT2**; desglose adicional de cuántas no aparecen en ningún otro puesto VT3.
3. Rachas de 3 y 5 jornadas del MISMO turno con información PRE, separando 103 jornadas históricas y el tramo posterior de octubre.
4. Comparación de puestos a presupuesto/exposición igual; evaluar en octubre un puesto escogido exclusivamente con datos anteriores.

Ese evaluador **no tiene un replay histórico ejecutado y aprobado aún**. Hasta tenerlo, el #8 debe permanecer como **candidato descriptivo de investigación**, no como posición oficialmente activa.

## Decisión

**En la interfaz:** mostrar solamente `Últimas 2: XX / YY` en cada uno de los mismos Top10 VT3, resaltando tras el sorteo las coincidencias. Mantener visibles todos los puestos, no crear candidatos adicionales, no marcar como apuestas ni emitir alarmas anticipadas por rachas.

**En investigación:** el #8 de Vespertino y de Nocturna merece inspección de *aporte exclusivo* y control del solapamiento con VT2. No elegirlo permanentemente ni modificar el Modelo Lalo MV1 en función de aciertos históricos aislados.
