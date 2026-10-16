# Laboratorio: memoria de huellas ganadoras verificadas — 265 turnos

**Estado:** completado y reproducido en GitHub Actions · 16/10/2026. **No fusionar con `main` ni modificar la APK 0.3.5.**

## Pregunta
En Geometría completa, las referencias de ayer y de la semana pasada consistían en **todas las figuras físicas posibles** de esas hojas (comprobado mediante sustitución de dígitos históricos: invarianza). ¿Mejora el ranking si en lugar de esas figuras genéricas tomamos SOLO las rutas que explicaron cabezas reales sorteadas y marcadas, según las raíces ya verificadas por Modelo Lalo?

## Protocolo y garantías
- **53 jornadas**, **265 PRE** reconstruidos (15/08–15/10), **1.325 cabezas** argentinas con Montevideo integrado solo como fuente cuando está disponible.
- El objetivo **nunca** está cargado en la hoja PRE que recibe el motor. No cruzar fuentes, no saltar casillas, no retroceder a resultados del propio turno.
- `LaloView.roots` ofrece las raíces realmente verificadas: fecha histórica, turno, jurisdicción, cabeza completa, fuente y recorrido de 3 casillas. D−1 y D−7 conservan únicamente registros anteriores al corte.
- La **forma física** se reconoce igual en sus dos sentidos, sin invertir cifras para crear familias ajenas.
- Una misma cabeza con diez caminos cuenta **una confirmación histórica independiente**, no diez.
- Los candidatos siempre se forman de recorridos físicamente presentes en la hoja actual; dos variantes admiten familias sin raíz propia cuando tienen forma análoga a una raíz anterior, y una variante exige anclaje.
- `src/vt3Shadow.ts` y `src/motorLalo.ts` NO cambiaron. Se comprobó que sus Top3 base reprodujeran exactamente los resultados auditados previamente: agosto-septiembre 1/1 y septiembre-octubre 10/5, respectivamente.
- **Retrospectivo:** estas fechas fueron estudiadas antes y la regla se escribió sabiendo las cabezas. No es una prueba ciega ni prospectiva, y no estima probabilidad de acertar al apostar.

## Estrategias
1. **Lalo oficial:** prioridad VT3 vigente.
2. **Geometría completa:** prioridad F_D1, con referencias a toda figura posible de D−1/D−7 (base sin cambios).
3. **Huellas + desplazamiento:** mismas prioridades básicas de distancia, pero D−1 y D−7 incluyen SOLO rutas históricas VT3 que explicaron resultados.
4. **Huellas + eventos:** primero cantidad de cabezas históricas independientes relacionadas por misma figura/fuente, después distancia.
5. **Solo familias con raíz:** las familias que tienen una figura anclada a huella VT3 real, tres puestos si hay suficientes; si no, no se fabrican.

## Aciertos de familias de tres cifras

| Estrategia | 15/08–14/09 (130 turnos) | 15/09–15/10 (135 turnos) | Total Top3 | Top5 total | Top10 total |
|---|---:|---:|---:|---:|---:|
| Lalo oficial | 1 | 5 | **6** | 16 | 28 |
| Geometría completa | 1 | 10 | **11** | 16 | 28 |
| Huellas + desplazamiento | 0 | 6 | **6** | 8 | 23 |
| Huellas + eventos | 0 | 6 | **6** | 11 | 25 |
| Solo familias con raíz | 0 | 4 | **4** | 8 | 20 |

- **334/1.325** cabezas ganadoras contaban con algún recorrido VT3 físicamente posible en su PRE; tener cobertura física no garantiza ser elegido entre tres.
- En las 212 transiciones intradía, Geometría completa cambió de Top3 en 20; Huellas + desplazamiento en 46; Huellas + eventos en 40; Solo con raíz en 43. Más movilidad no implica más aciertos.
- Una sola ocasión del oficial no presentaba tres familias VT3 admitidas, y una del modo solo raíz tenía menos de tres: se mantuvieron cupos vacíos, no se fabricaron familias.
- Tanto Geometría actual como Lalo oficial empataron con **28 aciertos Top10** a nivel de 265 cortes. La diferencia observada está en el orden de los primeros tres.

## Casos rescatados gracias a huellas verificadas

**Jueves 17/09** — familia **438/834**:
- **Previa de Ciudad:** cabeza **1438**; Huellas + desplazamiento Top1 y Huellas + eventos Top1, Geometría completa Top5, Lalo no admitida.
- **Nocturno de Provincia:** cabeza **0438**, misma familia y día, nuevamente Top1 vs Top5 y no admitida.
- Recorrido elegido hoy en **Nocturna anterior:** casillas **5 izquierda → 6 derecha → 6 izquierda**, lectura **834**.
- Raíz histórica independiente: **miércoles 16/09, Nocturno de Entre Ríos, cabeza 8070**. Huella antigua en la misma fuente: **2 izquierda → 3 derecha → 3 izquierda** (desplazamiento geométrico **3 filas hacia abajo**, sin cruzar columnas).
- Son **dos cabezas en dos turnos, pero una misma familia durante un solo día**. No contarlas como dos señales independientes de memoria.

**Jueves 15/10 — Matutino Provincia 4942**, familia **249/942**:
- **Huellas + eventos Top3**; Lalo **#5**; Geometría completa **fuera de sus Top10**; Huellas + desplazamiento tampoco la puso Top3.
- Ruta física propuesta en la **columna Previa**, lectura **249**; casillas **2 izquierda → 3 derecha → 2 derecha**.
- Dos antecedentes reales e independientes (la misma forma se traslada sin cambiar de fuente): **miércoles 14/10 Vespertino Córdoba 1736** y **miércoles 14/10 Nocturno Provincia 3209**.
- Este caso es valioso como prueba de rastreabilidad, pero la variante por eventos también **perdió** el éxito de Geometría completa en **Nocturno Entre Ríos 6624** (familia 426/624) de ese mismo día.

## Pérdidas de cobertura de Top3
Respecto de Geometría actual:
- Huellas + desplazamiento rescata **2 exposiciones ganadoras** (misma familia 438/834 del 17/09) pero deja fuera **7** que la original sí encontraba.
- Huellas + eventos rescata **3** (las dos del 17/09 + 4942 del 15/10), pero pierde **8**.
- Solo con raíz rescata **2** y pierde **9**.
- Se trata de **exposiciones de cabeza por turno**, repetidas por jornada cuando se mantiene una misma familia. No confundir con descubrimientos independientes.

## Interpretación / decisión
La memoria de **huellas verdaderas** sí permite encontrar y explicar recorridos interesantes, pero **no reemplaza** la ordenación geométrica actual con los parámetros simples usados en este laboratorio. Exigir raíces como filtro tampoco mejora: elimina familias que carecen de raíces anteriores pero tienen formas actuales físicamente válidas.

Por ahora **ninguna estrategia se integra a la APK ni al motor oficial**. La hipótesis útil que queda abierta no es sumar más rutas, ni forzar cambios intradía, sino **distinguir respaldo auténtico por una cabeza real del resto de la geometría al explicar o desempatar familias candidatas**, con reglas fijadas antes de resultados posteriores.

La comparación posterior que tendría sentido debe probar una **intersección mínima y no forzada** entre la jerarquía geométrica actual y huellas ganadoras verificadas, conservando tres familias, evitando usar el propio resultado para escoger cuándo cambiar. Además, contrastar por semanas enteras no recicladas como validación independiente.

## Archivos y trazabilidad
- Workflow completado: https://github.com/y0t3/Modelo-Papa/actions/runs/38852563206
- Script principal de la comparación: `scripts/lab-geo-roots-265.ts`.
- Variantes exclusivamente de laboratorio: `scripts/lab-geo-winning-roots.ts`.
- Artefacto de GitHub Actions: `HUELLAS-GANADORAS-265-CORTES`, JSON detallado `GEOMETRIA_HUELLAS_GANADORAS_265_CORTES.json`, incluye cada cabeza, rango por método, muestra de raíces y recorridos de cada Top3 alternativo.
