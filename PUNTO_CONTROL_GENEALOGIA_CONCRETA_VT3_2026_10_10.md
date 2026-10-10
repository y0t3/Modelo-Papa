# Modelo Papá — genealogía concreta de recorridos VT3
Fecha: 2026-10-10 · Rama \`experimento-analisis-visual-5d\`

## Corrección de rumbo
El usuario fijó que la tabla +11 se lee COMPLETA y PROGRESIVAMENTE:
Nocturna anterior→Previa→Primera→Matutina→Vespertina→Nocturna.
No se privilegia un par de turnos y no se requiere D−7 para abrir
una lectura. VT3 es prioridad con Top3 pequeño; VT2 se conserva
y VT4 físico/extra sigue experimental.

El estudio anterior mostró que la existencia de una misma forma en
dos columnas completas es una consecuencia topológica, no una señal.
Las coincidencias de números sin coordenadas tampoco identifican
una figura concreta. Por eso se creó seguimiento por
**episodio+columna+secuencia ordenada de celdas+VT3**.

## Nuevo observador descriptivo (NO selector)
Código \`src/vt3ConcreteEvolution7d.ts\`. Antes de cada sorteo:
- recupera hasta seis JORNADAS EFECTIVAMENTE SORTEADAS anteriores y
  los turnos ya terminados de HOY;
- reconstruye sólo recorridos ganadores VT3 de cabezas que YA
  se conocen (nunca la cabeza del objetivo); deduplica múltiples
  cabezas que comprobaron la misma secuencia de celdas en el
  mismo turno;
- conserva fecha, turno, cabeza(s), VT3, columna física, las tres
  celdas ordenadas y forma relativa;
- identifica antecedentes en la MISMA columna lógica,
  clasificándolos como \`EXACTA\`, \`TRASLACION_CERCANA\`,
  \`RAMA_CERCANA\`; nunca cierra familias transitivamente
  para fusionar caminos que no son parientes físicos;
- ante igualdad de vínculo, prima antecesor más reciente y luego
  relación física más concreta, para evitar enumerar infinitas
  historias sobre una figura;
- relee EXACTAMENTE las mismas celdas del mismo origen en
  la hoja +11 disponible antes del objetivo. Registra su
  VT3 histórico, el VT3 actual y los VT2 contenidos
  **sin llamarlos automáticamente pronósticos**;
- anota analogías de MISMO VALOR en otras columnas por separado,
  sin mezclarlas con una trayectoria física entre celdas;
- no usa D−7 como llave de acceso ni altera el Top3 oficial.

Las marcas son de procedencia
\`RECONSTRUIDA_DE_MATCHES\`, NO rutas manuscritas del padre.
Ninguna asociación con las cabezas históricas descubre
cuáles recorridos habría elegido manualmente.

## Caso real 30 de septiembre de 2026
| Objetivo todavía no sorteado | Columnas +11 | Recorridos testigo | Relecturas físicamente disponibles | Antecesor exacto | Traslaciones | Ramificaciones | Cifras que cambiaron |
|---|---:|---:|---:|---:|---:|---:|---:|
| Previa | 1 | 12 | 4 | 1 | 1 | 7 | 4 |
| Primera | 2 | 12 | 6 | 1 | 1 | 7 | 6 |
| Matutino | 3 | 12 | 8 | 1 | 1 | 7 | 8 |
| Vespertino | 4 | 19 | 17 | 2 | 2 | 10 | 10 |
| Nocturno | 5 | 24 | 24 | 3 | 2 | 13 | 12 |

Los recuentos incluyen rutas testigo individuales; una cabeza
puede reconstruirse de múltiples formas y eso NO convierte
esas rutas en aciertos o episodios independientes.

### Ejemplos reconstruidos realmente, y NO inventados
- Testigo VT3 **289**, 29/09 Matutino,
  columna \`prevNocturno\`, celdas ordenadas
  \`2:0 > 2:1 > 3:1\`, se lee como **877** en la columna
  Nocturna anterior +11 de 30/09 antes de Previa;
  la misma huella había explicado VT3 **760** el 28/09.
- Otro camino VT3 **289** del mismo sorteo, celdas
  \`2:0 > 3:0 > 3:1\`, se lee como **807** en 30/09.
  Es el mismo VT3 ganador anterior, pero OTRO camino
  físico y otra relectura numérica. Hay antecedente de
  rama cercana VT3 **811** del 25/09.
- Testigo VT3 **342**, 29/09 Nocturno, columna
  \`Previa\`, celdas \`0:0 > 1:1 > 2:1\`,
  se lee como **304** en 30/09 antes de Primera.
  Anterior rama cercana VT3 **701** del 26/09.
- Durante 30/09, la Matutina ya cerrada confirmó
  VT3 **371** en columna \`Previa\` mediante
  \`3:1 > 4:1 > 4:0\`, visible antes de Vespertina;
  tiene traslación cercana respecto de una ruta
  VT3 **701** del 26/09. Su relectura en esta misma
  columna de HOY sigue siendo **371**.

Las coordenadas son \`fila:columna_interna\`, base cero;
cada columna de origen es independiente y tiene dos
dígitos por fila.

## Auditoría de ambigüedad: una cabeza, múltiples recorridos
Se agruparon los testigos por `fecha + turno + origen + VT3 ganador`,
para no contar caminos geométricos como sorteos independientes.

| Objetivo | VT3 ganadores históricos distintos en los testigos | Con varias rutas válidas | Producían relecturas distintas en la hoja actual |
|---|---:|---:|---:|
| Previa | 6 | 5 | 1 |
| Primera | 6 | 5 | 1 |
| Matutino | 6 | 5 | 2 |
| Vespertino | 10 | 7 | 3 |
| Nocturno | 12 | 8 | 4 |

**Hallazgo crítico:** antes de Nocturna, ocho de doce grupos históricos
comprobados admitían más de una ruta; cuatro grupos producían dos o más
cifras nuevas distintas al releer esos caminos en la tabla actual.
La memoria debe guardar la **identidad de la ruta ordenada** y abstenerse
de escoger retrospectivamente aquella que coincida con la cabeza posterior.

Ejecución que vuelve a verificar los cinco cortes y registra esta
ambigüedad: https://github.com/y0t3/Modelo-Papa/actions/runs/38034787634

## Importancia y límites
**Hallazgo operacional:** no debemos recordar sólo el VT3 anterior.
El mismo 289 histórico pudo ser explicado por dos caminos diferentes
que ahora leen 877 y 807. La identidad matemática del
recorrido ordenado es imprescindible para interpretar
las trayectorias entre turnos y jornadas.

**No se demostró** que 877, 807, 304 o 371 hubieran sido buenas
predicciones de los turnos que aún faltaban. Son lecturas
físicas disponibles antes de esos sorteos en una reconstrucción
histórica; no se escogieron con una regla prospectiva y no se
deben contar como aciertos pronosticados.

La distinción importante para el siguiente análisis es:
1. figuras repetidas **en la misma huella física**;
2. figuras desplazadas que conservan su dirección;
3. ramificaciones con bordes o celdas comunes;
4. diferencias de cifras en esas huellas;
5. analogías entre columnas independientes (no unión física).

## Código y comprobación
- \`src/vt3ConcreteEvolution7d.ts\`
- \`scripts/test-vt3-concrete-evolution7d.cjs\`:
  cinco cortes 1→5, continuidad física, VT3 numérico,
  sufijo VT2 contenido, memoria de turnos de hoy,
  jornada anterior, falta de D−7, y prueba de fuga
  temporal cambiando las cabezas del objetivo y turnos futuros.
- \`scripts/run-vt3-concrete-evolution7d.cjs\`:
  expedientes PREVIOS en Markdown y JSON para cada turno,
  con 15 rutas explicadas por corte y todas en el JSON.
- \`.github/workflows/vt3-concrete-evolution7d.yml\`:
  https://github.com/y0t3/Modelo-Papa/actions/runs/38034639830

## Próxima decisión técnica
Analizar *qué evidencia física distingue* un recorrido cuando
una misma cabeza ganadora tiene varios caminos posibles;
en particular no atribuir a papá la ruta que a posteriori
dé el número deseado. Mantener como testigos independientes
las rutas alternativas sin ampliar la lista de ternas a jugar.

Para convertir el seguimiento en regla de elección necesitamos
un criterio de selección fijado **antes de conocer el resultado**,
evaluado después con Top3 idéntico y controles de azar
realmente comparables. Los datos históricos 2024–2026 han sido
ampliamente explorados, no sustituyen validación prospectiva.

\`main\`, selector oficial y APK siguen sin integración de este módulo.
