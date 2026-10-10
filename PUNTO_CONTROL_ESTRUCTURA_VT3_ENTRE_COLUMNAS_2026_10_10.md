# Modelo Papá — distinguir figuras inevitables y coincidencias numéricas VT3
Fecha: 2026-10-10 · Rama \`experimento-analisis-visual-5d\`.

## Contexto y decisión previa
Se había observado que el Top3 adaptativo cambia al incorporarse una columna +11,
a veces por el reloj heurístico sin nuevas marcas VT3. Se necesita interpretar
visualmente TODA la tabla 1→5 columnas, sin fabricar rutas que crucen columnas,
sin exigir D−7 y sin ampliar el Top3.

Antes de asignar puntos a «misma forma en varias columnas», se comprobó si
esa característica distingue realmente alguna hoja.

## Hallazgo matemático verificable
Para una columna física COMPLETA de seis pares +11 (matriz 6 filas × 2
dígitos, 12 celdas), con recorridos de tres posiciones distintas
consecutivas adyacentes horizontal, vertical o diagonal:
- Siempre hay **184 caminos VT3 ORDENADOS** posibles.
- Siempre hay **38 secuencias de desplazamientos relativas** posibles.
- Las 38 formas y las 184 rutas posibles son idénticas con cualquier
  distribución de los doce dígitos dentro de una columna completa.
- Dos columnas completas siempre **comparten todas las 38 formas**.
  Ese hecho por sí solo es una consecuencia de la topología, NO
  evidencia de un flujo predictivo.
- No se pueden unir celdas de distintas columnas. Una analogía
  entre columnas es comparación de dos recorridos independientes.

**IMPORTANTE:** las hojas históricas reales pueden contener columnas
INCOMPLETAS porque faltan resultados de jurisdicciones. En ese caso
NO es válido afirmar automáticamente que todos los 184 caminos
estén presentes; se calculan las formas y caminos efectivamente
disponibles. Por ejemplo, el 30/09/2026 las 5 columnas disponibles
antes de Nocturna incluían sólo 2 completas, aunque las 38 formas
sí resultaron físicamente posibles en cada una de las cinco
columnas —una observación calculada, no una suposición.

## Qué coincidencia SÍ se mide
Para cada corte antes del turno objetivo:
1. VT3 de tres cifras que pueden recorrerse dentro de dos o más
   columnas, sin mezclar sus celdas.
2. De esos valores, cuáles tienen al menos una ruta de igual
   secuencia RELATIVA de pasos en columnas diferentes.
3. Cuáles comparten el MISMO valor VT3 y EXACTAMENTE las
   mismas coordenadas relativas a la hoja en dos columnas.
4. Sufijos VT2 repetidos, solo como información descriptiva:
   no son eventos ganadores independientes.
5. Comparación condicional: redistribuir aleatoriamente los dígitos
   dentro de CADA columna (preservando su multiconjunto de cifras
   y celdas vacías); recalcular 32 veces por corte con semilla
   determinista. Eso prueba rareza de una coincidencia dada la
   distribución de dígitos, **no** capacidad para pronosticar
   cabezas ganadoras ni ausencia de sesgo.

Los resultados del turno objetivo se excluyen mediante
\`freezeBeforeTurn7D\`. El script hace cinco cortes por jornada.

## 30/09/2026 — tabla +11 completa según disponibilidad
| Objetivo | Columnas existentes | Columnas efectivamente completas | VT3 distintos presentes en 2+ columnas | Referencia permutada | Mismo valor y mismas 3 celdas |
|---|---:|---:|---:|---:|---:|
| Previa | 1 | 1 | 0 | 0,00 | 0 |
| Primera | 2 | 1 | 10 | 10,44 | 0 |
| Matutino | 3 | 1 | 24 | 17,44 | 0 |
| Vespertino | 4 | 2 | 49 | 43,41 | 0 |
| Nocturno | 5 | 2 | 96 | 61,03 | 0 |

Como ejemplo, la cifra 033 existía físicamente tanto en la
columna base de Nocturna anterior como en Previa +11 antes
de Primera. Esto NO convierte el 033 en pronóstico mejor
que otros VT3: se muestra para comprobar la noción de
coincidencia numérica y de origen.

## Septiembre completo, 26 jornadas por año
Son 130 cortes por mes (cinco por día), en los que una cifra puede
estar repetida a través de varios cortes consecutivos. Los
recuentos NO son 130 observaciones independientes ni apuestas.

| Relación física | Sept. 2025 observada | Control 2025 | Sept. 2026 observada | Control 2026 |
|---|---:|---:|---:|---:|
| VT3 iguales en varias columnas | 4267 | 4216,94 | 4360 | 4061,63 |
| VT3 iguales y misma forma de camino | 233 | 296,97 | 296 | 273,38 |
| VT3 iguales y mismo trazado en celdas | 73 | 66,25 | 73 | 52,63 |

El conjunto de formas de camino es constante SOLO para columnas
completas; la igualdad de CIFRAS / ubicación puede variar. No hay
criterio consistente y probado de selección VT3 a partir de estos
recuentos: «igual forma y valor» está por debajo del control de
barajado en 2025 y por encima en 2026. La observación 2026 puede
ser casual o depender de la composición de dígitos y resultados.
No se puede interpretar como aumento de probabilidad de acierto.

**Decisión:** NO puntuar coincidencia de formas generales entre columnas,
NO promover directamente coincidencia VT3 compartida, y NO
sumar candidatos. Son observaciones para estudiar la red visual,
no una prueba de predicción.

## Evidencia reproducible
- \`src/vt3CrossColumnStructure7d.ts\`: enumeración física de 184
  caminos, 38 formas, coincidentes por valor y posición, y
  redistribución reproducible de dígitos.
- \`scripts/test-vt3-cross-column-structure7d.cjs\`:
  prueba invariancia, columnas parciales, cinco cortes, bloqueo
  temporal y determinismo del control.
- \`scripts/run-vt3-cross-column-structure7d.cjs\`:
  tres informes con registros por fecha/turno/valor y
  control de 32 redistribuciones.
- \`.github/workflows/vt3-cross-column-structure7d.yml\`:
  https://github.com/y0t3/Modelo-Papa/actions/runs/38033965285

## Próximo paso útil
Para estudiar la lectura manual no basta con que exista una
trayectoria abstracta o que su valor se repita en otra columna.
Se necesita cotejar **transformaciones de figuras específicas
trazadas / comprobadas** a lo largo de hoy y jornadas recientes:
origen, números concretos, 3 celdas, dirección de lectura y
significado del contacto o cambio. Mantener explícita la
procedencia (trazo manual verificado frente a ruta automática).
Antes de cualquier ranking, excluir motivos combinatorios
que el tablero garantiza sin importar sus cifras.

Los replays históricos repetidamente explorados (2024–2026)
no reemplazan una validación prospectiva con candidatos
congelados antes del sorteo. \`main\`, el selector oficial y
la APK continúan intactos. VT3 prioridad; VT2 preservado;
VT4 físico y extra separado, experimental.
