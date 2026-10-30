# Reducción de opciones VT3 sin perder recorridos — Modelo Lalo
Fecha de corte del laboratorio: 30/10/2026  
Rama aislada: `lab/reduccion-vt3-cobertura-30oct`  
Validación: [GitHub Actions #40997436111](https://github.com/y0t3/Modelo-Papa/actions/runs/40997436111) — test de reducción reversible, rutas auxiliares originales, regresión MV1, replay de 16 jornadas / 80 cortes, sin jornada descartada.

## Problema y decisión

El objetivo solicitado es **reducir la cantidad de opciones que hay que observar sin perder muchas candidatas válidas**. El estudio previo encontró 6 extensiones VT3 compartidas por ambas auxiliares que estaban fuera del Top10 auxiliar, incluido 813 de Santa Fe el 29/10. Sin embargo, la doble formación no demostró ventaja pronóstica y 513 también era físicamente posible.

**Por eso se ensayaron dos enfoques muy distintos**:
1. *Recorte por puntuación PRE*: mostrar sólo K=2,3,5,8,10 extensiones físicamente formables por madre VT2. Estudiar pérdida de cobertura sobre resultados POST, sin usarlos para ordenar PRE.
2. *Agrupación visual sin pérdida*: conservar **todas** las extensiones físicamente formables, pero presentarlas agrupadas por las dos orientaciones de lectura posibles de la madre (por ejemplo `_13` y `_31`). Al tocar un dígito, abrir el recorrido real en cada auxiliar, más testigos y Top10, sin mezclar casillas de tableros distintos.

VT2 mantiene su seguimiento independiente en Top10: esta operación **NO lo degrada ni lo transforma en mero padre de VT3**. Las VT3 seleccionadas por sus propios motores también permanecen intactas.

## Datos y controles

Se reconstruyeron los cortes PRE de **16 jornadas completas del 12 al 29/10/2026**, cinco turnos por día (**80 cortes**). El recorte no consulta la cabeza del turno objetivo. Los datos POST se usan solamente para auditar qué extensión exacta explica una cabeza.

Dos cohortes:
- **Lalo estricto**: madres VT2 de Top10 del motor Lalo +11 únicamente. **5.437** observaciones de extensión VT3 físicamente alcanzable al menos en una auxiliar; **23** aciertos de VT3 físicamente alcanzables en esos cortes.
- **Combinada +11**: madres VT2 pertenecientes a algún Top10 de Lalo, Geometría, Conectadas o Formas Primero sobre +11, deduplicadas por familia en un mismo corte. **12.178** observaciones físicas; **44** cabezas cuya VT3 era alcanzable en alguna auxiliar. Los motores no son hojas independientes.

La cohorte combinada tuvo **147 cabezas** cuyo VT2 pertenecía a las madres seleccionadas, de las cuales **44** tenían VT3 físicamente formable en alguna auxiliar y **103** no: estas últimas **NO pueden recuperarse seleccionando mejor extensiones auxiliares**. La cobertura del recorte se mide únicamente sobre las 44 alcanzables. No se cuenta repetidamente una cabeza por múltiples rutas dentro del corte.

Cuatro criterios de selección PRE exploratorios:
- `NEUTRO`: control seudoaleatorio estable por fecha, turno, madre, opción, sin leer resultados, con diez semillas fijas para medir sensibilidad.
- `TESTIGOS`: orden según número de eventos ganadores pasados comprobados en el sitio, pertenencia a ambas auxiliares, inclusión en Top10 VT3 y rutas.
- `RUTAS`: mayor cantidad de recorridos físicos; empates por ambas auxiliares, testigos y valor estable.
- `DIVERSIDAD`: preselección incremental de distintas siluetas geométricas de ejemplo en ambas hojas; desempates con testigos, Tops y cantidad de rutas. Usa **un recorrido representativo** por opción, NO todas sus siluetas; eso limita sus conclusiones.

**No hubo selección de criterio por rendimiento futuro**. Todas las reglas se compararon con los controles de igual número de opciones antes de emitir conclusión. Los controles son una aproximación, no una prueba de aleatorización independiente ni un experimento prospectivo sellado.

## Recortes por K — cohorte combinada

| K por madre | Extensiones mostradas de las 12.178 | Ganadoras conservadas de las 44 alcanzables (`DIVERSIDAD`) | Ganadoras descartadas |
|---|---:|---:|---:|
| 2 | 2.586 (21,2 %) | **11 (25,0 %)** | 33 |
| 3 | 3.873 (31,8 %) | **18 (40,9 %)** | 26 |
| 5 | 6.358 (52,2 %) | **30 (68,2 %)** | 14 |
| 8 | 9.328 (76,6 %) | **36 (81,8 %)** | 8 |
| 10 | 10.575 (86,8 %) | **41 (93,2 %)** | 3 |

Por contexto, con igual presupuesto la selección NEUTRO única de semilla 0 conservó 14,20,29,35,39 respectivamente. Diez semillas del control neutro tuvieron medias 11,4;16,8;27,5;36,8;39,9 aciertos, respectivamente. No hay una diferencia grande, repetible y convincente a favor de diversidad o testigos; además, se probaron varios criterios y K sobre muestra pequeña. No promoverlos a motor oficial.

En Lalo estricto:
- K=3, ruta: **13 de 23** aciertos entre 1.769/5.437 opciones mostradas.
- K=5, diversidad: **17 de 23** aciertos, 2.911/5.437 mostradas.
- K=8, diversidad: **20 de 23** aciertos, 4.234/5.437 mostradas.
- K=10, diversidad: **23 de 23** aciertos, 4.754/5.437 mostradas.

Estos resultados explican el costo de un recorte **real**: para conservar casi todos los aciertos hay que seguir mostrando una gran fracción de las extensiones. Un K=5 perdería un tercio de las oportunidades en la cohorte combinada. No cumple del todo el requisito del usuario.

### Cambios entre las dos ventanas temporales

Cohorte combinada, K=5 por diversidad:
- 12–20/10: **15 de 22** ganadoras físicas conservadas.
- 21–28/10: **13 de 19**.
- 29/10: **2 de 3** a lo largo de los cinco turnos.

La diferencia entre ventanas no revela un régimen temporal claro, y la fecha 29 ya era conocida como caso interesante durante el diseño de esta investigación. **No se considera validación ciega**.

## Compresión de visualización, sin descartes

La clave: cada extensión VT3 `d13` pertenece a la misma **orientación de lectura** `_13`, aunque los caminos físicos individuales estén ubicados en diferentes casillas de Auxiliar Ayer y Hoy. Una madre 13/31 requiere a lo sumo **dos renglones principales**:

- `_13`: los dígitos de prefijo físicamente disponibles, por ejemplo 5→513, 8→813 y otros. Cada valor conserva sus rutas completas, conteos, origen, testigos y posición en Tops.
- `_31`: los dígitos de prefijo que llevan a la orientación 31.

**No se confunde orientación numérica con recorrido físico igual**: las opciones agrupadas **no necesariamente comparten una sola pareja de casillas**. Las minihojas se generan desde los caminos independientes guardados en cada opción.

| Cohorte y período | Extensiones individuales | Renglones agrupados por orientación | Reducción de renglones | Alternativas conservadas |
|---|---:|---:|---:|---:|
| **Combinada, 16 jornadas / 80 cortes** | **12.178** | **2.493** | **79,5 %** | **100 %** |
| Combinada, solo Nocturna | 3.182 | 610 | 80,8 % | 100 % |
| Combinada, 29/10 (5 cortes) | 646 | 130 | 79,9 % | 100 % |
| **Lalo estricto, 80 cortes** | **5.437** | **1.151** | **78,8 %** | **100 %** |
| Lalo estricto, solo Nocturna | 1.273 | 253 | 80,1 % | 100 % |

En cada corte se comprueba que los valores del conjunto de bandas sean exactamente los mismos valores físicamente formables de entrada. **79,5 % menos renglones** es una métrica de interfaz; **no** representa 79,5 % menos cifras, recorridos reales, tiempo garantizado de lectura o capacidad predictiva superior.

## Aprendizaje del caso 29/10: 513 y 813

Para Nocturna Santa Fé 2813, madre +11 `13/31` (Lalo VT2 #7, Geometría VT2 #1), tanto `513` como `813` tenían recorridos físicos en ambos auxiliares; `513` tenía antecedentes exactos en Auxiliar Hoy y VT3 #4 Auxiliar Ayer, y `813` tenía antecedente en Auxiliar Ayer, sin Top10 VT3 auxiliar. Por tanto **ningún criterio probó antes del resultado que 813 fuera preferible a 513**.

En el replay de Nocturna 29/10, varios órdenes exploratorios por testigos o rutas conservaron el 813 entre sus primeros 2–3 para la madre, pero no corresponde destacar ese resultado aislado tras haber construido el experimento con conocimiento del caso. El enfoque recomendado es conservar ambos visibles dentro de una misma banda `_13`, con sus rutas y respaldos desplegables. El usuario puede observar diferencias sin que el sistema esconda una opción físicamente válida.

## Decisión propuesta

**No** reemplazar Top10 ni reducir a K=3/5 como filtro duro. Sí preparar una **capa de exploración geométrica** por madre de Top10:
1. Dos orientaciones `_ab`/`_ba`, desplegadas con las cifras que realmente tienen camino físico en cada auxiliar al corte PRE.
2. Etiquetas por cifra: `Ayer + Hoy`, `Solo Ayer`, `Solo Hoy`; dentro del detalle, rutas completas, anteriores ganadores concretos y presencia en Top10 VT3 sin convertirlas automáticamente en apuestas.
3. Modo foco opcional K=3 o K=5 (por rutas/testigos) **sin ocultar ni descartar las restantes**: botón/filas «Ver todas las extensiones».
4. Registrar cuándo un conjunto de recorridos *nace/reaparece* en 5–6 jornadas. El esquema por orientación **no sustituye el radar propio de VT3 ni el radar propio de VT2**.

Antes de incluirlo en APK verificar diseño, rendimiento de abrir rutas y una auditoría temporal ciega. Todo lo producido sigue en **laboratorio aislado**.

## Código reproducible

- `src/labReduccionExtensiones.ts`: shortlists con presupuesto K y sus 4 criterios, 10 semillas neutrales, evaluación POST separada, agrupación sin pérdida por orientación, métricas de renglones.
- `scripts/test-reduccion-extensiones.ts`: tests de supervivencia de rutas 513 y 813, reversibilidad de band, protección de VT2 y cómputos POST.
- `scripts/lab-tres-hojas-figuras.ts`: replay 80 cortes/16 jornadas con resumen de cada presupuesto y cohorte, comparación temporal, Nocturna y 29/10.
- `.github/workflows/lab-reduccion-vt3-cobertura.yml`: ejecución validada [#40997436111](https://github.com/y0t3/Modelo-Papa/actions/runs/40997436111); artefacto `reduccion-vt3-octubre-30oct`.
