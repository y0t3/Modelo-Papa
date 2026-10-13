# Ensayo exploratorio: madres VT3 y puerta VT4

Base: commit d5dbcf49ecc1941e1f890bbe9f74dc68e96f1f89 de lab-raices-independientes-13oct2026. Continúa el punto de control de independencia física. No cambia producción.

Reglas fijadas antes de ejecutar el POST de este ensayo:

1. Original: orden exacto de src/motorLalo.ts.
2. Raíces distintas: prioridad binaria a familias con una fuente, al menos dos bloques actuales, dos eventos históricos de cabeza completa y dos bloques históricos. Dentro de cada grupo se conserva el orden original. Si faltan diez prioritarias se completa con el ranking original.
3. Control bloques: prioridad binaria a una fuente y al menos dos bloques actuales, sin exigir diversidad histórica. Es un control parcial de densidad, no un emparejamiento exacto.

Siempre exactamente diez madres. La enumeración de hijas y su criterio de orden permanecen iguales: el puesto de la madre se actualiza según el selector. Se conservan todos los caminos válidos de cada madre y se comprueba para cada hija el tramo contiguo propio de cada madre declarada, misma fuente, cuatro celdas diferentes y adyacentes, lectura real. No se premia una cantidad creciente de raíces.

Métrica principal: cortes con alguna VT4 coincidente en Top10. Secundarias: Top3/5, cobertura de toda la bolsa VT4, familias ganadoras alcanzables, VT3 Top3/5/10, total de hijas, bloques actuales de las madres y cambios pareados por corte/día. Referencia descriptiva: selección uniforme de diez familias dentro de cada bolsa VT4. Una bolsa mayor no equivale a un ranking mejor.

115 cortes de 23 jornadas ya exploradas, sin pretensión confirmatoria. No se incluye ni se utiliza para ajustar la Nocturna del 12/10. Una mejora requerirá posteriores cortes prospectivos nuevos; este ensayo por sí solo no pasa reglas a producción. Se conservan todos los negativos. No se retocan criterios después del POST.

Reproducción con Node 24 sin instalar dependencias:

```bash
node scripts/lab-madres-vt4.mjs prepare
mv resultados/replay-lalo-115/OBJETIVOS_POST_115.json /tmp/objetivos-madres.json
node scripts/lab-madres-vt4.mjs pre
mv /tmp/objetivos-madres.json resultados/replay-lalo-115/OBJETIVOS_POST_115.json
node scripts/lab-madres-vt4.mjs post
```

El runner verifica SHA256 del motor y de la base histórica, crea una copia transitoria del motor con sólo un selector de orden VT3 y renumeración, y comprueba igualdad completa entre copia sin cambio de orden y motor original en los 115 cortes. PRE no carga objetivos; POST verifica el hash del PRE sellado. Este aislamiento evita fugas por corte, pero no borra el conocimiento previo de las fechas históricas.
