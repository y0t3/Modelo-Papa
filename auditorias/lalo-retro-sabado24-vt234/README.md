# Replay histórico sellado en GitHub — sábado 24/10/2026 (VT2, VT3, VT4)

**Tipo:** reconstrucción RETROSPECTIVA con corte cronológico, realizada el **domingo 25/10**. **NO es un sellado prospectivo anterior al sorteo**. El ensayo no debe compararse como evidencia fuera de muestra con el sellado real del lunes 26/10.

## Cómo se reconstruyó la jornada

El programa reconstruye cinco fotografías PRE distintas de la hoja +11:
- **Previa:** solo columnas de la última Nocturna real del 23/10.
- **Primera:** columna anterior + resultados efectivamente publicados de Previa.
- **Matutino:** suma Primera.
- **Vespertino:** suma Matutino.
- **Nocturno:** suma Vespertino.

En cada corte, se crea una hoja nueva cuyas cabezas objetivo y posteriores están **vacías**; el motor MV1 y el seguimiento de figuras solamente reciben esa hoja, las seis jornadas previas y las raíces históricas válidas. Recién en otra ejecución POST se vuelven a consultar los resultados del sábado para medir aciertos.

No se inventan turnos Montevideo: **el sábado solo se cuenta su Nocturno**. El total POST contrastado es de **26 cabezas**: cinco por cada turno argentino y una de Montevideo en Nocturno.

Memoria geométrica: jornadas 17, 19, 20, 21, 22 y 23/10; raíces históricas D−1 = **23/10** y D−7 = **17/10**. Las seis filas de Nocturna base del sábado se recuperaron del viernes 23/10, individualmente por jurisdicción.

## Selecciones Top3 que dejaba cada corte (familias)

| Turno | VT2 Lalo | VT3 Lalo | VT3 pulso | VT4 Lalo |
|---|---|---|---|---|
| Previa | `03/30 · 02/20 · 29/92` | `023/320 · 303/303 · 203/302` | `023/320 · 092/290 · 303/303` | `3023/3320 · 9303 · 9203/9302` |
| Primera | `03/30 · 13/31 · 02/20` | `023/320 · 303/303 · 203/302` | `023/320 · 092/290 · 303/303` | `3023/3320 · 9303 · 9203/9302` |
| Matutino | `03/30 · 38/83 · 13/31` | `488/884 · 023/320 · 303/303` | `488/884 · 023/320 · 048/840` | `0488/0884 · 3023/3320 · 9303` |
| Vespertino | `03/30 · 23/32 · 39/93` | `203/302 · 488/884 · 023/320` | `488/884 · 023/320 · 048/840` | `3203/3302 · 0488/0884 · 3023/3320` |
| Nocturno | `03/30 · 23/32 · 39/93` | `203/302 · 488/884 · 023/320` | `488/884 · 023/320 · 048/840` | `3203/3302 · 0488/0884 · 3023/3320` |

**Detalle completo:** `retro-pre-24oct.json`, que guarda para cada turno **todos los Top10 VT2/VT3/VT4**, la nueva lista VT3-pulso, fuente física de cada candidato, dígitos exactos permitidos de VT4, madres VT3, fuentes y todas las celdas +11 conocidas por ese corte.

## Resultados de la jornada publicados

| Turno | Ciudad | Provincia | Córdoba | Santa Fé | Entre Ríos | Montevideo |
|---|---|---|---|---|---|---|
| Previa | 6531 | 3520 | 2947 | 6659 | 1682 | — |
| Primera | 7249 | 9379 | 1573 | 7777 | 7652 | — |
| Matutino | 9321 | 9019 | 0728 | 9365 | 9452 | — |
| Vespertino | 7949 | 5693 | 7223 | 7821 | 7260 | — |
| Nocturno | 0795 | 8014 | 5739 | 6614 | 2065 | 0439 |

### Aciertos de cabezas por terminación / familia

| Modalidad | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| VT2 del motor Lalo | **5** | 5 | **6** |
| VT3 Lalo | 0 | 0 | 0 |
| VT3 pulso | 0 | 0 | 0 |
| VT4 Lalo | 0 | 0 | 0 |

Los **6** aciertos VT2 Top10 (cinco ya dentro del Top3) fueron:

| Turno | Jurisdicción | Cabeza | Familia VT2 | Ranking |
|---|---|---|---|---:|
| Previa | Ciudad | 6531 | `13/31` | 7 |
| Previa | Provincia | 3520 | `02/20` | 2 |
| Vespertino | Provincia | 5693 | `39/93` | 3 |
| Vespertino | Córdoba | 7223 | `23/32` | 2 |
| Nocturno | Córdoba | 5739 | `39/93` | 3 |
| Nocturno | Montevideo | 0439 | `39/93` | 3 |

No hay aciertos en Matutino ni Primera dentro del Top10 de ninguna modalidad.

### Diagnóstico: capacidad geométrica vs selección de Top10

Buscando **todos** los recorridos físicos posibles de 2, 3 y 4 celdas en las columnas realmente disponibles antes de cada turno, sin importar los Tops:

| Modalidad | Cabezas formables físicamente (26 cabezas) | De ellas, en Top10 | Formables pero fuera de Top10 |
|---|---:|---:|---:|
| VT2 | 17 | 6 | 11 |
| VT3 | **5** | 0 | **5** |
| VT4 | **2** | 0 | **2** |

Los cinco VT3 físicamente posibles pero ausentes de Top10:
- **Primera:** Provincia `9379` (terminación 379); Córdoba `1573` (573).
- **Matutino:** Ciudad `9321` (321).
- **Vespertino:** Provincia `5693` (693).
- **Nocturno:** Córdoba `5739` (739).

Los **dos VT4** físicamente posibles pero fuera de Top10 son Córdoba Primera `1573` y Córdoba Nocturno `5739` (ambos tienen recorridos válidos de cuatro cifras en su columna). **Formable** no equivale a madre VT3 reconocida ni a candidatura seleccionada.

Estos datos están guardados por cabeza y turno en `auditoria-fisica-24oct.json`.

## VT2 y VT4 frente a reactivación

La hipótesis `PULSO_TOP10` se definió y ensayó **solo para reordenar las mismas familias VT3**, nunca para introducir una madre nueva. **La selección y el orden VT2 y VT4 son exactamente los del motor actual**.

- VT2 tiene raíces de dos celdas y derivaciones de madres VT3, pero no recibe el orden pulso experimental mediante un simple reordenamiento externo de VT3.
- VT4 sigue la regla de una cifra **antepuesta** a la madre VT3; no se permite invertir toda una cuaterna para inventar una madre no reconocida. Un acierto VT4 necesita cabeza de cuatro cifras completa igual al `physicalValues` de un recorrido realmente válido de la lista.
- Las modalidades se contabilizan **separadamente**: una misma cabeza puede coincidir en VT2 y VT3 o VT4, sin atribuir éxito predictivo múltiple al motor.

Para investigar reactivación en VT2/VT4 haría falta una **nueva hipótesis física y una prueba controlada independiente**, no trasladar a ciegas los 22 aciertos históricos de VT3.

## Reproducibilidad y respaldo

- [Corrida GitHub Actions #40185068765](https://github.com/y0t3/Modelo-Papa/actions/runs/40185068765) — ambas fases PRE simulada/POST y regresiones MV1 aprobadas.
- `scripts/lab-retro-pre-24oct-vt234.ts` reconstruye exclusivamente los conocimientos válidos antes de cada turno.
- `scripts/lab-retro-post-24oct-vt234.ts` compara cabezas solo después, sin reordenar candidatos.
- `auditorias/lalo-retro-sabado24-vt234/retro-pre-24oct.json` y `retro-post-24oct.json` se comprometieron como archivos versionados en GitHub, independientes del artefacto de Actions.
- `auditorias/lalo-retro-sabado24-vt234/auditoria-fisica-24oct.json` conserva la auditoría de caminos físicamente posibles con reglas de adyacencia estricta.

**Decisión:** la jornada del sábado muestra cobertura VT2 y un problema de selección VT3/VT4, pero **no valida** el pulso geométrico, que no convirtió candidatos en aciertos. No modificar motor MV1 ni APK. No utilizar este ensayo histórico como predicción previa autenticada ni como evidencia de ventaja estadística.
