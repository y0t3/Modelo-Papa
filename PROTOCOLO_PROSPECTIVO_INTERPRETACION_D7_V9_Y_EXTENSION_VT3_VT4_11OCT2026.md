# Protocolo prospectivo — interpretación D−7, memoria V9 y genealogía VT3→VT4

**Redactado 11/10/2026, después del laboratorio de 115 cortes D−7 (29 fechas/145 cortes totales).** Rama experimental `auditoria-sorteo-10oct-2026`. Este texto **no es una prueba completada, ni crea predicciones ni certifica un PRE sellado**. No cambia main, APK, motor, geometría, reglas de marcado ni rankings oficiales.

## Situación y motivo para no repetir ensayos

- Cobertura media del traslado D−7: VT2 93,14 %, VT3 26,43 %, VT4 2,63 %. Cobertura no equivale a calidad de pronóstico.
- Hipótesis exploratoria focal: VT2 Top3 V9, octubre **23/45** cortes con coincidencia; base D−7 **18/45**; azar compartido por jornada ~**12,46/45**. Comparación V9−base: bootstrap por jornada `[-1,+12]`; no está confirmada.
- VT3 bajo el mismo traslado no mejora consistentemente; VT4 directa no contiene ninguna familia positiva en la bolsa D−7 del ensayo 115. Los ensayos previos de 145 cortes sobre 17 políticas de VT4 por roce y madres diversas recuperaron básicamente un caso de octubre (`3729/9273`); ese estudio ya está hecho.
- Los 115 cortes septiembre/octubre y otros corpus 2024–2026 usados para idear las reglas **no son holdout independiente**.
- El workflow `.github/workflows/captura-prospectiva-10oct-pre.yml` era **específico para el 10/10/2026**, con deadline fijo y `humanSelections=0` y `forecastMade=false`. La fotografía del tablero no sustituye un **Top3 de familias sellado antes del turno**.

## Objeto que queda congelado conceptualmente DESDE AHORA

**Hipótesis primaria única**: sobre la MISMA bolsa de familias elegibles transferidas D−7, el orden original `V9 eventos anteriores reales` debe conseguir mayor proporción de cortes con ≥1 coincidencia de familia VT2 dentro de su Top3 que el `Orden anterior D−7`. Son las dos políticas **exactas** del laboratorio de 115 cortes, sin cambiar pesos, corte, desempates, elegibilidad ni presupuesto tras mirar objetivos. Si no puede recuperarse el código/paquete PRE exacto y sus hashes, **la prueba no empieza**; no reimplementar aproximadamente y llamarlo comparación congelada.

**Control principal complementario**: Top3 aleatorio dentro de la **misma bolsa PRE**, con asignación de prioridades uniforme **compartida por todos los turnos de una jornada** y mismo cupo, preservando dependencia intradía. Registro adicional de probabilidades esperadas dentro de bolsa. No afirmar ventaja por comparar contra azar sobre los 100 números sin respetar elegibilidad.

**Variables secundarias observacionales**: VT3 Top3/5/10; tasas de familias VT3 alcanzables por traslado D−7; VT4 física directa y VT4 nacida por roce desde VT3 (cada hija con TODAS sus rutas VT4 físicas y TODAS sus madres VT3 reales). Proyección VT4 numérica por AZAR se cuenta y muestra **separadamente**, nunca como acierto geométrico ni como reconfirmación de una huella. No inventar cupos alternativos ni una mezcla 4/3/3 favorecida por POST.

## Unidad, muestra y abstenciones

Se propone recolectar las próximas **40 jornadas de sorteos con datos válidos**, con los cinco cortes/turnos por día cuando existan y con cabeza completa de Ciudad, Provincia, Córdoba, Santa Fe y Entre Ríos, según fuente verificable. Excluir con motivo y evidencia fechas sin sorteos/resultados completos; **no** tratar falla de API como ausencia de sorteo. No usar Montevideo en el resultado primario, a efectos comparativos con los 115 cortes anteriores. Nunca reducir una jornada a sus cortes favorables.

`fecha + turno + modalidad + familia reversible` identifica una exposición; la inferencia agrupa por **fecha/jornada**, no finge independencia entre los cinco turnos. Cada familia aparece como una sola posición en el Top, aunque existan dos sentidos y muchas rutas. Top3 ⊂ Top5 ⊂ Top10. Si hay menos de tres familias elegibles, registrar abstención parcial y no rellenar desde fuera de la bolsa para mejorar hit rate.

Se fija la muestra antes de ver los resultados; cortes faltantes, empate, cambio de API, error geométrico o interrupción se registran sin sustituir fechas favorables. Reportar también exposición efectiva: cantidad de familias, lecturas reversibles, rutas, fuentes, oportunidades por turno y negativos.

## Regla geométrica y genealogía, SIN cambios

La hoja +11 se marca **automáticamente** con TODOS los caminos que coincidan con las cabezas ya sorteadas, nunca con elecciones predictivas humanas. Cada ruta válida usa celdas contiguas (diagonal permitida) de **un solo par de columnas fuente**, sin vacíos, sin cruces a otra fuente, saltos o reutilización. Lectura y reverso = **una familia**. Conservar todas las rutas alternativas y las cabezas completas históricas.

En VT3→VT4 guardar por separado: `idMadreVT3`, `familiaMadreVT3`, huella/celdas y orientación VT3, `ladoAdicion`, `cifraAgregada`, `familiaHijaVT4`, `tipoOrigen=directa|roce|azar`, huella(s) VT4 reales o ausencia. Ejemplo: raíz VT3 `346/643`, si se lee `346` y se añade 0 al final, hija VT4 `3460/0643`; **460 no es la madre**. `6430/0346` es otra hija numérica, no seleccionada salvo PRE independiente.

## Cadena técnica obligatoria antes de considerar validación

1. Recuperar del paquete autónomo anterior `INTERPRETACIONES_PRE_115.json`, preparador de PRE y definiciones **exactas** de las dos políticas. Guardar versión del código, huellas de SHA256 y vector de regresión con el 115-cortes antiguo. **Por ahora el paquete ZIP no está versionado en esta rama:** el MD es solo checkpoint, no los insumos reutilizables.
2. Para cada futuro turno, capturar instantánea +11 **antes del resultado objetivo** (fecha/hora ART y UTC, fuente original y SHA), con cabezas anteriores permitidas y futuras bloqueadas. Reconstruir exhaustivamente todas las figuras ya confirmadas; luego generar **dos Top3 de familias sobre una bolsa idéntica** y registrarlos con rutas, sentidos, evidencias D−7/D−1 y estados V9 reales.
3. Crear un archivo `PRE.json` de contenido canónico + `SHA256` **publicado/sellado antes del sorteo**. Impedir que la etapa PRE lea resultados objetivo o futuros, incluso si ya están accesibles en una API. Registrar cada error de deadline y **abstenerse** si no se puede sellar; prohibido PRE retrospectivo presentado como prospectivo.
4. Solo después obtener resultados POST con fecha fuente verificable, guardar raw y cotejar contra PRE **inmutable**. Reportar todos los negativos, familias no seleccionadas, abstenciones, costos de cubrir ambos sentidos y tasas de cobertura, además de aciertos.
5. Auditar reversibilidad, fuente única, 6×2, vecindad, no reuso, madre/hija y hashes; ejecutar ensayo antifuga quitando físicamente POST y repitiendo PRE. La antigua política de generación automática de marcas **no se toca**.

## Análisis fijado y criterio conservador

Resultado primario por corte: `acierto_en_Top3_V9 - acierto_en_Top3_D7` (ambos booleanos, misma oportunidad). Reportar pares ganados/perdidos, resultados agrupados por jornada, intervalo por remuestreo de **jornadas completas**, y comparación con un azar de bolsa compartido intrajornada con semilla fijada ANTES del primer sorteo nuevo. No generar p-valores como si 200 cortes o múltiples familias fueran ensayos independientes.

Mostrar ambas comparaciones (V9 frente a D−7 y frente a azar), el intervalo por jornadas, cobertura por modalidad, fechas positivas y **todas las negativas**. Considerar prometedora la hipótesis solo si hay una mejora positiva frente a D−7 cuyo intervalo por jornadas excluya 0 y supera también el control de bolsa; eso será **una señal inicial**, no ventaja para apostar demostrada. Si no, conservar V9 como observador y no asignar bonus.

VT3/VT4 son secundarios **descriptivos** por defecto. No activar regla de roce/ranking por hallazgos en un mismo evento, ni confundir acierto de familia numérica con acierto geométrico.

## Estado al registrar este protocolo

- [x] Auditoría documental de hipótesis y restricciones; no se rehacen pruebas antiguas.
- [x] Detectada diferencia entre capturar tablero y sellar Top de familias.
- [ ] Recuperación del ZIP de 115 cortes y código exacto del laboratorio, ausente de esta rama.
- [ ] Generador PRE/POST de dos políticas implementado y probadamente antifuga.
- [ ] Captura de resultados genuinamente futuros con PRE fechado anterior al objetivo.
- [ ] 40 jornadas válidas y análisis terminal; **sin resultados prospectivos todavía**.

**No debe presentarse el presente documento como predicción, motor actualizado o ensayo ejecutado.**
