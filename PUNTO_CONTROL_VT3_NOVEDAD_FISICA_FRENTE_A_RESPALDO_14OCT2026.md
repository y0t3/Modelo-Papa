# Punto de control — VT3: novedad física frente a respaldo acumulado
**14/10/2026 · 23 jornadas · 115 cortes retrospectivos · rama `lab-vt3-novedad-fisica-vs-respaldo-14oct2026`.**

## Decisión breve
**NO incorporar la prioridad general por novedad al ranking oficial VT3.** Detecta efectivamente los cambios entre fuentes y elimina la inmovilidad del Top3, pero **no mejora su poder de selección de ternas ganadoras**. El modelo geométrico previo sigue teniendo mejor Top3/5/10 en este corpus. Conservar únicamente los **eventos de novedades como explicaciones auditables**, no como bonos automáticos.

## Qué se comprobó
Se reutilizaron los perfiles PRE ya verificados en `vt3-transiciones-individuales-115-13oct2026`; esos perfiles distinguen caminos propios en la fuente recién incorporada y rutas persistentes de columnas anteriores. Cada familia corresponde a una madre VT3 reversible. Los resultados sorteados de cada corte y los diagnósticos POST permanecieron físicamente fuera de los archivos accesibles durante PRE. El PRE se selló antes de restaurar y comparar las cabezas.

**Los modelos comparados tuvieron siempre exactamente diez madres VT3 únicas por corte** y las mismas cinco cabezas posteriores para POST:
- VT3 `OFICIAL`, archivado;
- geometría completa anterior `F_D1`, archivado;
- nuevo comparador `ACUMULADO`: raíces históricas, fuente, bloques y cantidad física;
- nuevo `NOVEDAD_FUENTE`: la fuente recién agregada antes que acumulado, huella propia, nacimiento/convergencia;
- nuevo `NOVEDAD_RAIZ`: huella históricamente comprobada **en la nueva fuente**, antes que nacimiento/convergencia y apoyo acumulado.

No se contabilizaron las columnas aún no disponibles como ausencias. `Previa` es siempre `INICIAL`, no «nace» respecto de una columna anterior del mismo día. En las cuatro transiciones siguientes, rutas viejas conservadas no suman evidencia de novedad.

## Resultados verificables
| Modelo | Aciertos Top3/115 | Aciertos Top5/115 | Aciertos Top10/115 |
|---|---:|---:|---:|
| VT3 oficial | 5 | 8 | 15 |
| Geometría completa anterior | **8** | **10** | **16** |
| Solo respaldo acumulado | 6 | 10 | 13 |
| Nueva fuente primero | 5 | 8 | 12 |
| Nueva raíz propia primero | 5 | 8 | 12 |

Las dos políticas de novedad alcanzaron los mismos resultados agregados y los mismos cortes ganados/perdidos respecto de los tres comparadores. NO tratarlas como confirmaciones independientes. El cambio frente al geométrico anterior fue **−3 aciertos Top3, −2 Top5, −4 Top10**.

### Emparejamiento — nueva fuente vs VT3 oficial
- Top3: ganó cuatro cortes que el oficial perdió, **pero perdió otros cuatro que el oficial había acertado** → neto **0**.
- Top5: cuatro ganancias / cuatro pérdidas → neto **0**.
- Top10: cinco ganancias / ocho pérdidas → neto **−3**.

### Cuánto movimiento había realmente
En 15.273 exposiciones familia×corte:
- `NACE` en columna nueva: **3.380**, con **27** familias ganadoras.
- `SUMA_FUENTE` / converge: **1.086**, con **11** ganadoras.
- `NOVEDAD EN FUENTE` total (nacimiento+convergencia): **4.466**, con **38** ganadoras.
- `NUEVA HUELLA` vinculada a raíz antigua genuina en fuente nueva: **1.136**, con **10** ganadoras.
- `YA_PRESENTE` sin cambios: **9.517**, con **89** ganadoras.
- `INICIAL` (Previa): **1.290**, con **16** ganadoras.

Estas son exposiciones correlacionadas de familias, no sorteos independientes. La tasa descriptiva nueva 38/4.466 ≈ **0,85 %** y estable 89/9.517 ≈ **0,94 %** no indican ventaja general de novedad. La presencia física no implica acierto próximo.

### El ranking se mueve, pero pierde selección
De las 92 transiciones consecutivas dentro de una fecha:
| Método | Top3 idéntico al previo | Top10 idéntico al previo |
|---|---:|---:|
| Oficial | 52 | 25 |
| Geométrico completo anterior | 84 | 78 |
| Nuevo acumulado | 49 | 18 |
| **Novedad (ambas reglas)** | **0** | **0** |

Es posible eliminar la congelación de manera completamente mecánica sin incrementar aciertos. La nueva regla desplaza familias históricas incluso cuando permanecen físicamente válidas y siguen resultando sorteadas.

### Consistencia temporal
| Mes | Cortes | Oficial Top3 / Top10 | Acumulado Top3 / Top10 | Novedad Top3 / Top10 | Geométrico anterior Top3 / Top10 |
|---|---:|---:|---:|---:|---:|
| Sep. 15–30 | 70 | 3 / 10 | 6 / 11 | 2 / 7 | **6 / 12** |
| Oct. 1–10 | 45 | 2 / 5 | 0 / 2 | **3 / 5** | 2 / 4 |

La preferencia por novedad **ayudó en ciertos casos de octubre**, pero su deterioro en septiembre fue más grande. Este contraste entre meses no autoriza una regla «según el mes»; sería elegir a posteriori.

### Controles neutrales, 2.000 selecciones por corte
- Sorteo de diez madres al azar del universo físico completo: medias **3,3735 Top3**, **5,5585 Top5**, **10,6425 Top10**; colas superiores para observar al menos 5/8/12 (resultado novedad): **0,24088 / 0,18491 / 0,37031**.
- Control neutral condicionado a priorizar fuente nueva, pero sin orden interno por raíces: medias **3,266 Top3**, **5,3725 Top5**, **10,5755 Top10**; colas para novedad: **0,22989 / 0,16842 / 0,37231**.
- No hay evidencia de una ventaja de la prioridad por novedad frente a una decisión neutral; los controles son exploratorios porque el corpus ya fue analizado repetidamente y hay dependencia entre cortes.

## Qué salvar del experimento
1. **Retener las etiquetas `INICIAL` / `NACE` / `CONVERGE` / `YA_PRESENTE` / `NUEVA_HUELLA` como datos descriptivos**, cada uno ligado a caminos físicos reales y a su fuente. Sirven para explicar por qué se movió una candidata.
2. **No asignar un bono automático por nacer, converger, o traer una raíz verificada en la fuente nueva.** Desplaza familias persistentes y no generó ventaja sobre controles.
3. **No imponer cambios de Top3 por turno**: la estabilidad puede ser correcta si no hay señal suficientemente discriminante; que cambie un número no es prueba de evolución útil.
4. El patrón de «reaparece después de apagarse» puede investigarse **entre fechas distintas del mismo turno y fuente**, nunca como retirada de columna dentro de un día. Para evitar otra sobreoptimización, es mejor sellar una hipótesis de ese tipo para sorteos nuevos y no ajustarla una y otra vez sobre estos 115.
5. No tocar `src/motorLalo.ts`, `main`, Top3 oficiales, VT4, hoja +11, marcado automático ni PRE genuinos prospectivos.

## Auditoría reproducible
- [Ejecución GitHub Actions de este laboratorio](https://github.com/y0t3/Modelo-Papa/actions/runs/38523447906)
- `PROTOCOLO_VT3_NOVEDAD_VS_RESPALDO_14OCT2026.md`
- `scripts/lab-vt3-novedad-vs-respaldo.mjs`
- `auditorias/vt3-novedad-vs-respaldo-115-14oct2026/PRE_115.json`
- `auditorias/vt3-novedad-vs-respaldo-115-14oct2026/SELLO.json`
- `auditorias/vt3-novedad-vs-respaldo-115-14oct2026/POST_115.json`
- `auditorias/vt3-novedad-vs-respaldo-115-14oct2026/RESUMEN.json`

**Importante:** Las reglas y el PRE se sellaron antes de abrir POST durante este replay de datos históricos; no equivale a una predicción realmente prospectiva. No se afirma ventaja contra la aleatoriedad de la quiniela.
