# Punto de control VT3 — transiciones individuales y atlas geométrico
**13 de octubre de 2026** · rama experimental `lab-vt3-transiciones-individuales-13oct2026`.

## Qué se ejecutó
- GitHub Actions de auditoría [38358447863](https://github.com/y0t3/Modelo-Papa/actions/runs/38358447863): **correcta**, generó PRE, hash, POST y comparaciones emparejadas de transiciones físicas.
- GitHub Actions del atlas [38359058511](https://github.com/y0t3/Modelo-Papa/actions/runs/38359058511): **correcta**, generó HTML autocontenido POST de la Nocturna 12/10 con las cinco fuentes +11 reales y los **380 recorridos físicos posibles** repartidos entre las **172 familias físicas** de ese corte. Permite seleccionar cada familia y muestra **todos** sus recorridos contiguos válidos, no un recorrido representativo. El atlas no puede usarse como predicción PRE; señala claramente sus fines POST.
- Protocolos sellados en `PROTOCOLO_VT3_TRANSICIONES_INDIVIDUALES_13OCT2026.md`. Se conservaron y comprobaron **todos los caminos de las fuentes previas al avanzar de turno**, sus valores y rootIds propios. Las raíces de una fuente no se prestan a otra. Las familias reversibles respetan el inverso exacto.

## Corpus
23 jornadas históricas, 115 cortes, **15.273 exposiciones de familia×corte** (6.389 ancladas históricamente + 8.884 únicamente físicas), **143 exposiciones de familia ganadora físicamente presente** (64 ancladas y 79 sin anclaje), sobre cinco cabezas por corte. Estos números NO son 143 pronósticos ni 143 familias únicas; los registros comparten cortes y fuentes.

El script evaluó 15 firmas PRE de evolución de cada familia, distinguiendo:
- Presencia actual y estado `NACE/CONVERGE/YA_PRESENTE/INICIAL`.
- Bloques propios nuevos en fuente recién disponible vs rutas adicionales del mismo bloque.
- Igualdad de bloque posicional entre DOS fuentes, o semejanza de tramo de dos celdas entre fuentes: son **similitudes de forma**, nunca unión entre las fuentes.
- Caminos nuevos que tienen su propio rootId histórico genuino.
- Presencia física de la misma familia en las 1, 2 o 7 jornadas operativas previas del mismo turno.
- Persistencia precisa de la misma familia en la **misma fuente y el mismo bloque de tres casilleros** de la jornada anterior.
- Densidad física y raíces D−1/D−7, para construir negativos comparables.

## Hallazgos relevantes, con negativos
| Firma PRE por familia×corte | Registros con firma | Registros ganadores con firma | Control de jornadas permutadas: ganadores promedio | Cola exploratoria ≥ real |
|---|---:|---:|---:|---:|
| Nace físicamente en fuente nueva | 3.380 | 27 | 28,41 | 0,648 |
| Aparece en segunda fuente (converge) | 1.086 | 11 | 10,77 | 0,520 |
| Forma igual en dos fuentes | 70 | **1** | 0,71 | 0,504 |
| Tramo posicional de dos celdas igual entre fuentes | 281 | **5** | 2,82 | 0,145 |
| Misma familia + mismo bloque + misma fuente entre jornadas | 86 | **3** | 1,18 | 0,108 |
| Familia físicamente presente en la jornada previa del mismo turno | 3.998 | 36 | 38,47 | 0,686 |
| Familia físicamente presente en la ventana de siete jornadas | 9.355 | 84 | 89,05 | 0,752 |
| Ruta anclada propia en fuente incorporada | 1.826 | 19 | 16,55 | 0,305 |

El control reasigna **jornadas completas** (todos los turnos, mismo orden de jurisdicciones) 10.000 veces; no modifica los PRE. La «cola» NO es prueba confirmatoria: las 23 jornadas ya fueron usadas para diseñar muchas reglas, y los controles no corrigen por completo la elección posterior de hipótesis.

### Negativos emparejados
Cada ganadora con firma física se comparó también **dentro de su propio corte** con otras familias de igual condición anclada/no anclada, palindromía, bandas de fuentes/bloques y tipo de raíz D−1/D−7. Sólo cuentan los grupos donde existen positivas y negativas de la firma; no se ocultan las ganadoras sin comparador.

- `nace`: 24 exposiciones ganadoras de 80 comparables tenían firma, frente a **25,94 esperadas** dentro de las mismas agrupaciones. Sep 14 vs 16,20; Oct 10 vs 9,74. No discrimina.
- `converge`: 7 vs **6,09**, pero sólo 13 agrupaciones discriminables en total; señal demasiado escasa.
- `tramo geométrico repetido entre fuentes`: 4 vs **2,64** en grupos comparables, pero apenas 7 agrupaciones discriminables. Sep 1 vs 0,88; Oct 3 vs 1,76; la magnitud es demasiado pequeña para subirla de peso.
- `misma familia, bloque y fuente que jornada anterior`: 3 vs **1,27** en 8 agrupaciones comparables. Tres casos reales, pero abundan familias de bajo soporte, y su control temporal dio cola 0,108. No es evidencia convincente de pronóstico.
- `apareció en 7 jornadas anteriores`: 52 vs **52,84** al emparejar; no puede promoverse la mera presencia reciente.

**Una raíz histórica repetida entre fuentes quedó en cero**: el rootId preserva, por diseño, la fuente de origen de cada traslado. Eso NO indica un patrón descubierto en los sorteos, sino que evita contar una misma genealogía como dos raíces diferentes.

### Casos reales de continuidad de bloque
| Fecha y turno | Familia VT3 | Anclada | Posición del ranking previo |
|---|---|---|---:|
| 28/09 Nocturno | 137/731 | No | Fuera de bolsa anclada |
| 08/10 Matutino | 071/170 | Sí, D−1 | **7** |
| 08/10 Vespertino | 017/710 | No | Fuera de bolsa anclada |

No concluir a partir de sólo tres ejemplos que una trayectoria idéntica predice una terna próxima.

## Nocturna 12/10 y evolución individual
**La simulación POST parte del PRE sellado antes del sorteo, pero todo el análisis de esos resultados se ejecutó cuando las cinco cabezas ya eran conocidas**. Nunca reescribir sello auténtico de las 18:56.

| VT3 | Qué muestra la trayectoria del PRE |
|---|---|
| `851` (`158/851`) | Estaba físicamente desde **Primera**, un bloque en una fuente, **sin raíz histórica**. También figuraba físicamente en el mismo turno de la jornada operativa anterior y tres de las siete anteriores, pero no tenía respaldo de traslado admisible. No nace en la fuente Vespertino actual. |
| `615` (`516/615`) | Converge: físicamente en **Primera** y luego en **Vespertino**. Dos bloques en dos fuentes; raíz auténtica D−7 sólo en un camino anterior. **El camino nuevo de Vespertino no está anclado**: no sumar su aparición como una segunda raíz. Era puesto 54. |
| `242` (`242/242`) | Nace físicamente en la nueva fuente **Vespertino**, con **dos bloques y dos rutas diferentes**. **Sólo una** de esas rutas transporta raíz histórica D−1; la segunda es una alternativa física sin anclaje propio. Era puesto 25. |
| `290`, `264` | Ausentes físicamente en fuentes disponibles PRE; no se puede inventar recorrido para incluirlas. |

El atlas incluye comparadores negativos del mismo tablero, elegidos por similitud PRE (y etiquetados como negativos **después** de observar resultados):
- Para `851`: `054/450`, `078/870`, `081/180`.
- Para `615`: `165/561`, `178/871`, `578/875`.
- Para `242`: `146/641`, `424/424`, `145/541`.

## Decisión
No modificar prioridades VT3, Top oficial, `main`, la hoja +11, las marcas POST, la APK ni VT4. Las firmas físicas nuevas discriminan **cómo se formó** una familia, pero no destacan de forma robusta familias futuras ganadoras frente a negativas similares.

El avance operativo es el **atlas visual reproducible**: permite revisar la evolución de las figuras con todos los recorridos reales en sus fuentes, distinguir rutas con raíz propia y sin raíz, y ver negativas físicamente parecidas. Para un siguiente estudio interesa especialmente qué forma cambia dentro de cada fuente y qué información física adicional aporta, no imponer cuotas generales.

## Evidencia permanente
- `auditorias/vt3-transiciones-individuales-115-13oct2026/PRE_115.json` (perfiles PRE por corte y familia), `NOCTURNA_PRE.json`, `SELLO.json` SHA.
- `POST_115.json`, `RESUMEN.json`, `NOCTURNA_POST.json` separados.
- `ATLAS_NOCTURNA_12OCT_POST.html` autocontenido, y `ATLAS_MANIFIESTO.json` con hash SHA del HTML, PRE, POST y rutas.
- Generadores `scripts/lab-vt3-transiciones-individuales.mjs` y `scripts/lab-vt3-atlas-nocturna.mjs`, más su plantilla HTML.
