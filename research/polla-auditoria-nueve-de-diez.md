# Sistema Polla — auditoría de los 9/10 y posibilidad de identificar el décimo
Fecha: 19/11/2026. Investigación retrospectiva; no hay recomendación de apuesta.

## Datos y versiones
- Reportes originales del laboratorio GitHub Actions [run 44484624790](https://github.com/y0t3/Modelo-Papa/actions/runs/44484624790), generados desde `scripts/experimento-polla-lalo.ts` y `scripts/experimento-polla-aux.ts`.
- Extractos completos: `nfgalindez-aiko/sorteos-ar` commit `f9c26ee968424c0c8c052bc12bec19dea16f1641`.
- Los candidatos de cada fecha se formaron antes de la Nocturna y no pueden contar resultados de días anteriores si recién fueron incorporados.

## Caso 1: AUX diversificado, con cambios, 2–6 noviembre
| Nocturna | Acertados nuevos | Total |
| --- | --- | --- |
| 2/11 | 13 | 1 |
| 3/11 | 49, 24 | 3 |
| 4/11 | 45, 29, 46 | 6 |
| 5/11 | 68, 16, 89 | **9** |
| 6/11 | Ninguno | **9** |

- **El jueves por la noche ya había 9 aciertos asegurados y el viernes quedaba una sola casilla libre**.
- El plan AUX dinámico del 6/11 propuso `27` como décimo: no apareció en esa Nocturna.
- La selección **Integral dos hojas, fija** de esa misma semana, calculada antes del sorteo del lunes, era:
  `13, 31, 47, 74, 06, 60, 14, 41, 36, 63`.
- Allí había al menos dos alternativas utilizables para el viernes: `31` y `36`, distintas de los 9 ya acertados. El 6/11 aparecieron `5131` en el puesto 1 y `3736` en el puesto 20 de Ciudad Nocturna. Fuente secundaria: [extracto 06/11/2026](https://github.com/nfgalindez-aiko/sorteos-ar/blob/f9c26ee968424c0c8c052bc12bec19dea16f1641/data/quiniela/ciudad/2026-11-06.json).
- **Contrafactual verificable**: si, antes de la Nocturna del viernes, se hubiese reemplazado 27 por 31 (o 36), esta tarjeta habría terminado con **10/10**. No se eligió 31 bajo la regla original, por lo que **el resultado real de la simulación sigue siendo 9/10**.
- Una regla *formulada ahora* de 'si llegamos al jueves con nueve, cambiar el último número por el primer candidato todavía no acertado de la lista Integral fija del lunes' habría elegido 31 en esta semana. Sin embargo, esta regla surge de inspeccionar el caso exitoso y no ha superado una prueba independiente. No debe contarse como éxito predictivo validado.

## Caso 2: Integral doble respaldo, fijo, 26–30 octubre
Tarjeta fijada antes del lunes:
`06, 60, 03, 30, 02, 20, 67, 76, 26, 62`.

| Nocturna | Acertados nuevos | Total |
| --- | --- | --- |
| 26/10 | 60, 62 | 2 |
| 27/10 | 30 | 3 |
| 28/10 | 03, 02, 26 | 6 |
| 29/10 | 06, 76 | **8** |
| 30/10 | 20 | **9** |

Único pendiente al finalizar: **67**. El jueves todavía faltaban dos, por lo que no habría existido una alerta de 9/10 antes del viernes para esta jugada.

## Interpretación correcta
1. **Sí se podían detectar los 9 aciertos del primer caso en tiempo real**, tras el sorteo del jueves.
2. **Sí existían candidatos alternativos publicados por otro motor antes de la Nocturna del viernes**, incluido 31 y 36.
3. **No se ha probado una política previa que permita identificar de manera fiable el décimo número**. Escoger tras revisar los resultados es ajuste retrospectivo.
4. Próximo test prospectivo: congelar *antes del lunes* una regla de cambio por acuerdo entre motores, documentar cada sugerencia antes de cada Nocturna y compararla contra AUX sin cambios, AUX dinámico, Integral fijo y azar. Registrar además cuántas veces salta la alerta al llegar a 8 o 9 antes del viernes.
5. Sólo ocho semanas históricas y numerosos métodos estudiados. Sin evidencia de ventaja estadística robusta frente al azar.

No se alteró la app principal ni ningún motor existente.
