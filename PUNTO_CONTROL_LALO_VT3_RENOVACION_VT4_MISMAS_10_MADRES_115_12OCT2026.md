# Modelo Lalo · Respaldo heredado vs. apoyo nuevo VT3 → VT4

**12/10/2026. Auditoría independiente de 115 cortes y 23 jornadas, sin tocar el motor activo ni la APK.** Continuación del estudio de persistencia `565/565`. Los experimentos son retrospectivos y se construyen a partir de los mismos insumos PRE del motor; sus resultados no prueban una ventaja prospectiva.

## Estados VT3 observados en los 115 cortes

| Estado / exposición familia×corte | Exposiciones | Familias ganadoras VT3 recuperadas en bolsa | Esperanza de ganadoras condicionada a su peso dentro de la bolsa PRE por corte |
|---|---:|---:|---:|
| Inicio del día (sin turno anterior) | 690 | 9 | 9,00 |
| Misma familia, idéntico respaldo entre turnos | 4.563 | 45 | 45,12 |
| Nueva familia al abrir otra columna del mismo día | 1.042 | 10 | 8,85 |
| Familia previa que agregó otra fuente física | 94 | 0 | 1,03 |

Los cuatro estados son **observacionales, no predictivos**. Nueva en el turno ≠ nueva raíz histórica. No hubo casos de crecimiento del mismo conjunto de fuentes sin ingreso de fuente nueva: las columnas antiguas no cambian durante el día. No sumar las exposiciones como aciertos independientes. En 92 transiciones, 77 registraron al menos una madre nueva; 15 no.

## Prueba de desempate/renovación sin aumentar presupuesto

Un selector experimental PRE mantiene los primeros N−1 puestos del ranking original y reserva el último puesto para la mejor madre recién aparecida fuera del TopN, si la hubiera. No modifica la bolsa ni inventa caminos; se ejecutó sin resultados.

| Método | VT3 Top3/115 | Top5/115 | Top10/115 |
|---|---:|---:|---:|
| Ranking oficial congelado | 5 | 8 | 15 |
| Un puesto a familia nueva del mismo turno | **8** | 8 | 15 |
| Un puesto a madre que suma fuente | 5 | 8 | 15 |
| Dos puestos a apoyo nuevo | 7 | 7 | 15 |

Los **tres rescates Top3** corresponden sólo a Matutina del **03/10** (`238/832`), **05/10** (`729/927`) y **08/10** (`071/170`); no hubo rescates Top10. Intervalo exploratorio de remuestreo por 23 jornadas de la mejora Top3: **[0,6]**, incluye 0; fechas ya usadas extensamente en investigación. No promover esta regla al motor.

## Puerta de madres a hijas VT4: presupuesto idéntico de 10 madres

Reconstrucción física con testigos VT4 exactos de cuatro celdas; referencias históricas reales, una sola fuente y vecindad, sin préstamos entre hermanas. Reproducción exacta de bolsa **y** Top10 VT4 oficial en los 115 cortes antes del experimento.

| Regla de diez madres VT3 | Familias VT4/corte promedio | Cortes con alguna hija ganadora físicamente disponible | Top10 VT4 |
|---|---:|---:|---:|
| Diez madres actuales | 66,69 | 7/115 | 0/115 |
| Sustituir una madre por una recién aparecida | 66,06 | 7/115 | 0/115 |
| Sustituir una madre por una que suma otra fuente | 67,32 | 7/115 | 0/115 |
| Reservar dos puestos para apoyo nuevo | 65,97 | 7/115 | 0/115 |

**Conclusión:** la mera novedad de una madre no mejora la puerta VT4 con presupuesto igual. La estabilidad de `565/565` tiene explicación física (permanece en la fuente antigua) y de ranking (ramas primero), pero desbancarla arbitrariamente aún no aporta ventaja comprobada.

## Auditoría y conservación

Laboratorio exportado en conversación: `modelo-lalo-vt3-respaldo-heredado-nuevo-hijas-vt4-115-12oct2026.zip`, 27 archivos, **1.341.185 bytes**, SHA256 `4c9e81c082faf0d2522fe6a012ec19ca825b50ecca002314318107bbc91f8ae3`. Contiene entradas PRE congeladas, resultados POST aparte, reconstrucción independiente, scripts de análisis, `RENOVACION_PRE_115.json`, `PUERTA_VT4_PRE_115.json`, salidas POST, CSV, visores PRE/POST y manifiesto SHA256.

Se reprodujo en carpeta aislada sin objetivos POST: **3 salidas PRE y 2 POST idénticas byte a byte por SHA256** al original, sin fugas. Visores probados en Chromium (selección fecha/turno y estado, PRE sin objetivos).

**Próximo criterio:** registrar visiblemente «igual respaldo», «nueva familia» y «suma otra fuente» junto a sus recorridos sin puntuarlos todavía; medir primero con nuevas fechas genuinamente prospectivas. La APK y el motor no se modifican.
