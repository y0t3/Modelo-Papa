# Punto de control VT3 — auditoría de puestos 9 y 10, empates y persistencia
**13 de octubre de 2026** · rama experimental `lab-vt3-auditoria-puestos-9-10-13oct2026`.

## Ejecución y controles
GitHub Actions [38364579034](https://github.com/y0t3/Modelo-Papa/actions/runs/38364579034) se completó correctamente, con `PRE_115.json` y 2.000 controles aleatorios generados y sellados antes de restaurar `POST_115.json`. El algoritmo reprodujo y **verificó por aserción el orden lexicográfico** en los 115 cortes originales. El protocolo previo está en `PROTOCOLO_VT3_AUDITORIA_PUESTOS_9_10_13OCT2026.md`; script `scripts/lab-vt3-auditoria-puestos.mjs`. No se tocaron motor, main, APK, hoja, Tops sellados ni VT4.

El ranking VT3 original usa `[bifurcación física existe, bifurcaciones (hasta 15), raíces D−1 (hasta 10), raíces D−7 (hasta 10), fuentes propias, bloques propios]`; si toda la tupla es igual, desempata por **orden alfabético de familia reversible**. Los roots históricos son eventos, no cantidad de recorridos del mismo evento.

Se evaluaron 23 jornadas por cinco turnos, **115 cortes**, cada Top10 con diez familias reversibles ancladas. La ganadora se compara en POST y se cuenta una vez por familia×corte; el acierto Top10 es por corte, aunque haya más de una ganadora.

## 1. Resultados reales por posición de ranking
| Rango | Familia ganadora en ese rango, apariciones de 115 | Bloques medios | Bifurcaciones medias | Raíces D−1 medias | Raíces D−7 medias | Familias distintas ocupantes |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 2 | 3,83 | 2,24 | 1,16 | 1,22 | 45 |
| 2 | 3 | 3,54 | 1,87 | 1,05 | 0,96 | 54 |
| 3 | 0 | 3,17 | 1,66 | 0,94 | 0,91 | 62 |
| 4 | 1 | 2,74 | 1,52 | 0,83 | 0,85 | 70 |
| 5 | 4 | 2,68 | 1,41 | 0,89 | 0,64 | 73 |
| 6 | 2 | 2,45 | 1,28 | 0,92 | 0,65 | 73 |
| 7 | 2 | 2,48 | 1,18 | 0,97 | 0,61 | 82 |
| 8 | 3 | 2,37 | 1,12 | 0,81 | 0,60 | 80 |
| **9** | **0** | **2,37** | **1,03** | **0,85** | **0,70** | 80 |
| **10** | **0** | **2,31** | **0,93** | **0,93** | **0,70** | 78 |
| 11 | 1 | 2,27 | 0,84 | 0,87 | 0,75 | 83 |
| 12 | 2 | 2,12 | 0,78 | 0,87 | 0,69 | 80 |
| 13 | 1 | 1,99 | 0,70 | 0,92 | 0,70 | 85 |
| 14 | 0 | 2,01 | 0,68 | 0,84 | 0,69 | 83 |
| 15 | 3 | 1,92 | 0,62 | 0,87 | 0,74 | 83 |

Los puestos 9/10 tienen **mediana de 2 bloques, 1 evento D−1 y 1 evento D−7**, igual que 11/12. La caída física de bifurcaciones es gradual y **no hay un salto estructural evidente** justo entre rangos 10 y 11. También el puesto 3 obtuvo cero coincidencias sin que eso signifique que esté roto.

## 2. Empates de prioridad real
En el mismo corte y mismo conjunto de familias:
- **71/115** cortes tenían exactamente igual prioridad física entre puestos **8 y 9**.
- **59/115** entre **9 y 10**.
- **62/115** entre **10 y 11**.
- **66/115** entre **11 y 12**.

La frontera 10/11 es por tanto **a menudo arbitraria dentro de una igualdad de tuplas**: puede decidirla el desempate alfabético y no una diferencia en raíces, bifurcaciones, fuentes ni bloques. Se archivaron las 62 fronteras empatadas junto a nombres de familias y otras candidatas de la misma clase. Eso **no** demuestra que alguna de las empatadas sea una mejor predicción, sólo señala que la prioridad de datos no la distingue.

## 3. ¿El Top se congela artificialmente en esos puestos?
En **92** transiciones de turno a turno dentro de las mismas 23 jornadas:
- 8 conserva exactamente la misma familia en **27** transiciones.
- 9 conserva exactamente la misma familia en **27**.
- 10 conserva exactamente la misma familia en **26**.
- 11 conserva exactamente la misma familia en **24**.
- 12 conserva exactamente la misma familia en **22**.
- La **pareja ordenada 9/10** permanece igual en **26/92** transiciones; si se la considera conjunto sin orden, también 26/92.

No se observa una inmovilidad anormal específica en los puestos 9/10. La persistencia comparable entre puestos vecinos debilita la hipótesis «ambos no acertaron porque quedaron congelados» tal como estaba formulada.

## 4. Controles contra azar de posiciones vacías
Se reorganizaron **jornadas completas** 20.000 veces, no cabezas sueltas, conservando la estructura por turno y cinco jurisdicciones:

| Posición | Acertó real | Media placebo, jornadas libres | P(placebo ≤ observado) |
|---|---:|---:|---:|
| 8 | 3 | 1,34 | 0,956 |
| **9** | **0** | 0,92 | **0,404** |
| **10** | **0** | 0,70 | **0,484** |
| 11 | 1 | 1,09 | 0,701 |
| 12 | 2 | 0,70 | 0,974 |
| **9 + 10** | **0** | **1,62** | **0,188** |
| 11 + 12 | 3 | 1,78 | 0,890 |

Con permutaciones **entre jornadas del mismo día semanal** la media de 9+10 cae a **1,09**, y `P(placebo ≤ 0)` asciende a **0,282**. Además, **5 de las 22 rotaciones** cronológicas completas dieron cero conjuntamente para esos rangos. Todos son controles exploratorios de un histórico muy reutilizado, pero coinciden en que **cero de los rangos 9/10 no es suficientemente raro** para diagnosticar un defecto predictivo.

## 5. Alternativas de igual cupo selladas ANTES de POST
| Política (10 familias en todas las hojas) | Top3 | Top5 | Top10 | Rescates y pérdidas vs original |
|---|---:|---:|---:|---|
| Original | 5 | 8 | **15/115** | — |
| Conservar primera 8 y reemplazar 9/10 por 11/12 | 5 | 8 | **17/115** | 2/0: 15/09 Previa y 16/09 Matutino |
| Conservar primera 9 y reemplazar 10 por 11 | 5 | 8 | 16/115 | 1/0: 15/09 Previa |
| Conservar primeras 8 y reordenar empates de prioridad por hash fijo | 5 | 8 | 15/115 | 0/0 |

Los dos rescates de 11/12 ocurrieron **sólo en septiembre**; octubre empata al oficial (5/45). No hay prueba de que 11/12 supere a 9/10 en resultados futuros.

**2.000 controles neutrales adicionales**, escogidos PRE antes de los resultados:
- Sustituir sólo décimo puesto por familia elegida uniformemente entre rangos 11..20: Top10 medio **15,908/115**, mediana 16, percentil 95 **18**, máximo 20, **5,45%** llegó a 18 o más.
- Desempatar aleatoriamente familias con tupla idéntica cerca del borde, manteniendo primeros ocho: Top10 medio **15,7315**, mediana 16, percentil 95 **17**, máximo 17. El control por hash fijo no acertó casos adicionales, pero hay permutaciones equivalentes que sí lo hacen.

Estos experimentos están **contaminados por selección previa de hipótesis**: mirar el histórico, notar que 9/10 tuvieron cero y después probar 11/12 no constituye un hallazgo predictivo reproducible. Que la alternativa jamás pierda una coincidencia refleja que se seleccionó precisamente una pareja vacía de aciertos ya conocida. No promover un ajuste de ranking por eso.

## Conclusión operativa
- **La ordenación no tiene un fallo de implementación** en estas 115 hojas.
- **La frontera del Top10 sí es poco discriminante en muchos cortes**, porque 10 y 11 tienen exactamente idéntica evidencia física/histórica 62/115 veces y se separan por el último criterio alfabético.
- **El cero no es extraordinario en un sorteo aleatorio**, y los puestos 9/10 no están más congelados que sus vecinos.
- Una mejora de diseño defendible sería que la app pudiera **señalar familias empatadas con el límite del Top10** (misma clase de respaldo) y mostrar sus recorridos sin presentarlas como equivalentes a un acierto adicional, en lugar de hacer trampa promoviendo ciertas cifras desde el POST.
- No hay base para sustituir permanentemente 9 y 10 ni para ampliar el Top oficial de 10 familias; evitar inflar probabilidades y mantener VT3/VT4 separados.

## Archivos
`auditorias/vt3-auditoria-puestos-115-13oct2026/PRE_115.json`, `RANDOM_PRE.json`, `SELLO.json`, `POST_115.json`, `RESUMEN.json`; `scripts/lab-vt3-auditoria-puestos.mjs`; protocolo y [GitHub Actions 38364579034](https://github.com/y0t3/Modelo-Papa/actions/runs/38364579034).

Todas las cifras provienen de la investigación histórica en GitHub; la rama `main` y los Tops de producción siguen intactos.
