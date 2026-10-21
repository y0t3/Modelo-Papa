# Lalo Top3 compacto · selector entre dos hojas (21/10/2026)

**Rama de laboratorio:** \`lab/lalo-top3-doble-hoja-21oct2026\`. Motor MV1 congelado, app de producción y APK intactos.

## Pregunta

¿Pueden utilizarse las raíces y marcas ganadoras de la hoja +11, las de Santiago–Neuquén y el **momento de aparición de una segunda fuente auxiliar** para elegir **tres familias** de VT2, VT3 y VT4 con mayor eficacia que Lalo sin ampliar la cantidad de terminaciones exactas jugables?

**Conclusión:** En la prueba retrospectiva 2024–2026 **no quedó validada una mejora estable**. Especialmente, dar prioridad automática al **doble respaldo** perjudicó VT2. La combinación sí pudo reproducir el VT3 \`697/796\` del 20/10/2026, pero ese caso fue conocido antes de diseñar el experimento y no constituye confirmación independiente.

## Construcción respetando las reglas del padre

- **+11:** figuras contiguas **sin cruzar columnas**; raíces ganadoras históricas de Lalo D−1/D−7, bifurcaciones y prioridades del motor oficial.
- **Santiago–Neuquén:** 2 filas × 12 posiciones RAW, **sin sumar +11**. Se permite cruzar turnos solo por contacto directo horizontal/vertical/diagonal, sin saltos, huecos ni reutilización. Hoja vacía antes de Previa; después se habilitan Previa, Primera, Matutino.
- Se respeta el mapa Vivitusuerte verificado por el usuario, Santiago 20/10: **8067, 6142, 9634**; Neuquén **0469, 0245, 0210**.
- Un *respaldo físico nuevo* en la auxiliar significa que, comparado con el corte PRE inmediatamente anterior de la misma jornada, la familia **pasa de menos de dos fuentes distintas a dos o más**. No cuentan múltiples caminos en una misma columna como fuentes diferentes. Las figuras permanecen disponibles en cortes posteriores; no se confunde permanencia con respaldo nuevo.
- VT2 y VT3 son **familias por reversión válida**. VT4 conserva madre VT3 y cifra antepuesta; **solo los cuatro dígitos efectivamente construidos** cuentan como terminaciones, jamás invertir cuatro cifras para crear otra madre.
- Marcas ganadoras auxiliares obtenidas POST de las seis jurisdicciones de destino en jornadas anteriores D−1/D−7; no se usan las cabezas del propio turno objetivo al pronosticar.

## Protocolo fijo

1. **828 cortes PRE**: 276 por año, 1 de agosto a 20 de octubre de 2024, 2025 y 2026; solo Primera, Matutino, Vespertino, Nocturno, para igualdad de disponibilidad. **4.507 cabezas** en las seis jurisdicciones observadas.
2. El Top3 **MV1 oficial** se conserva inalterado como referencia.
3. Una familia puede representar una o dos terminaciones apostables. Se cuentan números exactos únicos y se mantiene intacta la familia como unidad.
4. **Presupuesto igualado por corte y modalidad:** máximo tantas terminaciones exactas como propone MV1 Top3. Si la siguiente familia no entra, se omite sin partirla. Una combinación puede usar **menos** números, pero jamás más que MV1. Además se reportó el Top3 abierto sin este tope.
5. Se evaluaron sin calibrar con resultados posteriores seis selectores:
   - \`MV1\`: primer Top3 oficial.
   - \`AUX\`: Top3 de memoria ganadora auxiliar.
   - \`DOS_UNO\`: dos primeras familias Lalo + primera familia auxiliar diferente.
   - \`CONFIRMACION\`: reordenar las primeras seis familias admitidas en MV1 priorizando respaldo en memoria auxiliar, segunda fuente nueva y respaldo de varias fuentes; desempatar por ranking oficial.
   - \`PUENTE\`: elegir Top3 del conjunto de Top6 Lalo + Top6 AUX, priorizando raíz disponible en ambos, nueva segunda fuente auxiliar, varias fuentes físicas y lugar previo de las listas.
   - \`AZAR_POOL\`: mismo universo de hasta doce familias, orden pseudoaleatorio determinístico, sin mirar resultados.
6. **399 controles aleatorios independientes del resultado** por año y modalidad: reordenar ese mismo conjunto Top6+Top6, conservar límite de tres familias indivisibles y **mismo techo de terminaciones de Lalo**. Comparar conteo y *exceso* de aciertos vs azar uniforme (\`hits − (terminaciones×jurisdicciones)/10^n\`).
7. Remuestreo bootstrap pareado por jornadas y estratificado por años para intervalos descriptivos; un buen resultado sobre períodos ya vistos no es prueba prospectiva ni permite inferir rentabilidad.

## VT2 Top3, todos los métodos con presupuesto igualado

| Selector | 2024 | 2025 | 2026 | Total |
|---|---:|---:|---:|---:|
| **MV1** | 79 | 80 | **101** | **260** |
| AUX | 84 | 88 | 86 | 258 |
| Dos Lalo + uno AUX | 82 | 75 | 103 | **260** |
| Reordenar Lalo por auxiliar | 77 | 85 | 99 | 261 |
| **Puente / doble respaldo** | **67** | **76** | **81** | **224** |
| Orden aleatorio fijo del pool | 85 | 72 | 93 | 250 |

Conclusión VT2: la priorización fuerte de doble respaldo **empeoró de manera considerable** el conteo en todos los períodos. No copiar ese criterio al motor oficial.

En 2026, 2+1 consiguió 103 frente a 101 Lalo, con una exposición menor (8.517 vs 8.644 apuestas-unidad hipotéticas). Está en el percentil exploratorio 97,5% frente a controles aleatorios de 399 semillas de ese año, pero en 2025 perdió 5 aciertos: **no se repite ni constituye prueba estadística confirmatoria** tras tantos experimentos.

## VT3 Top3, presupuesto igualado

| Selector | 2024 | 2025 | 2026 | Total |
|---|---:|---:|---:|---:|
| MV1 | 6 | 7 | 7 | **20** |
| AUX | 7 | 10 | 14 | **31** |
| Dos Lalo + uno AUX | 7 | 7 | 12 | 26 |
| Confirmación dentro de Lalo | 6 | 8 | 7 | 21 |
| Puente | 6 | 8 | 14 | 28 |
| Orden aleatorio fijo pool | 9 | 8 | 14 | 31 |

No hay un ganador sólido. AUX y PUENTE mejoran al MV1 en los tres períodos en conteo bruto (o empatan en un año), pero el comparador de orden aleatorio único obtiene resultados similares o superiores en algunos años. Es imprescindible el control con 399 semillas para evitar concluir que «respaldo doble» predice mejor cuando el beneficio es solo ampliar el **universo de candidatos distintos**.

### Resultado contra 399 controles del MISMO universo / presupuesto

| Año | Control: hits promedio | AUX Top3 | Puente Top3 | Prob. exploratoria de igualar/superar Puente |
|---|---:|---:|---:|---:|
| 2024 | 6,49 | 7 | 6 | 65,75% |
| 2025 | 9,16 | 10 | 8 | 64,25% |
| 2026 | 11,26 | 14 | 14 | 20,25% |

Las probabilidades de la última columna son **fracciones de las 399 selecciones aleatorias**, no significación ajustada por toda la investigación. En ninguna anualidad el puente mostró superioridad convincente sobre escoger otras tres familias del mismo conjunto de raíces.

**Detalle 20/10/2026 Nocturno:** Puente puso **697/796** en Top1 VT3 y acertó la cabeza Ciudad \`2697\`. Para ese PRE había respaldo en Santiago–Neuquén, incluidas rutas que cruzaban Primera→Previa. El caso se conocía de una auditoría previa: **no usarlo como evidencia ciega nueva**.

## VT4 Top3

| Selector | 2024 | 2025 | 2026 | Total |
|---|---:|---:|---:|---:|
| MV1 | 0 | 1 | 0 | 1 |
| AUX | 0 | 0 | 0 | 0 |
| Dos Lalo + uno AUX | 0 | 1 | 0 | 1 |
| Puente | 0 | 1 | 1 | 2 |
| Orden aleatorio fijo pool | 0 | 2 | 2 | 4 |

La modalidad de cuatro cifras contiene demasiado pocos aciertos exactos: cualquier contraste de «ventaja» cambia con uno o dos sorteos. Al equiparar exposición, el puente usa bastantes menos terminaciones que MV1 y su mejora por corrección de azar puede surgir **sin ganar ninguna cabeza extra**, porque simplemente se apostaron menos números. No confundir ese artefacto de exposición con predicción.

## Bootstrap pareado (diferencia de exceso de aciertos frente al MV1)

- VT2 puente con presupuesto igualado: **−30,33 cabezas corregidas por exposición** en los 828 cortes; IC descriptivo 95% **[−68,97; +7,90]**.
- VT3 puente con presupuesto igualado: **+8,54**; intervalo **[−2,52; +19,56]**. No excluye falta de mejora.
- VT3 AUX con presupuesto igualado: **+12,62**; intervalo **[−2,42; +27,71]**. No excluye falta de mejora.
- Cualquier intervalo ligeramente favorable de un selector aislado debe interpretarse con cautela: **no hay corrección por todas las variantes, años y enfoques examinados previamente**.

## Hallazgos útiles para Lalo

1. **VT2 es un acierto legítimo y NO debe quedar relegado.** Las dos hojas pueden aportar geometrías de VT2, pero privilegiar el doble respaldo fue contraproducente. En 2026 el Top3 oficial VT2 obtuvo **101** vs **81** del puente.
2. **VT3:** la memoria auxiliar puede aportar familias que Lalo no admite, pero **no hay prueba de que el selector combinado sepa priorizarlas mejor que controles con el mismo universo y presupuesto**.
3. **VT4:** preservar madres VT3 y recorridos exactos; no asignar confianza por uno o dos aciertos ni por menor exposición.
4. La noción **«ganó una segunda fuente»** se reconstruyó correctamente mediante diferencia entre PRE sucesivos del mismo día, sin atribuir votos nuevos a fuentes que permanecen; por sí sola no justificó mejorar las selecciones.
5. **No existe evidencia aquí de rentabilidad.** No conocemos pagos, costo real por jugada, jurisdicciones apostadas ni posiciones cubiertas; la razón de aciertos brutos no implica ganancia esperada.

## Decisión

No tocar \`main\`, motor oficial MV1, Tops de la APK ni el protocolo del padre. Mantener datos de **soporte auxiliar y segunda fuente nueva como información visual**, no como peso prioritario automático. Conservar el modelo AUX como **lector informativo paralelo**, no como reemplazo ni «motor ganador».

El próximo estudio útil debería trabajar con **cortes sellados antes del sorteo**, sin escoger post hoc los parámetros que parecen explicar 697 u otros casos ya conocidos. Si se desea seguir investigando histórico, identificar casos geométricos/errores de parser, no buscar una regla rentable a fuerza de comparar cientos de variantes.

## Archivos y reproducibilidad

- \`scripts/lab-lalo-triple-modalidad.ts\`: replay PRE de las dos hojas y soporte de segunda fuente, con todas las familias físicas.
- \`scripts/lab-lalo-top3-doble-hoja.ts\`: cinco selectores, control determinístico y tope de terminaciones por modalidad.
- \`scripts/lab-lalo-top3-controles-azar.ts\`: 399 controles del mismo conjunto y presupuesto.
- \`lab-results/lalo-top3-doble-hoja.json\`: detalle por corte, familia y modalidad.
- \`lab-results/lalo-top3-controles-azar.json\`: percentiles y referencias de los controles.
- [GitHub Actions completado correctamente](https://github.com/y0t3/Modelo-Papa/actions/runs/39655690322).
