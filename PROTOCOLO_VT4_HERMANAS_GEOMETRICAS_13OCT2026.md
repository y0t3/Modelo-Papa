# VT4 — distinguir hijas de una misma madre VT3 por recorridos físicos

Rama experimental `lab-vt4-hermanas-geometricas-13oct2026`, fecha 13/10/2026. **No tocar `main`, `src/motorLalo.ts`, rankings de la app, sellos ni cabezas publicadas.**

## Pregunta
Las diez plazas de VT4 con **dos hijas por cada una de las cinco primeras madres VT3** consiguieron 4/115 coincidencias Top10 retrospectivas, pero no sabemos cómo priorizar las hijas **dentro de una madre**. Una cabeza como `5485` estaba físicamente disponible y tenía madre `485/584` en puesto VT3 #5, pero no llegó a las dos plazas de esa madre. Queremos diferenciar las hermanas con rasgos reales de sus rutas, no por conocer sus cifras premiadas.

## Identidad física y presupuesto
Usar el motor experimental ya corregido: `madre VT3 reversible + cifra añadida + extremo prefix/suffix`. Una etiqueta `3226/3622` no hace que las dos cuaternas existan; sólo cuentan valores de cuatro cifras documentados por rutas de cuatro celdas distintas y adyacentes, sin cruzar fuentes. Prohibido préstamo de raíces o inversión completa automática. Cada grupo conserva madre real y rutas propias; una cifra idéntica presente en grupos diferentes no puede consumir dos plazas.

**Cupo invariable:** **dos hijas por cada una de las madres VT3 #1–#5, diez grupos totales** (si la colisión numérica impide completar se documenta, nunca se reduce inadvertidamente el presupuesto). Mantener igual inventario de grupos físicos del ranking corregido y los mismos cinco puestos maternos; únicamente cambia el orden de las hermanas de cada madre.

## Variables disponibles antes de cada sorteo
- `nCaminos`: caminos físicos distintos que justifican la hija.
- `nBloques`: conjuntos diferentes de cuatro casillas físicas (no contar inversión como dos apoyos).
- `nFuentes`: distintas columnas de turno con el mismo grupo.
- `nFormas`: formas de cuatro casillas diferentes, desplazadas a origen 0:0 y reverso normalizado.
- `nRumbos`: pares distintos de movimientos adyacentes en las rutas.
- `nFuentesConvergentes`: más de una fuente con respaldo de la misma hija.
- `padreD1/padreD7`: raíces de la propia madre admitida; no se utilizan para adjudicar antecedentes a una hija sin ruta materna.

Cada perfil guarda rutas concretas, fuente, cuatro celdas y valor leído, formas canónicas, cantidad de caminos, bloque y fuente. Formas sólo como características descriptivas, sin fabricar caminos.

## Políticas definidas de antemano, mismo Top10 de 5 madres
1. `BASE_CUPO2`: jerarquía original de cada madre por fuentes, bloques y desempate; debe reproducir **exactamente** los Top10 congelados en los 115 cortes previos.
2. `MAS_CAMINOS`: ordenar hijas de una madre por mayor número de caminos físicos propios; luego rango original.
3. `MAS_FORMAS`: ordenar por variedad de formas geométricas distintas; luego rango original.
4. `CONVERGENCIA`: fuentes distintas, bloques y número de caminos, en ese orden; luego rango original.
5. `UNICA_FORMA`: ordenar por menor redundancia de formas físicas internas (proporción nFormas/nCaminos); luego rango original.
6. `CONTROL_HASH`: orden PRE por SHA256 de fecha/turno/identidad física del grupo, sin etiquetas históricas.
7. `MEMORIA_X_GANADORA`: en la semana X recoger **sólo después de sortear X** las formas físicas de grupos VT4 que contenían una cabeza ganadora en X; puntuar las hijas de X+1 por la mayor similitud Jaccard del conjunto de formas frente a esos ejemplos, con desempate original. **No usa ningún resultado del turno X+1 para elegir.**
8. `MEMORIA_X_NO_GANADORA`: control negativo; entrenar en X con las formas de grupos de madres elegibles que no coinciden con cabezas de X, mismo criterio.

## Separación temporal
Fase PRE sobre 115 cortes: sólo `INPUT_PRE_115.json` preparado anteriormente y el motor; apartar físicamente todo `OBJETIVOS_POST_115.json` y el fixture de resultados del checkout; crear perfiles y Tops de políticas 1–6 para todos los cortes, y fichas para evaluación estrictamente causal de memoria X. Sellar entradas/código/protocolo SHA256 y versionar.

Fase POST: después del sello, cargar resultados de X (previa) **antes** de preparar cualquiera de los Tops en X+1. Evaluar las 3 transiciones definidas: X=15–19/09 → 21–26/09, X=21–26/09 → 28/09–03/10, X=28/09–03/10 → 05–10/10. 90 cortes de examen. Los patrones de X se extraen del inventario PRE propio de X, nunca se reconstituyen usando datos de X+1. No seleccionar una variante ganadora sobre los 90 resultados y volver a llamarla predicción.

Estadísticas: Top3/5/10, cobertura física potencial de las cinco madres, familias elegibles vs seleccionadas, madres distintas y cuaternas exactas representadas, rescates/pérdidas respecto al cupo dos, cambios por turno/semana, y diagnóstico `5485` Primera 13/10 sólo en el inventario PRE ya publicado — **sin usarlo como entrenamiento previo ni como sello VT4 prospectivo**.

**Advertencia:** la quiniela es aleatoria; el conjunto histórico de 23 días se ha explorado repetidamente. Las pruebas son descriptivas y necesitan validación nueva para cualquier inferencia predictiva.
