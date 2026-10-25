# Nocturna anterior por jurisdicción — integración experimental

**25/10/2026 — Modelo Lalo +11 — rama LAB.** No se modificaron
`main`, la APK oficial ni el núcleo `src/motorLalo.ts` de MV1.

## Por qué se investigó

La app carga sus jornadas anteriores mediante `loadPreviousDraws`.
Esa función considera válida una fecha si contiene *algún* sorteo
Nocturno, incluso exclusivamente el de Montevideo. Si otras
jurisdicciones no tuvieron resultado, su posición en la columna
`prevNocturno` queda `--`; una hoja +11 parcialmente vacía
no puede formar todos los VT2/VT3/VT4 físicamente posibles.

La solución de datos **no** es sustituir toda la jornada:
eso puede borrar una Nocturna uruguaya legítima.

## Implementación preparada

- `src/nocturnaAnteriorPorJur.ts`: busca hacia atrás la **última
  Nocturna registrada de cada jurisdicción**; solo toma fechas
  anteriores, salta los domingos y conserva ceros iniciales.
  Devuelve `dates` (fecha por fila), `checked` y `missing`;
  no crea sorteos ni rellena otras modalidades.
- `fusionarNocturnasPorJur`: actualiza únicamente las filas con
  una Nocturna realmente publicada. Conserva las restantes.
- `src/infoWeek.ts`: función separada `buildInfoWeekPorJur`.
  Mantiene las minihojas INFO consistentes con la hoja +11 diaria,
  sin completar ninguna cabeza del día.
- `App.tsx` (solo en la rama): prepara la **Hoja**, la memoria
  `baseHeads` usada al recargar y los días anteriores de INFO a
  partir de la última Nocturna por jurisdicción.
- Carga concurrente con **cache local por fecha y solicitud**:
  una sola versión por día durante una misma carga, sin congelar
  recargas futuras.
- Referencias `hist` D−1 y D−7 y `buildMotorLalo` quedan exactamente
  como en producción; motores AUX no se mezclan.

## Comprobación histórica contra la aplicación real

**124 jornadas y 620 cortes PRE**, desde el 01/06 hasta 24/10/2026.
**3.321 cabezas efectivamente publicadas**. La comparación se hizo
manteniendo igual el motor y las raíces históricas (solo se sustituyó
el origen de la columna Nocturna anterior).

| Resultado | Aplicación vigente | Hoja por jurisdicción |
| --- | ---: | ---: |
| Cabezas con VT3 exacto físicamente formable en PRE | 852 | **859** |
| Cabezas cuyo VT3 está en cualquier puesto de MV1 | 310 | 311 |
| Aciertos VT3 Top3 | **16** | **16** |
| Aciertos VT3 Top5 | **35** | **35** |
| Aciertos VT3 Top10 | **58** | **58** |

Cambian cinco jornadas objetivo:

| Objetivo | Fila(s) con ausencia en fuente D−1 | Fecha alternativa |
| --- | --- | --- |
| 22/06 | Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos | 19/06 |
| 10/07 | Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos | 08/07 |
| 20/07 | Montevideo | 17/07 |
| 26/08 | Montevideo | 24/08 |
| 13/10 | Montevideo | 10/10 |

Las otras filas conservan su última fecha publicada original.
**No inferir** que ausencia en proveedor implique necesariamente
ausencia de sorteo: una publicación tardía o incompleta podría
producir el mismo síntoma. La fecha de origen se registra por fila
y se debe mostrar en UI si el usuario necesita revisar una base mixta.

Las siete oportunidades VT3 exactas adicionales en POST (NO son
pronósticos) fueron:
- 22/06 Primera Entre Ríos **5319**;
  Matutino Ciudad **9721** y Santa Fe **8231**.
- 10/07 Matutino Ciudad **9718**, Santa Fe **5872**;
  Vespertino Provincia **5398**.
- 13/10 Nocturno Ciudad **3072**.

## Reglas y controles

1. No se toman resultados del objetivo para construir la hoja PRE.
2. No se cruza ninguna columna para formar recorridos.
3. Ceros iniciales: `0000` es una cabeza válida, no «sin datos».
4. Sábados: se buscan los resultados del sábado para las
   jurisdicciones que efectivamente los publicaron; una fila ausente
   puede provenir del viernes, nunca se inventa un domingo.
5. Feriados: se conservan resultados parciales de Montevideo.
6. Si no se encontró la jurisdicción dentro del límite de búsqueda,
   se devuelve `----` con identificador en `missing`, nunca
   una cifra artificial.
7. La recarga diaria usa la misma base por jurisdicción;
   la galería INFO avanza cada fuente únicamente cuando hay
   Nocturna efectivamente publicada.
8. MV1, VT2, VT3, VT4, raíces D−1/D−7 y AUX no se cambian.

### Advertencias antes de integrar a la APK

- La auditoría usó disponibilidad histórica del proveedor. No prueba
  la puntualidad de publicación en cada corte en vivo; antes de
  producción conviene marcar datos no publicados y su fecha de origen.
- Futuros feriados y jornadas inusuales no deben extrapolarse
  automáticamente a partir de una fecha excepcional.
- La fidelidad de la hoja mejora, pero **no existe evidencia de
  aumento de capacidad predictiva** (Top3/5/10 no cambió).
- Ningún trabajo de este laboratorio será enviado a `main`
  o a una APK sin una decisión explícita de integración.

## Evidencia reproducible

- [Auditoría histórica y pruebas base](https://github.com/y0t3/Modelo-Papa/actions/runs/40172524018)
- [App e INFO, test de regressión y TypeScript](https://github.com/y0t3/Modelo-Papa/actions/runs/40172954919)
- `scripts/test-nocturna-anterior-por-jur.ts`,
  `scripts/test-info-week-nocturna-por-jur.ts`,
  `scripts/lab-nocturna-por-jur-app.ts`.
- Artefacto `lalo-nocturna-por-jur-validada` con archivos
  `informe.json`, `cabezas.json`,
  `cortes-pre.json`, `fuentes-por-jur.json`.
