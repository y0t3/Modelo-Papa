# Resultado: V8 original antes de Primera — 29 jornadas 08/09 al 10/10/2026

**Auditoría ejecutada y terminada, 11/10/2026 ART.** Rama exclusivamente experimental `auditoria-sorteo-10oct-2026`. No cambiar `main`, motor Modelo Papá, APK ni selector.

**Ejecución pública/auditable:** https://github.com/y0t3/Modelo-Papa/actions/runs/38107717643
**Archivos originales de cada fecha, JSON exhaustivo de rankings, script reproducible y resultados:** https://github.com/y0t3/Modelo-Papa/actions/runs/38107717643/artifacts/11690333869

**Protocolo definido ANTES de correr la serie**, aunque el caso 393 ya había motivado el estudio (por eso NO es una muestra independiente): `PROTOCOLO_BACKTEST_V8_ORIGINAL_ANTES_PRIMERA_SEPT_OCT2026.md`.

## Fuente cronológica e integridad

- Todas las fechas con sorteos del 08/09 al 10/10, excepto los domingos (29 jornadas). Para cada día se descargaron cabezas fechadas de Viví Tu Suerte; se usó SOLO `Nocturno` de la jornada de sorteo anterior y `Previa` del mismo día para formar la matriz +11 antes de **Primera**. Primera del día **NO** entra en el cálculo; sirve exclusivamente de resultado objetivo.
- El 10/10 usa el **JSON auténtico PRE Primera de las 10:53:58 ART**, GitHub run `38057490657`, SHA256 `99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9`. Se preservan los vacíos del original; API posterior NO rellena su matriz. El V8 original devolvió **393 #1, dos recorridos cruzados**: prueba de reproducción aprobada.
- Las demás 28 hojas se reconstruyen **a posteriori** de las fuentes fechadas, con las columnas objetivo censuradas, y NO poseen foto auténtica previa. Toda la evaluación es retrospectiva, además diseñada tras conocer 393.
- Cobertura consistente: **5 cabezas de Primera por fecha, 145 cabezas** en total, de Ciudad, Provincia, Córdoba, Santa Fé, Entre Ríos. Montevideo no se usa en resultados por cobertura desigual; sus casilleros conocidos en la hoja se conservan (como en el motor viejo).

## Tabla principal

| Métrica | V8 ORIGINAL | V8 SIN CRUZAR ENTRE FUENTES |
|---|---:|---:|
| Fechas válidas | 29 | 29 |
| Primer puesto en alguna de las cinco cabezas de Primera | **1/29** | **0/29** |
| Alguno de los tres primeros en Primera | **1/29** | **0/29** |
| Alguno de los cinco primeros en Primera | **1/29** | **0/29** |
| Primer puesto que usa al menos 1 cruce entre fuentes | **29/29** | No aplica |
| Primer puesto formado EXCLUSIVAMENTE por cruces | **15/29** | No aplica |
| Primer puesto empatado o casi empatado a tolerancia 1e-12 | **21/29** | No evaluado |
| Único primer puesto compatible | **393, Ciudad 8393, 10/10** | Ninguno |

Este `393` reprodujo los **dos** recorridos dirigidos originales, siendo la inversión de **una sola figura** que atraviesa la frontera Nocturna anterior/Previa en la fila Córdoba:
`(2,1)→(2,2)→(2,3)` = 3→9→3, y `(2,3)→(2,2)→(2,1)`. Son trayectorias **inválidas para el Modelo Papá actual**, que prohíbe cruzar turnos.

**Empates el 10/10:** 393, 555, 767 empatan exactamente en 0,9500000000000002; 355, 535 y 553 puntúan 0,9500000000000001 (solo diferencia flotante). Los **seis** se consideran casi empatados a tolerancia 1e-12. 393 quedó primero por orden de desempate, no por una ventaja sólida sobre los otros cinco.

**Por qué no implica una ventaja estadística:** un único acierto de terna en 29 jornadas con cinco cabezas por jornada es compatible con casualidad. Bajo referencia teórica simplificada de resultados independientes y uniformes, P(al menos 1 coincidencia en 145 comparaciones) = `1-(999/1000)^145` ≈ **13,5 %**. Esa referencia **no prueba** independencia ni la calidad del modelo.

## Todas las selecciones (incluidos negativos)

| Fecha | 1.º V8 viejo | cruces / todos sus caminos | ¿Salió en Primera? | 1.º sin cruces |
|---|---:|---:|---|---:|
| 08/09 | 141 | 2/2 | No | 053 |
| 09/09 | 535 | 4/6 | No | 184 |
| 10/09 | 141 | 4/6 | No | 134 |
| 11/09 | 112 | 10/10 | No | 177 |
| 12/09 | 566 | 4/8 | No | 030 |
| 14/09 | 044 | 4/4 | No | 004 |
| 15/09 | 517 | 4/6 | No | 757 |
| 16/09 | 005 | 2/7 | No | 000 |
| 17/09 | 444 | 4/14 | No | 464 |
| 18/09 | 323 | 2/2 | No | 248 |
| 19/09 | 686 | 2/2 | No | 045 |
| 21/09 | 317 | 5/9 | No | 022 |
| 22/09 | 044 | 2/7 | No | 404 |
| 23/09 | 555 | 6/6 | No | 118 |
| 24/09 | 759 | 7/7 | No | 139 |
| 25/09 | 010 | 4/4 | No | 108 |
| 26/09 | 020 | 4/6 | No | 040 |
| 28/09 | 303 | 2/2 | No | 637 |
| 29/09 | 198 | 8/8 | No | 798 |
| 30/09 | 335 | 1/7 | No | 333 |
| 01/10 | 858 | 2/2 | No | 789 |
| 02/10 | 646 | 2/2 | No | 639 |
| 03/10 | 429 | 6/8 | No | 454 |
| 05/10 | 738 | 10/14 | No | 178 |
| 06/10 | 266 | 5/7 | No | 265 |
| 07/10 | 777 | 2/2 | No | 224 |
| 08/10 | 189 | 4/6 | No | 809 |
| 09/10 | 546 | 10/10 | No | 346 |
| **10/10** | **393** | **2/2** | **Sí, Ciudad 8393** | **356** |

Ni la versión original ni la filtrada proporcionaron otro top 5 coincidente entre las 145 cabezas evaluadas.

## Diagnóstico de rescate

**Sí reutilizar en la arquitectura observadora del Modelo Papá**, sujeto a tests:
- Desglose trazable de una terna: rutas específicas, dirección, celdas, fuente, horizontalidad, presencia en distintas fuentes, y **cantidad de huellas reversibles distintas**.
- Indicador de cruce **explícitamente inválido** que la interfaz puede mostrar aparte como *contacto entre columnas* para estudiar una pregunta nueva. JAMÁS presentarlo como VT2/3/4 física permitida ni mezclarlo con ranking.
- Registro de alternativas casi empatadas y negativos. Cuando distintos números tienen igual puntuación, no fingir que el desempate alfabético sea certeza visual.

**No reutilizar por ahora:** función `v8` como selector; pesos 0,55/0,30/0,05/0,10; un ranking que recompensa cruces prohibidos. La ablasión V8 que respeta fuentes tampoco mostró aciertos en 29 jornadas, insuficiente para rescatarla como predictor.

**Próximo examen útil**: congelar una ficha antes de nuevas Primeras (ruta, sentido, fuente, abstención) y comparar con resultados reales, manteniendo la prohibición de cruces en el motor actual. Un módulo de estudio de *puentes entre columnas*, si se quiere explorar, debe ser experimental e independiente, sin llamarlos recorridos físicamente válidos.

La fuente completa y código están en el artefacto GitHub. Se creó además un HTML autocontenido y ZIP de 29 días con tableros y botón V8 original/sin cruces en la conversación.
