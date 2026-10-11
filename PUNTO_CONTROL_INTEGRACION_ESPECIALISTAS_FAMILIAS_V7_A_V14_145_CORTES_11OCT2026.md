# Integración experimental: V7 + V8 + V9 → V13 por familias → V12/V14 árbitros

**Fecha:** 11/10/2026. **Ejecutado y evaluado** sobre 145 cortes históricos: 29 jornadas, 100 cortes de septiembre y 45 de octubre. Exclusivamente rama `auditoria-sorteo-10oct-2026`. **No cambió main, la APK, ni los archivos de producción.** Octubre ya había sido examinado muchas veces: análisis retrospectivo exploratorio, **no holdout virgen**.

## Diseño preservado y corregido

- VT0 enumera todos los recorridos contiguos dentro de una única fuente de dos columnas, sin saltos/huecos/reuso, direcciones inversas agrupadas por **una familia numérica**, sin perder la identidad de cada huella física individual. Cantidades auditadas 145 cortes: **VT2 10.100 trazos y 4.565 familias/corte acumuladas; VT3 35.180 trazos y 19.617 familias/corte acumuladas; VT4 100.124 trazos y 58.603 familias/corte acumuladas**. Cada lista Top3 ⊆ Top5 ⊆ Top10, a lo sumo una plaza por familia, sin forzar diez si solo existen ocho familias en un tablero.
- **V7** especialista en antecedentes D−7 y D−1, con memoria de las madres VT3 de las hijas VT4 **claramente separada** de una confirmación de VT4. Antecedentes digitales retrospectivamente reconstruidos, todavía no todos cotejados contra tinta original.
- **V8** especialista en estructura de fuentes, diversidad de recorridos físicos y oportunidad relativa (no reproducir el antiguo score con puentes prohibidos). Se limita la multiplicidad para no confundir caminos correlacionados con evidencia independiente.
- **V9** especialista en reconfirmación exacta por cabezas ya conocidas en turnos anteriores del día o sus contactos. Disponibilidad física acumulativa NO es una reconfirmación. La columna Nocturna anterior no es obligatoria.
- **V13** experimental: combinación por *reciprocal rank fusion* (RRF) de las posiciones entre V7, V8, V9; no se vota con un experto cuando sus indicadores son cero; no es el antiguo kNN de V13. Tiene desempate alternativo opcional a favor de fuente Nocturna anterior C0. No es un modelo de probabilidad ni pesos aprendidos.
- **V12** experimental: proteger hasta dos familias con historia V7 y completar Top por V13; no elegir un motor íntegro. No es el antiguo código V12 exacto.
- **V14** experimental: etiquetar TOP3/TOP5/TOP10/OBSERVAR basado solo en respaldo histórico y anterior en el Top. No es un predictor de confianza calibrado, ni recomendación de apostar.
- **VT4 AZAR**: variante Top8 físicas + hasta dos proyecciones VT3 con cifra añadida. `346/643` sigue siendo la familia **madre** de `0643/3460`; la hija virtual se rotula sin testigo físico de cuatro celdas y una coincidencia numérica **no** se anota como acierto geométrico.

## Top10 octubre · cortes con al menos una familia físicamente confirmada (45 cortes por VT)

| Método | VT2 | VT3 | VT4 |
|---|---:|---:|---:|
| Control hash determinístico | 29 | 4 | 0 |
| V7 historia | 27 | 3 | 0 |
| V8 estructura | **33** | **5** | **1** |
| V9 confirmación/contacto | 32 | **5** | 0 |
| V13 RRF fusion | **26** | **3** | **0** |
| V13 desempate C0 | 26 | 3 | 0 |
| V12 protege hasta dos V7 | 25 | 3 | 0 |
| VT4 8 físicas + 2 proyecciones | — | — | 0 físico, 0 numérico virtual |

Control de oportunidad uniforme Top10 por corte al mismo universo físico: esperado **VT2 ~29,85**, **VT3 ~3,70**, **VT4 ~0,46** de los 45 cortes; no hay superioridad predictiva demostrada. La V13 fusión **EMPEORÓ** versus V8 y V9 en esta muestra. En septiembre Top10 VT2 control 60, V7 66, V8 64, V9 68, fusión 64 (sobre 100 cortes); VT3 control 13, V7 11, V8 8, V9 10, fusión 12; VT4 control 0, V8 2, V9 2, fusión 0. La comparación no es prueba de que V9 acierta automáticamente.

Ejemplo objetivo: **02/10/2026 Primera Santa Fe `1263`**, VT2 física `36/63`: dos figuras reales en Nocturna anterior; una con D−1 y D−7, otra con D−1. V7 lugar **5**, V8 **10**, V9 sin reconfirmación anterior real del día. V13 descartó la familia de Top10 al combinar fuentes de evidencia. El error es **selección**, no enumeración/identidad.

**Árbitro V14:** octubre VT2 34 cortes TOP3 (12 acertaron con Top3), 11 TOP10 (7 acertaron) y 0 OBSERVAR: **19/45 cortes** confirmados al gastar **212 plazas**, comparado contra ~**16,20** aciertos esperados para elecciones uniformes dentro del mismo presupuesto variable. VT3 1/45 contra ~2,27 esperados (261 plazas) y VT4 0 contra ~0,28 (263 plazas). En septiembre VT2 34/100 contra ~32,29 esperados, VT3 6 contra ~5,22, VT4 0 contra ~0,49. **No justifica habilitar un gate nuevo.**

## Método reproducible e integridad

Paquete usuario: `modelo-papa-integracion-v7-v8-v9-v13-v12-v14-145-cortes.zip` (7.056.941 bytes, 24 archivos, `ZipFile.testzip()` OK; SHA256 ZIP `fed1248b67b91682da10426492c7853ac28c200fe0cfba788eccdf829d2bafd9`). Carpeta `laboratorio_integracion_especialistas_145`:
- `ANTES_ESPECIALISTAS_145.html` **18,6 MB**: visor offline de todos los Top pre, todos los trazos exactos, raíces VT3, etiquetas de origen y tableros +11. **NO incorpora cabezas del turno objetivo ni información POST**.
- `DESPUES_RESULTADOS_ESPECIALISTAS.html` 1,9 MB: visor separado con las cinco cabezas originales, cotejo de aciertos físicos/numéricos y todas las listas.
- `1_generar_pre.py`, `2_cotejar_post.py`, `3_crear_visores_e_informe.py`, `4_probar_visual_y_paquete.py`, `5_empaquetar.py`, datos autosuficientes de fuente PRE/POST y de bolsas históricas VT4, CSV de todas las políticas y resultados completos.
- **PRE congelado SHA256 `ef5caab3ebdba5e159f775e93eca8c06a58ade0bb68cf9e003d916b76cccf241`**. Reejecutado quitando físicamente el fichero POST y obtuvo el **mismo SHA**. POST cotejó después, verificando el hash.
- **POST SHA256 `f3b6c0f22a4e2bd96a4aebd2cfc5837e3542c337557e74497549ba24e1573682`**.
- Geometría de todas las rutas V2/V3/V4 presentadas: mismo par fuente, 6 filas, 8 vecinos, sin repetir casillas; lecturas inversas; madres VT3 por subtrazos 4→3; 435 modalidades-corte; listas sin duplicados y anidadas. **Chromium + Playwright** verificó elegir 02/10 Primera VT2 `36/63` y sus dos caminos, contraste con V13 sin candidata, 10/10 Primera VT4 virtual con su madre `346/643`, POST Santa Fe `1263`; sin excepciones JS, se guardaron capturas.
- Todas las reglas son **diseños experimentales retrospectivos**. La no-lectura de POST en el generador PRE descarta fuga directa del programa pero **NO garantiza independencia** del criterio propuesto porque el histórico ya era conocido.

## Decisión

Mantener **estructura familiar completa por modalidad y todos los testigos** como corrección necesaria. Mantener V7/V8/V9 independientes y V13/V12/V14 experimentales; **NO** incorporar RRF, protección V12 ni umbrales V14 al motor oficial. Próximo experimento honesto: investigar causas de **discordancia entre especialistas** con controles por presupuesto y fechas verdaderamente nuevas, o formalizar reglas visuales del padre que todavía no están codificadas. No inferir predictibilidad de sorteos aleatorios por una sola mejora retrospectiva.
