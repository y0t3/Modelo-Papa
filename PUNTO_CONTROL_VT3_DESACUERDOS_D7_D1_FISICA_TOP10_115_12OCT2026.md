# Modelo Papá — VT3 primero: desacuerdos D−7 / última jornada D−1

**12/10/2026.** Prueba terminada sobre las **23 jornadas/115 cortes históricos existentes**, sin esperar futuros sorteos y sin modificar `main`, producción, Tops, app, APK ni marcado automático +11. Rama experimental `auditoria-sorteo-10oct-2026`. Ninguna hija VT4 se eligió; unidad de Top = **familia VT3 reversible**.

## Pregunta

¿Las madres VT3 que comparten los Top 10 de los observadores físicos D−7 y última jornada son mejores que las propuestas sólo por uno? ¿Un reparto igual de **10 familias** o evidencia geométrica de contacto/traslado permite resolver el desacuerdo?

**Las propuestas PRE permanecen congeladas** desde laboratorios anteriores y se generan sin consultar el resultado objetivo. Los casos POST se evalúan en archivo separado. El corpus septiembre/octubre ya se había explorado intensamente: estos cotejos cronológicos no son validación externa.

## Inventario PRE 115 cortes

En 115 comparaciones Top10: **387 exposiciones familia/corte compartidas** por ambos, **717** sólo D−7, **763** sólo D−1. Promedio **3,365 familias compartidas por corte**; en 16 cortes no compartieron ninguna.

POST entre las familias de esas uniones: compartidas **7** exposiciones acertadas, exclusivas D−7 **10**, exclusivas D−1 **13**, incluyendo algunas coincidencias múltiples dentro del mismo corte; **24 cortes** tuvieron al menos una coincidencia en la unión. El control de permutación condicionado a cantidad de ganadoras y tamaños de grupos en cada corte esperaba respectivamente **5,57 / 11,94 / 12,49** exposiciones. No emerge una prioridad robusta a «ambos corroboran». Las exposiciones no son resultados independientes.

## Top 10 de familias, mismo cupo

| Criterio PRE | 115 cortes | últimos 90 cortes (21/09–10/10) |
|---|---:|---:|
| D−7 fijo por bifurcaciones | **16** | **11** |
| D−1 fijo por huellas confirmadas | **18** | **13** |
| Reparto 7 primeras D−7 + 3 D−1 (rellenar duplicados hasta diez) | **16** | **13** |
| **Reparto 5 D−7 + 5 D−1**, sin duplicar ni ampliar cupo | **18** | **14** |
| Reparto 3 D−7 + 7 D−1 | **15** | **11** |
| Consenso primero | **16** | **11** |
| Fusión por posiciones de ambas listas | **17** | **12** |
| Prioridad a madres con respaldo directo de D−7 y D−1 | **16** | **11** |
| Prioridad a bifurcaciones D−7 sobre la unión | **18** | **12** |
| Prioridad a puentes D−7 y traslados D−1 | **19** | **14** |

Por Top3/5 las políticas no mantienen ventaja consistente: D7 **5/8**, D1 **9/13**, 5+5 **5/8**, puente **4/11** sobre 115. En los 90 posteriores: D7 **3/6**, D1 **6/9**, 5+5 **3/6**, puente **2/8**.

El reparto 5+5 sobre los últimos 90 gana **3** cortes a D−1 pero pierde **2**; diferencia neta **+1** con intervalo exploratorio de remuestreo agrupado por jornadas **[−3,+5]**; gana **5** y pierde **2** frente a D7. Sobre los 115 queda empatado con D−1. La prioridad de puentes 19/115 se estudió en el mismo corpus y no autoriza bonificaciones.

**Control igualado:** de las **13 exposiciones acertadas sólo D−1**, **10** tenían contacto de dos casilleros con una huella D−7; esperado condicionado **10,136**. De las **10 acertadas sólo D−7**, **1** tenía confirmación directa D−1; esperado **1,025**. Entre 7 exposiciones ganadoras compartidas, 6 tenían respaldo directo de ambas fuentes temporales; esperado **6,0**. **El contacto no añade discriminación frente a su abundancia.** Un roce no debe etiquetarse como herencia plena de VT3.

En control hipergeométrico exacto con mismas familias en la unión y sin densidad: repartición 5+5 observó **14** cortes frente a esperanza **11,443** sobre 90. Igualando cantidad de caminos físicos y fuentes, esperanza **10,468**; añadiendo tipo de confirmación directa de ambos observadores **10,917**. Son distribuciones descriptivas exploradas después de muchos ensayos del mismo dataset, no valores p confirmatorios, y la franja del control incluye 14.

## Casos geométricos opuestos

- **03/10 Matutina:** D7 propuso `238/832` y `295/592` con bifurcaciones desde D−7; POST coincidió en ambas; D1 no las tenía Top10. Varios matches en una misma fecha/corte cuentan como **un corte**, no dos predicciones correctas independientes.
- **08/10 Matutina:** D1 propuso `071/170` 10.ª, con **huella real trasladada** de última jornada, mientras D7 no la tenía Top10. Después apareció `7071`; reparto 5+5 la dejó fuera.
- **05/10 Matutina:** ambos propusieron `729/927`; D7 puesto **6**, D1 **1**, ambas sustentadas por sus propios recorridos históricos. POST `3729`. Una madre compartida no significa dos cabezas objetivo.
- **30/09 Matutina:** D1 incorporó `778/877` 2.ª por huella trasladada propia sin D7 directa; POST `6778`.

## Integridad, geometría, reproducción

**Laboratorio ZIP de conversación** `modelo-papa-vt3-desacuerdos-d7-d1-115-cortes-12oct2026.zip`, **23 entradas**, **1.939.605 bytes**, SHA256 **`ebd247746477d5b824378a90103f809fc0dad1eabd1541e01837289d00df85fb`**, ZIP integrity test OK; con cuatro archivos PRE congelados y un archivo POST separado, scripts Python, estadísticas, CSV, dos HTML autocontenidos PRE/POST, capturas, informe, LEEME y manifiesto.

SHA256 PRE `DESACUERDOS_PRE.json` **`5cd3fd746391a5f55daecea3faa6a106d5a398ce9562215a967ac83bccd865cf`**, POST **`c865de83949c36fc30205db196ac381d654672d8f39d6fd1f6da639b8937503b`**.

- `analizar.py verify` auditó **12.271 rutas actuales**, **1.857 rutas históricas D−7** y **1.985 testigos D−1** sobre las hojas anteriores completas de las fechas disponibles: celdas contiguas 6×2 en su fuente, lectura VT3 reversible, sin saltos, vacíos ni repetición. El 14/09 queda fuera de las 23 fechas congeladas, de modo que **no** se inventó ni auditó una grilla completa de ese día para los primeros cinco cortes.
- La vista previa D−1 inicialmente usaba la instantánea del mismo turno de la jornada pasada; se corrigió a **Nocturno de cierre del día anterior**, necesario para verificar fuentes de turnos antiguos. La prueba física pasó tras la corrección.
- Ambos visores HTML probados con Chromium/Playwright (fecha, turno, método y tres tableros, sin errores JS). PRE no incluye objetivos.
- **Reproducción aislada real desde ZIP:** extraído a carpeta nueva, eliminado físicamente POST y sus salidas, generado PRE + visor PRE con hashes idénticos; después copiado el archivo POST, generados resultados y controles en esa carpeta y comprobados **7/7 hashes byte por byte**, incluido informe y ambos visores.

## Decisión

**No incorporar a producción consenso obligatorio, reparto 5+5 ni una bonificación por puentes.** Conservar como instrumentos visuales separados D7 y D1; mostrar explícitamente familias compartidas/exclusivas y sus recorridos con origen confirmado. La dispersión de casos y el control de cobertura no fundamentan capacidad predictiva. Continuar estudiando VT3 y su discriminación, no regresar todavía a sumarle la cuarta cifra para VT4.
