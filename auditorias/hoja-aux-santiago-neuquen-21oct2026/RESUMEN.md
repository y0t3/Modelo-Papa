# Segunda hoja del padre — Santiago + Neuquén, sin +11

**Laboratorio independiente:** `lab/hoja-auxiliar-santiago-neuquen-21oct2026`, creado el 21/10/2026. Sin cambios en main, MV1 congelado ni motor predictivo oficial.

## El procedimiento reconstruido

La hoja auxiliar es una cuadrícula **2 filas × 12 columnas de cifras**: cada turno contiene dos cabezas de 4 cifras, fila de arriba Santiago y de abajo Neuquén; tres bloques de 4 posiciones por turno: Previa / Primera / Matutino.

A diferencia del tablero principal **+11**, **se permite cruzar de un turno al siguiente** dentro de la hoja auxiliar. Para todo recorrido se exige **contacto físico directo** (vertical, horizontal, diagonal), sin saltos ni celdas reutilizadas. Las franjas de turno están adyacentes: las celdas 4 y 5 pueden tocarse por borde o diagonal. Las celdas ausentes no pueden usarse, ni desplazarse para tapar huecos.

Los tableros se forman con resultados **RAW**, cero +11.

### Cierres PRE

| Objetivo | Columnas conocidas del tablero auxiliar |
|---|---|
| Previa | Ninguna |
| Primera | Solo Previa |
| Matutino | Previa y Primera |
| Vespertino | Previa, Primera, Matutino |
| Nocturno | Previa, Primera, Matutino |

El input de la hoja viene exclusivamente de **cabezas publicadas de Santiago y Neuquén**. Tras cada sorteo de destino, los trazos de las **cabezas de las seis jurisdicciones originales** (Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos, Montevideo) se marcan POST por sus sufijos EXACTOS, sin inventar un ganador por inversión. Al consultar candidaturas, sí pueden estudiarse las familias VT2/VT3 reversibles, sin invertir VT4 completo.

### Particularidad histórica de Santiago y protección anticontaminación

El proveedor usado por la app devuelve Santiago como ID **10** y Neuquén como ID **11**. La fuente JSON no usa exactamente la misma correspondencia `momento_1` / `momento_2` para Santiago que para Ciudad o Neuquén. Se contrastaron las cabezas de Santiago con las fechas de 13/10 y 20/10 en la fuente externa `nacionalquiniela.com`:

- Santiago 20/10: Previa **8067** y Matutino **6142**, sin Primera; el proveedor tiene `momento_5=8067`, `momento_1=6142`, `momento_2=9634` (que es Vespertino, **no Matutino**).
- Neuquén 20/10: Previa **0469**, Primera **0245**, Matutino **0210**; el proveedor sigue la secuencia ordinaria `momento_5`, `momento_1`, `momento_2`.
- Santiago 13/10: Previa 7796 y Matutino 1195, que confirman el mismo desplazamiento de etiquetas.

**Regla de no fuga:** la Primera de Santiago aparece vacía `----`. No se coloca la Matutina 6142 en Primera; tampoco se usa la Vespertina 9634 en Matutino porque eso daría información futura. La fila Neuquén puede conectar físicamente los tramos separados por un hueco de Santiago, si toca celda por celda. Si el padre usa una convención distinta al registrar manualmente la segunda hoja, deberá contrastarse con el cuaderno antes de homologar la app.

Fuente externa de Santiago 20/10: https://www.nacionalquiniela.com/quiniela-santiago-del-estero.php?del-dia=2026-10-20

Fuente externa de Santiago 13/10: https://www.nacionalquiniela.com/quiniela-santiago-del-estero.php?del-dia=2026-10-13

Fuente externa de Neuquén 20/10: https://www.nacionalquiniela.com/quiniela-neuquen.php?del-dia=2026-10-20

## La hoja real del 20/10

| Fila | Previa | Primera | Matutino |
|---|---|---|---|
| Santiago | **8067** | **----** | **6142** |
| Neuquén | **0469** | **0245** | **0210** |

Antes de Primera hay 8 celdas llenas. Antes de Matutino hay 12; antes de Vespertino y Nocturno hay 20 (quedan cuatro vacías en Santiago Primera). La capacidad máxima cuando existan los seis resultados de entrada sería de 24 celdas.

## Implementación en GitHub

- `src/auxSantiagoNeuquen.ts` grilla continua, generador de caminos físicos VT2/VT3/VT4, familias reversibles VT2/VT3, no se reutilizan celdas, soporte de huecos y PRE.
- `src/auxSantiagoSource.ts` adaptador exclusivo para datos históricos de las dos jurisdicciones, sin modificar `src/cabezas.ts` de producción.
- `src/ui/AuxiliarySheetPanel.tsx`: visualización con casilleros, colores de modo, selección VT2/VT3/VT4, consulta de familias Top6 o ingreso manual, resalte simultáneo de todos sus recorridos, y marcado de cabezas publicadas por sufijo exacto.
- En la **rama del laboratorio**, se incorporó pestaña `AUX` a `App.tsx`, ampliación por pellizco y turno seleccionable. NO existe todavía una APK de producción actualizada: cualquier paquete exige construir desde esta rama experimental.
- `scripts/lab-aux-geometria-test.ts`: 14 casos de regresión de rutas horizontales/diagonales entre turnos, faltantes, control de PRE y prohibición de saltear/reutilizar.
- `scripts/lab-aux-cotejo-2026.ts`: cotejo físico reconstruido **12–20 octubre 2026**, separa familias físicamente formables y las realmente seleccionadas por MV1, utilizando la misma fuente de resultados de la app.

## Ampliación posterior del cotejo: 1 de septiembre a 20 de octubre

Tras mantener intactas las definiciones físicas y el control PRE, extendimos la reconstrucción a **43 jornadas** (26 septiembre + 17 octubre), **215 cortes PRE** y **1.152 cabezas** de las seis jurisdicciones de destino. Se descargaron las fuentes de la app y del tablero auxiliar desde 20/08 como preparación histórica; errores de descarga: **cero**.

### Cobertura real y comparación por modalidad

| Modalidad física | Hoja +11 | Hoja auxiliar exacta | Unión de ambas | Nuevas cabezas de la auxiliar |
|---|---:|---:|---:|---:|
| VT2 | 703 | 316 | **794** | **+91** |
| VT3 | 294 | 95 | **361** | **+67** |
| VT4 (4 cifras exactas) | 93 | 25 | **116** | **+23** |

Sobre 1.152 cabezas, la cobertura física de VT3 pasa de 25,52% en +11 a **31,34% en la unión**. El 5,82% adicional del total proviene de cabezas que se forman solo en la hoja auxiliar. No se trata de acertar un pronóstico sellado: **la cobertura es un cotejo retrospectivo de cabeza observada frente a una geometría PRE**.

Detalle VT3 sobre cabezas observadas:

| Situación | 1–30 septiembre | 1–20 octubre | Total |
|---|---:|---:|---:|
| Ambas hojas | 21 | 7 | **28** |
| Solo +11 | 163 | 103 | **266** |
| Solo auxiliar | 36 | 31 | **67** |
| Ninguna | 478 | 313 | **791** |
| Total | 698 | 454 | **1.152** |

**Cruces físicos reales:** 12 cabezas VT3 se pudieron trazar exactamente en la auxiliar mediante al menos un recorrido que cruzaba el límite de turnos; en VT4 hubo cinco cabezas con algún cruce exacto. Es evidencia de funcionamiento de la geometría, no de capacidad predictiva.

### Contraste contra los candidatos ya seleccionados por Lalo

En los 215 cortes evaluados hubo **1.284 apariciones de familias Top6 VT3** de Lalo (no 1.284 familias diferentes). De esas:

- **90** tenían además formación física en la hoja auxiliar, y esas apariciones tuvieron **1** cabeza ganadora.
- **1.194** no tenían formación auxiliar, y esas apariciones tuvieron **16** cabezas ganadoras.

La comparación es exploratoria, con exposición y composición heterogénea. **No aparece una ventaja estable de la doble formación para las familias ya admitidas en Top6**. Tampoco hay fundamento para penalizarlas: el motor oficial selecciona previamente por otra mecánica y los grupos son muy diferentes.

Conclusión de la ampliación: la hoja auxiliar **sí recupera resultados geométricos que +11 no explica**; el refuerzo predictivo de los Tops de Lalo todavía **no está validado**.

Ejecución ampliada: https://github.com/y0t3/Modelo-Papa/actions/runs/39643078874

---

## Primera prueba histórica

**Corte inicial preservado (subconjunto de la ampliación).** Ocho jornadas con sorteos (12, 13, 14, 15, 16, 17, 19 y 20 de octubre), **40 cortes PRE** y **213 cabezas publicadas en las seis jurisdicciones originales**.

### Cobertura física VT3 de las cabezas salidas, por familia reversible

| Relación con tableros | Cabezas |
|---|---:|
| Disponible en ambas hojas | **2** |
| Disponible solamente en +11 | **53** |
| Disponible solamente en hoja auxiliar | **9** |
| En ninguna | **149** |
| Total | **213** |

La unión de ambas hojas explica físicamente **64 de 213** cabezas como VT3, comparado con **55** de la hoja +11 sola. Es ganancia **de cobertura física POST**, no evidencia de precisión prospectiva.

Otros controles:

| Tipo | +11 (exacto) | Auxiliar (exacto) | Unión exacta |
|---|---:|---:|---:|
| VT2 | 134 | 54 | **142** |
| VT3 | 55 | 11 | **64** |
| VT4 | 16 | 1 | **17** |

El informe conserva los recorridos físicos correspondientes; los 11 VT3 de auxiliar incluyen 2 presentes también en +11, por eso la unión añade 9.

### Turnos del 20/10 y crecimiento

| Corte PRE | Celdas llenas auxiliar | Familias VT3 auxiliares | Familias VT3 con recorrido cruzando turnos |
|---|---:|---:|---:|
| Previa | 0 | 0 | 0 |
| Primera | 8 | 28 | 0 |
| Matutino | 12 | 37 | 7 |
| Vespertino | 20 | 76 | 16 |
| Nocturno | 20 | 76 | 16 |

La cantidad de familias crece cuando se agrega una franja real, y se mantiene desde Matutino hasta Nocturno; para el último corte el +11 continúa acumulando nuevas fuentes propias.

### Cabezas rescatadas por la auxiliar el 20/10

1. **Vespertino, Entre Ríos: 4066**, VT3 `066/660`. No tiene camino VT3 en +11 y sí **dos caminos exactos `066` en Previa auxiliar**; además tiene camino VT4 exacto `4066`.
2. **Nocturno, Ciudad: 2697**, VT3 `697/796`. No tiene camino VT3 en +11 y sí **dos caminos exactos `697` en Previa auxiliar**.

Esas formaciones no exigen forzar un cruce; pueden darse dentro de una franja. Los cruces entre turnos están permitidos y fueron efectivamente detectados por el motor. Existe al menos una cabeza ganadora VT3 auxiliada por recorrido cruzado en el 17/10. **Caso comprobado**: Matutino de Ciudad, cabeza **7016**, VT3 exacto **016**; camino `Neuquén Primera posición 1 (0) → Neuquén Previa posición 4 (1) → Santiago Previa posición 3 (6)`. Coordenadas absolutas `(1,4)→(1,3)→(0,2)`, tomando filas 0=Santiago, 1=Neuquén y columnas desde 0. El camino atraviesa Primera→Previa por contacto horizontal, luego una diagonal contigua. No salta ni reutiliza celdas.

El caso `8568` (Santa Fe Primera) **NO** recibe refuerzo auxiliar al corte PRE Primera: antes de ese sorteo solo están habilitadas las cabezas auxiliares de Previa. Este no-acierto del respaldo es parte del balance y no se debe reinterpretar una vez vistas las columnas posteriores.

### ¿La hoja auxiliar mejora el Top6 de Lalo?

En 40 cortes, **12 de 240 apariciones de familias Top6 de Lalo** tenían también testigos geométricos en la auxiliar. De esas 12 apariciones no se registró una cabeza ganadora; las restantes tuvieron cinco. El grupo de prueba es pequeño y elegido retrospectivamente; **no autoriza ni priorizar ni penalizar familias por la presencia de un testigo auxiliar**.

Interpretación: confirma la utilidad de la segunda hoja para explicar visualmente nuevas cabezas, pero **no demuestra por ahora mejor selección anticipada**. No se modificaron los Top oficiales, la lógica MV1 ni la generación VT4.

## Próximos controles

1. Contrastar con el cuaderno del padre el caso del **turno Primera de Santiago ausente**: ¿la deja en blanco como la fuente externa, o emplea otra convención de columnas?
2. Ampliar sin tocar reglas a otros períodos, conservando el corte PRE correcto y sólo jornadas previas.
3. Separar la mera disponibilidad física de cada familia de un **recorrido auxiliar previamente ganador marcado**. Evitar que una familia con cien rutas en una misma cuadrícula adquiera artificialmente cien apoyos históricos.
4. Comparar candidaturas respaldadas por ambos tableros contra candidaturas solo auxiliares, por corte sellado, con controles aleatorios de igual tamaño y sin análisis post hoc.

## Estado final

La nueva hoja y una **vista experimental en la app** están implementadas en una rama separada. Queda por demostrar si aportan selección predictiva. **Modelo Lalo MV1 permanece intacto.**
