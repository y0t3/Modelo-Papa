# Modelo Papá — VT3: competencia de terceras casillas sobre el mismo borde heredado

**12/10/2026.** Laboratorio geométrico retrospectivo sobre 23 jornadas / 115 cortes ya disponibles. **Sin modificar `main`, V7–V14, Tops de producción, marcado automático +11 ni APK. No se construyó VT4.** Rama experimental `auditoria-sorteo-10oct-2026`.

## Pregunta que se resolvió físicamente

Una ruta VT3 histórica **confirmada por cabeza completa previa** se traslada dentro de una fuente física 6×2. Sus dos pares consecutivos de casillas constituyen bordes heredados; ¿qué familias VT3 distintas se forman al completar con una tercera casilla contigua? Se enumeran exhaustivamente TODOS los recorridos legales y sus inversiones, sin cruce de fuente, vacío, salto ni reuso. Diferenciar **recorrido**, **bloque de tres casilleros** y **familia reversible**; conservar las rutas en el visor sin contar varias veces el mismo bloque.

**PRE físicamente separado del POST**, generado sobre `ENTRADA_PRE.json` congelado (unión D−7 y última jornada operativa de los Top10 anteriores, con sus raíces confirmadas). Enumerar alternativas fuera de esa unión es únicamente observación visual: los ensayos de ranking de Top3/5/10 **solo pueden escoger familias de la bolsa original D7-Top10 ∪ D1-Top10 y nunca más de diez familias**.

## Inventario PRE

- **3.565** bordes físicos heredados fuente+dos posiciones+corte.
- **3.560** tienen al menos **dos familias VT3 diferentes** físicamente posibles.
- **20.923** exposiciones de alternativa familia×borde; **25.640** recorridos físicos canonizados por inversión. No se eliminaron caminos; se agrupan.
- **7.762** vínculos a rutas de raíces D−7/D−1 antiguas (repetidos, no confirmaciones independientes).
- POST: **209 bordes-exposición** contienen alguna familia coincidente, en **59 cortes distintos**. Contienen 212 exposiciones ganadoras familia×borde; **no son 209 aciertos independientes** porque varios bordes pueden contener la misma madre.

## Mismo cupo Top3/Top5/Top10, sin expandir bolsa

| Ordenamiento PRE | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| D−7 original congelado | 5 | 8 | 16 |
| **D−1 original congelado** | **9** | **13** | **18** |
| Hermanas con más bloques sobre el borde | 6 | 8 | **18** |
| Hermanas con más recorridos sobre el borde | 6 | 8 | **18** |
| Más terceras casillas nuevas | 8 | 10 | 17 |
| Conservar tercera casilla de una raíz | 5 | 10 | 16 |
| Tercera casilla más cercana | 3 | 5 | 17 |
| Tercera casilla más distante | 5 | 7 | 17 |

Estas políticas votan **una vez por borde físico**, consideran sólo bordes donde compiten ≥2 familias de la unión Top10 D7/D1 y ordenan por proporción de votos ganados. Son nuevas políticas **retrospectivas** y no deben usarse en producción.

## Control imprescindible de densidad en un mismo borde

**Sólo entre los 209 bordes que POST reveló como portadores de ganadoras** —esta condición es retrospectiva y jamás equivale a saber qué borde escoger PRE— se evaluó si una primera familia seleccionada por criterio geométrico ganaba a sus hermanas. Los empates se valoraron **fraccionariamente**, para no premiar la selección de múltiples candidatas. El control exacto conserva entre hermanas el mismo **número de rutas, de bloques físicos y si la terna es palindrómica**. Bootstrap por las **23 jornadas completas**, no por bordes correlacionados.

| Política dentro del mismo borde | Crédito observado | Esperanza densidad igualada | IC exploratorio de diferencia |
|---|---:|---:|---|
| Más bloques | 44,38 | **44,38** | [0,00;0,00] |
| Más rutas | 44,38 | **44,38** | [0,00;0,00] |
| Más salidas nuevas | 40,85 | **42,52** | [−5,26;+1,80] |
| Conservar tercera antigua | 48,28 | **44,58** | [−1,07;+8,55] |
| Tercera cercana | 49,77 | **45,38** | [−0,59;+9,45] |
| Tercera distante | 32,00 | **34,95** | [−11,04;+5,81] |

**Ninguna regla muestra ventaja robusta frente a densidad equivalente; los intervalos incluyen cero.** El crédito es suma fraccionaria sobre los bordes ganadores, NO cortes acertados. El control adicional de Top10 hipergeométrico dentro de la bolsa y con densidad/procedencia/palindromía igualmente dio intervalos que incluyen cero.

## Ejemplos contrarios necesarios

- **05/10 Matutina, VT3 `729/927`:** en el borde físico fuente 2, posiciones (0-based) (1,0)–(2,0), compite con `273`, `276`, `279` y `727`. Las cinco son VT3 válidas, y `729`, `279`, `727` cuentan **dos bloques heredados cada una**. Se documentan la raíz de cabeza `2517` en D−7 y múltiples testigos D−1. POST Santa Fe `3729`, pero conservar tercera casilla no distinguía individualmente `729`.
- **08/10 Matutina, `071/170`:** en un borde físico de la fuente 2 ligado a cabeza antigua `0261`, `071` y `107` ofrecen dos bloques; `076` y `077` uno cada una. El número de bloques sólo reduce a empate; POST `7071`.
- **26/09 Nocturna, `283/382`:** existen bordes donde la familia coincidente forma **tercera casilla nueva**, mientras otra conserva la antigua. No hacer del origen intacto una condición necesaria.

## Reproducibilidad comprobada

**ZIP de conversación:** `modelo-papa-vt3-competencia-salidas-mismo-tramo-115-cortes-12oct2026.zip`, **18 entradas**, **1.644.629 bytes**, SHA256 **`982147170e0829684641984f56fcfff3ec8c78241114a46237cd27176bf1e616`**, test ZIP sin errores.

- `COMPETENCIA_PRE.json` SHA256 `9623a7b8883bfd05084961f7e7980a7bce108cb998ba45a48988dc40ac731f75`.
- `COMPETENCIA_POST.json` SHA256 `5011818f76fd997201ede2939b68fe8d9145530b5fb8e57ff8e26f27daf311c7`.
- `CONTROLES_POST.json` SHA256 `b89208ac1979ec18808ca8ad62c0e034e2a2436740ae1e85cf0e3380c1d2c6f2`.
- `analizar.py pre|verify|post` audita **25.640 rutas** más las raíces antiguas, comprobando coincidencia completa con la lectura VT3, adyacencia, desplazamiento uniforme y antigüedad.
- **Reproducción independiente desde ZIP extraído en otra carpeta:** se retiró físicamente `RESULTADOS_POST.json` y TODOS los resultados POST; se regeneraron PRE y visor PRE con SHA idéntico. Se volvió a introducir `RESULTADOS_POST.json` *sólo después* y se regeneraron POST, controles, CSV, visor POST e informe **con cinco hashes idénticos**. Los siete artefactos comprobados (2 PRE + 5 POST) coinciden en bytes. La sesión de reproducción unificada agotó plazo, por eso se validaron ambas fases por separado.
- Dos visores HTML **autocontenidos para los 115 cortes**: seleccionan fecha/turno, borde, madre, ruta; muestran D−7, última jornada y hoja actual; raíces antiguas y todas las alternativas. **Ambos probados en Chromium con 3 SVG, 115 cortes y cero errores JS**. PRE sin cabezas objetivo.

## Decisión

Conservar el catálogo de terceras casillas hermanas y sus rutas como observatorio de interpretación visual VT3, **no** como una prima, ranking automático ni modificación de producción. Después de muchas hipótesis ensayadas sobre las mismas 23 jornadas, ninguna transformación constituye evidencia predictiva fuera de muestra. La cuestión previa que el laboratorio aclara es que **la elección del borde/raíz PRE sigue sin resolverse**; medir la mejor alternativa *sabiendo a posteriori qué borde contiene ganador* no resuelve esa primera elección.
