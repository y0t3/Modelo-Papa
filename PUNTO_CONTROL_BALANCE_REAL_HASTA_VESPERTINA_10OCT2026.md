# Punto de control — balance del 10/10/2026 hasta Vespertina (cuatro turnos)

Análisis realizado a las ~20:02 ART **DESPUÉS** de publicarse Vespertina, sin usar Nocturna y sin atribuir predicciones a ningún turno. Archivos descargables de la conversación: `balance-hasta-vespertina-10oct-2026.zip` (código `analyze.py`, archivos fuente ZIP, dos JSON originales íntegros, hojas por turno, JSON exhaustivo, informe y visualizador). El informe es autocontenido y reproducible con Python 3 + BeautifulSoup; no depende de consultas nuevas de resultados.

**Fuentes de los resultados:** https://numerosconsuerte.com.ar/quiniela/matutina/resultados-quiniela-matutina/ (sábado 10/10/2026, cinco jurisdicciones argentinas de Previa, Primera, Matutina y Vespertina); https://emailing.tiemposur.com.ar/loterias/quiniela-de-la-ciudad (corrobora Primera Ciudad 8393).

**Integridad probada:** fotos originales de 09:04 Previa (run https://github.com/y0t3/Modelo-Papa/actions/runs/38050639551, SHA256 `19d3357c82e59dbf5050ed7941f160b7e4c04a1a0875fb5e25de9147a245ea4b`) y 10:53 Primera (run https://github.com/y0t3/Modelo-Papa/actions/runs/38057490657, SHA256 `99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9`). **Las 54 anotaciones históricas elegibles de ambos pares de fuentes (25 D−1 + 29 D−7) se recuperaron EXACTAMENTE** de los HTML completos congelados 09/10 (39 marcas) y 03/10 (68 marcas). Se comparó igualdad de cabeza, turno, jurisdicción, celdas, fuente, modalidad, orientación y dígitos reinterpretados sobre la foto antes de Primera.

## Resultados consultados: cabezas completas, cobertura 5/6

| Jurisdicción | Previa | Primera | Matutina | Vespertina |
|---|---:|---:|---:|---:|
| Ciudad | 0956 | 8393 | 6542 | 5185 |
| Provincia | 2540 | 4650 | 5918 | 5415 |
| Córdoba | 6182 | 9656 | 3297 | 9220 |
| Santa Fé | 9507 | 2211 | 9848 | 2584 |
| Entre Ríos | 0061 | 2473 | 5150 | 0720 |
| Montevideo | ---- | ---- | ---- | ---- |

Los cortes de Matutina y Vespertina NO tienen sello horario previo real. Se reconstruyen retrospectivamente con las columnas disponibles de los turnos anteriores y sin incluir las cabezas objetivo en el tablero: Matutina usa `prevNocturno,Previa,Primera`; Vespertina agrega `Matutino`. Los dos primeros cortes son las **fotos PRE originales auténticas**.

## Resultados: huellas heredadas D−1 ∪ D−7 sin repetir inversión

| Turno | Corte | Fuentes disponibles | VT2 compatible/total | VT3 compatible/total | VT4 compatible/total |
|---|---|---:|---:|---:|---:|
| Previa | PRE auténtico | 1 | **1/14** | 0/3 | 0/0 |
| Primera | PRE auténtico | 2 | **2/26** | 0/9 | 0/0 |
| Matutina | Reconstruido posterior | 3 | **2/36** | 0/20 | 0/6 |
| Vespertina | Reconstruido posterior | 4 | **2/42** | 0/24 | 0/6 |

**Importante:** las demás 13, 33, 60 y 70 figuras únicas son *indeterminadas* mientras falte Montevideo, no fallos. No se suman los cuatro numeradores como si fueran pronósticos independientes. Cero decisiones humanas anteriores.

## Control: TODAS las geometrías físicamente válidas del tablero, no solo viejas marcas

| Turno | VT2 compatible/total | VT3 compatible/total | VT4 compatible/total |
|---|---:|---:|---:|
| Previa | 3/26 | 0/92 | 0/268 |
| Primera | 7/47 | 1/164 | 0/468 |
| Matutina | 5/68 | 2/236 | 2/668 |
| Vespertina | 5/89 | 0/308 | 0/868 |

Todas estas formas son opciones físicas, NO anticipaciones. Los numeradores de heredadas no prueban ventaja, por comparación con un universo masivo y acumulación de exposición.

## Figuras heredadas concretas compatibles en Matutina

- VT2 **18/81** · `Previa`, celdas `3:0 ↔ 3:1`, origen D−1 cabeza **7354** (09/10 Nocturno, Entre Ríos, marcaba antes `54`), nuevo sentido confirmado **18** por **Provincia 5918**.
- VT2 **42/24** · `prevNocturno`, celdas `5:0 ↔ 5:1`, origen D−7 cabeza **1211** (03/10 Primera Córdoba), nuevo sentido confirmado **42** por **Ciudad 6542**. La fuente original es el par `42` de Nocturna anterior.

## Figuras heredadas concretas compatibles en Vespertina

- VT2 **20/02** · `Matutino`, celdas `1:0 ↔ 2:0`; origen D−1 antigua cabeza **7148** (09/10 Vespertino Entre Ríos, antes marcaba `48`), resultado posterior de hoy **Córdoba 9220** y **Entre Ríos 0720** (ambas terminan `20`). La antigua orientación marcada se releía hoy como `02`; se cotejó también `20` por ser la INVERSA de la misma figura física, pero **la inversa no estaba previamente elegida como pronóstico**.
- VT2 **51/15** · `Previa`, celdas `1:0 ↔ 1:1`; origen D−7: cabezas antiguas **2592, 7429 y 6129** de 03/10. Hoy coincide con el sentido `15` de **Provincia 5415**. Como el mismo dibujo se anotaba por varias cabezas antiguas, se cuenta UNA figura física.

## Reconfirmaciones dentro de los cuatro turnos

De **21** figuras físicas únicas confirmadas POST, **4** estuvieron asociadas a cabezas confirmadas en dos o más turnos:
- **3 figuras VT2** independientes del mismo valor `56` en `prevNocturno`, para Ciudad `0956` de Previa y Córdoba `9656` de Primera: las rutas `1:0 ↔ 2:0`, `1:1 ↔ 2:0` y `4:1 ↔ 4:0`. Solo una de estas tres también era figura antigua D−1 marcada.
- **1 figura VT2** `4:1 ↔ 4:0` en columna `Primera`, vinculada a **Santa Fé 9848 (Matutina, 48)** y **Santa Fé 2584 (Vespertina, 84)**, misma geometría con lectura inversa. Esta columna no existía antes de Primera, pero sí antes de Matutina/Vespertina.

**Límites decisivos:** ninguna persona escogió cifra/sentido antes de los sorteos; las cinco jurisdicciones disponibles no son cobertura completa; la reconstrucción digital de las hojas viejas sigue sin verificación fotograma a fotograma contra originales de tinta. Cualquier coincidencia es una figura física compatible detectada cotejando TODAS las alternativas, **no un acierto predictivo**. No tocar `main`, motor, selector, APK ni rama de rediseño.

Se mantiene el protocolo separado: `PROTOCOLO_BALANCE_HASTA_VESPERTINA_10OCT2026.md`. No incluye ni interpreta resultados de Nocturna.