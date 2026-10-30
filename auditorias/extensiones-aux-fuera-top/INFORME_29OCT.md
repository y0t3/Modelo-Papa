# Investigación: extensiones VT3 fuera de Top10 desde madres VT2 destacadas

**Modelo Lalo — estudio de tres hojas (29/10/2026)**  
**Rama de laboratorio:** `lab/extensiones-vt2-vt3-aux-fuera-top-29oct`  
**Última ejecución:** [GitHub Actions #40994627220](https://github.com/y0t3/Modelo-Papa/actions/runs/40994627220) — pruebas unitarias, regresiones MV1, 16 jornadas / 80 cortes PRE reconstruidos, cero exclusiones.  
**Estado:** SOLO INVESTIGACIÓN; no modifica ranking oficial, ni AUX, ni APK; no deja tareas en segundo plano.

## Pregunta

Cuando una madre VT2 está en un Top10 de la +11, ¿qué encontramos si buscamos **todas las extensiones físicas VT3** dentro de Auxiliar Ayer y Auxiliar Hoy, aunque esas VT3 NO estén en sus Top10?

Cada orientación de una madre (ej. 13/31) admite diez cifras agregadas por la **izquierda**: 013, 113, ... 913; 031, 131, ... 931. Son **hasta 20 lecturas exactas** (10 si ambas orientaciones coinciden). Esto es lectura VT3; VT4 conserva sus propias reglas.

**La validez geométrica se comprueba dentro de cada tablero por separado:** continuidad de celdas adyacentes horizontal, vertical o diagonal, sin saltar ni repetir, permitiendo atravesar franjas *solo* en las auxiliares de Santiago/Neuquén (2 × 12). Nunca se une una ruta de una hoja con otra para construir un número.

## Diseño y temporalidad

1. Cada jornada se reconstruye cinco veces ANTES del sorteo objetivo. La +11 incluye únicamente columnas y cabezas anteriores al corte. Auxiliar Ayer utiliza la última jornada sorteable anterior; Auxiliar Hoy únicamente Previa/Primera/Matutino ya disponibles.
2. Dos cohortes **no intercambiables** de madres VT2:
   - **Lalo estricto:** solo familias presentes en Top10 VT2 del motor oficial +11.
   - **+11 combinada:** unión única de familias VT2 Top10 de Lalo, Geometría, Figuras Conectadas y Formas Primero. Múltiples motores de +11 no son tableros independientes.
3. En cada cohorte y madre se enumeran las hasta 20 posibles VT3. Se clasifican `AMBAS`, `SOLO_AYER`, `SOLO_HOY`, `NINGUNA`. `AMBAS` exige que **el mismo valor exacto de tres cifras** tenga un recorrido completo válido en cada hoja; no basta con compartir una familia reversible.
4. Se registra el número de caminos físicos, las primeras rutas reales con coordenadas, los testimonios de cabezas verdaderamente ganadoras en el mismo sitio y si la VT3 apareció en los Top10 auxiliares.
5. Solo DESPUÉS se coteja la terminación VT3 de las cinco cabezas reales de Ciudad, Provincia, Córdoba, Santa Fe y Entre Ríos. Montevideo permanece fuera del ensayo uniforme por calendario especial.

**Muestra:** 16 jornadas del 12 al 29/10/2026, **80 cortes PRE** (5 turnos por jornada). La jornada 29 se agregó sin modificar clasificación ni desempates después de la primera ejecución histórica (12–28). Sigue siendo **reconstrucción retrospectiva**, no experimento sellado prospectivo. No se cuentan caminos múltiples como cabezas ganadoras múltiples.

## Resultado: cohortes completas 12–29/10

| Métrica | Madres Lalo Top10 | Madres de todos los Top10 +11 |
|---|---:|---:|
| Madre/corte examinadas | 799 | 1.768 |
| Cabezas cuyo VT2 pertenecía a alguna madre examinada | 70 | 147 |
| Opciones VT3 físicamente en **ambas** auxiliares | 550 | 1.540 |
| Opciones VT3 solo en Ayer | 3.382 | 6.979 |
| Opciones VT3 solo en Hoy | 1.505 | 3.659 |
| Opciones VT3 no formables en las auxiliares | 10.053 | 21.432 |
| VT3 ganadoras en ambas | **1** | **6** |
| VT3 ganadoras solo Ayer | 19 | 31 |
| VT3 ganadoras solo Hoy | 3 | 7 |
| VT3 ganadoras en ninguna | 47 | 103 |
| Aciertos compartidos **fuera de los Top10 VT3 auxiliares** | **1** | **6** |

Las oportunidades no son homogéneas entre grupos; hay miles de extensiones posibles que no resultaron ganadoras. La totalidad de las seis coincidencias compartidas quedó **fuera de ambos Top10 auxiliares**: el examen de *recorridos físicos completos* aporta una cobertura que los Tops no reflejan.

### ¿Hay ventaja predictiva en que ambas hojas formen la misma VT3?

Referencia condicional muy sencilla: dada una cabeza real cuyo VT2 está entre las madres examinadas, si su tercera cifra fuera uniforme entre las hasta 20 opciones posibles, el número esperado de aciertos de cada clase sería proporcional a la cantidad de opciones en ella.

- **Lalo estricto**: 1 coincidencia observada en `AMBAS` versus **1,10** esperadas bajo esa referencia.
- **Top10 +11 combinados**: 6 coincidencias observadas versus **4,25** esperadas.

**Control adicional igualando presupuesto:** cuando una madre tiene opciones formables en ambas auxiliares y opciones formables en una sola, se elige de manera fija PRE **una de cada grupo** usando cantidad de antecedentes geométricos y criterio de desempate independiente del resultado. En **404 pares**, hubo **2** coincidencias de la opción `AMBAS` y **3** de la opción `SOLO UNA`. Para la cohorte estricta Lalo: **0 frente a 1** en 152 pares.

**Conclusión científica:** ninguna de estas diferencias permite concluir que las compartidas predigan mejor. El resultado depende de un ensayo pequeño, cortes relacionados y miles de opciones; la referencia uniforme no reemplaza una validación estadística sobre resultados futuros.

## ¿Y si las extensiones compartidas tenían testigos ganadores anteriores en sus casillas?

Entre las **1.540 observaciones de opciones compartidas** en la cohorte combinada:

| Testigo ganador exacto en posición auxiliar | Opciones observadas | Coincidencias |
|---|---:|---:|
| Solo Auxiliar Ayer | 197 | 2 |
| Solo Auxiliar Hoy | 104 | 0 |
| En ambas hojas | 28 | 0 |
| Ningún testigo en ambas | 1.211 | 4 |

En cohorte Lalo estricta:

| Testigo ganador exacto | Opciones | Coincidencias |
|---|---:|---:|
| Solo Ayer | 76 | 1 |
| Solo Hoy | 38 | 0 |
| Ambos | 4 | 0 |
| Ninguno | 432 | 0 |

Los testigos se restringen a D−1/D−7 y turnos anteriores dentro del día cuando corresponda; se cuenta cada cabeza histórica una vez por evento/sitio. Los valores **no demuestran** superioridad de testigos de Ayer: muestras diminutas, exposiciones distintas y relaciones entre sorteos.

## Confirmación física exacta del ejemplo Nocturna 29/10

El caso relatado por el usuario se reconstruyó sin alterar el motor ni mirar resultados posteriores al momento de crear su corte PRE:

- Cabeza real **Santa Fé 2813**, sufijo VT2 `13`, sufijo VT3 exacto `813`.
- Madre `13/31`: **Lalo #7**, **Geometría #1**, tal como se observó en la aplicación.
- Auxiliar Ayer: `813` tiene **cuatro** recorridos físicos. Un recorrido válido en **Previa**: `fila 0, col 0 (8) → fila 1, col 1 (1) → fila 0, col 2 (3)`.
- Auxiliar Hoy: `813` tiene **dos** recorridos físicos. Uno válido en **Matutino**: `fila 0, col 10 (8) → fila 1, col 11 (1) → fila 0, col 11 (3)`.
- **813 no aparece en el Top10 VT3 de ninguna auxiliar**, pero **sí existía** en ambos tableros PRE; tuvo **un testigo ganador antiguo exacto en Ayer**, ninguno en Hoy.

### Una aclaración fundamental: 513 no era descartable

Al reconstruir todas las opciones de la misma madre `13/31`, el sistema halló también que:

- **513 se formaba físicamente en AMBAS auxiliares**: en Auxiliar Ayer entraba en el **Top10 VT3 #4**, en Auxiliar Hoy era formable pero estaba **fuera del Top10**.
- 513 tenía **un testigo de cabeza ganadora exacto en HOY**, ninguno en Ayer.
- 813 tenía **un testigo en AYER**, ninguno en Hoy.
- También `531` tenía rutas en ambas auxiliares, con un Top10 Ayer #8.

Así que **la doble presencia no discriminaba entre 513 y 813**, y la cantidad total de testigos tampoco. Que 813 terminara saliendo en 2813 no valida una justificación retrospectiva para elegirlo: antes del sorteo las alternativas eran físicamente legítimas.

### Ejemplos adicionales de ganadoras compartidas FUERA de ambos Top10 VT3 auxiliares

| Fecha y turno | Cabeza ganadora | VT3 compartida | Madre VT2 +11 |
|---|---|---|---|
| 12/10, Vespertino | Córdoba 4801 | 801 | 01/10, Conectadas #6 |
| 15/10, Vespertino | Provincia 2073 | 073 | 37/73, Geometría #7 |
| 16/10, Nocturno | Santa Fé 5807 | 807 | 07/70, Conectadas #3 |
| 23/10, Nocturno | Ciudad 1280 | 280 | 08/80, Conectadas #2 / Formas Primero #3 |
| 28/10, Matutino | Ciudad 9178 | 178 | 78/87, Geometría #10 / Conectadas #10 |
| 29/10, Nocturno | Santa Fé 2813 | 813 | 13/31, Lalo #7 / Geometría #1 |

Cada caso conserva las rutas realmente formadas en el JSON de auditoría del workflow. Son ejemplos extraídos DESPUÉS de evaluar resultados reales; **no son pronósticos ni una secuencia de aciertos atribuible a un mismo patrón**.

## Próxima dirección productiva para la aplicación

La utilidad validada por ingeniería es una pantalla de **minihojas de extensiones**, al tocar una madre VT2 de Top10:
1. Mostrar todas las VT3 físicas por hoja, con el estado `AMBAS`, `SOLO AYER`, `SOLO HOY` o `NINGUNA`, y número de recorridos reales.
2. Distinguir `en Top10` vs `formable fuera del Top10` y enseñar los testigos anteriores por casilla y fecha, siempre dentro de su hoja.
3. Dejar las alternativas en una **vista de exploración**, sin incluirlas automáticamente en el Top10 ni recomendarlas como apuestas.
4. Para no saturar visualmente, abrir inicialmente las madres de Top10, ocultando los cientos de trazos hasta tocar una extensión concreta.
5. Para buscar ventaja estadística, ensayar controles de **igual número de alternativas, fuente geométrica comparable y cortes PRE auténticamente sellados**. Con los datos presentes, no hay regla de prioridad demostrada.

## Archivos y validación

- `src/labExtensionesAux.ts` enumeración completa de VT3 por madre, lectura exacta, rutas físicas de ambas hojas, testigos por sitio y controles de presupuesto igual.
- `scripts/test-extensiones-aux.ts` reproducción de caso sintético donde 813 está en ambas hojas fuera de Top10, mientras 513 queda en una sola; valida lecturas, disponibilidad PRE y categorías de testigos.
- `scripts/lab-tres-hojas-figuras.ts` reconstrucción 80 cortes reales, de Lalo/Geometría/Conectadas/Formas Primero/Aux Ayer/Aux Hoy, comparativa completa y detalle de cabezas ganadoras.
- `.github/workflows/lab-extensiones-aux-fuera-top.yml` [ejecución #40994627220](https://github.com/y0t3/Modelo-Papa/actions/runs/40994627220) aprobada, artefacto `extensiones-vt3-aux-octubre-hasta29`.

**Estado final: laboratorio validado y documentado. No hay cambios en APK ni motores oficiales.**
