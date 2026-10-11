# Punto de control — VT2 y VT3 como familias reversibles con todas sus huellas (11/10/2026)

**Trabajo terminado; expediente reproducible, PRE separado de POST.** Rama aislada `auditoria-sorteo-10oct-2026` del repo `y0t3/Modelo-Papa`. No se modificaron `main`, `src/predictive.ts`, `src/analysisEngine.ts`, motor, selector ni APK.

## Regla de arquitectura del usuario

Los Top 10, Top 5 y Top 3 contienen **familias reversibles**, nunca números independientes ni recorridos físicos repetidos como plazas adicionales. La lectura invertida confirma la misma familia. **Una familia conserva todos sus testimonios físicos**: (fuente, celdas contiguas, D−1/D−7, contactos, antiguas cabezas). Distinta familia **numérica** no borra la identidad de los recorridos físicos que la respaldan; el selector puede agrupar varias fuentes sin atribuir automáticamente corroboración independiente. V9 no debe confundir permanencia con reconfirmación histórica. VT4 heredará también esa estructura y su genealogía VT3→VT4.

## Reconstrucción geométrica de 145 cortes

Se reutilizaron los expedientes censurados anteriores y la bolsa exhaustiva física, con cinco jurisdicciones argentinas como referencia homogénea, sin cruces interturno, huecos, saltos ni reuso de celdas. Se contaron **10.100 recorridos físicos VT2 → 4.565 familias reversibles** y **35.180 recorridos VT3 → 19.617 familias**. En **2.701 familias VT2** y **9.060 VT3** había más de un camino físico dentro de su corte; se guardaron todos.

Se preservó **exactamente** la puntuación del selector V13 previo, entrenada solo con septiembre; se reprodujeron bit a bit los ID de sus diez primeras rutas anteriores en todos los cortes de octubre, también para V13 fijo y aleatorio. Se comparó `RUTAS_V13_ORIGINAL` contra `FAMILIAS_MISMO_V13`, que solo recorre un poco más abajo la MISMA lista para reemplazar lecturas repetidas; se incluyeron dos políticas exploratorias `FAMILIAS_TODAS_HUELLAS` y `FAMILIAS_ALTERNAR_FUENTES` sin ajuste por el resultado objetivo.

### Octubre 2026, 45 cortes y motor V13 aprendido solo con septiembre: cortes con ≥1 familia confirmada

| VT | Política | Top3 | Top5 | Top10 |
|---|---|---:|---:|---:|
| VT2 | Rutas V13 antiguas | 8 | 18 | 29 |
| VT2 | **Mismo V13, familias únicas** | **8** | **18** | **33** |
| VT2 | Agrupar evidencia de todas las huellas (exploratoria) | 11 | 17 | 29 |
| VT2 | Alternar fuentes (exploratoria) | 14 | 20 | 28 |
| VT3 | Rutas V13 antiguas | 2 | 2 | 2 |
| VT3 | **Mismo V13, familias únicas** | **2** | **3** | **4** |
| VT3 | Agrupar evidencia (exploratoria) | 1 | 1 | 2 |
| VT3 | Alternar fuentes (exploratoria) | 0 | 0 | 2 |

Los Top10 físicos originales desperdiciaron **61 plazas VT2 y 180 plazas VT3** por repetir la misma familia en octubre. Deduplicar explica exactamente las nuevas candidatas ganadoras; es una **mejora representacional**, no prueba de predicción. El control aritmético de sorteo uniforme de K familias físicas del mismo universo por corte espera aproximadamente VT2 **12,14 Top3; 18,53 Top5; 29,85 Top10** y VT3 **1,15; 1,89; 3,70** cortes con coincidencia en octubre, por lo que esos resultados no acreditan ventajas predictivas claras. Las 45 observaciones están agrupadas en nueve días y octubre ya se había estudiado; no es holdout independiente.

### Evidencia histórica por múltiples trazos

En las familias visibles en los Top del archivo PRE hay **4.222 apariciones** de familia/corte, **3.161 con múltiples rutas**, **1.265 con varias fuentes**, **1.011 con D−1 y D−7 en alguna ruta**; en **249** casos esos dos recuerdos provenían de **rutas físicas distintas**, no del mismo dibujo. La herencia de un testigo no convierte automáticamente en acierto histórico a todos los testigos de la familia.

## Integridad y paquete ya creado

Directorio `/mnt/data/auditoria_vt2_vt3_familias_multihuellas_145`, ZIP `/mnt/data/modelo-papa-vt2-vt3-familias-multirutas-top3-top5-top10-145-cortes.zip` (25 archivos; tamaño **4.766.778 bytes**), ZIP SHA256:
`00854194b101e7b76090c1f0e13dbd2016032c8af1426b40fbf7289ba35c7070`.

Documentos principales:
- `ANTES_TOPS_POR_FAMILIAS.html` — 145 hojas PRE con tableros +11, lista por familias, todos sus trazos y cada antecedente. Sin cabezas objetivo, no comparte JSON POST.
- `DESPUES_COTEJO_FAMILIAS.html` — 145 cotejos con cabezas completas, 4 políticas y rankings para Top3, Top5 y Top10.
- `FAMILIAS_PRE_TODAS.json.gz` — **todas** las familias físicas agrupadas, aunque no lleguen al Top, con todas sus huellas.
- `PRE_FAMILIAS_Y_LISTAS.json` — PRE SHA256 **`222ef3fe31439c2008282b271470cd4bf36697d07f126e98fdf7adde51f5915b`**.
- `POST_COTEJO_FAMILIAS.json`, `BALANCE.csv`, `INFORME_RECONSTRUCCION_VT2_VT3.md`, `LEEME_PRIMERO.md`, fuentes históricas, scripts `1_preparar_PRE.py`, `2_cotejar_POST.py`, `3_crear_visores_informe.py`, `4_probar_interfaz.py`, `5_pruebas_y_empaquetado.py`, `PRUEBAS_DE_INTEGRIDAD.json`, capturas PRE y POST.

**Antifuga verificada:** se retiró FÍSICAMENTE el archivo POST octubre, se reejecutó preparación, y se obtuvo exactamente el mismo SHA256 PRE. 145×2 geometrías reconstruidas y test de contigüidad/source único en todas las huellas; 1.880 registros POST; 10 primeras rutas del V13 previo reproducidas; Top sin repetición; Chromium real `/usr/bin/chromium` con Playwright `page.set_content`, selección y dibujo de familia VT3 `539/935` con dos trazos, POST VT2 33/45; cero errores JS. `ZipFile.testzip()` satisfactorio.

**Próximo paso:** mantener top como familias y llevar a V12/V14 la diversificación como *decisión sin preferencia aprendida demostrada*. Comparar costos y oportunidades entre VT2/VT3/VT4, evitando que una sola matriz saturada de rutas duplique puntuaciones. No activar nueva lógica en producción hasta observar rendimiento independiente.
