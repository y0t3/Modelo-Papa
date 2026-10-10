# Punto de control — primer cotejo REAL contra foto PRE del 10/10/2026

**Se ejecutó y se verificó satisfactoriamente** la auditoría posterior: https://github.com/y0t3/Modelo-Papa/actions/runs/38056745025

**Artefacto íntegro con HTML visual + foto original + informe + JSON de todos los recorridos y negativos:** https://github.com/y0t3/Modelo-Papa/actions/runs/38056745025/artifacts/11671512616

## Fuente previa sin alterar
- Foto del tablero PRE capturada sábado 10/10 a las **09:04:33.017 ART**: https://github.com/y0t3/Modelo-Papa/actions/runs/38050639551
- SHA256 de la foto fuente: `19d3357c82e59dbf5050ed7941f160b7e4c04a1a0875fb5e25de9147a245ea4b`. Confirmado por Actions después del sorteo.
- Previa, una sola columna: `prevNocturno`; 11 trazos históricos anotados D−1 (09/10) y 15 anotados D−7 (03/10); cero cabezas objetivo, cero selecciones humanas y cero cifras elegidas.
- El fichero PRE no se modifica con los resultados; copia idéntica incluida en el archivo POST.

## Resultados obtenidos de la fuente el 10/10 alrededor de 10:42 ART

| Cabeza de Previa | Número |
|---|---|
| Ciudad | 0956 |
| Provincia | 2540 |
| Córdoba | 6182 |
| Santa Fé | 9507 |
| Entre Ríos | 0061 |
| Montevideo | ---- (no publicado en esta consulta) |

**Cobertura 5/6 de Previa.** Los resultados de Primera, Matutino, Vespertino, Nocturno aún figuraban como `----` para todas las jurisdicciones **en esa consulta**. No podemos presentar una hoja completa del sábado como si sus resultados ya hubieran sido obtenidos; el HTML POST es parcial y lo aclara.

## Balance de TODAS las figuras físicas antiguas, sin contar inversiones ni cabezas repetidas como nuevas figuras

| Memoria | VT2 (total / compatible) | VT3 (total / compatible) | VT4 |
|---|---:|---:|---:|
| D−1 | 8 / 1 | 1 / 0 | 0 |
| D−7 | 10 / 0 | 2 / 0 | 0 |
| Unión D−1+D−7 | 14 / 1 | 3 / 0 | 0 |
| Intersección (misma geometría presente en ambas) | 4 / 0 | 0 / 0 | 0 |
| Control neutro **todos** los dibujos posibles sobre esta columna | 26 / 3 | 92 / 0 | 268 / 0 |

Son **17 dibujos únicos** en la unión, con 1 coincidencia de VT2 entre las 5 cabezas disponibles. Todas las otras 16 son por el momento **indeterminadas** por faltar Montevideo; no marcarlas como negativas seguras.

### La única figura física antigua compatible, con toda su procedencia

- **Cabeza antigua:** `7148`, **09/10 Vespertino de Entre Ríos**.
- **Origen de la marca vieja:** VT2 `48`, en la fuente `prevNocturno`, celdas `4:1→4:0` (fila 5 si contamos desde 1). Se conserva ese sentido antiguo.
- **Relectura de esa misma figura en el tablero 10/10 PRE:** `56` (el sentido opuesto lee `65`). El par completo en la quinta fila del +11 de Nocturna anterior es `65`.
- **Cabeza real de Previa 10/10 Ciudad:** `0956`, terminación **56**, coincide con la lectura directa de la marca histórica `4:1→4:0`.
- No fue una hipótesis elegida ni una predicción de `56` previa al sorteo. Fue una entre nueve figuras antiguas únicas D−1 y 17 figuras únicas de la unión. Se detectó al comprobar **todas** las alternativas conociendo `0956`.

Como control, de las **26 figuras VT2 posibles** por contacto físico en esa misma columna (no solamente las antiguamente marcadas) **3** son compatibles con alguna de las cinco cabezas publicadas. No demuestra ventaja diferencial de las huellas antiguas, y es una sola observación, sin elección previa.

## Próximas pruebas

1. Completar **Montevideo de Previa** cuando la fuente lo publique. Entonces se podrán clasificar las 16 figuras que hoy están indeterminadas sin falsear negativos.
2. Obtener las seis cabezas de los turnos posteriores cuando efectivamente salgan y reconstruir la hoja diaria **RETROSPECTIVA** con todas las marcas VT2/VT3/VT4 y cabezas completas, en la que se tocan las cabezas para iluminar todos los recorridos.
3. Registrar un recorrido u observación **ANTES de un sorteo futuro**, con lectura seleccionada y abstención posible, mediante evidencia de fecha/hora externa. **Solo así** se podrá evaluar un pronóstico humano, y no coincidencias retrospectivas.

Código y protocolo exclusivamente en rama `auditoria-sorteo-10oct-2026`. **No se tocó** `main`, motor, selector, APK oficial ni la rama del rediseño.