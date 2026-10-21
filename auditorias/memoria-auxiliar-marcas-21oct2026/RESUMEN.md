# Modelo Lalo · memoria de marcas ganadoras de la hoja auxiliar
## Laboratorio independiente · resultado 2024, 2025 y 2026

**Fecha:** 21 de octubre de 2026. **Repositorio:** \`y0t3/Modelo-Papa\`, rama \`lab/memoria-auxiliar-marcas-21oct2026\`. El motor oficial **MV1 no fue modificado**. Ninguna APK fue publicada.

### Qué se probó

Una reproducción experimental del siguiente principio del cuaderno del padre: las figuras dibujadas para explicar **cabezas realmente ganadoras** en el tablero Santiago–Neuquén se conservan como referencias. Se evalúa si las mismas trayectorias físicas (secuencias de desplazamiento) pueden trasladarse a la hoja del día actual **sin violar contacto, turno disponible ni vacíos**, creando familias VT3 con los dígitos reales de las nuevas celdas.

Esto **NO** significa que el padre necesariamente aplique una traslación idéntica a esta implementación: es un lector visual de marcas históricas a contrastar con su cuaderno. Se respetan dos tableros independientes:

- Hoja +11 de Lalo: no cruza columnas, trabaja con las familias VT2/VT3/VT4 y las raíces D−1/D−7 del motor original.
- Hoja auxiliar: 2 filas × 12 columnas, fuentes Santiago y Neuquén RAW, **sin +11**. Sí cruza Previa / Primera / Matutino, siempre por celdas adyacentes; admite diagonales.
- Antes de Previa: hoja auxiliar vacía; Primera dispone de Previa, Matutino de Previa+Primera y Vespertino/Nocturno de las tres columnas de entrada.
- Santiago **20/10/2026**: Previa 8067, Primera 6142, Matutino 9634. Neuquén: Previa 0469, Primera 0245, Matutino 0210. Es la corrección verificada por el usuario en Vivitusuerte.

### Protocolo de auditoría

1. Cada jornada, antes de cada turno, construir **la hoja auxiliar PRE** estrictamente con sorteos de origen publicados.
2. **POST** del turno: de cada cabeza real de Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos o Montevideo, identificar **todos los recorridos exactos** de sus últimas tres cifras, sin invertir la cabeza sorteada. Solo estas marcas son raíces históricas.
3. Para un turno de otra jornada, tomar los dibujos ganadores de la **jornada sorteada anterior D−1** y del mismo día calendario **D−7**, si hay hoja válida. Ninguna referencia debe incluir el objetivo o un futuro.
4. Trasladar los movimientos físicos de cada marca antigua desde todos los puntos de origen válidos de la hoja auxiliar PRE actual. La figura conserva su forma, pero lee los **dígitos actuales**. Ni se copian cifras antiguas ni se salta una celda.
5. Una familia puede tener muchísimos caminos: **cada cabeza ganadora histórica aporta una sola raíz/evento**, no un voto por cada dibujo o celda. Ranking exploratorio: cantidad de eventos históricos distintos que respaldan la nueva familia; luego D−1, D−7 y geometría física como desempate.
6. Registrar Top3/Top5/Top6/Top10 VT3 del lector auxiliar, sin modificar el ranking del motor Lalo oficial.
7. Controles calculados para los mismos cortes y cabezas: geometría auxiliar por densidad física **sin marcas ganadoras**, aleatorio determinístico de familias físicamente formables, **9 simulaciones** con formas históricas físicas **no ganadoras** sustituyendo las raíces reales, Lalo oficial, y reranking experimental acotado a las diez familias admitidas de Lalo.
8. Comparación cronológica de agosto a 20 de octubre de **2024, 2025 y 2026**, cada año entrenado exclusivamente con su D−1 y D−7 **dentro de ese período y su calentamiento de julio del mismo año**. Nunca usar años lejanos para proponer candidaturas actuales.

Todos los resultados son **replays retrospectivos PRE**, NO pronósticos sellados de la época. Las ventanas y reglas se mantuvieron **idénticas** entre los tres años. El tercer año (2024) se usó como control después de ver los datos de 2025/2026: no cuenta como una evaluación prospectiva, pero permite detectar el fallo de reproducibilidad.

### Resultados anuales VT3 Top5 (una cabeza cuenta una vez)

| Año (agosto–20/octubre) | Jornadas | Cortes PRE | Cabezas observadas | Memoria auxiliar marcada | Geometría auxiliar sin memoria | Aleatorio físico | Lalo MV1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| **2024** | 69 | 345 | 1.848 | **14** | 16 | 19 | 11 |
| **2025** | 69 | 345 | 1.847 | **19** | 12 | 8 | 17 |
| **2026** | 69 | 345 | 1.847 | **23** | 14 | 17 | 21 |

La historia es **mixta**:

- En **2025 y 2026** la memoria de marcas pareció superior a leer solo la densidad geométrica y superó a Lalo por **2** cabezas anuales. Sumó 42 frente a 38 de Lalo y 26 de densidad.
- En **2024** esa ventaja geométrica **no se reprodujo**: memoria 14 vs densidad 16, selección aleatoria 19 y promedio de las nueve formas históricas no ganadoras ≈13,67.
- Las nueve variantes con **formas no ganadoras**, usando el mismo número de eventos pasados que la memoria auténtica, obtuvieron en 2026 entre 13 y 24 aciertos; una igualó/superó los 23. En 2025, entre 5 y 16; en 2024, entre 11 y 18.
- En el tercer período la condición de "dibujo históricamente ganador" **no aportó** ventaja propia respecto de reemplazarlo por otro recorrido físico antiguo.

### Incertidumbre pareada por jornadas (intervalos bootstrap 95%)

Cada remuestreo elige **jornadas completas**, manteniendo intactos los cortes y las predicciones. Diferencia positiva = más cabezas en Top5 de memoria auxiliar que del control. Estos intervalos **no corrigen** el universo de hipótesis exploradas en todo el proyecto.

| Comparación | 2024 | 2025 | 2026 |
|---|---|---|---|
| Memoria menos Lalo | +3 [−7, +13] | +2 [−10, +15] | +2 [−13, +18] |
| Memoria menos geometría sin memoria | **−2 [−10, +6]** | +7 [−3, +18] | +9 [−1, +20] |
| Memoria menos promedio de nueve formas no ganadoras | **+0,33 [−6,11; +7,22]** | +7,56 [−0,56; +16,78] | +5,56 [−3,33; +15,67] |

Aunque el **combinado 2025/2026** daba un intervalo ligeramente favorable frente a formas control [+0,67, +26,78], la réplica fija de 2024 es un **contraejemplo que descarta declarar mejora estable**. El análisis agregado y los intervalos fueron post hoc, no prueba confirmatoria.

### Un caso auditado: Nocturna del martes 20/10/2026

Ciudad sorteó **2697**, VT3 **697/796**. Estaba ausente de las formaciones +11 disponibles, pero físicamente presente en la hoja auxiliar. El lector trasladó las trayectorias de **tres cabezas anteriormente ganadoras** y situó la familia **en Top1** antes de cotejar ese sorteo (replay histórico).

**Tres antecedentes reales de marcas auxiliares:**

- **D−1 = 19/10**, Primera de Entre Ríos: cabeza **0568**, terminación real **568** (dos rutas antiguas comprobadas).
- **D−7 = 13/10**, Nocturna de Córdoba: cabeza **5529**, terminación real **529** (una ruta antigua).
- **D−7 = 13/10**, Nocturna de Santa Fe: cabeza **4625**, terminación real **625** (tres rutas antiguas).

Se trasladaron **los movimientos de esas rutas**, no las cifras 568/529/625: al leer las casillas de la hoja del 20/10 emergió la nueva familia 697/796. Los testigos físicos de la nueva familia incluyeron:

- **796**: Santiago Previa última cifra **7** → Neuquén Previa última cifra **9** → Neuquén Previa tercera cifra **6**.
- **796**: Santiago Previa última cifra **7** → Neuquén Previa última cifra **9** → Santiago Previa tercera cifra **6**.
- **697**: Santiago Primera primera cifra **6** → Neuquén Previa última cifra **9** → Santiago Previa última cifra **7**, con **cruce entre turnos válido por diagonal**.

Son tres **eventos históricos** que justificaron las raíces, no seis votos por las rutas antiguas. Este ejemplo demuestra la **operatividad geométrica** del protocolo, no una ventaja predictiva certificada; el 20/10 se revisó previamente en el proyecto.

### Integración acotada con Lalo tampoco está demostrada

Una prueba adicional, sin tocar MV1, reordenó solo el conjunto de **diez familias ya admitidas** por Lalo usando raíces auxiliares; comparó Top5:

| Año | Top5 Lalo original | Top5 Lalo reordenado por marcas |
|---|---:|---:|
| 2024 | 11 | 16 |
| 2025 | 17 | 15 |
| 2026 | 21 | 20 |

En 2024, un reranking por **formas históricas aleatorias** también obtuvo 16 aciertos, por lo que no corresponde atribuir la mejora de ese año a raíces ganadoras. No integrar este ordenamiento al motor oficial.

### Decisión

- **Motor Lalo MV1 / producción / APK:** sin cambios.
- **Hoja Santiago–Neuquén:** conservarla como parte real del método del padre para explicar resultados y consultar recorridos compatibles con +11.
- **Memoria de marcas POST:** implementada y trazable por D−1/D−7 en el laboratorio, sin confundir rutas con eventos independientes.
- **Lector de traslado ganador:** conservar **como hipótesis experimental**, NO incorporarlo al Top3/5/6 oficial. Dos años alentadores y un tercero negativo no justifican privilegio predictivo.
- **Siguiente auditoría útil:** contrastar con el cuaderno del padre el **tipo de traslado geométrico realmente utilizado** y mantener cortes sellados posteriores, comparando contra controles físicos de igual tamaño. Nada de optimizar pesos para acomodar el acierto del 20/10.

### Referencias reproducibles

- Código de marcas y traslado: \`src/auxWinningMemory.ts\`
- Suite sintética de no fuga y contactos: \`scripts/lab-aux-memoria-test.ts\`
- Estudio cronológico: \`scripts/lab-aux-memoria-marcas-2026.ts\` (variable \`LAB_YEAR=2024|2025|2026\`)
- Comparaciones pareadas por jornada: \`scripts/lab-aux-memoria-estadistica.ts\`
- Auditoría combinada de 2025/2026: \`scripts/lab-aux-memoria-bienio.ts\`
- [Ejecución final aprobada, incluyendo 2024](https://github.com/y0t3/Modelo-Papa/actions/runs/39648132239).
