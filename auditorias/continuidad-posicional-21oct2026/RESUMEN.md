# Continuidad posicional de marcas ganadoras · Modelo Lalo

**Fecha:** 21/10/2026. **Laboratorio separado:** `lab/continuidad-posicional-21oct2026`.
**Estado:** replicación de ventanas 2024–2026 completada; **sin modificación de MV1, Tops ni APK**.

## Hipótesis, diferente del traslado libre

¿Se repite físicamente una figura que explicó una cabeza ganadora en el tablero auxiliar de Santiago–Neuquén, **en las mismas celdas y con la misma orientación**, en jornadas posteriores D−1 o D−7? El tablero auxiliar **sí permite cruzar Previa / Primera / Matutino** por vecindad, pero no permite saltos, huecos o reutilización. Los dígitos de la nueva candidata son exclusivamente **los de las nuevas celdas PRE**, nunca números antiguos copiados o cabezas futuras.

Las raíces antiguas se obtienen **POST** únicamente de las últimas 2/3/4 cifras exactas de cabezas realmente publicadas en Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos o Montevideo; no se registran candidatos que no salieron. Un mismo evento ganador puede generar muchos recorridos, pero cuenta como **una sola raíz**, no varios votos por dibujo.

Familias VT2/VT3: el inverso de dirección forma parte de la misma familia. VT4: **cifra agregada a una madre VT3**, sin inversión indebida de cuatro cifras y **solo variantes de cuatro cifras físicamente formadas**.

## Control

- Se comparó Top3 y Top5 de **continuidad posicional**, **geometría completa sin memoria**, **Modelo Lalo MV1 sin cambios**, y **99 controles** de huellas históricas NO ganadoras.
- Cada control conserva las mismas jornadas históricas, cada cabeza-evento anterior, el número de huellas por evento y la **combinación de franjas fuente** de la ruta cuando hay alternativas físicas. Excluye todas las rutas exactas que sí explicaron alguna cabeza ganadora del turno histórico.
- Si no existe otra ruta de idéntica combinación de franjas, el control usa otras rutas antiguas no ganadoras válidas. En algunos cortes VT2 hubo estos reemplazos menos estrictos; **para VT3 y VT4 no hubo excepciones de fuente** en las pruebas. Se registra el número de casos.
- Se comparan **las mismas primeras cabezas de seis jurisdicciones**, en cortes PRE de Primera, Matutino, Vespertino y Nocturno. Previa se excluye de la comparación porque el tablero auxiliar aún no existe.
- Las familias Top3/Top5 se convierten en **terminaciones exactas únicas** por turno (una familia reversible generalmente equivale a dos números apostables). La expectativa de azar uniforme se calcula por exposición real `# cabezas observadas × # terminaciones / 10^n`.
- No se infiere rentabilidad, costo de apuesta ni probabilidades futuras a partir de esta comparación. El estudio completo es **retrospectivo**, con numerosos métodos ensayados anteriormente; intervalos y comparaciones no son confirmación prospectiva.

## Ventana agosto–20/octubre, tres años

Cada año incluye **69 jornadas**, **276 cortes PRE**. Se recuperaron 1.503 cabezas en 2024, 1.502 en 2025 y 1.502 en 2026.

### VT2 Top3

| Año | Lalo MV1 | Continuidad posicional | Media de 99 controles |
|---|---:|---:|---:|
| 2024 | 79 | 73 | 81,1 |
| 2025 | 80 | **96** | 83,3 |
| 2026 | **101** | 95 | 88,9 |

El comportamiento no es reproducible. En Top5: Lalo 133/149/160; posicional 127/166/135.

### VT3 Top3

| Año | Lalo MV1 | Continuidad posicional | Media de 99 controles | Rango de controles |
|---|---:|---:|---:|---|
| 2024 | 6 | 5 | 7,6 | 2–15 |
| 2025 | 7 | 9 | 6,3 | 1–12 |
| 2026 | 7 | **18** | 8,2 | 1–15 |

El bloque de **2026 agosto–octubre** fue notable: 18 aciertos VT3 Top3 con aproximadamente 8,38 esperables por exposición uniforme; 99 controles no ganadores, con el mismo número de raíces/caminos y tipos de fuente, llegaron como máximo a 15. Los 18 aciertos correspondieron a **17 jornadas**; **10 de los 18 fueron Matutinos**, por lo que la mejora no es homogénea entre turnos.

En 2026, diferencia de exceso de aciertos vs Lalo: **+11,11**; IC descriptivo 95% remuestreando jornadas **[+2,08; +20,30]**. Vs media controles físicos: **+9,75**; IC **[+2,78; +17,58]**. **NO corregidos por la multiplicidad de otras investigaciones ni por el hecho de que se estudiaron previamente las fechas.** Nunca interpretar una ventana favorable como ventaja asegurada.

En Top5 VT3: 2024 posicional 13 vs Lalo 8; 2025 posicional 13 vs Lalo 13; 2026 posicional 21 vs Lalo 17. El salto al quinto puesto amplía números, pero no evidencia mejora estable.

### VT4

Muy pocas candidaturas alcanzan cuatro cifras exactas desde huellas ancladas. Top3 posicional **0/0/0** en 2024/2025/2026. Top5 posicional **0/1/0**. MV1 Top5: **0/1/2**. No existe respaldo para priorizar esta mecánica en VT4. Un intervalo aparentemente positivo en «aciertos ajustados» puede reflejar solo **menos terminaciones cubiertas, sin un solo acierto monetario**.

## Replicación SIN CAMBIAR REGLAS en febrero–mayo

Se usaron las mismas posiciones, fuentes, ranking por raíces, control de rutas, tres modalidades, Top3/5 y 99 semillas. Calentamiento previo desde el 15 de enero de cada año, con antecedentes D−1 y D−7 del mismo año. Los registros 2025-04-18 y 2025-05-01 carecieron de datos en el proveedor y no fueron tratados como sorteos inventados.

- **2025:** 101 jornadas / 404 cortes PRE / 2.156 cabezas.
- **2026:** 99 jornadas / 396 cortes PRE / 2.114 cabezas.

### VT2 Top3

| Ventana | Lalo MV1 | Posicional | Control promedio | Esperanza uniforme posicional |
|---|---:|---:|---:|---:|
| Feb–mayo 2025 | **125** | 91 | 112,0 | 123,45 |
| Feb–mayo 2026 | **115** | 94 | 110,5 | 121,19 |

VT2 Top5, respectivamente: 2025 Lalo **198** vs anclado **159**; 2026 Lalo **203** vs anclado **174**. **El criterio posicional rindió peor en ambos períodos adicionales**, incluso considerando ligeras diferencias de exposición.

### VT3 Top3

| Ventana | Lalo MV1 | Posicional | Control promedio | Esperanza uniforme posicional |
|---|---:|---:|---:|---:|
| Feb–mayo 2025 | **11** | 10 | 12,3 | 11,74 |
| Feb–mayo 2026 | **12** | 9 | 11,6 | 11,13 |

VT3 Top5 en esos períodos: Lalo **18 / 24** vs posicional **14 / 16**. Esta replicación **no sostuvo la señal favorable del cierre de 2026**. No debemos modificar el Top por ella.

### VT4

**Cero aciertos** del selector posicional Top3 y Top5 en febrero–mayo de ambos años. Las expectativas uniformes eran menores a una cabeza para esos Top3, por lo que el dato no distingue reglas con poder predictivo.

## Hallazgo metodológico y correcciones

La **continuidad en celdas originales** es diferente de **trasladar libremente el dibujo ganador** por el tablero nuevo. Ejemplo del 20/10/2026, Ciudad Nocturna `2697`, terminación VT3 `697`:

- La versión anterior de **traslado libre** llegó a colocar `697/796` en Top1.
- La versión **posicional estricta** no incluyó `697/796` en Top3 para ese mismo corte. **No se pueden combinar sus aciertos como si fueran un único método.**
- Una figura puede tener la misma forma pero aparecer en otras celdas; entonces **no** cumple continuidad posicional, aunque sí la geometría genérica.

**Otra cautela:** aunque el remuestreo descriptivo de agosto–octubre 2026 mostró un exceso VT3, las pruebas independientes de febrero–mayo **fallaron**, y el bloque agosto–octubre de 2024 fue negativo. No hay replicación robusta ni justificativo para subir confianza o apuestas.

## Decisión

- **Conservar la bitácora visual** que distingue cabeza ganadora real, figura concreta, contacto válido y fuentes anteriores/posteriores.
- **No promover** continuidad posicional a Top3/5/6 oficial ni utilizar el bloque favorable para prometer ganancias. VT2, VT3 y VT4 siguen siendo modalidades de acierto igualmente legítimas y se contabilizan por separado.
- La continuidad de figuras puede servir como **capa explicativa**, con el contador de eventos raíces de procedencia D−1/D−7 y testigos precisos, no como ranking privilegiado.
- **MV1 congelado y APK sin modificaciones.**
- Para contrastar potencial económico, requeriría datos de premios, montos, jurisdicciones apostadas y un registro de predicciones efectivamente selladas antes de cada sorteo, no elegir parámetros mirando resultados anteriores.

## Archivos

- `src/auxAnchoredMemory.ts`: huellas ganadoras POST, control de rutas no ganadoras, lectura PRE de mismas coordenadas.
- `scripts/lab-ancla-rutas-test.ts`: contactos, no fuga, VT4 correcta, trazas de `697` sin copiar cifras.
- `scripts/lab-continuidad-posicional.ts`: replays de 2024–2026 y validación febrero–mayo 2025/2026, 99 controles.
- `scripts/lab-continuidad-diagnostico.ts`: intervalos pareados por día, casos ganadores y fuentes de raíz.
- `.github/workflows/lab-continuidad-posicional.yml`: automatización CI reproducible.
- **Ejecución completa aprobada:** https://github.com/y0t3/Modelo-Papa/actions/runs/39664924778

**Nota:** Es una metodología geométrica de registro/investigación, no una prueba de beneficio económico.
