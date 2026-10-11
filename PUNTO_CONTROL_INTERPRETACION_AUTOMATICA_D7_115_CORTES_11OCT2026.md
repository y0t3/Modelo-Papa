# Punto de control — interpretar todos los recorridos D−7 automáticamente marcados; no hay selección manuscrita

**Fecha:** 11/10/2026, rama exclusiva `auditoria-sorteo-10oct-2026`, **sin cambiar main, motor, V7–V14 productivos ni APK**.

## Regla del método del padre — corrección innegociable

Las hojas de +11 se completan con cabezas ya sorteadas y **se marcan automáticamente TODOS los recorridos físicos válidos** que forman las terminaciones coincidentes; no hay recorridos elegidos o dejados sin marcar por el padre. La actividad interpretativa/predictiva del padre ocurre **DESPUÉS** de ver el conjunto íntegro de trazos confirmados, al comparar movimientos, persistencia, convergencia y D−7. **Prohibido volver a investigar una supuesta selección histórica de trazos escritos a mano.** La enumeración digital exhaustiva sí intenta reproducir el mecanismo de marcado automático, aunque los trazos concretos puedan requerir corroboración del tablero.

La geometría válida: un solo par de columnas de fuente, pasos de celdas vecinas (incl. diagonales), sin huecos ni reusar celdas. Inversión de un trazo es la misma familia reversible. Top3/Top5/Top10 son **familias**, nunca números independientes. VT4 artificial por azar debe distinguirse de VT4 físicamente trazada y conservar su madre VT3.

## Ensayo completado

- 29 fechas y 145 cortes históricos; **23 fechas/115 cortes con D−7 disponible** (70 septiembre, 45 octubre).
- Siete políticas interpretativas PRE sobre idéntica bolsa por corte/VT: orden histórico D−7, misma posición, desplazamiento cercano en la misma fuente, convergencia de distintas rutas históricas, pertenencia D−1, intersección D−1/D−7 en idéntica huella, número de turnos anteriores con confirmación exacta de esa familia V9 (contados una vez por turno).
- Se comparan dentro de la misma bolsa, nunca fingiendo que había selección de rutas manuscritas. Cada familia conserva todos los recorridos físicamente posibles en la hoja actual, incluso los que no obtienen respaldo de traslado antiguo, y todos los orígenes D−7 antiguamente confirmados.
- La hoja PRE contiene cabezas de D−7 ya conocidas, pero **nunca las cabezas del turno actual objetivo**; POST por separado.
- **PRE SHA256 `a464493ad8f2c197d78a86ca6a01f0b0660a0124bb319356822275a864c23128`**, inalterado al quitar físicamente el fichero POST.

### Cobertura del traslado D−7 en las 115 hojas por modalidad

Porcentaje medio de las familias físicas actuales que pueden formarse desde alguna ruta antigua confirmada D−7 por traslado rígido en la misma fuente:
- **VT2 93,14 %:** bolsa casi universal, escaso filtro.
- **VT3 26,43 %:** filtro fuerte con omisiones.
- **VT4 2,63 %:** bolsa muy restringida; **0 familias acertadas en los 115 cortes dentro de esa bolsa** (Top10 0 SEP/OCT). VT4 necesita extensión desde madres VT3, física por roce o proyección aleatoria explícita; este ensayo directo no evalúa esas extensiones.

### Top10 (cortes con al menos una familia confirmada)

| Política | VT2 SEP /70 | VT2 OCT /45 | VT3 SEP /70 | VT3 OCT /45 |
|---|---:|---:|---:|---:|
| Base D−7 | 49 | 33 | 4 | 1 |
| Misma posición | 49 | 33 | 3 | 1 |
| Movimiento cercano | 50 | 33 | 4 | 1 |
| Convergencia | 49 | 33 | 4 | 2 |
| D−1 familia | 48 | 34 | 3 | 3 |
| D−1 misma huella | 48 | 34 | 3 | 2 |
| V9 eventos exactos anteriores | 45 | 34 | 4 | 1 |
| **Esperanza uniforme idéntica bolsa y presupuesto** | **45,37** | **30,43** | **6,05** | **2,16** |

Ninguna política aventaja de forma estable todos los períodos/modalidades.

### Pista específica VT2 Top3 con V9, y sus límites

|Período|Base D−7 Top3|V9 cuenta turnos anteriores confirmados Top3|Control azar **compartido por jornada** (6000 muestras)|
|---|---:|---:|---:|
| SEP 70 cortes |16|20|17,90|
| OCT 45 cortes |18|23|12,46|

La selección aleatoria conserva la prioridad de cada familia durante los cinco turnos de su misma jornada. OCT 23/45 está en cola extrema **nominal** (~0,001), **pero no es test confirmatorio**: octubre ya fue estudiado antes y se han probado decenas de reglas. La diferencia frente al ranking antiguo (23−18=+5) tiene intervalo exploratorio bootstrap por 9 jornadas **[−1,+12]**, incluyendo cero; septiembre +4 con intervalo [−4,+11]. V9 no mejora VT3 Top3 (SEP 1/70, OCT 0/45), ni crea VT4 ausentes. **No activar este bonus Top3 en producción**.

Atribuciones históricas por familias no son predictibilidad demostrada ni apuestas con ventaja conocida.

### Datos de control por oportunidades dentro del mismo tablero

VT2 mismas posiciones D−7 septiembre **101 aciertos frente a 89,3 esperados**; octubre **70 frente a 68,7**; traslado cercano SEP 166 frente 156,7, OCT 115 frente 110,1. Número de orígenes, D−1, Nocturna anterior y multiplicidad de trazos no muestran enriquecimiento fuerte y repetible. En VT3 los positivos son muy escasos. Se corrigió V9: un solo turno previo da CONFIRMADA, ≥2 turnos da RECONFIRMADA; la política Top usa el **número de turnos** y no falsea ese estado.

## Paquete autónomo y validaciones

ZIP `/mnt/data/modelo-papa-interpretacion-automatica-d7-115-cortes.zip`, **24 archivos, 8.386.349 bytes, SHA256 `6b937952da852ca3f8f4cb92b701f0f71d68c72f1e274a021a2655e88fd73c58`** (verificado).
Carpeta `/mnt/data/interpretacion_visual_d7_115/`:
- `ANTES_INTERPRETACIONES_D7.html`: visor sin cabezas objetivo, **hoja D−7 izquierda y hoja actual derecha**, Top de familias y todas las rutas viejas confirmadas y actuales válidas. Trazos transferidos violeta, alternativos físicos naranja; cabezas de D−7 antiguas visibles porque son historia.
- `DESPUES_INTERPRETACIONES_D7.html`: mismo visor y cotejo completo de las cinco cabezas argentinas objetivo POST.
- `INFORME_INTERPRETACION_D7.md`, `BALANCE_AGREGADO.csv`, `BALANCE_POR_CORTE.csv`, `BALANCE_SENALES_POR_CORTE.csv`, `CONTROL_DIFERENCIAS_POR_JORNADA.csv`, `CONTROL_AZAR_COMPARTIDO_JORNADA_TOP3.csv`.
- `INTERPRETACIONES_PRE_115.json` (345 modalidad-cortes × 7 rankings), `COTEJO_POST.json`, scripts 1–5, SHA y cinco fuentes históricas originales/autocontenidas bajo `fuentes/`.
- **Verificación antifuga fuerte:** se retiró físicamente el fichero de resultados, se rehizo PRE y el SHA quedó igual. **Dos visores probados en Chromium/Playwright** (selector fecha, turno, modalidad, método, familias, múltiples rutas y POST) sin errores JS.
- **Prueba autónoma:** se extrajo ZIP en una carpeta totalmente nueva y se reejecutó preparación PRE y cotejo POST únicamente con archivos de ZIP; SHA PRE quedó idéntico, resultados reproducidos.

## Decisión

Continuar estudiando **interpretación de la totalidad de figuras confirmadas automáticamente**, no selección de marcas; próxima evaluación debe decidirse con datos genuinamente nuevos o controles independientes. V7 D−7 estructura interpretativa; V8 físico; V9 estados temporales, V13 Top familias con todas las rutas; V12/V14 transparencia y abstención. **Ningún score o cupo nuevo debe salir del laboratorio todavía.**
