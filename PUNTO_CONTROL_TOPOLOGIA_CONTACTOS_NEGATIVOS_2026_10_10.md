# Modelo Papá — Punto de control: anatomía de contactos y falsos positivos
Fecha de investigación: 10/10/2026. Rama: `experimento-analisis-visual-5d`.

## De dónde se retoma
Se continuó el estudio `PUNTO_CONTROL_EXAMEN_CIEGO_CONVERGENCIAS_2026_10_10.md`, siempre desde las hojas +11 completas ya MARCADAS (todas las coincidencias y todas las rutas VT2/VT3/VT4, cabezas completas debajo), nunca desde la grilla vacía.

Objetivo: distinguir *por dónde se tocan* las huellas de ayer y las marcas confirmadas hoy antes de Matutina del 29/30/09, y enfrentar las figuras confirmadas con todas las alternativas no confirmadas.

## Archivos añadidos y comprobaciones

- `scripts/run-contact-topology-observer7d.cjs` toma los 30 JSON de cortes con el resultado objetivo oculto y describe **todas** las familias de recorridos: origen físico, modalidad, huella ordenada, lectura directa/inversa, cabeza histórica, cada celda compartida, papel de esa celda (inicio/interior/final) y cabeza del turno anterior del día que la toca. No selecciona candidatos. Agrupa cabezas reales diferentes, no equipara rutas de una misma cabeza a respaldos independientes.
- `scripts/run-post-visual-outcomes7d.cjs` se ejecuta únicamente **DESPUÉS** de cerrar todas las fichas preobjetivo; consulta las cabezas reales de las seis jurisdicciones en cada uno de los 30 turnos, coteja las lecturas de cada familia y registra tanto las coincidencias como los casos negativos. **Los resultados se guardan en otro artefacto** y jamás se mezclan con los archivos ciegos.
- Pruebas automatizadas: contigüidad, rutas invertidas e iguales, contacto en segmento versus punto, prohibición de cruces de columnas, deduplicación por cabeza, censura cronológica, sufijos VT2/VT3/VT4, resultados faltantes.
- Ejecución de toda la tubería: https://github.com/y0t3/Modelo-Papa/actions/runs/38045938109
- Atlas de topología PRE-objetivo: https://github.com/y0t3/Modelo-Papa/actions/runs/38045938109/artifacts/11667454166
- Verificación POSTERIOR separada: https://github.com/y0t3/Modelo-Papa/actions/runs/38045938109/artifacts/11667354302

Dentro del ZIP de topología: `RESUMEN_TOPOLOGIA.md` + JSON y una ficha `.md`/`.json` por cada corte. En el ZIP de resultados: `RESULTADOS_POSTERIORES.md` + JSON y un documento por cada turno.

## Hallazgo concreto del 30/09 ANTES de Matutina

| Familia | Cabezas históricas que realmente aportaban el contacto | Cabeza nueva conocida que toca | Geometría |
|---|---|---|---|
| VT3 778/877 | **4983** (Primera, Entre Ríos, 29) y **7289** (Matutino, Ciudad, 29) | **4107** (Primera, Córdoba, 30) | Contactos **puntuales** en `2:1` y `3:1` sobre el origen `prevNocturno`; los trazos de 4107 corresponden a VT2 |
| VT2 37/73 | **8731** (Vespertino, Santa Fé, 29) en **dos rutas** | **4107** (Primera, Córdoba, 30) | Dos contactos en `1:0` del origen `Previa`; **una** cabeza vieja distinta, no dos |
| VT2 01/10 | **0154** (Primera, Santa Fé, 29) | **0910** (Primera, Provincia, 30) | Misma ruta ordenada `prevNocturno:1:0→0:0`, **ya confirmada** por Primera; no es señal nueva para Matutina |
| VT2 15/51 | Ningún contacto | — | Sin contacto |

La familia 778/877 tiene dos **cabezas históricas** involucradas, pero esos contactos con el 30 los produce una **sola cabeza actual 4107**, que admite más de un recorrido VT2. Los 2 contactos no son dos sorteos independientes. Primera 30 todavía no había anunciado 6778; Matutina 30 luego confirmó `778` por cabeza completa **6778**. No había orientación y turno elegidos prospectivamente.

## Comparación necesaria contra el 29/09

**Antes de Matutina del 29**, sobre origen `prevNocturno`:

- VT3 **289/982**: marcado el 28 por cabezas históricas **8037** (VT3 037) y **1760** (VT3 760). Ambos caminos contactaron la marca de **4983** ya conocida de Primera del 29. El tramo `2:1→3:1` del camino heredado de 1760 comparte dos celdas con el VT3 de 4983, mientras que el de 8037 comparte `3:1` en un punto. Matutina del 29 confirmó la terminación **289** a través de **7289**.
- VT3 **384/483**: dos cabezas históricas **2949** y **7949** del 28; ambas explicaban múltiples huellas. Contactaban **dos** cabezas conocidas de Primera del 29, **0154** y **4983**, incluyendo contactos **de dos celdas** con un VT2 de 4983 en `0:1` y `1:1`. Ninguna orientación 384/483 coincidió con las seis cabezas de Matutina del 29.
- En ambas familias existían dos cabezas antiguas; en ambas había segmentos compartidos. Ni la cantidad de cabezas anteriores, ni el número de contactos, ni el contacto de dos celdas aislaron universalmente la familia después confirmada.

**Contraste de anatomía entre aciertos históricos**: el 289 del 29 presenta segmento común + contacto puntual; el 778 del 30 sólo contactos puntuales. **No exigir un segmento común** para explicar un caso y descartarlo en otro.

## Verificación de las otras jornadas (corte ANTES de Matutina)

Con las cabezas históricas recuperadas y todas las familias con al menos dos cabezas anteriores:

| Día | Cobertura real de Matutina | Situación |
|---|---|---|
| 24/09 | 6/6 | 7 familias VT2 convergentes; **ninguna** lectura coincidió con cabezas de Matutina; cinco tenían contacto de al menos dos cabezas anteriores |
| 25/09 | 6/6 | 4 familias VT2 convergentes; ninguna coincidió; una tenía contacto de dos cabezas anteriores |
| 26/09 | **5/6** | 3 familias VT2 convergentes, ninguna entre las cinco cabezas publicadas; **no llamar fallo definitivo** a ausencia con jurisdicción faltante |
| 28/09 | 6/6 | 6 familias VT2 convergentes, ninguna coincidió; tres tenían contacto de al menos dos cabezas anteriores |
| 29/09 | 6/6 | 15 familias convergentes (13 VT2 y 2 VT3). Entre VT3, **289/982 coincide retrospectivamente**, **384/483 no**; el resto tampoco coincide |
| 30/09 | 6/6 | 4 familias convergentes (3 VT2 y 1 VT3). VT3 **778/877** coincide retrospectivamente; las otras tres no |

**Advertencia de evaluación:** una familia `ABC/CBA` equivale a **dos opciones de terminación**; marcarla como `MATCH_RETROSPECTIVO` cuando cualquiera coincide NO equivale al acierto de una apuesta con una sola opción. Tampoco las huellas son observaciones independientes.

## Conclusión visual y límite actual

Aparece una semejanza descriptiva en los dos casos VT3 retrospectivamente confirmados: ambos tenían huellas de dos cabezas del día anterior en `prevNocturno` tocando marcas ya comprobadas de **Primera** de la jornada actual. Pero la familia fallida `384/483` también presentaba contactos con marcas de Primera. La variante «contactos concentrados en una sola cabeza conocida del día actual» diferencia estas dos familias del 29, pero **es una hipótesis sugerida después de mirar los resultados**, no una regla demostrada. No usarla para pronosticar ni agregar puntos al selector.

**Próxima investigación a realizar:** especificar por escrito esa interpretación cualitativa *antes de revisar otro período*, y aplicar la misma observación, sin ajustes retrospectivos, a hojas completas de otra semana (por ejemplo 16–23 de septiembre), incluyendo falsos positivos y abstenciones. Esa revisión sería **validación histórica fuera del período usado para formular la idea**, todavía no pronóstico prospectivo real.

No se modificó `main`, ni la lógica oficial, ni APK ni selector de candidaturas. La totalidad de este trabajo es observación reconstructiva en una rama experimental.
