# Punto de control — madre VT3 con anclaje D−7 versus roce general para elegir la cuarta cifra VT4

**11 de octubre de 2026. Ejecución completa y reproducible con 115 cortes históricos**, sin esperar sorteos futuros. Rama experimental `auditoria-sorteo-10oct-2026`. **Ni el motor oficial ni las marcas automáticas del tablero ni la APK fueron modificados.**

## Pregunta física precisa

¿Aporta información específica la **extensión en los extremos de la huella VT3 trasladada desde D−7** —a diferencia de la extensión por roce físico de **cualquiera de las otras copias actuales de esa madre**?

Ambos métodos mantienen:
1. Exactamente **las mismas madres VT3 y su posición** en el ranking previo `MULTIRRUTA_MADRES_ROCE`, sobre la versión corregida de cabezas de cuatro cifras.
2. Madre `729/927` + cifra `3` → **dos hijas VT4 hermanas orientadas** `3729`, `3927`; inversas individuales `9273` y `7293`. No inferir una madre `273` de invertir una hija.
3. Todas las huellas legales, dentro del par 6×2 de una única fuente, vecinos (diagonal incluida), sin saltos, sin cruces de turno ni reuso de celda.
4. Solo datos disponibles **antes del turno objetivo** para formar las propuestas PRE; cabezas POST en fichero aparte para cotejar. Las hojas históricas de septiembre/octubre ya estaban estudiadas: la evaluación es exploratoria, **no prueba predictiva externa**.

**Roce general:** cifra ordenada por cantidad de hijas VT4 físicamente posibles y cantidad de caminos VT4 en todas las copias actuales de la madre; mismos desempates originales.

**Anclaje D−7:** primero variedad de hijas VT4 físicamente posibles al agregar celda en los extremos de una **ruta madre específicamente trasladada desde D−7**, luego número de extensiones de esas rutas; si empatan, los criterios anteriores del roce. No inventar un recorrido nuevo, ni un cuarto dígito a partir de la inversión numérica.

Cupos **1, 2 o 3 dígitos por madre**; madres Top3/5/10. Controles aleatorios preservan las madres y el cupo; una permutación de dígitos es compartida entre los cinco turnos de cada día para cada madre. El cupo K multiplica hasta 4K valores por madre; comparar con Top de cuatro dígitos individuales no es válido.

## Resultados sobre 23 jornadas / 115 cortes

| Presupuesto | Roce general | Anclaje D−7 | Media nulo igual cupo |
|---|---:|---:|---:|
| Top3 madres × 1 cifra | **0** | **0** | **0,443** |
| Top5 madres × 1 cifra | **1** | **1** | **0,820** |
| Top10 madres × 1 cifra | **2** | **1** | **1,865** |
| Top10 madres × 2 cifras | **2** | **3** | — |
| Top10 madres × 3 cifras | **4** | **5** | **5,633** |

En Top10 × 1 cifra, el anclaje **pierde 1 corte** de septiembre y no recupera otros. **Octubre = 0/45** en ambos. La cobertura promedio por corte es 33,55 números distintos para roce y 34,24 para anclaje. El nulo (1.200 simulaciones con semillas fijas) supera al observado anclaje; cola nominal descriptiva ≥1 ~0,863.

En Top10 × 3 cifras, anclaje **5** y roce **4**, frente a **5,633** del azar de igual cupo. Octubre anclaje **3/45** vs roce **2/45**, septiembre ambos **2/70**. La cobertura promedio es 102,13 y 101,77 números distintos respectivamente. Diferencia pareada por día +1 corte, intervalo bootstrap por las **23 jornadas** [0,+3] (no prueba sólida y no externo). El análisis tuvo varios cupos y continúa una larga búsqueda retrospectiva.

## Casos contrapuestos en la hoja

- **26/09 Matutina:** madre `013/310` en puesto 10; cabeza Santa Fe `0137`. Roce coloca cifra `7` **primera**; anclaje la deja **segunda** detrás de `2`. Con una cifra, roce acierta y anclaje falla. Con dos, ambos cubren.
- **03/10 Matutina:** madre `295/592` en puesto 5; cabeza Córdoba `2592`. Anclaje sitúa la cifra `2` **segunda**; roce la deja **cuarta**. Anclaje recupera este corte con dos o tres cifras, pero **no** con una.
- **05/10 Matutina:** madre `729/927` en puesto 10; cabeza Santa Fe `3729`. Cifra `3` queda **tercera bajo ambos órdenes**. Las dos hijas `3729/3927` tienen sus rutas físicas, pero el método no selecciona esa cifra con cupo 1 o 2. Recuperar el caso a K=3 es ampliación de cobertura, no señal de selección exitosa.

## Pruebas y paquete

- 115 casos, **1.104 exposiciones madre/corte Top10**, 11.040 opciones madre+dígito examinadas, **8.655 recorridos físicos anclados** a una ruta VT3 heredada; el primer dígito elegido cambia entre métodos en **274** exposiciones.
- Todas las 8.655 rutas auditadas: cuatro celdas distintas, vecinas, dentro de la misma fuente 6×2, lectura fiel a la grilla, y sus primeras o últimas tres celdas pertenecen efectivamente a una **ruta madre trasladada D−7**.
- PRE generado sin fichero POST, hash SHA256 **`6a77d8ddef2888244a9b7f399a07684d89eac0bfc45e6d3cbf4fb9862e3558a1`**; reproducido **byte por byte en directorio aislado sin resultados objetivo**.
- Archivo `modelo-papa-extension-vt4-anclaje-d7-115-cortes-11oct2026.zip`, **14 archivos**, **2.490.076 bytes**, SHA256 **`b1a367e343405235f1f1a7f4e313b4df5c0cae127421bab45895d6a56c7f41f4`**; ZIP íntegro y extraído en carpeta nueva para repetir la verificación PRE.
- Contiene `analisis.py` con fases `pre` y `post` físicamente separadas, `verificar.py`, fuentes PRE y ranking congelado, resultados POST aparte, `PRE_LOCI.json`, `COTEJO_POST.json`, CSV de **todos** los cortes, informe y dos visores interactivos `VISOR_PRE_115.html`/`VISOR_POST_115.html`.
- Ambos visores abrieron en Chromium con Playwright; selector de fecha/turno/ranking/cifra, dibujo de hoja D−7 y hoja actual, y ausencia de errores JavaScript. **PRE no contiene cabezas objetivo**; el POST las presenta en otra vista. Se auditaron 23 fechas disponibles en cada visor.

## Decisión

El **anclaje de la cuarta cifra en la ruta VT3 heredada** queda incorporado como dimensión de **observación visual** y diagnóstico; **no** ha demostrado que seleccione mejor el dígito que el roce global o un control de igual cobertura. Debe mostrarse como ruta física comprobable, no confundirse con una proyección numérica, y **no** convertirse en bonificación obligatoria de V13/V12/V14.

Esto permite seguir desarrollando la capa de interpretación sobre las hojas disponibles sin esperar nuevos sorteos. Los controles prospectivos pueden seguir por separado, pero no bloquean el proyecto.
