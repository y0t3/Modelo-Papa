# Auditoría física: dos diagonales y sesgo de prioridad F_D1

**Fecha: 16/10/2026. Estudio retrospectivo, sin alterar la APK Modelo Lalo 0.3.5, el motor oficial ni `src/vt3Shadow.ts`.**

## Pregunta y controles
¿Por qué los caminos de **dos pasos diagonales** (tres casillas contiguas) no aparecen como recorrido representante en el Top3 de Geometría completa, aun cuando físicamente existen y pueden representar cabezas sorteadas?

- **53 jornadas, 265 cortes PRE, 1325 cabezas** (cinco jurisdicciones argentinas; Montevideo como fuente cuando aplica).
- **Baseline obligatorio:** el auditor volvió a reproducir íntegramente el orden Top10 y las casillas de sus testigos desde el motor `buildVt3Shadow` en los 265 cortes, además de 11 aciertos Top3 geométricos y 6 oficiales en el histórico.
- Solo se evalúan cifras de la hoja disponibles **antes** de cada turno; resultados ganadores posteriores se usan exclusivamente para puntuar.
- La orientación reversible no añade una familia; la figura no cruza fuentes ni salta celdas.
- El diseño de la prueba es **posterior** al conocimiento de todas estas jornadas: las comparaciones son diagnóstico, NO validación ciega ni capacidad predictiva demostrada.

## Hallazgo 1: la familia no está necesariamente excluida
- **5448 recorridos físicos** de dos diagonales presentes en las 265 hojas PRE, **5333 apariciones de familias distintas por corte** (no son 5333 familias únicas de todo el período).
- **57 exposiciones de cabeza ganadora** (familia + corte) disponían de al menos un recorrido de dos diagonales.
- De ellas, **24** tenían como *representante mejor puntuado* de su familia un recorrido de dos diagonales.
- Ningún **recorrido representante** de dos diagonales ocupó Top3 del ranking original en 265 cortes.
- PERO **74 de las 795 posiciones Top3** pertenecían a familias que SÍ tenían además otro recorrido físico de dos diagonales. Entre las exposiciones ganadoras Top3, **dos** tenían ese camino alternativo.
- La ausencia es del **testigo elegido**, no de la posibilidad de que una familia que admite dos diagonales aparezca arriba. La app debe mostrar TODOS sus caminos válidos, no sólo el camino usado para clasificar.

## Hallazgo 2: comparación emparejada por la misma fuente y ubicación
Para cada fuente y punto mínimo (fila y columna del rectángulo del recorrido) se comparó el **mejor** recorrido de dos diagonales con el **mejor** recorrido de otra forma, usando los siete criterios reales de Geometría y no los resultados ganadores.

Se obtuvieron **2724 grupos de comparación**. En los 2724 la doble diagonal obtuvo un puntaje inferior a la forma competidora, incluso antes de aplicar el desempate por fuente/posición.

| Primer componente del puntaje que determinó la inferioridad | Casos |
|---|---:|
| Distancia máxima de la figura a formas de ayer | **2268** |
| Indicador de traslado vertical amplio (≥2 filas) respecto de ayer | **456** |
| **TOTAL** | **2724** |

Es una **desventaja sistemática en la jerarquía**, NO una regla explícita que descarte rutas de dos diagonales. La geometría de estas formas en una grilla de seis filas por dos columnas y la búsqueda de **todas las figuras posibles** en referencias D−1 influyen en esa diferencia.

- En **1190/2724** grupos el mejor camino de dos diagonales encontraba al menos una huella histórica ganadora con *misma fuente y forma*, frente a 1877 para el rival.
- En **328** grupos la doble diagonal tenía más de esos **eventos históricos vinculados por forma/fuente** que la otra figura, pero igualmente perdió en puntaje porque la distancia de ayer se examina primero. **No se debe llamar a esos 328 antecedentes propios de la misma familia numérica:** la unión es por forma y fuente, no por cifras.
- La comparación empareja **fuente y la posición mínima (fila y columna)**; no afirma identidad de todas las casillas ni igualdad de exposición numérica.
- Estos 2724 grupos se repiten a lo largo de las jornadas y no son ensayos independientes.

## Hallazgo 3: contrafactual diagnóstico forzando solo la tercera familia
Se mantuvieron las primeras dos familias originales y se sustituyó la tercera por la familia físicamente válida cuyo **mejor recorrido de doble diagonal** tuviera prioridad más alta, sin repetir familia ni mirar el resultado del turno. Es un experimento de estrés, **NO un cambio recomendado**.

| Tramo | Top3 original | Con doble diagonal forzada | Diferencia |
|---|---:|---:|---:|
| 15/08–14/09 (130 cortes) | **1** | **3** | +2 |
| 15/09–15/10 (135 cortes) | **10** | **8** | −2 |
| **Total (265 cortes)** | **11** | **11** | **0** |

El nuevo tercer puesto cambió en **255/265 cortes**. Se ganaron **3 aciertos de cabeza por corte** y se perdieron **3**. Casos:
- Ganados: 17/08 Primera `536/635`; 07/09 Matutino `021/120`; 25/09 Nocturno `429/924`.
- Perdidos: 15/09 Matutino `779/977`; 21/09 Nocturno `173/371`; 01/10 Matutino `598/895`.
- Mantener la fuente física del tercer puesto produjo el **mismo balance** en esta muestra.

La mejora de dos aciertos en agosto **se invierte** en septiembre–octubre. **No hay fundamento para premiar automáticamente las dobles diagonales.**

## Interpretación
1. Lo que parecía una exclusión total es principalmente un **sesgo de representación de recorrido** y una **preferencia estructural de las distancias**.
2. No se puede inferir que la forma doble diagonal sea predictiva o antiproductiva solo por este retrospectivo.
3. Quitar / limitar las referencias D−1 ya se había probado en la rama anterior: cambió solo 10/265 Tops y retuvo 11 aciertos, sin llevar un recorrido doble diagonal al Top3. Los criterios redundantes mantienen gran parte de la misma jerarquía.
4. Se debe distinguir **familia**, **todas sus rutas posibles** y **el testigo utilizado para ordenar**; el último NO refleja necesariamente todo su respaldo. Esto es clave en la experiencia de la hoja visual.
5. El siguiente control sensato no consiste en seleccionar una figura por decreto, sino en contrastar **ordenaciones normalizadas por fuente y posición**, y verificar con raíces comprobadas si las huellas aportan algo más allá de la topología genérica. Debería elegirse regla antes de validar sobre un período no reutilizado.

## Evidencia reproducible
- Ejecución completada: https://github.com/y0t3/Modelo-Papa/actions/runs/38856244243
- Script experimental: `scripts/lab-geo-shape-audit.ts` dentro de `lab/geo-doble-diagonal-matched-16oct2026`.
- Script orquestador: `scripts/lab-geo-roots-265.ts`, sigue evaluando 265 PRE, con chequeo de baseline.
- Artefacto `HUELLAS-GANADORAS-265-CORTES` contiene `GEOMETRIA_FORMAS_POSICION_265_CORTES.json`, detalle por corte de todos los grupos de fuente/posición y el reemplazo controlado, junto a los informes previos.

**Decisión:** continuar estudiando la normalización geométrica en laboratorio, sin cambios de app, sin optimizar retrospectivamente para rescatar casos conocidos y sin atribuir probabilidades de acierto a loterías.
