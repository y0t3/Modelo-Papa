# Modelo Papá — observatorio de genealogía física por cada hija VT4

**Ejecutado el 11/10/2026. Trabajo sobre los 115 cortes históricos existentes**, no un pronóstico prospectivo ni cambio del motor oficial. Este punto incorpora una **capa de datos y un observatorio visual**, no nuevas puntuaciones ni criterios de filtrado. Rama `auditoria-sorteo-10oct-2026`.

## Problema que resuelve

La madre VT3 `729/927` + cifra `3` genera dos **hijas hermanas orientadas**: `3729` y `3927`; cada una tiene su propia inversa reversible: `9273` y `7293`. Que exista camino físico para una hermana **NO** demuestra que la otra tenga camino VT4. La inversa tampoco forma otra madre `273`.

Se construyó un **libro mayor por fecha/turno/madre/dígito/hija reversible/testigo**, que registra:
- Fuente (único par 6×2), cuatro celdas concretas, lectura del camino, las tres celdas padre.
- Clasificación del padre: huella heredada, otra colocación igual o nueva forma; en este corpus no aparecieron padres de la segunda clase.
- Antecedentes de D−7 y/o de **última jornada con sorteos**; se recuperaron **1.699 anotaciones de cabezas antiguas completas D−7** y **663 de jornada previa**, entre 1.653 y 657 antecedentes de rutas padres respectivamente. Varias anotaciones pueden apuntar a una misma ruta actual.
- Orientación literal de **cada hija**, su inversa y su familia canónica; testigo físico **sólo en la hija que forma**.
- Fusionar un mismo recorrido VT4 `fuente + 4 celdas reversiblemente normalizadas` si pudiera explicarse por dos madres físicas de la misma VT3; conservar ambas justificaciones y **no duplicar** el recorrido.
- Toda la información PRE se produce sin abrir archivo de resultado objetivo; POST y cotejo quedan aparte. **El marcado automático de la hoja permanece basado exclusivamente en cabezas realmente coincidentes.**

## Inventario PRE real, sin selección adaptada a POST

**115 cortes / 23 jornadas, 1.104 madres VT3 Top10 y 11.040 grupos madre+cifra** (dígitos 0–9, prueba de cobertura, no 11.040 apuestas).

| Cantidad de **familias hijas reversibles distintas con recorrido físico** por grupo | Número de grupos |
|---|---:|
| 0 | **4.974** |
| 1 | **2.829** |
| 2 | **3.237** |
| Total | **11.040** |

**670 grupos** de madre simétrica produjeron **una única familia hija reversible**, no dos; no se duplicó. Se preservaron **22.653 recorridos físicos VT4 distintos *dentro de su propio grupo madre+cifra***. La suma por procedencia tiene **10.875 testimonios desde madres heredadas** y **11.884 desde madres de forma nueva** = 22.759 explicaciones; **106** rutas VT4 fueron sustentadas por ambos tipos de madre, de modo que 22.759 − 106 = **22.653** caminos deduplicados dentro de los grupos. No confundir testimonios, grupos y cortes como predicciones independientes.

**Post diagnóstico sobre la bolsa completa**, no sobre Tops pequeños: **20 exposiciones coincidentes madre+cifra** en 17 cortes, pero **sólo 6** corresponden a la hija exacta con camino físico, mientras **14** son exclusivamente numéricas sin tal camino. Hubo 5 cortes con al menos coincidencia física y 13 con alguna coincidencia numérica sola; uno comparte ambas clases.

**Comprobación de regresión Top10×3**, sin mover ni un puesto:
- Orden heredado: **5** cortes coincidentes a nivel grupo, **4** con hija físicamente formada.
- Orden formas nuevas: **6** coincidentes a nivel grupo, **4** con hija físicamente formada.
- Por lo tanto no existe la supuesta mejora de 5→6 para **aciertos físicamente respaldados**.

### Dos casos con pruebas completas

**26/09 Nocturna, VT3 `283/382`, cifra `4`:**
- Hija `4283/3824`: **sin camino VT4**, pero resultado POST `4283` → **acierto sólo numérico del grupo**.
- Hija `4382/2834`: **un camino físico** de forma nueva en fuente Primera, posiciones `0:1 → 1:0 → 2:1 → 3:0` → no hubo cabeza de esa hija.
- **No transferir** el camino de `4382` a `4283`.

**05/10 Matutina, VT3 `729/927`, cifra `3`:**
- `3729/9273`: **dos** recorridos físicos, evidencia de D−7 y última jornada.
- `3927/7293`: **tres** recorridos físicos, evidencia de última jornada.
- Cabeza antigua completa D−7 `2517` explica una huella original trasladada a esta madre actual; resultado posterior Santa Fe `3729` coincide con la hija correcta, con su propio camino.
- Es validación retrospectiva de la geometría, **no** prueba de una regla para preferir dígito 3.

## Artefacto reutilizable y auditoría

Archivo ZIP entregado en esta conversación **`modelo-papa-genealogia-hijas-vt4-115-cortes-11oct2026.zip`**, **17 archivos**, **4.135.820 bytes**, SHA256 **`f0605b7e0d222fdbddce1649cf8b231ccf181312acaff85ed598349687ce4fd8`**; ZIP test de integridad OK. Contiene los cuatro PRE/POST insumos congelados y los datos originales, scripts Python estándar, `GENEALOGIA_PRE.json`, `GENEALOGIA_POST.json`, matriz CSV por hija, resumen CSV de todos los cortes, informe y dos **visores HTML autocontenidos para 115 casos**.

Hashes:
- PRE fuente `PRE_COPIAS.json`: `19c7b3ca7039854c6b425f0ca21503cb7c3bc1a8758515616b88888ea0c6779b`.
- PRE genealogía nueva: `b22bf15f6208aadcc1d8094db3b758f4ffd52b70c67e92d6c00c7e3a543c7ed3`.
- POST genealogía: `ccefe7b5018abd6b7d7a326509bca5f89180d7759794442059a65b3014e64369`.

**Reproducción ejecutada desde una carpeta nueva**: se retiraron físicamente los ficheros POST y se obtuvo exactamente el mismo SHA del PRE; luego al añadir POST se reprodujeron byte por byte POST, ambos visores y el informe. `verificar_integridad.py` revalida **las 22.653 rutas**, reversibilidad, vecindad, no reutilizar celdas, 106 apoyos compartidos, los dos casos y regresión de Tops anteriores.

Los **dos visores PRE/POST** fueron probados en **Chromium con Playwright**, navegando por **23 fechas**, turno, madre, cifra, testigos, incluido 26/09 Nocturna y 05/10 Matutina; SVG generado, dos hijas bien separadas, cabeza histórica 2517 visible, **PRE sin resultados objetivo**, cero errores JS.

Se agregó al repositorio el **módulo de regresión experimental independiente** [`scripts/experimental-vt4-sibling-lineage.cjs`](scripts/experimental-vt4-sibling-lineage.cjs), que implementa las dos hijas, validación de camino físico y cobertura numérica versus física usando el caso `4283/4382`. Este script no está integrado a producción. El ZIP grande no se versionó en GitHub: está disponible como archivo reproducible en esta conversación.

## Decisión

**Usar la genealogía individual por hija como dato del observatorio experimental**, no como supuesto pronóstico ni nuevo filtro. Reutilizar este libro mayor para futuras pruebas sobre datos existentes y distinguir resultado numérico, hijo real, ruta y procedencia. No seguir sumando puntos por mera cantidad de trazos, ni cambiar el motor / Top ni esperar nuevos sorteos para avanzar.
