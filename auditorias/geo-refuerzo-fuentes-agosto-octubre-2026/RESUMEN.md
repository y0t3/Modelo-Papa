# Estudio del respaldo entre columnas: agosto a octubre 2026

**Cerrado: 16/10/2026 · rama de laboratorio**. APK 0.3.5 y motores `src/motorLalo.ts` y `src/vt3Shadow.ts` intactos.

## Diseño congelado
Se utilizaron los **mismos criterios** y tres familias como límite para todos los cortes PRE:
- `ORIGINAL`: las tres primeras de Geometría completa, sin tocar su orden.
- `PREVIA_FIJA`: las tres de Previa conservadas durante toda la jornada.
- `FUENTES_PRIMERO_TOP10`: ordenar las diez primeras de Geometría según **cantidad de columnas físicas diferentes** que contienen a cada familia (no según cantidad de recorridos); desempatar con el ranking original; seleccionar tres.
- `BONO_UNA_POSICION_TOP10`: bonificación máxima de 1,5 puestos por tener al menos una columna adicional; seleccionar tres.
- Refuerzo entre columnas definido como una familia existente en la hoja de Previa que luego tiene al menos un recorrido en **otra columna del mismo día**. Cada columna cuenta una sola vez por familia, aunque contenga diez trayectos de esa familia.

Los resultados objetivo no entran en las hojas PRE reconstruidas ni en los rankings. Sin embargo las reglas fueron investigadas **después de conocer los sorteos** de esas fechas: prueba retrospectiva, **no** un sello prospectivo.

## Prueba A: 15/09 al 15/10 (27 jornadas, 135 turnos, 675 cabezas)

| Selección Top3 | Aciertos VT3 |
|---|---:|
| Geometría original | 10 |
| Previa congelada | 10 |
| Fuentes distintas primero | **11** |
| Bonificación pequeña | 10 |

- La prioridad fuerte a nuevas fuentes añadió **un único acierto**, el Nocturno del 17/09, al admitir la familia `438/834`. No quitó ninguno de los diez, pero se trata de una sola diferencia dentro de fechas usadas repetidamente para desarrollar modelos.
- Exposiciones de familias existentes desde Previa en los cuatro turnos posteriores: **1.126** con columna adicional (**12** coincidencias ganadoras), **4.786** con una sola fuente (**43**).
- Control neutral condicionado por **turno, banda de rango en Previa y densidad de rutas físicas en Previa**: promedio de **14,11** coincidencias reforzadas (intervalo central simulado 10–19), frente a **12** observadas. **No se observó una ventaja general** por tener más columnas.
- Exposiciones de familia Top3 con respaldo adicional: **79** con 5 coincidencias; **221** de una sola fuente con 3. No inferir beneficio sin corregir selección inicial y dependencia intra-jornada.

## Verificación B sin retocar ninguna regla: 15/08 al 14/09 (26 jornadas, 130 turnos, 650 cabezas)

| Selección Top3 | Aciertos VT3 |
|---|---:|
| Geometría original | 1 |
| Previa congelada | 1 |
| Fuentes distintas primero | 1 |
| Bonificación pequeña | 1 |
| Lalo oficial | 1 |

- Ninguna de las dos nuevas reglas de fuentes aportó un acierto.
- Refuerzo: **1.277** exposiciones con varias columnas, **14** coincidencias ganadoras; sin refuerzo: **4.771** exposiciones, **41** coincidencias.
- Control comparable por turno, rango en Previa y densidad física: **11,50** coincidencias reforzadas esperadas (intervalo simulado 6–17), frente a **14** observadas. Este efecto tampoco es concluyente.
- Los 130 cortes contenían **163 cabezas con una familia VT3 físicamente visible en la hoja** (25,1%). En la Prueba A, **171 de 675** (25,3%) tenían esa presencia física. **La caída del Top3 no se explica por desaparecer las familias ganadoras de las hojas.**
- Promedio del control neutral por **misma columna y misma forma**: **1,72** aciertos en agosto/septiembre temprano vs **5,57** en septiembre/octubre, frente a Geometría (1 y 10). Ambos controles respetan fuente y forma; son exploratorios y condicionados a lo elegido, **no valores p confirmatorios**.
- Los Top3 principales procedían de la Nocturna anterior en **358/390** puestos (91,8%) frente a **381/405** (94,1%) en la Prueba A; el predominio de esa columna persiste en ambos períodos.
- Los tops conservaron las mismas tres familias en 92/104 transiciones entre turnos de la Prueba B y en 100/108 de la A. El exceso de inercia sigue sin proporcionar precisión de turno.

## Interpretación y decisión
1. **NO activar prioridad de múltiples fuentes:** un solo acierto adicional en un período y cero en el tramo anterior; no es estable.
2. **NO reemplazar el motor por Geometría completa:** su Top3 fue 10/135 en un período y apenas 1/130 en otro, con cobertura física ganadora similar.
3. **NO asumir que el más alto Top geométrico sigue nueva información durante el día:** congelarlo desde Previa rindió lo mismo en ambas pruebas.
4. **Separar disponibilidad y prioridad:** presencia física de la familia acertada ~25% en ambos períodos, pero enorme diferencia en la selección Top3. Hay que analizar si las reglas que prefieren ciertos desplazamientos, formas y fuentes están capturando patrones frágiles del histórico.
5. Los números son **aciertos retrospectivos de familias de 3 cifras**, no de 4 cifras exactas ni garantía de jugar con éxito. Cabezas de jurisdicciones y turnos dentro de la misma jornada pueden estar correlacionadas; no tratar 675 o 650 como observaciones totalmente independientes.

### Próxima prueba útil
Auditar las **formas geométricas y desplazamientos preferidos** por los primeros puestos y compararlos con el universo de formas físicamente disponibles y con las familias ganadoras, **separado por períodos**. Si una regla favorece excesivamente una figura vertical/diagonal en agosto y septiembre, o un desplazamiento máximo atípico, debería ser observable con desglose de familias, rutas, forma y fuente. Evitar retocar prioridades hasta contrastar causas.

## Evidencia exacta
- 15/09–15/10: https://github.com/y0t3/Modelo-Papa/actions/runs/38850256819
- 15/08–14/09: https://github.com/y0t3/Modelo-Papa/actions/runs/38850616453
- Ambos workflows guardan el artefacto `LAB-GEOMETRIA-LALO-HISTORICO-2026` con el archivo JSON `GEOMETRIA_REFUERZO_FUENTES_15AGO_14SEP2026.json` o `GEOMETRIA_REFUERZO_FUENTES_15SEP_15OCT2026.json`, junto a los resultados base, variaciones y perfiles físicos.
- Código de las pruebas: `scripts/lab-geo-source-reinforcement.ts` (apoyo, denominadores, estratos, Top3), `scripts/lab-geo-matched-control.ts` y `scripts/lab-geo-lalo-retro-2026.ts`.
