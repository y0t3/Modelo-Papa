# Nacimiento real de familias VT3 por columna — 265 cortes

**Investigación retrospectiva finalizada 16/10/2026. Sin cambios en `main`, APK 0.3.5, `src/motorLalo.ts` ni `src/vt3Shadow.ts`.**

## Objetivo
Distinguir, para cada familia reversible VT3:
1. **Primera columna donde la familia es físicamente trazable.**
2. **Columna elegida como testigo del ranking** (no necesariamente la primera; puede ser mero refuerzo).
3. **Familias nuevas de verdad** aportadas por una columna publicada y **familias antiguas que solo reciben recorridos/fuentes adicionales**.
4. Efecto de abrir o restringir las fuentes en un Top3 de exactamente tres familias.

## Reglas verificadas
- 53 jornadas y **265 turnos PRE** (15/08–15/10), **1325 cabezas** argentinas. Montevideo únicamente participa como fuente física cuando corresponde.
- Cada PRE se compone exclusivamente de Nocturna anterior y columnas del mismo día **anteriores al objetivo**. El objetivo no entra ni en puntajes ni en familias.
- En cada fuente, enumera todos los caminos de tres celdas válidos y la familia reversible; no cruza fuentes, no salta casillas, no duplica familias por rutas inversas.
- Primera aparición se calcula en orden **Nocturna anterior → Previa → Primera → Matutino → Vespertino**.
- Las fuentes físicas no se confunden con jurisdicciones; cuando una familia está en dos fuentes **no son dos aciertos**, y cuando se usa un recorrido de Previa no se presupone que la familia haya nacido allí.
- No se ajustaron pesos de normalización por resultados. **Todo es retrospectivo sobre datos ya estudiados**, no validación predictiva prospectiva.

## Disponibilidad física: muchas familias nuevas

De las 1325 cabezas evaluadas, **334** tenían físicamente su familia VT3 en la hoja PRE correspondiente. El origen de esas 334 apariciones de cabeza por turno:

| Primera columna que permite formar la familia | Cabezas físicamente trazables |
|---|---:|
| Nocturna anterior | **140** |
| Previa | **85** |
| Primera | **61** |
| Matutino | **32** |
| Vespertino | **16** |
| **Total** | **334** |

**194/334 (58,1%)** correspondían a familias cuya primera ruta se formó en una columna del **mismo día**, no en Nocturna anterior. *El denominador son exposiciones de cabeza por turno; no familias únicas ni observaciones independientes.*

Nacimientos de familias reversibles distintas **por corte**: además de las 2990 familias existentes al crear Previa (sumadas sobre 53 días, pueden repetirse entre fechas), las cuatro nuevas columnas aportaron **8198 apariciones de familia realmente nuevas** y **2485 apariciones de familia que ya existía en alguna columna anterior**. Estos recuentos no representan 8198 familias únicas a lo largo de los meses.

| Turno objetivo | Cabezas ganadoras físicamente trazables | Entre ellas nacieron en columnas posteriores a Nocturna anterior |
|---|---:|---:|
| Previa | 29 | 0 |
| Primera | 47 | 21 |
| Matutino | 81 | 47 |
| Vespertino | 71 | 50 |
| Nocturno | 106 | 76 |
| **Total** | **334** | **194** |

Por ejemplo, para el Nocturno, 76 de las 106 apariciones físicamente disponibles nacieron en columnas del mismo día. Eso es una **ventana de disponibilidad**, no una capacidad de seleccionarlas a tiempo.

## Cotejo de tres familias por turno

Se usaron los mismos percentiles geométricos de la rama anterior. Cada método siempre presenta tres familias VT3 distintas, sin modificar la definición de acierto.

| Método | 15/08–14/09 | 15/09–15/10 | Total Top3 |
|---|---:|---:|---:|
| Geometría completa oficial experimental en app (sin cambios) | 1 | 10 | **11** |
| Normalización, **solo Nocturna anterior** | 2 | 9 | **11** |
| Normalización, **todas las fuentes disponibles** | 3 | 9 | **12** |
| Normalización, **2 de Nocturna + 1 de otra fuente** | 3 | 9 | **12** |

- Las 11 coincidencias VT3 Top3 del motor Geometría completo provienen de familias originalmente disponibles en Nocturna anterior, aunque **54/795** de sus puestos Top3 sí correspondieron a familias que aparecieron por primera vez en otras columnas (ninguna resultó ganadora).
- Normalización libre encontró **3 cabezas con familia nacida en columna del mismo día**. Todas compartían columna del testigo con primera aparición (dos en Previa, una en Matutino).
- La selección 2+1 encontró **2 de esas cabezas nacidas en Previa**; el 29/09 Nocturno perdió la familia ganadora nacida en Matutino, pero recuperó una familia de Nocturna el 21/09. Empató así el total 12 de la variante libre.
- Con todas las fuentes, respecto al control de Nocturna exclusiva hubo **3 ganancias y 2 pérdidas**, total **+1**, cambiando las familias seleccionadas en **192/265 cortes**.
- El control 2+1, frente a Nocturna exclusiva, ganó dos casos (08/09 y 11/09 Matutino) y perdió uno (07/09 Matutino), igualmente **+1** en 265 cortes.

## Casos verificables de familias realmente nuevas
- **08/09 Matutino**: `678/876`, primera aparición física en **Previa**, normalización libre y 2+1 Top3, no existe en la columna Nocturna anterior.
- **11/09 Matutino**: `418/814`, primera aparición en **Previa**, ambas variantes la incluyen, no existe antes.
- **29/09 Nocturno**: `709/907`, primera aparición en **Matutino**, normalización libre Top3. Selección 2+1 no la incluye.
- **07/09 Matutino**: reservar un puesto a Previa desplazó `021/120`, nacida en Nocturna anterior, que sí coincidió en una cabeza; ejemplo de costo real de introducir nueva fuente.
- **21/09 Nocturno**: seleccionar fuentes libres desplazó `173/371`, ganadora del Top3 limitado a Nocturna. La reserva 2+1 la conserva.
- **15/10 Nocturno**: la familia `426/624` nació en Nocturna anterior y la conservan Geometría y normalización libre, con independencia de que se incorporaran otras fuentes.

## Interpretación y decisión
1. La hipótesis **sí tiene una base geométrica real**: una fracción importante de los resultados físicamente explicables corresponde a familias que no podían existir antes de incorporar otra columna.
2. El problema no es solo admisión, sino **discriminación** entre miles de familias nacidas nuevas por jornada. Permitir otros orígenes recupera casos pero desplaza otros candidatos correctos.
3. **Ninguna regla de reserva automática se integra a los motores.** Diferencia neta de un acierto entre 265 cortes sobre histórico ya optimizado no es robusta.
4. No medir el mérito por *cantidad de recorridos*, porque varios recorridos pueden representar la misma familia o una única fuente.
5. El siguiente estudio útil debería comprobar si una familia recién nacida dispone de una **huella ganadora verificada del mismo día de semana anterior** y un **recorrido rígidamente trasladable**, y si ese apoyo diferencia a las nuevas familias que resultan acertadas de las muchas alternativas físicas que nunca salen. Analizar numeradores y denominadores de todas las nacidas, no solo los casos exitosos.

## Archivos y reproducibilidad
- Github Actions: https://github.com/y0t3/Modelo-Papa/actions/runs/38858770271
- Scripts: `scripts/lab-geo-column-entrance.ts`, `scripts/lab-geo-normalization.ts`, `scripts/lab-geo-shape-audit.ts`, `scripts/lab-geo-roots-265.ts`.
- Rama: `lab/geo-aporte-columnas-265-16oct2026`.
- Artefacto `HUELLAS-GANADORAS-265-CORTES`: el archivo `GEOMETRIA_APORTE_COLUMNAS_265_CORTES.json` tiene primer origen por familia, testigo físico de cada Top3, conteos por turno, contrastes 2+1/Nocturna y casos de ganancia/pérdida. Conserva informes históricos anteriores para validación cruzada.
- **Estos números son diagnósticos retrospectivos, no probabilidades de acierto ni recomendaciones para apostar.**
