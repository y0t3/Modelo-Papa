# VT3: inventario físico y prioridad de bifurcaciones

Protocolo exploratorio fijado antes del POST de este ensayo. Continúa el diagnóstico de la Nocturna del 12/10 (851, 615 y 242); 815 fue corregido por el usuario como error de tipeo. Foco exclusivo VT3; no se evalúa VT4.

## Comparación factorial 2 × 2, cuatro métodos

- A_ORIGINAL: bolsa y orden exactos del motor sellado.
- B_INVENTARIO: enumerar todas las rutas físicas VT3 válidas en las fuentes visibles; conservar el orden original de criterios usando fuentes y bloques del inventario completo.
- C_SIN_PRIORIDAD_BIF: bolsa original; raíces D−1, raíces D−7, fuentes y bloques antes de bifurcaciones.
- D_AMBOS: inventario completo y orden C.

Inventario completo significa tres casillas distintas, contiguas horizontal/vertical/diagonalmente, misma fuente, sin vacíos ni saltos, todos los caminos deduplicando sólo reversos exactos. Una familia reversible agrupa lectura e inversa, no permutaciones. Se incluyen familias sin anclaje para medir la diferencia entre existencia física y admisión histórica.

Cada ruta mantiene su condición: anclada por el motor original (con sus rootIds) o sólo física, con rootIds vacíos. Ninguna raíz se presta a otro recorrido o fuente. D−1/D−7 y bloques bifurcados se conservan tal como estaban documentados en el motor original; no se inventan nuevas bifurcaciones ni se aplica recursión sobre rutas recién añadidas. Las nuevas familias sin anclaje tienen cero raíces y cero bifurcaciones. Fuentes/bloques completos miden presencia física, no confirmación histórica.

Orden A/B: `[hayBif, min(bif,15), min(D1,10), min(D7,10), fuentes, bloques]` descendente. Orden C/D: `[min(D1,10), min(D7,10), fuentes, bloques, hayBif, min(bif,15)]` descendente. Desempate alfabético idéntico. No se ensayan pesos, cuotas por fuente, números preferidos ni combinaciones elegidas después del POST.

## Medición y aislamiento

115 cortes y 23 jornadas ya estudiadas; siempre diez familias en Top10, Top3 y Top5 secundarios. PRE por corte sin objetivo ni fuentes futuras; POST fuera del directorio durante generación. Congelar hash PRE antes de POST. Reproducir el original 5/8/15, cobertura 46 cortes, 64 exposiciones de familias ganadoras y 6.389 candidatas acumuladas.

Medir: cortes con alguna coincidencia Top3/5/10; cobertura completa; exposiciones candidatas y ganadoras; nuevos ganadores de familias antes ausentes; ganancias/pérdidas pareadas Top10; resultados por día, mes y turno; cantidad de raíces y fuentes por familia; coincidencias de familias exclusivamente físicas. Referencia descriptiva hipergeométrica por misma bolsa y cupo; no control exacto de geometría, no significación confirmatoria. No tratar mayor cobertura de una bolsa mayor como mejora de Top10.

Nocturna del 12/10: reconstrucción exacta desde sello original, con los cuatro métodos fijados aquí. Se guarda aparte como diagnóstico POST conocido, nunca agregado a los 115 ni llamado nueva validación prospectiva. Se informan 851/615/242 y también 290/264 para conservar los negativos.

## Reproducción

Node 24, sin instalar dependencias:

```bash
node scripts/lab-vt3-cobertura-bifurcaciones.mjs prepare
mv resultados/replay-lalo-115/OBJETIVOS_POST_115.json /tmp/objetivos-vt3.json
node scripts/lab-vt3-cobertura-bifurcaciones.mjs pre
mv /tmp/objetivos-vt3.json resultados/replay-lalo-115/OBJETIVOS_POST_115.json
node scripts/lab-vt3-cobertura-bifurcaciones.mjs post
```

No cambiar producción a partir de este ensayo; conservar los negativos. Cualquier hipótesis posterior necesita protocolo distinto y cortes nuevos para confirmación.
