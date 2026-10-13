# VT3 — falsación temporal por sorteos históricos intercambiados
Fecha de protocolo: 13/10/2026.

## Objetivo
Probar con los **mismos datos disponibles, sin esperar nuevos sorteos** si la cobertura física y el Top3/5/10 VT3 sellados coinciden más con los resultados de su fecha/turno que con otros resultados históricos asignados a esas mismas hojas.

**No se trata de nuevos candidatos ni de una predicción:** barajar sorteos equivale a un control negativo de asociación. El azar real puede generar rachas. El corpus (23 jornadas, 115 cortes) fue utilizado en numerosos ensayos; por tanto NO es holdout externo aunque se impida fuga temporal dentro del PRE.

## Entradas inalterables
- PRE con 115 cortes, inventarios físicos y rankings A/B/C/D de `lab-vt3-cobertura-bifurcaciones-13oct2026`, SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`.
- POST histórico del mismo laboratorio, sólo para evaluación y asignación placebo; el PRE no se recalcula.
- Los resultados de la Nocturna 12/10 **NO** se incorporan (están fuera de las 115 observaciones). No se alteran los sellos de su predicción real.
- Familia reversible formada por últimas tres cifras; palindrómicas cuentan una sola vez, inversas sin permutaciones.

## Comparaciones fijadas antes de ejecutar
Las unidades son **cortes fecha×turno**, con 5 cabezas por corte. Se cuentan cortes con ≥1 coincidencia (no cabeza×corte independiente).

Resultados primarios: `A.top10` (motor original) y `B.pool` (inventario físico completo). Secundarios: `A.pool`, `A.top3`, `A.top5`, `B.top10`, `C.top3/5/10`, `D.top3/5/10`; además diferencia `C.top10-A.top10`.

Se conservan las **cinco cabezas y los cinco turnos de una misma jornada como un bloque**, moviendo el bloque POST entre jornadas, sin desarmarlo por jurisdicción ni sorteo. Ninguna cabeza se altera ni se inventa; no se combinan fuentes de tableros.

1. **Rotación exacta de jornadas (22 desfases)**: desplazar resultados completos k=1..22 jornadas operativas sobre las 23 hojas PRE. k=0 es resultado verdadero. Proporciona tabla de negativos concretos y permite inspeccionar si la alineación correcta es una excepción.
2. **Permutación libre 20.000 veces**: mezclar bloques de resultados de 23 fechas, conservando todos los sorteo/turnos dentro del día, semilla fija 20261013.
3. **Permutación dentro del mismo día de semana 20.000 veces**: restringir intercambio a fechas de igual día semanal; conserva la estructura del referente D−7, sin realinear columnas.
4. **Permutación dentro del mismo mes 20.000 veces**: comprueba sensibilidad a cambios septiembre/octubre.

Todos los 20.000 intercambios de cada categoría usan PRNG determinista y exactamente el mismo método para todos los Tops, sin seleccionar la mejor corrida. Informar media, p5/p50/p95, máximo, y cola empírica unilateral `(1+count(placebo >= real))/(1+N)`. Comparar top10 y cobertura (más grande no es necesariamente más específico); no convertir un p exploratorio en validación. Mostrar aciertos por mes y corte real si ayudan a interpretar.

La clasificación de candidaturas permanece congelada, incluido que los inventarios completos tienen familias sin anclaje. Si el Top no supera los controles o varía mucho con desfases, no crear bonificaciones; el resultado apunta a mejorar la definición y la discriminación, no a vender un pronóstico.

## Salidas
Script `scripts/lab-vt3-placebos-cronologicos.mjs`; Actions con resultados permanentes `auditorias/vt3-placebos-cronologicos-115-13oct2026`. Nunca cambiar `main`, `src/motorLalo.ts`, ranking oficial, APK, hoja marcada, o VT4. La interpretación debe dejar claro que optimizar criterios sobre estas mismas 23 jornadas también sesga el contraste.
