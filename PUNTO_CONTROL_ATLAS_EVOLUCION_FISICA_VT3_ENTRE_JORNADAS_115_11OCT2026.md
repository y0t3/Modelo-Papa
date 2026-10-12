# Atlas físico VT3 — evolución entre D−7, última jornada y hoja actual · 115 cortes

**11 de octubre de 2026. Estudio ejecutado, visualizado y reproducido sobre datos históricos ya disponibles.** Rama experimental de auditoría, `main`, motor oficial, marcación de la hoja +11, selector V7–V14 y APK intactos. No se crean reglas de puntos ni se espera información de sorteos futuros.

## Problema nuevo separado

Se auditaron **92 transiciones intradía** de 23 fechas: **cero** modificaciones de dígitos en las fuentes 6×2 que ya estaban incorporadas. La hoja se amplía con la nueva fuente que surge después del turno, pero las fuentes anteriores no se mueven dentro del día. Las reconfirmaciones V9 pertenecen a las cabezas nuevas, no a un desplazamiento real de celdas viejas.

Para estudiar movimiento físico, comparar **hojas de fechas distintas**:
- **D−7**: hoja del mismo día de la semana anterior.
- **Última jornada con sorteos**: puede distar dos días calendarios del presente.
- **Actual PRE**: exclusivamente las fuentes que existían antes del turno objetivo.

**Tres niveles diferentes**: (1) misma familia numérica VT3 reversible en la misma fuente en dos fechas, (2) misma forma de tres casillas, permitiendo traslación, (3) idénticos casilleros. La figura antigua que explicaba una cabeza completa puede trasladarse y producir **otra familia VT3** sobre la hoja actual; esta genealogía confirmada es distinta de los tres criterios anteriores. Se conservan todas las rutas físicas válidas y sus dos sentidos, sin salto, vacío, cruce de fuentes ni reutilizar celda.

## Resultados estructurales

En **1.104 exposiciones madre×corte** de los Top10 VT3 ya congelados, con **4.033** caminos actuales:

| Repetición de la misma madre VT3 en la misma fuente | Última jornada | D−7 |
|---|---:|---:|
| Mismo valor numérico VT3 reversible físicamente posible | **132** | **115** |
| Entre esas, al menos una firma geométrica coincidente bajo inversión | **20** | **24** |
| Entre esas, al menos una ruta con exactamente las mismas tres celdas | **6** | **0** |

Las figuras realmente confirmadas por cabezas antiguas se enlazan aparte; no confundir una VT3 físicamente posible antigua con una VT3 históricamente confirmada. La mayoría de las madres actuales **no** reaparecen numéricamente en la hoja anterior, aunque sí pueden nacer de una **traslación válida de una figura antigua de OTRAS cifras**.

Se enumeraron exhaustivamente todas las familias VT3 físicamente posibles en los **115 pares fecha×fuente**, con **6 filas por 2 casilleros**, y se comparó la bolsa disponible de cada fuente:

| Antecedente | Promedio Jaccard |
|---|---:|
| Última jornada sorteada | **5,9616 %** |
| D−7 | **4,6348 %** |
| Referencia: promedio con **todas las fechas anteriores disponibles**, INCLUYE la última, misma fuente | **5,1597 %** |

Diferencia de la última jornada frente a referencia temporal: **+0,802 puntos porcentuales**, intervalo descriptivo del 95 % por bootstrap de **23 jornadas completas** (8.000 muestras, semilla fija) **[−0,008; +1,670] puntos porcentuales**, incluye cero. No se detectó una continuidad numérica temporal suficientemente robusta para usarla como filtro o bonificación. El control no usa fechas futuras con respecto a cada objetivo.

## Caso 5/10 Matutina: corroboración de la hipótesis del padre

Madre actual **`729/927`**, fuente **Primera +11**, tiene **seis caminos VT3**. En esa misma fuente la madre `729/927` no existía numéricamente ni en **D−7, 28/09**, ni en **última jornada 03/10**. Pero **la huella antigua `517/715`**, confirmada por la **cabeza completa `2517` del 28/09**, puede trasladarse **dentro de la misma fuente y siguiendo exactamente las mismas celdas relativas** para dar `729/927` el 05/10. De 03/10 también provienen antecedencias físicas confirmadas con otras ternas, entre ellas `429`, `238` y `295`. Cuatro caminos actuales tienen genealogía heredada y dos son formas adicionales.

**Conclusión física:** hay continuidad por geometría histórica sin continuidad del número VT3. No atribuirle un movimiento intradía artificial ni convertir el caso conocido en criterio de selección de la cuarta cifra.

## Cotejo POST sin cambiar las elecciones

La bolsa completa de **diez cifras por cada madre** tuvo **20 coincidencias madre+cifra**, de las cuales **6** coincidieron con una hija VT4 que tenía camino físico propio. Sólo **una** de las 20 coincidencias tuvo madre numérica presente en la última jornada y **ninguna** repetía madre numérica en D−7. **Ninguna de las seis coincidencias con hija física** exigió repetición numérica de madre en ninguno de los dos períodos. Muestra pequeña, altamente condicionada por cobertura y múltiples ensayos, **no es prueba predictiva**.

## Pruebas verificadas y material

- **PRE fuente anterior**: `FUENTE_UNIFICADO_PRE.json`, SHA256 `337c9ad152fbd842356e255746f2c339ac40a1deaf3c8d90fc29a4beb16f96ca`.
- **Atlas PRE nuevo**: `ATLAS_EVOLUCION_PRE.json`, SHA256 `73bc3c01de85e8267d3b260afc25169d13ae3e199491220573af5e32efedadc4`.
- **Atlas POST**: `ATLAS_EVOLUCION_POST.json`, SHA256 `c0f6499bf51648e4c64edd35391f93dd07212e95f124334c29132c2fca79ed72`.
- **ZIP reproducible creado en la conversación**: `modelo-papa-atlas-evolucion-visual-vt3-115-cortes-11oct2026.zip`, **17 archivos**, **1.772.420 bytes**, SHA256 `c92018d28b7ba49153d6154e17d735ac9260d6651cef99225db3d4bd7a8d6df9`; ZIP sin corrupción.
- El PRE se calculó **sólo con instantáneas del observatorio PRE histórico y genealogía D−1/D−7**. No se necesitó archivo POST ni descarga de cabezas de fechas objetivo; las 30 fuentes-jornada se recuperan desde las filas ya censuradas. El archivo histórico agregado contiene varias capturas de turnos distintos: la selección por corte sólo consulta columnas anteriores a ese turno. **NO afirmar que todo el JSON agregado fue sellado en tiempo real antes de los sorteos históricos.**
- El POST se agregó exclusivamente para el cotejo posterior. Se reprodujeron **siete salidas byte a byte** en un directorio aislado: JSON PRE/POST, dos visores, dos CSV e informe; auditoría de **4.461 trayectos listados** de madre en antiguo/actual y **2.310 antecedentes de cabezas y posiciones históricas**.
- Visores PRE/POST **115 cortes completos** y tres hojas simultáneas: D−7, última jornada, actual. Muestran TODAS las rutas VT3, colores distintos para formación posible antigua y huella confirmada, las cabezas completas antiguas y línea de tiempo de las últimas 7 jornadas. El POST agrega los resultados en panel separado. Ambos probados en **Chromium Playwright** usando `set_content`, escenario 05/10 Matutina/Primera/`729`, dibujo SVG en tres hojas, sin errores JS.
- El ZIP conserva `atlas.py pre|post`, `verificar.py`, `visores.py`, `crear_informe.py`, fuentes PRE/POST independientes, informes y visores para reproducir sin depender de la conversación.

## Decisión

Conservar este atlas como capa **morfológica de observación**, no como ranking numérico: examinar qué figuras antiguas verdaderamente confirmadas producen familias nuevas al trasladarse, qué bifurcaciones actuales aparecen y cuál hija VT4 exacta se realiza, con su propio testigo físico (nunca heredar el de la hermana). Prospección futura en paralelo, no bloquea el trabajo sobre datos existentes. Ninguna puntuación oficial fue modificada.
