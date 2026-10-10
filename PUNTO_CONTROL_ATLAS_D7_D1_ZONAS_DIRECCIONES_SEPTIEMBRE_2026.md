# Punto de control — evolución visual de huellas, zonas y sentidos (D−7 y D−1)

Estudio ejecutado sábado 10/10/2026 sobre las **20 hojas completas reconstruidas** del 8 al 30 de septiembre de 2026. **Retrospectivo, sin predicciones previas.**

**Última ejecución verificada con éxito, incluida corrección de alineación de desplazamientos invertidos:**
https://github.com/y0t3/Modelo-Papa/actions/runs/38059506764

**ZIP descargable de atlas interactivo, informe, todos los casos, negativos y código de análisis disponible en rama:**
https://github.com/y0t3/Modelo-Papa/actions/runs/38059506764/artifacts/11672771930

**Protocolo prespecificado antes de resultados del estudio:** `PROTOCOLO_SEGUIMIENTO_FORMAS_ZONAS_ORIENTACIONES_D7_D1_SEPT2026.md`

Archivos fuente y procedimiento de reconstrucción histórica: `scripts/run-visual-chain7d.cjs`. Script nuevo: `scripts/run-route-zones-orientations-d7d1.cjs`. Workflow: `.github/workflows/atlas-zonas-orientaciones-d7d1-sept.yml`.

## Cobertura verdadera

- 20 hojas completas: 14 pares cronológicos **D−7** (mismo día semanal, exactamente siete días calendario), y 19 pares **D−1 efectivo** (jornada anterior con sorteo registrado, no necesariamente día calendario anterior).
- **D−7**: 631 exposiciones de figuras antiguas únicas por par (394 VT2, 188 VT3, 49 VT4).
- **D−1 efectivo**: 873 exposiciones antiguas (544 VT2, 258 VT3, 71 VT4).
- No confundir «exposiciones» de la misma geometría en distintos pares con observaciones independientes.
- Se conservaron **33 páginas interactivas de pares**, más `index.html`; todas las formas antiguas se clasificaron una sola vez en cada comparación, incluyendo ausencias, mientras el JSON contiene **todos los rivales y todas las relaciones**.
- Cada forma física se identifica por `modalidad|columna|celdas`, deduplicando la inversión. Todas las cabezas completas, jurisdicciones, turnos ganadores y **sentidos de lectura marcados** se conservan; un trazo puede justificar múltiples cabezas.

## Clases de prioridad por huella vieja

| Comparación | VT | Expuestas | Misma huella | Misma forma trasladada | Toque extremo | Toque interno | Ningún contacto | Sin figura comparable |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| D−7 | VT2 | 394 | **140** | 197 | 35 | 0 | 17 | 5 |
| D−7 | VT3 | 188 | **5** | 28 | 84 | 18 | 22 | 31 |
| D−7 | VT4 | 49 | **0** | 0 | 9 | 3 | 2 | 35 |
| D−1 efectivo | VT2 | 544 | **143** | 326 | 50 | 0 | 22 | 3 |
| D−1 efectivo | VT3 | 258 | **15** | 32 | 108 | 24 | 41 | 38 |
| D−1 efectivo | VT4 | 71 | **0** | 2 | 12 | 8 | 5 | 44 |

Las categorías son exclusivas por prioridad de relación física, pero se preserva la relación con **TODOS** los dibujos nuevos, incluso sin contacto. **Sin figura comparable** significa que no se marcó ningún nuevo dibujo de la misma VT y fuente en la hoja posterior; **NO significa** que fuese imposible formar esa figura en la tabla ni que haya fracasado un pronóstico.

### Diferencias por modalidad observadas

- La VT2 puede reaparecer exactamente en las mismas celdas en D−7: **140/394 = 35,5 %** de exposiciones antiguas.
- En VT3: **5/188 = 2,7 %** exactas, **28/188 = 14,9 %** con forma trasladada y numerosas relaciones por contacto sin repetición de geometría.
- En VT4: **0/49 exactas**, ninguna trasladada, y **35/49** sin ninguna figura nueva confirmada de la misma VT y fuente.
- Para D−1 hay 15 VT3 exactas y ninguna VT4 exacta. No implica ventaja predictiva de VT2: rutas cortas tienen menos geometrías distintas posibles.

## Dirección leída y turno ganador: no confundir reaparición con predicción

Entre las **cinco VT3 exactas D−7**:
- **cuatro** tienen solamente el **sentido contrario** marcado en la segunda semana;
- **una** fue marcada en ambos sentidos durante la segunda semana;
- **cero** tienen exclusivamente el mismo sentido marcado;
- solamente **una de cinco** incluye el **mismo turno ganador** en las dos semanas.

Entre **140 VT2 exactas D−7**: 39 mismo sentido solamente, 56 sentido inverso solamente, 45 con ambas orientaciones marcadas. Solo 60 de 140 comparten por lo menos un turno ganador antiguo y nuevo. La identificación de sentido proviene de las cabezas marcadas **después** de los sorteos; no afirma que nadie hubiera elegido ese sentido antes.

## Fichas físicas concretas

### Reaparición exacta VT3 con cambio de lectura y turno (16/09 → 23/09)
- **D−7 16/09:** cabeza `9772` de Montevideo **Matutino**, fuente **Previa**, ruta ordenada `1:0→0:1→0:0` (inversa de la huella canónica `0:0→0:1→1:0`), valor marcado **772**.
- **23/09:** esa misma huella física `0:0→0:1→1:0`, pero se marcó en sentido canónico por cabeza **2982** de Ciudad **Vespertino**, valor **982**.
- Misma **zona ARRIBA** y misma geometría; **lectura y turno ganador distintos**. No hay continuidad numérica demostrada.

### Traslación sin inferir causalidad (08/09 → 15/09)
- Figura antigua VT3 de la cabeza **9876**, Matutino: huella en zona **ARRIBA** dentro de fuente **Previa**, lectura **876/678**.
- Siete días después figura de **igual topología** trasladada a zona **CENTRO→ABAJO**; marca de la cabeza **4563**, Matutino.
- Se corrigió en código el cálculo de desplazamiento para alinear correctamente formas invertidas ANTES de reportar un vector de movimiento. Es un parentesco geométrico entre dos dibujos posteriores, no «se mueve hacia allí y saldrá X».

### Ausencia conservada (08/09 → 15/09)
- VT4 de la cabeza **8637**, Montevideo Nocturno, fuente Previa, ruta `0:1→1:0→2:1→1:1`, zona ARRIBA→CENTRO.
- El 15/09 **no hay figura VT4 posterior comparable en esa misma fuente**, por lo que se conserva explícitamente `SIN_FIGURA_COMPARABLE`; no se elimina del atlas ni se llama fallo predictivo.

## Presentación

El ZIP incluye:
- `index.html`: 14 vínculos D−7 y 19 vínculos D−1, separados.
- 33 doble-hojas SVG interactivas: al tocar la **cabeza completa**, se resaltan **todos** sus recorridos y todas sus relaciones físicas con la hoja posterior, manteniendo las demás líneas tenues.
- Filtros por clase: figura exacta, trasladada, toque extremo, toque interno, sin contacto, sin nueva confirmación comparable.
- `TODOS_LOS_CAMINOS_PARES_Y_NEGATIVOS.json`: casos completos, todas las huellas, cabezas, fuente, zona, dirección y relaciones rivales.
- `INFORME_ATLAS_ZONAS_DIRECCIONES.md` y `RESUMEN.json` con tablas y conteos.

**Limitación principal:** todas las marcas de septiembre son reconstrucciones digitales a posteriori. No se han cotejado fotograma a fotograma con tinta manuscrita original; tampoco había selecciones humanas selladas antes de esos sorteos. La superposición, giro o traslación NO es evidencia de anticipación numérica.

No se modificó rama `main`, motor, selector, APK oficial ni rama de rediseño. Este atlas se conserva exclusivamente en `auditoria-sorteo-10oct-2026`.

## Próximo examen útil sin esperar sorteos

Tomar solo las **14 parejas D−7** y hacer un **control pareado** de la aparición de cada modalidad frente al universo de ubicaciones físicamente posibles, distinguiendo misma huella/figura y mismo turno ganador. Deberá quedar congelada la condición de éxito antes del cotejo y conservar los negativos; la abundancia de VT2 exige controles de base. No atribuir un ranking predictivo antes de contar con decisiones humanas prospectivas.