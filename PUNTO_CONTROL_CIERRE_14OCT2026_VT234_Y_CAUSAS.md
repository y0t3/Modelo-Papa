# Cierre de la jornada 14/10/2026 — Modelo Lalo VT2 / VT3 / VT4

## Naturaleza de la evidencia

- **PRE prospectivo auténtico**: sólo Previa 14/10, `auditorias/vt3-prospectivo-14oct2026-previa/PRE_14OCT_PREVIA.json`, sellado UTC `2026-10-14T04:13:31.368Z`; controles paralelo de atlas y geometría también fueron sellados antes del sorteo.
- **Otros cuatro cortes**: ranking PRE **reconstruido después de la jornada**, pero en cada corte se ponen a disposición únicamente columnas anteriores al turno objetivo. Es legítimo para diagnosticar causalmente cómo opera el algoritmo con historia conocida, **no** para atribuir aciertos prospectivos ni ajustar los pesos sin validación posterior.
- 24 cabezas principales cotejables: Ciudad, Provincia, Córdoba, Santa Fé y Entre Ríos; Santa Fé Nocturna = `----` por falta de publicación verificable; Montevideo sólo como fuente del tablero (+11), nunca como cabeza objetivo.
- Fuentes: https://sigmadiario.com/quiniela ; https://m.ruta1000.com.ar/index2008.php?FechaAlMinuto=2026_10_14 ; https://quinielanacional1.com.ar/14-10-26 ; https://quinieleando.com.ar/quinielas/buenosaires/resultados-del-14-10-2026.
- PRE retrospectivo comprobado: **se aisló físicamente** el fichero de resultados del 14/10 en /tmp al ejecutar el PRE de Previa; el Top10 reproducido fue **idéntico al sellado auténtico**. El motor oficial, sus scores y su geometría no se modificaron para ejecutar el estudio.

## Resultado de 24 cabezas

| Modalidad | Física antes del turno | Admitida | Top3 | Top5 | Top10 |
| --- | ---: | ---: | ---: | ---: | ---: |
| VT2 | 11/24 | 11 | 2 | 3 | 4 |
| VT3 | 4/24 | 2 | 0 | 0 | 1 |
| VT4 exacta | 1/24 | 0 | 0 | 0 | 0 |

Los conteos son **cabezas**, no ganancia monetaria ni demostración de ventaja sobre azar. Se comparan familias reversibles sólo para VT2/VT3; en VT4 la cabeza debe coincidir con `LaloRoute.value` de su recorrido físico propio. Los aciertos entre modalidades pueden corresponder a la **misma cabeza** y no se suman como sorteos independientes.

## Caso a caso (VT3)

| Sorteo | Cabeza | Familia VT3 | Diagnóstico |
| --- | --- | --- | --- |
| Previa | Ciudad 0081, Provincia 9229, Córdoba 9799, Santa Fé 4065, Entre Ríos 5992 | cinco familias | Ninguna familia tenía recorrido físico en la fuente PRE conocida. **Ningún selector podía acertar sin otra fuente**. Top3/5/10 de los tres PRE genuinos: 0. |
| Vespertina Córdoba | 1736 | 637/736 | Físicamente presente, **rank 17**, fuera de Top10. |
| Vespertina Santa Fé | 0686 | 686/686 | Físicamente presente, no admitida por raíces/ramificación del motor. |
| Nocturna Provincia | 3209 | 209/902 | Físicamente presente, no admitida por el motor. |
| Nocturna Córdoba | 2033 | 033/330 | Presente, **rank 8**, acierto Top10; no Top3/5. |

Los otros 20 resultados no tenían la terna de la cabeza físicamente recorrible sobre las fuentes que correspondían a su turno.

## Investigación específica VT4 · caso 1736

En Vespertina, **1736** tenía un único recorrido físico en fuente `Previa`: `2:0 → 3:0 → 4:1 → 3:1` (coordenadas base 0).

| Tramo 3D necesario de ESE camino | Madre | ¿Está en ranking VT3? | ¿Existe testigo VT3 de ese segmento y fuente Previa? |
| --- | --- | --- | --- |
| Prefijo `173` | `173/371` | NO | NO |
| Sufijo `736` | `637/736` | SÍ, puesto 17 | **NO** (los testigos admitidos de esa madre proceden de otras fuentes, no de la fuente Previa) |

Ablación post-hoc con cupo de **10, 20 y todas las madres VT3 admitidas**:

- Cuaterna 1736 **no admitida en ninguno de los tres cupos**.
- El problema no es exclusivamente el tamaño del Top10 ni tener una madre reconocida en otra columna. Falta un **testigo físico VT3 exacto del tramo y de esa fuente**, condición correcta que preserva la genealogía.
- Aumentar el cupo amplía muchos candidatos VT4: en Vespertina, 94 → 184 → 584 familias VT4, sin rescatar 1736. No modificar el motor oficial con esta estrategia.
- La parte inicial del ranking VT4 permaneció rígida: las mismas tres hijas `0634/3604`, `4063/4360`, `0063/0360` ocuparon Top3 en los cinco turnos de esta reconstrucción. En Top10 hubo cambios en los puestos inferiores.

## Corrección técnica independiente del ranking

En `main`, PR #7: https://github.com/y0t3/Modelo-Papa/pull/7, se corrigió **sólo** `compareMotorLaloAfterDraw` para evaluar VT4 por los `paths[].value` originales de las hijas físicas; anteriormente cotejaba inversas de cuaternas y podía ocultar aciertos. VT2 y VT3 se siguen cotejando por familias reversibles. Tests protectores `scripts/test-cotejo-vt4-exacto.ts`. No se generó APK por ser un cambio de evaluación, no de predicción.

## Prioridades para pruebas futuras (no entrenar con este mismo 14/10)

1. **Física vs selección por turno**: tres denominadores por modalidad: cuántas cabezas fueron dibujables, cuántas fueron admitidas y cuántas entraron en el TopN. Caso 14/10: VT3 4→2→1 en Top10. Seguimiento en nuevos cortes PRE verdaderamente sellados.
2. **VT3 presentes pero no admitidas**: auditar `686/686`, `209/902` sin habilitar por defecto familias de azar; medir éxito/falso positivo si se permitiesen rutas no ancladas en jornadas independientes.
3. **Madre VT3 propia por segmento**: estudiar un indicador de `candidato VT4 físicamente presente, pero padre no admitido en la misma fuente y en el mismo tramo`, sin inventar padres por invertir cuaternas ni compartir testigos entre fuentes. Ejemplo 1736.
4. **Top VT3 y arrastre**: seguir `033/330` entre turnos (puesto 3 Previa, 8 Nocturna; gana a Nocturna) y comparar por qué sale de Top3. La evolución del puesto por sí sola no demuestra señal.
5. **VT4 Top3 casi fijo**: comprobar en prospectivos si familias nuevas generan evidencia genuina o sólo aumentan el número de candidatas; controles de ranking neutro del mismo tamaño.
6. **Pronóstico humano de Lalo**: la app lo guarda **localmente en Android**. No hay un PRE personal de su teléfono en GitHub; no atribuirle pronósticos ni aciertos sin importar sus capturas preservadas.

**Decisión**: mantener intacto el ranking oficial VT2/VT3/VT4. Trabajar sólo en diagnóstico y prospectivas selladas, no reoptimizar eternamente los mismos cortes.
