# Laboratorio Modelo Lalo — ganadoras VT3 frente a controles emparejados
**Fecha:** 25/10/2026 · **Estado:** observación experimental, NO modificar MV1.

## Método
- 124 jornadas, 620 cortes PRE, 3.321 cabezas.
- Hojas +11 actual e históricas con última Nocturna **real por jurisdicción**.
- Solo caminos físicamente válidos de tres celdas en la misma columna; se conservan trayectos diferentes y se deduplican sus inversas.
- Se considera familia reversible VT3; las activaciones del pasado salen de cabezas realmente publicadas.
- Se toman las familias físicamente formables **no reconocidas** por el motor y con un antecedente en la misma fuente dentro de las últimas seis jornadas.
- **Control emparejado:** en cada corte con una familia de ese conjunto que acertó, se contrasta su promedio de rasgos con las demás familias no ganadoras del *mismo corte*. Se promedia por corte para evitar que muchas rutas/hits de una misma familia aparenten evidencia independiente.
- **Permutación bilateral:** 4.000 réplicas por período, asignando al azar exactamente el mismo número de ganadoras dentro de los elegibles de cada corte. La prueba descriptiva es POST y no selecciona candidatas.
- Cuatro reglas de selección ya fijadas antes del cotejo (tres nuevas + la del laboratorio previo): mismo respaldo seis días (`MISMA_6`), activación en ≥2 jornadas (`DOS_DIAS`), activación en los dos días más recientes (`RECIENTE_2`), eventos históricos divididos por recorridos actuales (`DENSIDAD`). Solo se sustituye el puesto #10 si hay elegibles. Los nueve primeros no cambian.

## Embudo inalterado
| Etapa | Cabezas |
|---|---:|
| No formables | 2.462 |
| Formables pero no reconocidas | 542 |
| Reconocidas fuera del Top10 | 258 |
| Top6–10 | 24 |
| Top4–5 | 18 |
| Top1–3 | 17 |
| **Total** | **3.321** |

Top10 oficial experimental con Nocturnas corregidas: **59**.

## Resultados emparejados (ganadora vs no ganadora)
- 192 cortes emparejables, 260 familias ganadoras distintas por corte y 8.970 familias no ganadoras dentro de esos cortes.
- Por corte: activaciones de misma fuente (1,5625 frente a 1,5125), días con actividad (1,4084 frente a 1,3542), activaciones en dos jornadas recientes (0,4019 frente a 0,3970), y antecedentes por recorrido físico (1,0311 frente a 1,0334).
- En las **4.000 permutaciones bilaterales**, las diferencias totales no destacaron:
  - Número de eventos `same6`: fracción de permutaciones tan extremas o más **0,3634**.
  - Número de jornadas `sameDays`: **0,1557**.
  - Activación reciente `recent2`: **0,8918**.
  - Antigüedad de última activación: **0,2682**.
  - Densidad de eventos por camino: **0,9455**.
  - Número de fuentes actuales: **0,6004**.
  - Cantidad de caminos actuales: **0,3379**.
- La diferencia positiva en días activos de agosto-septiembre (0,1068) no se sostuvo en octubre (−0,0607). El análisis es exploratorio, con múltiples reglas ya ensayadas; las fracciones de permutaciones **no** son pruebas confirmatorias.

## Selección PRE, puesto diez únicamente
| Método | Top3 | Top5 | Top10 | Nuevos / desplazados |
|---|---:|---:|---:|---:|
| Lalo corregido | 17 | 35 | 59 | — |
| MISMA_6 | 17 | 35 | **67** | 11 / 3 |
| DOS_DIAS | 17 | 35 | 60 | 4 / 3 |
| RECIENTE_2 | 17 | 35 | 60 | 4 / 3 |
| DENSIDAD | 17 | 35 | **67** | 11 / 3 |

### Control aleatorio condicional de elección (10.000 réplicas)
Mismo corte y número de reemplazos, eligiendo una familia al azar **dentro de la oportunidad elegible de cada método**:

| Método | Aciertos nuevos | Media al azar | Fracción aleatoria ≥ observado |
|---|---:|---:|---:|
| MISMA_6 | 11 | 6,529 | 0,0642 |
| DOS_DIAS | 4 | 6,801 | 0,9178 |
| RECIENTE_2 | 4 | 7,048 | 0,9453 |
| DENSIDAD | 11 | 6,539 | 0,0651 |

En octubre ninguna regla aportó ganancias netas: `MISMA_6` 0, `DOS_DIAS` −1, `RECIENTE_2` −2, `DENSIDAD` 0.

**Señal temporal exploratoria**: `DENSIDAD` subió 7 aciertos netos de Top10 en agosto/septiembre, con una fracción aleatoria de 0,0238 dentro de esa muestra. Esa misma regla no mejoró en octubre; además se ensayaron varias reglas y períodos, por lo que NO valida una ventaja robusta.

## Interpretación
No hay evidencia estable de que las familias VT3 formables ganadoras se distingan por mayor número de activaciones, más días activos, mayor recencia o densidad de respaldos físicos en su mismo corte. El orden `MISMA_6` sigue siendo la mejor hipótesis descriptiva entre las ensayadas, pero no supera de manera suficientemente sólida el azar condicional; `DENSIDAD` iguala los aciertos totales con otra composición de candidatos.

**Decisión:** conservar como laboratorio; no modificar prioridad oficial, VT4, hoja +11, ni MV1. Para cualquier adopción, sellar elecciones PRE en jornadas prospectivas nuevas y evaluar de forma independiente.

## Trazabilidad
- Script: `scripts/lab-vt3-controles-emparejados.ts`.
- Workflow: `.github/workflows/lab-vt3-controles-emparejados.yml`.
- Corrida verificada: [GitHub Actions #40177651160](https://github.com/y0t3/Modelo-Papa/actions/runs/40177651160).
- Artefacto Actions: `labo-vt3-controles-emparejados` con `resumen.json`, `cabezas.json`, `cortes.json` y `emparejados.json`.
