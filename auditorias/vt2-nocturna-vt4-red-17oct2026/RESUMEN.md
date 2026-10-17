# Continuación VT2 Nocturna y VT4: huellas conectadas y cuarta cifra física

**17/10/2026. Laboratorio histórico en rama aislada.** Motor oficial Lalo, MV1, Geometría Completa, `main` y APK sin modificaciones.

Pruebas y barrido completo **aprobados**: https://github.com/y0t3/Modelo-Papa/actions/runs/39033843230

## Reglas que no se modificaron

- Toda figura de configuración histórica nace exclusivamente de recorridos VT3 de **dos cabezas verdaderamente sorteadas** en una jornada anterior y dentro de **la misma fuente**. Se buscan luego ambos caminos en **una columna actual +11**, sin saltos ni cruces.
- Ningún resultado del corte objetivo entra en la selección PRE. Los 520 cortes son **reconstrucciones históricas** de 104 jornadas, no PRE locales sellados. El 16/10 se analiza aparte y tampoco constituye un sello.
- VT2: los dos segmentos consecutivos de cada madre VT3 física, incluyendo familias reversibles.
- VT4: **cuarta cifra añadida delante** de una madre VT3 física en su orientación directa o inversa. **Nunca invertir las cuatro cifras completas** para crear una madre nueva. La cabeza posterior tiene que coincidir con alguno de los recorridos físicos de cuatro casillas de esa hija.
- Máximo **seis familias por selección**; no comparar un Top6 contra un Top10. En el estudio de VT4 se usa el **mismo conjunto de hijas** y solo se altera su orden.

## VT2 en Nocturna: cuantificar si los lectores se complementan

**104 Nocturnas, 520 cabezas**, entre junio-julio (51 jornadas/255 cabezas) y agosto-octubre (53/265). **420/520** cabezas tenían alguna ruta VT2 en sus columnas PRE; las otras 100 no estaban físicamente disponibles.

| Familias VT2 Top6 | Junio-julio | Agosto-octubre | Total |
|---|---:|---:|---:|
| **Lalo oficial** | 21 | 27 | **48** |
| **Configuraciones Conectadas** | **39** | **31** | **70** |
| Lalo primeras 3 + Conectadas primeras 3 | 26 | **34** | 60 |
| Conectadas primeras 3 + Lalo primeras 3 | 27 | **34** | 61 |
| Lalo primeras 4 + Conectadas primeras 2 | 22 | **34** | 56 |
| Conectadas primeras 4 + Lalo primeras 2 | 28 | 31 | 59 |

Las cuatro combinaciones tienen un orden fijo basado en información del PRE; se rellenan hasta seis familias únicas en caso de solapamiento, siempre sin consultar resultados.

**Desglose de aciertos Top6 por cabeza en el mismo corte:**

| Bloque | Coincidencias en ambos lectores | Solo Lalo | Solo Conectadas |
|---|---:|---:|---:|
| Junio-julio | 7 | 14 | 32 |
| Agosto-octubre | 4 | 23 | 27 |
| **Total** | **11** | **37** | **59** |

**Interpretación:** no siguen los mismos candidatos. Solo comparten once cabezas acertadas; 59 aciertos de Conectadas y 37 del oficial no aparecen en el Top6 del otro. Sin embargo, **ninguna combinación fija de seis familias supera el Top6 conectado en la totalidad**: el mejor híbrido alcanza 61 frente a 70. En el período más reciente, el híbrido 3+3 sí obtuvo **34** frente a 31 de Conectadas y 27 de Lalo, pero es un ajuste retrospectivo entre múltiples variantes, no una regla validada.

El viernes **16/10/2026** aporta un control cronológico adicional, todavía **reconstruido y no sellado**: VT2 Top6 Nocturna, Lalo **1** y Conectadas **1**; no valida la ventaja histórica.

**Conclusión VT2:** conservar Lalo como lector general. Conectadas parece distinguir familias diferentes específicamente en Nocturna, pero el historial ya se ha usado reiteradamente para desarrollar hipótesis. No convertir el 70 vs 48 en garantía predictiva ni en cambio del motor; preservar la regla como **experimento congelado** para pruebas nuevas.

## VT4: priorización de hija que completa la segunda rama

Antes de estudiar este criterio se confirmó la limitación básica:
- **2600** cabezas de cinco jurisdicciones argentinas en 520 PRE.
- **213** podían dibujarse exactamente con cuatro celdas seguidas dentro de una fuente.
- Las **diez madres VT3 de Configuraciones Conectadas** generaban **27** de esas coincidencias VT4 si se consideraban todas las hijas físicas; sin embargo, **solo 3** entraban en el Top6 inicial.

Nueva hipótesis auditada, sin crear candidatas nuevas:

> Si una madre VT3 procede de una configuración histórica formada por dos recorridos conectados, favorecer entre sus hijas VT4 aquellas cuya **casilla añadida** pertenece físicamente a la **otra rama reproducida** en la hoja +11 PRE actual.

Hay dos criterios: `RED_PRIMERO` reordena las hijas de cada madre, sin perder ninguna; `SOLO_HIJAS_RED` restringe exclusivamente a las extensiones así respaldadas. Se conserva el reparto circular, una hija por madre por vuelta.

### Corrección geométrica obligatoria

Una misma VT3 puede encajar en dos configuraciones compuestas con diferentes desplazamientos. La primera ejecución del laboratorio lo detectó y falló a propósito antes de producir resultados. Se corrigió `projectVerifiedConfigurations` para incluir el **desplazamiento actual exacto** `currentOffset`, que identifica la configuración cuya geometría autorizó la madre. El nuevo lector usa únicamente **esa configuración**, nunca una posición parecida seleccionada arbitrariamente. La prueba unitaria comprueba la conexión de la cuarta casilla, orientación reversible de la madre y ausencia de nuevas cifras fabricadas.

### Resultados VT4 (coincidencia exacta, Top de familias)

| Orden de hijas físicas conectadas | Top3 | Top5 | Top6 | Top10 |
|---|---:|---:|---:|---:|
| Original, priorización por cantidad de caminos | **2** | **3** | **3** | **6** |
| Favorecer hijas que completan otra rama | 0 | 1 | **3** | **6** |
| Usar solo hijas cuya cuarta casilla está en otra rama | 0 | 1 | **3** | **6** |

En junio-julio, Top6 de preferencia-red mejoró **1 → 3**; en agosto-octubre empeoró **2 → 0**. La regla no es estable.

Además, en toda la muestra, **solo 7 de las 27** cabezas alcanzables por alguna hija VT4 conectada poseían en esta selección de madres una hija que completaba la otra rama. Las otras 20 requerían una cuarta celda físicamente contigua pero **fuera de esa rama**. En los 520 PRE se generaron de media **51,77 hijas** por corte, frente a **13,46** que cumplían el criterio de rama-compañera.

**Conclusión VT4:** NO adoptar la preferencia de rama ni restringir VT4 solo a configuraciones cerradas. La configuración conectada puede enriquecer la elección de madres y testigos, pero la mayoría de los VT4 físicos aún no se discriminan de manera fiable para un Top6. Respetar estrictamente la madre VT3 y su cifra antepuesta, y registrar ambos caminos, nunca invertir la cuaterna completa.

## Control cronológico adicional del viernes 16/10

Los cinco PRE del 16/10 fueron **reconstruidos históricamente, no sellados**:
- VT2 Top6: Lalo **4**, Geometría derivada **1**, Conectadas **1** sobre 25 cabezas.
- VT2 Nocturna: **1** Lalo y **1** Conectadas.
- VT4: **0 cabezas** podían formarse físicamente a cuatro casillas; todos los Tops dieron cero.

Esto no prueba que un método vaya a ganar ni que otro haya fallado definitivamente; impide presentar la ventaja retrospectiva como confirmación externa.

## Archivo y decisión

- [GitHub Actions aprobado, 520 PRE y control de 16/10](https://github.com/y0t3/Modelo-Papa/actions/runs/39033843230).
- `scripts/lab-figuras-comprobadas-a-pre.ts`: comparadores VT2 Nocturna, cuatro mezclas fijas y reglas VT4.
- `scripts/lab-vt4-hija-red.ts`: prueba física de la cuarta cifra dentro de la otra rama.
- `scripts/test-lab-vt4-hija-red.ts`: rechazo de desplazamientos físicos ambiguos/inexistentes y garantía de no agregar hijas.
- `scripts/lab-conectadas-derivaciones-vt2-vt4.ts`: definición idéntica de derivaciones para madres de Geometría y de Configuraciones.
- `scripts/lab-vt3-configuraciones-conectadas.ts`: identificación `currentOffset` para asociar madre y configuración realmente proyectada.
- Artefacto `LAB-CONFIGURACIONES-VT2-VT4-520` con reconstrucciones completas **520** y **525** (al incluir 16/10).
- Rama aislada: `lab/conectadas-vt2-vt4-17oct2026`. **Sin cambios de app ni APK**.

**Decisión:** ninguna nueva prioridad VT4 supera de forma consistente al criterio anterior. Para VT2 Nocturna, conservar la divergencia comprobable entre Lalo y Conectadas como hipótesis de selección para prueba independiente, no como sustitución automática del motor actual.
