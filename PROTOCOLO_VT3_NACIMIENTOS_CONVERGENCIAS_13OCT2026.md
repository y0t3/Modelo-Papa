# Protocolo VT3 — nacimientos, convergencias y admisión física limitada
13/10/2026. Rama `lab-vt3-nacimientos-convergencias-13oct2026`. Hipótesis motivada por la intuición del usuario: un recorrido históricamente repetido no debe confundirse con información nueva; algunas familias nuevas pueden quedar excluidas aunque existan físicamente. El historial (23 fechas, 115 cortes) ya fue utilizado muchas veces para explorar variantes. **No es validación ni prueba de ventaja en sorteos aleatorios.**

## Reglas innegociables
- No modificar `main`, `src/motorLalo.ts`, la app, VT4, las cabezas, la grilla +11 ni trazos POST. Top10 son **diez familias VT3 reversibles**, no números ni rutas. Un testigo tiene celdas adyacentes y una fuente; no se cruzan fuentes ni se atribuyen raíces prestadas.
- Entrada histórica congelada `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json` SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`. PRE validado por dos enumeradores físicos; no reescribir recorridos.
- Retirar los archivos POST del directorio antes de construir políticas PRE. Luego sellar hashes y comparar con cabezas POST de las mismas jornadas, en etapa separada.
- Las familias físicamente visibles pero sin raíces D−1/D−7 **no pasan a ser ancladas**. Una admisión de prueba se etiqueta `FÍSICA_SIN_RAÍZ` y ocupa una de las diez plazas, desplazando la última familia oficial. No se agrega una lista de 11,12,20. No se usa ninguna cabeza futura para admisión o ranking.

## Estados físicos del tablero actual, calculados corte a corte
La hoja acumulada de una fecha sólo incorpora una **nueva fuente real** cuando avanza de Previa a Primera, Matutino, Vespertino o Nocturno. Comprobar por aserción que todas las rutas físicas de fuentes antiguas permanecen idénticas de un turno al siguiente; cualquier modificación debe abortar la auditoría, no asumirse novedad espuria.

Para cada familia en el inventario PRE:
- `NACE_FISICAMENTE`: t>0, aparece en la fuente recién visible y NO figuraba físicamente en el inventario del corte anterior del mismo día.
- `CONVERGE_FUENTES`: t>0, aparece en fuente recién visible y ya figuraba en una fuente disponible antes; significa apoyo físico de **otra fuente**, no otro resultado histórico ni una confirmación independiente del sorteo.
- `YA_PRESENTE`: sólo trazas de fuentes disponibles antes del corte, sin la nueva fuente.
- `INICIAL`: en Previa no existe un PRE intradía anterior.
Registrar por separado si la familia ya tenía caminos anclados y si la fuente nueva añadió **caminos anclados propios** (independiente de más caminos no anclados).
- `edadFuentes`: número de turnos transcurridos desde que se habilitó la primera fuente que contenía una familia; no son días calendario.
- `contactoEntreFamilias`: cantidad de familias VT3 **ancladas** distintas con algún segmento idéntico de dos celdas en la MISMA fuente, respecto de un recorrido físico de una familia no anclada. Es proximidad geométrica, **no** un permiso de raíz.

## Políticas comparadas, fijadas antes de POST
Siempre diez familias y en caso de falta de elegibles se completa con la lista oficial en su orden. En políticas que reordenan la bolsa oficial se usan **sólo** familias admitidas originales.

1. `ORIGINAL`.
2. `ANCHOR_CONVERGE`: familias ancladas con nueva fuente física más antiguas en el día primero, desempate por ranking oficial.
3. `ANCHOR_SOURCE_NEW`: familias con **ruta anclada propia en fuente nueva** primero.
4. `ANCHOR_BIRTH`: familias ancladas físicamente nuevas en fuente actual primero.
5. `OPEN_BIRTH_1`: un cupo físico sin raíz: priorizar familia NACE_FISICAMENTE, bloques de fuente actual y trazos (bloques, rutas, alfabético).
6. `OPEN_CONVERGE_1`: un cupo físico sin raíz: priorizar familia CONVERGE_FUENTES (cantidad de fuentes, bloques en nueva fuente, total de bloques, alfabético).
7. `OPEN_FRESH_1`: un cupo sin raíz a familias cuya primera aparición física intradía fue **a lo sumo hace dos transiciones de turno**. Orden por edad más joven, fuentes, bloques, alfabético. Evitar asumir «semana=7 días».
8. `OPEN_BRIDGE_1`: un cupo sin raíz a familias de edad de fuente a lo sumo dos, con al menos un segmento de dos celdas compartido con **familia anclada de la misma fuente**. Orden por más familias vecinas ancladas, menor edad, más fuentes, bloques, alfabético.
9. `OPEN_FRESH_2`: como 7 pero dos cupos; registrar desplazamiento de dos familias oficiales.
10. `OPEN_BRIDGE_2`: como 8 pero dos cupos.
11. `OPEN_FRESH_NULL_1`: un cupo entre los mismos elegibles que 7, elegido por hash estable `sha256(fecha|turno|familia|seed)`, sin premiar geometrías (control negativo de admisión).

`OPEN` se compara en 115 cortes contra el mismo Top10 original, y también contra el control nulo de exactamente un cupo. No retener únicamente rescates: dar los desalojos reales, por mes, por turno y exposición de familias nuevas. No cambiar pesos de producción.

## Evaluación
- PRE sellado con 115 cortes, perfiles de familias y listados exactos de 10 por política; POST sólo después de sello.
- Métricas Top3/5/10, corte con alguna ganadora, familias ganadoras, cambios de propuesta, rescates y pérdidas pareadas.
- Control de fechas completas: 22 desplazamientos y 10.000 permutaciones deterministas de 23 **jornadas enteras** (todos sus turnos juntos), usando el PRE inmóvil; reportar cola empírica unilateral **de la diferencia** respecto al original, no p absoluto como evidencia de mejora. 10.000 es suficiente para exploración, no validación.
- Diagnóstico POST específico del 12/10 Nocturna (851, 615, 242, 290, 264), utilizando su `NOCTURNA_SIMULACION.json` PRE físico, sin alterar su auténtico sello de 18:56. Construir y sellar predicciones experimentales para esa Nocturna con **sólo su PRE y turnos PRE 12/10 correspondientes**, nunca usando las cabezas nocturnas objetivo. Si no existen PRE intradía comparables para esa Nocturna en los archivos, diagnosticar estado por fuente acumulada pero no fingir una reconstrucción exacta de los 5 cortes.

## Regla de decisión
No promocionar ninguna regla simplemente porque rescate 851 retrospectivamente o porque aumente Top3 con Top10 menor. Valorar diferencias pareadas, costos de exclusión y controles negativos, sin afirmar poder de anticipación. El principal entregable es una descripción verificable de **nacimiento físico, convergencia y permanencia**, aunque ninguna regla mejore el ranking.
