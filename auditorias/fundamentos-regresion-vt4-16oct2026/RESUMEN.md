# Auditoría de fundamentos: regresión de lectura VT4 en panorama

**16/10/2026 · Corrección comprobable en laboratorio. `main`, MV1, Modelo Lalo y APK 0.3.5 conservados.**

## Alcance

Referencia congelada: `main` commit `7ea5ac1b82fda4fa4a045aab90d10ae6f2388b30`. Se auditaron `src/paths.ts`, `src/sheet.ts`, `src/motorLalo.ts`, `src/vt3Shadow.ts`, `src/panoramaModel.ts`, `src/cabezas.ts`, `src/drawHistory.ts`, `src/dates.ts`, y las pruebas estables.

Fundamentos no negociables:
- +11 sobre últimas dos cifras de la cabeza (preservando ceros), hasta seis filas de parejas de dígitos por fuente.
- VT2/VT3/VT4 con celdas físicamente adyacentes, sin saltos, reutilizar casillas ni cruzar turnos/fuentes.
- Mostrar caminos de cabezas **ganadoras comprobadas** en hoja POST, todos los válidos, sin marcar candidatos ficticios.
- PRE nunca lee cabezas del turno objetivo, ni columnas futuras.
- Familias VT3 reversibles: `044/440`, madre real de ambas orientaciones.
- Hija VT4 = **cifra añadida a la izquierda** de una madre VT3 real y con recorrido de 4 casillas propio: `044/440 + 3 => 3044/3440`. **Jamás** invertir `3044` entero para fabricar `4403`.
- Montevideo es jurisdicción para llenar fuentes reales de la hoja y para cotejo personal cuando corresponda, pero no un sexto objetivo argentino del experimento Top3.

## Hallazgo confirmado: inversión VT4 indebida en la lectura de panorama PRE

**Original en `src/panoramaModel.ts`, función `buildPredictivePanorama`:**

```ts
for (const v of [r.value, reverseString(r.value)])
  if (!p.readings.includes(v)) p.readings.push(v);
```

El bloque se aplicaba a `vt2`, `vt3` y `vt4` indistintamente. **Consecuencia real:** la vista `MiniRoutePreview` usaba `route.readings.join(' o ')` y podía presentar una VT4 invertida entera como si surgiera del mismo recorrido. Una ruta física para `3044` obtenía lecturas `3044 o 4403`, aunque `4403` cambia el prefijo de la familia madre y NO es hija de `044/440`. La tarjeta/ranking del motor no inventaba ese candidato; el **error era de presentación de la hoja predictiva**.

**Corrección mínima propuesta exclusivamente en laboratorio:**

```ts
const readings = kind === 'vt4'
  ? [r.value]
  : [r.value, reverseString(r.value)];
for (const v of readings)
  if (!p.readings.includes(v)) p.readings.push(v);
```

Con ello:
- VT2 y VT3 mantienen sus dos lecturas físicamente reversibles.
- VT4 muestra exclusivamente lecturas ligadas a testigos físicos propios `r.value`; si existe `3440` con su ruta independiente, se muestra, pero la UI jamás añade `4403` a partir de `3044`.
- **No se cambia** `src/motorLalo.ts`, VT3, VT2, VT4, Top3/Top10, la formación de familias, el estado PRE/POST ni marcaciones de la hoja diaria.

## Pruebas y controles

Prueba añadida: `scripts/test-auditoria-invariantes-vt4.ts`.

Comprueba lo siguiente sobre una misma fuente de 6 × 2 celdas con dos hijas realmente trazables:
- `vt4PrefixFamily('044/440','3')` da `3044/3440`, nunca `4403` ni `0443`.
- Si el testigo es solo `3044`, el panorama devuelve **solo** `3044`; no inventa inversión completa.
- Una segunda ruta de `3440` debe existir efectivamente en las casillas de la grilla y conservarse como lectura independiente.
- `044/440` en VT3 y `04/40` en VT2 **siguen siendo reversibles**.
- `compareMotorLaloAfterDraw` confirma VT4 solo por valor físico exacto; no considera `4403` como coincidencia de `3044/3440`.

Workflow de prueba aislado: `.github/workflows/lab-auditoria-invariantes-vt4.yml`. Ejecuta `tsc --noEmit` y todas las **15 pruebas de regresión existentes** del proyecto, además de la nueva. No publica APK ni fusiona cambios.

## Riesgo adicional identificado, NO corregido sin pruebas de fuente

`src/drawHistory.ts` acepta una jornada histórica cuando el proveedor devuelve cualquier Nocturna de cuatro cifras, y `src/dates.ts` omite domingo pero no conoce feriados ni suspensiones reales. Un dato histórico incorrecto —por ejemplo una fecha sin sorteo que el proveedor rellenase— puede convertirse en base +11 del día siguiente y además en memoria D−1/D−7.

**No se recomienda añadir un calendario universal fijo ni inventar resultados:** el próximo laboratorio debería guardar la respuesta cruda con fecha, comprobar ausencia/contradicción contra fuentes independientes y marcar la jornada como `sin_sorteo / verificada / pendiente` antes de usarla como referencia. No reescribir hojas antiguas ni pronósticos PRE ya sellados; distinguir archivo histórico y vista actual.

## Decisión

1. La regresión **de VT4 visible** queda resuelta en **rama experimental**, pendiente de autorización para aplicarla a `main`; es una **corrección de visualización**, no una mejora predictiva ni una nueva versión MV1.
2. Mantener congelados los motores oficiales y la APK mientras se valida cada cambio con controles negativos y positivos.
3. Prioridad siguiente: procedencia/calendario de cabezas históricas, sin convertir automáticamente feriados en fechas vacías sin contraste verificable.
4. La auditoría no justifica ajustar los Tops retrospectivamente.

## Enlaces

- Rama: `lab/auditoria-invariantes-vt4-16oct2026`.
- Código: `src/panoramaModel.ts` y `scripts/test-auditoria-invariantes-vt4.ts`.
- Workflow: `lab-auditoria-invariantes-vt4.yml`. Consultar sus ejecuciones de GitHub Actions antes de fusionar.
