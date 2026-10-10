# Punto de control: PRIMER TABLERO DE VERDAD ANTES DE UN SORTEO — 10/10/2026 Previa

## Estado de captura

**Capturado y verificado exitosamente el sábado 10/10/2026 a las 09:04:33.017 ART** (12:04:33.017Z). Fuente vivitusuerte `cabezasDiarias`, reconstrucción digital con el motor geométrico experimental. **El sorteo Previa estaba programado para las 10:15 ART** según la programación de la Quiniela de la Ciudad: https://quiniela.loteriadelaciudad.gob.ar/. El programa imponía límite más prudente de **10:05 ART** y se negaba a generar un artefacto después de ese instante o si encontraba cualquier cabeza de Previa o un turno posterior.

**Ejecución Actions:** https://github.com/y0t3/Modelo-Papa/actions/runs/38050639551 (job `sellar-tablero-sin-prediccion`, SUCCESS)

**Artefacto fuente íntegro:** https://github.com/y0t3/Modelo-Papa/actions/runs/38050639551/artifacts/11669192326

**Commit que disparó el trabajo:** `8d9dfa2c435f92e5266afa0f1584b738934ace94` en rama `experimento-analisis-visual-5d`.

**SHA256 del JSON del corte previo:** `19d3357c82e59dbf5050ed7941f160b7e4c04a1a0875fb5e25de9147a245ea4b`.

**Cobertura de fuentes:**
- Nocturno **09/10**, 6/6 jurisdicciones: columna +11 utilizable antes de Previa 10/10.
- Nocturno **08/10**, 6/6 jurisdicciones: base utilizada para reconstruir la hoja completa MARCADA del 09/10.
- Nocturno **03/10**, 6/6 jurisdicciones: memoria de la misma fecha semanal D−7; se reconstruyó con su base del 02/10.
- **11** recorridos históricos D−1 reinterpretables en las celdas del nuevo tablero y **15** D−7; todos proceden de cabezas completas y rutas contiguas marcadas anteriormente, sin cruzar columnas.
- Cero marcas comprobadas durante 10/10 antes de Previa (como corresponde al primer turno).
- **Cero cabezas objetivo y cero cabezas posteriores** presentes en la captura.
- **Cero selecciones humanas, cero orientaciones seleccionadas, cero predicciones y cero apuestas** registradas. Ningún número candidato fue elegido por el motor.

## Contenido y uso

Descargar el ZIP, extraerlo y abrir `index.html`. Desde allí se puede abrir el cuaderno `MIRADA-2026-10-10-ANTES-Previa.html` (elige `OBSERVAR / NO JUGAR` o hasta tres rutas manuales con rival, motivo y orientación), el visor físico donde se dibujan celdas contiguas manualmente, y las hojas históricas completas.

Los archivos base `2026-10-10-ANTES-Previa.json` y `MANIFIESTO_CAPTURA.json` llevan la entrada y el hash verificable.

**La captura del tablero SÍ tiene prueba horaria en GitHub Actions**, pues se produjo antes del horario oficial; **esto NO proporciona sello previo a una hipotética elección humana futura**. El JSON que exporte un navegador indica explícitamente `OBSERVACION_LOCAL_NO_SELLADA`. No convertir su fecha local en evidencia temporal.

Si el usuario quiere registrar una observación verdadera debe: (1) elegir en el visor o abstenerse con justificación visual, (2) entregar el JSON para revisarlo y publicarlo externamente **antes de las 10:15 ART**, o subirlo él mismo al repositorio experimental con un evento remoto fechado antes de ese instante; (3) sólo después del resultado consultar las seis cabezas, comprobando *únicamente* la orientación que se eligió, o manteniendo la abstención.

## Reglas del experimento

- Toda cabeza histórica y todos sus recorridos reales se mantienen en el tablero; invertir una ruta es una segunda lectura de la MISMA forma física.
- Se admite `NO JUGAR`, no se requiere número seleccionado.
- No se priorizan artificialmente `778`, `289`, contactos de dos cabezas ni otros filtros que ya mostraron ser escasos o no discriminantes en septiembre.
- Este primer experimento demuestra **captura previa real de datos**, todavía NO demuestra pronósticos oportunos, aciertos, ninguna habilidad predictiva de un usuario ni del método paterno.
- No hay contraste contra resultado hasta que exista un registro humano sellado, o como mínimo un examen **sin pretensión predictiva** separado.

**Todo quedó en rama experimental; no se modificaron `main`, motor congelado, selector ni APK oficial.**