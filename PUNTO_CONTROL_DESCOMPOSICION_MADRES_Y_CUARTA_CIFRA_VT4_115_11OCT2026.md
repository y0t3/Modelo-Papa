# Modelo Papá — prueba por etapas de la selección de madres VT3 y cuarta cifra VT4

**11 de octubre de 2026.** Rama `auditoria-sorteo-10oct-2026`. Ensayo RETROSPECTIVO/EXPLORATORIO, **no** predicción validada. No se cambió `main`, la app, los motores de producción ni el marcado +11.

## Insumos y condición PRE/POST

Mismas **23 jornadas / 115 cortes** (70 septiembre + 45 octubre 2026), usando únicamente las cinco jurisdicciones argentinas objetivo y manteniendo las seis filas del tablero +11. La selección de madres y el ranking del dígito son exactamente los del PRE congelado de las dos pruebas anteriores, no una regla ajustada por los resultados:
- PRE madres/grupos: SHA256 `cd9bd6b09e9508219d16b7100830153ecba113a10f3936d65124cb2bdd92cc05`.
- PRE ranking de madres: SHA256 `790e88be4439d31ee60f92b9a5a9cf8b85335a1165c05fb7631b9a166587674b`.
- POST aislado para evaluación.

**Top3/5/10:** número de grupos madre VT3 (una madre por puesto); cada madre+dígito produce hasta dos hijas orientadas y sus inversas, i.e. hasta cuatro lecturas. No confundir con un Top10 de diez números individuales.

## Descomposición del fracaso por etapas: Top10 madres

En **36/115** cortes había alguna coincidencia si se usaban TODAS las madres VT3 D−7 y los diez dígitos por cada madre (techo de búsqueda retrospectivo, gran bolsa numérica). Al conservar solo las **10 madres mejor clasificadas**, quedaban **17/115** (19 cortes perdidos por orden/presupuesto materno). Al elegir además **una sola cifra por roce** para cada madre, quedaban **3/115** (14 cortes perdidos en la cifra). En los restantes **79/115** no existió coincidencia aun con todas las madres y cifras de ese universo.

El contraste de ordenar madres contra seleccionar madres aleatorias de igual cantidad, admitiendo los 10 dígitos (para aislar orden materno), dio:

| Presupuesto de madres | Observado | Esperanza exacta de madres al azar | Cola descriptiva (10k permutaciones día) |
|---|---:|---:|---:|
| 3 | 7 | 5,99 | 0,3894 |
| 5 | 12 | 9,56 | 0,1972 |
| 10 | 17 | 16,01 | 0,4257 |

**No hay evidencia sólida para promover la clasificación actual de madres.**

## Elegir cuarta cifra condicionando a idénticas madres

Se usa el ranking PRE `MULTIRRUTA_MADRES_ROCE` para madres, y dígitos clasificados en PRE por número de hijas físicas, cantidad de recorridos VT4 y desempate hash. Por cada madre se eligen K=1,2,3,5,10 dígitos, de forma anidada. Se contrasta con K dígitos uniformes sin reemplazo, mismas madres y presupuesto. Esperanza de aciertos nulo calculada por combinatoria; Monte Carlo con orden aleatorio de dígitos **compartido por madre y jornada** para preservar dependencia entre turnos. Los números distintos cubiertos por grupo se documentan por separado.

| Dígitos K por madre Top10 | Cortes con acierto observado | Esperanza nulo uniforme | Nulo estratificado por cobertura dentro de cada madre | Números de cuatro cifras distintos en promedio |
|---|---:|---:|---:|---:|
| 1 | 3 | 1,97 | 1,98 | 32,42 |
| 2 | 3 | 3,88 | 3,90 | 65,51 |
| 3 | 5 | 5,73 | 5,76 | 98,77 |
| 5 | 11 | 9,25 | 9,31 | 167,23 |
| 10 | 17 | 17,00 | 17,00 | 342,50 |

El roce K1 dio septiembre **3/70** vs nulo **1,09**, octubre **0/45** vs nulo **0,88**. Por tanto no hay estabilidad entre meses. El intervalo exploratorio bootstrap agrupado en 23 jornadas para ventaja K1 observada sobre nulo estratificado fue **[−1,64; +4,30] cortes**, cruza cero. Para K2 y K3, el roce resulta peor que el control aleatorio dentro de las mismas madres. El nulo de **misma cobertura local** restringe las alternativas aleatorias a subconjuntos de dígitos que producen exactamente la misma cantidad de lecturas VT4 distintas *dentro de cada madre*, aunque no garantiza que el solapamiento global entre distintas madres sea idéntico.

**No hay una ventaja robusta de la elección de la cifra por roce.** Aumentar K hace crecer las lecturas cubiertas, no evidencia predicción.

## Aclaración adicional descubierta: hijas ORIENTADAS frente a representantes canónicos

Se auditó el 100% de los **30.320** grupos antiguos. En **19.784** grupos el campo denominado `daughters` almacenaba representantes **canónicos reversibles** (por ejemplo `1571`, reverso de la hija `1751`) en vez de las **cadenas literales** obtenidas al agregar la cifra a las dos lecturas de la madre. **No son 19.784 familias erróneas**: todos los 30.320 grupos pasaron la comprobación y los valores `values` del laboratorio contienen las dos hijas ORIENTADAS y sus inversiones. Era un problema de nomenclatura que no afectó los aciertos ni el orden, pero puede causar malinterpretaciones visuales.

Ejemplo directo, madre `729/927`, cifra `3`: hijas orientadas `3729` y `3927`, inversas `9273` y `7293`. **La inversa de una hija no crea una nueva madre.** Se generó auditoría complementaria `AUDITORIA_ORIENTACIONES_PRE.json`, sin consultar POST, registrando cada pareja orientada y sus dos familias reversibles.

## Archivos reproducibles

ZIP de esta ejecución **`modelo-papa-descomposicion-madre-y-cuarta-cifra-115-cortes-11oct2026.zip`**, 10 archivos, **2.022.617 bytes**, SHA256 `3227e401aed1cc91d6a25f0fc91180742e395a80798ec3c13e2e308e0cf588e0`. Incluye fuentes PRE y POST separadas, `diagnostico.py`, `generar_hijas_orientadas_PRE.py`, tablas, informe e inventario completo de hermanas orientadas. La carpeta fue extraída en un **directorio nuevo** y se reprodujeron exactamente los resultados, hash del informe JSON `e76faa341a7b3d3fc38bf9d22615870de64d4682b659bf99860871596e585928` y hash de auditoría PRE de orientaciones `6d355280508cb310dd3dcd6655e8ef86e4a2e8f1b4f8ba96a414b57acbaa7b16`. Requiere Python 3 y NumPy.

## Decisión

Este es **un cierre del diagnóstico retrospectivo**, no una nueva variante a integrar a producción. Si se siguen generando reglas a partir de septiembre/octubre se sobreajustará inevitablemente. El paso necesario es registrar Top PRE verdaderos en nuevas fechas/turnos y compararlos con resultados posteriores **sin modificar las reglas entre cortes**; en paralelo sigue pendiente el VT2 Top3 V9 original, cuyo código exacto del ensayo anterior no está versionado en el repositorio. Mantener abstenciones, negativos y agrupación por jornada, y no atribuir éxito por coincidencia mecánica al ampliar el presupuesto de cifras.
