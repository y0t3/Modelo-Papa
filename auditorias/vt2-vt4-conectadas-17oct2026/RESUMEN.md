# VT2 y VT4 derivados de Configuraciones Conectadas: comparación histórica

**Laboratorio 17/10/2026 — reglas del Modelo Lalo MV1, Geometría Completa y APK intactas.**

**Ejecución completa con pruebas aprobadas:** https://github.com/y0t3/Modelo-Papa/actions/runs/39032341823

## Pregunta

Comprobar si la hipótesis **dos recorridos VT3 ganadores conectados en una misma fuente histórica → reproducción de esa configuración en otra columna +11 PRE → lectura de nuevas cifras** permite mejorar la selección de **VT2** y **VT4** respecto del motor actual y de una versión geométrica comparable.

Las configuraciones históricas solo nacen de **dos cabezas reales independientes** que dejaron caminos VT3 físicamente conectados, nunca de candidatos arbitrarios.

El objetivo real de cada corte permanece oculto al crear los candidatos. Todos los recorridos usan casillas contiguas dentro de una sola columna, sin saltos ni cruces de columnas. Las raíces históricas mantienen fecha, turno, fuente y cabezas completas.

## Comparación justa y definición de cada lector

- **LALO:** usa sin cambios `buildMotorLalo(...).ranks.vt2/vt4`, cuyo VT4 sale físicamente de las madres VT3 y se distribuye por madre.
- **GEOMETRIA_DERIVADA:** **no existía como motor independiente VT2/VT4**. Para poder compararla se toman **sus diez primeras madres VT3** del motor Geometría Completa y se aplican las **mismas reglas de derivación** que al lector nuevo.
- **CONECTADAS_DERIVADA:** toma las primeras **diez madres VT3** de la configuración conectada solapada y trasladada a **otra fuente**, la variante que había obtenido 20 Top3 / 47 Top6 en las pruebas VT3.
- Para **VT2**: cada terna física VT3 madre puede producir sus dos pares consecutivos, agrupados en familias reversibles (los sentidos inversos son la misma familia). **VT2 también cuenta como acierto cuando coincide solo el sufijo de dos cifras de una cabeza**.
- Para **VT4**: una nueva casilla debe tocar físicamente la primera celda de la madre; se **antepone** esa cifra a la terna VT3 en su sentido directo o inverso. Función oficial `vt4PrefixFamily`. **Jamás invertir un VT4 completo para crear otra madre**. Al evaluar, la cabeza de cuatro cifras debe coincidir exactamente con **uno de los recorridos físicos** de esa familia hija.
- En ambos derivados, se preserva el orden de las madres y se reparte VT4 **una hija por madre por vuelta**, no diez hijas de la primera madre. No se usa una hija sin su testigo físico.
- Top3/Top5/Top6/Top10 son cortes del mismo ordenamiento previo, **no elecciones optimizadas observando los sorteos**. El límite de seis es el principal criterio comparativo.

## Muestra

- **104 jornadas**, **520 PRE** (255 junio-julio; 265 agosto-octubre), **2600 cabezas argentinas**, cinco turnos por jornada, más Montevideo únicamente como fuente de +11 real.
- Se conservaron controles de días parciales y **dos cortes sin VT3 físico**.
- **1546/2600** cabezas tenían alguna ruta de **dos** casillas en la hoja predictiva antes del sorteo.
- **213/2600** tenían alguna ruta exacta de **cuatro** casillas consecutivas dentro de una sola fuente; **8,19%** del total. Estas 213 son un techo físico de cobertura para estrategias VT4 **exclusivamente físicas**. No son 213 predicciones ganadoras ni prueba de que cualquier ranking pueda encontrarlas.
- Las comparaciones de las tres modalidades se hacen sobre los **mismos 520 PRE**.

## Resultado VT2: familias de dos cifras

| Lector | Top3 | Top5 | **Top6** | Top10 |
|---|---:|---:|---:|---:|
| **Modelo Lalo actual** | **165** | **262** | **307** | **508** |
| Geometría derivada | 142 | 236 | 289 | 453 |
| Configuraciones Conectadas derivada | 143 | 235 | 299 | 499 |

**Resultado general:** el oficial sigue mejor en todas las profundidades de ranking. Como VT2 tiene muy alta cobertura física, cada coincidencia se interpreta como coincidencia de sufijo de dos cifras, nunca como un 4 cifras ni como ganancia económica.

Separación temporal:

| VT2 Top6 | Lalo | Geometría derivada | Conectadas |
|---|---:|---:|---:|
| Junio-julio | 150 | 139 | **157** |
| Agosto-octubre | **157** | 150 | 142 |
| Total | **307** | 289 | 299 |

**Sin mejora estable del lector VT2 completo:** su ventaja de junio desaparece en agosto-octubre.

### Excepción que merece investigación: VT2 Nocturna

| Nocturna VT2 Top6 | Lalo | Geometría derivada | Conectadas |
|---|---:|---:|---:|
| Junio-julio (51 cortes, 255 cabezas) | 21 | 22 | **39** |
| Agosto-octubre (53 cortes, 265 cabezas) | 27 | 28 | **31** |
| **Total (104 cortes, 520 cabezas)** | 48 | 50 | **70** |

La diferencia conectadas-vs-oficial es **+22** en Nocturna, con seis familias en ambos motores y **420/520** cabezas Nocturnas que tenían algún VT2 físico disponible. **Ambos períodos mantienen signo positivo**, pero gran parte del salto procede de junio-julio. Es hallazgo exploratorio elegido tras examinar los turnos, no validación ciega. El viernes 16/10 dio empate **1-1** de VT2 Nocturno en Top6.

No aplicar una sustitución general de VT2 ni permitir que la ventaja parcial se convierta en una regla sin controles nuevos.

## Resultado VT4: cuatro cifras exactas, SOLO recorridos físicos

| Lector | Top3 | Top5 | **Top6** | Top10 | Acertadas en TODAS sus hijas físicas |
|---|---:|---:|---:|---:|---:|
| Modelo Lalo | 0 | **4** | **4** | 5 | 17 |
| Geometría derivada | 2 | 3 | 3 | 5 | 11 |
| Configuraciones Conectadas derivada | 2 | 3 | 3 | **6** | **27** |

- En junio-julio: VT4 Top6 fue Lalo **0**, Geometría **1**, Conectadas **1**.
- En agosto-octubre: Lalo **4**, Geometría **2**, Conectadas **2**.
- Las **27** cabezas detectadas entre *todas las extensiones físicas* de las diez madres conectadas, frente a las **17** del oficial, sugieren **mayor cobertura de madres VT3**; pero Conectadas genera en promedio **51,8** hijas por PRE frente a **46,9** de Lalo y **45,3** del derivado geométrico. No son universos de propuestas igual de amplios. El Top6 real NO mejora: queda 3 vs 4.
- **186 de las 213** cabezas VT4 físicamente posibles **no** coincidieron con ninguna de las hijas generadas a partir de las diez primeras madres conectadas (213−27); **24 de las 27** encontradas en el conjunto completo quedaron fuera del Top6 de ese lector. Esto separa dos dificultades: **seleccionar buenas madres VT3** y **seleccionar cuáles hijas VT4 merecen los primeros seis puestos**.
- No hubo generación aleatoria de cuarta cifra `0–9` ni se admitió un VT4 cuya cuarta cifra no tenga soporte físico. Un estudio de cuarta cifra sin recorrido exigiría **otro protocolo separado**, sin falsear un testigo físico.

## Revisión histórica adicional del viernes 16/10/2026

**No fue un PRE prospectivo sellado**: los cinco cortes se reconstruyeron con cabezas ya conocidas, pero la selección se hizo sin pasarlas al lector del objetivo y **sin cambiar la regla después de observar resultados**.

| Métrica sobre 25 cabezas | Lalo | Geometría derivada | Conectadas |
|---|---:|---:|---:|
| VT2 Top3 | **2** | 1 | 1 |
| VT2 Top6 | **4** | 1 | 1 |
| VT4 Top6 | 0 | 0 | 0 |

El 16/10 hubo **17/25** cabezas con alguna ruta VT2 física y **0/25** con un VT4 físico completo. Por lo tanto, el cero VT4 de todos los modelos es atribuible también al **techo geométrico de ese día**: no podía darse un acierto VT4 físico exacto. En VT2 Nocturna, tanto Lalo como Conectadas obtuvieron una coincidencia Top6, sin demostrar ventaja nueva.

El día 16 ya había sido revisado previamente, por lo que tampoco es un conjunto independiente verdaderamente ciego.

## Qué haría y qué NO haría

1. **Mantener VT2 oficial de Lalo** como lector general: mejor que el nuevo en Top3/5/6/10 totales.
2. Conservar como **hipótesis experimental Nocturna VT2** la lectura conectada. La diferencia 70 contra 48 en Top6 es más interesante y consistente en signo que la mejora global, pero requiere controles con historia no reutilizada antes de incorporar cualquier excepción por turno.
3. **No sustituir VT4**. Aunque las madres conectadas cubren 27 cabezas exactas al explorar todas sus hijas frente a 17 oficiales, sus primeras seis aciertan **3 frente a 4**. Estudiar por separado la **priorización física de hijas dentro de cada madre** y luego contrastar con negativas semejantes, sin invertir la cuaterna ni forzar huecos.
4. Separar datos retrospectivos de predicciones realmente selladas, sin entregar cifras históricas POST al algoritmo PRE.
5. No modificar MV1 congelado, el motor oficial, la APK ni `main`.

## Archivos y ejecución

- [GitHub Actions final aprobada](https://github.com/y0t3/Modelo-Papa/actions/runs/39032341823), TypeScript + pruebas VT2/VT4 + configuración conectada + 520 PRE y 5 cortes históricos adicionales de 16/10.
- Rama `lab/conectadas-vt2-vt4-17oct2026`.
- `scripts/lab-conectadas-derivaciones-vt2-vt4.ts`: generador físico compartido para Geometría y Conectadas con la regla original VT4.
- `scripts/test-lab-conectadas-vt2-vt4.ts`: prueba madre 226/622, hijos válidos 3226/3622, nunca 6223.
- `scripts/lab-figuras-comprobadas-a-pre.ts`: comparación auditada y logs `LAB_CONECTADAS_VT2_VT4`.
- Artefacto `LAB-CONFIGURACIONES-VT2-VT4-520`: JSON con los **520 PRE** y, separado, el JSON con **525 cortes** incluyendo el 16/10; incluye tops y cabezas físicas, testigos positivos y negativos.
