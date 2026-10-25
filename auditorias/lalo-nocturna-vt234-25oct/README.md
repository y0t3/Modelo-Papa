# Laboratorio · Nocturna anterior por jurisdicción (VT2/VT3/VT4)

Fecha de evaluación: 25/10/2026. Rama experimental `lab/lalo-nocturna-vt234-25oct2026`.
**No modifica `main` ni el Modelo Lalo MV1.**

## Qué se comparó
La fuente "Nocturna anterior" de una hoja +11 en dos variantes:
- `PRODUCCION`: último día disponible con algún sorteo Nocturno.
- `NOCTURNA_POR_JUR`: última Nocturna **real** de cada una de las seis jurisdicciones, sin rellenar resultados ni trasladar cabezas de otra jurisdicción.

Todo lo demás, incluidas las raíces históricas D−1/D−7, el motor, recorridos físicos, Top y cortes PRE, permanece constante. VT4 se coteja por cuatro cifras físicas **exactas**, sin invertir la cuaterna.

## Muestra y control
- 124 jornadas evaluables, desde junio hasta el 24/10/2026.
- 620 cortes PRE, 3.321 cabezas de jurisdicción-turno.
- Días en los que la base de una o más jurisdicciones cambia: 22/06, 10/07, 20/07, 26/08 y 13/10.
- Ejecución validada con `test-nocturna-anterior-por-jur.ts`, `test-motor-lalo.ts` y script de comparación; control VT3 reproduce la auditoría original sin discrepancias.

## Resultado consolidado

| Modalidad | Formables producción → por jurisdicción | Reconocidos (cualquier puesto) | Top3 | Top5 | Top10 |
|---|---:|---:|---:|---:|---:|
| VT2 | 2016 → **2027** | 1977 → **1988** | 215 → 215 | 345 → 345 | 651 → **656** |
| VT3 | 852 → **859** | 310 → **311** | 16 → 16 | 35 → 35 | 58 → 58 |
| VT4 | 271 → **274** | 21 → 21 | 0 → 0 | 4 → 4 | 5 → 5 |

Cotejo individual VT2 Top10: 11 cabezas entraron y 6 salieron (saldo +5); Top3 y Top5 no cambiaron en total. VT3 y VT4 no cambiaron Top3/5/10. No hubo pérdida de formabilidad física en los casos cambiados.

Valores de referencia **solo descriptivos** por terminaciones propuestas (no significancia causal ni beneficio económico):
- VT2 Top10: 651 → 656 observados vs 635,64 → 637,60 esperados por uniformidad.
- VT3 Top10: 58 → 58 observados vs 63,12 → 63,38 esperados.
- VT4 Top10: 5 → 5 observados vs 5,81 → 5,84 esperados.

## Interpretación
Esta es una **corrección de fidelidad del tablero**: evita usar una Nocturna de otra fecha como si hubiera sido el último sorteo real de todas las jurisdicciones. Recupera cobertura física en las tres modalidades, particularmente en feriados y jornadas parciales. El efecto en las primeras posiciones es limitado y **no constituye evidencia de mayor capacidad predictiva**. Mantener en laboratorio hasta cotejar más fechas prospectivas.

## Trazabilidad
- Script: `scripts/lab-nocturna-tres-modalidades.ts`.
- Workflow: `.github/workflows/lab-nocturna-vt234.yml`.
- Ejecución inicial: [GitHub Actions run 40174434152](https://github.com/y0t3/Modelo-Papa/actions/runs/40174434152).
- Resultados extensos (eventos y apuestas reales por corte): artefacto `auditoria-nocturna-vt234-25oct` de esa ejecución.

## Próximo enfoque
Seguir la *formabilidad física* y el ingreso al Top por modalidad con testigos de movimientos válidos, preservando PRE y contrastes por ventanas cronológicas sin ajuste retrospectivo para optimizar casos conocidos.
