# VT3 · Cupos equilibrados por estado físico (13/10/2026)
Rama independiente `lab-vt3-equilibrio-estados-13oct2026`. Este protocolo se crea antes de correr el código que lo evalúa sobre POST histórico.

## Objetivo y limitaciones
Probar si la selección de diez familias mejora cuando evita que el Top10 esté dominado por sólo un estado físico: **NACE_FISICAMENTE**, **CONVERGE_FUENTES**, **YA_PRESENTE**. Durante Previa todas son **INICIAL** (no hay transición intradía comparable), por lo que se conserva el Top oficial. La clasificación procede exclusivamente del PRE físico auditado, sin usar cabezas futuras ni marcar rutas predictivas.

Los 115 cortes sobre 23 fechas de 2026 fueron ya repetidamente explorados; los cambios son exploración *in-sample*, NO validación de pronóstico ni evidencia de superioridad ante sorteos aleatorios. La mejora no se puede convertir en recomendación de apuestas. Preservar familia reversible (p. ej. 643/346), rutas contiguas dentro de una fuente, raíces históricas genuinas, y 10 familias exactamente. Ni un nuevo peso ni un Top oficial se altera.

## Entradas inalterables
- `auditorias/vt3-nacimientos-convergencias-115-13oct2026/PRE_115.json` y `NOCTURNA_PRE.json`, sellados por `SELLO.json` con hash SHA256 de PRE `512331f2695e2b632c7f2077f2dd7437041d00ee724556cf754e22f986a07f2b` y Nocturna `86426d26f2a90032ae7266bc094642c558628cf43c02b9838f31134bed33b5d8`.
- Posteriormente y en etapa separada, `POST_115.json` y `NOCTURNA_POST.json` de la misma auditoría, con resultados publicados de fechas históricas.
- Algoritmo PRE recibe exclusivamente perfiles familia×corte, estado (nace/converge/ya presente/inicial), bandera `anchored`, puesto original, familia física con contacto `hasBridge`, `ageTurns` (0 a 4) y `anchoredNeighborFamilies`. No usar resultado de sorteo ni conocimiento de fuentes futuras.

## Políticas predefinidas
**Conservar el orden relativo oficial entre las familias elegidas**; es decir, no promocionar la posición de una candidata por una asignación artificial de cupos. Los puestos se ocupan conforme al orden original una vez seleccionadas. Para ajustes de `min1/min2/min3` se reservan las mejores familias ancladas de cada clase faltante, respetando los primeros 3 o 5 puestos oficiales cuando así se indica; se completa en el orden original. Si alguna clase no dispone de candidatas, no se inventan ni se reserva un puesto vacío.

- `OFICIAL`: diez primeras ancladas.
- `M1_P3`, `M2_P3`, `M3_P3`: mantener primeras tres y buscar como mínimo 1, 2 o 3 familias de CADA clase dentro de las diez; sujeto a disponibilidad.
- `M2_P5`: como M2 pero primeros cinco puestos oficiales protegidos.
- `M2_P0`: como M2, sin plazas protegidas; sólo para comprobar cuánto depende del límite.
- `CAP6_P3`: primeros tres protegidos; elegir en orden original evitando superar seis familias del mismo estado, y sólo relajar ese techo si faltan candidatas para completar diez.
- `M1_P3_BRIDGE1`, `M2_P3_BRIDGE1`: como M1/M2, reservando una plaza final para la mejor familia sin raíz con contacto físico verificable con otra familia anclada, con `ageTurns <= 2`. Si no hay candidata, todas las plazas son ancladas. Las familias sin raíz NO reciben raíces prestadas.
- `M2_P3_FRESH1`: reserva una plaza final para familia no anclada de antigüedad <=2 turnos, ordenando menor edad, más fuentes y más bloques, desempate alfabético.
- `M2_P3_BRIDGE2`: dos plazas finales para familias sin raíz con contacto físico, completando a lo sumo 8 ancladas.
- `OPEN_BRIDGE1_ORIG`, `OPEN_BRIDGE2_ORIG`: controles del laboratorio anterior, sin equilibrio.
- `M2_P3_HASH_CONTROL`: control negativo: equivalente a M2_P3, pero la reserva de clase se elige por hash fijo de fecha, turno y familia dentro de la clase, no por orden original; los tres primeros oficiales se conservan. Permite medir si el beneficio depende del criterio de desempate o de la mera cuota.

Orden de clases para resolver reservas: `NACE_FISICAMENTE`, `CONVERGE_FUENTES`, `YA_PRESENTE`. No mezclar `INICIAL` con nacimiento real: Previa queda igual al Top oficial (excepto políticas `OPEN` de control, que conservan la regla del laboratorio previo).

En los híbridos las primeras 3 ancladas quedan intactas. Si la familia física abierta entra, ocupa el último puesto (o los dos últimos), sin marcarse como anclada. Familias con `anchored=false` nunca reciben prioridad o raíces por cercanía.

## Separación y evaluación
- Workflow mueve físicamente los POST de este laboratorio y del laboratorio de cobertura fuera del repositorio antes de producir `PRE_115.json`, `NOCTURNA_PRE.json` y `SELLO.json`.
- Validar que PRE no contiene cabezas objetivo y que las listas se forman sólo con perfiles físicos conocidos, sin duplicados. Validar igualdad EXACTA del Top oficial original por cada uno de los 115 cortes.
- Evaluar 115 cortes Top3/5/10, ganadoras únicas en diez, pérdidas y rescates con el mismo cupo, por mes y turno; incluir evaluación del 12/10 sólo como POST exploratorio conocido (no altera sello anterior a sorteo).
- Registrar por corte cumplimiento y faltantes de cuota, nº de candidatas promovidas vs oficial, estados del Top.
- 22 rotaciones completas y 20.000 permutaciones de **jornadas completas de cinco turnos**, semilla 20261013; controles de mejora PAREADA Top10 frente a Top original, además de distribución de Top10 absoluto; no confundir correlación de familias con observaciones independientes.
- Si un método selecciona más aciertos sobre las mismas fechas, no declarar victoria: hubo muchas hipótesis previas. Si hay mejoras en septiembre y pérdidas en octubre, destacarlas.

## Decisión
No pasar cambios al `main` ni VT4. La prioridad real es entender si balancear estados reduce la inercia sin volverse una nueva regla arbitraria; dejar los resultados buenos y malos completos, incluyendo 851,615,242 del 12/10 como diagnóstico a posteriori.
