# Modelo Papá — observatorio común VT2/V9 → madre VT3 → cada hija VT4

**11/10/2026. Estudio ejecutado, terminado y reproducible con datos existentes.** Rama experimental `auditoria-sorteo-10oct-2026`; no cambió `main`, el tablero +11, su marcado automático, los Top de producción, V7–V14 ni APK. Análisis estrictamente **retrospectivo**, no prueba prospectiva ni demostración de capacidad predictiva.

## Problema nuevo resuelto: propiedad física/temporal por hija, no por grupo

Una familia madre VT3 reversible más una cifra puede generar dos **hijas hermanas orientadas**. Ejemplo `729/927 + 3` produce `3729` y `3927`; las inversas de esas hijas son `9273` y `7293`, **no** una madre VT3 `273`.

El observatorio unificado integra **sin recalcular rankings**:
- D−7: viejas huellas confirmadas por cabezas completas anteriores.
- Última jornada con sorteo: huellas confirmadas que se pueden trasladar a la fuente actual.
- Copias de geometría nueva de la misma madre VT3; recorridos físicos completos, sin cruces de fuente y sin vacíos.
- V9 real de VT2: se atribuye **únicamente al borde físico concreto de la hija VT4**, de dos celdas contiguas, si su terminación reversible había sido confirmada por la cabeza completa de un **turno anterior** y esa fuente ya existía entonces. El vínculo se audita contra las dos celdas y la lectura real de la grilla, no por coincidencia verbal.
- La hija VT4 que efectivamente sale en POST sólo recibe respaldo físico/temporal que exista **en esa misma hija**, no en su hermana.
- Una ruta VT4 explicada por padre heredado y padre de forma nueva se registra una vez con ambas procedencias.

**Nunca agregar trazos predictivos manuales**: la hoja de papá marca automáticamente TODOS los recorridos que coincidan con cabezas ya publicadas; la interpretación de candidatos ocurre después y se estudia PRE.

## Universo reconstruido

Mismos **23 días y 115 cortes** de septiembre/octubre, cinco jurisdicciones argentinas objetivo; seis filas +11 físicamente, incluyendo Montevideo, fuente restringida al turno conocido. Entradas antes del objetivo ya reconstruidas por los laboratorios congelados `GENEALOGIA_PRE`, `OBSERVATORIO_PRE` VT2 y `VT2_HISTORIA_PRE`, sin mezclar versiones antiguas con cabezas de cinco caracteres excluidas.

| Medida | Valor |
|---|---:|
| Madres VT3 seleccionadas históricamente (exposiciones) | **1.104** |
| Grupos madre+cifra, 10 cifras por madre para cobertura diagnóstica | **11.040** |
| Hijas reversibles individuales (deduplicadas ante simetrías) | **21.410** |
| Hijas con algún recorrido VT4 físico **propio** | **9.303** |
| Recorridos VT4 físicos contabilizados por grupo | **22.653** |
| Recorridos con explicaciones heredada y nueva simultáneas | **106**, sin duplicación |
| Hijas físicas con V9 confirmado en su **propio borde** | **1.162** |
| Recorridos físicos con V9 de borde propio | **2.833** |

POST, **sobre la gran bolsa completa y NO sobre Top predictivos**: **20** exposiciones coincidentes madre+cifra, **6** con hija VT4 físicamente formada, y de éstas **solamente 1** con V9 anterior de su borde propio; 17 cortes con alguna coincidencia numérica de grupo y 5 cortes con coincidencia de hija física. Las cabezas POST no participan del generador de ese inventario.

## Corrección puntual descubierta y auditada

**19/09/2026, Nocturna; madre VT3 `109/901`; cifra `4`:**

- Hija `4109/9014`: la cabeza `4109` salió, existen **3** recorridos físicos de esta hija, pero **NINGUNO** está apoyado por la confirmación V9 de borde que se había atribuido al grupo.
- Hermana `4901/1094`: tiene **4** recorridos físicos y borde VT2 `49/94` real previamente confirmado por `5994` de Vespertino. La confirmación temporal pertenece a esta **otra hija que no salió**.
- En la prueba precedente V9 de borde, señalar el grupo como confirmado es descriptivamente válido; señalar que **la hija coincidente** tenía confirmación V9 sería incorrecto. **No modificar retroactivamente rankings ni adjudicar un acierto a V9.**

**26/09/2026, Matutino; madre `013/310`; cifra `7`:** la hija física `0137/7310` que coincidió sí tiene un borde `37/73` confirmado antes en Primera, cabeza completa `3973`. El origen del borde se puede inspeccionar en celdas precisas de la fuente Previa.

**05/10/2026, Matutino:** madre `729/927`, cifra `3`, conserva `3729/9273` con **dos** caminos y `3927/7293` con **tres**; una de sus huellas D−7 proviene de la cabeza anterior `2517`. Cada hija es diferente, y ninguna puede atribuirse la ruta de la otra.

## Implementación y pruebas efectivamente realizadas

Paquete íntegro ZIP de esta conversación: **`modelo-papa-observatorio-unificado-vt2-v9-vt3-vt4-115-11oct2026.zip`**, **14 archivos**, **4.924.139 bytes**, SHA256 **`9433ad63f1173c24e972d558a22ee9f81cac6e1acbeca2e7497e052bdfb3284c`**, test de ZIP **sin errores**. Contiene los tres insumos PRE congelados, resultados crudos POST apartados, `integrar.py` con comandos `pre`/`post`, `verificar.py`, `generar_visores.py`, `crear_informe.py`, dataset PRE/POST, CSV de **los 115 cortes positivos y negativos**, informe y dos HTML **autónomos**.

PRE SHA256 **`337c9ad152fbd842356e255746f2c339ac40a1deaf3c8d90fc29a4beb16f96ca`**; POST SHA256 **`b9edb369f7da84ae194947e2951109100e010e7058b11e8b93238e75f9323985`**.

**Reproducción independiente y antifuga:** insumos originales + scripts copiados a una carpeta **nueva**, SIN archivo POST. `python integrar.py pre` produjo **exactamente** el hash PRE; sólo entonces se agregó POST, se ejecutó `python integrar.py post`, `python generar_visores.py`, `python crear_informe.py`, `python verificar.py`, y **las seis salidas** (dos JSON, dos HTML, CSV, informe) reprodujeron idénticos hashes. La auditoría revisó anterioridad real de la cabeza V9, existencia previa de la fuente, rutas de 4 celdas y propiedad física por hija. `PRE` no contiene `targetHeads`.

Ambos HTML `VISOR_UNIFICADO_PRE.html` y `VISOR_UNIFICADO_POST.html` fueron probados con **Chromium vía Playwright usando `/usr/bin/chromium`**: elección de fecha, turno, madre VT3, cifra, hija, recorrido; fuentes +11 y huella D−7; caso `109/901` en que las dos hijas cambian la evidencia V9, caso `013/310` en que se presenta el borde confirmado. SVG dibujado, **cero errores JS**. Se trata de un visor investigativo, no del motor predictivo oficial.

Para volver a verificar el ZIP extraído desde el repositorio sin reconstruir todo el historial, existe [`scripts/verificar-observatorio-unificado-115.cjs`](scripts/verificar-observatorio-unificado-115.cjs). No se versionaron los 14 MB de JSON ni HTML en GitHub: están en el paquete reproducible de conversación.

## Consecuencia para la arquitectura

La **evidencia** debe existir como entidad propia ligada a `date, turn, source, motherVT3, digitAdded, daughterVT4, routeCells`, con campos independientes de procedencia histórica y reconfirmaciones V9; el selector futuro podrá consultar esas fichas sin inventar padres ni apoyos y sin atribuirle a una hija la confirmación de su hermana.

**Sin señal cuantitativa de mejora predictiva ni autorización para bonificar V9, D−7, D−1, formas nuevas o cantidad de trazos**. El proyecto puede continuar de inmediato sobre hojas y datos existentes, con la capa de observatorio integrado ya construida y auditada.
