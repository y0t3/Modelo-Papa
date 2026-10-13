# VT3 · Transformaciones de bloques en una misma fuente
Fecha del protocolo: 13/10/2026. Rama: `lab-vt3-transformaciones-bloque-13oct2026`.

## Hipótesis y límites
La lectura física puede mostrar que una familia VT3 aparece en un bloque diferente del mismo tablero/fuente respecto de la jornada anterior del mismo turno: mantiene la geometría y se desplaza, cambia una sola casilla, repite bloque exacto o reaparece en otra zona. No asumir que eso representa una continuidad causal entre sorteos aleatorios. **Comparar geometría** y **dar evidencia de anticipo** son cosas distintas.

115 cortes (23 jornadas × 5 turnos) históricos. En el primer día no hay comparador anterior disponible: para ese día el ranking se conserva oficial. No se agregan raíces, no se cambian resultados, no hay cruces de fuentes y se cuentan bloques de tres **celdas únicas**, no tantos votos como orientaciones de la misma terna. Familias definidas por exactamente valor/inverso. Cada transformación se evalúa sólo para la MISMA familia reversible en la MISMA fuente entre la última jornada operativa de ese turno y la actual, ambas con tablero PRE. No se mueve ninguna figura físicamente por un tablero nuevo: el término «desplazada» significa *semejanza posicional con traslación*, no continuidad o trayectoria probada.

## Entradas inalterables y separación
- `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json` SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`.
- `auditorias/vt3-transiciones-individuales-115-13oct2026/PRE_115.json` SHA256 `02a1a4a10de5371c87f2fa2d7fbdbc6a8672642a9664ef2cba0eeefa99613224`.
- `NOCTURNA_SIMULACION.json` y `NOCTURNA_PRE.json` del corte del 12/10, sólo para diagnóstico retrospectivo (sello real de 18:56 permanece aparte).
- `POST_115.json` y `NOCTURNA_POST_DIAGNOSTICO.json` sólo se reintroducen tras generar y sellar PRE del experimento; workflow mueve sus ficheros originales fuera del checkout y verifica hashes. No usar objetivos POST para seleccionar bloques ni reglas.

## Geometría fijada antes de correr POST
- **Bloque**: conjunto ordenado canónicamente de tres coordenadas `row:col`, sin orientación y siempre dentro de una sola fuente; contar una vez por familia+fuente+bloque.
- **Identidad**: existe idéntico bloque de tres celdas de la familia en fuente homónima de la última jornada operativa.
- **Cambio de una celda**: dos bloques distintos de la misma familia en misma fuente comparten EXACTAMENTE dos celdas, aunque otras rutas de la familia tengan otro bloque.
- **Traslación estricta**: bloques distintos cuya figura normalizada al mínimo de fila/columna es idéntica y requieren un vector de desplazamiento no nulo; nunca atravesar fuente ni construir una ruta nueva.
- **Traslación limpia**: al menos un par trasladado anterior/actual y NINGÚN bloque idéntico entre días para la familia+fuente. Diferencia frente al mero arrastre exacto.
- **Separación total**: existe una fuente compartida por familia y entre todos los bloques de esa fuente antiguos/actuales NO se comparte ninguna celda; representa *diferencia física*, no validación.
- **Renovación de fuente**: no existe ninguna fuente física homónima con la misma familia en el PRE de la jornada anterior; no equivale necesariamente a «nació hoy».
- **Cambio de forma**: en una fuente compartida hay bloques que NO comparten figura normalizada con ningún bloque de la misma familia en la fecha anterior.
- **Ventanas de presencia**: 1 y 2 últimas jornadas anteriores del mismo turno sólo para control descriptivo, sin atribuir votos por repetición.
- Señales de ubicación y genealogía: conservar anclada sí/no, palíndromo sí/no, bandas fuentes 1/2+, bloques 1/2/3+, raíces D−1/D−7 (ninguna, una, otra, ambas). No confundir una ruta anclada con toda la familia ni duplicar sus raíces.

## Menú de selección experimental fijo, *exactamente 10 familias*
- `ORIGINAL`: Top10 original anclado.
- `ANCLADA_TRASLADA`: priorizar familias ancladas con traslación limpia.
- `ANCLADA_CAMBIO_1_CELDA`: priorizar familias ancladas con cambio de un casillero.
- `ANCLADA_IDENTICA`: priorizar familias ancladas que repiten bloque exacto.
- `ANCLADA_FUENTE_RENOVADA`: priorizar familias ancladas sin fuente homónima anterior.
- `ANCLADA_TRASLADA_O_CAMBIA`: priorizar traslación limpia, luego cambio una celda, luego rango oficial.
- `ABIERTA_TRASLADA_1`: reservar **puesto 10** a familia físicamente válida SIN raíz y con traslación limpia; desempate: mayor cantidad de parejas de bloques estrictamente trasladadas en fuentes homónimas, más fuentes actuales, mayor cantidad de bloques, orden alfabético.
- `ABIERTA_CAMBIO_1_CELDA`: reservar puesto 10 sin raíz con cambio de una celda, desempates como arriba usando parejas de bloques con cambio.
- `ABIERTA_FUENTE_RENOVADA_1`: reservar puesto 10 sin raíz y sin fuente homónima previa, desempate: fuente actual recién incorporada (si hay), más bloques, orden alfabético.
- `ABIERTA_TRASLADA_CONTROL_HASH`: reservar puesto 10 a candidata sin raíz con traslación limpia, escogida por hash fijo de fecha, turno, familia y semilla 20261013; control contra atribuir «morfología» al mero hecho de abrir un cupo.
Si no hay candidata física admisible en alguno de esos cupos, se conserva exactamente el Top10 oficial. En las políticas ancladas se **reordena** toda la bolsa de familias ancladas, sin admitir nuevas; el orden oficial desempata siempre.

## Evaluación
- Unidad = familia×corte para inventarios y formas; unidad = **corte** para aciertos Top3/5/10 (si varias de las cinco cabezas coinciden, ese corte suma uno).
- PRE con todos los bloques y pares distintivos, control geométrico de conteos, validación de la integridad de las cinco fuentes; hashes de PRE y script. No guardar cabezas futuras en PRE.
- POST: tablas de exposición de cada señal y ganadoras, ranking de diez de cada método y pareo de rescates/pérdidas, separado por mes, turno y ambos segmentos temporales; negativas comparables dentro de cada corte usando los estratos descritos, y reasignación de **jornadas completas** (10.000 permutaciones, semilla fija). Informar diferencia pareada de cada política contra original y los controles negativos.
- Nocturna 12/10: reconstruir sus transformaciones sólo con fuentes PRE de ese sorteo y PRE históricos de Nocturna; nunca volver a sellar como si fuese anterior al sorteo. Examinar 851/615/242 junto con el universo de negativas.
- No promover criterios al Top oficial por superar uno o dos aciertos in-sample. Rechazar mejora si se debe a la elección retrospectiva de un solo ejemplo o si deja fuera familias ganadoras en otros cortes.

La investigación es observacional y altamente reutilizada; incluso una diferencia positiva no demostraría capacidad de pronosticar sorteos aleatorios. VT4 permanece suspendida y la rama `main` no cambia.
