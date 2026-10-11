# Auditoría V9: Nocturna anterior C0, exposición por turno, memoria temporal y ablación de un cupo V13

**11/10/2026, investigación retrospectiva ejecutada.** Rama experimental `auditoria-sorteo-10oct-2026` del repositorio `y0t3/Modelo-Papa`. No se modifican `main`, app, motor oficial ni APK.

## Enfoque y fuentes verificadas

20 jornadas de septiembre, 9 de octubre; **145 cortes PRE/POST**, cinco cabezas argentinas completas por corte, VT2/VT3/VT4. **82.785 apariciones familia-corte**, **26.040 identidades familia-jornada**. Se reutilizaron `FAMILIAS_MEMORIA_PRE.json.gz` y resultados POST del laboratorio V9 con su PRE original SHA256 `11b902507a914fbd5ec489d08f0b97110a0dcfd021fb6b96a31b97213d68d002`. Verificadas las reconstrucciones de familias ganadoras desde las cabezas frente a los recorridos confirmados originales en los **435 corte-modalidad**.

Top3/Top5/Top10 son **familias reversibles**, no números sueltos; todos los caminos físicos por fuente+celdas persisten sin saltos, reuso o cruces de columnas de turnos. Cada figura tiene estado V9 DISPONIBLE, CONFIRMADA (1 turno anterior), RECONFIRMADA (≥2 turnos anteriores), separando mera disponibilidad y eventos exactos. **La familia puede estar en C0 (Nocturna anterior +11), solo otras fuentes o ambas.** Nunca duplicar una familia mixta como si fueran dos resultados independentes. D−7 y D−1 no son confirmaciones intradía; la madre VT3 y su hija VT4 no son idénticas.

## Reconfirmadas VT2 y dependencia jornada

VT2 septiembre: DISPONIBLES **228/2.770**, CONFIRMADAS **39/362**, RECONFIRMADAS **7/36**. Octubre: **109/1.203**, **17/173**, **5/21**. Las 5 coincidencias reconfirmadas de octubre representan solo **3 familias-jornada**; septiembre 7.

En octubre, contando solo exposiciones después de al menos una confirmación ya vista, se registraron **194 apariciones VT2 con 22 coincidencias posteriores**; estas fueron 83 familias-jornada elegibles / **17 familias-jornada** con alguna reconfirmación posterior. Con presencia en C0: 127 exposiciones / 18 coincidencias, representando 46 familias-jornada elegibles / **13 exitosas después**. Sin presencia C0: 67 exposiciones / 4 coincidencias, 37 familias-jornada / **4 exitosas después**. La mayor exposición y la pertenencia compartida pueden inflar interpretaciones ingenuas.

## Controles

1. **Mismo corte, mismo grupo de fuente, mismo tramo de multiplicidad y palindromía:** VT2 confirmación previa (≥1 turno): septiembre 42 aciertos vs **30,970 esperados** (349 exposiciones comparables) y octubre 19 vs **15,836** (163). Bootstrap por jornadas del exceso: septiembre **+2,261..+19,465**, octubre **−3,155..+10,907**. Con estratificación adicional D−7, septiembre 35 vs 26,112; octubre 17 vs 13,950; muy exploratorio y oct sin estabilidad.
2. **C0 exclusiva versus otras fuentes exclusivas**, mismo corte, estado V9, cantidad de rutas comparable y palíndromo: septiembre **30 aciertos C0 vs 38,721 esperados**, octubre **18 vs 18,941**. Bootstrap del exceso por días SEP **−15,83..−1,69**, OCT **−5,56..+2,99**. Al controlar también D−7 el exceso es −4,647 en SEP y −2,328 en OCT; ambos rangos incluyen cero. Las familias en C0 y otras fuentes se excluyen de esta comparación exclusiva, no se niega una hipótesis con resultados mixtos.
3. **4.500 permutaciones por período**, reasignando *jornadas completas* (cinco turnos y cinco cabezas juntos) entre fechas del mismo mes, sin desarmar paquetes. VT2 previa confirmación: septiembre **46 coincidencias vs media nula 39,123**, cola ≥ observado **0,1224**; octubre **22 vs 17,801**, cola **0,1198**. VT2 reconfirmadas: septiembre **7 vs 3,742** cola **0,0667**; octubre **5 vs 2,658** cola **0,1317**. Con **C0 presente + confirmación**: octubre **18 vs media 11,883**, cola nominal **0,0267**; septiembre **29 vs 25,465**, cola **0,2464**. *No destacar la cola nominal como demostración:* numerosas comparaciones retrospectivas y octubre previamente explorado.
4. VT3 octubre confirmación previa **0/73**; VT4 octubre **0/25**, sin reconfirmadas VT4. No extrapolar un eventual efecto VT2.

## Ablación estricta de V13, una plaza del Top10

Se reconstruyó desde el PRE congelado del ensayo integrado V13 anterior una regla sencilla que no lee POST: partir del Top10 **V13_MEMORIA_SIN_DOBLE_VOTO**, y donde existe familia previamente confirmada en la unión de candidatas **mostradas por los especialistas**, reemplazar **solo el puesto 10** por la alternativa con mayor respaldo V8, comparando:
- alternativa con presencia en C0;
- alternativa sin presencia en C0;
- base sin cambio.

**Presupuesto igual, Top3/5 idénticos, inversión numérica nunca otra plaza.** PRE ablación SHA256 `0dd32e0c7f08372d82966b24e6d701ce9b55a8e4e5e15300ed9bf5eb6a68566c`; proceso POST lo verifica antes de cotejar.

| VT2 Top10, cortes con ≥1 familia confirmada | SEP/100 | OCT/45 |
|---|---:|---:|
| V13 base | **66** | **32** |
| V13 plaza V9 confirmada con C0 | **69** | **31** |
| V13 plaza confirmada sin C0 | **67** | **30** |

Reemplazos C0 realizados: **37 en septiembre** (7 familias acertadas nuevas, 0 acertadas expulsadas) y **21 en octubre** (2 nuevas acertadas, **3 acertadas expulsadas**). No se encontró mejora estable. La bolsa en esta ablación se restringe a familias que ya estaban visibles entre los rankings antiguos, no a todas las familias físicamente posibles. No es prueba de eficiencia predictiva.

## Decisión e interpretación

- **Sí rescatar para V9** la memoria verdadera por eventos, turnos distintos, rutas físicas, fuente, y familia-jornada única.
- **No fijar bonus o cupo C0/V9** en V13, ni gates V12/V14, con estos resultados.
- **V12** debe registrar siempre cada familia que entra y sale de los Tops, incluyendo pérdidas. **V14** puede abstenerse pero su abstención aún no está validada como señal predictiva.
- Fuente Nocturna anterior +11: hipótesis visual del padre, por ahora **no fuente privilegiada por evidencia independiente controlada**. Contrastarla en dibujos originales y memoria D−7 para evitar atribuir a un origen el efecto de mayor exposición.
- Sorteos aleatorios y muchos ensayos retrospectivos: ninguna fórmula mostró rendimiento prospectivo probado.

## Entregables reproducibles

ZIP `modelo-papa-v9-fuente-turno-exposicion-c0-y-ablacion-v13-145-cortes.zip` (30 archivos, **4.616.526 bytes**, SHA256 **`083bc098be4548e4493206ed4ce8373722eddc1fabb499fadc2a5616756866a4`**), incluye:
- `v9_fuente_turno_145/OBSERVATORIO_POST_FUENTE_TIEMPO.html`: panel POST autónomo, filtros de período/VT/turno, tasas por origen, comparación por estados y permutación, además de la ablación V13; fue probado en Chromium + Playwright sobre móvil (sin errores JS).
- `INFORME_V9_FUENTE_TURNO.md`, `RESULTADO_FUENTE_TIEMPO.json`, nueve CSV, `CONTROL_VERIFICACION.json`, y pantalla PNG.
- `1_analizar_v9_fuente_turno.py`, `2_atribucion_control_c0.py`, `3_informe_observatorio_y_validacion.py`, `4_cupo_c0_pre.py`, `5_cupo_c0_post.py`, `6_añadir_ablacion_y_empaquetar.py`, junto a cinco insumos históricos originales bajo `insumos/`.
- ZIP validado íntegro, comprobadas familia observada versus testigos POST en todos 435 modalidad-cortes, control de SHA PRE, cohortes y ausencia de cambio en Top3/5 de la ablación.

**Limitación metodológica explícita:** ocultar POST al elaborar decisiones reduce la fuga directa de datos en el programa, pero no convierte en holdout no explorado los días cuya respuesta ya se conoce. Octubre incluye nueve jornadas: no usar conteos por turnos como si fueran 45 jornadas independientes.