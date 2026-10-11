# Punto de control — ranking de grupos maternos VT3→VT4, 115 cortes

**11/10/2026. Ensayo ejecutado, retrospectivo y exploratorio; NO validación independiente.** Solo rama `auditoria-sorteo-10oct-2026`; `main`, motor oficial, marcado +11, selector V7–V14 y APK **sin cambios**.

## Continuación exacta tras corregir las hijas hermanas

Partiendo de una familia madre VT3 física `729/927` y agregando `3`, el grupo de extensión VT4 posee **dos hijas hermanas**, `3729` y `3927`; cada hija tiene su propia inversa: `9273` y `7293`. **Un grupo materno ocupa una posición Top3/5/10, pero cubre hasta cuatro números completos de cuatro cifras**. No contar la inversión como otra madre `273`. No afirmar ruta física de una hija meramente numérica por existir la VT3 madre.

Se empleó como fuente PRE intacta `EXTENSIONES_MADRES_PRE.json` del ensayo anterior: SHA256 `cd9bd6b09e9508219d16b7100830153ecba113a10f3936d65124cb2bdd92cc05`. Los 23 días/115 cortes pertenecen a 70 cortes de septiembre y 45 de octubre. Tablero físico +11 de seis filas (incl. Montevideo) y cinco jurisdicciones argentinas para cotejo objetivo.

## Tres políticas nuevas, fijadas en PRE antes de cotejar

1. `D7_MADRES_DIGITO_FIJO`: ordenar madres por cantidad de fuentes, marcas y recorridos históricos D−7, elegir **un** dígito mediante hash estable, sin premiar física.
2. `D7_MADRES_ROCE`: **mismas madres y mismo orden**, pero elegir dígito maximizando número de hijas físicamente realizables y recorridos VT4, sin conocer POST.
3. `MULTIRRUTA_MADRES_ROCE`: madres con mayor variedad de fuentes y recorridos VT3 físicos actuales primero; dígito como en política 2.

Cada Top tiene un grupo por madre, está anidado (Top3 ⊆ Top5 ⊆ Top10), puede abstenerse cuando faltan madres, conserva orígenes y todas las rutas alternativas, con etiquetado físico o virtual. No se reentrenó V9 ni se reprodujo la política exacta de las siete interpretaciones previas.

**Hash PRE nuevo:** `790e88be4439d31ee60f92b9a5a9cf8b85335a1165c05fb7631b9a166587674b`. Rehecho en una carpeta aislada **sin fichero POST**, hash idéntico. Se generaron 3.177 exposiciones de grupos seleccionados y se inspeccionaron 14.553 testigos físicos de cuatro celdas (apariciones, con repeticiones entre métodos) validando fuente única, vecinos, sin vacíos ni reuso de celda, inversión y genealogía. El PRE fuente antiguo no cambió.

## Cotejo total 115 cortes: cortes con ≥1 cabeza cubierta

| Política | Top3 | Top5 | Top10 | Números distintos medios en Top10 | Control permutación Top10 |
|---|---:|---:|---:|---:|---:|
| D−7 madres / dígito fijo | 0 | 1 | 1 | 35,45 | 1,60 |
| D−7 madres / roce | 0 | 1 | 1 | 33,37 | 1,99 |
| Multirruta madres / roce | **1** | **2** | **3** | **32,42** | **1,95** |

**Los 3 aciertos de la tercera interpretación corresponden exclusivamente a septiembre; octubre 0/45 para todas las reglas y presupuestos.** Como controla distintos valores numéricos cubiertos por cada Top, no se compara ingenuamente con un Top10 de diez números sueltos. Se hicieron **2.500 permutaciones de paquetes de cinco turnos completos por jornada**, reasignando jornadas dentro del mismo mes y preservando la dependencia intradía; cola nominal del Top10 multirruta **0,3088 en los 115 cortes**, **0,1272 en septiembre**. El bootstrap pareado por 23 jornadas enteras para ventaja multirruta vs D7+roce Top10 dio **+2** cortes, intervalo exploratorio **[0,+5]**. Diferencia insuficiente y sin generalización a octubre. No extrapolar p-valor nominal tras explorar muchos métodos.

**Elegir cifra por roce manteniendo las mismas madres** no mejoró aciertos totales frente a dígito hash del control: Top3 0→0, Top5 1→1, Top10 1→1.

### Caso negativo relevante, 05/10 Matutino

Madre física VT3 `729/927` formada al trasladar trazos confirmados D−7. Dos hijas físicas al añadir 3: `3729` (dos caminos) y `3927` (tres), cabeza posterior Santa Fe `3729`. La madre sí quedó en puesto **8** según D−7 y **5** con multirruta. **Pero la cifra 3 quedó tercera** por cantidad de recorridos VT4; se eligió cifra **7** (doce testigos físicos frente a cinco de cifra 3). **No se adjudicó retrospectivamente el acierto**. Demuestra que clasificar madre y elegir cuarto dígito son dos retos distintos.

## Paquete reproducible y pruebas

Archivo generado y comprobado: `modelo-papa-ranking-grupos-vt4-115-cortes-11oct2026.zip`, 18 archivos, SHA256 **`21a0e74462040b391b8780ca7b2794d053b53eb1b46cf541f1a16140ae5e5872`**. Incluye script PRE; script POST con controles; auditor de integridad que aísla POST; informe; balance agregado y por corte con **todos** los negativos; fuentes PRE y POST separadas; y visores nuevos `ANTES_TOP_MADRES.html` y `DESPUES_TOP_MADRES.html` para 115 cortes, con selección de método/Top/madre y dibujos de fuentes D−7/actual, **todas las rutas físicas** de la familia escogida y marcas distinguidas.

- ZIP `testzip()` sin errores; extraído en **carpeta nueva** con las fuentes originales. Reproducidos **exactamente** hash PRE, resultados POST y validación de integridad.
- Visores verificados en **Chromium/Playwright** con `page.set_content`: dibujan SVG y rutas; selector de fecha, turno, política, Top y familia responde; **sin errores JS**; PRE ocultó cabezas objetivo, POST las reveló por separado.
- No se verificó acceso a archivos por `file://` en la versión restringida de Chromium, que devolvía `ERR_BLOCKED_BY_ADMINISTRATOR`; `set_content` sí funcionó. Son HTML autocontenidos, probados en el DOM, no navegación local a fichero.

## Decisión y siguiente prueba

Se conserva el agrupamiento de madres/hijas como la representación correcta de esta **vía de generación de candidatos**; **no** se promueve el orden por multipath, roce o cifra a V13/V12/V14. El cuello de botella persiste en elegir **la cuarta cifra** con capacidad realmente discriminante, separada de elegir la madre. Dado que septiembre/octubre y los días 2024–2026 se estudiaron reiteradamente, exigir un **conjunto de fechas futuras con PRE seleccionado y sellado antes de cada sorteo**.

Pendiente en paralelo: evaluar **VT2 Top3 V9** en ese conjunto futuro **con la implementación exacta** del laboratorio de siete interpretaciones. El ZIP original de ese laboratorio no está versionado en este repositorio, de modo que no se anunció una réplica falsa.
