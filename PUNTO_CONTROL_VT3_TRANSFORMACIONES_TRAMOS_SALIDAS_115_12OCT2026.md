# Modelo Papá — VT3: transformación física de ternas, tramos conservados y salidas

**12/10/2026 · Laboratorio retrospectivo completo de 23 jornadas / 115 cortes**, rama `auditoria-sorteo-10oct-2026`. **No cambia** `main`, motor oficial V7–V14, Tops en producción, marcado automático de hoja +11, datos de app ni APK. **No calcula VT4.**

## Motivo

Tras demostrar que las listas VT3 de D−7 y última jornada operativa (D−1) contienen familias diferentes y que consenso/repartos no mejoran de modo estable, se investigó físicamente **dónde se traslada cada terna heredada, qué borde consecutivo de dos casilleros conserva, hacia dónde sale el tercer casillero y si gira**. El motor oficial no se cambió.

Se mantuvo **exactamente la unión de las madres de los dos Top10 congelados**: 1.867 exposiciones madre×corte diferentes. Ningún criterio puede escoger fuera de esa bolsa ni proponer más de diez familias reversibles por corte. **Contar familias y no orientaciones individuales**. Los resultados objetivo del corte no existen en PRE.

## Reglas auditadas

1. Todas las rutas presentes, antiguas y actuales, recorren **tres celdas distintas contiguas por lado o diagonal, sin salto, vacío, regreso ni cruce de fuente** dentro de una grilla 6×2 de fuente única.
2. Una ruta antigua confirmada por cabeza completa se traslada con la **misma traslación vectorial (Δfila, Δcolumna) en sus tres celdas**. Se comprobaron **1.857 raíces/rutas D−7 y 2.024 D−1** dentro de la unión de Top10. El dato crudo D−1 se volvió a contrastar con `FUENTE_RECUPERACION_PRE.json`: **las 2.024 rutas se enlazan a una o varias cabezas históricas completas reales del turno y jurisdicción antiguos**, sin prestar validación de otra familia. Para antecedentes del 14/09, los 115 cortes no contienen esa hoja de cierre para comprobar su digitación, por lo cual se auditan geometría/identidad y se declara el límite.
3. **Borde físico conservado**: dos celdas consecutivas de una ruta ancestral trasladada también son consecutivas en una **ruta actual de la misma familia y fuente**. No basta coincidir en dos dígitos; ni compartir dos celdas que sean extremos no consecutivos.
4. **Bloque nuevo** respecto de una raíz: conjunto de tres celdas actual diferente del bloque de su ruta trasladada, compartiendo borde auténtico. Un mismo bloque puede resultar nuevo respecto de D−7 pero ya heredado desde D−1. Se contabiliza una sola vez por familia/fuente/corte y se conservan **todas las lecturas geométricas**, incluso inversas, para el visor.
5. Dirección de salida: compara la fila del tercer casillero antiguo desplazado con la del tercero nuevo (arriba, abajo, lateral); para raíces diferentes un bloque puede tener más de una dirección válida. Cambio de giro: comparar tramos colineales frente a un giro físico. Borde de acuerdo D−7/D−1 cuenta el **mismo par de casilleros físicos** con apoyo de ambos orígenes.
6. **POST solamente** coteja las cinco cabezas argentinas del turno. Las seis jurisdicciones del tablero pueden participar en la geometría.

### Datos geométricos PRE

- **1.867** exposiciones de familias dentro de la unión de Top10 D−7/D−1.
- **2.584** bloques de bifurcación nuevos relativos a alguna raíz; **1.139** contienen relación de salida hacia arriba, **1.164** hacia abajo, **500** lateral. Las direcciones no son clases disjuntas.
- **881** casos de bordes de origen físico compartidos entre D−7 y D−1 al contar fuente/borde/familia/corte; no son 881 confirmaciones independientes.
- En antecedentes concretos D−7: 681 traslados de filas hacia arriba, 707 abajo, 469 sin cambio de fila. D−1: 833 arriba, 749 abajo, 442 sin cambio de fila. Estos **no** son aciertos ni pruebas de causalidad.

## Top 3, 5 y 10 de familias VT3 sobre 115 cortes

| Política PRE | Top3 | Top5 | Top10 | Top10 últimos 90 |
|---|---:|---:|---:|---:|
| D−7 original congelado | **5** | **8** | **16** | **11** |
| D−1 original congelado | **9** | **13** | **18** | **13** |
| 5+5 congelado, sin duplicar | 5 | 8 | 18 | 14 |
| Menor desplazamiento | 7 | 9 | 15 | 10 |
| Mayor desplazamiento | 7 | 10 | 15 | 11 |
| Mayor número de bloques nuevos conectados | 8 | 8 | 17 | 12 |
| Salidas hacia arriba | 6 | 7 | 18 | 13 |
| Salidas hacia abajo | 7 | 8 | 14 | 10 |
| Cambio de giro | 7 | 9 | 15 | 10 |
| Borde común heredado de ambas referencias | 5 | 6 | 16 | 11 |

Ninguna prioridad morfológica supera a D−1 Top10. Los 90 corresponden al 21/09–10/10. Los 115 cortes y 23 jornadas son un **corpus histórico estudiado reiteradamente**: no se trata de datos de validación independiente ni de pronósticos reales.

### Controles por densidad

Control exacto hipergeométrico condicionado **por corte**, manteniendo la unión de familias, cupo de diez, banda de cantidad de recorridos físicos, raíces heredadas, fuentes y 1/2 lecturas por familia. Esperanza Top10: **D−1 16,02**, **salidas arriba 15,56**, **nuevos bloques 15,38**, frente a 18/18/17 observados. Intervalo exploratorio de salidas arriba **menos D−1** re-muestreando días completos (23): **[−7,+6] cortes**. Entre los 90 posteriores, ambos 13, diferencia 0. Ningún control sugiere ventaja estable; las mismas fechas se usaron para diseñar hipótesis.

**Ejemplos esenciales**:
- **28/09 Primera, `037/730`**: antigua `7173` confirmó terna `371/173`; traslación de tres filas hacia abajo en fuente Previa +11; nueva rama comparte el borde físico `(3,1)–(3,0)` y termina una fila hacia arriba. Selección por salidas arriba recuperó la familia, D−1 Top10 no; POST `8037`.
- **25/09 Matutina, `118/811`**: D−1 10.º; POST `6811`. Perdido al preferir arriba porque su nuevo bloque se vinculaba hacia **abajo** y no tenía salida arriba. Contraste negativo obligatorio.
- **03/10 Matutina, `238/832`**: figura ganadora en política arriba **por desempates**, aunque tiene dos salidas nuevas **laterales** y cero arriba; no confundir inclusión con una rama ascendente inexistente.
- **05/10 Matutina, `729/927`**: fuentes D−7 de `2517` y D−1 con huellas independientes, con trayectoria y bifurcaciones diferentes; D−7 6.º, D−1 1.º, ascendentes 7.º, POST `3729`.
- **10/10 Nocturna, `465/564`**: vieja cabeza confirmada `7429` se traslada una fila arriba en la fuente Previa; aparece una salida nueva; POST `0564`.

## Archivos y reproducción

Paquete de conversación `modelo-papa-vt3-transformaciones-tramos-salidas-115-cortes-12oct2026.zip`, **17 archivos, 1.271.262 bytes**, SHA256 **`3ef45c262739321967e2447160018efb84c6f028df9aa35354db5703800fb607`**, integridad ZIP comprobada.

- `TRANSFORMACIONES_PRE.json` SHA256 **`724f2d87c4eba8c86e8a2604c97142a60a450bca3e9c4f709f5e850985ee0227`**.
- `TRANSFORMACIONES_POST.json` SHA256 **`293dedb5dd36fa8c730b81a98262a67a26e229cc9ea67e64076ffad1351a9900`**.
- Entradas históricas `FUENTE_PRE.json`, `FUENTE_RECUPERACION_PRE.json` (cabezas antiguas completas), y `RESULTADOS_POST.json` físicamente separables. Código Python 3 estándar `analizar.py`, `controles.py`, `informe.py`, `visores.py`, `reproducir_aislado.py`; salidas JSON, CSV e informe y visores offline autocontenidos.
- **Auditoría independiente por etapas en carpeta nueva**: sin `RESULTADOS_POST.json`, `analizar.py pre` y `verify` pasaron y el PRE + visor PRE tuvieron **hashes exactos**. Sólo después se agregó POST y se reprodujeron **cinco** archivos byte por byte: JSON POST, CSV, controles, informe y visor POST. El lanzador de una sola ejecución excedió su plazo al reejecutar controles, pero **las dos fases independientes terminaron y los siete hashes coincidieron**.
- **Visores** `VISOR_TRANSFORMACIONES_PRE.html`, `VISOR_TRANSFORMACIONES_POST.html`: elección fecha/turno/criterio/madre/raíz/ruta; tres grillas por fuente, lectura y coordenadas, cabeza antigua, traslado, recorrido actual y tipo de bifurcación. Ambos probados con Chromium/Playwright, con fecha 05/10 y navegación 03/10, 3 SVG visibles, cero errores JavaScript. PRE no carga resultados objetivos.

## Decisión técnica

**Mantener observadores D−7 y D−1 separados, mantener todos los recorridos posibles y distinguir rutas, bloques y salidas sin convertirlos en reglas predictivas.** No premiar dirección hacia arriba ni desplazamiento corto por una coincidencia retrospectiva. La distinción geometría/trayectoria queda ahora disponible para inspección visual. No promover cambios en producción ni volver aún a añadir la cuarta cifra VT4.
