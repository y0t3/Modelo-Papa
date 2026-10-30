# Investigación: VT2 escondidos dentro del Top10 VT3 de Lalo

Fecha: 30/10/2026.  
Rama aislada: `lab/vt3-deriva-vt2-en-11-30oct`.  
Ensayos aprobados:
- [Octubre, 16 jornadas / 80 cortes PRE](https://github.com/y0t3/Modelo-Papa/actions/runs/41013859221).
- [Junio–septiembre, 103 jornadas / 515 cortes PRE](https://github.com/y0t3/Modelo-Papa/actions/runs/41013859195).

## 1. Hallazgo técnico confirmado antes de leer sorteos

El motor de Lalo **ya agrega al universo VT2 los segmentos físicos de dos celdas consecutivas de cada recorrido del Top10 VT3**, en `src/motorLalo.ts`: después de `derivativeMothers=vt3.slice(0,10)`, pasa las secciones `path.slice(0,2)` y `path.slice(1,3)` por `selectKind(base.vt2,...,'DESDE_VT3')`. Después **ordena todo VT2 con su propio algoritmo**, que privilegia antecedentes propios (raíz directa D−1/D−7), fuentes y bloques físicos. Por eso una VT2 que efectivamente está dentro de la VT3 Top10 **puede quedar en puestos VT2 superiores al #10**; no es que falte la formación, sino que la selección visual del Top10 no la muestra.

Ejemplo de ruta VT3 `5→1→3`: en sentido directo la arista final es `13`; en sentido inverso, `3→1→5`, la arista final es `15`. Ambas son físicamente consecutivas **en la misma columna +11**, sin saltos. Sus familias de lectura directa/inversa son `13/31` y `15/51`, respectivamente. **No** se crea el par `53` saltando la casilla central, ni se añade una cifra a la derecha.

El laboratorio `src/labVt3SufijosVt2.ts` extrae estas **dos aristas** de cada VT3 Top10, deduplica cada ubicación física, retiene madre y puesto VT3, comprueba la presencia y puesto en el ranking completo VT2 de Lalo y coteja las cabezas reales **solo POST**. En todas las jornadas evaluadas, cada familia derivada apareció en el listado VT2 completo del motor: no se inventó un nuevo método ni se modificó Lalo.

## 2. Controles y alcance

Las pruebas reconstruyen cada uno de los cinco turnos **antes de conocer el resultado objetivo**: la hoja +11 solo contiene Nocturna anterior y turnos ya terminados, y las raíces D−1/D−7 provienen de fechas anteriores. Se compararon las cabezas reales de **Ciudad, Provincia, Córdoba, Santa Fé y Entre Ríos**. Montevideo se dejó fuera por calendario especial.

La regla de selección se fijó en octubre y **no se cambió** al reproducir junio–septiembre. Sin embargo, las fechas antiguas podían haber informado el desarrollo original del motor MV1: son controles históricos y **no constituyen pronósticos prospectivos sellados**.

Comparaciones:
1. **Top10 VT2 oficial Lalo**.
2. **Todos los segmentos de VT2 dentro de Top10 VT3**, eliminando las familias VT2 que ya estaban en Top10 oficial. Esto aumenta la cobertura por agregar opciones, no mide mejora de ranking.
3. **Foco K=3 y K=5**: orden determinista PRE por puesto de la madre VT3, número de fuentes y recorridos físicos, y familia solo como desempate; excluir las familias ya visibles en Top10 VT2.
4. **Igual presupuesto**: para cada corte, comparar el foco K contra K familias VT2 que **no** proceden de VT3 Top10 y **no** están en Top10 VT2, siguiendo su ranking general. Control auxiliar: próximas K familias del ranking VT2 completo (puestos 11 en adelante), que pueden solaparse con derivados. No seleccionar ninguna familia según el resultado futuro.

Las coincidencias son de **cabeza × turno × jurisdicción**, cada cabeza se cuenta una vez aunque tenga varios caminos. Las observaciones dentro de la misma jornada y los turnos están correlacionados.

## 3. Resultado general (los cinco turnos)

| Período | Cabezas | Aciertos Top10 VT2 | Aciertos adicionales desde VT3 | Cobertura conjunta | Más familias adicionales promedio por corte |
|---|---:|---:|---:|---:|---:|
| Junio–septiembre (103 jornadas) | **2.575** | **510** | **244** | **754** | **5,7** |
| Octubre 12–29 (16 jornadas) | **400** | **70** | **38** | **108** | **5,2** |

**No confundir cobertura bruta con rendimiento predictivo.** Comparando igual presupuesto K=5 en los cinco turnos, junio–septiembre: **172** aciertos recuperados por las VT2 derivadas frente a **194** del control de familias no derivadas (y **200** de los próximos K VT2 en el ranking completo). Por tanto **NO hay evidencia de mejora general en todos los turnos**.

En octubre K=5: **27** derivados frente a **26** controles. Diferencia mínima.

En octubre, **36 de las 38 cabezas recuperadas** por el grupo extra de VT2 NO coincidían con ninguna familia VT3 completa del Top10, lo que confirma la motivación del usuario: mirando solo las tres cifras, esas coincidencias no aparecen.

## 4. Señal selectiva: Nocturna

| Medida en Nocturna | Junio–septiembre: 103 noches, 515 cabezas | Octubre 12–29: 16 noches, 80 cabezas |
|---|---:|---:|
| Aciertos Top10 VT2 Lalo | **96** | **11** |
| Aciertos adicionales con todas las VT2 derivadas de VT3 Top10 | **72** | **15** |
| Cobertura conjunta Top10 VT2 + derivados | **168** | **26** |
| Familias VT2 extras expuestas | **725** | **100** |
| Media de extras por noche | **7,0** | **6,3** |
| **Aciertos con hasta 5 familias derivadas extra PRE** | **50** | **11** |
| Control de igual tamaño, familias VT2 no derivadas | **33** | **2** |
| Control alternativo: siguientes puestos en ranking VT2 completo | **37** | **2** |

La comparación de Nocturna reproduce una **diferencia a favor del pequeño foco de VT2 contenidos dentro del Top10 VT3**, a diferencia de lo observado en Primera/Matutino. Pero sigue siendo un resultado histórico, seleccionado después de investigar varios enfoques. No se puede asegurar una ventaja futura, ni que sea explotable mediante apuestas, y los controles no eliminan todos los sesgos.

## 5. ¿Es estable? Desglose por mes, Nocturna y máximo 5 extras

| Mes | Noches evaluadas | Derivados foco K=5: aciertos | Control no derivado: aciertos | Aciertos VT2 extras tomando TODOS los derivados |
|---|---:|---:|---:|---:|
| Junio | 25 | **13** | 11 | 17 |
| Julio | 26 | **13** | 7 | 20 |
| Agosto | 26 | **13** | 3 | 19 |
| Septiembre | 26 | 11 | **12** | 16 |
| Octubre 12–29 | 16 | **11** | 2 | 15 |

**Septiembre rompe el patrón favorable**, particularmente interesante para la idea del usuario de episodios cortos en lugar de reglas eternas.

Para observar ventanas cortas disjuntas de aproximadamente 5 noches sorteables (sin contar cinco veces la misma noche):
- En junio–septiembre, **14 ventanas** favorecieron a las derivadas, **4** al control y **3** quedaron empatadas; la última ventana tuvo solo tres noches.
- Octubre: tres ventanas de cinco Nocturnas favorecieron a las derivadas; un corte final de un solo día también, pero NO debe tratarse como semana completa.

Este resumen no permite **predecir cuándo nacerá ni cuándo terminará el supuesto episodio**. Las diferencias semanales pueden deberse también a azar, tamaño bajo de muestra y coincidencia múltiple de familias.

## 6. Ejemplos físicos de aciertos VT2 fuera de Top10

Ejemplos de la prueba de octubre:
- **22/10, Nocturna, Ciudad 9760**: familia VT2 `06/60`, **puesto VT2 #17**, aparece como tramo de VT3 madre #9; la VT3 completa NO coincidió.
- **23/10, Nocturna, Ciudad 1280**: familia VT2 `08/80`, **puesto VT2 #19**, aparece en VT3 madres #5 y #6; la VT3 completa NO coincidió.
- **27/10, Nocturna, Entre Ríos 3877**: familia VT2 `77/77`, **puesto VT2 #32**, aparece en VT3 madres #2 y #4.
- **28/10, Nocturna, Provincia 3946**: familia VT2 `46/64`, **puesto VT2 #20**, derivada de madres VT3 #3, #5, #7 y #9.
- **29/10, Nocturna, Córdoba 6906**: familia VT2 `06/60`, **puesto VT2 #14**, contenida en madres VT3 #3 y #6.

Estos ejemplos fueron seleccionados después del cotejo POST para explicar la prueba, **no** se publicaron como predicciones antes de los sorteos. Cada uno existe como par de casillas contiguas en la +11. Las rutas físicas completas se pueden reconstruir con `src/labVt3SufijosVt2.ts`.

## 7. Propuesta de mejora de observación (NO implementada aún en la app)

Sin tocar rankings VT2/VT3, minihojas existentes ni el método del padre, **agregar una bandeja experimental bajo Top10 VT3 de Nocturna**:

**«VT2 que viven dentro de estos VT3»**. Por cada familia VT2:
- mostrar lectura (ej. `06/60`), madres VT3 que le dan origen, rangos # de VT3 y puesto en listado VT2 completo;
- acceso al camino físico exacto de **dos casillas contiguas** en la misma columna +11;
- separar **«ya está en Top10 VT2»** de **«fuera del Top10 VT2»**;
- vista rápida **máximo cinco derivadas extra** ordenadas exclusivamente PRE; opción «Ver todas» para no perder candidatos;
- cotejo POST por jurisdicción y cabeza real: verde únicamente después de salir, sin promoción retrospectiva;
- investigar por qué varios VT2 aparecen asociados a varias madres VT3 y si existe selección geométrica distinta a la mera abundancia de parejas.

**Importante:** aunque hay señal específica para Nocturna, el presupuesto de cinco es un compromiso exploratorio; no es un nuevo motor de apuestas ni una recomendación de inversión económica. Idealmente validar primero con nuevos sorteos archivando alertas PRE antes de conocer sus resultados.

## 8. Código y resultados reproducibles

- `src/labVt3SufijosVt2.ts`: extracción PRE de segmentos VT2 físicos, madre/puestos y comparadores POST con controles.
- `scripts/test-vt3-sufijos-vt2.ts`: dos bordes de 513, reversibilidad válida, rechazo de saltos y cotejo de resultados.
- `scripts/lab-vt3-esconde-vt2.ts`: historia por turno, ranking Lalo original intacto, desglose mensual y ventanas cortas disjuntas.
- Workflows validados [octubre](https://github.com/y0t3/Modelo-Papa/actions/runs/41013859221) y [junio–septiembre](https://github.com/y0t3/Modelo-Papa/actions/runs/41013859195). Artefactos `vt3-sufijos-vt2-lalo-octubre` y `vt3-sufijos-vt2-lalo-junio-septiembre`.
- No se modificó ningún motor oficial, top10 en la app ni APK. Todas las modificaciones están en rama de laboratorio.
