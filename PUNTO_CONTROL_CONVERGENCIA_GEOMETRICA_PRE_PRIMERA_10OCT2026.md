# Punto de control: ¿D−1 y D−7 convergen más de lo esperado? — antes de Primera, 10/10/2026

Se ejecutó una prueba nueva **sin resultados de Primera ni posteriores**, exclusivamente con las dos capturas auténticas selladas por GitHub:

- PRE Previa, 09:04:33 ART: https://github.com/y0t3/Modelo-Papa/actions/runs/38050639551 , SHA256 `19d3357c82e59dbf5050ed7941f160b7e4c04a1a0875fb5e25de9147a245ea4b`
- PRE Primera, 10:53:58 ART: https://github.com/y0t3/Modelo-Papa/actions/runs/38057490657 , SHA256 `99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9`

**Protocolo escrito antes del cálculo:** [PROTOCOLO_CONVERGENCIA_GEOMETRICA_D1_D7_PRE_PRIMERA_10OCT.md](PROTOCOLO_CONVERGENCIA_GEOMETRICA_D1_D7_PRE_PRIMERA_10OCT.md). Cada camino cuenta UNA vez, sin duplicar inversos, se restringe a su propia fuente y modalidad VT2/VT3/VT4 y se conserva su procedencia y cabeza antigua. No se eligió candidato ni orientación.

## Resultado del control exacto por geometría

| Fuente | VT | Todos los recorridos físicamente posibles | D−1 | D−7 | Coinciden | Esperado A×B/N |
|---|---|---:|---:|---:|---:|---:|
| Nocturna anterior | VT2 | 26 | 8 | 10 | 4 | 3,077 |
| Nocturna anterior | VT3 | 92 | 1 | 2 | 0 | 0,022 |
| Nocturna anterior | VT4 | 268 | 0 | 0 | 0 | 0 |
| Previa | VT2 | 21 | 9 | 6 | 3 | 2,571 |
| Previa | VT3 | 72 | 4 | 2 | 0 | 0,111 |
| Previa | VT4 | 200 | 0 | 0 | 0 | 0 |

Total exacto: **7 superposiciones físicas** (todas VT2), frente a una expectativa de **5,7812** bajo conjuntos elegidos uniformemente por fuente y largo, con desviación típica **1,6094**. Probabilidad de observar **7 o más** por convolución hipergeométrica exacta **p=0,3226063**. P(X≤7) **0,8595**.

**Interpretación:** no hay un exceso de coincidencias espaciales inusual bajo este control. **NO hay justificación para introducir una regla predictiva «se repite D−1 y D−7, entonces priorizarla».** El p-valor depende de una hipótesis uniforme artificial que NO representa necesariamente cómo se generan las huellas del papá; no prueba la falta de patrones ni la independencia de las figuras.

## Prueba secundaria: contacto con las 3 marcas de Previa ya conocidas antes de Primera

Las tres marcas confirmadas de Ciudad 0956 son VT2 56 dentro de la fuente física `prevNocturno`. Mantener las fuentes independientes es decisivo.

| Fuente y modalidad | Heredadas únicas | Heredadas con 2+ celdas compartidas | Universo de todas las formas | Formas de universo con 2+ compartidas |
|---|---:|---:|---:|---:|
| Nocturna anterior · VT2 | 14 | 1 | 26 | 3 |
| Nocturna anterior · VT3 | 3 | 1 | 92 | 29 |
| Previa · VT2 | 12 | 0 | 21 | 0 |
| Previa · VT3 | 6 | 0 | 72 | 0 |

De las 17 figuras heredadas en Nocturna anterior: **2 comparten al menos dos celdas**, **11 tocan una** y **4 ninguna**. Los otros **18 dibujos** están en la nueva columna Previa y no tienen contacto físico con las marcas de Nocturna anterior. En el total de 35: 2/11/22, respectivamente.

**No hay enriquecimiento geométrico evidente**: por ejemplo, entre las VT2 antiguas 1/14 toca dos celdas, frente a 3/26 formas posibles que lo harían. La VT3 que comparte tramo con una confirmación VT2 NO es una confirmación VT3 ni un pronóstico.

## Resultado de conservación de ambas fotos

Antes de Previa: **17 figuras**. Antes de Primera: **35 figuras**. Las 17 anteriores persistieron SIN CAMBIOS de celdas ni lecturas; las otras 18 aparecen únicamente en la columna nueva. **Siete** de las 35 son exactamente la misma geometría en D−1 y D−7. Estas siete están todas en el informe íntegro, con las cabezas completas que las marcaron.

## Artefactos y reproducibilidad

Se creó un ZIP portable con `index.html` interactivo de doble tablero, informe Markdown, JSON exhaustivo de 35 figuras y negativos, dos archivos PRE originales, sus manifiestos y el script de reproducción `reproducir.py` (Python estándar). Al ejecutarlo de nuevo, reprodujo los mismos valores numéricos y verificó los dos SHA256. **No lee ni consulta ningún resultado de Primera**.

Los archivos quedaron generados en la conversación; para auditoría GitHub, los sellos preexistentes están en los runs de las dos fuentes arriba. El código experimental `main`, APK y motor oficial no se tocaron.

## Próximo paso lógico

Repetir este mismo control con varios pares históricos de semana y comparar en conjunto, siempre evitando elegir a posteriori la geometría o un p-valor atractivo. Para demostrar capacidad predictiva hace falta que una persona elija previamente una orientación o se abstenga, con sello remoto ANTES del sorteo.