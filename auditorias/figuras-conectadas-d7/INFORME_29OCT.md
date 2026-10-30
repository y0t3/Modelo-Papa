# Figuras conectadas entre cabezas ganadoras D−7 — Informe 29/10/2026

**Estado:** laboratorio exploratorio en rama `lab/figuras-conectadas-d7-29oct`, **sin tocar MV1, motores auxiliares, VT4, interfaz ni APK**. Todos los tres períodos, tests y regresión MV1 se ejecutaron correctamente: [GitHub Actions 40977654161](https://github.com/y0t3/Modelo-Papa/actions/runs/40977654161).

## Pregunta correcta: ¿qué ocurre cuando dos figuras GANADORAS distintas se encuentran?

Primero se identificaron en la hoja del mismo día de la semana anterior (D−7) **todos los recorridos físicos que explicaron cabezas reales**, no números seleccionados al azar. Cada raíz conserva jornada, turno, jurisdicción y cabeza completa, pero los dígitos se descartan para comparar los dibujos actuales. La selección PRE se hizo por **fuente + posición de casillas**, nunca por identidad de familia.

Para el objetivo Nocturna actual (cinco jurisdicciones; Montevideo excluido para comparabilidad) se reutilizaron solo las posiciones válidas del tablero +11 ya construido; un recorrido NO puede cruzar columnas ni saltar casillas. El POST solo evalúa después qué cifras reales se leían allí.

Las figuras de una misma columna se agruparon por contacto físico, diferenciando **casilla compartida** de **contacto sin compartir casilla**. Un componente se considera «zona conectada con respaldo independiente» solo si contiene al menos **dos marcas de cabezas históricas diferentes** y **dos recorridos físicos diferentes**. Muchos caminos para una misma cabeza NO cuentan como doble respaldo.

Dos ventanas de antecedentes:
- **NOCTURNO:** solo las marcas de la Nocturna D−7.
- **TODOS:** las marcas de cinco turnos completos de D−7. Se comprobó de forma independiente porque puede saturar el tablero.

Tres vistas con cupos comparables dentro del mismo ensayo: **Todas las figuras** trasladadas, **solo zonas con ≥2 testigos distintos**, y **las dos zonas conectadas con más eventos distintos** (si existen; empates por compacidad, caminos y ubicación). Los empates NO se tratan como probabilidades.

## Datos

- 118 Nocturnas, cinco jurisdicciones cada una: **590 cabezas**.
- Junio–julio: 51 jornadas; agosto–septiembre: 52; octubre 12–28: 15.
- Todas las cabezas del objetivo se conservaron fuera de las entradas que elegían figuras. Los cortes fueron **reconstruidos retrospectivamente, no sellados antes del sorteo**.
- VT2 y VT3 se midieron por separado, y el sufijo evaluado es una **lectura exacta** de la ruta seleccionada (admite recorrerla en sentido inverso), no una simple vecindad ni un VT2 acreditado como VT3.

## VT2: NOCTURNO D−7

| Selección | VT2 exactas en 590 cabezas | Control neutral de la misma fuente/silueta | Cantidad total de rutas |
|---|---:|---:|---:|
| Todas las figuras con antecedente ganador | 112 | 97,95 | 1.215 |
| Solo zonas con dos eventos históricos distintos | 78 | 68,04 | 805 |
| **Dos zonas conectadas principales por jornada** | **57** | **54,74** | **626** |

**Lo importante:** al reducirlo a dos zonas, la diferencia frente al control queda en apenas +2,26 coincidencias en 590 cabezas. No hay ventaja confiable para elegir dos focos basándose solo en cuánto se conectan las figuras.

De las 118 jornadas, **107** tenían al menos una zona con dos eventos históricos; **75** tenían dos zonas o más. Las zonas seleccionadas no son dos números: agrupaban 626 recorridos en total, unos **5,3 recorridos por jornada**, con grupos de un mismo origen.

Contraste por períodos para **dos zonas Nocturna D−7**:

| Período | Coincidencias | Control igual forma y fuente |
|---|---:|---:|
| Junio–julio | 26 | 23,35 |
| Agosto–septiembre | 23 | 23,01 |
| Octubre | 8 | 8,38 |

El pequeño exceso no es estable y desaparece en octubre.

## VT2: TODOS los turnos D−7

| Selección | VT2 exactas | Control neutral | Rutas marcadas |
|---|---:|---:|---:|
| Dos zonas conectadas principales por jornada | 130 | 135,27 | 1.925 |

Aquí el criterio también es **menos selectivo visualmente**: ya había al menos dos zonas conectadas en 115 de 118 jornadas y, en la mayoría de las jornadas, las zonas grandes cubrían muchas de las 12 casillas de una columna. El método obtiene más coincidencias brutas solo porque ilumina aproximadamente **tres veces más recorridos**. Frente al control quedó incluso por debajo.

## VT3

Las conexiones geométricas de raíces ganadoras VT3 NO reprodujeron una mejora estable:

| Ventana de origen | Dos zonas principales: VT3 exactas | Control neutral |
|---|---:|---:|
| Solo Nocturno D−7 | 1 | 0,82 |
| Todos los turnos D−7 | 6 | 7,24 |

Los números son demasiado escasos para distinguir un patrón, y no apoyan extender directamente una supuesta ventaja de VT2 a VT3, menos aún VT4.

## Dos casos visuales de octubre (números leídos SOLO al final)

- **Jueves 22/10:** en la hoja D−7 Nocturna, el grupo principal fue en **Nocturna anterior, filas 2–4**, con huellas respaldadas por tres eventos distintos (`9020` Provincia, `6204` Córdoba, `6624` Entre Ríos del 15/10). En el PRE 22/10, esas mismas posiciones podían leerse como `72,25,27,51,71,10,75,77`. Eso no convierte las ocho lecturas en ocho antecedentes independientes.
- **Miércoles 28/10:** el conjunto Nocturna D−7 señaló una zona en **Vespertino, filas 1–5**, con seis recorridos conectados y tres cabezas diferentes como origen (`1558` Ciudad, `1861` Provincia, `9344` Entre Ríos del 21/10). La cifra `10` podía leerse entre sus rutas actuales y Córdoba publicó `4510`. El caso es físicamente válido, pero el control general muestra que **no basta para recomendar ese agrupamiento** como regla selectiva.

Importante: el 26/10 Montevideo 1876 no entra en el conteo de estas cinco jurisdicciones; preservamos ese acierto manual en estudio aparte y no lo introducimos solo porque favorece la hipótesis.

## Control de zonas desconectadas: límite encontrado

Se intentó emparejar las figuras de cada zona conectada con figuras de un componente **aislado** de igual fuente y silueta. Resultó **imposible igualar el cupo** sin copiar las mismas figuras ya seleccionadas, especialmente porque la conexión por contacto consume casi todo el conjunto local:
- VT2 Nocturno D−7, Top2: faltaron **612 de 626** lugares comparables en el control aislado.
- VT2 Todos D−7, Top2: faltaron **1.919 de 1.925**.

Por tanto **no se compara** Top2 con ese control aislado: cualquier cifra de «más aciertos que aisladas» sería engañosa. El control numérico usable es el **neutral de la misma fuente y silueta**, con igual cantidad de rutas disponibles, calculado sin reemplazo.

## Conclusión y siguiente lectura visual

**No encontramos una nueva prioridad validada para escoger solo dos zonas.** El mero contacto entre varias figuras históricas no produce suficiente selectividad y, al acumular todos los turnos, prácticamente satura la hoja. Lo que sí quedó reproducido es una forma correcta de **mostrar a Lalo qué recorridos se conectan y de qué cabezas reales proviene cada uno**.

No recomendamos trasladar más recorridos, imponer un Top2, interpretar cantidad de caminos como probabilidad ni modificar MV1 por estos resultados.

Para una **hipótesis futura** se puede observar, por separado, el núcleo de **intersección de casilla compartida** frente al simple contacto entre vecinas (más frecuente). Si se prueba, fijar la selección por adelantado y comparar igual cantidad de huellas, recordando que el resultado de octubre 4510 fue un ejemplo conocido ANTES de formular la hipótesis. La interfaz útil sería una minihoja que muestre cada antecedente con su cabeza y luego los mismos casilleros actuales, sin ocultar el resto de recorridos.

## Reproducción

- `src/labConnectedWinnerFigures.ts` — eventos independientes, componentes por fuente, distinción de superposición/contacto, lectura posterior.
- `scripts/test-connected-winner-figures.ts` — una cabeza con dos dibujos no cuenta como dos; invariancia ante reemplazar cifras actuales.
- `scripts/lab-zonas-conectadas-d7.ts` — 118 Nocturnas, dos ventanas D−7, VT2 y VT3, figuras completas y selección de dos zonas.
- `.github/workflows/lab-zonas-conectadas-d7.yml`.
- [Actions 40977654161](https://github.com/y0t3/Modelo-Papa/actions/runs/40977654161) — tres artefactos JSON, uno por período, con cada corte PRE/POST y testigos históricos.
