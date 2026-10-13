# Punto de control VT4 — 5485 de Primera y 1057 de Matutina, 13/10/2026

**Fecha:** 13 de octubre de 2026. **Rama:** `lab-vt4-primeramatutino-13oct2026`. Ejecución en GitHub Actions: [38450887833](https://github.com/y0t3/Modelo-Papa/actions/runs/38450887833).

## Alcance y honestidad temporal

Se reconstruyeron las cabezas completas **5485** (Ciudad, Primera) y **1057** (Provincia, Matutina), ambas marcadas con VT4 en la pestaña CABEZAS de la captura del usuario, y las otras cabezas disponibles de los dos turnos. Se utilizó sin modificar `src/motorLalo.ts` y la misma carga PRE de Nocturna 12/10 + anteriores Previa/Primera de 13/10 que ya se había empleado para VT3.

Para garantizar que **no se cambiaron los datos del tablero**, el script comprobó:
- SHA256 exacto `067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41` del **sello VT3 de Matutina guardado a las 13:52**, y su mismo Top10, inventario de fuentes y número de raíces;
- el PRE previo de Primera conservado antes de esta nueva prueba: Top10 VT3, fuentes y raíces idénticas;
- separación archivo PRE de reconstrucción VT4 y cotejo POST en dos commits del workflow.

**Limitación estricta:** el sello original de las 13:52 contenía el Top3/Top10 de **VT3**, **no** guardó los Tops de VT4. Esta reconstrucción VT4, aunque usa sólo datos disponibles antes de cada turno y el mismo código, **se ejecutó DESPUÉS de ambos sorteos**. Por tanto, no se puede llamar acierto o fracaso «VT4 prospectivo previamente sellado». Se trata de auditoría histórica reproducible y concordante con el PRE.

Las familias se calculan como cuaterna completa reversible: `5485/5845` y `1057/7501`, **no** como familias VT3 `485/584` o `057/750`. Todos los recorridos respetan cuatro celdas distintas físicamente vecinas de una misma fuente, sin cruces entre columnas.

## Resultado principal

| Sorteo | Cabeza | Familia VT4 | Rutas físicas de cuatro celdas | Rutas admitidas VT4 | Puesto en Lalo VT4 | ¿Top10? |
|---|---|---|---:|---:|---:|---|
| Primera · Ciudad | **5485** | `5485/5845` | **2** | **2** | **35** | No |
| Matutina · Provincia | **1057** | `1057/7501` | **1** | **0** | **sin puesto** | No |

**Primera 5 jurisdicciones:** 1/5 cabezas tenía recorrido físico VT4 y una estaba admitida; **ninguna Top3/Top5/Top10**. Bolsa VT4 original de **67 familias**.

**Matutina 5 jurisdicciones argentinas:** 1/5 cabeza tenía recorrido físico VT4 y ninguna estaba admitida; **ninguna Top3/Top5/Top10**. Bolsa VT4 original de **76 familias**.

**Matutina incluyendo Montevideo 3629 (6 jurisdicciones):** mismo balance para VT4, ya que 3629 no poseía cuaterna física en el PRE, aunque sí fue acierto **VT3 Top5**. No confundir VT3 con VT4.

## Primera: familia 5485/5845 — admite dos madres, pero sólo llega #35

La cuaterna completa `5485` tuvo **dos caminos físicos válidos en columna Previa**, compartiendo los casilleros del dibujo +11 y varias orientaciones:
- `F1C1 → F2C1 → F2C2 → F3C1` lee `5485`.
- `F3C1 → F2C1 → F2C2 → F1C1` lee `5485`.

Ambos fueron admitidos como extensiones VT4 concretas. El algoritmo asoció su recorrido con **dos madres VT3 propias** que ya estaban admitidas en Primera:
- `485/584` en VT3 **puesto 5**;
- `548/845` en VT3 **puesto 9**.

El motor deduplicó ambas madres en la familia VT4 y le asignó mejor puesto materno **5**. La familia VT4 quedó #**35/67**. Esa cifra no significa «dos cabezas» ni «dos eventos D−1/D−7 VT4»; son dos trayectos físicos y dos madres relacionadas con esos trayectos.

**Diagnóstico:** el ranking actual VT4 aplica primero la prioridad lexicográfica de la mejor madre VT3, y sólo después fuentes, bloques físicos y número de madres. Por eso `5485` puede tener respaldo de **dos madres diferentes** pero no superar a hijas de una madre de puesto 1–2.

En los **dos cortes** Primera y Matutina, los Top10 VT4 reconstruidos fueron **idénticos**, exactamente el comportamiento «congelado» observado antes por el usuario. Sus **seis primeros** provienen de la madre `226/622` que conservó puesto VT3 #1; los cuatro restantes tienen como mejor madre `305/503` (#2 VT3). Aunque aparecieron más fuentes y cambió la composición de otras madres VT3, **ninguna hija de madres #3–#10 consiguió abrir una plaza de ese Top10**. Esto es un efecto **determinista del criterio de clasificación**, no un hallazgo de predictibilidad.

## Matutina: 1057/7501 — la cuaterna existe pero VT3 bloquea su entrada

La cuaterna completa `1057` se podía dibujar en **un único recorrido** dentro de `prevNocturno`: `F4C2 → F4C1 → F5C2 → F5C1`, sin saltos ni cruce de fuentes.

Sus tramos contiguos VT3 son:
- prefijo de tres: `105`, familia `105/501`;
- sufijo de tres: `057`, familia `057/750`.

**Ninguna de las dos familias fue admitida en el ranking VT3 Matutino**; el script verificó que **ninguna ruta parcial de esa cuaterna coincidiera físicamente con una madre VT3 del Top10**. El motor actual crea hijas VT4 únicamente extendiendo rutas de esas diez madres, de manera que **no le asignó puesto VT4**.

**Diagnóstico:** esta cabeza quedó fuera por el **cuello de botella de admisión materna VT3**, incluso siendo un VT4 físico legítimo. No tiene sentido comparar su puesto VT4 con el Top10 porque no fue elegible en ese ranking.

## Top10 VT4 idéntico durante ambos turnos

| Puesto | Familia VT4 | Mejor madre VT3 (puesto) |
|---|---|---|
| 1 | `3226/6223` | `226/622` (#1) |
| 2 | `5226/6225` | `226/622` (#1) |
| 3 | `2266/6622` | `226/622` (#1) |
| 4 | `2263/3622` | `226/622` (#1) |
| 5 | `2265/5622` | `226/622` (#1) |
| 6 | `6226/6226` | `226/622` (#1) |
| 7 | `5036/6305` | `305/503` (#2) |
| 8 | `3057/7503` | `305/503` (#2) |
| 9 | `1305/5031` | `305/503` (#2) |
| 10 | `1503/3051` | `305/503` (#2) |

**Esto respalda una corrección de diseño que merece ensayo, no implementación automática:** equilibrar la selección de hijas VT4 entre madres físicas distintas, o incluir madres VT3 con recorridos físicamente legítimos aunque queden fuera del Top10, usando controles con igual cupo y sin consultar resultados futuros. El algoritmo oficial no debe cambiarse por una o dos coincidencias retrospectivas.

## Decisión y seguimiento

- **No hubo acierto VT4 Top10** en estos dos turnos según el código y el PRE reconstruidos; la coincidencia Top5 de **Montevideo 3629 fue VT3**, no VT4.
- **Sí identificamos dos causas reproducibles** que afectan VT4: sobreprioridad de la mejor madre (#35 pese a dos madres #5/#9) y cierre de admisión a cuaternas sin madre VT3 Top10 (1057).
- **Nunca promover rutas de cuatro cifras a VT4 por combinar cualquier VT3 y dígito sin recorrido físico**: el trayecto completo debe existir, y cada madre debe ser un segmento real de esa misma ruta.
- Próximo laboratorio propuesto: **Top10 VT4 de cupo diversificado por madre**, sin regalar plazas; medir contra VT4 original y alternativas de igual cupo en todos los 115 cortes ya preparados y, más importante, en futuros sorteos con sello VT4 previo. La muestra histórica está muy reutilizada y la quiniela es aleatoria.

## Archivos reproducibles
- `PROTOCOLO_VT4_PRIMERA_MATUTINA_13OCT2026.md`.
- `scripts/lab-vt4-13oct2026.mjs`.
- `.github/workflows/lab-vt4-13oct2026.yml`.
- `auditorias/vt4-13oct2026/RECONSTRUCCION_PRE_VT4.json` y `SELLO.json`.
- `auditorias/vt4-13oct2026/POST_13OCT_VT4.json`: todas las cabezas y recorridos reales, admisión y madres.
- `auditorias/vt4-13oct2026/RESUMEN.json`.
- [GitHub Actions 38450887833](https://github.com/y0t3/Modelo-Papa/actions/runs/38450887833).

**No se alteró producción.**