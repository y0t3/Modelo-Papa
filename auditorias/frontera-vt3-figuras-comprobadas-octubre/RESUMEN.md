# Frontera de admisión VT3: figuras físicas excluidas y testigos ganadores reales

**Auditoría 17/10/2026. Seis jornadas cerradas del 10 al 16 de octubre de 2026 (10, 12, 13, 14, 15 y 16). Sin jornada del 17/10. MV1, motor oficial, Geometría Completa, VT4 y APK sin cambios.**

**Ejecución aprobada:** https://github.com/y0t3/Modelo-Papa/actions/runs/39077446786

## Protocolo y exclusiones

**Sólo se analiza un VT3 físicamente formado en una misma columna +11 antes del turno a evaluar.** Ninguna cabeza que no tenga recorrido VT3 válido se incorpora en numerador, denominador, ejemplos de fallo, conclusiones o extracción de nuevas reglas. La tabla física contiene seis filas y dos casillas por fila, únicamente contactos directos entre casillas; sin saltos, cruces de columna ni inventar cifras por trazos.

Cada PRE incorpora sólo la Nocturna anterior y resultados ya sorteados de turnos anteriores de ese día. Las figuras históricas se registran únicamente cuando hubo **cabezas completas realmente sorteadas** con caminos VT3 coincidentes y todos sus recorridos físicos. Se deduplican los caminos inversos; un único resultado histórico con varios caminos no se toma como varias cabezas ganadoras.

Se consideran las **últimas seis jornadas reales anteriores** y, por separado, las marcas verdaderas de turnos precedentes de la jornada actual. Se trasladan **dibujos, NO cifras históricas**. Las cabezas objetivo sólo sirven para verificar *después* si una candidata física coincidió.

La definición de "no admitida" se toma del propio motor Lalo: es físicamente posible en el PRE, pero no aparece en su ranking VT3 porque no obtuvo la traslación/bifurcación respaldada que requieren sus raíces oficiales D−1/D−7. No se alteró esa definición ni su prioridad a bifurcaciones.

En total: **30 PRE, 37 cabezas con VT3 físico**, de las que **22** pertenecían a familias físicamente disponibles **pero no admitidas**; además se conservaron **2.566 exposiciones (familia×PRE) no admitidas**, incluyendo familias ganadoras y no ganadoras. No son 2.566 familias diferentes ni 2.566 sorteos independientes.

## Prueba A: ¿basta con reproducir un dibujo antiguo ganador?

| Característica PRE de VT3 no admitida | Familias expuestas (de 2.566) | Cabezas físicas coincidentes (de 22) | Neutral esperado dentro del mismo PRE |
|---|---:|---:|---:|
| Forma geométrica comprobada antes, **en cualquier fuente** | 2.496 | 19 | 21,28 |
| Forma ganadora comprobada **en otra fuente** | 2.468 | 19 | 21,14 |
| Forma ganadora comprobada **en la misma fuente** | 1.290 | 10 | 10,69 |
| Forma comprobada en **turnos anteriores del día** | 562 | 6 | 4,54 |
| Familia **solo en la fuente incorporada más recientemente** | 875 | 5 | 6,81 |

**Interpretación:** la forma geométrica madre aislada discrimina muy poco: casi todas las familias físicas no admitidas poseen algún antecedente de las formas ganadoras conocidas. Que 19/22 cabezas aparezcan allí no basta; 2.496/2.566 candidatas físicas presentan el mismo atributo.

Para controlar el volumen de posibilidades, se repitió la comparación entre familias **del mismo PRE**, igualando primera fuente física, banda de cantidad de caminos y fuente única/múltiple. Solo se contabilizan estratos con candidatas con y sin el atributo.

En los estratos comparables:
- Antecedente de **misma fuente**: **8 cabezas observadas vs 8,55 neutrales**, sobre 19 cabezas presentes en estratos mixtos.
- Antecedente en **otra fuente**: **5 vs 7,21**, sobre 8 cabezas en estratos mixtos.
- Antecedente de **turnos previos del día**: **6 vs 4,95**, sobre 16 cabezas en estratos mixtos.

La repetición intradía conserva una pequeña diferencia positiva, pero cambia entre períodos y no tiene muestra suficiente para promover candidatas automáticamente.

**Importante:** "solo en la fuente más reciente" queda totalmente determinado por su primera fuente física y la disponibilidad de una única fuente. Tras emparejar por primera fuente y cantidad de fuentes, **no quedan estratos mixtos**. Se registra el control sin fingir que ofrece discriminación independiente.

## Prueba B: no solo forma, también posición física y desplazamiento

Se comparó la **huella real de casillas** de cada terna actual con rutas ganadoras históricas del **mismo dibujo**, sin rotaciones, espejos, saltos ni cruces de fuentes.

| Atributo histórico en un candidato VT3 no admitido | Familias expuestas | Cabezas observadas | Neutral esperado PRE |
|---|---:|---:|---:|
| Mismo dibujo y exactamente **las mismas casillas**, cualquier fuente | 1.608 | 11 | 14,00 |
| **Mismo dibujo, mismas casillas y misma fuente** | **425** | **5** | **3,53** |
| Mismo dibujo, **misma fuente** y desplazamiento vertical de hasta **una fila** | 853 | 8 | 7,10 |

Emparejando por PRE, primera fuente, banda de recorridos y cantidad de fuentes:
- **Mismas casillas y misma fuente:** 4 observadas frente a **2,54 esperadas** en los estratos donde había ambos tipos. De las otras cabezas no se deduce nada por falta de controles comparables.
- **Desplazamiento ≤1 fila en misma fuente:** 7 observadas frente a **5,79 neutrales**.
- **Misma posición en cualquier fuente:** 10 observadas frente a **11,73 neutrales**.

La primera propiedad es específica y merece conservar testigos físicos, pero **NO rindió consistentemente en las dos mitades**:

| Período | Mismas casillas y misma fuente, observadas | Neutral esperado de estratos comparables |
|---|---:|---:|
| 10 al 13/10 | 1 | 1,08 |
| 14 al 16/10 | 3 | 1,46 |
| **Total comparable** | **4** | **2,54** |

Las restantes coincidencias no siempre entran en estratos mixtos y no se deben confundir con una mejora del ranking. El período es breve y ya muy explorado. Cualquier regla elegida ahora por esa diferencia sería sobreajuste potencial.

## Ejemplo de figura histórica que el motor oficial no incorpora

**16/10, Nocturna: Santa Fe, cabeza 5807 → VT3 708/807.**

- El VT3 **807** existía antes del sorteo en la columna +11 **Vespertino**, siguiendo casillas **0:0 → 1:1 → 2:1**, sin saltos.
- Esa misma figura y **las mismas casillas en Vespertino** ya habían explicado la cabeza **7242** del **12/10**; hay un antecedente comprobado real, pero su cifra era distinta.
- Otros eventos anteriores de la misma forma incluyeron la cabeza **6215** del 10/10, también en Vespertino, trasladada una fila. Los números históricos NO generan la familia actual; la familia actual se lee en los dígitos del PRE del 16/10.
- Lalo no admitió **708/807** como VT3 con sus raíces D−1/D−7 oficiales.
- **No promover automáticamente:** otras **420 exposiciones** de familias no admitidas también tenían una figura histórica en la misma fuente y casillas. Solo cinco cabezas de todo el intervalo compartieron ese atributo.

Otros ejemplos muestran por qué buscar cualquier figura antigua no basta:
- **16/10 Nocturna, 9132 → 132/231:** VT3 físico en Nocturna anterior; ocho eventos de cabezas ganadoras previas compartían su forma general, pero ninguno aportó el mismo respaldo oficialmente exigido. No fue admitido.
- **10/10 Nocturna, 6215 → 215/512:** familia física recién formada en Vespertino, sin ninguna coincidencia de su figura con marcas ganadoras de las seis jornadas anteriores. Pretender que TODAS las candidatas ganadoras no admitidas poseen la misma clase de antecedente sería falso.

## Hallazgo de arquitectura: dos capas diferentes de información

El motor oficial **solo admite** familias VT3 a partir de sus raíces operativas D−1/D−7 y bifurcaciones válidas. La observación de tu papá puede abarcar varias jornadas cortas, aunque los dibujos formen números diferentes cada día.

Eso crea un caso comprobable: **existen familias físicas actuales con figuras históricamente ganadoras fuera de D−1/D−7, pero la información no entra en la admisión oficial**. Lo revelan casos como 708/807.

Esto **no demuestra que alargar la ventana a seis jornadas mejore el Top**: 1.290 exposiciones físicas no admitidas tenían alguna repetición de forma en la misma fuente para solo diez coincidencias. Extender la admisión sin discriminar agregaría muchas familias que no salieron.

**Recomendación estricta:** conservar como registro explicativo experimental `FIGURA_FISICA_NO_ADMITIDA` con: fuente actual + celdas + familia + fecha/turno/jurisdicción/cabeza histórica comprobada + fuente/celdas históricas + relación de desplazamiento. No asignar puesto ni permitir que los resultados posteriores "marquen" preventivamente la hoja. Esta capa preserva información geométrica comprobada para inspección humana **sin alterar Lalo, MV1 ni Tops**.

## Decisión

- **NO abrir el filtro de admisión** por "figura alguna vez ganadora" o "misma fuente y casillas": ninguno demostró ventaja estable contra negativos físicos del mismo PRE.
- **NO cambiar bifurcación ni las reglas VT4**; pertenecen a otra etapa ya auditada y no hubo aquí validación para modificarlas.
- **Sí conservar** el diagnóstico físico de por qué se admite o no se admite una familia (y sus antecedentes reales), como trazabilidad visual de la hoja +11.
- Toda hipótesis nueva sigue etiquetada **exploratoria y retrospectiva**, sin convertir estos números en probabilidades ni recomendaciones de apuestas.
- No se utilizó el 17/10 incompleto, no se buscó historia más vieja y no se modificó ninguna APK.

## Reproducibilidad

- Rama aislada: `lab/frontera-vt3-fisica-10a16oct2026`.
- Código auditado: `scripts/lab-vt3-decisiones-6-jornadas.ts` (los 30 PRE y las cabezas físicas); `scripts/lab-frontera-vt3-figuras-reales.ts` (eventos históricos únicos, identidad de forma, misma casilla, desplazamiento, grupos negativos); `scripts/test-lab-frontera-vt3-figuras-reales.ts` (pruebas de familia reversible, no duplicar cabeza histórica, desplazamiento y testigos físicos).
- [GitHub Actions definitivo exitoso](https://github.com/y0t3/Modelo-Papa/actions/runs/39077446786).
- Artefacto `LAB-DECISIONES-VT3-6-JORNADAS`, JSON **`DECISIONES_VT3_ULTIMAS_6_JORNADAS.json`** (auditoría oficial vs raíces) y JSON **`FRONTERA_VT3_NO_ADMITIDAS_6_JORNADAS.json`** (todas las 2.566 exposiciones no admitidas, negativos y cada prueba de figura).
- Sin cambios en `main` ni APK.
