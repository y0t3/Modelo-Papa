# Punto de control VT3 — dominio de semana X con Top3/Top5 y examen X+1

**13 de octubre de 2026.** Rama aislada `lab-vt3-dominio-semanal-top3-top5-13oct2026`. Prueba completada correctamente en [GitHub Actions 38382774124](https://github.com/y0t3/Modelo-Papa/actions/runs/38382774124). Ningún cambio a `main`, `src/motorLalo.ts`, hojas físicas, predicciones selladas, app, APK ni VT4.

## 1. Qué pidió el usuario y qué consiguió la prueba

**Objetivo:** enseñarle al motor las cabezas de cada turno de una semana X hasta conseguir que *todas las terminaciones VT3 físicamente formables* de ese corte aparezcan dentro del Top3 (si son 1–3 ganadoras diferentes) o Top5 (si son 4–5); volver a ejecutarlo sobre esa misma semana **sin consultar de nuevo las cabezas**, y sólo entonces trasladar el aprendizaje congelado a X+1 para ver si sirve al VT3 actual.

Implementamos dos mecanismos claramente diferenciados:
- `DOCENTE` observa las cabezas del entrenamiento, verifica que cada familia ganadora tiene **su ruta física propia**, y enseña hasta cinco familias al caso. Las familias cuyas ternas no están en el inventario físico se registran como imposibles.
- `MEMORIA_VERIFICADA` guarda por corte **familias correctas y sus geometrías** en un libro de casos de X, ligado a la huella exacta de cada hoja PRE. Luego el mismo aprendiz reproduce el Top de X sólo leyendo libro+PRE, **sin volver a consultar el POST**. Es **memorización supervisada de los casos conocidos**, no una fórmula autónoma que adivine números no vistos. Esta distinción es crucial.
- `TRANSFERENCIA` X+1: ninguna hoja nueva coincide con una entrada de la memoria de X; entonces el aprendiz **no** recurre a las cabezas memorizadas. Evalúa familias nuevas por semejanza de formas, casillas y fuentes, vectores geométricos y raíces físicas propias de X frente a los ejemplares que ganaron en X. El resultado de X+1 se ve solamente DESPUÉS de construir y fijar las listas Top10.

## 2. Datos y controles físicos

23 fechas históricas, 115 cortes, partición en cuatro semanas calendario lunes-domingo: 14/09 (25), 21/09 (30), 28/09 (30), 05/10 (30). Tres pares de semanas y **85 cortes de entrenamiento**, **90 cortes de examen**. El mismo corpus había sido muy explorado antes, por lo que este experimento cronológico **no es validación prospectiva independiente**.

Fuentes PRE inalteradas: `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`, SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`; `auditorias/vt3-top3-dirigido-115-13oct2026/PRE_115.json`, SHA256 `32319d0c1f0c38908d6a14d964e43907ee75417ca1144bc486ee9cef495f9a67`. El workflow apartó todas las auditorías excepto esas dos fuentes PRE antes de construir fichas. Validó todas las rutas como tres celdas distintas físicamente adyacentes dentro de una única fuente, sin salto, con lectura reversible exacta. Generó `PRE_115.json` y `SELLO.json` firmando hashes de datos, protocolo y código **antes** de restaurar POST.

En POST, para cada semana X se guardó `MEMORIA_SEMANA_*.json` con las lecciones de entrenamiento, se recargó el archivo y se ejecutó la inferencia sobre las **mismas hojas PRE**. Las semanas posteriores se evaluaron sin coincidencia de fecha en la memoria y con todas las listas calculadas antes de consultar los resultados objetivos de esa semana.

## 3. Dominio de la semana X conseguido, aclarando el alcance

| Semana enseñada | Cortes en X | Sin familia ganadora físicamente posible | Con 1–3 familias ganadoras (Top3) | Con 4–5 (Top5) | Cortes físicamente alcanzables REPRODUCIDOS |
|---|---:|---:|---:|---:|---:|
| 15–19/09 | 25 | 6 | 17 | **2** | **19/19** |
| 21–26/09 | 30 | 10 | 19 | **1** | **20/20** |
| 28/09–03/10 | 30 | 9 | 19 | **2** | **21/21** |
| **Total** | **85** | **25** | **55** | **5** | **60/60** |

**Las 110 exposiciones de familias ganadoras VT3 físicamente disponibles en los 85 cortes de entrenamiento quedaron todas dentro del Top3/Top5 correspondiente.** Se comprobaron cinco hojas que necesitaban Top5; la extensión era necesaria y se aplicó correctamente. En las 25 hojas sin coincidencia física no se inventó ninguna.

Ejemplos Top5 con todas las familias físicas ganadoras colocadas por el docente y reproducidas por la memoria:
- **17/09 Nocturno:** 5 familias `464/464`, `438/834`, `127/721`, `417/714`, `476/674` → Top5 completo.
- **18/09 Nocturno:** 4 familias `173/371`, `798/897`, `657/756`, `446/644`; quinta plaza de relleno.
- **25/09 Matutino:** 4 familias `118/811`, `237/732`, `346/643`, `889/988`.
- **28/09 Matutino:** 4 familias `067/760`, `319/913`, `107/701`, `949/949`.
- **28/09 Nocturno:** 4 familias `137/731`, `168/861`, `718/817`, `778/877`.

**Advertencia fundamental:** este 60/60 es un ensayo de **reproducción de memorias de entrenamiento**; X era conocida y se almacenaron sus identificadores ganadores. No debe confundirse con que un sistema matemático aprendió a encontrar de cero esas cabezas. La prueba anterior de puntaje lineal 43 rasgos logró sólo 19/60 de las hojas físicas en X. Aquí mejoramos la reproducción de casos mediante memoria, no la generalización del puntaje.

## 4. Transferencia congelada de X hacia X+1 sin las cabezas del examen

Se evaluaron tres semanas siguientes, **90 cortes idénticos** para todas las variantes. No se utilizó el número de ganadoras de X+1 para decidir si se necesitaba Top5: siempre se archivaron Top3 y Top5 anidados para el examen; la regla de extender a 5 cuando hay cuatro o cinco ganadoras sólo es aplicable dentro de X **porque sus respuestas se conocen**.

| Política de selección de la semana no vista | Top3 /90 | Top5 /90 | Top10 /90 |
|---|---:|---:|---:|
| VT3 oficial | 3 | **6** | **11** |
| `PATRON_GLOBAL`: coincidencia de formas ganadoras de X | 2 | 2 | 2 |
| `PATRON_MISMO_TURNO`: formas de X del mismo turno | 1 | 5 | 6 |
| `CASILLAS_FUENTE`: recorridos exactos propios y misma fuente | 1 | 2 | 4 |
| `VECINO_GEOMETRICO`: casos similares de geometría | 2 | 2 | 5 |
| `VECINO_RESPALDO`: casos similares con raíz propia y ranking | 3 | 3 | 5 |
| **`FUSION_CONSERVADORA`: conservar los dos primeros oficiales y proponer un tercero aprendido, completar Top10 con el resto oficial** | **4** | 5 | **12** |
| `CONTROL_NEGATIVAS`: estudiar formas que NO ganaron en X | 3 | 4 | 5 |

**Hallazgo concreto y aislado de fusión conservadora:** `4/90` en Top3 y `12/90` en Top10, ambos +1 respecto a original. **Un solo corte rescatado sin pérdidas en este corpus**: **21/09 Vespertino**. La candidata recuperada fue **`246/642`**, físicamente posible en su hoja aunque había quedado fuera del Top10 original:
- Top3 oficial: `202/202`, `317/713`, `387/783` (ninguna acierta).
- Top3 conservador: `202/202`, `317/713`, **`246/642`**; la terna extraída correspondió a una cabeza físicamente disponible de esa tarde.
- Cuatro de las cinco terminaciones de ese corte eran **físicamente imposibles** sobre el PRE; la única posibilidad física era `246/642`.
- El Top10 conservador sustituye por `246/642` a la décima familia del original sin modificar las dos primeras.

La variante conservadora mantiene 9/10 familias del original en ese caso y busca una nueva tercera. Sin embargo, **un rescate en sólo 90 cortes, después de múltiples experimentos históricos anteriores, NO constituye evidencia robusta de mejora predictiva**. La función de similitud considera también ejemplos físicos positivos que por azar pueden parecerse a familias que luego no ganan.

Las demás variantes cambiaron muchas posiciones y perdieron cobertura. Un control que aprendió patrones de familias que NO habían ganado en X alcanzó 3/90 Top3, igual al original; ello tampoco indica señal discriminatoria general.

## 5. Qué hay para llevar al motor, y qué no

**Demostrado para auditoría visual:**
- Si un turno tiene 1–3 familias ganadoras físicas, se puede enseñar y reconstruir un Top3 exacto; si tiene 4–5, se extiende a Top5, sin forzar 4 dentro de tres.
- Cada familia se respalda con sus **propios caminos físicos reales**, no raíces prestadas.
- Guardar la memoria de una semana conocida y volver a ejecutar sobre ella **reproduce 100 %** las soluciones posibles. Es una herramienta de explicación/entrenamiento, no de pronóstico.
- Una capa experimental que **no destruya todo el Top10 original** puede incorporar un candidato por semejanza de rutas; en esta muestra concreta la fusión rescató `246/642` sin pérdidas, pero sólo una vez.

**No demostrado:** que el aprendiz haya inferido una ley predictiva del azar de quiniela; que sus rutas similares seleccionen regularmente mejor que VT3; que el +1 sea estable fuera de las semanas utilizadas repetidas veces.

**Decisión:** preservar VT3 oficial y VT4 en espera. Mantener `FUSION_CONSERVADORA` como **observación de laboratorio** y las fichas docentes como capacidad diagnóstica; no promover la nueva elección a producción por un solo caso. Para continuar sin sorteos nuevos, el examen metodológicamente correcto es estudiar los sustitutos aceptados/rechazados de la fusión y contrastarlos con el presupuesto de **un único reemplazo neutral** por corte; no basta compararlos con los modelos que reemplazan todo el Top10.

## Artefactos y autenticidad

- `PROTOCOLO_VT3_DOMINIO_SEMANAL_13OCT2026.md`.
- `scripts/lab-vt3-dominio-semanal.mjs` reproducible, `.github/workflows/lab-vt3-dominio-semanal.yml`.
- `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/PRE_115.json`: fichas y huellas físicas, sin resultados.
- `SELLO.json`: SHA256 de insumos, protocolo, código y PRE.
- `MEMORIA_SEMANA_2026-09-14.json`, `MEMORIA_SEMANA_2026-09-21.json`, `MEMORIA_SEMANA_2026-09-28.json`: memorias **supervisadas**, con resultados pasados expresados en familias, sólo para entrenamiento.
- `POST_115.json`, `RESUMEN.json`: semanas, las 90 listas evaluadas por política, rescates, pérdidas, auditoría de copia.
- [GitHub Actions 38382774124, exitosa](https://github.com/y0t3/Modelo-Papa/actions/runs/38382774124).

**Ningún cambio en producción.**
