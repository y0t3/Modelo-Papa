# Modelo Lalo +11 — Estudio de las 42 discontinuidades VT3
**Auditoría histórica · 25 de octubre de 2026 · Rama experimental, sin modificaciones en MV1 ni APK.**

## Pregunta
En el histórico hasta el 24/10, 42 cabezas tenían su VT3 exacto físicamente
dibujable en una fuente de la hoja PRE, pero no reproducían la mutación
estricta de una casilla respecto de una cabeza ganadora de las seis
jornadas previas. ¿Sus cambios de posición, columna o secuencia
discriminan familias mejor que elegir al azar entre familias
igualmente formables?

## Protocolos
- **124 jornadas y 620 cortes PRE**, junio–24/10; 3.321 cabezas
  comprobadas, sin incorporar datos del turno objetivo a la selección.
- Recorrido VT3 dentro de una fuente, roce continuo (incluye diagonales),
  sin saltos ni cruce de columnas, VT3 madre y valor de la cabeza exacto.
- Raíces: solamente trazos que explicaron cabezas reales de las últimas
  **seis jornadas completas**. Montevideo se comprueba como resultado,
  no es fuente para generar la hoja principal +11.
- Se enumeran **todas** las familias físicas fuera del motor y
  del cambio estricto de 2 casillas/borde, incluso las no ganadoras.
- Con los rasgos históricos se elige a lo sumo **una** familia, que
  sustituye #10 del ranking MV1 o ocupa un puesto libre, jamás supera
  diez candidatos. VT2, VT3 oficial y VT4 no se modifican.
- Se comparan seleccionadas con **12.000 aleatorizaciones condicionales**
  al MISMO conjunto elegible y al MISMO cupo, semilla fija 20261026.
- Estadística exploratoria; no está corregida por ensayar varias reglas.

## Exposiciones reales: no confundir los 42 casos con un patrón específico

| Movimiento de una figura | Exposiciones de familia/corte | Cabezas coincidentes | Proporción descriptiva |
| --- | ---: | ---: | ---: |
| Una casilla de posición compartida | 2.001 | 22 | 1,10 % |
| Igual figura en otra columna | 1.163 | 9 | 0,77 % |
| Igual figura en otra ubicación | 781 | 6 | 0,77 % |
| Mismas tres posiciones | 232 | 4 | 1,72 % |
| **Todas las clases, incluida ausencia de raíces** | **4.323** | **42** | **0,97 %** |

**Atención:** exposiciones no son independientes, no son familias
distintas y las clases «mismo recorrido» y «reordenado» se pueden
superponer dentro de una misma familia porque pueden existir varias
rutas físicas. Estas proporciones **no estiman** probabilidad de
acertar un próximo sorteo.

### Por turno (denominador PRE)

| Turno | Exposiciones de familias | Coincidencias reales |
| --- | ---: | ---: |
| Previa | 105 | 1 |
| Primera | 155 | 1 |
| Matutino | 333 | 1 |
| Vespertino | 1.183 | 8 |
| Nocturno | **2.547** | **31** |

Nocturno concentra 31 de 42, pero también 2.547 de las 4.323
exposiciones de candidatas por disponer de más fuentes conocidas.
En Nocturno la proporción descriptiva es 1,22 %; en los otros
cuatro turnos combinados, 0,62 %. Las exposiciones no son
independientes y esta diferencia **no prueba** una ventaja.

## Resultados de selección: un único reemplazo máximo en Top10

| Regla ensayada | Aciertos nuevos | Aciertos perdidos | Promedio aleatorio de aciertos nuevos | P(azar ≥ regla) |
| --- | ---: | ---: | ---: | ---: |
| Priorizar contacto de una casilla | 3 | 1 | 2,65 | 50,7 % |
| Priorizar misma forma en otra fuente | 0 | 0 | 0,51 | 100 % |
| Priorizar misma forma en otro sitio | 1 | 1 | 1,65 | 85,5 % |
| Priorizar mismas tres posiciones | 1 | 0 | 2,10 | 100 % |
| Entre todas las clases | 1 | 1 | 2,55 | 93,1 % |
| Mismas tres posiciones y **mismo orden** | 2 | 0 | **2,00** | 100 % |
| Mismas tres posiciones con **orden diferente** | 0 | 0 | 0,99 | 100 % |

La subclase «mismo orden» apareció en **90 registros** de
familias PRE; «otro orden» en **148**. Se superponen para
familias que disponen de varios recorridos. Ninguna regla mejoró
convincentemente su alternativa aleatoria equivalente. El hecho
de ganar un acierto en un Top10 no acredita poder predictivo.

## Cuatro cabezas con las mismas tres casillas comprobadas

Cada registro fue reconstruido con celdas ordenadas, raíz ganadora
original, fuente y antigüedad en jornadas completas:

1. **17/08 Previa, Santa Fe, 1395 (395):**
   misma tríada `1:0, 0:0, 1:1` de la raíz Ciudad Primera
   **5268 (268)** del 15/08, columna Nocturna anterior;
   lectura de celdas actual `1:1 → 1:0 → 0:0`:
   **orden diferente** (no es la inversa completa).
2. **14/09 Nocturno, Córdoba, 0618 (618):**
   recorrido físico `3:0 → 2:1 → 2:0` idéntico al que
   explicaba Santa Fe Vespertino **6647 (647)** del 09/09,
   columna Matutino, **cuatro jornadas completas antes**.
   Misma forma, mismo orden, **cifras distintas**.
3. **17/09 Nocturno, Entre Ríos, 6721 (721):**
   las celdas `5:1, 4:0, 4:1` estaban en la raíz
   Provincia Vespertino **2719 (719)** del 14/09,
   columna Matutino, pero la ruta nueva era
   `4:0 → 4:1 → 5:1`: **otro orden de lectura**.
4. **16/10 Nocturno, Santa Fe, 5807 (807):**
   recorrido `0:0 → 1:1 → 2:1` idéntico al que
   explicaba Córdoba Nocturno **7242 (242)** del 12/10,
   columna Vespertino, **cuatro jornadas completas antes**.
   Misma forma, mismo orden, **cifras distintas**.

Dos casos apoyan conceptualmente el seguimiento de **formas y no cifras**;
los otros dos demuestran que compartir casillas no equivale a conservar
la secuencia geométrica. Sin embargo, la memoria de seis jornadas deja
muchos otros recorridos con señales semejantes que NO coincidieron.

## Juicio de investigación
**La discontinuidad de una figura es explicable, pero no discriminativa
con los rasgos y el número de opciones actuales.** Con la muestra
estudiada no aparece una corrección justificada del selector MV1.
No crear más submotores ni abrir más el cupo.

Si se continúa, centrarse en la *secuencia temporal* de los movimientos,
no en una etiqueta aislada: familias PRE con trazo históricamente
activado en 5–6 jornadas, con fuente y sitio, y transiciones
**observadas antes del corte**. Normalizar por familias candidatas y
controlar variación entre turnos. Fijar **una** hipótesis antes de un
nuevo bloque verdaderamente independiente, además de corregir
exploración múltiple.

## Evidencia y reproducción
- [GitHub Actions — clasificación, testigos, azar y regresión](https://github.com/y0t3/Modelo-Papa/actions/runs/40165477814).
- `scripts/lab-mutacion-una-celda-vt3.ts` en esta rama.
- Artefacto Actions `lalo-vt3-discontinuidades-42`.
- Datos: `discontinuidades.json`,
  `discontinuidades-por-corte.json`,
  `mismas-tres-celdas.json`,
  `familias-sin-mutacion.json`, `cabezas.json`,
  `control-aleatorio.json`.
