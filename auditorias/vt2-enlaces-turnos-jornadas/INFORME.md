# VT2 Lalo · vínculos entre turnos y jornadas contiguas

**Auditoría exploratoria 29/10/2026.** Reproducción fiel de Lalo VT2: **127 jornadas, 635 cortes PRE reconstruidos, 3.401 cabezas**; Top3/Top5/Top10 original **220/351/674**. Mismos diez candidatos y misma familia reversible. Se eligen como máximo **dos familias** en cada política de comparación. No son PRE sellados antes del sorteo.

## Turno inmediatamente anterior (misma jornada)

Antes de calcular la selección se toman únicamente las familias VT2 que **acertaron dentro del Top10 de ese turno anterior**, y se las destaca si aparecen nuevamente en el Top10 PRE del objetivo. Se completa hasta dos familias con el orden original de Lalo.

| Turno objetivo | Turno anterior | Top2 Lalo | Priorizar familias ganadoras del turno anterior | Cambio |
|---|---|---:|---:|---:|
| Primera | Previa | 20 | **26** | +6 |
| Matutino | Primera | **33** | 29 | −4 |
| Vespertino | Matutino | **30** | 25 | −5 |
| Nocturno | Vespertino | 27 | **34** | +7 |

**Comparaciones exactas emparejadas:** Primera p≈0,109; Nocturno p≈0,189. No son concluyentes. Para Nocturno, si se utilizan las familias ganadoras de **cualquier turno anterior del día**, Top2 pasa de **27 a 41** (p≈0,0385 sin corrección de pruebas múltiples), estudio ya realizado.

### Por período (Top2→dos familias del turno previo)

| Período | Primera | Matutino | Vespertino | Nocturno |
|---|---|---|---|---|
| Junio–julio | 10→11 | 9→10 | 8→7 | 7→8 |
| Agosto–septiembre | 8→12 | 14→10 | 15→11 | 15→18 |
| Octubre 1–24 | 2→2 | 10→9 | 7→7 | 4→7 |
| Octubre 26–28 | 0→1 | 0→0 | 0→0 | 1→1 |

La señal **Previa→Primera** es de interés visual, pero no constante. La conexión **Vespertino→Nocturno** es otra candidata, aunque más débil que considerar todos los turnos anteriores.

## De una jornada a la siguiente

Se excluyeron los **6 empalmes** donde alguna Nocturna de la base +11 para Previa no procedía de la jornada anterior incluida en el archivo reducido. En **121 empalmes homogéneos**, prioridad de familias que ganaron en el **mismo turno anterior** frente al Top2 normal:

| Turno | Top2 | Copiar familias ganadoras de la jornada anterior |
|---|---:|---:|
| Previa | **34** | 32 |
| Primera | **19** | 18 |
| Matutino | 32 | 32 |
| Vespertino | **29** | 25 |
| Nocturno | 26 | 26 |

La conexión **Nocturno anterior→Previa siguiente** dio **34→32**; solo **1** cabeza de Previa con familia en su Top10 coincidió con una familia ganadora de la última Nocturna en esos 121 empalmes. No hay respaldo para copiar mecánicamente familias que ganaron el día previo.

**Importante:** el archivo de 127 jornadas omite algunas jornadas parcialmente sorteadas, incluidas fechas con resultados válidos solo en Montevideo. El filtro de empalmes no reemplaza una auditoría íntegra de todos los sorteos parciales.

## Memoria de posiciones de 5/6 jornadas

Un puesto (#7) no es la misma familia en dos turnos. Por eso se ensayó por separado la **memoria de puesto**, eligiendo siempre dos puestos:

- **Previa**, priorizando los puestos que acertaron en la Previa anterior: **34→35**. Muy débil.
- **Nocturno**, puestos que acertaron en la Nocturna anterior: **27→31**. Pequeña y no confirmada.
- **Nocturno**, dos puestos más frecuentemente acertados en las **5 Nocturnas anteriores**: **26→21** entre 122 noches con historia completa. No favorece «puestos calientes».
- **Matutino**, dos puestos **menos** acertados en las últimas **5 Matutinas**: **32→38** entre 122 jornadas elegibles (p≈0,392 en comparación pareada, sin ajuste; no concluyente). Descriptivamente se concentró en junio–septiembre y se debilitó en octubre.

## Prueba de detección de fases mediante ventana móvil

Una regla cronológica eligió entre **Top2** y **familias ganadoras del turno anterior** según cuál funcionó mejor en las últimas 5 o 6 jornadas del mismo turno (empate: Top2). Se comparó con ambos métodos fijos sobre las **mismas fechas elegibles**:

| Turno | 5 jornadas: dinámico / Top2 / familia fija | 6 jornadas: dinámico / Top2 / familia fija |
|---|---|---|
| Primera | **20 / 20 / 25** | **19 / 20 / 25** |
| Matutino | **28 / 32 / 27** | **27 / 31 / 27** |
| Vespertino | **30 / 30 / 25** | **27 / 28 / 25** |
| Nocturno | **30 / 26 / 33** | **29 / 26 / 33** |

El selector móvil **no detectó a tiempo** la ventaja aparente de Primera; en Nocturno ayuda algo respecto de Top2, pero menos que la priorización fija. La ventana corta **sirve para observar**, no para asegurar que continuará una racha.

## Interpretación y decisiones

Las relaciones de interés para la lectura visual son **Previa→Primera**, **Vespertino→Nocturno** y la repetición acumulada de familias durante la jornada hacia Nocturna. No encontramos un traslado simple útil de familias ganadoras de una fecha a la siguiente. El fenómeno de **puestos fríos Matutino en 5 jornadas** es una hipótesis secundaria y podría ser producto de múltiples comparaciones.

**Se mantienen Lalo MV1 y APK sin cambios** y Montevideo excluido como raíz histórica, pero presente en hoja/resultados. Pendiente actualización de interfaz acordada: Top10 permanente, etiquetas de coincidencias familiares VT2, eliminar «Nueva Prueba» visible preservando registros históricos. Ninguna de estas reglas debe eliminar candidatos ni activar recomendaciones automáticamente.

### Fuentes y reproducibilidad

Datos primarios del archivo [VT2 635 cortes](https://github.com/y0t3/Modelo-Papa/actions/runs/40823125962). La investigación completa y sus scripts Python se entregan como ZIP descargable en la conversación de ChatGPT, junto a los JSON de todas las comparaciones. Es un **análisis de resultados retrospectivos**, no una comprobación de ventaja real frente al azar.
