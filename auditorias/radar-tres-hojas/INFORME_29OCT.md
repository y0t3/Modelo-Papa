# Laboratorio: tres hojas en paralelo, figuras VT2 y VT3

**Fecha del estudio:** 29/10/2026  
**Rama:** `lab/comparativa-tres-hojas-vt2-vt3-29oct`  
**Validación completa:** [GitHub Actions #40990754556](https://github.com/y0t3/Modelo-Papa/actions/runs/40990754556) (pruebas de independencia física, testigos y pulsos, regresión MV1 y ejecución octubre).  
**Estado:** laboratorio histórico PRE reconstruido; **no se ha modificado la app, APK, las reglas del padre, el Top oficial ni los motores de producción**.

## Objetivo

Rastrear **figuras físicas**, no familias, durante ventanas de 5–6 jornadas y contrastar los tres tableros por separado: Hoja +11, Auxiliar Ayer y Auxiliar Hoy. VT2 y VT3 tienen igual importancia científica; su **densidad de recorridos** es diferente, de modo que requieren controles adaptados a la abundancia de cada longitud.

* Hoja +11: una figura no puede cruzar su propia columna, ni saltar casillas. Se utilizan las rutas seleccionadas por Top10 Lalo, Geometría VT2, Figuras Conectadas VT2 y Formas Primero VT2/VT3, **deduplicando las casillas** si dos motores señalan el mismo recorrido.
* Auxiliar Ayer: datos RAW de Santiago y Neuquén de la última jornada sorteable anterior. Grilla de 2 filas × 12 columnas; **puede cruzar los límites de las franjas de cuatro cifras**.
* Auxiliar Hoy: datos RAW de Santiago y Neuquén de HOY, **solamente los publicados antes del turno objetivo**. Previa sin casillas auxiliares; Primera con Previa, Matutino con Previa+Primera, Vespertino/Nocturno con tres franjas.
* Los Tops se reconstruyen en cada corte **antes** del sorteo correspondiente. Resultados reales solo se consultan POST para comparar los caminos seleccionados y cabezas que efectivamente salieron.

## Primera muestra: 15 jornadas (12–28/10/2026), 75 cortes

Cinco jurisdicciones homogéneas por sorteo: Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos. **Montevideo se examina fuera de esta muestra** por calendario diferente. No se publican apuestas ni presuntos pronósticos sellados.

### Cobertura de cabezas de Nocturna en Top10, por hoja

| Lectura | +11 reunida | Auxiliar Ayer | Auxiliar Hoy | Cabezas en una sola hoja | En dos hojas | En tres | En ninguna |
|---|---:|---:|---:|---:|---:|---:|---:|
| VT2 | 28 | 13 | 10 | 36 | 6 | 1 | 32 |
| VT3 | 2 | 0 | 1 | 3 | 0 | 0 | 72 |

Denominador: **75 cabezas** (5 por noche × 15 Nocturnas). Las columnas de cobertura de cada hoja NO se suman, porque pueden corresponder a una misma cabeza. La cobertura del +11 combina varios **Top10 experimentales y el oficial**, por lo que tiene muchos más candidatos expuestos. No debe compararse su porcentaje como si todos los tableros tuvieran idéntico presupuesto de figuras. **Esto no mide una probabilidad predictiva validada.**

Es relevante que VT2 aporte resultados exclusivos y compartidos, y VT3 tenga resultados escasos en Top10 sin que eso autorice relegarlo. La Nocturna del **29/10** y el **2813 de Santa Fe** relatados por el usuario quedan **fuera de esta reconstrucción** y deberán estudiarse con sus cortes PRE; no se suman retroactivamente.

### Las figuras activas no nacen al mismo ritmo

Nocturnas con al menos tres jornadas anteriores disponibles para comparar una **misma ruta/top**. Para la misma fuente, fila, columna y longitud, se mide si la huella ya apareció en al menos **dos de las seis noches previas**, **independientemente del número que contenga**. La corriente se cuenta como tercer día en una secuencia potencial.

| Hoja | VT2: figuras con 2+ noches anteriores / total | VT3: figuras con 2+ noches anteriores / total |
|---|---:|---:|
| +11 | **557 / 682 · 81,7 %** | **119 / 463 · 25,7 %** |
| Auxiliar Ayer | **305 / 358 · 85,2 %** | **65 / 334 · 19,5 %** |
| Auxiliar Hoy | **313 / 366 · 85,5 %** | **32 / 286 · 11,2 %** |

Son **sitios físicos seleccionados**, no familias únicas, no cabezas ganadoras y no probabilidades de acierto. El conteo representa posiciones-sorteo, no una figura única durante todo el período.

**Conclusión metodológica:** VT2 repite muchísimo; la repetición simple no sirve como alarma. VT3 exhibe más posiciones nuevas, pero sus aciertos exactos de cabeza son mucho más raros. Hay que mirar **novedades y antecedentes auténticos**, midiendo exposición para las dos longitudes por igual.

### Antecedentes ganadores reales, no cantidad bruta de rutas

Se enlazó cada sitio seleccionado con cabezas que históricamente **sí pudieron formarse por el mismo recorrido físico en su propio tablero**. Se deduplica cada testigo por cabeza/fecha/turno/jurisdicción. Se utilizan D−1 y D−7 más resultados de turnos anteriores del mismo día; estas raíces nunca leen el objetivo Nocturno.

En todos los 75 cortes, número de **observaciones de sitios seleccionados** con testigos anteriores de igual sitio:

| Hoja | VT2 | VT3 |
|---|---:|---:|
| +11 | **2.016 / 3.385** sitios | **406 / 2.771** |
| Auxiliar Ayer | **1.515 / 2.250** | **317 / 2.060** |
| Auxiliar Hoy | **695 / 1.455** | **152 / 1.175** |

Con eventos ganadores del **mismo sitio en dos jornadas distintas**, los conteos bajan a:
- VT2: +11 **556**; Auxiliar Ayer **513**; Auxiliar Hoy **171**.
- VT3: +11 **19**; Auxiliar Ayer **5**; Auxiliar Hoy **13**.

La raíz VT2 está muy extendida: un testigo por sí solo no es señal de excepción. VT3 es mucho más selectiva pero poco frecuente. Todos los números arriba son observaciones de posiciones por corte, no eventos independientes, por lo cual **no pueden traducirse directamente en tasas de éxito o ventajas probabilísticas**.

### Evolución intrajornada que debemos preservar en la interfaz

1. **Auxiliar Ayer:** al ser fija durante el día, el mismo ranking y sus huellas se mantienen en todos los turnos. La repetición intrajornada es **mecánica**, no una señal adicional.
2. **Auxiliar Hoy:** incorpora nuevas columnas conforme se conocen las cabezas RAW; hay nacimientos de posiciones físicas, especialmente en Primera/Matutino/Vespertino.
3. **Hoja +11:** también aumenta las columnas disponibles; merece seguimiento de las **figuras que entran a Tops** y de las que salen, no de rutas que siguen siendo físicamente formables por el carácter acumulativo de la hoja.

La identidad física entre jornadas se define por `board + fuente + longitud + casillas`; NO por valor ni familia. Recorrido inverso es el mismo sitio, sin rotar ni reflejar geometrías. Se guardan además turnos y puestos por motor de modo explicativo; tres motores que comparten una ruta de la +11 no generan tres evidencias físicas independientes.

## El 13/31 y las extensiones 513/813 del 29/10

Caso reportado por los observadores, **no incorporado como acierto reconstruido**:
- +11: Lalo VT2 #7 y Geometría VT2 #1 señalaron familia 13/31;
- Auxiliar Ayer VT2 #4 también la incluyó;
- Formas Primero VT3 #5 tenía 513/315; se atendió antes del sorteo por presencia de 5 en los tableros;
- según los observadores, las dos auxiliares permitían formar 813, que coincidió con la terminación de Santa Fe 2813;
- falta auditar los caminos exactos, horarios y captura PRE de cada tablero.

**Lección:** reconocer la extensión como relación de lecturas existentes en cada hoja y mostrar **todas** sus rutas posibles, sin inventar una VT3 combinando casillas de hojas diferentes ni promover retroactivamente la extensión ganadora frente a la alternativa fallida.

## Siguiente hipótesis de seguimiento corto

**No premiar número repetido.** Señalar exclusivamente **cambios observables en figuras PRE**:

- Una huella que recién entra en Top10 tras tres jornadas sin haber estado seleccionada, con testigo ganador válido histórico;
- Un recorrido VT2 destacado en +11 que también está representado en las auxiliares y dispone de extensiones VT3 físicamente válidas (sin exigencia de que VT3 esté a su vez en Top10);
- Una figura con **dos testigos históricos de distintas jornadas** y transición visible de lugar que no sea estructuralmente inevitable;
- Un episodio que desaparece o reaparece en ventana de 5–6 jornadas, conservando también los fallos.

**Control obligatorio:** contrastar cada alerta con rutas físicas seleccionadas de igual longitud/hoja/exposición que no tengan ese cambio. Medir por día la fracción de cabezas reales que explican, las alarmas falsas y la tendencia a generar demasiadas alertas. Con 15 días no hay evidencia de un patrón repetible de pronóstico. No modificar órdenes oficiales ni presentar una ventaja no demostrada.

## Archivos y reproducibilidad

- `src/labTresHojasFiguras.ts`: clasificación de familias compartidas y figuras exclusivas, lectura POST por tablero, extensión VT2–VT3 solo con trazos físicos propios.
- `src/labTresHojasTestigos.ts`: asociación de cabezas realmente ganadoras del pasado con sus rutas, por hoja y evento independiente.
- `src/labPulsosTresHojas.ts`: seguimiento de misma posición/silueta física en ventana de seis jornadas, independientemente de lectura numérica.
- `scripts/lab-tres-hojas-figuras.ts`: 75 cortes PRE de octubre y clasificación posterior de resultados.
- `scripts/test-tres-hojas-figuras.ts`, `scripts/test-tres-hojas-testigos.ts`, `scripts/test-pulsos-tres-hojas.ts`: tests de independencia por hoja, corrección de recorridos y vigilancia corta.
- `.github/workflows/lab-comparativa-tres-hojas-vt2-vt3.yml`: ejecución validada [#40990754556](https://github.com/y0t3/Modelo-Papa/actions/runs/40990754556), artefacto `comparativa-tres-hojas-octubre`.

**Importante:** sigue siendo laboratorio. No se agregó todavía ninguna pantalla «Radar de figuras» a la app ni se ejecutan controles automáticos en segundo plano. Primero hay que demostrar selectividad frente al ruido, no solo que las hojas encuentran coincidencias.
