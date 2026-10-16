# Geometría completa: memoria, fuente, forma y candidatos congelados
**Laboratorio retrospectivo del 16/10/2026 · rama experimental, sin cambiar Modelo Lalo ni APK 0.3.5.**

## Protocolo
- 27 jornadas (15/09 al 15/10), 135 cortes previos a cada sorteo, 675 cabezas en cinco jurisdicciones argentinas, con Montevideo solo como parte de la hoja física cuando corresponde.
- Mismos cortes PRE y hojas anteriores para ambos motores. Geometría completa reproduce exactamente el código principal; el A/B anterior comprobó coincidencia completa de sus tops con la copia experimental.
- Todos los resultados históricos ya eran conocidos cuando se diseñó este estudio. Es un **análisis retrospectivo**, no una predicción efectivamente sellada ni una tasa extrapolable.
- No se cruzaron columnas, no se inventaron saltos ni se alteraron las familias numéricas existentes.

## 1. ¿Qué fuente produce el Top 3?
405 posiciones = 135 turnos × 3 familias:
- **381 (94,1%)** tienen como testigo físico principal la **Nocturna anterior**.
- **24 (5,9%)** tienen como testigo principal la columna **Matutina** del mismo día.
- Ninguna de las columnas Previa, Primera o Vespertina fue el testigo elegido para un puesto Top3 de la muestra.
- Es una estadística del **recorrido representante seleccionado**, no del conjunto de respaldos: una misma familia puede tener caminos en otras columnas.

## 2. ¿Cuánto cambia el Top 3?
- De 108 transiciones entre turnos dentro de jornadas, el conjunto de tres familias se mantuvo intacto en **100** y cambió en **8**.
- Las 8 novedades ocurrieron cuando la Matutina se incorporó antes del Vespertino, en **8 jornadas**. Las familias originales no desaparecieron físicamente.
- Si una familia conservaba su puesto entre turnos, **su camino representante jamás cambió de fuente o casillas**: 0 cambios de testigo en transiciones.
- Entre los 10 aciertos geométricos Top3 de toda la muestra, **los 10 ya figuraban en las tres primeras familias desde la Previa** y usaban un recorrido principal de Nocturna anterior.

## 3. Control crítico: Top 3 congelado desde Previa
Se comparó en cada turno el mismo Top3 de la Previa (sin ninguna actualización) frente al Top3 dinámico de Geometría:
- **135 cortes: 10 aciertos congelado, 10 dinámico**.
- **108 cortes posteriores a Previa: 8 congelado, 8 dinámico**.
- **0 cortes con ganancia** y **0 con pérdida** al actualizar las familias: se obtuvo exactamente el mismo recuento de aciertos en todos los cortes.
- Por turno: Previa 2, Primera 0, Matutino 4, Vespertino 1, Nocturno 3, tanto fijo como dinámico.
- El control no demuestra que actualizar carezca de valor siempre, sino que las reglas actuales **no agregaron aciertos sobre esta muestra**.

## 4. ¿Hubo respaldos nuevos dentro de una familia ya seleccionada?
Sí, pero el Top3 casi nunca hizo visibles esos cambios:
- **103/405** exposiciones de familia Top3 tenían al menos una **fuente adicional** respecto de cómo se veía la familia en la Previa.
- Dentro de las **10 exposiciones ganadoras**, **5** sumaron un respaldo en otra columna durante el mismo día y **5** conservaron únicamente el de la Previa.
- En los cinco casos reforzados, la familia ganadora **ya figuraba en Top3 antes de recibir la nueva fuente**. No confundir refuerzo POST de columnas anteriores con información previa al resultado objetivo.
- La comparación por cantidad de apoyos tiene dependencia por jornada, exposición repetida y selección previa; **no valida todavía usar esos refuerzos como puntuación**.

## 5. Control neutral emparejado por fuente y forma
El Top3 actual obtuvo **10** aciertos de familia en 135 cortes. Se simularon 2.500 elecciones neutrales con prioridad pseudoaleatoria **estable durante cada fecha**, sin saltear el vínculo físico ni utilizar resultados para seleccionar:
| Control neutral | Promedio de aciertos | Intervalo central empírico 95% | Fracción simulada con ≥10 |
|---|---:|---:|---:|
| Tres familias de la **misma columna** que cada candidata | **4,07** | 1–8 | 0,006 |
| Tres familias de **misma columna y misma forma** | **5,57** | 2–10 | 0,0292 |

- Tamaño medio del estrato de misma fuente y forma: **5,34 familias distintas** por puesto. **0 de 405 puestos** tenía un estrato de una única familia y **ninguna selección simulada requirió usar una bolsa ajena al estrato**.
- La diferencia es alentadora *dentro de los datos explorados*, pero la fracción simulada **NO es un valor p confirmatorio**: ya hubo muchos experimentos con estas mismas jornadas; los estratos se condicionan a las fuentes y formas de las familias elegidas por el modelo y el control no refleja todos los sesgos de investigación.
- En el tramo 12–15/10, 20 cortes, Geometría tuvo **1** acierto; el control de fuente promedió 0,63 y el de fuente+forma 0,31. Una diferencia de un solo caso es insuficiente.

## Decisión
**Mantener ambos motores independientes y la APK estable.** La mejora de Top3 geométrico no procede de leer progresivamente nuevas columnas: concentra las propuestas en la Nocturna anterior y acierta lo mismo al congelarlas desde Previa. No forzar candidatos de columna nueva. Las formas parecen aportar algo frente a una selección neutral comparable, pero deben superar más pruebas fuera del histórico ya reutilizado.

## Próxima prueba
- Medir, por **familia existente desde Previa**, si sumar otra fuente cambia su relación con resultados del turno siguiente, manteniendo denominadores por exposición y separación por día.
- Comparar un nuevo orden **con refuerzo genuino entre fuentes** contra el orden actual, sin premiar cantidad de rutas en una misma fuente, sobre cortes temporalmente separados; no tocar la prioridad estable sin mejora reproducible.
- Examinar por qué 381/405 testigos superiores provienen de Nocturna anterior: distinguir sesgo de orden al clasificar rutas frente a señal específica de la fuente.
- Para validar utilidad fuera del corpus, guardar predicciones PRE externas antes de futuros resultados.

## Archivos y prueba
- Workflow: https://github.com/y0t3/Modelo-Papa/actions/runs/38849154025
- Artefacto GitHub: `LAB-GEOMETRIA-LALO-HISTORICO-2026`, con tres archivos JSON (cotejo original, ocho ablaciones y memoria + controles emparejados).
- `scripts/lab-geo-matched-control.ts`: instrumento físico por familia, control neutral y control congelado.
- `scripts/lab-geo-lalo-retro-2026.ts`: ejecuta ambos motores y serializa la comparación. 
