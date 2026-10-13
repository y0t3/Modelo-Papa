# Punto de control · Madres VT3 con raíces distintas e hijas VT4

13/10/2026. Continuación del laboratorio de independencia física, base `d5dbcf49ecc1941e1f890bbe9f74dc68e96f1f89`. Rama `lab-madres-vt3-hijas-vt4-13oct2026`. Producción, APK y tablero +11 intactos.

## Qué se fijó y ejecutó

Protocolo en `PROTOCOLO_MADRES_VT3_HIJAS_VT4_13OCT2026.md`; runner reproducible Node 24 en `scripts/lab-madres-vt4.mjs`. Diez madres exactas por corte, todos sus caminos conservados, hijas de cuatro casillas contiguas sin repetición y sin cruce de fuente. Cada madre declarada por una hija debe aportar un tramo propio de tres casillas contiguas.

Se comparan el motor original, la prioridad binaria a **una fuente + varios bloques actuales + varios eventos de cabeza histórica + varios bloques históricos**, y un control parcial que sólo exige **una fuente + varios bloques actuales**. Los desempates conservan el orden original. Se renumeran las madres antes de aplicar la puerta VT4 original; por tanto, el ensayo cambia tanto la selección como el orden relativo de madres. Bloques distintos no significa necesariamente bloques disjuntos ni independencia estadística.

El código y el primer hash PRE se publicaron en `5eaa3f913923e81983e0eab24e72e31ee848b058` antes del POST local. La primera ejecución Actions falló antes de preparar entradas por un salto de línea adicional en la copia local del motor usada para calcular su hash esperado. Corrección puramente de integridad en `2195862bd1ec8ad393aca6e34068ad1fcfe3c4ea`: SHA256 remoto correcto `7715327e6922c3c6f032c1075e6bb08927d5ef51c41552fa9e5758814c746074`. Se comprobó igualdad completa de ambos PRE salvo ese metadato. No se cambió ninguna regla tras conocer POST.

PRE definitivo SHA256: `62227deb54cf75bd5f8679d2b6cd53cd55ef90b7405c07f74a2578ce1b90751a`.

Reproducción remota completada y verificada: [GitHub Actions 38344691238](https://github.com/y0t3/Modelo-Papa/actions/runs/38344691238), todos los pasos correctos. Resultados respaldados por Actions en commit `04d3d3456c628de343f813a3afffd82cebbb2643`. El resumen y hash PRE remotos coinciden con la ejecución local.

## Resultados — 115 cortes, 23 jornadas históricas

| Medida | Original | Raíces y bloques distintos | Control bloques |
|---|---:|---:|---:|
| VT3 Top3: cortes con coincidencia | 5 | 6 | 6 |
| VT3 Top5 | 8 | 12 | 9 |
| VT3 Top10 | 15 | 16 | 16 |
| VT4 Top3 | 0 | 0 | 0 |
| VT4 Top5 | 0 | 0 | 0 |
| **VT4 Top10** | **0** | **2** | **0** |
| Cortes con ganadora en toda la bolsa VT4 | 7 | 9 | 7 |
| Exposiciones de familias VT4 ganadoras en bolsa | 8 | 9 | 8 |
| Exposiciones de familias VT4 generadas | 7.669 | 7.299 | 7.306 |
| Bloques actuales acumulados de las diez madres | 3.215 | 3.070 | 3.044 |
| Referencia uniforme VT4 Top10 por bolsa y cupo | 1,215 | 1,364 | 1,252 |

Los Tops cuentan cortes con al menos una coincidencia, no cantidad de cabezas ni rendimiento de apuestas. La referencia es la suma de probabilidades hipergeométricas condicionadas a cada bolsa observada, no una predicción de lotería ni una prueba de ventaja.

La bolsa nueva tiene 370 exposiciones menos (aproximadamente 4,8%). La diferencia no proviene de aumentar el cupo de madres ni de producir más hijas en total. Esto **no descarta otros efectos de densidad por corte**: el control de bloques es parcial y no iguala exactamente geometrías, fuentes y tamaños.

## Los dos Top10 recuperados

| Corte | Cabeza coincidente | Familia VT4 | Madre VT3 | Puesto madre original → nuevo | Puesto hija original → nuevo |
|---|---|---|---|---|---|
| 15/09 Matutino | Provincia 1977 | 1977/7791 | 779/977 | 7 → 2 | 39 → 10 |
| 18/09 Vespertino | Entre Ríos 2735 | 2735/5372 | 273/372 | 3 → 2 | 20 → 9 |

**Ambas hijas ya estaban físicamente disponibles en la bolsa original y ambas madres estaban entre las diez.** El éxito Top10 se debe a promoción en el orden, no a descubrir estas hijas mediante madres nuevas. En el control de bloques se conservaron los puestos 39 y 20.

Testigos propios (coordenadas fila:columna desde cero; fuente `prevNocturno`):
- 1977: `3:1 → 2:1 → 3:0 → 4:0`.
- 2735: `2:0 → 3:0 → 4:0 → 3:1`; también lectura 5372 en `3:1 → 4:0 → 3:0 → 4:1`.

La madre 779/977 reúne tres eventos históricos, dos bloques históricos y tres actuales; 273/372 reúne dos eventos, dos bloques históricos y dos actuales. El PRE guarda todos los caminos propios de las hijas Top10, no sólo estos ejemplos.

Los dos Top10 pertenecen a septiembre: **2/70**. En octubre: **0/45**. VT4 Top3 y Top5 permanecen en cero.

## Ganancias y pérdidas en cobertura completa

El conjunto de diez madres cambió en 106/115 cortes. Se ganaron cuatro cortes con alguna ganadora en bolsa: 21/09 Nocturno, 28/09 Matutino, 28/09 Vespertino y 06/10 Nocturno. Se perdieron dos: 24/09 Previa y 03/10 Matutino. Neto: siete a nueve cortes, con ocho a nueve exposiciones de familias ganadoras. Dos ganancias ocurren en una misma jornada; no son observaciones independientes.

## Verificación y archivos

El laboratorio comprueba igualdad completa de la copia sin reordenamiento y el motor original en los 115 cortes. Reproduce VT3 5/8/15, VT4 Top10 0, cobertura VT4 7 y bolsa acumulada 7.669. Cada PRE se calcula sin el archivo de objetivos POST presente; cada objetivo y turnos posteriores se excluyen de la entrada de su corte. POST verifica el hash del PRE.

Resultados permanentes en `auditorias/madres-vt3-hijas-vt4-115-13oct2026/`:
- `PRE_115.json`: madres, bolsas, rankings y testigos Top10 de los tres métodos.
- `PRE_SHA256.txt`: integridad del PRE.
- `POST_115.json`: comparación completa por corte y resumen diario.
- `RESUMEN.json`: métricas y ganancias/pérdidas pareadas.

## Decisión y continuación exacta

La hipótesis produce una mejora retrospectiva pequeña de Top10, suficiente para conservarla como candidata experimental, insuficiente para cambiar producción. Dos coincidencias frente a referencia descriptiva 1,364 no acreditan ventaja. Son las mismas 23 jornadas reiteradamente investigadas, no fechas nuevas. La Nocturna del 12/10 queda completamente fuera de este ensayo y conserva su contraste prospectivo original.

Siguiente ensayo útil: **separar orden y selección de madres**. Comparar reordenar sólo las diez madres originales frente a sustituir madres manteniendo sus prioridades originales para VT4. Congelar las reglas antes del contraste; conservar el resultado completo y los negativos. Esto permitirá atribuir qué parte de la diferencia viene de promover hijas ya existentes y cuál de abrir nuevas extensiones. Después, comparación prospectiva en cortes nuevos, sin usar esta evidencia para declarar validación externa.
