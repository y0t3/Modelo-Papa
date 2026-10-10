# Modelo Papá — lectura de la hoja marcada del 29 sobre la tabla +11 del 30

Fecha de investigación: 2026-10-10. Rama `experimento-analisis-visual-5d`.

## Metodología comprobada

1. Construir la hoja histórica del **29/09/2026** DESPUÉS de los sorteos: localizar cada cabeza conocida en las columnas +11 que existían antes de su turno; marcar **todos** sus recorridos VT2/VT3/VT4 y anotar la cabeza COMPLETA debajo.
2. Tomar **únicamente esos caminos ya marcados**, con columna y orden de celdas exactos; no enumerar rutas en una cuadrícula vacía.
3. Leer los dígitos de esas celdas en la tabla del **30/09/2026** en cada corte ANTES del objetivo: 1, 2, 3, 4 o 5 columnas disponibles.
4. Si en el día 30 ya terminó algún sorteo anterior al objetivo, ver por separado sus propias marcas confirmadas; registrar contactos y repeticiones de huella SIN interpretarlos automáticamente como señal.
5. No mirar cabezas del objetivo ni futuros para construir las relecturas. El script lo comprueba sustituyendo los resultados objetivo/futuros por otros números y exigiendo que las observaciones no cambien.
6. No producir rankings, pronósticos ni aumentar candidatos: las relecturas son el material para **interpretar**, no una lista de apuestas.

## Cinco cortes causales sobre datos reales

| Objetivo del 30/09 todavía no sorteado | Columnas +11 visibles | Rutas históricas legibles del 29 | VT2 | VT3 | VT4 | Rutas antiguas que tocan marcas ya comprobadas hoy |
|---|---:|---:|---:|---:|---:|---:|
| Previa | 1 | 10 | 6 | 4 | 0 | 0 |
| Primera | 2 | 17 | 11 | 6 | 0 | 2 |
| Matutino | 3 | 25 | 17 | 8 | 0 | 15 |
| Vespertino | 4 | 29 | 19 | 10 | 0 | 24 |
| Nocturno | 5 | 37 | 23 | 12 | 2 | 25 |

Los conteos de rutas/contactos NO son sorteos independientes ni probabilidades; crecen en parte porque se añaden columnas +11 y marcas confirmadas.

## Ejemplo concreto: 0154 → 54 → 10 → 0910

- La cabeza completa **0154**, sorteada en **Primera del 29/09**, admitió un recorrido **VT2 54** en la columna `prevNocturno`: **1:0 → 0:0** (coordenadas fila:lado, base cero; lectura de abajo hacia arriba).
- Sobre la tabla +11 del **30/09 antes de Primera**, esas **mismas celdas, mismo origen y mismo sentido de lectura**, permitían leer **10**. La relectura estaba disponible ANTES de que saliera Primera.
- Solamente **DESPUÉS** de Primera del 30/09 se conoció la cabeza completa **0910**. Su terminación **10** se marcó efectivamente en la misma ruta, usando la columna Nocturna anterior +11.
- Esto es una **continuidad retrospectiva concreta de recorrido y cifras** y respeta las reglas temporales.
- **No es una predicción realizada:** antes de Primera teníamos **17 recorridos históricos legibles**, incluidos **11 VT2 y 6 VT3**. No habíamos elegido el `10` por una interpretación previa que distinguiera ese trazo del resto. No contar este hallazgo como acierto prospectivo ni ajustar filtros mirando su resultado.

## Casos de contraste que también conservamos

- **4983**, Primera del 29, ruta VT3 **983** `prevNocturno` **3:1 → 2:1 → 1:1**: al releerla antes de Previa del 30 aparece **778**. Esto no prueba que el 778 deba salir.
- **7342**, Nocturna del 29, ruta VT4 **7342** `Vespertino` **1:0 → 2:0 → 3:0 → 3:1**: disponible para releer en la tabla del 30 antes de Nocturna como **7762**. La figura no se escogió como pronóstico.
- Antes de Primera del 30, la cabeza **1553** ya había salido en Previa y sus marcas VT2 compartían celdas con recorridos de la cabeza **7289** del 29. Es un **contacto entre trazos históricamente comprobados**, no un recorrido que salte de una columna a otra.

## Archivos verificables

- `scripts/run-marked-visual-continuity7d.cjs`: reconstruye las dos hojas a partir de datos reales y guarda **cinco cortes previos al objetivo**, sin usar cabezas posteriores.
- Para cada corte: `N-ANTES-<turno>.html` muestra las **dos tablas +11 lado a lado** con el orden de celdas resaltado de **cada** recorrido histórico, y `.md` y `.json` conservan la lista **completa**, sin seleccionar sólo casos que acertaron.
- Ejecutado y controlado en GitHub: https://github.com/y0t3/Modelo-Papa/actions/runs/38039790146
- Artefacto: https://github.com/y0t3/Modelo-Papa/actions/runs/38039790146/artifacts/11664704036

## Próxima pregunta visual, sin alterar el método

Entre las 17 relecturas anteriores a Primera del 30, **¿qué habría destacado visualmente la figura 54→10 frente a las otras figuras marcadas**, ANTES de saber que la cabeza 0910 confirmaría esa huella? Esa distinción —si se puede encontrar sin mirar el resultado— es lo que debemos investigar sobre varias hojas sucesivas.

No convertir la continuidad aislada 54→10 en fórmula o regla de puntuación. La hipótesis de continuidad concreta sólo podría recibir valor predictivo si se registra antes de sorteos futuros, con comparaciones del mismo presupuesto y la posibilidad legítima de `NO JUGAR`.

El motor oficial, `main`, VT2 independiente, VT4 experimental y APK no se modificaron.
