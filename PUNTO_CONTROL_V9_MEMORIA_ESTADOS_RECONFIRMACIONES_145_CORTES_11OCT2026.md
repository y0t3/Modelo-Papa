# Punto de control: V9, memoria temporal por familias y reconfirmaciones reales

**11/10/2026, ensayo ejecutado**, rama `auditoria-sorteo-10oct-2026` únicamente. **No se modificó main, src, motor oficial, V13 de producción ni APK**.

## Propósito y regla

V9 deja de confundir una huella físicamente presente con una confirmación; calcula, para cada corte PRE y familia física reversible (VT2/VT3/VT4), **DISPONIBLE** (sin cabezas ganadoras anteriores ese día), **CONFIRMADA** (cabezas de exactamente un turno anterior del mismo día) y **RECONFIRMADA** (≥2 turnos anteriores distintos). Guarda **TODOS** los testigos físicos fuente+celdas, turnos, jurisdicciones, cabezas completas, lecturas inversas, herencia D−1/D−7 separada. No suma como votos independientes la confirmación de familia y de su huella, porque un nuevo resultado que coincide con la familia confirma automáticamente los testigos previos que persisten en el tablero. Agrupa por fecha+modalidad+familia para no repetir familia-jornada en métricas.

29 días y **145 cortes**, 5 jurisdicciones argentinas por target, **82.785 exposiciones familia-corte y 145.404 recorridos físicos validables** (un solo par de fuente, vecinos físicos, sin reuso). Estados pre: VT2 3.973 disponibles, 535 confirmadas, 57 reconfirmadas; VT3 19.358, 257, 2; VT4 58.531, 72, 0.

## Resultados observados después del objetivo

VT2 septiembre: disponibles 228/2770, confirmadas 39/362, reconfirmadas 7/36; contraste condicionado por mismo corte, cantidad de recorridos, cantidad de fuentes y lectura palindrómica esperados en los dos últimos 28,52 y 3,80. VT2 octubre: disponibles 109/1203, confirmadas 17/173, reconfirmadas 5/21, esperados confirmadas 15,53 y reconfirmadas 1,09. **Crucial**: los 5 aciertos reconfirmados de octubre son **solo 3 familias-jornada**: `79/97` del 02/10 cuenta en Matutino, Vespertino y Nocturno; `13/31` del 05/10 y `48/84` del 08/10. Bootstrap por jornadas enteras para diferencia octubre reconfirmadas observado−esperado tiene rango exploratorio 95 % `[-0,51;9,61]`; demasiada incertidumbre y pruebas retrospectivas repetidas. VT3 octubre pre-confirmadas 0/73, VT4 0/25, VT4 pre-reconfirmadas ninguna.

Ordenamiento meramente experimental Top3/5/10: prioridad turno confirmados, huellas confirmadas, D−7/D−1 para desempatar y hash estable. **VT2 septiembre**, 100 cortes: Top3 **31** (control uniforme ~24,49), Top5 **44** (~37,98), Top10 **75** (~63,63); **octubre**, 45 cortes: Top3 **13** (~12,14), Top5 **22** (~18,53), Top10 **30** (~29,85). Desaparece en octubre la aparente ganancia, no activar bonus de reconfirmación. VT3 y VT4 carecen de ventaja clara. No es holdout virgen ni prueba prospectiva.

## Reproducibilidad y archivos entregados

El usuario tiene `modelo-papa-v9-memoria-temporal-familias-145-cortes.zip` (24 archivos, **5.897.012 bytes**, SHA256 `b93542b8c1935bdd768a869bec5f0c41424fb5a322af7a6dc3849a7ff92e76d5`). Carpeta `/mnt/data/laboratorio_v9_estados_temporales_145/`:

- `ANTES_V9_ESTADOS.html` visor autónomo **sin cabezas objetivo** para todos 145 cortes/VT, muestra estados y todas las huellas/celdas de cada familia Top10 sobre el tablero +11.
- `DESPUES_V9_ESTADOS.html` separadamente cabezas objetivo y aciertos/esperados.
- `FAMILIAS_MEMORIA_PRE.json.gz` todos los testigos y estados; `CORTES_ESTADOS_PRE.json` selecciones y resúmenes; `COTEJO_ESTADOS_POST.json`, `COTEJO_TOP_MEMORIA_POST.json`.
- `1_preparar_memoria_PRE.py`, `2_cotejar_POST.py`, `3_medicion_top_y_controles.py`, `4_visores.py`, `5_verificar_y_empaquetar.py`; tres insumos reales autocontenidos en `insumos/`; CSV e informe completo `INFORME_V9_MEMORIA_TEMPORAL.md`.
- SHA256 de PRE **`11b902507a914fbd5ec489d08f0b97110a0dcfd021fb6b96a31b97213d68d002`**. **Prueba antifuga real**: archivo POST físicamente ocultado, recalculó PRE y obtuvo el mismo SHA.
- `CONTROLES_VERIFICADOS.json` constata **82.785 familias**, **145.404 testigos físicos**: fuente única, celda 6×2, contigüidad rey, no repetición, inversión exacta; 145 cortes, Top único y 3 estados. **Chromium/Playwright ambos visores probados sin errores JS**. ZIP `testzip()` OK.

**Decisión:** adoptar únicamente la separación de estados como propuesta estructural auditada, todavía NO llevar coeficientes a V9/V13/V12/V14 oficiales. Fuente Nocturna anterior +11 sigue siendo hipótesis flexible, no mandato. Para investigaciones posteriores controlar correlación por jornada y comprobar mejora fuera de los días ya examinados.
