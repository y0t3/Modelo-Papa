# Modelo Lalo · jornada 20 de octubre de 2026

**Fecha del cotejo: 21/10/2026. Laboratorio aislado `lab/cotejo-lalo-20oct2026`**. El motor MV1 congelado no fue modificado; el código de producción y APK continúan en `main`.

## Protocolo auditado

- Resultado objetivo: **martes 20/10/2026**, con cinco cabezas argentinas por turno (25/25) recuperadas del mismo endpoint RAW que utiliza la app.
- Históricos para Lalo: **D−1 = lunes 19/10**, **D−7 = martes 13/10**. En Conectadas se admiten como máximo seis jornadas anteriores, no el objetivo.
- Se reconstruyeron estrictamente los PRE de Previa, Primera, Matutino, Vespertino y Nocturno. La cabeza objetivo, sus matches y todas las columnas posteriores estuvieron ocultas del cálculo. Al contrastar las salidas solo después se incorporaron las cabezas sorteadas.
- Conteo de VT2/VT3: **familia reversible** de últimas dos/tres cifras, incluyendo inversión válida; cada cabeza objetivo cuenta como máximo una vez por método. VT4 requiere **4 cifras exactas y recorrido físico exacto**; no se invierten cuatro cifras ni se inventan madres.
- Verificación de consistencia: al repetir el 19/10 se reprodujeron las cinco cabezas físicamente VT3 halladas antes y el único acierto oficial Top5; el script falla si deja de cumplir el invariante.
- Es **replay histórico PRE**, no Tops realmente sellados antes de sortear.

## Datos: 20 de octubre

| Turno | Ciudad | Provincia | Córdoba | Santa Fe | Entre Ríos |
|---|---|---|---|---|---|
| Previa | 6717 | 4805 | 2274 | 9101 | 9075 |
| Primera | 0327 | 3273 | 9422 | 8568 | 2488 |
| Matutino | 3519 | 3923 | 7122 | 8637 | 1882 |
| Vespertino | 3472 | 1788 | 6461 | 7635 | 4066 |
| Nocturno | 2697 | 7310 | 2647 | 2521 | 6315 |

Montevideo Matutino 3987 y Nocturno 2876 no formaron parte del conteo argentino, aunque sí pueden aportar como fila a la hoja según el motor.

## Resultados

| Métrica | 19/10 | 20/10 |
|---|---:|---:|
| Cabezas argentinas con VT2 físicamente posible | 17 | **13** |
| Con VT3 físicamente posible | 5 | **5** |
| Con VT4 exacto físicamente posible | 2 | **3** |
| Lalo VT2 Top5 | 7 | **1** |
| Lalo VT2 Top6 | 8 | **2** |
| Lalo VT3 Top5/Top6/Top10 | 1 | **0** |
| Geometría VT3 Top10 | 0 | **0** |
| Conectadas VT3 Top10 | 1 | **0** |
| Lalo VT4 Top6 exacto | 0 | **0** |

Por turno del 20:

| Turno | VT2 posibles | VT3 posibles | VT4 físicos exactos | VT3 Top6 Lalo |
|---|---:|---:|---:|---:|
| Previa | 2 | 1 | 0 | 0 |
| Primera | 2 | 1 | 1 | 0 |
| Matutino | 2 | 1 | 1 | 0 |
| Vespertino | 3 | 0 | 0 | 0 |
| Nocturno | 4 | 2 | 1 | 0 |

### Cinco VT3 presentes físicamente pero fuera de admisión Lalo

| Turno | Jurisdicción | Cabeza | Familia VT3 | Fuente(s) | VT4 exacto |
|---|---|---|---|---|---|
| Previa | Entre Ríos | 9075 | 075/570 | Nocturna anterior | No |
| Primera | Santa Fe | **8568** | **568/865** | **Nocturna anterior + Previa** | **Sí** |
| Matutino | Santa Fe | 8637 | 637/736 | Nocturna anterior | Sí |
| Nocturno | Córdoba | 2647 | 647/746 | Vespertino | Sí |
| Nocturno | Santa Fe | 2521 | 125/521 | Previa | No |

Ninguna de estas cinco familias aparece siquiera en el ranking **completo** de Lalo VT3. No son familias rank 11 o 20: no existe traslado de una raíz ganadora D−1/D−7 que le permita ingresar.

La mayor novedad es **8568**, familia 568/865, de Primera de Santa Fe:

- Se forma VT3 en Nocturna anterior con ruta 568 `1:1→2:1→3:0`.
- Se forma VT3 en Previa mediante dos rutas físicas 865: `0:1→1:1→2:1` y `2:0→1:1→2:1`.
- Son **DOS fuentes** y **tres recorridos**; no equivale a tres confirmaciones estadísticas independientes.
- También se forma físicamente el VT4 exacto 8568 en la columna Previa por `2:0→2:1→1:1→0:1`. La madre 568 es válida: anteponer 8 a 568 forma 8568. No invertir VT4 completo.
- Ese soporte nuevo por segunda fuente no basta para admitirla en MV1, cuyo principio sigue siendo el traslado de recorridos que explicaron ganadores de D−1 o D−7.
- En el histórico del mismo martes anterior (13/10) no se registró para esos cinco casos una cabeza VT3 ganadora de igual familia (comparación D−7 contextual).

El Nocturno Córdoba **2647** tuvo tres recorridos VT3 de familia 647/746, pero **todos en la misma fuente Vespertino**. Eso no constituye multifuente.

## Experimento aislado: «frías multifuente»

Hipótesis exploratoria **formulada tras observar el 8568**: permitir una familia VT3 fría (físicamente disponible en 2+ columnas, aunque no tenga traslado ganador D−1/D−7) como reserva secundaria.

Selección mecánica sin leer objetivo: ordenar frías por cantidad de **fuentes distintas**, luego bloques físicos y familia alfabética. Reemplazar únicamente la sexta familia del Top6 oficial si hay alguna elegible. No aceptar familias que no formen recorrido físico ni sumar varias rutas de una misma fuente como votos independientes.

| Período | Cortes | Candidaturas frías 2+ fuentes acumuladas | Cabezas ganadoras entre ellas | Fría #1 acertada | VT3 Top6 oficial | VT3 Top6 reemplazado |
|---|---:|---:|---:|---:|---:|---:|
| **12–19/10** | 35 | 333 | 2 | **0** | 4 | **4** |
| **20/10** | 5 | 24 | 1 | **1** | 0 | **1** |

Estas candidaturas son **familia-corte**, no 333 familias distintas ni 333 ensayos independientes. En 2026-10-20 Primera había **una única fría con dos fuentes**, `568/865`; por lo tanto habría ingresado al lugar seis por regla mecánica. En los otros cortes no se obtuvo mejora.

**Interpretación obligatoria:** el 20/10 inspiró la hipótesis; no es una prueba a ciegas. Los controles previos, aunque no reentrenados para el 20, tampoco mostraron ventaja del rescate. La evidencia es insuficiente para corregir MV1 o elevar automáticamente candidaturas multifuente. La regla sólo se conserva como posible **lector informativo / observación**, con futura verificación independiente si se reutiliza.

## Decisión

No cambiar MV1, su ranking VT3 ni el motor de VT4. Ningún resultado no formable debe aportar evidencia. Si el usuario desea proseguir, estudiar en laboratorio la frontera «admitida/ fría» como **dos estados distintos** y buscar si el apoyo multifuente dentro de la jornada predice algo bajo cortes prospectivos sellados, sin confundir dibujo físico con probabilidad.

Archivo principal: `scripts/lab-cotejo-lalo-20oct2026.ts`
Auditoría de control: `scripts/lab-frontera-fria-20oct2026.ts`
Ejecución del laboratorio: https://github.com/y0t3/Modelo-Papa/actions/runs/39615561318
