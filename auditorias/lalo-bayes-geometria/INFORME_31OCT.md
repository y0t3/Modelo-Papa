# VT3 Lalo: estadística + geometría + historia (estudio temporal congelado)
**31/10/2026 | Rama:** `lab/lalo-vt3-bayes-geometria-31oct2026`
**Estado:** investigación experimental; **NO se cambia MV1, Top10 oficial, VT2, VT4 ni APK**.

## Pregunta

¿Puede la hoja +11 conservar su filtro físico y, al mismo tiempo, permitir un ranking probabilístico mejor que la simple frecuencia de las cabezas o que el traslado D−1/D−7 de Lalo?

La hipótesis sigue la regla del padre (3 dígitos contiguos **dentro de una sola columna**, sin saltos ni cambio de fuente; familia reversible). **Solo cambia cómo ordenamos familias que ya eran físicamente formables** antes del turno.

Se compararon cuatro selectores PRE:
1. **MV1:** diez primeras VT3 admitidas por las huellas D−1/D−7 y bifurcaciones originales.
2. **Frecuencia 30:** diez familias VT3 físicas con mayor proporción suavizada de cabezas publicadas en treinta jornadas anteriores.
3. **Geometría calibrada:** diez familias físicas con puntuaciones suaves aprendidas previamente para la existencia en el ranking MV1, posición en Formas Primero, relación con la última columna disponible y multiplicidad de caminos; SIN contar frecuencia de la familia como predictor.
4. **Combinado (propuesta):** misma frecuencia 30 multiplicada por los factores geométricos suaves y fijados.

El valor de cada familia se inicia con la cantidad de terminaciones que realmente representa: **una para palíndromos (ej. 131/131), dos para otras familias reversibles (123/321)**. La frecuencia se suaviza usando 500 cabezas equivalentes de priori uniforme. La geometría se ajusta con `(observados+20)/(nominales+20)` por categoría de entrenamiento, limitada entre **0,75 y 1,25** y con contribución **a la mitad en logaritmos** para reducir sobreajuste de factores correlacionados. Son **puntuaciones de ordenación**, NO probabilidades calibradas de acertar.

## Corte temporal y prevención de fugas

- **Solo junio–julio:** aprender ajustes geométricos, sin consultar POST del turno que se va a predecir. Entrenamiento: **51 jornadas**, 255 cortes, **34.284 exposiciones** de familias PRE.
- Congelar el modelo al **31 de julio**. El archivo `PESOS_CONGELADOS_JULIO.json` contiene los coeficientes efectivamente aprendidos.
- **Agosto:** 26 jornadas completas, 130 cortes, 650 cabezas (validación temporal).
- **Septiembre–29 octubre:** 42 jornadas completas, 210 cortes, 1.050 cabezas (contraste temporal independiente de la estimación de pesos; se omite el 1–11/10 como en los estudios anteriores).
- **Total evaluado:** **68 jornadas, 340 cortes, 1.700 cabezas**. Todas las columnas de cada corte son las disponibles *antes* del sorteo del mismo turno.
- En cada método, **20 controles neutrales por corte**, con exactamente **el mismo número de familias y el mismo número de orientaciones** (una/dos terminaciones por familia). También se presenta el nominal uniforme.
- No se ofrece más candidatos: diez familias por turno, excepto que MV1 no pudiera proponer diez por falta de raíces. No se alteran jamás resultados o genealogía VT2/VT4 de la app.
- **Cautela de validación:** aunque la selección de pesos sí se hizo con junio–julio y se congeló antes de evaluar agosto–octubre en este código, todas las fechas eran históricas y ya habíamos observado sus resultados en otras investigaciones. Por eso **no equivale a una validación prospectiva, ni a un conjunto de prueba completamente intocado**. Los cuatro grupos de variables fueron inspirados por estudios previos que abarcaron fechas posteriores.

## Resultados

| Selector | Agosto (26 días) | Septiembre–29 octubre (42 días) | Total 68 días | Nominal uniforme total | Media de 20 controles pareados |
|---|---:|---:|---:|---:|---:|
| **Lalo original** | 8 | 17 | **25** | 32,40 | 32,60 |
| **Frecuencia 30 jornadas** | 12 | 25 | **37** | 33,71 | 33,95 |
| **Geometría calibrada** | 14 | 25 | **39** | 34,00 | 34,95 |
| **COMBINADO** | **17** | **28** | **45** | **33,71** | **32,40** |

A igualdad de diez familias, la combinación gana **+20 respecto al Top10 Lalo** y **+8 respecto a la frecuencia pura 30**. Como el combinado y la frecuencia 30 tienen **exactamente la misma cantidad de orientaciones por corte** (6.742 terminaciones acumuladas), la diferencia de ocho coincidencias **no procede de cubrir más números**.

**Contra la selección neutral equivalente:** combinado 45; controles media 32,4, rango **26–44** en estas veinte realizaciones. Es una señal exploratoria, **no un resultado de significación estadística confirmada**: solo 20 controles y varias hipótesis ya vistas retrospectivamente.

### Descomposición por meses

| Mes | MV1 | FREC30 | GEO calibrada | COMBINADO | Media neutral combinado |
|---|---:|---:|---:|---:|---:|
| Agosto | 8 | 12 | **14** | **17** | 12,15 |
| Septiembre | 11 | 14 | **17** | **14** | 13,00 |
| Octubre (12–29) | 6 | 11 | 8 | **14** | 7,25 |

La combinación mejora a Frecuencia 30 en agosto y octubre y la empata en septiembre. **Sin embargo, Geometría pura supera al combinado en septiembre** y sería engañoso afirmar que un único método domina en todas las fechas.

### Incertidumbre agrupada por jornada completa

Remuestreo retrospectivo de **12.000 iteraciones por fecha** (se agrupan los cinco turnos de cada día; no consideramos 340 cortes completamente independientes):

| Comparación | Diferencia total | Intervalo bootstrap orientativo 95 % |
|---|---:|---:|
| Combinado − MV1 | **+20** | +5 a +35 |
| Combinado − Frecuencia 30 | **+8** | **−1 a +18** |
| Combinado − Geometría calibrada | **+6** | −11 a +23 |

La diferencia con la frecuencia pura (nuestra referencia más exigente) **todavía incluye cero**. En septiembre–octubre aislados la mejora sobre frecuencia fue **+3** y su intervalo por fechas **−2 a +9**. Los intervalos **no corrigen** haber investigado previamente otras hipótesis o fechas, ni el efecto de selección al elegir el modelo que luce mejor. No se interpreta como rentabilidad.

### ¿Qué aprendieron los pesos congelados?

Los valores de las características para el entrenamiento junio–julio, con suavizado y topes, fueron cercanos a 1. Ejemplos:
- VT3 del puesto **21+** en el Lalo original: factor **1,089**; Top10 original **0,967**. Evita privilegiar automáticamente el ranking original, pero no descarta sus familias.
- Formas Primero puestos **1–10**: **1,064**; puestos **11–30**: **0,906**; puestos **31–100**: **1,061**. No es un beneficio monótono del ranking visual.
- Figura solo en columna nueva: **1,054**; solo en anteriores: **1,050**; presente en ambas **0,865**.
- Camino único: **1,015**; múltiples caminos: **1,004**. **El número de recorridos apenas contiene información**.

Como son varios efectos condicionados por información del pasado, el modelo final atenúa su producto (raíz cuadrada geométrica) para no amplificar fluctuaciones. No se infiere causalidad.

## Decisión

**Existe una mejora histórica interesante que merece una prueba PRE verdaderamente nueva; NO se ha demostrado una ventaja apostable.** En particular, **no es suficiente el +20 sobre MV1**, cuyo rendimiento estaba por debajo de la referencia uniforme. El mérito adicional es el **+8 sobre frecuencia 30 con igual cobertura exacta**, aunque su incertidumbre todavía admite una diferencia nula.

**Congelar inmediatamente** la fórmula, los cuatro grupos de señales, los pesos de junio–julio, las reglas de diez familias y los controles. No cambiar parámetros para acertar cabezas posteriores. Solo considerar una futura inclusión como motor experimental de comparación después de observar suficientes PRE fechados antes del sorteo y contrastar resultados y costos reales.

## Evidencia técnica

- `src/labLaloBayesGeometriaVT3.ts`: cálculo suavizado de factores geométricos, grupos y dos selectores experimentales.
- `scripts/test-lalo-bayes-geometria-vt3.ts`: tests del cálculo, fuentes y presupuesto, además de pruebas de motores originales.
- `scripts/lab-lalo-bayes-geometria-vt3.ts`: construcción PRE con ventanas históricas y peso congelado, cortes y controles pareados; evaluación POST separada.
- `auditorias/lalo-bayes-geometria/PESOS_CONGELADOS_JULIO.json`: pesos persistentes, luego utilizados en sellos futuros.
- `.github/workflows/lab-lalo-bayes-geometria.yml`: ejecución de **GitHub Actions success**, con resultados completos por turno descargables como artifact.
- [Ver corrida verificada](https://github.com/y0t3/Modelo-Papa/actions/runs/41181331152).
