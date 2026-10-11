# Punto de control — V13 con V9 temporal verificado y árbitros V12/V14: 145 cortes (11/10/2026)

**Solo laboratorio.** Rama `auditoria-sorteo-10oct-2026`; sin cambios en `main`, en el predictor oficial ni en la APK.

## Objetivo y corrección

Integración auditada de **V7** (D−7/D−1), **V8** (geometría física y fuentes), **V9** (confirmaciones reales de la familia en turnos anteriores, contado **una sola vez por turno de la jornada**, no por múltiples caminos), **V13** (Top3⊂Top5⊂Top10 de familias reversibles y todos sus recorridos), **V12** (proteger una familia V9 confirmada y registrar lo que entra/sale) y **V14** (Top3/Top5/OBSERVAR, auditar abstenciones y presupuesto).

Los Top contienen **familias completas**, no números independientes ni cada huella como plaza adicional. Cada familia física retiene todos sus recorridos por fuente y celdas. Las extensiones VT4 aleatorias sin una cuarta celda física válida quedan fuera de este ensayo de familias físicas; tampoco se transfiere automáticamente una confirmación de la VT3 madre a la hija VT4.

Se reprodujeron de forma **exacta los 1.305 Top10 anteriores** (145 cortes × VT2/3/4 × V7/V8/V13) antes de modificar V9. Entre 1.450 plazas históricas de V13 de cada VT, **694 VT2, 713 VT3 y 741 VT4** tenían puntuación V9 aunque **no** existiera confirmación exacta previa de esa familia. Esas puntuaciones podían ser roces/contactos o madres: no son inválidas, pero **no deben etiquetarse como reconfirmaciones genuinas**.

## Comparaciones experimentales

- `V13_ANTERIOR`: RRF original de V7/V8/V9 (mezcla de indicadores).
- `V13_TEMPORAL`: RRF con V9 basado exclusivamente en número de **turnos anteriores distintos** con confirmación exacta de la familia.
- `V13_MEMORIA_SIN_DOBLE_VOTO`: un canal de historia `max(evidencia V7, evidencia V9)` más evidencia V8, sin sumar dos veces una misma historia.
- `V13_ESTADO_PRIMERO`: estado temporal genuino primero; V8 físico desempata.
- `V12_PROTEGER_1_V9`: protege una sola familia realmente confirmada por V9, rellena desde V13 sin doble voto.
- Referencias V7, V8, azar hash fijo y V12 protege una V7.

**VT2 por período: cortes con al menos una familia físicamente confirmada en Top10**:

| Método | Septiembre (100 cortes) | Octubre (45 cortes) |
|---|---:|---:|
| V13 antiguo | 64 | 26 |
| V13 temporal | 68 | 32 |
| V13 memoria sin doble voto | 66 | 32 |
| V13 estado primero | 61 | **36** |
| V12 protege 1 V9 | 66 | 33 |
| V8 geometría | 64 | 33 |

En octubre VT2 Top3/5/10: antiguo **15/22/26**, temporal **12/21/32**, sin doble voto **14/21/32**, V12 protege V9 **16/22/33**, V9 primero-V8 **14/20/36**. VT3 octubre Top10 antiguo **3**, temporal **2**, sin doble voto **2**, V9 primero-V8 **4**, V12 **2**, V8 **5**. VT4 octubre Top10 0 en antiguas/fusiones/V12, 1 con estado primero o V8. **No hay mejora estable en VT3/VT4, ni Top3/5 VT2.**

## Controles imprescindibles

- El control uniforme Top10 VT2 octubre dentro de la **misma unión PRE de familias propuestas** espera **29,98** cortes acertados. Se ejecutaron **3.000 controles Monte Carlo con una prioridad aleatoria fija por fecha+VT+familia**, compartida entre turnos, preservando dependencia día-familia: promedio **29,985**, intervalo central aproximado **25–35**. Observado V13 temporal **32** (cola ≥ observado **0,293**); V9 primero-V8 **36** (cola nominal **0,015** **SIN corrección por múltiples pruebas ni ajuste por diseño tras explorar resultados**). En **septiembre** esa última obtuvo solo **61**, versus ~**62,6 esperados**, inconsistencia temporal. Ya se probaron numerosas hipótesis con octubre conocido, no un holdout independiente ni prueba de eficacia.
- V14 experimental OCT VT2: **9 cortes TOP3, 22 TOP5, 14 OBSERVAR**, mostró **137 familias en total**, produjo **11 cortes con coincidencia** frente a **~10,8 esperados para ese mismo gasto**. VT3: 32 OBSERVAR, 65 familias, 0 aciertos; VT4: 40 OBSERVAR, 25 familias, 0. Abstención no implica acertar la ausencia de número.
- Por cada sustitución V12/V13 se guardaron **familias ganadoras que entraron y familias ganadoras que salieron**; elegir un ganador solo por la nueva entrada sería sesgo.

## Integridad y paquete

**`/mnt/data/modelo-papa-v13-v9-v12-v14-familias-temporales-145-cortes.zip`**, archivo ZIP verificado sin error, **29 archivos**, 10.923.772 bytes, SHA256 `e795dc6f6d5c09d2eaccf530bbde0148292fe8787b0dd0b726a0b56e1835f4dd`. Paquete autocontenido con todos los seis insumos, scripts 1–5, CSV, visor y cotejo, hashes y documentación. Carpeta `ensayo_v13_v9_eventos_sin_doble_voto_145/`.

- `ANTES_TOPS_FAMILIAS_V13_V9.html`: visor **solo PRE**, fecha/turno/VT/método/Top, todas las fuentes/celdas/rutas, inversión y antecedentes reales; **no contiene cabeza objetivo**.
- `DESPUES_COTEJO_V13_V9_V12_V14.html`: visor POST independiente con cabezas completas y familias físicamente confirmadas.
- `INFORME_V13_V9_V12_V14.md`, `BALANCE.csv`, `CAMBIOS_V12_V13.csv`, `ABSTENCIONES_V14.csv`, `CONTROL_AZAR_FAMILIA_JORNADA.csv`, `DECISIONES_FAMILIAS_PRE.json`, `COTEJO_POST.json`.
- SHA256 PRE **`c4b4dd1bc3e648f39d46d19cdf64f3727a6d17352c3f8f274fa747d8f24e336d`** y POST **`93807a722f38a9e4bfde931698a69de8ccf44b9ec4f6a500dfeaefa62fcc9b3a`**.
- **Prueba antifuga real**: POST de los insumos físicamente oculto; regeneración PRE dio idéntico SHA, POST luego restaurado.
- **32.773 rutas físicas** de las familias presentes en rankings comprobadas contra tableros 6×2 con fuente única, sin saltos ni reuso, ida e inversión; **12.322 apariciones familia-corte**, **3.915 listas anidadas** (algunos cortes tienen menos de 10 familias físicas), **1.305** rankings viejos reproducidos. Páginas probadas en **Chromium/Playwright** (fecha, turno, modalidad, política, Top, click de familia, alternar rutas, inversión, POST cabezas), 0 errores JS.
- Comparación temporal es retrospectiva y exploratoria; ocultar POST impide fuga de programa pero no deshace que las reglas se pensaron en un histórico ya examinado.

## Decisión

**Sí conservar como diseño experimental**: separación de memoria genuina (V9), evidencia de historia (V7) vs geometría (V8), una sola plaza por familia con todas las huellas (V13), registro de sustitución (V12), abstención y presupuesto (V14). **NO habilitar** coeficientes, nuevo ranking o V14 nuevo en producción hasta validación independiente. La hipótesis histórica Nocturna anterior +11 sigue abierta como preferencia flexible, no forzosa.
