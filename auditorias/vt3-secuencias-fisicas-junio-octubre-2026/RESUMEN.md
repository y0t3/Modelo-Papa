# Secuencias físicas VT3: nacimiento, refuerzo y permanencia — junio a octubre 2026

**Laboratorio concluido el 16/10/2026. Rama experimental, sin fusionar; APK Modelo Lalo 0.3.5 y motores `src/motorLalo.ts` y `src/vt3Shadow.ts` intactos.**

## Objetivo

No premiar una cifra por tener más rutas. Registrar **cuándo y cómo se mueve físicamente una familia reversible VT3** a medida que aparecen las cinco fuentes: Nocturna anterior, Previa, Primera, Matutino y Vespertino. Cada fuente admite caminos contiguos de tres casillas **dentro de sus dos columnas del +11**, sin saltos ni cruces. Se comprueba que los recorridos de una fuente ya publicada **no muten** al sumar otras.

Definiciones **antes de evaluar el sorteo objetivo**:
- **BASE_NOCTURNA**: familia físicamente presente desde el corte PRE de Previa.
- **NUEVA_FAMILIA**: familia ausente de todas las fuentes previas y físicamente disponible por primera vez en la columna recién publicada (no basta cambiar de testigo).
- **REFUERZO_NUEVA_FUENTE**: familia que ya existía y aparece en otra fuente recién publicada, conservando la integridad de las rutas anteriores.
- **SIN_CAMBIO**: familia que continúa físicamente disponible pero no recibe un nuevo recorrido de la columna incorporada.

El efecto se evalúa en el sorteo **siguiente** al corte PRE. Una familia de Previa que apareció antes de Primera y acertó en Matutino cuenta como **SIN_CAMBIO** antes de Matutino, aunque su columna original haya nacido ese mismo día. Eso evita atribuir el resultado a un movimiento que todavía no sucedió.

## Datos y controles

- **104 jornadas, 520 cortes PRE, 2600 cabezas** (junio-julio, 51 jornadas/255 cortes/1275 cabezas; del 15/08 al 15/10, 53 jornadas/265 cortes/1325 cabezas).
- **660** cabezas ganadoras tenían su familia VT3 físicamente presente al momento PRE (**326** junio-julio y **334** agosto-octubre).
- Se excluyeron expresamente **20/06/2026 y 09/07/2026**: figuran como días sin sorteos en los calendarios históricos disponibles, aunque un proveedor agregado puede devolver cabezas para esas fechas. Es esencial no arrastrarlas como Nocturna anterior ni D−7. Referencias: https://cas.gob.ar/?juego=quiniela y https://m.ruta1000.com.ar/index2008.php/sorteos/sorteos/index2008.php?FechaAlMinuto=2026_06_20 .
- El JSON registra cada fecha usada y un **SHA-256 de los resultados descargados**, para detectar cambios del agregado histórico.
- **Sin fuga del objetivo**: se reconstruye cada PRE con cabezas exclusivamente de columnas publicadas antes del turno. La coincidencia de las cabezas reales se incorpora **después** de generar estado, raíces y Top3.
- Se reproducen los motores oficiales y el lector Geometría completa sin modificaciones. La reconstrucción supervisa para cada familia que **todas las rutas de todas sus columnas anteriores se mantengan idénticas** entre cortes.
- Montevideo alimenta la hoja según disponibilidad, pero no se contabiliza entre las cinco jurisdicciones de cabezas objetivo.

## Estado de las familias al momento del corte

Una **exposición de familia** significa familia en un corte PRE, no familia única del período. Los aciertos corresponden a cabezas por corte; varios turnos del mismo día comparten historia.

| Estado físico PRE | Exposiciones de familia | Cabezas ganadoras VT3 |
|---|---:|---:|
| Desde la Nocturna anterior, en Previa | 5916 | **50** |
| **Nace** en la columna incorporada | **15.684** | **144** |
| Ya existía y **suma nueva fuente** | **4843** | **42** |
| **Permanece** sin otra fuente nueva | **44.200** | **424** |
| **Total** | **70.643** | **660** |

El 20% aproximado de los aciertos físicamente posibles fueron nacimientos del momento, pero muchas otras familias acertaron después de uno o varios turnos sin movimientos adicionales: **no se debe equiparar «candidata que sale» con «figura que acaba de nacer»**.

### Primera fuente de origen, independiente del movimiento de ese corte

| Origen físico de familia | Aciertos trazables | En Top3 de Geometría completa |
|---|---:|---:|
| **Nocturna anterior** | 274 | **17** |
| **Alguna columna intradía** | **386** | **0** |

**Hallazgo principal:** Geometría completa acertó **17 cabezas VT3 Top3**, las 17 correspondientes a familias originadas en Nocturna anterior, **aunque 386 de las 660 cabezas físicamente trazables** provenían de familias que nacieron durante la jornada.

No hubo una prohibición explícita: Geometría eligió **110 puestos** de Top3 con familias nacidas intradía, entre 1560 puestos disponibles en 520 cortes; simplemente ninguno coincidió. Los otros 1450 puestos del Top3 fueron familias originadas en Nocturna.

Reparto por edad intradía de la familia (0 = primer corte donde nace):
- Edad **0**: 15.684 exposiciones, **144** cabezas ganadoras, **48** puestos Top3, **0** aciertos Top3.
- Edad **1 turno**: 12.736 exposiciones, **125** cabezas, **49** puestos Top3, **0** aciertos Top3.
- Edad **2 turnos**: 8310 exposiciones, **70** cabezas, **7** puestos Top3, **0** aciertos.
- Edad **3 turnos**: 4333 exposiciones, **47** cabezas, **6** puestos Top3, **0** aciertos.

Son números descriptivos retrospectivos, no prueba de que introducir familias intradía como regla garantice recuperar alguna cabeza.

## ¿El refuerzo entre columnas predice algo por sí solo?

Comparación neutral **dentro del mismo PRE, fuente de nacimiento y banda de número de caminos físicos** (1–2, 3–5, 6–12, 13+):

| Bloque temporal | Coincidencias reforzadas observadas | Expectativa neutral comparable |
|---|---:|---:|
| Junio–julio | **17** | **19,45** |
| Agosto–octubre | **25** | **23,71** |
| **Total** | **42** | **43,16** |

Sin ventaja estable por refuerzo; el efecto cambia de signo entre bloques. Para las familias **recién nacidas**, el control emparejado por primera fuente no puede estimar una diferencia: al incorporarse una fuente, **todas** las familias de ese mismo origen son nacimientos. Por eso no presentamos la expectativa trivial igual a la observación como validación.

Las raíces históricas D−1 y D−7 se relacionaron por **forma y fuente** únicamente como contexto. No convierten dos cabezas de cifras distintas en dos confirmaciones de una familia numérica; tampoco los múltiples caminos de una cabeza representan observaciones independientes.

## Ejemplo auditable: 08/09, familia 678/876

Esta familia **no estaba** en Nocturna anterior en la PRE de Previa.

- **Antes de Primera**: nace físicamente en **Previa**, recorrido `0:1 → 1:1 → 1:0`, lectura **876**.
- **Antes de Matutino**: sigue con el mismo recorrido, **sin respaldo nuevo**. Después de ese corte la cabeza ganadora de una jurisdicción fue **9876**. No es correcto atribuir su coincidencia a la columna Matutino, que todavía no existía en ese PRE.
- **Antes de Vespertino**: ahora sí recibe otros **tres recorridos físicos** provenientes de **Matutino**, con lecturas **678/876**.
- **Antes de Nocturno**: conserva sus rutas, sin incorporación adicional.

El artefacto conserva **todas las rutas y cifras por casilla** de este y otros casos. Se registraron **1002 historias visuales** (familias ganadoras y testigos Top3 por jornada) con cinco fotogramas cada una, sin fabricar recorridos nuevos ni mostrar futuras columnas prematuramente.

## Conclusión práctica

1. **No sustituir motores ni modificar MV1 o APK 0.3.5.** Una debilidad descriptiva del ranking no proporciona un criterio alternativo predictivo validado.
2. En la hoja visual, **mostrar origen, nacimiento y refuerzos por fuente**, con los caminos reales simultáneos. Una familia puede acertar sin haber recibido apoyo en el turno inmediatamente anterior.
3. No premiar el número bruto de recorridos o fuentes ni insistir en D−7 como filtro único: ambos controles históricos fueron poco discriminantes.
4. El siguiente laboratorio, si se desea, debería usar estos fotogramas para buscar **secuencias de nacimiento→persistencia→refuerzo** previamente definidas y contrastarlas con negativas de igual origen, antigüedad y cantidad de caminos. No seleccionar reglas después de ver las coincidencias.
5. **Retrospectivo, no prospectivo:** las fechas y cabezas históricas se descargaron posteriormente. El proveedor pudo completar o cambiar cifras con el tiempo; por eso el listado y hashes quedan archivados. Los 520 cortes no son 520 experimentos independientes de azar.

## Reproducción

- GitHub Actions: https://github.com/y0t3/Modelo-Papa/actions/runs/38863258376
- Código de laboratorio: `scripts/lab-vt3-secuencias-movimiento.ts`.
- Rama: `lab/vt3-secuencias-columnas-510-16oct2026`.
- Artefacto: `LAB-VT3-SECUENCIAS-JUN-OCT-2026`, archivo `VT3_MOVIMIENTOS_COLUMNAS_JUN_OCT_2026.json`, con 520 cortes, 70.643 exposiciones de familia, 1002 secuencias físicas completas y SHA de cada fecha.

**La coincidencia de VT3 no es acierto exacto de VT4 y no estima probabilidades de acertar apuestas futuras.**
