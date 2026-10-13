# Punto de control VT4 — transferencia de recorridos ganadores D−7 y D−1 por hija física

**13 de octubre de 2026 · rama `lab-vt4-transferencia-rutas-ganadoras-13oct2026`.** Pruebas GitHub Actions [comparativa 115 cortes #38479932383](https://github.com/y0t3/Modelo-Papa/actions/runs/38479932383), [auditoría de cabezas #38480107885](https://github.com/y0t3/Modelo-Papa/actions/runs/38480107885) y [500 controles permutados #38480437951](https://github.com/y0t3/Modelo-Papa/actions/runs/38480437951). **No se modificó `main`, `src/motorLalo.ts`, la app instalada ni un solo sello anterior.**

## Propósito

Preguntamos si una ruta de cuatro celdas **que realmente explicó una cabeza ganadora** D−7 o D−1, previamente marcada en la hoja física de esa fecha, da más información sobre **qué hija VT4 de una misma madre VT3** priorizar en la hoja actual.

El método de familia sigue siendo **madre VT3 reversible + cifra añadida en extremo fijo** (ej.: `3+226/622 → 3226/3622`). No invertir automáticamente cuatro cifras, no prestar raíces a otra hija y no construir caminos ficticios. Las pruebas de ruta respetan **misma fuente**, cuatro celdas distintas vecinas, lectura real del tablero. Los controles `OTRA_FUENTE` son negativos y nunca representan apoyo histórico legítimo.

Se mantiene inalterable el presupuesto: **diez agrupaciones VT4**, dos hijas de cada madre VT3 en puestos #1–#5, sin repetir una cuaterna física en dos plazas.

## Integridad temporal

GitHub Actions retiró físicamente `OBJETIVOS_POST_115.json` y el fixture con resultados del turno objetivo antes de generar nueve políticas PRE. Sólo se consumieron las entradas cronológicas ya selladas `INPUT_PRE_115.json` y las **marcas VT4 históricas efectivas** `history[].sheet.matches` de D−7/D−1. Cada evento se identificó por fecha, período, turno de la cabeza, jurisdicción y cuatro cifras. Las rutas se verificaron contra casillas y dígitos históricos para evitar marcas falsas. Los PRE y SHA256 fueron commiteados antes de restaurar POST. El ranking BASE_CUPO2 reprodujo exactamente el laboratorio anterior en los 115 cortes.

Comparaciones físicas independientes:
- **Recorrido exacto:** misma fuente y mismas cuatro celdas en secuencia, admitiendo inversión de sentido geométrico.
- **Traslado:** misma fuente y forma normalizada de la trayectoria, movida a otra ubicación física.
- **Turno coincidente:** la cabeza ganadora D−7 estuvo en el mismo turno que actualmente evaluamos, además de coincidencia de fuente y forma.
- **Otras fuentes:** placebo de similitud sin legitimidad como antecedente.

## Evaluación por turno, 115 cortes

| Selección de las hijas | Top3 | Top5 | Top10 | Cortes con Top10 distinto al BASE |
|---|---:|---:|---:|---:|
| BASE_CUPO2 | 0 | 0 | **4** | 0 |
| D−7 exacto | 0 | 0 | 4 | 65 |
| D−7 por traslado | 0 | 0 | 4 | 65 |
| D−7 de mismo turno | 0 | 0 | 4 | 65 |
| D−1 exacto | 0 | 0 | 4 | 55 |
| D−1 por traslado | 0 | 0 | 4 | 55 |
| D−7 + D−1 combinados | 0 | 0 | **4** | **84** |
| Control geométrico de otra fuente | 0 | 0 | 2 | 99 |
| Control neutral de hash | 0 | 0 | 1 | 115 |

Todos los criterios D−7/D−1 conservaron los cuatro cortes Top10 de BASE_CUPO2, sin ganancias ni pérdidas a nivel de **cortes**.

### Inventario de marcas históricas

- Promedio **7,957 marcas VT4 ganadoras de cuatro casillas por corte** entre D−1 y D−7. Se contabilizan marcas físicas, **no** cabezas independientes en esa media.
- **70/115 cortes** tenían al menos una hija elegible que compartía fuente y forma con alguna marca D−7.
- **67/115** tenían lo mismo para D−1.
- **36/115** tenían al menos una coincidencia D−7 en fuente y **casillas exactas**.
- Ningún corte carecía por completo de marcas VT4 históricas en sus dos antecedentes.
- En las **7 cuaternas ganadoras físicamente alcanzables por las cinco madres** —distribuidas en 6 cortes— sólo dos tenían semejanza positiva con alguna marca legítima D−7/D−1: `5832` y `2592`, coincidentemente ambas del **mismo corte Matutina 03/10**.

## Diferencia entre cortes acertados y cabezas exactas acertadas

| Método | Cortes Top10 /115 | Cabezas exactas VT4 seleccionadas /575 exposiciones potenciales |
|---|---:|---:|
| BASE_CUPO2 | 4 | **4** |
| D−7 exacto/trasladado/mismo turno | 4 | 4 |
| D−1 exacto/trasladado | 4 | 4 |
| **D−7 + D−1 combinados** | **4** | **5** |
| Otra fuente negativa | 2 | 2 |
| Orden hash neutro | 1 | 1 |

**La combinación añadió una cabeza exacta genuina sin perder las cuatro anteriores**, pero dentro de un corte que ya tenía otra cabeza acertada. No mejoró Top3, Top5 ni cantidad de turnos Top10.

### Reconstrucción física de la Matutina del 03/10

**`5832`**, familia VT4 corregida **`5238/5832`**, madre VT3 `238/832` (#4):
- En la Matutina 03/10 sus caminos físicos de cuatro casillas incluyen el recorrido equivalente `0:0 → 1:0 → 2:1 → 1:1` de la fuente **Primera**.
- Ese mismo recorrido físico exacto había explicado una cabeza real **`3686` de Santa Fe, Vespertina del 02/10**. La señal es **D−1 exacto, una cabeza histórica independiente**.
- BASE_CUPO2 dejó `5832` afuera; D1_EXACTO, D1_TRASLADO y D7_D1_COMBINADO la ascendieron al **puesto 8**.

**`2592`**, familia corregida `2295/2592`, madre `295/592` (#5):
- Reprodujo una **geometría trasladada** de la fuente **Primera** que explicó la cabeza **`3757` de Provincia, Vespertina del 26/09** (D−7 respecto al 03/10).
- No fue igual en casillas exactas: fue la misma secuencia geométrica trasladada, **un evento D−7 independiente**.
- BASE_CUPO2 la tenía en **puesto 9**; D1_EXACTO aislado desplazó `2592`, mientras que D7_D1_COMBINADO conservó `2592` en **puesto 9** y agregó `5832` en el **8**.

El resultado simultáneo de ambas cabezas es evidencia descriptiva de **dos antecedentes históricos reales y diferentes**, no una reconstrucción nacida de mirar las cabezas nuevas. No demuestra que se puedan prever futuros sorteos.

## Control neutral: permutar las señales históricas entre hermanas de la misma madre

Tras observar el salto de 4 a 5 cabezas, se ejecutó un control adicional **no confirmatorio**, con **500 permutaciones PRE selladas**: en cada corte, se redistribuyó aleatoriamente la **tupla completa** de señales D−7 exactas/D−1 exactas/D−7 traslado/D−1 traslado entre las hijas de la misma madre VT3. Se conservaron intactas las rutas físicas, cuaternas, diez plazas, número de madres y distribución de eventos por madre; el control sólo rompía la correspondencia de *qué hija concreta* tenía cada huella antigua.

| Métrica entre 115 cortes | Resultado histórico D−7 + D−1 verdadero | 500 permutaciones neutrales |
|---|---:|---|
| Cabezas completas seleccionadas | **5** | media **3,632**; mediana **3**, rango **3–6** |
| Réplicas que alcanzaron al menos cinco cabezas | — | **62/500 = 12,4 %** |
| Cortes Top10 | **4** | media **3,56** |
| Réplicas que alcanzaron al menos cuatro cortes | — | **248/500 = 49,6 %** |
| Top3 y Top5 | **0** | 0 en las 500 réplicas |

**Interpretación:** aunque la relación entre una ruta ganadora anterior y la hija `5832` está físicamente verificada y elevó una cabeza más, una permutación neutral también logra cinco o más cabezas en aproximadamente **una de cada ocho** réplicas. Eso **no es suficiente** para afirmar que la regla descubrió capacidad predictiva por encima de los controles. El conjunto de 115 cortes ya fue reutilizado y la combinación se exploró tras muchos ensayos.

## Decisión

- **Mantener** como regla estructural VT4 la madre reversible con cifra y extremo fijos, siempre con recorrido real.
- **Mantener** el reparto BASE_CUPO2 como referencia más simple en cobertura por cortes; el sistema de huellas D−7 + D−1 como alternativa **explicable** para investigar, pues consiguió una quinta cabeza sin alterar los cuatro cortes históricos.
- **No promover** esa alternativa al motor instalado por la mejora aislada: muestra pequeña, criterio elegido en corpus reutilizado y controles no concluyentes.
- **Siguiente análisis con los mismos archivos, sin esperar nuevos sorteos:** estudiar cómo detectar sin POST del objetivo las **hijas gemelas de distinto respaldo (D−7 trasladado frente a D−1 exacto) dentro del mismo corte**, y si ese fenómeno ocurre en turnos que todavía no acertamos. Comparar además a hermanos/controles físicos con igual número de eventos. No convertir una explicación posterior en regla prospectiva con una única observación.

## Evidencias respaldadas
- `PROTOCOLO_VT4_TRANSFERENCIA_RUTAS_D7_D1_13OCT2026.md`
- `PROTOCOLO_VT4_CONTROL_PERMUTACION_RUTAS_13OCT2026.md`
- `scripts/lab-vt4-transferencia-ganadoras.mjs`
- `scripts/lab-vt4-transferencia-conteo-cabezas.mjs`
- `scripts/lab-vt4-rutas-placebo.mjs`
- `.github/workflows/lab-vt4-transferencia-ganadoras.yml`
- `.github/workflows/lab-vt4-transferencia-cabezas.yml`
- `.github/workflows/lab-vt4-rutas-placebo.yml`
- `auditorias/vt4-transferencia-rutas-ganadoras-115-13oct2026/{PRE_115.json,INVENTARIO_RUTAS_PRE_115.json,SELLO.json,POST_115.json,RESUMEN.json,ANALISIS_CABEZAS_Y_5832_POST.json,PLACEBO_PRE_500.json,PLACEBO_SELLO.json,PLACEBO_RESUMEN.json}`.
- [GitHub Actions 38479932383](https://github.com/y0t3/Modelo-Papa/actions/runs/38479932383)
- [GitHub Actions 38480107885](https://github.com/y0t3/Modelo-Papa/actions/runs/38480107885)
- [GitHub Actions 38480437951](https://github.com/y0t3/Modelo-Papa/actions/runs/38480437951)

**No se modificó producción.**