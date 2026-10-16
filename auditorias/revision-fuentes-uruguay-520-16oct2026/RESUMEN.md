# Corrección de fuentes históricas: impacto en 520 cortes VT3

**16/10/2026 · Re-ejecución retrospectiva completa. Modelos estables y APK 0.3.5 intactos.**

## Problema inicial
La rama `lab/vt3-secuencias-columnas-510-16oct2026` descartaba por fecha completa `2026-06-20` y `2026-07-09`, aunque los sorteos Nocturnos uruguayos de esas fechas se celebraron realmente y están publicados en DNLQ. Esas fechas **no** tenían cabezas argentinas en Viví Tu Suerte, pero sí debían alimentar la fuente Montevideo de la Nocturna anterior.

Verificación independiente: https://www.loteria.gub.uy/ver_resultados.php?vano=2026&vdia=20&vmes=6 y https://www.loteria.gub.uy/ver_resultados.php?vano=2026&vdia=9&vmes=7 .

## Método de repetición controlada
- **Exactamente los mismos 104 días objetivo, 520 PRE y 2600 cabezas argentinas**: junio–julio, 51 días/255 PRE, y 15/08–15/10, 53 días/265 PRE.
- Conservamos Montevideo 20/06 y 09/07 en el historial de referencia, pero **no** los añadimos como jornadas de cinco cabezas argentinas con resultados ficticios.
- El resto del código de construcción, familias VT3, geometría, fuentes, ranking Lalo y Geometría completa son **los mismos**. No se ajustó un peso.
- Comprobación de invariantes en tiempo de ejecución: si la fuente modificara 20/06 `0963` o 09/07 `0802` la auditoría detiene la comparación en vez de aceptar silenciosamente una Nocturna distinta.
- Se almacenó SHA-256 por fecha y las rutas físicas por cada familia/turno.

## Resultado

| Indicador | Auditoría previa | Datos históricos corregidos |
|---|---:|---:|
| Cortes PRE | 520 | **520** |
| Cabezas argentinas evaluadas | 2600 | **2600** |
| Cabezas con familia VT3 físicamente disponible | **660** | **654** |
| Aciertos familiares Top3, Modelo Lalo oficial | **14** | **13** |
| Aciertos familiares Top3, Geometría completa | **17** | **17** |
| Historias visuales guardadas | 1002 | **1016** |

**35/520 cortes**, distribuidos en **7 jornadas**, cambiaron al menos uno de estos elementos: familias físicamente disponibles, procedencia de familias, recorrido previo, Top3 oficial o Top3 de Geometría.

Jornadas afectadas: **22, 23, 27 y 29 de junio; 10, 11 y 17 de julio**. Las 265 pruebas de agosto-octubre se mantuvieron exactamente iguales.

### Bases +11 restituidas
- **PRE lunes 22/06**: anterior real, sábado **20/06**, solo Montevideo Nocturno **`0963`**. Pares `['--','--','--','--','--','74']`; la única pareja no permite formar recorridos VT3 de tres casillas. **Top3 VT3 de Previa legítimamente vacío.**
- **PRE viernes 10/07**: anterior real, jueves **09/07**, solo Montevideo Nocturno **`0802`**. Pares `['--','--','--','--','--','13']`; idéntica limitación: **no hay Top3 VT3 de Previa** hasta que se incorpore otra columna.
- Antes, ambas hojas se armaban erróneamente con una Nocturna argentina/uruguaya completa de **viernes 19/06** o **miércoles 08/07**, respectivamente. Eso creaba familias con recorridos físicos **que no estaban presentes en la Nocturna correcta**.

El efecto también llega a días siguientes y a consultas D−7: 23/06, 27/06, 29/06, 11/07 y 17/07. No contar los cinco turnos de esos días como pruebas independientes entre sí.

### Por períodos
| Métrica | Junio–julio anterior | Junio–julio corregido | Agosto–octubre |
|---|---:|---:|---:|
| VT3 físicamente trazable | 326 | **320** | 334 (sin cambio) |
| Top3 Lalo | 8 | **7** | 6 (sin cambio) |
| Top3 Geometría | 6 | **6** | 11 (sin cambio) |

En el total corregido, **654** cabezas disponían de al menos un recorrido VT3: **50** estaban en la base inicial Nocturna, **145** nacían en el corte actual por una nueva columna, **41** recibían otra fuente y **418** estaban presentes sin sumar fuente en ese corte. Son **apariciones por cabeza y turno**, no familias diferentes de todo el período.

## No confundir corrección con mejora
Que el Lalo oficial pase de 14 a 13 aciertos en el histórico **no significa que el motor empeoró**: cambió la fidelidad de la entrada. Lo correcto es retirar los seis recorridos que habían aparecido gracias a fuentes equivocadas y evaluar de nuevo. Una base con resultados históricamente falsos no sirve para elegir motores aunque eleve retrospectivamente alguna coincidencia.

No se cambiaron familias, madres VT3/VT4, reglas de contactos, vistas PRE/POST ni ranking; **se corrigió únicamente la reconstrucción externa del laboratorio**. La app de producción ya usaba `loadPreviousDraws`, que acepta correctamente una fecha con solo Nocturna uruguaya; se agregó una prueba permanente en `main` para no perder esa propiedad.

## Evidencia
- Corrida anterior: https://github.com/y0t3/Modelo-Papa/actions/runs/38863258376
- Corrida corregida **success**: https://github.com/y0t3/Modelo-Papa/actions/runs/38871916816
- Rama: `lab/revision-520-pre-con-uruguay-verificado-16oct2026`.
- Archivo completo de 520 PRE corregidos, caminos y 1016 historias: `VT3_MOVIMIENTOS_FUENTE_VERIFICADA_JUN_OCT_2026.json` en artefacto `LAB-VT3-SECUENCIAS-JUN-OCT-2026`.
- Auditoría específica de proveedor: `lab/verificacion-historica-jurisdiccion-turno-16oct2026/auditorias/verificacion-historica-fuentes-16oct2026/RESUMEN.md`.
- Diferencias por los 35 cortes extraídas de ambas ejecuciones: archivo `Modelo-Lalo-Revision-Historica-Diferencias-520.json` adjunto a esta conversación.

**Todos son resultados de familias VT3 en retrospectivo y de corpus repetidamente estudiado; no predicción independiente de sorteos futuros ni probabilidades de ganar.**
