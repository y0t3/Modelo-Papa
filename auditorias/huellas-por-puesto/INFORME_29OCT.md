# Huellas físicas por puesto · VT2 Nocturna
**Auditoría del 29 de octubre de 2026** · Rama experimental `lab/huellas-por-puesto-vt2-nocturna-29oct`.

## Pregunta

¿El puesto #7 de Lalo conserva una **FIGURA** (fuente, orientación, altura, par de casillas) que se activa o traslada de una semana a otra aunque cambie el número leído en esas posiciones?

Esta pregunta es distinta de si las mismas familias VT2 numéricas se repiten. El número solo se usa al final para comprobar qué cabeza real coincidió. **No se busca continuidad numérica.**

## Definiciones físicas

Un puesto del Top10 del motor Lalo es actualmente **una familia reversible con VARIOS recorridos físicos**, no una figura geométrica única. Se enumeran todos sus recorridos VT2 PRE y se deduplican por fuente + conjunto de celdas, sin atender a las cifras.

- **Huella exacta:** fuente y dos casillas concretas, dirección reversible.
- **Configuración:** fuente + tipo de figura (horizontal, vertical, diagonal A/B) + altura superior/central/inferior.
- **Figura predominante:** configuración con más recorridos físicos distintos de ese puesto. Es una etiqueta descriptiva; los empates se resuelven por orden estable alfabético y **NO se interpretan como mejor candidato**.
- **Coincidencia POST:** el sufijo de una cabeza coincide con la familia de ese puesto y es físicamente recorrible por una de sus huellas, permitiendo recorrer la pareja en dirección inversa. Una cabeza cuenta una sola vez, aunque haya múltiples rutas.
- **Comparación D−7:** mismo día de semana, mismo turno, mismo puesto; sin exigir familia numérica compartida.
- **Control de exposición:** comparar la huella del puesto #7 actual contra huellas de **otros nueve puestos** del D−7, no solo contra el mismo #7.

El PRE de Nocturna se reconstruye solo con Nocturna anterior y Previa/Primera/Matutino/Vespertino anteriores al objetivo. Se verifican todas las cifras de los recorridos contra la columna auténtica. Las cabezas de Nocturna objetivo se abren exclusivamente para la evaluación POST.

## Cobertura

118 Nocturnas verificadas de cinco jurisdicciones (sin Montevideo para equiparar los tres períodos), **590 cabezas**: junio–julio 51, agosto–septiembre 52, octubre 12–28 15. Se obtuvieron **98 pares D−7** disponibles dentro de los tres períodos procesados. No son predicciones ex ante selladas; las columnas fueron reconstruidas retrospectivamente con fuentes históricas.

## ¿Qué ocupó realmente el #7?

- **16 coincidencias de VT2** del #7 en 118 Nocturnas (junio 3, julio 5, agosto 2, septiembre 3, octubre 3), la mayor cantidad del Top10, pero seleccionado para estudiar después de observar la racha.
- El #7 tenía en promedio **3,63 huellas distintas**, distribuidas en **2,24 fuentes** y **3,48 configuraciones distintas** por jornada. Por tanto **no es una única figura repetida con otra cifra**.
- La configuración predominante del #7 se repitió de la semana anterior solo **5/98** veces.
- Cuando la semana anterior el #7 había coincidido, una huella exacta ganadora de D−7 **no volvió a coincidir** en el mismo puesto en la nueva Nocturna: **0 casos** de `sameWinningSite` en 98 pares. Solo hay nueve pares con una coincidencia previa #7, de modo que esa ausencia es descriptiva, no prueba de imposibilidad.
- El promedio de superposición de **sitios exactos** D−7 para #7 fue **2,35 %**, frente al **2,05 %** de comparar ese #7 con los otros puestos de la semana anterior. La superposición de configuraciones fue **5,70 %**, frente al **5,78 %** del control de otros puestos. No hay persistencia singular convincente de la configuración del #7.

## Octubre, donde nació la hipótesis

| Nocturna | Familia que lee #7 | Huellas físicas (n) | Fuentes (n) | Figura predominante en su abanico |
|---|---|---:|---:|---|
| Jueves 22 | 67/76 | 4 | 3 | Previa, diagonal A superior |
| Viernes 23 | 89/98 | 4 | 4 | Matutino, horizontal inferior |
| Lunes 26 | 67/76 | 3 | 3 | Nocturna anterior, horizontal inferior |
| Miércoles 28 | 01/10 | 4 | 4 | Previa, diagonal B central |

La «figura predominante» varía entre las cuatro Nocturnas. **No implica que esa haya sido la ruta elegida por Lalo o que haya formado la cabeza ganadora.** Para 22, 23 y 28 se comprobaron físicamente múltiples rutas del mismo #7 que explican las cabezas de Entre Ríos/Córdoba. El 26/10, la cabeza humana ganadora Montevideo 1876 se corroboró por separado, pero Montevideo está excluido de la tabla estadística comparable de cinco jurisdicciones (por eso el archivo de Nocturna 26 marca `hits: []`).

## Contraste con el motor «Formas Primero VT2»

Fuente independiente: [GitHub Actions 40858316696](https://github.com/y0t3/Modelo-Papa/actions/runs/40858316696), artefactos `Formas-Primero-VT2-jun-jul`, `Formas-Primero-VT2-ago-sep`, `Formas-Primero-VT2-octubre`. Se examinó `cortes-*.json` de las mismas 118 Nocturnas, con dos Tops reconstruidos PRE (Lalo original y Formas Primero).

El **#7 de Formas Primero** coincidió con **15 cabezas** (Lalo original #7: 16), **pero ninguno de esos 15 casos fue la misma cabeza que coincidió con Lalo #7**. Solo tres de las 118 Nocturnas tenían la misma familia en ambos puestos #7.

Esto demuestra que **“puesto #7” es una etiqueta de orden dentro de cada motor, no la identidad de una silueta**. El motor Formas Primero sí elige primero una posición física/figura antes de leer el número, aunque en la auditoría completa de 590 cortes **no superó** la referencia neutral ni al motor Lalo en acumulado. No corresponde declarar un motor ganador mirando su #7.

## Conclusión

**Se confirmó la importancia de cambiar la unidad de seguimiento del estudio:** del número/familia y del simple ordinal del ranking hacia **una huella de casillas real + su movimiento histórico**.

No encontramos que #7 conserve por sí mismo la misma figura de una semana a la siguiente. Su buena actividad en octubre merece seguirse, pero no prueba una preferencia de una silueta fija.

Para respetar el método de Lalo:
1. Tener **figuras individuales como filas del laboratorio**, con una posición (fuente/celdas) y sus antecedentes de movimientos históricos verificados.
2. **Leer los dígitos DESPUÉS** de haber elegido cuáles posiciones mostrar. Si cambia la familia, eso no importa.
3. Cada figura debe mostrar qué marcó realmente en POST, no inferir que ganó por ocupar el mismo puesto o por formar una familia reversible.
4. Cuando la figura tiene varias extensiones VT3, mostrarlas todas sin inventar un orden predictivo; permitir desplegar toda la hoja para no ocultar trazos alternativos.
5. Comparar las **mismas huellas o sus desplazamientos** de una semana a otra con controles de igual cantidad de figuras. Si no existe evidencia distintiva, no forzar uno o dos focos.
6. Mantener los motores MV1, AUX y APK intactos. No se justifican nuevas apuestas ni probabilidades de éxito.

## Reproducción

- `src/labHuellasPorPuesto.ts`: extracción y normalización de huellas exactas y configuraciones **sin cifras**.
- `scripts/test-huellas-por-puesto-vt2.ts`: prueba de invariancia de la figura cuando cambian cifras y coincidencia POST real.
- `scripts/lab-huellas-por-puesto-vt2.ts`: replay cronológico de tres períodos y comparación D−7 por puesto.
- `.github/workflows/lab-huellas-por-puesto-vt2.yml`: tres jobs históricos en paralelo.
- [GitHub Actions 40970546099](https://github.com/y0t3/Modelo-Papa/actions/runs/40970546099), finalizada correctamente, artefactos `huellas-junio-julio`, `huellas-agosto-septiembre` y `huellas-octubre` con todos los puestos, marcas físicas POST y pares D−7.
