# Modelo Papá — Examen ciego completo y convergencias sin doble conteo

Fecha: 10/10/2026. Rama exclusiva de investigación: `experimento-analisis-visual-5d`.

## Continuación exacta de septiembre

Se retomó el punto de control `PUNTO_CONTROL_ATLAS_GIROS_TRASLACIONES_SEPT_2026.md`. Quedaron intactos: la reconstrucción post-sorteo de TODAS las coincidencias y todos los caminos VT2/VT3/VT4, la cabeza completa bajo cada hoja, y la regla de recorrido contiguo en UNA columna de origen, sin celdas repetidas, sin saltos, incluyendo orientación inversa.

Se creó `scripts/run-blind-visual-exam7d.cjs` y el visor autónomo `scripts/visor-ciego7d.js`/`.css`. Produce 30 cortes (24,25,26,28,29,30/09, 5 turnos por fecha):

- Izquierda: hoja MARCADA completa de la jornada realmente sorteada anterior, no tablero vacío.
- Derecha: todas las columnas +11 realmente disponibles ANTES del turno objetivo, más las marcas que correspondían SOLO a turnos cerrados de hoy. Se muestran huellas heredadas y memoria D−7 si existiera (30/09 puede mirar 23/09).
- Controles independientes VT2/VT3/VT4, resalte de cualquier ruta histórica, y dibujo MANUAL de 2–4 cifras sobre celdas físicamente contiguas de una sola columna. No repetir celda, saltar filas ni atravesar turnos.
- Permite escribir por qué destaca un recorrido o explicar **OBSERVAR / NO JUGAR**. Como máximo tres hipótesis opcionales; no se completa ningún cupo por obligación.
- Exporta un JSON **local** separado, sin resultados del objetivo. Se declara explícitamente REPLAY histórico, **no sello temporal prospectivo** ni predicción verdadera.
- Los tests comprueban que las columnas futuras no aparezcan, que Previa no utilice su propio resultado, y que se rechacen etapas contaminadas con marcas del objetivo.

**Ejecución verificable:** https://github.com/y0t3/Modelo-Papa/actions/runs/38045200336

**Descarga de los 30 visores:** https://github.com/y0t3/Modelo-Papa/actions/runs/38045200336/artifacts/11667607657

Abrir `index.html`. Cada página tiene su JSON con datos SOLO anteriores al objetivo. Los resultados reales, que conocemos por tratarse de septiembre pasado, no se incorporan a esos documentos.

## Segundo ensayo: TODAS las convergencias entre recorridos históricos (sin elegir aciertos)

Se creó `scripts/run-causal-convergence-inventory7d.cjs`. Para cada corte relee TODOS los recorridos ya MARCADOS de ayer sobre el tablero visible del día objetivo. Por cada huella, diferencia su orientación original directa y su inversión físicamente válida dentro de la misma columna. La inversa es **lectura experimental**, no tinta histórica nueva. Agrupa coincidencias de igual modalidad y valor por cabezas históricas de origen diferente (turno+jurisdicción+cabeza); varios caminos de una misma cabeza no constituyen confirmaciones independientes.

Además agrupa los valores simétricos bajo **una sola familia de orientación** (por ejemplo 37/73, 778/877): de lo contrario se cuentan dos veces un mismo dibujo invertido. Reporta todos los casos, incluyendo familias sin contactos, y compara sólo contra marcas YA publicadas de hoy, nunca contra las del objetivo.

**Inventario ejecutado y validado:** https://github.com/y0t3/Modelo-Papa/actions/runs/38045200336/artifacts/11667452818

Dentro del ZIP:
- `INVENTARIO_CONVERGENCIAS.md` y JSON: los 30 cortes, todas las coincidencias con al menos dos cabezas anteriores;
- `FAMILIAS_ORIENTACION.md` y JSON: agrupación sin doble conteo, contactos, alternativas y ausencias de señal.

## Hallazgo de control: Primera y Matutina del 30/09

**ANTES de Primera del 30/09**: 17 rutas heredadas, 25 lecturas distintas considerando sentidos directo/inverso; 4 valores con convergencia de al menos dos cabezas, PERO sólo dos familias de inversión:

1. VT2 **37 / 73**: cabezas históricas 8731 y 8794; tres registros cabeza-ruta. **0** contactos con las marcas conocidas de Previa 30.
2. VT3 **778 / 877**: cabezas históricas 4983 (directa 778 desde VT3 983) y 7289 (inversa 778 desde VT3 289, cuya dirección original releía 877); dos registros cabeza-ruta. **0** contactos con marcas de Previa 30.

**ANTES de Matutina del 30/09**, con Previa y Primera ya cerradas, había 25 rutas heredadas, 32 lecturas diferentes y 8 valores convergentes que representan CUATRO familias. Los contactos con marcas ya comprobadas eran:

| Familia | Modalidad | Registros de cabeza-ruta | Contactos con marcas ya comprobadas hoy | Misma huella ya confirmada hoy |
|---|---|---:|---:|---:|
| 01 / 10 | VT2 | 2 | 1 | 1 |
| 15 / 51 | VT2 | 4 | 0 | 0 |
| 37 / 73 | VT2 | 3 | 2 | 0 |
| 778 / 877 | VT3 | 2 | 2 | 0 |

**Nuevo hallazgo, y límite importante:** la familia 778/877 pasa de 0 contactos antes de Primera a 2 antes de Matutina. Pero también la familia 37/73 presenta 2 contactos antes de Matutina. Por eso **el incremento de contactos NO es exclusivo** de la figura que después confirmó la cabeza 6778 en Matutina. Tampoco el dato físico escoge con certeza 778 frente a 877 (ambas orientaciones disponibles) ni Matutina frente a Primera (ambas previas al sorteo).

La cabeza **0910** de Primera del 30 confirmó 10 en otra huella, pero no fue elegida previamente entre las 17 rutas. La cabeza **6778** de Matutina confirmó 778, pero tampoco hubo un pronóstico real previo: el método experimental se reconstruyó con resultados de septiembre ya conocidos y no podemos atribuirle un acierto prospectivo.

**Conclusión:** comparación visual causalmente correcta de un caso prometedor y sus alternativas negativas, SIN criterio discriminante validado. No transformar 0→2 contactos en filtro obligatorio, ranking, Top3 ni apostar por 778 retroactivamente. Una señal visual debe identificar qué recorrido y qué turno habría destacado antes de los resultados sin dejar múltiples rivales igualmente plausibles.

## Próximo paso exacto

Tomar varios cortes de los 30 (incluyendo este par y cortes con ausencia de convergencias), registrar una lectura cualitativa **sin mirar el resultado objetivo**, y compararla después contra TODOS los resultados (cabezas de las seis jurisdicciones) con VT2, VT3 y VT4 por separado. En estudios históricos queda rotulado como replay, no prospectivo. Cuando exista una hipótesis visual definida que realmente discrimine, llevarla a turnos **aún no sorteados**, con decisiones congeladas antes de cada publicación y evaluación frente al azar.

**Sin cambios:** `main`, motor oficial, selector congelado y APK de producto. Todo el código y datos de esta continuación se guardaron solamente en la rama experimental.
