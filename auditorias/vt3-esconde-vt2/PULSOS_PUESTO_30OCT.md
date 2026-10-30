# Minihoja VT3: visualizar sus dos VT2 físicos y estudiar la persistencia del puesto

**Modelo Lalo — 30/10/2026**  
**Rama:** `lab/vt3-deriva-vt2-en-11-30oct`

## ¿Qué significa "resaltar las dos últimas cifras de VT3"?

El motor Lalo construye el Top10 VT3 de +11 y YA deriva los dos segmentos VT2 de cada ruta de tres celdas; después ordena VT2 con un criterio propio. La investigación anterior confirmó cientos de coincidencias VT2 fuera del Top10 VT2 que sí vivían en las rutas del Top10 VT3. No necesitamos un tercer Top.

La minihoja `src/ui/MiniRoutePreview.tsx` ahora permite tocar dos lecturas físicamente correctas:
- **Final directa:** camino `A→B→C` da `B→C`, por ejemplo `513→13`.
- **Final inversa:** camino inverso `C→B→A` da `B→A`, por ejemplo `513→15`.
- Cada par se muestra como familia reversible `13/31` o `15/51`; el botón resalta **solo las dos casillas** contiguas en una minihoja 6×2. No se puede saltar de A a C.
- En cada tarjeta de **Top10 VT3** se incluye una línea con los VT2 internos, dando preferencia visual a los que están **fuera del Top10 VT2**. Se muestran como máximo cinco etiquetas y se indica `+N más` cuando existen más; el detalle sigue conservando todos los recorridos.

Todo es representación de las **rutas PRE seleccionadas por Lalo en la +11**. No se buscan extensiones auxiliares en esta parte, no se modifica ningún ranking ni se añade un número al Top oficial. No usar POST para elegir el par destacado.

## Hipótesis: puesto persistente, no número persistente

El usuario propone que **una misma posición del Top10 VT3**, por ejemplo #7, esté acertando VT2 internos durante una ventana breve **en un solo turno**. El lugar (#7) puede contener una familia VT3 diferente cada jornada; lo que se sigue es el puesto/turno, no la familia numérica.

El laboratorio de `src/labPulsosPuestosVt3.ts` registra para cada fecha, turno y puesto VT3:
- cuántas **familias VT2 fuera del Top10 VT2** están representadas por los tramos físicos de ese puesto,
- si al menos una coincidió con las cinco cabezas reales del turno,
- las alertas construidas solo con **jornadas anteriores de ese mismo turno**: 2 aciertos de las 3 jornadas previas, 2 de 5, o 3 de 5.
- en paralelo, la transferencia **intrajornada** de una coincidencia del puesto en el turno anterior al siguiente, sin mezclar con el sorteo objetivo.

**El número de VT2 adicionales por puesto varía**: un puesto con muchos recorridos tiene más oportunidad de coincidir. Esta versión compara tasas de activación y exposición, pero no controla íntegramente el sesgo de cantidad de familias ni las 50 combinaciones de turno/puesto exploradas. Los resultados NO son probabilidades calibradas ni una ventaja prospectiva comprobada.

## 1. Alertas entre jornadas — Nocturna

| Historial reconstruido | Criterio | Avisos PRE | Coincidieron a la siguiente noche | No avisados que coincidieron |
|---|---|---:|---:|---:|
| Junio–septiembre, 103 jornadas | 2 coincidencias en 3 noches previas | **11** | **2** | 79 entre 646 |
| Junio–septiembre | 2 coincidencias en 5 noches previas | **33** | **3** | 76 entre 610 |
| Octubre 12–29, 16 jornadas | 2 coincidencias en 3 noches previas | **1** | **0** | 20 entre 78 |
| Octubre 12–29 | 2 coincidencias en 5 noches previas | **3** | **0** | 16 entre 63 |

La incidencia cuando hubo alerta NO supera de manera consistente la incidencia de los demás puestos. No se justifica marcar una posición como "activa" tras 2/3 o 2/5 resultados ganadores. Además, muchos puestos no tienen VT2 extras para ese turno, por lo que se condiciona a que exista al menos uno.

Un caso exploratorio aislado: en junio–septiembre, el puesto **#8 de Nocturna** acertó en 2 de 2 alertas con criterio 2/3. En octubre ese criterio volvió a alertar sobre #8 una vez y no acertó. Esto ilustra tanto la posibilidad de episodios breves como la facilidad de engañarnos por muestras diminutas y elección posterior entre puestos.

## 2. Continuidad entre turnos

En junio–septiembre, al observar si el **mismo puesto** VT3 acertaba un VT2 adicional en el turno inmediatamente anterior:
- **175** observaciones tenían coincidencia en el turno anterior, y **18** repitieron coincidencia en el turno siguiente.
- Sin coincidencia en el turno anterior: **179 de 1.612** tuvieron una coincidencia siguiente.
- Las proporciones son muy similares y la media de extensiones expuestas difiere: no hay ventaja global detectable.

En octubre 12–29:
- Tras coincidencia en turno anterior: **6 de 25** repitieron.
- Sin coincidencia antes: **29 de 236** coincidieron.
- En tránsito Vespertino→Nocturno, 3 de 6 frente a 17 de 82; pero los avisos de 6 casos tenían **más extensiones VT2 disponibles** en promedio que los demás, y son demasiados pocos para afirmar un patrón. No es una regla validada.

**Resultado:** observar ambos movimientos es útil para estudiar episodios, pero aún no hay razón para iluminar automáticamente una posición de Top10 VT3 como «racha activa».

## Decisión

1. **Sí, visualizar desde ahora** los dos VT2 internos al entrar a la minihoja VT3 y una línea informativa en la tarjeta del Top10 VT3. La geometría explica ambos sentidos directos/inversos.
2. **No generar otro Top10 ni alterar el Top10 VT2.** El mismo motor ya conoce estas dos aristas; no son candidatas nuevas, son candidatas ocultas en otra modalidad.
3. **Puesto persistente: mantener en laboratorio**, con seguimiento por turno y por rachas de 5–6 jornadas y registro de ausencias, hasta que aparezca un indicador PRE que supere controles de igual exposición.
4. **Próximo experimento recomendado:** seguir la misma *huella física* / borde seleccionado en un puesto, independientemente de su lectura numérica, y comprobar si un cambio de forma repetido aporta más que la simple posición #7 u #8. Evitar seleccionar retrospectivamente solo las ventanas ganadoras.

## Archivos

- `src/vt3EdgePreview.ts`: extracción validada de dos bordes VT2 de una VT3.
- `src/ui/MiniRoutePreview.tsx`: dos botones para iluminar cada par físico en su minihoja.
- `src/ui/PredictionSummary.tsx`: anotaciones breves de VT2 ocultos dentro de los Top10 VT3.
- `src/labPulsosPuestosVt3.ts`: estudio de persistencia por rank/turno y transición de turnos.
- `scripts/test-vt3-pulso-puestos.ts`: validación de adyacencia, sin saltos y uso de jornadas anteriores.
- `scripts/lab-vt3-esconde-vt2.ts`: replay y reporte de 119 jornadas / 595 cortes PRE reconstruidos.
- Workflows `VALIDAR minihoja VT3 con sus VT2 internos`, `LAB pulsos por puesto VT3 Lalo`, `APK de prueba VT2 internos dentro de VT3`.

La rama queda separada del motor y de la versión oficial. Compilar una APK no significa promover automáticamente la función ni afirmar ventajas de apuesta.
