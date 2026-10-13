# Protocolo VT3: vigencia y movimiento físico sin borrar memoria
**13/10/2026.** Hipótesis sugerida: una figura puede tener muchos antecedentes sin estar especialmente activa ahora; tampoco un antecedente semanal debe valer como voto perpetuo. La referencia de siete días NO es una regla que se impondrá. Investigación exploratoria sobre el mismo histórico conocido; no demuestra capacidad predictiva.

## Restricciones inalterables
- Ramas de investigación únicamente. No cambiar `main`, `src/motorLalo.ts`, hoja +11, trazos, ranking de producción, cabezas guardadas, APK, ni VT4.
- Mismos **115 cortes (23 fechas × cinco turnos)**, PRE histórico `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`, SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`, y mismo cupo de diez familias *ancladas* de `A_ORIGINAL`.
- Todas las familias son reversibles. No confundir una figura con una cifra de VT4, inversión arbitraria ni un camino a través de fuentes.
- `PRE_115.json` no contiene cabezas objetivo; para crear las propuestas mover físicamente `POST_115.json` y `NOCTURNA_POST_DIAGNOSTICO.json` fuera del directorio del repositorio. Conservar sello SHA del PRE generado antes de restaurar POST.
- Cada fecha contiene 5 cortes; al examinar el corte actual sólo se usan los PRE de cortes *anteriores del mismo día* y de fechas *anteriores* del mismo turno. No utilizar cortes futuros del mismo día ni las cabezas del objetivo. La fuente `prevNocturno` ya está en Previa; otras se habilitan turno a turno. Las rutas y su estado `anchored` proceden de PRE validado físicamente.

## Variables predefinidas
1. **Familia física en jornada anterior del mismo turno:** presencia en `B_INVENTARIO` de la fecha anterior, aun cuando no hubiese raíz transferida. No es confirmación del sorteo. Comparar en 1, 2 y 7 **jornadas operativas previas**, no asumir que sean días calendario consecutivos. Para ventanas incompletas, no cambiar el Top oficial.
2. **Maduración intradía:** familia anclada que ya existía en el PRE del turno inmediatamente anterior de esa fecha y adquiere ahora una ruta anclada propia **nueva** en la nueva fuente. Diferenciarla de (i) familia anclada enteramente nueva para ese día y (ii) familia existente sin rutas ancladas adicionales. No confundir igual fuente/ruta repetida con apoyo independiente.
3. **Persistencia espacial concreta:** una ruta anclada actual se considera *la misma* sólo si coinciden familia reversible, fuente física y secuencia de celdas canónica reversible con una ruta anclada de corte del mismo turno en alguna de las 2 fechas operativas anteriores. No se le da voto extra por duplicación. Contar cuántas veces sucede.
4. Un mismo `PRE` puede contener varias rutas de la misma familia; agrupar al nivel **familia×corte**, no inflar votos contando cada ruta.

## Menú fijo PRE, desempate siempre en orden oficial
- `OFICIAL`.
- `NUEVA_1/2/7`: promover las que no aparecieron físicamente en las respectivas 1, 2 o 7 jornadas previas del mismo turno, con ventanas completas.
- `ACTIVA_1/2/7`: promover las que sí aparecieron físicamente durante esas jornadas; ordenar por cantidad de días con presencia, no por rutas repetidas.
- `MADURA_HOY`: promover familias existentes antes del turno actual con nueva ruta anclada física propia en el último turno (familia + nueva fuente); otras después.
- `NACE_HOY`: promover familias que adquieren su primer anclaje del día en el último turno; otras después.
- `CAMBIO_ACTUAL`: maduración primero, luego nacimiento, luego familias estáticas, todas con el orden oficial como desempate.
- `MISMA_RUTA_2`: promover familias cuya ruta anclada en misma fuente y casilleros ya aparecía en las dos jornadas operativas previas del mismo turno.
- `RUTA_RENOVADA_2`: promover familias sin ningún recorrido anclado idéntico en esas dos jornadas; no aplicar con ventana incompleta.

## Salidas y refutación
- Registrar por corte todos los flags y Tops sin resultados, SHA256 y controles de no fuga; después POST resultados de Top3/5/10 sobre exactamente diez familias, mes, turno, corte, y pérdidas/rescates pareados vs oficial.
- Proveer denominadores con **ventana completa** de 1/2/7 jornadas para distinguir una ausencia observada de falta de historial. Mantener los primeros cinco días separados (90 cortes restantes), y los primeros siete (80 restantes) para comparación uniforme.
- Evaluar la frecuencia de maduraciones y nacimientos físicos PRE, sin suponer que un cambio geométrico implica futuro resultado de sorteo.
- Estos criterios se pensaron mirando el comportamiento histórico conocido y ensayos previos: cualquier mejora es *retrospectiva e in-sample*. No adoptar ninguna regla nueva sin controles adicionales; registrar igualmente políticas peores.

## Objetivo práctico
Distinguir si el Top se está congelando por respaldo antiguo o por **rutas presentes ahora** y estudiar si la vigencia o maduración física merece un diagnóstico transparente en la app, aun cuando no mejore el pronóstico.
