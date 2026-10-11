# Punto de control — VT3 madre → hijas hermanas VT4, traslado D−7, 115 cortes

**11/10/2026. Ejecución realizada**, exclusivamente laboratorio retrospectivo. No modifica `main`, APK, marcado automático ni V7/V8/V9/V13/V12/V14 en producción.

## Corrección del usuario y unidad de evaluación

Partiendo de una VT3 madre reversible `729/927`, al añadir `3` al principio de las dos lecturas se originan **dos hijas VT4 hermanas distintas**: `3729` y `3927`. Cada hija conserva su propia lectura inversa `9273` y `7293`. Es incorrecto sustituir estas dos hijas por la pareja reversible de una sola `3729/9273`, o deducir de `9273` una nueva madre VT3 `273`. Si `273/372` se forma independientemente de manera física, **sí** puede registrarse como una madre distinta, pero no se infiere de invertir una hija de `729`.

Los grupos `VT3_madre + cifra_agregada` contienen una o dos hijas reversibles, y hasta cuatro lecturas numéricas distintas (menos en palíndromos). Los Top 3/5/10 anteriores sobre **una hija reversible VT4 por puesto** no son directamente equivalentes a grupos maternos con hasta cuatro números cubiertos.

## Datos y prueba reproducida

- Fuente original: 30 JSON de resultados del **07/09 al 10/10/2026**, obtenidos del GitHub Actions **run 38107717643, artefacto 11690333869**.
- 23 fechas objetivo, 115 cortes (70 septiembre, 45 octubre). Se evalúan cabezas de **cinco jurisdicciones argentinas**: Ciudad, Provincia, Córdoba, Santa Fe y Entre Ríos; se preservan las **seis filas** de la grilla física +11 (también Montevideo) porque sus casillas pueden ser parte de un recorrido.
- D−7: reconstrucción exhaustiva de VT3 realmente marcada por terminaciones de cabezas completas antiguas. Trasladar **la misma forma**, rígida y dentro de la misma fuente, a la hoja disponible **PRE** del turno objetivo, sin saltos ni reutilizaciones. Agrupar madres reversibles; registrar TODAS sus rutas, origen antiguo y cabeza completa antigua.
- Por cada madre físicamente disponible, generar 10 grupos alternativos (dígitos 0–9); dos hijas hermanas por grupo, inversas individuales. Clasificar si cero, una o dos hijas tienen testigos físicos VT4 de cuatro casillas contiguas. No descartar rutas alternativas.
- PRE inmutable por SHA-256 **`cd9bd6b09e9508219d16b7100830153ecba113a10f3936d65124cb2bdd92cc05`**. 115/115 cortes invariantes al modificar a 9999 las cabezas objetivo y posteriores. POST apartado físicamente: PRE recalculado con el mismo hash. 30.320 grupos y todos los testigos físicos auditados.

## Resultados, sin trucar el presupuesto

| Magnitud | Sep 70 cortes | Oct 45 cortes | Total 115 |
|---|---:|---:|---:|
| Grupos madre+dígito generados | 17.420 | 12.900 | **30.320** |
| Cortes con ≥1 grupo coincidente probando **las diez cifras por madre** | 26 | 10 | **36** |
| Cortes con ≥1 grupo coincidente de alguna hija físicamente respaldada | 11 | 3 | **14** |
| Cortes con ≥1 grupo coincidente de ambas hijas físicamente respaldadas | 7 | 2 | **9** |

Distribución entre los 30.320 grupos: **17.369** sin hija física, **6.936** con una hija física, **6.015** con ambas hijas físicas. Cada grupo puede cubrir hasta cuatro números; generar diez por madre da una bolsa grande y **no equivale a predecir con Top3/5/10**.

**Control de dígito dentro de la misma madre y cupo:** 3.032 exposiciones madre-corte, cifras físicamente respaldadas **22** coincidencias frente a **21,9** esperadas al elegir la misma cantidad de dígitos aleatoriamente para la misma madre; diferencia **+0,1**. Bootstrap descriptivo por 23 jornadas completas **[−7,3; +8,0]**. No hay ventaja demostrada del roce para elegir la cifra.

Control adicional de valores expuestos: en 115 cortes, la bolsa de diez cifras por madre dio **36** cortes con coincidencia frente a **41,7** esperados bajo cinco cabezas completas uniformes independientes y misma cobertura numérica; solo dígitos con al menos una hija física **14** frente a **19,0** esperados. Este control uniforme es descriptivo y no prueba el mecanismo de sorteos.

## Caso físico completo: 28/09 → 05/10 Matutino

- Hoja D−7 **28/09**, fuente Primera+11: cabeza vieja **2517**, Vespertino Santa Fe, explica VT3 `517/715` en celdas 1:0→2:0→2:1 (un sentido de la figura).
- La **misma geometría y fuente** trasladada al PRE del 05/10 forma VT3 madre **729/927**; esa familia tiene **seis** recorridos VT3 físicamente presentes en la hoja actual.
- Agregar dígito **3** a ambas lecturas produce `3729` y `3927`, **ambas físicamente realizables** en la fuente Primera+11: **dos** rutas de `3729` y **tres** de `3927`.
- El POST Matutino Santa Fe tuvo cabeza completa **3729**; coincide **una de las dos hijas**, no prueba que debieran elegirse previamente ni que `3927` acertara.
- También aparece la madre física **273/372** con **otro** origen antiguo D−7; su existencia independiente es válida y no procede de invertir `3729`.

## Artefactos comprobados en conversación

Se generó `modelo-papa-prueba-vt4-hijas-115-cortes-11oct2026.zip`, **45 archivos, 1.198.950 bytes**, SHA-256 `10f0ec3e0acbe8e1f14744a5e6eefa97604e95e5c12857032bf9f907139bda56`. Contiene:

- 30 JSON crudos originales en `fuentes-crudas/`, cinco scripts Python reproducibles sin dependencias externas, `EXTENSIONES_MADRES_PRE.json` (todas las rutas viejas, nuevas, madres e hijas), `RESULTADOS_OBJETIVO_POST.json` y `COTEJO_POST.json` separados.
- `HASH_PRE.txt`, `VERIFICACION.json`, informe, LEEME, `ANTES_CASO_05OCT.html` y `DESPUES_CASO_05OCT.html` con rutas alternativas interactivas.
- ZIP probado con `testzip()`; extraído en carpeta nueva y **reproducidos** hash PRE, POST y prueba antifuga sin insumos externos.
- Ambas vistas de caso ejecutadas en **Chromium/Playwright** usando `set_content`, 11 rutas seleccionables (6 madre, 5 hijas), cambio de ruta y cero errores JS. PRE no contiene cabeza objetivo como resultado.

## Decisión

**Corrección estructural confirmada.** Se debe modelar cada **madre VT3**, grupo de **dos hijas hermanas** y las **familias reversibles individuales** de las hijas, con diferencia explícita entre cuarto dígito por azar y cuarta celda comprobada. El roce no muestra mejora estable para seleccionar la cifra en esta prueba.

**No promover los resultados retrospectivos a motor predictivo.** Queda pendiente un ranking PRE genuino de **grupos maternos** con Top3/5/10 y presupuesto numérico equivalente al control, así como validar **VT2 Top3 con V9** sobre días realmente nuevos. El ZIP exacto de las siete políticas D−7 del laboratorio anterior no estaba versionado en el repositorio, y no se debe declarar replicación exacta de V9 sin recuperar ese código.
