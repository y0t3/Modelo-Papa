# Piloto independiente de Lalo Auxiliar · AYER y HOY · VT2

**29/10/2026.** Estudio retrospectivo sobre **15 jornadas sorteables del 12 al 28 de octubre de 2026** y **150 cortes** (15 jornadas × 5 turnos × 2 modos). Reproducción del código AUX existente con resultados publicados reales, sin añadir cabezas ni mirar el resultado objetivo para construir el PRE. Ninguna modificación en Lalo MV1, las reglas físicas, el algoritmo Auxiliar, Top10, `main` ni APK.

## Diferencia física esencial

- **AUX AYER:** el tablero Santiago–Neuquén del día anterior está completo desde el comienzo de la jornada; permite leer las tres columnas en todos los turnos del objetivo.
- **AUX HOY:** antes de Previa todavía no existen cabezas del día para armar esa hoja; en Primera ya se conoce la columna Previa, en Matutino hay dos columnas, y desde Vespertino hay tres. No se utilizan fuentes futuras para anticipar.
- Ambos modos se construyen sin +11 y con recorridos contiguos válidos que sí pueden cruzar columnas Santiago–Neuquén, a diferencia de la hoja Lalo principal.
- Las raíces auxiliares D−1 y D−7 se reconstruyen conforme a las políticas de disponibilidad de cada modalidad. Las cabezas objetivo se usan solamente después para el cotejo.

## VT2: cobertura real de cabezas en Top10

| Turno | AYER: aciertos Top10 | HOY: aciertos Top10 |
|---|---:|---:|
| Previa | 14 | 0 (no hay tablero HOY todavía) |
| Primera | 18 | 7 |
| Matutino | 16 | 17 |
| Vespertino | 16 | 11 |
| Nocturno | 15 | 12 |

Son **cabezas coincidentes**, no familias únicas ni aciertos económicos. Las jurisdicciones y sorteos disponibles no son idénticos en todos los cortes; por eso se conservan también los conteos de resultados reales publicados en el JSON.

## ¿Las familias que ya acertaron durante la misma jornada vuelven a aparecer?

Contando únicamente cabezas nocturnas con su familia dentro del Top10 AUX:

- **AYER: 9 de 15** coincidencias nocturnas pertenecían a familias VT2 que ya habían coincidido en un Top10 auxiliar anterior del mismo día.
- **HOY: 2 de 12** coincidencias nocturnas tenían ese antecedente.
- Comparación de **dos familias por turno** (Top2 natural vs. priorizar familias ya ganadoras ese día, completando de arriba si faltaban):
  - AYER Primera: **4→6** cabezas; Matutino: **3→6**; Vespertino: **4→4**; Nocturno: **2→2**.
  - HOY Primera: **2→2**; Matutino: **6→6**; Vespertino: **3→3**; Nocturno: **1→3**.

**No existe base suficiente para recomendar ese selector:** 15 días y pocos hits Top2; cambios de ±2 o ±3 pueden ser aleatorios. El propio contraste de Nocturno AUX AYER recuerda que una concentración entre los diez no implica necesariamente mayor captura con solo dos candidatos.

## Cambios de etapa (exploración)

- AUX AYER Nocturno: 9 coincidencias Top10 del 12 al 20, y 6 del 21 al 28; dentro de ellas repitieron familia 6 y 3, respectivamente.
- AUX HOY Nocturno: 11 coincidencias Top10 del 12 al 20 y apenas 1 del 21 al 28; repetición intradía 2 y 0.
- En Matutino HOY, el Top10 pasó de 5 coincidencias (12–20) a 12 (21–28), aun sobre sólo siete jornadas en el segundo tramo.

Hay cambios fuertes de composición temporal, pero **no están validados como regímenes predictivos**; tampoco se demostró que escoger dos familias por memoria de cinco o seis días supere una selección comparativa congelada.

## Conclusión práctica y próximos controles

1. La futura capa visual **puede reutilizar componentes** de Info y Predicción; los datos deben provenir exclusivamente de la grilla auxiliar real y la modalidad activa.
2. No copiar las etiquetas «ganó antes hoy», «subió puesto» ni «estaba hace una semana» del motor principal al AUX sin reconstruir sus rankings PRE correspondientes; no comparar nombres de familia entre motores como si fueran iguales respaldos físicos.
3. Conservar el **Top10 fijo y aciertos POST** en AYER y HOY, ya implementado en la rama de interfaz.
4. Para evaluar señales del auxiliar: ampliar el período, controlar disponibilidad real de cada una de las seis cifras Santiago/Neuquén y jurisdicciones sorteadas, estudiar D−7 y posiciones del Top10 con **ventanas de 5–6 jornadas**, y después realizar cortes PRE prospectivos sin reajuste.

## Fuente reproducible

`scripts/lab-vt2-aux-relaciones-ayer-hoy.ts` usa las mismas funciones de extracción y construcción auxiliar que la app y crea `auditorias/aux-vt2-relaciones/resultados.json` con los **150 cortes individuales**, familias, posiciones y cabezas POST. El archivo se conserva como artefacto de [GitHub Actions #40842244624](https://github.com/y0t3/Modelo-Papa/actions/runs/40842244624).

**Toda esta información es retrospectiva, sujeta a exploración múltiple y no demuestra mejor pronóstico que el azar ni rentabilidad futura.**
