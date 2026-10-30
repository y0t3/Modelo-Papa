# Radar de apariciones cortas — Modelo Lalo (29/10/2026)

## Objetivo y límites

Este radar **no busca una constante histórica** ni «la mejor cifra para mañana». Separa (a) apariciones locales observadas durante 5–6 jornadas, (b) respaldo en figuras y (c) lecturas complementarias entre hojas. Registra tanto aciertos como fallos, **sin alterar las prioridades MV1** ni los motores experimentales existentes.

**Rama aislada:** `lab/radar-apariciones-cortas-29oct`. Pruebas y retrospectiva: [Actions 40983060346](https://github.com/y0t3/Modelo-Papa/actions/runs/40983060346).

### Ciclo de seguimiento por puesto (cada motor y longitud, independientemente)

- **SIN_APARICION:** ningún episodio abierto.
- **NACIMIENTO:** después de comprobar 2 coincidencias en las últimas 3 Nocturnas observadas, sin mirar resultados posteriores. El nacimiento se fecha en la **segunda coincidencia**, no en la primera.
- **EN_SEGUIMIENTO:** el puesto coincide mientras se encuentra dentro de un episodio abierto.
- **PAUSA:** 1–3 jornadas siguientes sin coincidencia. No seleccionar esa cifra como si estuviera ganando.
- **REAPARICION:** vuelve a coincidir después de 2–3 jornadas sin coincidencia.
- **FINALIZADO:** 4 jornadas sin coincidencia; se conserva el registro y se buscan episodios nuevos sin forzarlos.

Los números de umbral son **criterios de seguimiento observacional**, no parámetros de predicción optimizados. La memoria móvil presentada tiene máximo seis jornadas de sorteo. Un puesto **no** representa la identidad de una figura y el radar no infiere que la familia que ocupa un puesto vaya a salir.

## Resultado retrospectivo real

127 cortes completos de Nocturna desde 1 de junio a 28 de octubre de 2026, cinco jurisdicciones (Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos), 635 cabezas, dos fechas incompletas excluidas: 20/06 y 09/07. Se reconstruye cada PRE sin cabeza Nocturna. Montevideo excluido de la muestra homogénea, porque hay calendario diferente.

- **14 nacimientos** observados de rachas por puesto en Top10 VT2 de Lalo.
- **13 finales** y **una reaparición** detectada (puesto #7, 28/10).
- Coincidencia diaria de una posición cualquiera de Top10: aprox. **8,98 %** de las 1.270 posiciones-día retrospectivas.
- Señal PRE «2 aciertos entre 3 Nocturnas anteriores»: **25 alertas**, **0 coincidencias en la siguiente Nocturna**.
- Señal PRE «2 aciertos entre 5 anteriores»: **70 alertas**, **3 coincidencias en la siguiente Nocturna**.
- Señal PRE «3 aciertos entre 5 anteriores»: **2 alertas**, **0 coincidencias siguientes**.

**Advertencia:** estas tasas no demuestran efecto negativo ni positivo. Son muestras pequeñas y hay dependencia temporal, solapamiento entre ventanas y múltiples puestos. Demuestran únicamente que el radar NO puede venderse como «probabilidad de que la racha siga».

### Episodio #7 reconstruido sin futuros

| Fecha | Familia al #7 | En 5 jurisdicciones | Estado observacional POST |
|---|---|---|---|
| 22/10 | 67/76 | Entre Ríos 8067 | primera aparición |
| 23/10 | 89/98 | Entre Ríos 2498 | **NACIMIENTO** |
| 24/10 | 36/63 | sin cabeza | PAUSA |
| 26/10 | 67/76 | sin cabeza | PAUSA |
| 27/10 | 23/32 | sin cabeza | PAUSA |
| 28/10 | 01/10 | Córdoba 4510 | **REAPARICION** |

**Observación externa relevante:** el 26/10 sí hubo un acierto de Montevideo `1876` según el registro manual; Montevideo no entra en el control cinco jurisdicciones, pero el radar de uso real debería señalar esa diferencia para no mostrar una ausencia falsa.

El **29/10** se agrega en una ficha SEPARADA, como observación facilitada por el usuario, **no computada retroactivamente como PRE sellado**:
- Nocturna Santa Fe `2813`, VT2 `13/31`, VT3 exacta `813`.
- Lalo VT2 **#7**, Geometría VT2 **#1**, Auxiliar Ayer VT2 **#4**: familia `13/31`.
- Figuras Conectadas VT2 **#1** con una **familia diferente**, cuyo valor no está confirmado aquí: **no inventarlo**.
- Formas Primero VT3 **#5**: `513/315`. Fue una alternativa que los usuarios siguieron PRE.
- Según la lectura visual manual, +11 no tenía recorrido válido `813`, mientras Auxiliar Ayer y Auxiliar Hoy sí podían formarlo. Deben auditarse físicamente las rutas antes de registrarlas como prueba de recorridos exactos.

En el seguimiento conversacional del 29/10 se registra el #7 **EN_SEGUIMIENTO**, ya que el 28/10 figuraba como reaparición; no se presume lo que hará el 30/10.

## Coincidencias entre motores ≠ entre tableros

En el replay se reconstruyeron también rankings VT2 de **Geometría** y **Figuras Conectadas** sobre PRE +11, como ocurría en la app al momento de la investigación. Se hallaron **939 agrupaciones fecha+familia** presentes en dos o tres de los tres motores; **82** estuvieron asociados a una cabeza coincidente. Son exposiciones múltiples, no 939 pronósticos únicos, y **los tres motores parten de la misma hoja +11**.

Por tanto, estas 939 concordancias no se cuentan como «dos o tres fuentes físicas independientes».

El módulo genérico `src/labRadarVentanaCorta.ts` admite las etiquetas `AUX_AYER` y `AUX_HOY`, cada una como tablero distinto, pero **el replay aún no reconstruye ni valida sus rankings históricos**. No se atribuyen falsos respaldos auxiliares. Para integrarlos se deben leer sus dos tableros PRE específicos, validar recorridos Santiago/Neuquén y calendarios, conservar la cruzada física entre columnas que aplica solo a auxiliares, y comprobar las extensiones VT3 desde madres VT2 sin mezclar trazos de tableros diferentes.

## Qué debería revisar el radar en cada nueva jornada

1. **Nacimiento:** nuevas formas y puestos con resultados reales confirmados en las 3–6 jornadas recientes, sin confundir presencia de una figura con acierto.
2. **Movimiento y zona:** fuente, casillas, contacto, traslados y figuras realmente ganadoras previamente. Un puesto NO es una silueta fija.
3. **Coincidencia por motores:** listar puestos y familias, **distinguiendo motores de tableros** para no multiplicar respaldo artificialmente.
4. **Extensión física VT2→VT3:** buscar todas las lecturas posibles, incluido `513` y `813` del ejemplo si son formables físicamente, sin promoverlas a priori; observar las candidatas no elegidas.
5. **Pausas y cierre:** reportar ausencias, distinguir calendarios y seguir cualquier nuevo nacimiento, sin apegarse al #7.

Esto requiere ejecutar el radar sobre una jornada o programar expresamente una revisión. **Este experimento no se ejecuta automáticamente en segundo plano por sí solo.**

## Archivos y validación

- `src/labRadarVentanaCorta.ts`: estados de episodios, comparación correcta por tablero/motor, extensiones madres VT2.
- `scripts/test-radar-ventana-corta.ts`: prueba de secuencia #7 22–29/10, fase pausa/reaparición, familias y origen de dos tableros.
- `scripts/lab-radar-ventana-corta.ts`: replay diario del top10 Lalo, Geometría y Conectadas con PRE reconstruido, cálculo de alertas del día siguiente en ventana histórica, resultados por puesto.
- `auditorias/radar-ventana-corta/retro.json`: archivo descargable en artefacto Actions `radar-ventana-corta`, con cada día, estado, convergencias y señales.
- [GitHub Actions 40983060346](https://github.com/y0t3/Modelo-Papa/actions/runs/40983060346): validación de pruebas y MV1.

**Estado final:** instrumento de observación validado en laboratorio, sin alterar APK ni ranking vigente, **sin ventaja predictiva demostrada**.
