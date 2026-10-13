# VT3 — transferir recorridos ganadores físicos desde el mismo día D−7

13/10/2026, laboratorio complementario de aprendizaje semanal. Rama `lab-vt3-aprendizaje-semanal-13oct2026`. Sólo diagnóstico. Mantener `main`, motor, hoja, Tops sellados y VT4 intactos.

## Regla física ya acordada
El padre compara los recorridos físicamente comprobados de cabezas de un **mismo día de la semana anterior (D−7)** y busca si esas geometrías válidas pueden reproducirse en el tablero del mismo día actual. No necesita que vuelva a salir la misma terna: copiar **celdas/fuente/forma**, luego leer los dígitos distintos del tablero actual. Nunca conectar fuentes distintas, saltar celdas, elegir retrospectivamente una ruta ni prestar raíz.

Esta prueba usa el mismo PRE histórico sellado de 115 cortes y, exclusivamente como enseñanza de D−7, las cabezas ya publicadas en esa fecha anterior. Cada resultado del día evaluado está oculto hasta después de construir su Top. No se exige encontrar cabezas que físicamente no están disponibles.

## Cortes de evaluación
Para cada corte de las últimas tres semanas operativas, localizar el corte del **mismo turno en la fecha exactamente siete días calendario anterior**. Si no existe, ese corte se excluye del cotejo pareado (reportar cuántos y cuáles). Las 5 jurisdicciones históricas del D−7 son objetivos conocidos; todos sus recorridos de terna y reverso en el PRE D−7 son ejemplos positivos. Cada ruta se deduplica por casilleros y orientación invertida; NUNCA se multiplica evidencia por raíz histórica de idéntica cabeza. A diferencia del laboratorio de rasgos globales, ésta es una comparación de rutas ganadoras verificadas físicamente.

## Tres definiciones PRE de réplica
- `ABS`: coincidencia exacta de los tres casilleros en el mismo orden físico **y misma fuente**, salvo la orientación invertida de la misma familia.
- `SHP_SRC`: misma forma geométrica normalizada por traslación, dentro de la **misma fuente**. No supone mover dígitos entre fuentes.
- `SHP_ANY`: misma forma normalizada, en cualquier fuente actual **independiente** (no se crea recorrido entre fuentes ni se presenta como réplica causal propia).
Se usan las dos primeras como principales, la tercera como control de generalidad.

## Selección
Para cada candidata de la hoja actual, contar cuántas rutas propias físicas únicas corresponden a plantillas físicas comprobadas en D−7, por métrica. Desempatar primero por rango VT3 original si anclada y después por nombre canónico. Exactamente **diez familias reversibles** por Top.
- `ABS_RAIZ`, `ABS_FISICA`
- `SHP_SRC_RAIZ`, `SHP_SRC_FISICA`
- `SHP_ANY_RAIZ`, `SHP_ANY_FISICA`
- `OFICIAL`: diez originales, mismo presupuesto.
- `CONTROL_D7_NEGATIVAS`: generar plantillas ABS a partir de igual cantidad de familias físicas **no ganadoras** del D−7, seleccionadas por hash fijo PRE tras conocer resultados de D−7; comparar con transferencia ABS real en el mismo corte. No buscar mejor réplica neutral a posteriori.
No modificar los candidatos ni su raíz histórica, que se conserva para seleccionar bolsa `RAIZ`.

## Evaluación
Registrar cantidad de rutas ganadoras físicamente presentes en D−7, cabezas de D−7 sin formación, número de réplicas físicamente disponibles en día actual y el aporte exacto de cada plantilla; número de Top3/5/10 sobre mismos cortes para todas las variantes, ganadoras físico-posibles del día evaluado y rescates/pérdidas pareadas. Reportar por fecha y semana, mostrar éxitos y fracasos.

**Aislamiento por fuente:** workflow deja solo PRE original durante construcción de testigos y sellado. Reincorpora POST después; el código de transferencia en cada corte puede acceder a `goals[D−7]` exclusivamente y **jamás** al resultado del día actual antes de producir sus diez selecciones. Registrar hashes del PRE y del código. D−7 puede coincidir con una fecha anterior de entrenamiento pero nunca con futuro.

**Límite:** aunque se respeten los días, este corpus ya se ha explorado exhaustivamente; la réplica geométrica no garantiza ningún sesgo anticipable en sorteos de quiniela aleatorios. No promover un método por una diferencia in-sample.
