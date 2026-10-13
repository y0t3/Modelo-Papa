# Protocolo VT3 · Auditoría del tercer puesto aprendido y controles del mismo presupuesto
**13 de octubre de 2026. Rama experimental:** `lab-vt3-control-tercer-puesto-13oct2026`. No modificar `main`, motor VT3, hoja, app, sellos originales, APK ni VT4.

## Hipótesis a falsar
En el estudio de aprendizaje semanal, `FUSION_CONSERVADORA` preservó los **dos primeros** miembros VT3 oficiales, eligió sólo una tercera familia por semejanza de recorridos aprendidos la semana anterior, y completó Top10 con las siguientes familias oficiales evitando duplicados. En los 90 cortes de examen obtuvo Top3 4/90 frente a 3/90 y Top10 12/90 frente a 11/90, rescatando `246/642` el 21/09 Vespertino.

**Pregunta:** ¿Ese único rescate proviene de una elección geométrica informativa o de que cualquier familia física fuera del Top10 hubiera tenido una posibilidad parecida? El control debe **conservar exactamente las dos primeras** y el mismo **presupuesto de un candidato nuevo** que la fusión; no compararla con modelos que reordenan los diez.

## Sellos y unidades
- Fuente PRE física y rasgos en `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/PRE_115.json`, SHA256 `42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e`. Cada candidato proviene de rutas reales que no cruzan fuentes ni violan adyacencia.
- Tops congelados de la ejecución anterior en `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/POST_115.json`, rama base y Actions exitoso `38382774124`. El nombre «POST» responde a la ejecución cronológica de entrenamiento X→X+1, que sólo usó las etiquetas de X para elegir la tercera de X+1; **no** significa que este laboratorio pueda volver a diseñarla desde las cabezas X+1.
- Medir exactamente **90 cortes** del examen (18 fechas×5 turnos). Igual presupuesto y mismo Top3: primeras dos familias originales intactas, tercera elegida entre el inventario físico **excluyendo las diez originales**, Top10 = Top1 y Top2 originales + esa tercera + Top3–Top9 originales. Dado que el ranking original tiene diez familias reversibles, la décima sale del Top10 si entra un nuevo miembro.
- A los 90 cortes calcular presencia y características del tercer candidato aprendido: raíz propia sí/no, rutas físicas únicas, fuentes, zona, novedad de forma respecto a las diez oficiales, frecuencia repetida de familias y grado de respaldo propio, sin agregar raíces ni caminos.
- Unidad de éxito Top3/5/10 = **corte con al menos una familia ganadora**. Unidad secundaria = apariciones de familias ganadoras (no cinco ensayos independientes). La cabeza de cuatro cifras sólo se lee tras tener seleccionada la lista.

## Antes de observar POST
Workflow mueve **todo el directorio de auditorías** fuera del checkout y repone solamente el PRE congelado. Se generan fichas por corte con:
- Las primeras diez originales, candidatos externos físicamente elegibles y su nombre, anclaje, rango y cantidad de rutas físicas propias.
- Conteo de candidatos externos por corte, por anclaje; distribución de complejidad física por rutas (`1`, `2–3`, `4–7`, `8+`).
- 5.000 réplicas neutrales como **órdenes hash aleatorios reproducibles** sobre cada bolsa de candidatos físicos externos, usando semillas públicas fijas; ninguna se seleccionará después por mejores resultados.
- El hash de protocolo, script, PRE e insumo, en `SELLO.json`. Ningún archivo con cabezas ganadoras o terceros aprendidos aparece durante esta etapa.

## Después del sello: auditoría de propuesta aprendida y controles
Reponer archivos POST; auditar las 90 listas **congeladas en la rama previa** y comprobar que el método conserva Top1–Top2, reemplaza **exactamente una plaza** y completa con Top3–Top9 oficiales sin filtraciones. El nombre aprendido proviene de la transferencia supervisada anterior y **no** del resultado de destino.

Comparaciones sin reajustar:
- `APRENDIDO`: propuesta real congelada.
- `AZAR_FISICO`: 5.000 propuestas físicas uniformes fuera de los diez originales, las mismas dos primeras y misma plaza.
- `AZAR_MISMA_ADMISION`: elige en bolsa anclada/no anclada que corresponda a la propuesta aprendida en ese corte.
- `AZAR_MISMA_ADMISION_Y_RUTAS`: además igual categoría de cantidad de caminos físicos; si no hay otra opción, documentar y conservar la bolsa del mismo grupo, que contiene a la propuesta misma (así se diagnostica lo restrictivo del control).
- `RANGO11`: la mejor anclada por el orden VT3 disponible fuera de Top10, control determinista.
- `HASH_FIJO`: primera elegible externa según SHA256(`20261013|fecha|turno|familia`).
- `RECUENTO_RUTAS`: elegir la externa de mayor diversidad de rutas físicas únicas, luego mayor raíz y rango, como control de abundancia geométrica.

Para cada política reportar entradas/ganadoras, Top3/5/10, rescates y pérdidas pareadas vs oficial y vs propuesta aprendida, histograma de réplicas y proporción de 5.000 que alcanzan o superan el resultado aprendido. La media exacta del control uniforme se obtiene sumando las probabilidades condicionales de éxito por corte `ganadoras físicas externas / candidatas físicas externas`; en cortes ya acertados por Top1–Top2 el Top3 acierta automáticamente. Registrar deltas Top3 y Top10, y qué sucede si entre los diez oficiales hay una ganadora en el último puesto.

Como control complementario, 10.000 permutaciones de **jornadas completas de cinco turnos** y 10.000 dentro del mismo día de semana (90 cortes, 18 días): comparar APRENDIDO−OFICIAL sin romper el grupo por jornada; no permitir permutar cabezas entre turnos.

## Riesgo de selección y decisión
Este corpus de 23 fechas fue explorado reiteradas veces, y la misma regla aprendida se escogió tras ver el +1. El control de 5.000 permutaciones PRE evita seleccionar un placebo ad hoc, pero **no** elimina el sobreajuste de hipótesis. La lotería es aleatoria; no afirmar capacidad de pronóstico. Si el rescate es común bajo azar de una plaza, no modificar VT3 ni seguir acumulando pesos retrospectivos. Mantener VT4 en espera.

**Entregables:** `scripts/lab-vt3-control-tercer-puesto.mjs`, workflow dedicado, `auditorias/vt3-control-tercer-puesto-90-13oct2026/{PRE_90.json,SELLO.json,POST_90.json,RESUMEN.json}`, informe Markdown técnico final y enlaces verificables.
