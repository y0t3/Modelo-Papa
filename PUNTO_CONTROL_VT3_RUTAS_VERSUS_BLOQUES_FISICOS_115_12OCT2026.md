# Modelo Papá — VT3: recorridos frente a bloques físicos distintos

**12/10/2026. Auditoría histórica ejecutada sobre las 23 jornadas/115 cortes existentes.** Objetivo principal: discriminar VT3 antes de abordar VT4, sin agregar nuevas raíces ni alterar hojas automáticas o rankings oficiales. Rama experimental `auditoria-sorteo-10oct-2026`; **sin cambios en `main`, motores V7–V14 ni APK**.

## Hallazgo físico y regla de interpretación

Una terna VT3 puede formarse por **varios recorridos contiguos diferentes sobre las mismas tres celdas** (el recorrido tiene orientación/orden, la **huella o bloque físico** es el conjunto de celdas). Las reglas del usuario siguen obligando a **conservar todos los recorridos válidos**, incluso invertidos, no saltar celdas, no cruzar fuentes ni repetir casillas. Pero al medir cuántas figuras independientes hay, un único bloque físico debe contarse **una sola vez** por fuente.

Sobre las **3.655 exposiciones** de madres D−7 en los 115 cortes: **2.329 rutas bifurcadas**, **2.227 bloques de tres celdas distintos** dentro de la exposición madre/corte, **102 lecturas adicionales** sobre bloques ya contados. La duplicación apareció en **97 exposiciones** pero sólo **27 pares familia-fecha**, ya que varias exposiciones corresponden a distintos turnos de una misma jornada.

Se congeló exactamente la bolsa original por corte y todos los Top se miden en **familias VT3 reversibles**, no números individuales ni hijas VT4.

## Comparación PRE ciega a objetivos y POST separado

| Criterio morfológico PRE, madres D−7, mismo cupo | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| **D−7 bifurcaciones por número de recorridos** (ranking original congelado) | **5** | **8** | **16** |
| Bifurcaciones por **bloques de tres casillas distintos** | **5** | **8** | **15** |
| Bifurcaciones por **formas relativas distintas** | **5** | **8** | **16** |
| Bifurcaciones por **terceras celdas/salidas diferentes** desde tramos heredados | **5** | **8** | **15** |
| Número de **tramos heredados de origen** que admiten bifurcaciones | **5** | **9** | **15** |

Las políticas nuevas sólo reordenan **las mismas familias elegibles** que el ranking D−7 anterior. Cada caso conserva presupuesto Top3/5/10 y sus orientaciones numéricas; no se produce ningún candidato VT4.

La deduplicación de bloques cambia el Top10 en **7 de 115 cortes**, concentrados el **16/09 (4 cortes) y 05/10 (3 cortes)**, pero **no rescata ningún corte**: pierde sólo **05/10 Vespertina**. Allí la madre **`799/997`** tenía dos rutas bifurcadas sobre **un bloque**, estaba 9.ª en el ranking de rutas y pasa a **12.ª** por bloques. En 05/10 Matutina `729/927` permanece en ambos Top10.

## Comparación contra controles de igual composición

Control exacto descriptivo por corte (modelo hipergeométrico estratificado): preserva **cantidad de familias seleccionadas por bandas** de caminos actuales, fuentes, huellas antiguas, cabezas históricas y una/dos lecturas numéricas. El promedio esperado para el Top10 original es **12,155 cortes** y para bloques **11,905**, frente a 16 y 15 observados; la diferencia de la política original frente a ese control tiene intervalo exploratorio agrupado por las **23 jornadas completas** **[−0,39;+8,15] cortes**, incluyendo cero. El laboratorio anterior empleaba otro control por densidad que daba **13,46**: son estratificaciones diferentes, no combinar sus estimaciones como si fueran la misma.

Bootstrap de la diferencia **ranking original − bloques** a nivel día: intervalo exploratorio **[0,+3]** (el efecto de una sola jornada). Todo septiembre/octubre fue investigado previamente con muchos criterios, por lo cual los intervalos **NO** constituyen pruebas confirmatorias de predicción.

**Decisión:** adoptar la distinción **recorrido / bloque geométrico** en la capa descriptiva del observatorio, pero **no promover el nuevo orden** al motor. Las formas, salidas y tramos de origen tampoco justifican por sí solos un nuevo ranking VT3 en esta muestra. El verdadero problema aún es discriminar familias VT3 con poca cobertura numérica y sin confundir evidencias correlacionadas.

## Reproducción y visores

Laboratorio ZIP de conversación: `modelo-papa-vt3-bloques-fisicos-versus-recorridos-115-cortes-12oct2026.zip`, **14 archivos**, **498.085 bytes**, SHA256 **`4e31b2c4ed4739e443003aa285ef27e26e7f9c81156c3da7cf2da860ed291c63`**. Incluye PRE original congelado de VT3, objetivos en archivo POST independiente, código Python 3 (`analizar.py`, `visores.py`, `informe.py`), auditoría de rutas, balance de los 115 cortes, informe, README, manifiesto SHA256, pruebas Playwright y **dos visores HTML autocontenidos**.

- `MORFOLOGIA_PRE.json`: SHA256 **`cefd3ba7c2c2dda6f3de0286584f3b562b1177613a6c395f25db1cefdea7ea0c`**.
- `MORFOLOGIA_POST.json`: SHA256 **`f8d7bc0c4849c170635d237f821dbd066477970e3d53c2129f4a1de18c23a66e`**.
- ZIP pasó prueba de integridad. Reproducido **en carpeta nueva**, primero sin `FUENTE_OBJETIVOS_POST.json` ni ningún POST, con hash PRE y visor PRE idénticos; después con POST, rearmando JSON, CSV, visor e informe con hashes **idénticos**.
- `python analizar.py verify` verifica geometrías de tres celdas de **todas las madres D−7** de los 115 cortes, su lectura reversible, fuentes, celdas contiguas y rutas congeladas.
- Visores `VISOR_VT3_BLOQUES_PRE.html`/`VISOR_VT3_BLOQUES_POST.html`: fechas, turnos, método de ranking, madre VT3 y fuente; hojas D−7 y actual, todas las rutas distinguibles por origen D−7/bifurcación/otra, agrupadas por bloque de celdas. Ambos **probados en Chromium/Playwright**, caso 05/10 Vespertina `799/997`: puesto 9→12, 23 fechas, 2×6 celdas por fuente, **sin errores JavaScript**, sin resultados objetivo en PRE.

**Siguiente investigación con datos existentes, SIN esperar nuevos sorteos:** comparar testimonios procedentes de **distintas fuentes y cabezas históricas confirmadas** después de deduplicar bloques físicos, y verificar si aportan discriminación para VT3 más allá del número de caminos. No aplicar primas automáticas ni extender prematuramente a VT4.
