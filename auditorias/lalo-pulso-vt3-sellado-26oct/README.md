# Registro prospectivo congelado — Modelo Lalo vs reactivación de figuras VT3

**Objetivo:** Previa del lunes **26/10/2026**, cinco jurisdicciones con Previa (Ciudad, Provincia, Córdoba, Santa Fé, Entre Ríos). Montevideo figura como origen geométrico en Nocturna, pero no se inventa un turno Previa de Montevideo.

**Estado:** predicción PRE realmente sellada el **domingo 25/10/2026 a las 10:13:57.326 UTC (07:13:57, Buenos Aires)**, antes del día objetivo. NO contiene ninguna cabeza de la jornada del 26/10.

## Registro inmutable

El registro oficial de este experimento es [`sellado-previa-2026-10-26.json`](sellado-previa-2026-10-26.json), incorporado en el commit [`d1a054de5893446d5710ae001111d7aa7bf55228`](https://github.com/y0t3/Modelo-Papa/commit/d1a054de5893446d5710ae001111d7aa7bf55228).

- Ejecución original: [GitHub Actions #40183878771](https://github.com/y0t3/Modelo-Papa/actions/runs/40183878771). Se guarda además un artefacto `sello-pre-pulso-2026-10-26-Previa` con copia del sello y entradas históricas completas (`entradas-historicas.json`).
- Huella SHA256 del contenido base del sello: `3d4c8bc10b24f8f23290c2f41b7692aef9a1897163c1cb1d684c6609b00f8771`.
- Huella SHA256 de entradas históricas: `ab6b02a4bf7e8814ac0d1b4ebd92137f9d38ec470eb11e493729ac82cb094135`.
- El script `scripts/lab-comparar-sellado-previa-26oct.ts --validar` exige esas huellas, los mismos diez miembros, las fechas y la coherencia Top3/Top10, sin consultar resultados objetivos.

### Cabezas Nocturnas de base del 24/10 (por jurisdicción)

| Jurisdicción | Nocturna del sábado 24/10 | Celda +11 |
|---|---|---|
| Ciudad | `0795` | `06` |
| Provincia | `8014` | `25` |
| Córdoba | `5739` | `50` |
| Santa Fé | `6614` | `25` |
| Entre Ríos | `2065` | `76` |
| Montevideo | `0439` | `50` |

La memoria histórica usa seis jornadas completas: 19, 20, 21, 22, 23 y 24/10/2026. Las raíces D−1 y D−7 corresponden a 24/10 y 19/10 respectivamente; sus hojas se construyen con últimas Nocturnas reales **propias de cada jurisdicción**.

### Pronósticos PRE sellados para VT3 (familias reversibles)

| Puesto | Modelo Lalo corregido | Pulso experimental | Pulso activado |
|---:|---|---|---|
| 1 | `205/502` | `205/502` | No |
| 2 | `025/520` | `025/520` | No |
| 3 | `255/552` | `255/552` | No |
| 4 | `026/620` | `026/620` | No |
| 5 | `056/650` | `056/650` | No |
| 6 | `065/560` | `065/560` | No |
| 7 | `505/505` | `505/505` | No |
| 8 | `052/250` | `052/250` | No |
| 9 | `075/570` | `075/570` | No |
| 10 | `275/572` | `275/572` | No |

**Conclusión PRE:** el pulso `1–0–1` **no se activa en ninguna** de las diez familias para este corte. Por lo tanto, las listas oficiales y experimentales son **idénticas**. Esto NO es una victoria de ningún sistema, ni una prueba de capacidad predictiva.

## Definición congelada de PULSO_TOP10

Una familia VT3 de Lalo es prioritaria solo si hay una **misma figura y fuente** con ancla vertical trasladada hasta dos filas, activada por cabeza real en la última jornada, **no activada** en la penúltima, y activada en alguna de las cuatro restantes de las seis jornadas previas. Se evalúa sobre las mismas diez familias reconocidas, nunca inventa familias nuevas ni cruza columnas de la hoja +11. En empate gana la prioridad MV1 original. No se modifica la variante según los resultados del 26/10.

## Comparación POST (preparada, no ejecutada)

Se prepararon `scripts/lab-comparar-sellado-previa-26oct.ts` y el workflow `.github/workflows/lab-post-sellado-previa-26oct.yml`.

**Ejecutar solo después de que se publiquen las cinco cabezas de Previa de Argentina**: crear en ese momento la rama de cotejo `lab/lalo-pulso-vt3-post-26oct2026` a partir de esta rama sellada para disparar la comparación, sin tocar `main` ni modificar el archivo PRE. El evaluador se niega a producir un balance con la jornada parcial o antes del día objetivo; compara VT3 de manera reversible en Top3, Top5 y Top10, y NO recalcula candidatos usando cabezas publicadas después del sello.

Mientras ambos Top3 sean idénticos, este corte no puede distinguir entre reglas de priorización: una coincidencia o ausencia será atribuible al mismo grupo, no a una ventaja del pulso.

## Límites

- Validación de predicciones requiere datos prospectivos posteriores; la anterior mejora histórica 17→22 no fue estadísticamente concluyente.
- Un solo corte no mide rendimiento predictivo.
- No se cambió `src/motorLalo.ts`, ni `main`, ni el APK.
- El workflow automático de SELLADO se desactivó para pushes posteriores; **solo la ejecución original** y el archivo versionado son el PRE congelado.
