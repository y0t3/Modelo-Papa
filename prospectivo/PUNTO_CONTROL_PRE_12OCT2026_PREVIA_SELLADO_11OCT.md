# PRE genuinamente anterior — VT3 madre → VT4, Previa del lunes 12/10/2026

**Registro hecho 11/10/2026, antes de Previa del 12/10/2026.** Sorteo Ciudad programado por LOTBA el 12/10 a las **10:15 ART**, número **53022** (https://quiniela.loteriadelaciudad.gob.ar/). Cortafuegos conservador en generador: **10:05 ART**. Compromiso PRE alojado en el mismo repositorio en `prospectivo/PRE_2026-10-12_Previa.json`, commit Git **`0eb93d85f43d9b798e6560bf74a00f4a6fb358da`**, archivo creado **antes del resultado objetivo**.

**SHA256 del archivo PRE con salto final de línea:**
`021311ddd95c9309ec50103cdfe9bdec1db114c260177d3ed628f9f6b7346190`.

**Hora que registró el generador en el PRE:** `2026-10-11T23:07:26.107833+00:00` (20:07:26 ART del domingo). La evidencia más importante de fecha de divulgación es el commit público, no una hora declarada dentro de JSON. POST **no existe todavía para el objetivo al construir el archivo**, por lo que no se coteja ni se publica ninguna cabeza del 12/10. **No confundir abstención con acierto.**

## Condiciones congeladas

- Regla D−7: comparar lunes **05/10** con lunes **12/10**; hoja vieja completa usa como base última Nocturna anterior, sábado **03/10**.
- Hoja nueva PRE Previa: única fuente `prevNocturno`, resultado Nocturna del sábado **10/10**. Domingo 11 sin sorteos. Resto de fuentes del lunes **NO disponibles**.
- Mismos recorridos dentro de un único par 6×2, todos los caminos de VT3 confirmados, mismo traslado D−7 y genealogía de las dos hermanas al añadir cifra; inversas como propiedades de cada hija.
- D−7 confirmó **0** rutas VT3 dentro de `prevNocturno` (fuente0), **0** de `Previa` (fuente1) y **12** de `Primera` (fuente2), ninguna en otras fuentes. Como Previa nueva solo dispone de fuente0, **ninguna madre elegible**.
- Resultado PRE para **los tres métodos congelados** `D7_MADRES_DIGITO_FIJO`, `D7_MADRES_ROCE`, `MULTIRRUTA_MADRES_ROCE`: Top3=Top5=Top10=**vacíos**, con **abstención total explícita**. Está prohibido completar el Top con cifras inventadas. No hay pronóstico positivo para la Previa del 12.
- Primera también carecería de **orígenes D−7 en sus dos fuentes** (0 y 1), pero **NO hay todavía PRE genuino de Primera**: la captura real de la Previa del mismo 12 debe existir y cotejarse antes de sellar formalmente Primera. Los 12 testigos D−7 de fuente2 solo serán accesibles a partir de **Matutino**, si se recibe y cierra correctamente la Primera del día.

## Procedencia e higiene no ajustada a resultados

Archivos crudos anteriores al objetivo tomados del artefacto GitHub Actions **`11690333869`**, run `38107717643`:
- `2026-10-03.json`: `839bdf39b00a4a2d3077239f95b9efe88bb7a3010b60d87769aff99cfbab25fc`.
- `2026-10-05.json`: `23cafe2e14d01aa7965b63d190d897cf1b6a70a39236aec69b61c8384f7dd94e`.
- `2026-10-10.json`: `f8c4d3331188575fd7167df291a1a4f0ddc3f2164f6671c6d5e27d45905bc92d`.
- SHA del módulo geométrico de 115 cortes utilizado por generador prospectivo: `f584e15aedd99a04df1855034deb30f8cf605ed2690d381ab70d59926879552c`.

**Advertencia de dato detectado:** 25 cabezas en 30 JSON de origen de Sept/Oct tienen CINCO caracteres, de las cuales 10 afectan las seis jurisdicciones de la grilla del modelo. El cargador histórico Python las tomaba como inválidas/vacías; el cargador real de la app `src/cabezas.ts` usa **las últimas cuatro**. Este primer PRE usa la corrección para representación física fiel y la declara por adelantado. **No se proclama equivalencia numérica perfecta al backtest anterior** sin análisis de sensibilidad; no ajustar rankings según POST.

## Verificaciones y reproducibilidad

El paquete reproducible en el archivo de conversación `modelo-papa-PRE-real-vt4-2026-10-12-Previa.zip` contiene PRE, SHA, tres JSON fuente literales, `prospect_vt4.py`, copia exacta del módulo geométrico `geometria_115_cortes_original.py` y `test_prospect_vt4.py`. ZIP de **14.109 bytes**, SHA256 `1f804c3be52bdc5381790294a5f58796d396ac44f9f8b295456c5e1eef26f5bd`. Integridad `ZipFile.testzip()` OK.

Las pruebas `test_prospect_vt4.py` validan:
1. Previa 12/10: sin madres ni selecciones, origen D−7 contabilizado 0/0/12/0/0.
2. Normalización consistente con la app: Santa Fe Nocturno 10/10 `26215` → `6215` para tabla +11.
3. Un **tablero artificial** con Previa y Primera conocidas, resto vacío: genera 31 madres, 310 grupos VT4 para demostrar que el algoritmo funciona; **no se publica como pronóstico**.
4. Al insertar `9999` en Matutino del ejemplo artificial, PRE falla por cabeza objetivo presente. También verifica vecindad, células únicas y dos hijas orientadas y sus inversas.

**Siguiente paso, todavía NO ejecutado:** capturar y sellar por separado los cortes de Primera/Matutino del lunes si existe información real de turnos anteriores antes del plazo. No se puede tratar una reconstrucción histórica de mañana como PRE genuino si se ejecuta después de sus sorteos. En paralelo falta el código EXACTO VT2 Top3 V9 para comparar V9 con D−7; nada se inventó para suplirlo.

**Motor oficial, tablero automático y APK: sin cambios.**
