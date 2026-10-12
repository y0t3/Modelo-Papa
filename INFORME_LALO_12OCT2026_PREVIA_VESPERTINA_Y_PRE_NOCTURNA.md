# Modelo Lalo — cuatro cortes reales del 12/10/2026 y PRE Nocturna sellado

**Fecha:** 12 de octubre de 2026, Argentina. **Motor evaluado:** `src/motorLalo.ts` sin cambios; una sola fuente de cálculo VT2/VT3/VT4. Datos directos de **Viví Tu Suerte**, la misma API consultada por la APK (`src/cabezas.ts`). Sin reajustar reglas al conocer los resultados.

## Procedimiento cronológico (PRE/POST)

- Para cada uno de los cuatro cortes **Previa, Primera, Matutina y Vespertina**, `scripts/comparar-lalo-12oct2026.ts` reconstruyó la hoja +11 con la Nocturna de la última jornada (10/10), las columnas de turnos realmente **anteriores** al objetivo, y memorias D−7 **05/10** y D−1 operativa **10/10**; se usaron también sus hojas base **03/10** y **09/10**.
- La API devolvió **cinco cabezas argentinas válidas por turno**, 20 en total; Montevideo sin resultados para los cuatro turnos y Nocturna aún vacía.
- `INPUT_PRE.json` está construido con la cabeza del turno objetivo y todas las posteriores **censuradas**, más historias de jornadas ya cerradas. `OBJETIVOS_POST.json` fue trasladado fuera del directorio de trabajo antes de generar `PROPUESTAS_PRE.json`. Únicamente después se cotejaron cabezas para emitir `CONTRASTE_POST.json` y `DIAGNOSTICO_POR_CABEZA.csv`.
- La ejecución de GitHub Actions **#38313281121** terminó con éxito: [ver folio y descargar artefacto PRE/POST](https://github.com/y0t3/Modelo-Papa/actions/runs/38313281121). Artefacto `Modelo-Lalo-12oct-Vespertina-PRE-POST`, ID `11775666640`.
- Los rankings son **familias reversibles** con hasta 10 elegibles por modalidad y corte; varias cabezas acertadas de un mismo turno **no** cuentan como varios cortes. En las 5 jurisdicciones argentinas se examinaron las terminaciones de 2/3/4 cifras, **no cabezas completas predichas**.

## Resultados: cuatro cortes

| Modalidad / familia | Top 3 | Top 5 | Top 10 | Esperanza descriptiva Top10 (elegir aleatoriamente dentro de la misma bolsa/cupo de cada corte) |
|---|---:|---:|---:|---:|
| **VT2** | 1/4 | 2/4 | **4/4** | 3,110 |
| **VT3** | 0/4 | 1/4 | **1/4** | 0,672 |
| **VT4** | 0/4 | 0/4 | **0/4** | 0,244 |

**No son probabilidades calibradas ni evidencia sólida de eficacia**: apenas cuatro cortes, estrategias ya investigadas anteriormente y grandes diferencias de cobertura. VT2 4/4 no implica éxito significativo: con nueve a 33 familias disponibles, un Top10 tiene cobertura alta de base. No afirmar que acierta el número completo.

### Cabezas reales y posiciones PRE

**Previa:** Ciudad `7447`; Provincia `0334`; Córdoba `5276`; Santa Fé `4616`; Entre Ríos `2403`.
- Córdoba `5276`: VT2 `67/76` rango **9**; VT3 `276/672` rango **5**; VT4 exacta `5276/6725` **rango 19**, con **8 testigos físicos propios**, una fuente, y apoyo a través de madres `276/672` y `527/725`. Es un problema de **ordenamiento/cupo**, no de inexistencia física.
- Las restantes cuatro cabezas no tienen terminaciones VT3 o VT4 recuperadas por la bolsa en ese corte.

**Primera:** Ciudad `3825`; Provincia `9554`; Córdoba `3107`; Santa Fé `2696`; Entre Ríos `7634`.
- VT2 acierta `25/52` **5.º** para Ciudad y `45/54` **9.º** para Provincia. Ninguna de las cinco cabezas trae una madre VT3 ni una hija VT4 del universo de candidatas del motor.

**Matutina:** Ciudad `2436`; Provincia `3489`; Córdoba `1099`; Santa Fé `8362`; Entre Ríos `2400`.
- VT2 acierta `36/63` **2.º** con `2436`; la familia `26/62` correspondiente a Santa Fé `8362` existía pero estaba **11.ª**, fuera del Top10.
- Ninguna VT3 ni VT4 de la bolsa llega a formar terminación ganadora en el turno.

**Vespertina:** Ciudad `2716`; Provincia `3433`; Córdoba `4801`; Santa Fé `4903`; Entre Ríos `3245`.
- VT2 `45/54` **6.º** coincide con `3245`; otras familias VT2 físicamente elegibles quedan fuera del Top (`01/10` 13.ª, `16/61` 20.ª, `03/30` 22.ª).
- VT3 `108/801` que explica Córdoba `4801` existía en la bolsa, pero quedó **41.ª**, muy lejos del Top; las cuatro madres restantes no estaban disponibles.
- Ninguna hija VT4 ganadora físicamente disponible en la bolsa.

### Dónde ajustar (SIN cambiar aún el motor)

1. **Cobertura de madres VT3:** de cuatro cortes, uno tiene madre ganadora en Top10, otro sólo en la bolsa (**puesto 41**) y dos no recuperan ninguna de las cinco madres objetivo. Antes de mejorar la cuarta cifra, distinguir entre recuperar madre y ordenarla.
2. **Cobertura de hijas VT4:** entre veinte cabezas, **sólo una** tenía su hija exacta físicamente disponible en la bolsa de VT4, y quedó 19.ª; en tres cortes no había ninguna hija objetivo elegible. No sirve ajustar posiciones si no se amplía de manera justificable la cobertura física.
3. **Sesgo del ordenamiento VT4:** Top10 VT4 quedó **exactamente igual en Previa, Primera, Matutina y Vespertina**, dominado por descendientes de `565/565` y `556/655` con muchos bloques en una sola fuente, incluso cuando las nuevas columnas ampliaron los conjuntos elegibles de 41 a 49 familias. El orden actual antepone el puesto de la madre. Investigar independencia y diversidad de orígenes, sin aumentar cupo arbitrariamente.
4. **VT2:** aunque tuvo cobertura Top10 en los cuatro cortes, el control con presupuesto y bolsa iguales esperaba 3,11. No declarar victoria ni aumentar apuestas. Evaluar discriminación de la familia correcta con controles de densidad/fuentes.
5. **Comparación futura:** probar alternativas congeladas contra historial de 115 cortes y, fundamentalmente, contra nuevos turnos futuros que **no se hayan usado para elegir reglas**. Mantener siempre el modelo medido como referencia.

### Nocturna · propuesta genuinamente previa al sorteo

Antes de existir resultados de Nocturna, se ejecutó `scripts/sellar-lalo-nocturna-12oct.ts` con todas las cabezas anteriores disponibles. El proceso rechaza trabajar si existe alguna cabeza Nocturna; verificó cinco jurisdicciones argentinas completas en cada uno de los cuatro turnos anteriores, aisló el objetivo y generó el Top3/5/10 de los tres modos.

**Sello PRE:** `2026-10-12T21:56:11.783Z` (18:56:11 Argentina), commit `9820e76eb599a81f15099b4ae61479a134acf152`. Ejecutado y almacenado en [GitHub Actions #38313639450](https://github.com/y0t3/Modelo-Papa/actions/runs/38313639450), artefacto `Modelo-Lalo-Nocturna-12oct-PRE-SELLADO`, ID `11775746874`. **No hay resultado posterior ni calificativo de acierto en el archivo**.

| Prioridad | VT2 | VT3 | VT4 |
|---|---|---|---|
| Top 3 | `56/65`, `36/63`, `27/72` | `565/565`, `556/655`, `555/555` | `2565/5652`, `5656/6565`, `5565/5655` |
| Puesto 4–5 | `55/55`, `58/85` | `365/563`, `536/635` | `3565/5653`, `5657/7565` |
| Puesto 6–10 | `45/54`, `78/87`, `35/53`, `04/40`, `17/71` | `276/672`, `424/424`, `265/562`, `526/625`, `255/552` | `5556/6555`, `3556/6553`, `2556/6552`, `3655/5563`, `2655/5562` |

Este folio sirve para una **evaluación prospectiva después** de publicar Nocturna. No implica recomendación de juego ni capacidad predictiva demostrada.

## Decisión

**No retocar puntuaciones con el POST del 12/10**. Es una fotografía útil que detecta fallas específicas del motor y conserva un corte Nocturno verdaderamente anterior al resultado. La versión de la app descargable y su motor siguen sin cambios: la auditoría agregó exclusivamente scripts y archivos de registro.
