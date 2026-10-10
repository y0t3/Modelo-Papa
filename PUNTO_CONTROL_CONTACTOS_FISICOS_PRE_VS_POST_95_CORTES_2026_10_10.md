# Modelo Papá — Punto de control: ¿el contacto PRE confirma una huella en el próximo turno?

**Fecha:** 10/10/2026. **Rama:** `experimento-analisis-visual-5d`.
**Antecedente directo:** `PUNTO_CONTROL_ATLAS_COMPLETO_95_CORTES_19_TRANSICIONES_2026_10_10.md`.
**Protocolo congelado antes del cotejo:** `PROTOCOLO_CIEGO_CONTACTO_RECONFIRMACION_95_CORTES_2026_10_10.md`, commit `6cb785e6e07dbf709602de51266596c2cee1dc30`.

## Ejecución verificada
**GitHub Actions, cuatro trabajos completados satisfactoriamente:** https://github.com/y0t3/Modelo-Papa/actions/runs/38049032338

1. `cerrar-95-cortes-antes`: reconstruye 20 hojas históricas MARCADAS completas y conserva 95 cortes sin resultado objetivo. Se mantienen todas las cabezas conocidas en la hoja histórica, y todos los recorridos físicamente contiguos VT2/VT3/VT4 que ya fueron marcados.
2. `sellar-contactos-antes`: sin leer ningún resultado objetivo, **deduplica cada figura antigua por modalidad+fuente+celdas ignorando inversión**, conserva las cabezas históricas distintas y clasifica TODAS las figuras por contacto con marcas confirmadas hoy: misma geometría, dos o más celdas compartidas, una celda, ningún contacto. Artefacto PRE publicado.
3. `estudiar-movimientos-y-negativos-despues`: vuelve a construir las hojas cerradas y coteja todas las 95 cabezas/turnos; este proceso ocurre DESPUÉS del cierre de los archivos ciegos.
4. `cotejar-contactos-despues`: necesita explícitamente **ambos** trabajos anteriores. Coteja cada figura antigua contra TODAS las marcas confirmadas del turno objetivo (misma modalidad/fuente/forma física) y contra el sufijo numérico de todas las cabezas reales (dos orientaciones permisivas, **no** selección de número). Guarda coincidencias, negativas e incertidumbres en otro ZIP.

**Artefactos (no mezclados):**
- Exámenes ciegos visuales originales: https://github.com/y0t3/Modelo-Papa/actions/runs/38049032338/artifacts/11667874681
- Todas las figuras **ANTES** del turno y sus contactos: https://github.com/y0t3/Modelo-Papa/actions/runs/38049032338/artifacts/11668632406
- Todas las confirmaciones **DESPUÉS** del turno con casos negativos, 95 expedientes: https://github.com/y0t3/Modelo-Papa/actions/runs/38049032338/artifacts/11668449224
- Atlas de pares visuales (retrospectivo): https://github.com/y0t3/Modelo-Papa/actions/runs/38049032338/artifacts/11667914737

Los tests verifican contigüidad de celdas, que una inversión no crea una figura adicional, contacto solamente dentro de la columna, exclusión de marcas futuras, marcas de turno objetivo posteriores, resultados ausentes indeterminados y cotejo físico de la ruta exacta/inversa. **Todos aprobados.**

## Resumen total: 95 cortes del 9 al 30 de septiembre

Unidades: exposiciones de una **figura física antigua distinta dentro del corte**; figuras en cortes sucesivos NO son independientes. En total **3186 exposiciones**: VT2 1962, VT3 967, VT4 257.

| Modalidad | Huellas con contacto antes del objetivo | Reconfirmadas físicamente entre casos determinables | Huellas SIN contacto antes del objetivo | Reconfirmadas físicamente entre casos determinables |
|---|---:|---:|---:|---:|
| VT2 | 86 / 592 (**14,5 %**) | misma cifra | 81 / 383 (**21,1 %**) | misma cifra |
| VT3 | 10 / 304 (**3,3 %**) | misma cifra | 5 / 138 (**3,6 %**) | misma cifra |
| VT4 | 0 / 80 (**0 %**) | misma cifra | 0 / 40 (**0 %**) | misma cifra |

En la tabla, el porcentaje utiliza sólo **sí + no confirmados** como denominador. No incluye casos inciertos debido a datos de alguna de las seis jurisdicciones faltantes; éstos permanecen listados en los JSON.

**Detalle por tipo, incluidos los desconocidos:**

| VT | Contacto previo | Casos | Exacta SÍ | Exacta NO | Indeterminados |
|---|---|---:|---:|---:|---:|
| VT2 | Misma geometría | 222 | 24 | 118 | 80 |
| VT2 | Comparte 2+ celdas | 159 | 9 | 79 | 71 |
| VT2 | Comparte 1 celda | 617 | 53 | 309 | 255 |
| VT2 | Ningún contacto | 964 | 81 | 302 | 581 |
| VT3 | Misma geometría | 21 | 0 | 11 | 10 |
| VT3 | Comparte 2+ celdas | 305 | 3 | 170 | 132 |
| VT3 | Comparte 1 celda | 223 | 7 | 113 | 103 |
| VT3 | Ningún contacto | 418 | 5 | 133 | 280 |
| VT4 | Misma geometría | 0 | 0 | 0 | 0 |
| VT4 | Comparte 2+ celdas | 115 | 0 | 64 | 51 |
| VT4 | Comparte 1 celda | 30 | 0 | 16 | 14 |
| VT4 | Ningún contacto | 112 | 0 | 40 | 72 |

**Advertencia metodológica adicional:** comparar ambas orientaciones numéricas sobre una huella heredada completa da la misma confirmación histórica que el cotejo de geometría cuando se reconstruyen **todos** los recorridos válidos por cabeza; no se deben tratar esas dos columnas del informe como evidencias estadísticas independientes. Esta es una propiedad de la reconstrucción exhaustiva, no una ventaja predictiva.

## Controles apareados dentro de la MISMA fecha+turno+fuente+modalidad

Se identificaron **131 grupos** con al menos una figura anterior tocada y otra sin contacto dentro del mismo origen y modalidad. Se computó para cada grupo la proporción de reconfirmación, **sin elegir una figura representativa** y preservando los empates y los datos faltantes:

| VT | Grupos totales | Más reconfirmaciones entre tocadas | Más entre NO tocadas | Empate | Indeterminados |
|---|---:|---:|---:|---:|---:|
| VT2 | 98 | 17 | 12 | 20 | 49 |
| VT3 | 33 | **1** | **0** | **14** | **18** |
| VT4 | 0 | — | — | — | — |

Estos resultados limitan la interpretación de porcentajes globales: dentro de los grupos comparables no aparece separación consistente en VT3 (14 empates y apenas 1 con diferencia), y en VT2 la categoría mayoritaria del período puede confundir fácilmente una asociación bruta. No hacer inferencia causal ni contraste formal de significación a partir de huellas dependientes.

## Reconstrucción física de figuras confirmadas **y** falsas amigas

**29/09 ANTES de Matutina, columna física `prevNocturno`:**
- Familia VT3 `289/982`, ruta `2:0→2:1→3:1`, antes de Matutina comparte `2:1,3:1` con una marca VT3 asociada a cabeza Primera Entre Ríos **4983** ya conocida. Resultado Matutina Ciudad **7289**: geometría marcada del objetivo, éxito **RETROSPECTIVO**, NO número elegido.
- Otra geometría distinta de la misma familia `289/982`, `3:1→3:0→2:0`, comparte `3:1` con **4983**, también reconfirmada después de Matutina.
- Familia VT3 `384/483`, `0:0→0:1→1:1`, también tenía contactos con Primera **0154** y **4983**, incluido segmento `0:1,1:1`. **No** fue marcada por cabeza Matutina: **falsa alarma física** aunque presentaba un roce incluso más largo.

**30/09 ANTES de Matutina:**
- VT3 `778/877`, dos figuras en `prevNocturno`: `3:1→2:1→1:1` y `2:0→2:1→3:1`. Ambos dibujos tocaban en `2:1` o `3:1` recorridos VT2 de la cabeza Primera Córdoba **4107**. Matutina Córdoba **6778** confirmó RETROSPECTIVAMENTE ambas figuras y el valor 778 (la otra lectura 877 seguía siendo posible antes del resultado).
- VT2 `37/73` en fuente `Previa`: figuras `0:0→1:0` y `0:1→1:0` también tocaban marca de Primera Córdoba **4107** en `1:0`; ninguna fue confirmada por Matutina. Una tercera figura de `37/73` (`3:1→4:1`) no tenía contacto ni confirmación posterior.

**Lección:** la magnitud del contacto físico (punto o tramo) no determina que una figura vuelva a confirmarse; dos huellas con contacto anterior pueden seguir trayectorias históricas diferentes en los resultados. No podemos elegir retrospectivamente la parte exitosa del dibujo y llamarla método de pronóstico.

## Decisión y próximos experimentos

- **NO** agregar puntuación o filtro predictivo por `contacto>0`, celdas compartidas, cantidad de cabezas o familia `778`. El análisis fue retrospectivo dentro de un período muy estudiado y en el que se permitió incluir dos orientaciones.
- Conservar la inspección **puramente visual** del recorrido completo, su origen físico, su posición en la columna, cómo aparece o desaparece junto a otros trazos, con visores de todos los casos y alternativas negativas.
- Próxima prueba más fiel al padre: permitir una selección cualitativa **manual y justificada**, o `OBSERVAR/NO JUGAR`, registrada en un turno **antes de conocer el resultado real**, y preservar el registro inmutable para comparación prospectiva. Las 95 láminas históricas son útiles para practicar pero **no sustituyen ese ensayo prospectivo real**.
- El material manuscrito original no ha sido verificado trazo por trazo desde los videos antiguos; las rutas reflejan la especificación física y la reconstrucción digital exhaustiva, que es una limitación no resuelta.

**Sin modificaciones en** `main`, APK oficial, selector o motor congelado. Sólo rama experimental y archivos de investigación.
