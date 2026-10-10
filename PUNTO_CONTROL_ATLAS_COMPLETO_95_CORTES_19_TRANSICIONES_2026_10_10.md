# Modelo Papá — Atlas completo de 95 cortes, 19 transiciones y alternativas negativas

**Fecha de la investigación:** 10/10/2026.
**Rama experimental:** `experimento-analisis-visual-5d`.
**Protocolo previo a ejecución:** `PROTOCOLO_ATLAS_COMPLETO_CON_NEGATIVOS_08_30_SEPT_2026.md`, commit `434c35f694c0ed8e09f5960e8a60e5d187460f44`.

## Estado de la ejecución
GitHub Actions **COMPLETO Y VERIFICADO**, run **38048007954**: https://github.com/y0t3/Modelo-Papa/actions/runs/38048007954

Primero `cerrar-95-cortes-antes`: crea y sube **95 exámenes ciegos** (19 jornadas de transición × 5 turnos), y excluye resultado del turno objetivo. Se parte de **20 hojas completas MARCADAS** de 08–30/09 sin los tres domingos. La hoja histórica anterior y todas las cabezas completas siguen visibles; +11 muestra sólo columnas y huellas de hoy que existían ANTES de ese turno, con opción de dibujar y abstenerse. Las inversiones son nuevas lecturas de una misma geometría, no huellas de tinta histórica adicionales.

Después `estudiar-movimientos-y-negativos-despues`: recoge el archivo ciego sellado y sólo entonces compara contra todas las marcas reales tras el cierre de cada jornada y todas las cabezas publicadas por turno. Dos informes independientes: continuidad/ausencias geométricas y cotejo permisivo de ambas orientaciones contra cabezas del objetivo. No hay cifras candidatas ordenadas, ni elección previa, ni pronóstico.

Los tres ZIP:
- **95 visores antes de sorteo**: https://github.com/y0t3/Modelo-Papa/actions/runs/38048007954/artifacts/11668581199 — abrir `index.html`; hoja MARCADA, las 3 modalidades, cinco instantes por jornada.
- **Todas las continuidades/ausencias y los 95 cotejos posteriores**: https://github.com/y0t3/Modelo-Papa/actions/runs/38048007954/artifacts/11668222614 — `ATLAS_NEGATIVOS_Y_MOVIMIENTOS.md`, `CONTROL_95_CORTES_POSITIVOS_Y_NEGATIVOS.md`, `RESUMEN_ESTUDIO.json`, 19 archivos por transición con cada ruta antigua y su posible relación, 95 archivos `POST-*.json` con todas las lecturas coincidentes y no coincidentes.
- **Atlas ocular de todos los pares históricos**: https://github.com/y0t3/Modelo-Papa/actions/runs/38048007954/artifacts/11668227703 — abrir `index.html` y comparar ambos tableros +11 con los dibujos, sus cabezas de origen y fecha, 1903 relaciones retrospectivas.

Tests de forma física, inversión, traslación, giro, no cruce entre fuentes, lectura de cabeza por VT3, y censura temporal: **superados**. La primera ejecución del flujo falló sólo en una aserción de datos ficticios por comparar 2 cifras contra un caso VT3 de 3; se corrigió el fixture de la prueba, se repitió el procedimiento íntegro, y la ejecución oficial final fue exitosa.

## Cómo se cuentan las rutas

La unidad es **una huella física antigua única por jornada y modalidad** (secuencia dentro de una sola fuente, sin contar su inversión como segundo dibujo), NO las distintas cabezas que la volvieron a marcar. Cada recorrido viejo conserva **todas** sus relaciones con recorridos nuevos de la misma modalidad y misma columna. Para balancear, cada antiguo se clasifica por precedencia exclusiva: huella idéntica (directa o inversa), traslación física con pasos iguales, giro/continuidad de extremo, simple roce de celdas y sin relación catalogada.

Una figura de otra columna puede verse como analogía gráfica, **pero nunca se conectan celdas de columnas diferentes** ni se la cuenta como movimiento físico.

**Son observaciones de parejas de jornadas ya sorteadas, NO desplazamientos pronosticados.**

## Resultado exhaustivo en 19 transiciones

| Modalidad | Exposiciones de formas viejas | Misma geometría | Traslación en misma fuente | Giro en extremo | Roce sin extremo | Sin relación catalogada | Figuras NUEVAS sin relación previa |
|---|---:|---:|---:|---:|---:|---:|---:|
| **VT2** | **544** | **143** | **326** | **50** | **0** | **25** | **25** |
| **VT3** | **258** | **15** | **32** | **108** | **24** | **79** | **99** |
| **VT4** | **71** | **0** | **2** | **12** | **8** | **49** | **50** |
| **TOTAL** | **873** | **158** | **360** | **170** | **32** | **153** | **174** |

**Porcentaje de huellas antiguas sin relación:** VT2 25/544=4,6%; VT3 79/258=30,6%; VT4 49/71=69,0%. **Exactitud de misma geometría:** VT2 143/544=26,3%, VT3 15/258=5,8%, VT4 0/71=0%. **No son tasas de acierto de apuestas ni observaciones estadísticamente independientes.** Las mismas formas pueden aparecer en varios días, modalidades de dos celdas generan abundantes formas parecidas en una columna de 6×2.

## Control específico: variabilidad de VT3 y casos negativos

| Transición | VT3 antiguas | Exactas | Trasladadas | Giros | Roces | Sin relación |
|---|---:|---:|---:|---:|---:|---:|
| 08→09/09 | 13 | 0 | 1 | 7 | 1 | **4** |
| 21→22/09 | 10 | 1 | 3 | 4 | 0 | **2** |
| 22→23/09 | 15 | 1 | 0 | 1 | 0 | **13** |
| 29→30/09 | 12 | 3 | 1 | 5 | 2 | **1** |

Incluso dentro de una modalidad, algunas jornadas muestran muchas continuidades y otras casi ninguna. El salto 22→23 tuvo **13 figuras VT3 sin relación de 15**, mientras 29→30 tuvo **1 de 12**; eso documenta que la **densidad retrospectiva de formas confirmadas cambia mucho** entre jornadas. No se puede interpretar 29→30 como señal singular de predicción sin explicar por qué se la habría escogido frente a otros períodos de muchos roces/giros y frente a los recorridos no confirmados.

### Relación con la hipótesis descartada como criterio de cobertura cotidiana
El doble contacto de `289/982` (29/09) y `778/877` (30/09), aislado *después* del resultado, seguía sin aparecer en **13** cortes Matutina de períodos externos 08–22/09 bajo la regla congelada. No modificar la definición a posteriori para capturar una relación geométrica favorable. Este atlas amplía el campo de observación, no lo reemplaza por una nueva regla de pronóstico.

## Precisiones indispensables

- El post coteja TODAS las familias que se podían leer de una huella vieja en cada uno de los 95 cortes, contra las cabezas completas del objetivo, VT2/VT3/VT4 por separado y sin elegir sentido; un `MATCH_RETROSPECTIVO_SIN_ELECCION` significa sólo coincidencia entre MUCHAS lecturas permisivas.
- Cuando faltan cabezas de alguna jurisdicción, un valor no encontrado es `NO_CONCLUYENTE_COBERTURA`, no se presenta como fracaso.
- Los 1903 vínculos del atlas ocular son **PARES de dibujos** y NO 1903 confirmaciones independientes ni aciertos; el informe de continuidad exclusivo por huella antigua da denominadores más honestos.
- No hay validación directa de esas trazas reconstruidas contra tinta original de videos de septiembre; corresponden a la especificación geométrica física ya acordada y los registros históricos disponibles.

## Decisión y siguiente línea

El material muestra que para estudiar el «ojo» del padre conviene mirar **todos los caminos marcados y todos los giros que dejan de confirmarse**, sin simplificarlo al conteo de parecidos ni a un filtro raro VT3. Siguiente investigación: seleccionar **sin conocer el resultado siguiente** una *descripción cualitativa de continuidad* de la ruta del día anterior, con justificación frente a otras formas visibles y opción de abstención, registrar la decisión por turno (y orientación si se elige una cifra), y posteriormente cotejar también sus falsas alarmas en un período no usado para idear esa descripción. Una réplica histórica no es un verdadero pronóstico prospectivo.

**No se tocó** `main`, motor congelado, selector ni APK oficial. Toda la investigación se guardó en la rama experimental.
