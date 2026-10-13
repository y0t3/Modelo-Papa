# Protocolo VT3 · Grupos empatados en la frontera del Top10

**Fecha:** 13/10/2026. **Rama exclusiva:** `lab-vt3-grupos-empatados-frontera-13oct2026`. No modificar `main`, motor Lalo, hoja diaria, recorridos marcados POST, Top sellados, APK ni VT4.

## Pregunta

De los 115 cortes anteriores, 62 presentan una **igualdad exacta de la tupla VT3 entre los rangos 10 y 11**. Una familia puede estar por encima de otra sólo porque su nombre canónico aparece antes alfabéticamente. ¿Hay alguna diferencia geométrica o de vigencia PRE **dentro de cada grupo completo empatado** que sea más informativa que el orden alfabético? La evidencia pasada no es un indicador fiable de un sorteo aleatorio; esta prueba es retrospectiva y el histórico ha sido consultado durante muchas pruebas.

## Integridad del empate, unidad de conteo y corte

La tupla original se reproduce exactamente: `[bif>0, min(bif,15), min(d1,10), min(d7,10), sources, blocks]`. Dos familias sólo empatan si sus **seis campos** coinciden. Para cada corte, reconstruir TODAS las ancladas con esa tupla, desde la primera hasta la última posición del empate. Si el grupo atraviesa el rango 8, conservar las primeras ocho **fijas** y comparar únicamente las personas candidatas restantes. También conservar cualquier familia entre puestos 9/10 con tupla superior a la empatada.

No ampliar el tamaño del Top10: siguen exactamente 10 familias reversibles y físicas. No promover candidatas sin raíz en este laboratorio, ni sumar raíces por rozar otras figuras. Ningún camino une fuentes distintas. El objetivo es distinguir empates, NO crear raíces nuevas. Los 53 cortes sin empate exacto 10/11 quedan con Top original sin cambios.

## Fuentes PRE y aislamiento

- `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`, hash SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`: ranking y TODOS los testigos de caminos físicos en cada familia, anclada o no.
- `auditorias/vt3-auditoria-puestos-115-13oct2026/SELLO.json` y su PRE: auditoría de posiciones oficial. Aserción contra 62 empates y 115 cortes.
- Construir los nuevos rankings, sus perfiles y las **2.000 elecciones neutrales uniformes de empates** usando únicamente PRE. Retirar físicamente `POST_115.json`, las cabezas nocturnas POST y POST del laboratorio de puestos fuera del checkout antes de generar PRE; grabar hashes de políticas, script y PRE. Sólo entonces reponer POST para analizar resultados. Nunca presentar el diagnóstico de una Nocturna ya sorteada como predicción anterior.

## Diferencias físicas PRE (sin crear votos)

Para cada miembro completo del empate, calcular de sus testigos originales:

- `rootedRoutes`: nº de rutas físicamente válidas de **la propia familia** con `anchored: true` y rootIds; describir pero no convertirlo en raíz independiente.
- `rootedBlocks`: bloques de tres casilleros distintos con al menos una ruta propia anclada, deduplicados por fuente y casilleros.
- `rootedEdges`: tramos físicos únicos que aparecen en recorridos propios anclados, siempre en fuente de origen.
- `rootedMiddles`: casilleros centrales de rutas propias ancladas distintos, por fuente.
- `newestRootSource`: índice de fuente más recientemente incorporada que tenga una ruta anclada propia (en Previa la fuente visible es prevNocturno).
- `rootedAtLatestSource`: si la propia fuente recién incorporada incluye alguna ruta anclada.
- `rootedFraction`: rutas propias ancladas / todas las rutas físicas de esa familia.
- `physicallyAbsentPreviousSameTurn`: la familia completa no aparecía en el PRE del mismo turno de la última jornada operativa disponible.
- `rootedAbsentPreviousSameTurn`: no estaba admitida (anclada) en el PRE de la última jornada operativa del mismo turno.
- `physicalPaths` y geometría total para distinguir medidas sobre caminos de evidencia independiente. No cuentan cabezas futuras, coincidencias POST ni marcas predictivas.

## Políticas fijas ANTES de ver POST

Dentro del grupo que atraviesa 10/11; primeras ocho familias oficiales inalteradas, empates verdaderamente completos:
- `ORIGINAL`: orden alfabético original.
- `MAS_BLOQUES_ANCLADOS`: mayor nº de bloques anclados propios, luego mayor nº de tramos anclados diferentes; luego oficial.
- `MAS_TRAMOS_ANCLADOS`: mayor nº de tramos distintos de recorridos propios con raíz, luego nº de casilleros centrales distintos, luego oficial.
- `RAIZ_EN_FUENTE_RECIENTE`: presencia de ruta propia con raíz en fuente recién incorporada, luego fuente propia en que apareció más tarde, luego oficial.
- `AUSENTE_JORNADA_ANTERIOR`: no haber estado físicamente en la jornada anterior del mismo turno, luego oficial; no aplica con ventana ausente (primera jornada).
- `PROPORCION_ANCLADA`: mayor fracción de caminos propios que realmente llevan raíz, luego oficial; no contar caminos como raíces distintas.
- `ALFABETO_INVERSO`: desempate alfabético descendente (control de arbitrariedad del alfabeto).
- `HASH_FIJO`: menor SHA256 de fecha|turno|familia y semilla 20261013, control neutral fijo.
- `ALEATORIO_PRE_2000`: 2.000 sorteos uniformes de los miembros elegibles que compiten por uno o dos puestos, sellados PRE. No escoger la réplica que más acierte después de POST.

En cada método se cambia SÓLO qué familia ocupa la porción del empate que cruzaba la frontera del Top10. Las políticas no alteran los 8 puestos protegidos ni la bolsa de familias ancladas original.

## Verificación y salida

- Archivar tamaño de TODOS los grupos, partes incluidas/excluidas, firmas físicas completas y cuántas de las 62 fronteras permiten elección de 1 o 2 plazas.
- Con POST: cuántos grupos contenían familias ganadoras; si estaban entre elegidas, descartadas o ambas; desglose por mes, por turno, rescates **y pérdidas** pareadas respecto a Top original.
- Comparación exacta condicional: en los cortes donde el grupo tiene `n` miembros elegibles, `k` plazas y `w` familias ganadoras del grupo, el promedio de ganadoras escogidas por elección uniforme es `k*w/n`. Si la primera ocho ya acertó, ningún cambio de frontera rescata ese corte. Contabilizar además distribución empírica sobre las 2.000 elecciones selladas.
- Usar 20.000 permutaciones de **jornadas completas** y 20.000 entre mismo día de la semana. Evaluar diferencias pareadas con Top oficial, sin asumir independencia entre cinco turnos o cinco jurisdicciones. Guardar todos los negativos.
- Si el histórico no distingue con solidez dos miembros del mismo grupo, la salida válida es una **etiqueta explicativa de empate**, no inventar un nuevo factor ganador. Toda mejora in-sample está sometida a sesgo por numerosas búsquedas previas.
