# Modelo Lalo · Hoja dual y Predictiva Auxiliar

**Laboratorio:** `lab/hoja-dual-predictiva-aux-21oct2026` · 21 de octubre de 2026.  
**Protección:** no se modifican Modelo Lalo MV1, los rankings de producción ni `main`. **Lalo Auxiliar** continúa calculando sus candidatas únicamente desde la hoja Santiago–Neuquén.

## 1. HOJA: dos tableros, una selección POST

La pestaña **HOJA** conserva íntegro el componente visual de +11 y ahora presenta inmediatamente debajo el tablero RAW de Santiago–Neuquén, antes de la hilera **CABEZAS DEL TURNO**.

- **Ancho:** el mismo ancho responsive calculado para `MarkedBoard` +11 (`max(242, windowWidth-50)`). Las etiquetas de Previa, Primera y Matutino distribuyen en partes iguales **cuatro casillas de ancho**.
- **Filas:** Santiago (arriba), Neuquén (abajo). Es **2×12**, sin espacios, huecos ni separación fuerte entre franjas de turnos; se permiten cruces entre sus límites con contacto físico horizontal, vertical o diagonal.
- **Origen:** solamente las cabezas RAW de Santiago/Neuquén; **no se aplica +11 a la segunda hoja**. Se respetan ceros iniciales y la disponibilidad PRE: antes de Previa ninguna franja, antes de Primera solo Previa, antes de Matutino Previa+Primera, y antes de Vespertino/Nocturno las tres si hubo publicación.
- **POST:** exclusivamente las **cabezas realmente publicadas** de Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos y Montevideo; mismas familias/sufijos VT2, VT3 y VT4. Se marca el sufijo **exacto**, jamás una variante no sorteada.
- **Resaltado compartido:** el identificador `turno|jurisdicción|cabeza` se usa en los dos tableros. Tocar una cabeza de la hilera inferior aísla simultáneamente **TODOS** sus recorridos físicos exactos en +11 y en AUX, con borde/relleno translúcido y marcadores de color por VT2, VT3, VT4 que no cubren las cifras. La misma selección funciona incluso si la cabeza **solo** puede formarse en AUX y no tiene ninguna ruta +11.
- La ficha de cabeza suma **los recorridos de ambas hojas** y su modal de detalle incorpora el tablero AUX con las mini capturas de cada ruta auxiliar y su secuencia física numerada.
- Los filtros preexistentes «toda la hoja» / «solo turno» actúan sobre ambas hojas. La pestaña AUX de experimentación anterior se conserva por ahora para no perder sus herramientas de inspección y memoria.

**No se cruzan recorridos entre ambas hojas.** Las rutas del +11 continúan confinadas a una columna; las rutas del AUX son contiguas en su tablero 2×12, aun si pasan por el límite Previa/Primera/Matutino.

## 2. PREDICTIVA: dos botones que abren dos tableros independientes

En **PREDICTIVA** aparecen ahora:

- **PREDICTIVA LALO** (por defecto): el `PanoramaSheet` actual, sus familias, marcas, mini capturas históricas y detalle +11 sin modificación de su motor.
- **PREDICTIVA AUXILIAR**: `AuxiliaryPredictiveSheet`, con el mismo esquema visual —grilla con los recorridos simultáneos, filtros VT2/VT3/VT4, Top10 por modalidad, ver todas las familias, tocar una familia, «Ver detalle» y mini capturas.

**Entrada del segundo motor:** `buildMotorLaloAuxiliar(date,turn,auxHeads,auxiliarPast)`. Recibe solo cabezas RAW Santiago–Neuquén del día y raíces AUX D−1/D−7. **No recibe `DailySheet`, `buildMotorLalo` ni rankings +11.** La geografía de las figuras trasladadas usa movimientos adyacentes de marcas ganadoras históricas realmente comprobadas; cada ruta lee dígitos PRE actuales. VT2, VT3 y VT4 se estudian de manera autónoma; VT4 se extiende exclusivamente desde madres VT3 auxiliares válidas, sin invertir cuaternas completas.

`src/auxVisualModel.ts` no recalcula ni reordena candidatas: toma el Top auxiliar ya decidido y **vincula cada cifra físicamente marcada con todos los recorridos antiguos que proyectaron esa figura**, sin atribuirle votos adicionales por muchas rutas.

### Mini capturas y explicaciones

`AuxRouteMiniPreview` muestra:
1. **Tablero 2×12 actual** con las celdas del recorrido numeradas 1→2→3→4. También señala expresamente si atraviesa franjas contiguas por contacto legal.
2. Botón **«Ver origen de los recorridos»**: mini capturas de la hoja **histórica original** —Santiago/Neuquén y demás cifras RAW cuando se descargaron—, el recorrido marcado, cabeza de cuatro cifras efectivamente publicada, jurisdicción y fecha D−1/D−7.
3. Texto de movimiento que explica **cómo se conserva la forma antigua y se lee con cifras distintas en la hoja actual**, sin copiar directamente números sorteados ni dar predicciones privilegiadas a marcas manuscritas.
4. Tanto la selección desde Predictiva como el botón de familia del Top Auxiliar en la pestaña Predicción permiten navegar a estas rutas en la Predictiva Auxiliar.

Las mini capturas son **vistas estáticas con recorrido secuenciado** y explicación, como el detalle previo de Lalo. **No se creó un archivo GIF animado**.

## 3. Sin pérdida de la arquitectura paralela ya aprobada

La pestaña **PREDICCIÓN** conserva los dos Tops independientes (Modelo Lalo MV1 / Lalo Auxiliar) y debajo el Top General de **familias compartidas y cabezas coincidentes**. No se reinstaló el mezclador experimental 65/35 ni se altera la prioridad de un motor por su coincidencia con el otro.

La entrada POST nunca modifica un Top PRE. Un VT2 ganador se contabiliza por su terminación exacta; VT3/VT4 también. En VT4 no se invierte arbitrariamente todo el número.

## 4. Comprobaciones

La batería `scripts/lab-hoja-dual-predictiva-test.ts` certifica en el tablero 20/10:

- Rutas POST de Ciudad Nocturna **2697**, con **3 recorridos exactos VT3 697** en AUX —incluido un cruce físico entre franjas— sin atribuirle erróneamente la terminación inversa 796 como cabeza publicada.
- Vespertina Entre Ríos **4066** también aporta coincidencias físicas VT2 auxiliares.
- Todos los caminos auxiliar cumplen contacto físico y pertenecen exclusivamente a celdas existentes.
- El lector Predictiva AUX enlaza candidatas actuales con eventos históricos POST de fecha anterior (no consume cabezas objetivo futuras).
- Antes de Primera solo existen rutas de la franja Previa; no se pueden revelar cifras Matutinas anteriores a su sorteo.
- Se rechaza un estado de fecha/turno de otra jornada o una raíz del mismo día futuro en el generador PRE.
- La comparación MV1/AUX y genealogía VT4 sigue superando la batería anterior.

**GitHub Actions con TypeScript/React Native, mapeo de fuentes y pruebas de integración aprobado:**
[LAB Hoja Dual y Predictiva Auxiliar](https://github.com/y0t3/Modelo-Papa/actions/runs/39701066945).

**Alcance de la verificación:** compilación de código + tests de datos/geometría. No sustituyen una revisión del render exacto, gestos, zoom y legibilidad en un dispositivo Android real.

## 5. Archivos relevantes

- `App.tsx`: Hoja +11/AUX y botón nuevo de Predictiva, navegar de Top AUX a detalle.
- `src/PanoramaSheet.tsx`: presentación dual POST y cabezas sincronizadas.
- `src/ui/AuxMarkedBoard.tsx`: tablero 2×12 al ancho del +11 con marcas y filtros.
- `src/auxVisualModel.ts`: rutas exactas POST y proyección explicativa de raíces PRE por familia AUX.
- `src/ui/AuxiliaryPredictiveSheet.tsx`: Predictiva Auxiliar con filtros, selección y detalle.
- `src/ui/AuxRouteMiniPreview.tsx`: mini capturas de rutas actuales e históricas con explicación del desplazamiento.
- `src/ui/PredictionSummary.tsx`: vínculo directo del Top AUX a Predictiva Auxiliar.
- `src/motorLaloAuxiliar.ts`: sigue siendo independiente; su historia también puede llevar copia de las cifras auxiliares históricas para dibujar la mini captura.
- `scripts/lab-hoja-dual-predictiva-test.ts`: regresión geométrica y temporal.
- `.github/workflows/lab-hoja-dual-predictiva-aux.yml`: compilación y controles.
- `.github/workflows/lab-hoja-dual-apk.yml`: compilación Android experimental separada, sin publicar nada en `main`.

## Próxima revisión visual

Verificar en teléfono si las 12 casillas auxiliares son legibles con el mismo ancho que cinco columnas +11, comprobar pellizco y rotación, color en modo claro/oscuro, apertura de las mini capturas y navegación desde una familia exclusiva AUX. La configuración responsive mantiene las reglas físicas aunque las cifras se vean compactas.
