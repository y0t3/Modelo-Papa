# Modelo Papá — Segundo contraste externo congelado: 08–15/09/2026

**Fecha de ejecución:** 10/10/2026. **Rama:** `experimento-analisis-visual-5d`.
**Punto anterior:** `PUNTO_CONTROL_HOLDOUT_EXTERNO_16_23_SEPT_2026.md`.
**Protocolo del segundo contraste, comprometido antes de generar sus expedientes y de consultar resultados:** `PROTOCOLO_CONGELADO_SEGUNDO_HOLDOUT_08_15_SEPT_2026.md`, commit `9c0e8e52230911e0bec2bf52b831a22d72f88e1b`. La regla se mantuvo idéntica a la de 16–23/09.

## Qué se hizo realmente

Se reconstruyeron ocho hojas reales **completas, con todas las cabezas conocidas debajo y todas las huellas VT2/VT3/VT4 físicamente válidas ya marcadas después de los sorteos**, del 07 al 15/09 sin domingo 13. El 07 aporta base para el 08. La hoja 07 a su vez usó la última Nocturna del 05.

Se realizaron siete cortes **ANTES de Matutina**: 08,09,10,11,12,14,15 de septiembre. Se releyeron las huellas históricas de la jornada anterior sobre las columnas +11 que ya existían. Las marcas nuevas se limitaron a Previa y Primera cerradas.

**Regla congelada:** buscar todas las familias VT3 con **dos cabezas históricas diferentes**, **dos huellas físicas diferentes** (una ruta y su inversa cuentan como **una sola** huella), dentro de **una misma columna**, donde **ambas** huellas contactan marcas confirmadas de **Primera** del día. Se conservan VT2, VT3 y VT4 en la hoja para estudio visual, pero la condición exploratoria es sólo VT3. Ambos sentidos numéricos permanecen como posibilidades distintas, jamás se adjudica una elección después de conocer el sorteo.

**Separación temporal reproducible de jobs:** `registrar-sin-matutina` produjo artefacto ciego primero; `cotejo-posterior` y `diagnostico-geometrico` fueron jobs dependientes que leyeron únicamente el artefacto cerrado; sólo `cotejo-posterior` consultó las cabezas del objetivo.

Ejecución final exitosa: https://github.com/y0t3/Modelo-Papa/actions/runs/38047326440

Artefactos:
- **Visor y archivos ciegos 08–15** (abrir `index.html`): https://github.com/y0t3/Modelo-Papa/actions/runs/38047326440/artifacts/11667786949
- **Resultados reales consultados después**: https://github.com/y0t3/Modelo-Papa/actions/runs/38047326440/artifacts/11667816817
- **Diagnóstico de obstáculos físicos, sin conocer resultados**: https://github.com/y0t3/Modelo-Papa/actions/runs/38047326440/artifacts/11668870096

## Registro previo y diagnóstico

| Fecha | Familias VT3 reobservadas | ≥2 cabezas antiguas | De ellas ≥2 dibujos físicos | Ambos dibujos tocando Primera | Estado congelado antes de Matutina | Cobertura de resultado posterior |
|---|---:|---:|---:|---:|---|---|
| 08/09 | 7 | 1 | 0 | 0 | OBSERVAR | 6/6 |
| 09/09 | 10 | 1 | 1 | 0 | OBSERVAR | 6/6 |
| 10/09 | 11 | 0 | 0 | 0 | OBSERVAR | 6/6 |
| 11/09 | 7 | 1 | 0 | 0 | OBSERVAR | 6/6 |
| 12/09 | 7 | 0 | 0 | 0 | OBSERVAR | **5/6** |
| 14/09 | 10 | 0 | 0 | 0 | OBSERVAR | 6/6 |
| 15/09 | 7 | 2 | 0 | 0 | OBSERVAR | 6/6 |

Resultado **externo puro**: **7/7 OBSERVAR**, **0/7 familias completas**, **0 ambiguas** y **0 casos con familia única**. No hubo una cifra ni una orientación elegida. Las 7 abstenciones no se cuentan como pronósticos fallidos y tampoco son aciertos de apuestas.

- El **09/09** es la excepción ilustrativa de dos cabezas y dos formas físicas, pero sin que ambas toquen las marcas de Primera. Este caso permanece registrado sin reducir retroactivamente la condición de contacto.
- El **08, 11 y 15** presentan familias de múltiples cabezas que **no** implican múltiples huellas físicas. Es equivalente a la falla conceptual detectada en `384/483` del 29.
- El **12** tiene sólo cinco cabezas de Matutina recuperadas; cualquier resultado ausente de una jurisdicción debe tratarse como indeterminado, no un fallo. Ninguna familia había sido precalificada, de todos modos.

## Balance conjunto de dos semanas externas, 08–22/09

Primer contraste 16–22/09: **6** cortes externos, todos `OBSERVAR_SIN_FAMILIA`; el **23/09** era solapado y se excluye. Segundo contraste 08–15/09: **7** cortes externos, todos `OBSERVAR_SIN_FAMILIA`.

**TOTAL externo: 13 fechas de sorteo examinadas antes de Matutina, cero familias completas bajo el criterio congelado, 13 abstenciones.** No son 13 intentos de apostar ni prueban tasa de acierto nula: no hubo propuestas numéricas ni orientación fijada. Las observaciones de distintas fechas tampoco son estadísticamente independientes garantizadas; son hojas consecutivas con memoria de la jornada previa.

La anatomía `289/982` del 29 y `778/877` del 30 se aisló retrospectivamente a partir de dos jornadas favorables; en 13 sesiones fuera de aquel momento **no reapareció la figura completa**. Esto es evidencia de escasa **cobertura/activación histórica** de esa descripción, no validación ni refutación concluyente de capacidad predictiva cuando eventualmente aparezca.

## Decisión metodológica

Mantener el criterio VT3 congelado como observación histórica, **SIN convertirlo en filtro de apuesta o selector productivo**. Se puede continuar estudiando otros períodos sin modificarlo, pero una regla que no se activó en 13 fechas externas no fundamenta un pronóstico de uso cotidiano. La investigación debe centrarse asimismo en comparar **todas** las huellas reales y en documentar cómo se mueven, giran e invierten, incluidas las que no terminan en una cabeza ganadora, y en registrar **OBSERVAR/NO JUGAR** como salida legítima.

**Antes de elevar cualquier intuición nueva a predictor**: redactar otra hipótesis, separarla claramente de ésta y someterla a un período no consultado. Una validación fuerte exige fijar cifra, orientación y turno ANTES de que se publique el próximo resultado, y comparar contra una referencia razonable de azar.

**NO se tocaron** `main`, APK oficial, motor oficial ni selector congelado. El trabajo está en scripts experimentales y documentación de la rama de investigación.
