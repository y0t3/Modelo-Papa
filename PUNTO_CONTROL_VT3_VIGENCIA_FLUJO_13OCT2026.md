# VT3 — Punto de control: vigencia física y flujo actual
**13/10/2026.** Investigación sin esperar sorteos nuevos. Motor de producción, Top oficial, hoja +11, marcados POST, APK, VT4 y rama `main` intactos. Laboratorio y sellos en `lab-vt3-vigencia-fisica-13oct2026`.

## Pregunta y límites
Se investigó la intuición de que el motor puede arrastrar demasiado pasado aunque una figura importante se haya formado en el último turno o jornadas recientes. **No se interpretó la semana como un vencimiento literal.** Se diferenció aparición física pasada de nueva ruta propia anclada y se compararon 1/2/7 jornadas operativas previas, respetando historial disponible antes de cada corte, cinco jurisdicciones, familias reversibles, diez plazas y los testigos físicos correctos.

Entradas congeladas: 23 fechas, 115 cortes, PRE 115 SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`. Su motor VT3 toma raíces D−1 y D−7; no existe actualmente una fuente infinita de raíces antiguas sumadas a producción, pero su orden prioriza bloques bifurcados por encima de recencia de raíz. Comparar formas antiguas y medir **actividad actual** son tareas distintas.

Workflow 1: [GitHub Actions 38353028568](https://github.com/y0t3/Modelo-Papa/actions/runs/38353028568), completado. Protocolo `PROTOCOLO_VT3_VIGENCIA_FISICA_13OCT2026.md`, script `scripts/lab-vt3-vigencia-fisica.mjs`. PRE, POST, SELLO y resumen bajo `auditorias/vt3-vigencia-fisica-115-13oct2026/`.

## Hallazgo físico
En 6.389 exposiciones de familia anclada×corte:
- 94 registros donde una familia anclada **que ya estaba en turno anterior intradía** sumó nueva ruta propia anclada (madura). Cero familias ganadoras entre esos registros; 45 presencias de esa categoría en Top10 oficial, cero aciertos. Muestra pequeña, no descartar el fenómeno.
- 1.042 registros donde aparece una **familia anclada nueva respecto al turno anterior** (nace); 10 ganadoras, 176 presencias en Top10 original, cuatro ganadoras en Top10.
- 4.563 registros de familias en cortes intradía que no cambiaron de anclaje. Más 690 de Previa (sin comparación intradía) integran la categoría `static` de POST: 5.253 registros, 54 ganadores, 929 presencias Top10, 13 ganadores en Top10.
- Sólo 18 familias×corte de las 6.389 tuvieron **misma familia+fuente+geometría de ruta anclada** en la ventana comparable de dos jornadas anteriores. El casillero y el nombre de la familia casi nunca persisten juntos de esa manera. No confundir «forma que sobrevive» con «la misma terna en los mismos tres casilleros».

### Rangos A/B con exactamente diez familias
`NUEVA_n`: prioridad a candidatas ausentes de inventarios físicos del mismo turno en las n jornadas operativas anteriores, sólo si ventana completa. `ACTIVA_n`: prioridad a candidatas presentes en más jornadas anteriores. `MADURA_HOY` y `NACE_HOY`: rutas ancladas propias nuevas intradía. Mantener orden original como desempate.

| Política | Top3 | Top5 | Top10 |
|---|---:|---:|---:|
| Original | 5 | 8 | 15 |
| Nueva en 1 jornada | 4 | 7 | 14 |
| Nueva en 2 jornadas | 1 | 6 | 12 |
| **Nueva en 7 jornadas** | **8** | **11** | **14** |
| Activa en 1 jornada | 3 | 6 | 8 |
| Activa en 2 jornadas | 4 | 6 | 11 |
| Activa en 7 jornadas | 4 | 5 | 11 |
| Madura hoy | 5 | 7 | 15 |
| Nace hoy | 6 | 10 | 14 |
| Madura, luego nace | 4 | 9 | 14 |
| Misma ruta anclada hasta 2 jornadas | 5 | 8 | 15 |
| Ruta renovada hasta 2 jornadas | 4 | 7 | 14 |

**No se mejoró el Top10 oficial.** Las reglas de novedad favorecen algunos puestos altos, pero dejan fuera otras familias acertadas: `NUEVA_7` gana 3 cortes Top10 y pierde 4. `ACTIVA_1` gana 1 y pierde 8. Las mejoras Top3 no implican identificar mejor un sorteo aleatorio.

Por mes Top10: Original septiembre 10/70, octubre 5/45; `NUEVA_7` septiembre 9/70, octubre 5/45; `ACTIVA_1` septiembre 5/70, octubre 3/45. Por turno Matutino: original 8/23, `NUEVA_7` 6/23, `ACTIVA_1` 4/23. Vespertino: original cero, `NUEVA_7` 1/23, `NACE_HOY` 2/23 (en otros turnos se pierden aciertos).

## Controles negativos del aumento Top3 en NUEVA_7
Workflow 2: [GitHub Actions 38353437781](https://github.com/y0t3/Modelo-Papa/actions/runs/38353437781), completado. Protocolo `PROTOCOLO_VT3_VIGENCIA_CONTROLES_13OCT2026.md`, script `scripts/lab-vt3-vigencia-controles.mjs`.

Se permutan **bloques completos de cinco turnos por jornada** sin modificar propuestas PRE. Son 22 desplazamientos, 20.000 permutaciones libres, 20.000 con sólo jornadas de igual día de semana.

- Top3 real original 5, `NUEVA_7` 8, diferencia pareada +3. En permutaciones libres la **cola de esa mejora pareada** es 0,0721; al conservar día de semana, 0,1501. La puntuación absoluta de `NUEVA_7` sí es poco usual en varios controles, pero eso NO demuestra que la regla `NUEVA_7` sea superior: hay que evaluar su diferencia sobre el mismo Top original.
- Top5 real +3; cola de diferencia 0,0918 libre y 0,0982 por mismo día de semana.
- Top10 real cambio −1; controles no respaldan mejora.
- 22 desplazamientos exactos de jornadas: en ninguno se observó mejora Top3 de +3 o más; pero son sólo 22 negativos, y la elección exploratoria de ventana a partir de varios ensayos crea selección retrospectiva.

**Interpretación:** la hipótesis de novedad requiere mejor descomposición geométrica y un control verdaderamente nuevo si alguna vez se pretende atribuir poder de pronóstico. No subir `NUEVA_7` a producción por este ensayo.

## Nocturna 12/10: 851,615,242 bajo memoria reciente
La Nocturna 12/10 ya se conocía al iniciar este laboratorio. La simulación usa **el mismo PRE físico reproducido del corte**, aplicando ventanas únicamente a fechas previas; **NO modifica el sello auténtico de las 18:56 del 12/10**, ni se presenta como predicción a tiempo. El nuevo PRE se genera sin POST físicamente accesible en esa fase; `NOCTURNA_VIGENCIA_PRE.json` no contiene objetivos, mientras `NOCTURNA_VIGENCIA_POST.json` sí.

| VT3 objetivo | Situación física anterior al sorteo | Ranking original | `NUEVA_7` | `ACTIVA_7` |
|---|---|---:|---:|---:|
| 851 (158/851) | Físicamente válida, **sin anclaje**; no entraba a bolsa | fuera | fuera | fuera |
| 615 (516/615) | Anclada en D−7; físicamente válida | 54 | 54 | 37 |
| 242 (242/242) | Anclada en D−1; físicamente válida | 25 | 25 | **7** |
| 290 (092/290) | No existe físicamente en el PRE | fuera | fuera | fuera |
| 264 (264/462) | No existe físicamente en el PRE | fuera | fuera | fuera |

`242` estuvo físicamente disponible en **cinco de las siete jornadas operativas anteriores** en su turno homónimo; `615` en tres; ambas presentes en la última. Curiosamente, `ACTIVA_7` (prioridad a frecuentes) sí coloca 242 en el Top10 de ese corte, pero **rinde peor en global: 11/115 frente a 15/115 original**. No seleccionar retrospectivamente este criterio por acertar un caso conocido.

El Top10 de `NUEVA_7` para el 12/10 **permanece idéntico al oficial**, por lo que no arregla este último fallo. La regla `NUEVA_7` no introduce jamás 851 porque está fuera de la bolsa de familias ancladas.

## Decisión y camino útil
Separar definitivamente dos problemas VT3:
1. **Admisión**: no puede promoverse 851 si la regla D−1/D−7 no la admite, aunque tiene camino físico completo. Distinguir una familia que aparece físicamente «ahora» de una reconstruida por respaldo histórico.
2. **Priorización**: 615 y 242 estaban admitidas, pero lejos del Top10. Determinar cuándo el apoyo histórico sigue siendo útil y cuándo una fuente reciente realmente aporta información independiente.

El criterio `actividad = cuántas veces apareció la misma familia` no es suficiente. Tampoco el filtro simple `ausente siete jornadas`. El próximo análisis geométrico de flujo debe examinar *por qué se forma una nueva trayectoria en una fuente específica, si nace o suma ruta respecto al último turno y cómo distingue ese cambio frente a falsas candidatas*, conservando 10 familias, sus recorridos físicos y todos los negativos; no usar POST para fabricar predicción. Sin prometer ventaja matemática en sorteos aleatorios.

**Estado:** todos los experimentos son retrospectivos sobre datos explotados en investigación; ninguna política nueva promovida a producto.
