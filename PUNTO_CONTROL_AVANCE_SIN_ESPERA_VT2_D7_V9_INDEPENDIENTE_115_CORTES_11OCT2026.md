# Avance inmediato con datos existentes — VT2: D−7 vs confirmaciones previas reales V9

**11/10/2026.** Motivación: continuar el proyecto con las hojas, cabezas y recorridos ya disponibles; **no paralizar el desarrollo esperando datos futuros**. Es un experimento retrospectivo **independiente y exploratorio**, no validación de capacidad de pronóstico ni repetición exacta del V9 original. `main`, motor, hoja automática, reglas geométricas, V7–V14 de producción y APK **sin cambios**.

## Archivo reproducible

ZIP de conversación **`modelo-papa-laboratorio-independiente-vt2-d7-v9-115-cortes-11oct2026.zip`**, **42 archivos, 364.095 bytes, SHA256 `e0928c1276fe282c5fcc2ca5a5ef6792da12b6ca9e07408cfa1d9f79af185a6c`**. Incluye 30 JSON originales normalizados (últimas cuatro cifras como en la app), programa `estudio.py`, test `verificar.py`, generador de visores, corte PRE y POST por separado, archivo de ranking, cotejo y balance por corte, dos HTML autocontenidos e informe detallado. **Reproducido en carpeta aislada** sin cambios de resultados ni del hash PRE.

## Diseño

- **23 jornadas, 115 cortes**: septiembre 70 y octubre 45. 5 jurisdicciones argentinas como objetivo; **seis** filas para geometría de la hoja +11, incluida Montevideo.
- Bolsa idéntica de **familias VT2 reversibles** en cada turno para D−7 y V9. Cada familia dispone de todos sus trazos reales contiguos dentro de cada fuente única 6×2. El marcado de hoja sigue estrictamente POST a la cabeza conocida; nunca se eligieron líneas prediciendo.
- `D7_BASE`: prioridades por fuentes, marcas anteriores realmente confirmadas, rutas originales y traslados D−7.
- `V9_REAL_PRIOR`: sobre el mismo conjunto ordena primero el **número de turnos anteriores del propio día** que confirmaron una familia que ya era físicamente accesible antes de esos turnos. Luego aplica D7_BASE sin cambiarlo.
- Los órdenes fueron calculados leyendo solo el `INPUT_PRE.json` sin resultados objetivo ni posteriores. No se reconstruye el V9 exacto del laboratorio antiguo de siete políticas: **no se debe llamar réplica de 23/45 de octubre**.
- La fuente de cada corte es únicamente la Nocturna anterior y los turnos del mismo día ya cerrados. Sin fuente cruzada; sin saltar/repetir celdas; se conservan todas las alternativas.

## Resultados: cortes con ≥1 cabeza objetivo que coincide con Top de familias

| Top | Septiembre D7 → V9 (70) | Octubre D7 → V9 (45) | Total D7 → V9 (115) | Azar de bolsa (V9, media) |
|---|---:|---:|---:|---:|
| 3 | **17 → 18** | **16 → 18** | **33 → 36** | **30,289** |
| 5 | 24 → 28 | 22 → 23 | 46 → 51 | 46,504 |
| 10 | 46 → 43 | 31 → 35 | 77 → 78 | 75,824 |

Control uniforme con la misma bolsa elegible y cupo, usando prioridades aleatorias compartidas entre los cinco turnos de cada jornada: **2.500 simulaciones con semilla y orden deterministas**. Cola nominal del azar respecto a V9: Top3 **0,1287**, Top5 **0,2139**, Top10 **0,3739** (exploratorio tras búsqueda previa, no inferencia confirmatoria).

En Top3 V9 **rescata 15** cortes respecto a D7 pero **pierde 12**: mejora neta **+3**. Bootstrap de diferencias pareadas por las **23 jornadas completas**: **[−9,+16]** cortes. Por jornada, ocho ganadas por V9, ocho por D7 y siete empatadas. V9 cambia el Top3 en 86/115 cortes; en 88 cortes se observó alguna familia elegible con confirmación anterior real. Bolsa total de 3.309 exposiciones de familias; 110/115 cortes tenían ≥1 candidata coincidente si se tomaba TODA la bolsa (techo de cobertura, no top ni predicción).

**Casos verificables:** 05/10 Vespertina, V9 Top3 incluye familia `13/31`, previamente confirmada en Matutina Ciudad `5513` y luego coincide en Vespertina Córdoba `2631`; D7 Top3 no la incluye. 07/10 Nocturna, D7 Top3 incluye `79/97` y coincide con Provincia `8579`; V9 Top3 había desplazado esa familia y falla.

## Antifuga, geometría y limitaciones

- **22.560 rutas físicas** antiguas/actuales revisadas; celdas contiguas, fuente única, sin reutilización y lectura reversible correcta.
- Los 115 PRE cumplen orden temporal de fuentes y reconfirmaciones: únicamente cabezas realmente anteriores.
- Hash PRE inmutable: **`420e9f8ad81dd6ce7e37b1d2b9caf5e84009c6ddeab234999de9ba99f5dc2208`**. Reproducido idéntico tras retirar por completo POST y tras alterar el resultado objetivo del último corte histórico (10/10 Nocturna). El experimento no fue prospectivo pese a esta separación técnica.
- El ZIP fue descomprimido en carpeta nueva; `python estudio.py split`, `python estudio.py pre`, `python estudio.py post`, `python verificar.py` replicaron los resultados y los hashes. Los controles Monte Carlo también son ahora deterministas con conjuntos ordenados.
- `VISOR_115_PRE_VT2.html` y `VISOR_115_POST_VT2.html` muestran los cinco turnos por jornada, los tops por política, fuentes y todos los recorridos físicos de cada familia. Su JavaScript pasó `node --check`, pero **no** se pudo comprobar apertura efectiva en Chromium porque este entorno carece del ejecutable Playwright.
- Se usaron días Sept/Oct previamente investigados, por lo cual intervalos y colas son descriptivos y no justifican cambiar el ranking en producción ni apostar.

## Próximo desarrollo sin esperar fechas

Hacer que los observadores **D−7 y V9 puedan discrepar explícitamente**: mostrar por familia la ruta D−7, el último turno real de confirmación, las rutas físicas presentes y cómo cambia su puesto en el Top. Anotar positivos y negativos; no decidir la cifra por cantidad de líneas ni mezclar V9 por default. Trabajar luego el mismo esquema de observación para VT3 y las **dos hijas hermanas VT4 por madre**, manteniendo inversión y genealogía diferenciadas. La validación genuinamente futura podrá usarse cuando haya datos, pero **no es prerrequisito de desarrollo**.
