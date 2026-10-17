# Auditoría de decisiones VT3: físicamente posible → admisión → Top

**17/10/2026 · Laboratorio aislado · seis jornadas completas, 30 PRE. MV1, Lalo, Geometría Completa, VT4, `main` y APK intactos.**

[Ejecutar/ver CI aprobado](https://github.com/y0t3/Modelo-Papa/actions/runs/39076253164).

## Alcance explícitamente restringido

**Exclusión estricta:** se analizan **solamente** cabezas con familia VT3 físicamente formada dentro de una de las columnas +11 disponibles antes del turno objetivo. Las cabezas sin VT3 físico **no se introducen en ningún resultado, clasificación de fallo, control, hipótesis o recomendación**. No se analizan ni se intentan solucionar en este estudio.

Se usaron seis jornadas completas: **sábado 10/10, lunes 12/10, martes 13/10, miércoles 14/10, jueves 15/10 y viernes 16/10 de 2026**, 30 cortes PRE y sus fuentes históricas reales D−1 y D−7. No se incluyó 17/10 ni domingo 11/10. Todas las cinco cabezas argentinas de cada turno fueron verificadas al validar la completitud, pero las coincidencias reportadas se limitan exclusivamente a VT3 físicamente formados.

**Protocolo temporal:** para cada corte se ocultaron todas las cabezas del turno objetivo y posteriores. Se construyó el PRE con Nocturna anterior y columnas anteriores del mismo día; `buildMotorLalo` y `buildVt3Shadow` solo recibieron las hojas históricas que correspondían. Las cabezas se aplicaron *después* para etiquetar éxitos. Familias VT3 reversibles sin falsos saltos, huecos o cruces entre fuentes.

## Resultado: separar filtro de admisión y selección final

De las **37 cabezas físicamente formadas**:

| Estado de su familia antes del sorteo | Coincidencias |
|---|---:|
| Física, pero **no admitida** por Lalo | **22** |
| Admitida por Lalo, rango **11 o mayor** | **8** |
| Admitida, rango **7–10** | **2** |
| Admitida, rango **4–6** | **4** |
| Admitida, rango **1–3** | **1** |
| **Total con VT3 físico** | **37** |

En los 30 cortes existieron **4.070 exposiciones** de familias VT3 físicamente válidas (familia×PRE) y Lalo admitió **1.504** de ellas. Unas **2.566 exposiciones físicas** quedaron fuera de su ranking; entre ellas están las 22 coincidencias reales no admitidas. Estos son totales de exposición, NO 4070 familias distintas ni 2566 futuras ganadoras.

La ausencia de una familia del ranking oficial significa **falta de traslación/bifurcación respaldada por las raíces históricas que actualmente reconoce el motor D−1/D−7**, no significa que el recorrido no exista físicamente en el PRE. Una figura recién formada en otra columna puede existir y carecer de esos respaldos; eso exige investigación *separada* de ordenar las admitidas.

### Controles neutrales de admisión

Entre las 37 cabezas que sí podían formarse, se observaron **15** cuyas familias estaban admitidas. El valor neutral de referencia, calculado con la fracción de familias admitidas **en cada mismo PRE**, fue **13,89**. Ajustando además por la primera fuente física de la familia, fue **14,07**.

Por tanto **15 observadas vs 14,07 neutrales por fuente** no muestra aquí una separación fuerte entre familia física admitida y no admitida. Son controles descriptivos, con muy pocas coincidencias dependientes entre cortes y criterios previamente explorados: no son pruebas estadísticas concluyentes.

### ¿La bifurcación es realmente un problema?

No podemos concluirlo. Entre las 1.504 exposiciones de familias admitidas:

| Tipo de evidencia de la familia | Familias expuestas | Cabezas físicas coincidentes |
|---|---:|---:|
| **Con raíz histórica y bifurcación** | **473** | **10** |
| **Con raíz histórica, sin bifurcación** | **1.031** | **5** |

Las 15 cabezas admitidas poseían al menos una raíz histórica. Las bifurcadas son 31,4% de las exposiciones pero aportaron 10 de 15 coincidencias. Como control neutral simple, se esperarían **4,57** coincidencias bifurcadas; se observaron **10**.

En el control más estricto, dentro del **mismo PRE**, igualando fuente física original, presencia D−1/D−7, banda de cantidad de caminos físicos y cantidad de fuentes, quedaron **153 estratos** con ambos tipos: las bifurcadas registraron **9 coincidencias frente a 5,61 neutrales**. No prueba causalidad ni independencia; sí debilita la sospecha de que la prioridad a bifurcación sea puramente un error.

## Contrafactual sin introducir candidatos nuevos

Se ordenaron **las mismas familias admitidas** con tres políticas fijas, todas calculadas antes de ver cabezas objetivo:

1. **Lalo actual:** bifurcación primero; después raíces y fuentes.
2. **D−1 primero:** raíz reciente antes de bifurcación.
3. **Raíz total primero:** número de raíces antes de bifurcación.

| Orden de familias ya admitidas | Top3 | Top5 | **Top6** | Top10 |
|---|---:|---:|---:|---:|
| **Lalo oficial** | **1** | **5** | **5** | **7** |
| Priorizar raíces D−1 | 0 | 2 | 3 | 4 |
| Priorizar raíces en general | 0 | 0 | 2 | 3 |

La primera elección de Lalo dentro de las admitidas también fue superior a una referencia neutral: **5 Top6 observadas frente a 1,70 neutrales** al repartir seis puestos entre el conjunto admitido de cada PRE. Es una comparación retrospectiva descriptiva, no prueba de predictibilidad futura.

**Decisión:** NO sustituir el orden oficial por una regla simple de raíces primero; no eliminar ni penalizar bifurcación.

## Casos físicos revisados y explicación de la decisión

### 10/10 Nocturna: **0564**, VT3 **465/564**

- La figura tiene su recorrido físico dentro de la fuente **Nocturna anterior**.
- Familia admitida con una raíz D−7, **dos bifurcaciones**, cuatro bloques físicos; **rango 2 oficial**.
- Al poner D−1 primero se cae al **rango 34**.
- Demuestra un caso donde preservar la prioridad de bifurcación ayudó; cambiarla habría perdido una coincidencia física comprobada.

En esa Nocturna también se formó **2654 → 456/654**, con raíz D−1 y bifurcación, rango 5 oficial. Las familias del turno se evalúan sin incluir los sufijos imposibles.

### 12/10 Nocturna: **1615**, VT3 **516/615**

- Está físicamente formada en las columnas disponibles y fue admitida; Lalo la situó en el **rango 54**.
- Tenía raíz D−7 propia, pero ninguna bifurcación; una sola fuente y un bloque físico.
- Poner raíces primero tampoco la lleva al Top6: queda rango 54. Este caso ejemplifica una familia de raíz real cuya preferencia no alcanza para competir con otras admitidas.

En esa Nocturna también se formó físicamente **7242 → 242/242**, admitida en puesto **25** con raíz D−1 y sin bifurcación. Tampoco subió al Top6 al priorizar raíces.

### 16/10 Matutino: **3253**, VT3 **253/352**

- Ruta física comprobable dentro de **Nocturna anterior**, con raíz D−1.
- Admitida por Lalo en el puesto **45**; sin bifurcación, una fuente y un bloque físico.
- Dar prioridad a D−1 solo la llevó al **puesto 40**, lejos del Top6.
- Geometría Completa la había elegido en **puesto 6**. Los tres hechos son compatibles: la ruta existe, Lalo reconoce una raíz, pero el orden oficial no privilegia esa familia.

### 16/10 Nocturna: **9132 → 132/231** y **5807 → 708/807**

- Ambas familias podían formarse físicamente dentro del PRE de Nocturna.
- Ninguna estaba admitida por Lalo con su traslación o bifurcación verificada bajo la política D−1/D−7.
- La familia **708/807** estaba físicamente disponible en la fuente **Vespertino**, incorporada durante la jornada.
- Reordenar las familias admitidas nunca habría recuperado estas dos; forman parte del problema específico de **admisión**, sin autorización para ascenderlas automáticamente a los Tops.

## Interpretación y próxima hipótesis concreta

El estudio revela que **no existe un único fallo de ranking**:

- **Admisión histórica:** deja fuera muchas familias que igualmente se forman físicamente. Pero incluirlas a todas reduciría drásticamente la discriminación: más de 2.500 exposiciones de familias físicas no admitidas en 30 PRE, para 22 coincidencias verificadas. Por ahora, un nuevo filtro debe justificar su selección contra negativos equivalentes.
- **Ordenamiento de admitidas:** aunque algunas familias ganadoras quedan muy atrás, el criterio de bifurcación superó las dos alteraciones simples ensayadas. En la muestra, parece aportar discriminación real entre candidatas admitidas.
- **Subida de casos aislados:** no se puede convertir 253/352 en nueva regla privilegiada solo porque haya salido. Las mismas condiciones se presentan en numerosas otras familias que no salieron.

El siguiente test **posible con el mismo corto histórico** es examinar la frontera de admisión de figuras físicamente nuevas: distinguir familias que aparecen por primera vez tras incorporar otra columna y carecen de raíces D−1/D−7, y contrastarlas con otras **de la misma fuente y cantidad de recorridos físicos** que tampoco tienen raíces y no salieron. No modificar la admisión oficial hasta hallar una señal replicable. No involucrar ninguna cabeza sin recorrido físico VT3.

## Trazabilidad

- [GitHub Actions aprobado](https://github.com/y0t3/Modelo-Papa/actions/runs/39076253164), reproducido con controles adicionales sobre el mismo corpus en la ejecución definitiva.
- Rama aislada `lab/auditoria-decisiones-vt3-10a16oct2026`.
- `scripts/lab-vt3-decisiones-6-jornadas.ts`: genera 30 PRE con información estrictamente anterior al objetivo, testigos físicos, razones de admisión, alternativas de orden fijas, neutralidad dentro de PRE/fuentes, contraste de bifurcaciones y negativos.
- Artefacto `LAB-DECISIONES-VT3-6-JORNADAS`: JSON `DECISIONES_VT3_ULTIMAS_6_JORNADAS.json`, con detalles y rutas de cada una de las 37 cabezas físicamente posibles, más las familias admitidas ganadoras/no ganadoras.
- No hubo PR ni cambios de motor oficial o APK.
