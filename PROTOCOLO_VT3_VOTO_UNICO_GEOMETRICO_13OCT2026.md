# Protocolo VT3 — un único voto por geometría aprendida

**13/10/2026**, rama experimental `lab-vt3-voto-unico-geometrico-13oct2026`. No tocar `main`, VT3 oficial, VT4, hoja, sellos previos ni aplicación.

## Pregunta y mecanismo a falsar

En la auditoría `lab-vt3-atribucion-aprendizaje-online-13oct2026`, los **43 cambios** de la tercera candidata por añadir cabezas recientes se apoyaron en **formas geométricas que ya estaban presentes en la semana X**. El ranker puntuaba por la **media de las similitudes Jaccard de las 3 familias previamente ganadoras más semejantes**. Una misma figura repetida en muchos ejemplos puede ocupar las tres plazas de ese promedio.

¿Sirve más darle **un voto por geometría diferente**, en vez de un voto por cada familia×turno histórica ganadora que posea esa forma?

### Políticas predefinidas, sin consultar ninguna cabeza de la semana objetivo

Memoria de positivos de **la semana X completa** (fija), o memoria de X + positivos de X+1 **únicamente de los turnos ya sorteados** (online). En ambos casos:
- `ORIGINAL`: algoritmo congelado anterior, media Jaccard de los **3 ejemplos** positivos más cercanos; cada aparición histórica vota.
- `FIRMA_UNICA`: agrupar ejemplos por su **conjunto ordenado de formas normalizadas** de todos los caminos VT3 válidos. Un único voto por firma de conjunto (si dos ejemplos tienen exactamente el mismo conjunto, se fusionan). Media de los 3 **grupos geométricos** más cercanos. Así no cuenta dos veces un mismo conjunto de formas.
- `FORMA_UNICA`: agrupar todas las **formas normalizadas individuales** observadas en los caminos de cada ejemplo positivo, aunque correspondan a familias/turnos diferentes. Cada forma recibe un voto como conjunto unitario en el índice Jaccard respecto a las formas de la candidata actual. Media de los 3 rasgos más cercanos. Así ninguna forma obtiene más votos por repetirse en varios ejemplos.
- `NEG_FIRMA_UNICA`: mismo agrupamiento por firma pero con ejemplos no ganadores de la semana X; número de ejemplos negativos del docente previamente fijado por corte (uno por corte sin positiva), como contraste de especificidad, nunca ajuste posterior.

Todas las variantes mantienen sin cambio el Top1 y Top2 VT3 **oficiales** y colocan como tercero **exactamente una familia físicamente válida de fuera de los 10 oficiales**; el Top10 conserva entonces Top3–Top9 originales. Desempates: familia anclada por raíz propia; puesto oficial; orden alfabético. La agrupación de formas de ejemplos sólo afecta puntuación; **no inventa recorridos ni raíces**. Las rutas pueden ser de fuentes distintas siempre que **cada ruta física individual** permanezca dentro de una misma fuente y use casillas contiguas: la forma normalizada sirve como rasgo geométrico, no como supuesto camino real entre fuentes.

## Entrenamiento y examen
- PRE fuente único `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/PRE_115.json` SHA256 `42e5993b63b3740ecb911b2fb255508f1bf75408467cd530ffad65f8e685bd8e`. 115 cortes, 23 jornadas, cuatro semanas calendario. 
- Tres pares X→X+1: 14/09→21/09, 21/09→28/09 y 28/09→05/10. Evaluar **90 cortes (18 jornadas × 5 turnos)**, ventana primeros 1, 2, 3 días y últimos 3 días y las tres semanas por separado.
- Preparar y sellar `PRE_90.json` y política de controles **sin ningún archivo POST visible**; mover físicamente todo `auditorias` excepto fuente PRE. Firmar SHA256 de insumos, protocolo, código y PRE.
- Después del sello, recuperar `POST_115.json` con objetivos y `MEMORIA_SEMANA_*.json` con enseñanza X. Comprobar memorias de X contra las familias positivas que tienen geometría físicamente disponible.
- **Para cada corte de X+1**, construir candidatos y bancos primero con resultados anteriores (índices estrictamente menores). Fijar y comparar con selección original congelada en `auditorias/vt3-memoria-corta-online-90-13oct2026/POST_90.json`; abortar si las listas `ORIGINAL_STATIC` o `ORIGINAL_ONLINE` difieren. Sólo después consultar el resultado actual para puntuar.
- Agrupar firmas de forma determinista, dando el primer ejemplo cronológico como representante para la auditoría y conservando la lista de todos los ejemplos en cada grupo; en `FORMA_UNICA`, registrar cuántos ejemplos repetían la forma y cuántos eventos históricos diferentes dieron lugar a ella.
- No elegir retrospectivamente el modo que mejor acierte ni los primeros días preferidos.

## Resultados y controles

Informar para las seis políticas positivas `ORIGINAL/FIRMA_UNICA/FORMA_UNICA × FIJA/ONLINE`, más negativo de firma fija:
1. Top3/Top5/Top10 por corte, semana, turno, y primeras 1/2/3 jornadas. Rescates/perdidas pareados contra `ORIGINAL` y contra VT3 oficial.
2. Cantidad de terceras realmente cambiadas al deduplicar, **número de firmas y formas distintas** frente a cantidad de ejemplos; tasa de empates por puntaje.
3. Para cada cambio, traza de las **tres formas/firmas que ganan la votación** y su procedencia; diferenciar similitud de formas vs mismas casillas/fuente.
4. **2.000 controles físicos uniformes** y **2.000 controles del mismo estado de raíz (anclada/no anclada) y cantidad de caminos** que el tercero de cada variante, usando semillas fijas declaradas en PRE y el mismo presupuesto de una plaza. No comparar contra un procedimiento que cambie los diez lugares.
5. Control adicional negativo por firmas de familias no ganadoras, mismo procedimiento de selección y número fijo de ejemplos por corte. Si un método positivo apenas supera al negativo o neutral, no atribuir capacidad de discriminación.
6. Registrar expresamente que el 100 % de semanas X previas se logró por **memorización supervisada de cabezas conocidas**; esta prueba de generalización NO hereda esa certeza.

## Decisión
Muestra pequeña y reiteradamente explorada; sorteos de quiniela aleatorios. Aunque haya mejora histórica en un Top, seguiría siendo exploratoria y requeriría nuevos cortes sellados antes de promover una regla. No actualizar VT3 ni VT4 en esta rama.

**Entregables:** `scripts/lab-vt3-voto-unico-geometrico.mjs`, workflow GitHub Actions, `auditorias/vt3-voto-unico-geometrico-90-13oct2026/{PRE_90.json,SELLO.json,POST_90.json,RESUMEN.json}` e informe técnico Markdown.
