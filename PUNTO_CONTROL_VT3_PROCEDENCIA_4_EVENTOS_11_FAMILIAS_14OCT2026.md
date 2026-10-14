# VT3: once familias empatadas desde seis huellas de cuatro cabezas ganadoras

**Punto de control — 14/10/2026.**
Rama: `lab-vt3-prioridad-d7-contra-d1-14oct2026`. Se reconstruyeron las 11 procedencias físicas únicamente con el INPUT/PRE anterior al turno Nocturno del 13/10; después se confrontaron con las cinco cabezas publicadas. **Estudio retrospectivo, no prueba prospectiva**. No se alteraron el motor, `main` ni la app.

## Resultado: distinguir las tres unidades

- **11 familias VT3 actuales** empatadas exactamente entre los rangos #10 y #20 de una ordenación alternativa que antepone D−7 a D−1, conservando bifurcaciones, fuentes y bloques.
- **4 cabezas ganadoras antiguas independientes** del 06/10. Son cuatro eventos, no once.
- **6 recorridos ganadores antiguos físicamente distintos**, porque la cabeza `9226` aporta dos rutas y `9476` aporta otras dos; `5196` y `0508` aportan una cada una.
- Cada nueva familia de esta cohorte tiene una transferencia propia verificable, con fuente de origen conservada y movimiento de celdas adyacentes. Una misma raíz física antigua puede producir **distintas familias numéricas** en varias posiciones del tablero actual.

| Antecedente real D−7 (06/10) | Evento | Huellas antiguas VT3 independientes (geometría) | Familias producidas en este empate |
|---|---|---:|---|
| `9226` | Vespertina · Ciudad | **2** | `234/432`, `268/862`, `324/423`, `439/934`, `768/867` |
| `0508` | Matutina · Ciudad | **1** | `619/916`, `669/966` |
| `5196` | Nocturna · Ciudad | **1** | `428/824`, `435/534` |
| `9476` | Nocturna · Santa Fe | **2** | `037/730`, `548/845` |
| **Total** | **4 cabezas** | **6 huellas** | **11 familias/candidatas** |

Cada evento fue extraído de los `sheet.matches` del histórico D−7, no atribuido por similitud numérica de las ternas.

## El par de control más estricto: 234/432 vs 768/867

Las dos salen **de la misma cabeza antigua `9226`, de la misma terna antigua `226` y de las mismas tres casillas antiguas**:

`3:0 → 4:0 → 3:1` de la fuente **Matutino**, en la hoja del 06/10.

Se conserva el recorrido físico, con los mismos movimientos `(+1,0), (-1,+1)`.

| Candidata nueva | Celdas del tablero actual (fuente Matutino) | Traslado vertical del recorrido | Resultado |
|---|---|---|---|
| **`234/432`** | `2:0 → 3:0 → 2:1` | **−1 fila** | `1234` salió en Provincia, Nocturna |
| `768/867` | `0:0 → 1:0 → 0:1` | **−3 filas** | No apareció entre las cinco cabezas |

Incluso limitarse a la cabeza ganadora `9226` da **cinco candidatas dentro del empate**, y limitarse **a la misma huella antigua exacta** deja **dos**. El recorrido por sí solo no eligió una de las dos antes del sorteo.

### ¿Sirve elegir el traslado más corto o el de −1 fila?

Tampoco se puede concluir con este ejemplo. Entre las 11 familias empatadas, había **tres traslados de −1 fila**: `234/432`, `324/423`, `619/916`. Sólo la primera se observó como cabeza ganadora, hecho que conocemos al diseñar la hipótesis. Había además desplazamientos cero y otros valores, todos físicamente válidos. Favorecer retrospectivamente −1 introduciría sobreajuste; medirlo requiere todos los cortes **antes** de conocer resultados.

### ¿El número de recorridos actuales separaba al ganador?

No: `234/432` tenía dos recorridos físicos (uno trasladado, uno bifurcado), exactamente como varias compañeras, mientras `268/862` y `669/966` tenían tres recorridos físicos en total. Tener más rutas no seleccionó la ganadora en este turno. Tampoco debe atribuirse respaldo de la fuente `Primera` de una familia a la fuente `Matutino` si su raíz geométrica real sólo existe allí.

## Comparación realizada

El inventario **sólo PRE reconstruido** incluye para cada familia su fuente, coordenadas anteriores y actuales, orientación de las celdas, secuencia de movimientos, evento histórico completo y cantidad de filas trasladadas. La comparación POST posterior confirma **1 de las 11 familias** en las cinco cabezas de la Nocturna: `234/432`, terminación VT3 de la cabeza `1234`. Los otros diez miembros del empate fueron negativos en ese turno. No hay que interpretar la proporción retrospectiva 1/11 como una probabilidad predictiva.

Los archivos de la rama son:

- `PROTOCOLO_VT3_PROCEDENCIA_EMPATE_13OCT2026.md`.
- `scripts/lab-vt3-procedencia-empate.mjs`: código reproducible de la extracción geométrica.
- `auditorias/vt3-procedencia-empate-13oct2026/INVENTARIO_PRE_RECONSTRUIDO.json`: contiene todas las 11 familias y 11 proyecciones directas de raíces históricas.
- `auditorias/vt3-procedencia-empate-13oct2026/COTEJO_POST.json`: separa la única terna observada de diez controles no ganadores.

**Estatus de ejecución**: el inventario y el cotejo se computaron directamente con los archivos obtenidos de GitHub y quedaron versionados. El script reproducible se añadió para ejecutarlo en un entorno Node; **no hay GitHub Action ejecutada para este nuevo script** ni corrida completada de los 115 cortes del laboratorio D−7/D−1 anteriormente preparado. No reivindicar ejecución o sellos no existentes.

## Decisión investigativa

El origen histórico del empate **sí** puede colapsarse sin perder las huellas: 11 familias → 6 formas antiguas → 4 eventos ganadores. Es una mejora en **explicabilidad y control de evidencia repetida**, no un nuevo criterio predictivo demostrado. El siguiente ensayo verdadero debe congelar una sola regla que evalúe apoyo por evento, geometría y desplazamiento, y contrastarla con negativos equivalentes sobre fechas todavía no conocidas y sobre suficientes turnos.

**No modificar Top3, Top10, VT4 ni las familias madre por este único caso.**
