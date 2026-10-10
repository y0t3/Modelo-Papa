# Punto de control — Primera 10/10/2026 cotejada contra fotografía REAL de las 10:53

**Auditoría POST ejecutada y verificada:** https://github.com/y0t3/Modelo-Papa/actions/runs/38063967938

**Paquete completo, con tablero interactivo, JSON de todos los positivos y negativos, foto PRE original y hoja POST limitada a Primera:** https://github.com/y0t3/Modelo-Papa/actions/runs/38063967938/artifacts/11674220619

**Fuente original intocada**: https://github.com/y0t3/Modelo-Papa/actions/runs/38057490657 (capturada **10:53:58.999 ART**), SHA256 `99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9` confirmado. Tablero +11 de SOLO `prevNocturno` y `Previa`; **25** anotaciones D−1 y **29** D−7; **35** figuras físicas únicas, de las cuales **siete** presentes en ambas memorias. **Cero cabezas de Primera en la foto PRE, cero predicciones humanas y cero lecturas elegidas.**

## Resultados Primera efectivamente disponibles en la consulta posterior, 12:31 ART (10/10/2026)

| Jurisdicción | Cabeza | VT2 | VT3 |
|---|---:|---:|---:|
| Ciudad | **8393** | 93 | 393 |
| Provincia | **4650** | 50 | 650 |
| Córdoba | **9656** | 56 | 656 |
| Santa Fé | **2211** | 11 | 211 |
| Entre Ríos | **2473** | 73 | 473 |
| Montevideo | **----** | — | — |

**5/6** resultados. Por la ausencia de Montevideo, una figura heredada que no coincida con ninguna de estas cinco NO es fracaso definitivo, permanece INDETERMINADA.

## Saldo exhaustivo de huellas antiguas, sin duplicar inversiones

| Origen | VT2 total | VT2 compatibles | VT3 total | VT3 compatibles | VT4 total |
|---|---:|---:|---:|---:|---:|
| D−1 (ayer, 09/10) | 17 | **2** | 5 | 0 | 0 |
| D−7 (03/10) | 16 | **1** | 4 | 0 | 0 |
| Unión sin figuras repetidas | **26** | **2** | **9** | **0** | 0 |
| Misma figura física D−1 ∩ D−7 | 7 | **1** | 0 | 0 | 0 |

Las otras **33** figuras únicas siguen indeterminadas hasta que los seis resultados estén disponibles. Los dos dibujos compatibles proceden exclusivamente de la columna `prevNocturno`, ninguno de la columna nueva `Previa`.

### Recorrido 1 — repetición de `56`, Córdoba 9656

- Huella: **VT2, `prevNocturno`, celdas `4:1→4:0`**, o su inversión `4:0→4:1` (única figura física).
- Antigua cabeza que la había dibujado: **09/10 Entre Ríos, Vespertino, `7148`**, marcando sufijo viejo **48** (origen **D−1**).
- En la foto PRE del 10/10 la misma secuencia ya leía **56** en el sentido `4:1→4:0`.
- Ya había sido una de las **tres** marcas VT2 comprobadas durante **Previa** por Ciudad `0956`; esto era información **conocida antes de Primera**.
- Primera Córdoba termina saliendo **9656**, y la misma figura física vuelve a estar entre las marcas confirmadas de esa cabeza.
- Esto es **reconfirmación descriptiva de un dibujo disponible**, no una selección adelantada por la persona ni un resultado causal de su vecindad.

### Recorrido 2 — `37/73`, Entre Ríos 2473

- Figura **VT2, `prevNocturno`, celdas `0:0→0:1`**; ambos sentidos **37/73**.
- Origen D−1: cabeza **7354**, Nocturno Entre Ríos, que había marcado antes **54**; la misma secuencia invertida hoy leía **73**.
- Origen D−7: cabeza **3610**, Vespertino Santa Fé, que había marcado antes **10**; la relectura de su orientación anterior era **37**.
- Primera Entre Ríos sale **2473**, terminación **73**. Coincide con el sentido marcado desde D−1, pero con la **inversa de la orientación D−7**.
- Es la única figura de las **siete** compartidas entre D−1 y D−7 que coincide con alguno de los cinco resultados conocidos de Primera.

## Control contra TODAS las figuras posibles del tablero antes de Primera

| Conjunto | VT2 total | VT2 compatibles | VT3 total | VT3 compatibles | VT4 compatibles |
|---|---:|---:|---:|---:|---:|
| 35 heredadas únicas | 26 | **2** | 9 | **0** | 0 |
| Todas las físicamente válidas de las dos fuentes | 47 | **7** | 164 | **1** | 0 |

El tablero entero tiene además **468 formas VT4** físicamente posibles, ninguna de las cuales coincide con las cabezas publicadas. La figura VT3 compatible que encontró el control completo, **473** de Entre Ríos 2473, **NO** estaba entre las nueve VT3 heredadas. Así se evita presentar como «anticipado» un trazo que solo se encontró después.

La reconstrucción POST confirmó **ocho trazos físicos anotados**: 1 de Ciudad 8393 (VT2 93), 4 de Córdoba 9656 (VT2 56), y 3 de Entre Ríos 2473 (1 VT3 473 + 2 VT2 73). **Ninguno** equivale a una predicción humana tomada antes.

De las dos figuras heredadas compatibles, una ya compartía dos celdas con una marca conocida de Previa, y la otra no tenía contacto con esas marcas; esto tampoco justifica una regla nueva.

## Lectura y límites

- **No hay evidencia de enriquecimiento en esta muestra**: entre 26 VT2 heredadas, 2 compatibles, frente a 7 de las 47 rutas VT2 físicamente posibles. El control es descriptivo, no una prueba estadística concluyente ni una probabilidad de sorteo.
- Este estudio usa la auténtica foto PRE anterior a Primera. Las cabezas entraron solamente después de verificar hora y SHA256.
- **Montevideo sigue faltando** en la fuente consultada. Las rutas que no coincidieron con las otras cinco conservan estado indeterminado.
- **Cero elecciones humanas antes de Primera**: **cero pronósticos** (no 2 aciertos). La coincidencia repetida 56 y la coincidencia 73/37 son figuras antiguas compatibles encontradas a posteriori al cotejar exhaustivamente las opciones.
- No tocar `main`, APK oficial, selector ni motor. Todo ejecutado en `auditoria-sorteo-10oct-2026`.

**Archivos:** `scripts/run-post-frozen-primera-oct10.cjs`, `.github/workflows/cotejar-primera-sellada-10oct.yml`, `PROTOCOLO_COTEJO_PRIMERA_PRESELLADA_10OCT2026.md`. Pruebas de doble fuente, vecindad, inversión, cobertura y lista negativa aprobadas.