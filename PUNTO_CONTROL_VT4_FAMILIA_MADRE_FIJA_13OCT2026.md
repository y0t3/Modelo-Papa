# Punto de control VT4 — madre fija, cifra y extremo correcto
**13 de octubre de 2026 · rama experimental `lab-vt4-familia-madre-fija-13oct2026`.** Ejecución validada [GitHub Actions #38454718296](https://github.com/y0t3/Modelo-Papa/actions/runs/38454718296) (compilación TypeScript y replay PRE/POST exitosos).

## Corrección solicitada

**Problema real:** el anterior `motorLalo.ts` usaba `reversibleFamily(value)` para las cuaternas VT4, convirtiendo automáticamente `3226` en la familia `3226/6223`. El **camino inverso** `6223` es físicamente legítimo si se recorre el mismo trayecto al revés, pero invertir **cuatro** cifras no conserva el *significado de la familia VT3 madre* en la agrupación.

**Nueva regla, aplicada y probada:**
- La familia estructural VT4 es `familia VT3 madre + cifra agregada + lado de extensión`.
- Para madre `226/622` y cifra nueva `3` **ANTES**: **`3226/3622`**; **DESPUÉS**: **`2263/6223`**. Ambas son familias distintas y cada número necesita su ruta propia de cuatro celdas.
- Para madre `226/622` y cifra `5` ANTES: **`5226/5622`**; DESPUÉS: **`2265/6225`**.
- Nunca formar una variante sólo por invertir los cuatro dígitos o añadir una cifra abstracta. Cada `physicalValues` contiene **exclusivamente cuaternas completas trazadas físicamente** por recorridos exactos desde una madre VT3 Top10 de su misma fuente, con cuatro casillas vecinas sin saltos ni reutilizaciones.
- `compareMotorLaloAfterDraw` evalúa VT4 por **valor real `p.value` de sus testigos**, no por su antigua familia reversible de cuatro cifras. Para VT2/VT3 se conserva la lógica original.
- Metadatos descriptivos `vt4Meta={motherFamily,addedDigit,side}` y `physicalValues` permiten explicar procedencia y qué variante existe realmente. El texto de la tarjeta indica cifra y lado, madre, bloques y variantes trazadas.

## Validación del código y del histórico

- El código de Expo/React Native compiló sin errores con `npx tsc --noEmit`.
- Se reejecutaron los **115 cortes** históricos, con PRE antes de consultar cabezas y POST sólo después del sello. Se ejecutaron **simultáneamente el motor previo y el corregido** desde el commit antiguo `c0aeea35831efb7a926c0f26b45f07a644f4e1a4`.
- **VT2 y VT3 son idénticos a nivel de objetos y rankings en los 115 cortes**, y también en la reconstrucción de Primera/Matutina 13/10.
- Se verificaron, **para cada ruta VT4** de todos los cortes: cuatro celdas distintas, contigüidad real, coincidencia exacta con valores del tablero en su única fuente, segmento VT3 contiguo que coincide con la madre agrupada, y que ese mismo segmento es una **ruta real previamente admitida de una madre VT3 Top10**.
- Se revalidó el sello VT3 Matutina original de las 13:52 con hash `067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41`; no lo modificamos.

## Resultado de las 10 primeras VT4 en el 13/10

| Nuevo puesto VT4 | Familia estructural correcta | Madre VT3 |
|---|---|---|
| 1 | `2263/6223` | `226/622` |
| 2 | `2265/6225` | `226/622` |
| 3 | **`3226/3622`** | `226/622` |
| 4 | **`5226/5622`** | `226/622` |
| 5 | `2266/6226` | `226/622` |
| 6 | `6226/6622` | `226/622` |
| 7 | `3056/5036` | `305/503` |
| 8 | `6305/6503` | `305/503` |
| 9 | `3057/5037` | `305/503` |
| 10 | `7305/7503` | `305/503` |

**En el corte 13/10, ambos miembros `3226` y `3622` están respaldados por recorridos físicos verdaderos**, al igual que `5226` y `5622`. La existencia de los dos miembros **no se presupone** para otros cortes.

**No se ganaron espacios de otras madres** al corregir sólo la agrupación. La prioridad de mejor madre VT3 sigue intacta: en Primera y Matutina, seis familias provienen de madre VT3 #1 y cuatro de #2. Aunque el etiquetado ahora responde a la regla del usuario, el **reparto de Top10 por madres NO cambió**.

## Efecto sobre la cantidad de familias y duplicaciones

En los 115 cortes:
- Pool medio anterior: **66,69** agrupaciones VT4 reversibles por corte.
- Pool medio con familia estructural: **95,03** agrupaciones VT4 por corte.
- En **13/115** cortes hay al menos un **rótulo de familia estructural repetido en el pool completo** (se origina por múltiples claves distintas de madre+cifra+lado con igual etiqueta textual). Se registra para depurar en la interfaz y prevenir identificadores duplicados en próximos ensayos.
- En **113/115** cortes existen **cuaternas físicas que pueden estar en más de una agrupación estructural** por proceder de madres o extremos distintos. Este caso no es un error geométrico ni dos resultados ganadores: una misma cabeza puede tener múltiples explicaciones físicas; **no contar la misma cabeza más de una vez como acierto** ni interpretar dos posiciones de Top como dos cabezas independientes.
- La nueva agrupación **no reduce necesariamente el número de familias**; al conservar por separado lado y procedencia puede aumentarlo. Por eso aumentar la diversidad del Top10 necesita un **ensayo aparte** de reparto entre madres y de superposiciones de cifras completas.

## Revisión de cabezas del 13/10

| Turno y cabeza | Familia reversible VT4 antigua | Familia(s) estructural(es) nueva(s) que realmente trazan la cabeza | Resultado |
|---|---|---|---|
| Primera Ciudad **5485** | `5485/5845` (#35 antiguo) | `5485/5584` (**#52**, madre `485/584`, cifra 5 ANTES); `5485/8455` (**#87**, madre `548/845`, cifra 5 DESPUÉS) | Fuera Top10 |
| Matutina Provincia **1057** | `1057/7501`, sin puesto | Ninguna: su VT3 materna no estaba admitida Top10 | Sin puesto |

Los puestos #52 y #87 no son dos cabezas ganadoras; **una sola cabeza 5485 tiene dos interpretaciones estructurales VT4 válidas**. Los testigos proceden de segmentos reales de sus madres; ninguno crea caminos nuevos.

En Primera y Matutina del 13/10, **0 aciertos Top3, Top5 y Top10 VT4**, tanto antes como después de corregir la agrupación. Montevideo Matutina 3629 permaneció sin VT4, aunque figuró Top5 en VT3.

## Resultados retrospectivos 115 cortes
Con las cinco jurisdicciones argentinas por corte:
| Modo | Top3 /115 | Top5 /115 | Top10 /115 |
|---|---:|---:|---:|
| VT4 previo (cuaterna reversible completa) | **0** | **0** | **0** |
| VT4 corregido por madre VT3 y extremo | **0** | **0** | **0** |

**Esta corrección es semántica y geométrica, no una mejora de aciertos.** El laboratorio también deja demostrada otra limitación, anterior e independiente: el Top10 aún está dominado por las dos primeras madres, y los posibles solapamientos de cuaternas entre distintas familias deben seguir auditándose. Además, son fechas históricas repetidamente analizadas; no concluir capacidad predictiva por los números de esta muestra.

## Decisión, despliegue y próximos pasos
**Corregido y validado en la rama lab, NO integrado a `main` ni a la APK instalada.** Mantener el modelo previo inalterado en producción hasta revisar la representación en pantalla y las identificaciones repetidas. La siguiente etapa debería predefinir una distribución de diez plazas VT4 por **madres VT3 diferentes** y verificar que una misma cabeza/cuaterna no use dos plazas sin aportar una cifra física adicional. Eso modifica el ranking, por lo que exige control con igual cupo y nuevo sello prospectivo. **No aprovechar esta modificación de familia para ajustar simultáneamente prioridades o admisión**, ya que impediría atribuir qué cambio produjo cada efecto.

Archivos:
- `src/motorLalo.ts` — familia estructural VT4 y evaluación POST física, VT2/VT3 idénticos.
- `PROTOCOLO_VT4_FAMILIA_MADRE_FIJA_13OCT2026.md`
- `scripts/lab-vt4-madre-fija.mjs`
- `.github/workflows/lab-vt4-madre-fija.yml`
- `auditorias/vt4-madre-fija-115-13oct2026/{PRE_115.json,PRE_13OCT.json,SELLO.json,POST_115.json,RESUMEN.json}`
- [GitHub Actions 38454718296, exitosa](https://github.com/y0t3/Modelo-Papa/actions/runs/38454718296)
