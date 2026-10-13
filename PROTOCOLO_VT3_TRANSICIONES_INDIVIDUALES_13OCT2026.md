# VT3 — Protocolo de transiciones individuales y controles físicos
Fecha: 13/10/2026. Rama `lab-vt3-transiciones-individuales-13oct2026`.

## Objetivo
Retomar la lectura del flujo físico *sin* crear una cuota artificial de familias NACE/CONVERGE/YA_PRESENTE. Averiguar si las familias que coinciden luego con las cabezas tienen **transiciones de caminos físicos identificables antes del sorteo** que se distingan de muchas familias negativas de igual complejidad.

## Insumos y protección temporal
- `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json` hash SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`, que contiene cada familia física, lista de rutas (celdas, fuente, raíz propia sí/no), rankings y fecha/turno. Construido antes de evaluar cada resultado.
- `auditorias/vt3-nacimientos-convergencias-115-13oct2026/PRE_115.json`, SHA256 `512331f2695e2b632c7f2077f2dd7437041d00ee724556cf754e22f986a07f2b`, con perfiles físicos por familia y corte, sin resultados futuros.
- `POST_115.json` sólo para etapa POST. Antes del PRE del nuevo laboratorio mover físicamente fuera del checkout todos los POST anteriores relevantes, y validar hashes y estructura. No usar cabezas objetivo para añadir, etiquetar o puntuar candidaturas.

## Estados y características PRE
Unidad primaria = familia reversible×corte (NO cada recorrido y NO cada cabeza repetida). Cada ruta exige tres celdas contiguas diferentes, en una misma fuente, con orientación inversa equivalente. Al avanzar de turno las fuentes anteriores mantienen sus rutas, valor, celdas y anclaje; abortar si no se conserva esto.

- `NACE`: la familia aparece por primera vez en la fuente incorporada.
- `CONVERGE`: la familia existía físicamente en fuente(s) anterior(es) y añade caminos propios en la nueva fuente.
- `CONTINÚA`: presente en una fuente anterior, sin aparición en la nueva.
- `INICIAL`: Previa (no tiene turno anterior intradía).

Para NACE/CONVERGE medir **nuevos bloques de tres casilleros** y **nuevas rutas** en fuente actual, por separado (dos rutas en los mismos tres casilleros NO son dos pruebas independientes). Comparar las FORMAS POSICIONALES entre fuentes, *sin unir fuentes ni fingir contacto físico*: 
1. `ecoDeBloque`: un bloque de celdas actual tiene exactamente el mismo conjunto de coordenadas `row:col` que un bloque anterior de la MISMA familia, pero en distinta fuente;
2. `ecoDeTramo`: comparte patrón posicional de al menos un tramo adyacente de dos celdas con camino antiguo de misma familia, en distinta fuente. Esto es similitud de geometría, NO un segmento físico entre fuentes;
3. `raizHistoricaReutilizada`: dos fuentes de una misma familia comparten al menos un ID de **la misma raíz real** trasladada (sin contarlo como dos confirmaciones históricas);
4. `nuevoAnclajePropio`: hay camino de la familia, en fuente nueva, que efectivamente lleva su propio `rootId`; no heredar del apoyo de otra familia.
5. `persistenciaDeTerna`: misma familia presente físicamente en la misma fuente de la misma hora/turno en las últimas 1, 2 o 7 jornadas operativas; contabilizar días distintos, no caminos repetidos.

También calcular por familia `sourceCount`, `blockCount`, raíz D−1/D−7 (cantidad de eventos únicos), `palindromo`, fuente de nacimiento, tiempo intradía y `bif` *sin volver a interpretar bifurcaciones retrospectivas como marca previa*.

## Comparación negativa
- Archivo PRE con 115 cortes, perfiles de TODAS las familias físicas, ancladas o no, y 14/?? variables descritas, sin cabezas objetivo. Incluye PRE de Nocturna 12/10 reproducida físicamente sólo como **diagnóstico histórico**, nunca reemplaza sello oficial.
- Archivo POST: objetivos de los 115 cortes y coincidencias por familia. Medir para cada característica exposiciones, ganadoras, meses de septiembre y octubre, turnos y posición previa dentro/fuera de Top10.
- Comparar además cada familia ganadora con otras del **mismo corte** similares en (`anclada` vs `no`), palíndromo, número de fuentes (1 o 2+), número de bloques (1/2/3+), y evento D−1/D−7 (ninguno, D−1, D−7, ambos). Reportar exclusivamente los grupos con por lo menos dos familias y resultado discriminable, con fracción ganadora observada vs proporción descriptiva esperada por exposición dentro del grupo. Separar grupos sin pareja; reportar el soporte, no ocultarlos.
- Incluir control permutado de cabezas por jornadas completas entre los 23 días, conservando turno; para cada firma producir frecuencia real y media de controles, pero **no inferir poder predictivo** ni usar la estadística para fabricar pesos.
- Las interacciones débiles, con 1–2 ganadoras o inestables entre septiembre/octubre, NO se elevan automáticamente a reglas Top. Primero buscan **hallazgos reproducibles sobre evolución de las formas**; si no hay señal robusta, es resultado válido.

## Resultados permanentes
`scripts/lab-vt3-transiciones-individuales.mjs`, `.github/workflows/lab-vt3-transiciones-individuales.yml`, `auditorias/vt3-transiciones-individuales-115-13oct2026/{PRE_115.json,SELLO.json,POST_115.json,RESUMEN.json,NOCTURNA_PRE.json,NOCTURNA_POST.json}` y punto de control.

Todo experimental: sin tocar `main`, `src/motorLalo.ts`, la app, Top10 actual, hoja automática, APK ni VT4. El histórico ya fue explotado muchas veces; ningún resultado constituye una prueba nueva *prospectiva* ni garantiza anticipar sorteos aleatorios.
