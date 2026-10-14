# VT3: ternas físicas fuera del Top, exposición y plaza controlada — 13/10/2026

**Rama de laboratorio aislada**, no alterar motor `src/motorLalo.ts`, `main`, predicciones o sellos oficiales.

## Pregunta

115 cortes históricos: 143 registros de familia VT3 ganadora físicamente presente vs 64 dentro de la bolsa admitida con raíz; 79 restantes sólo geométricos. Distinguir:
1. Si esas 79 coincidencias superan la expectativa nula dada la cantidad de terminaciones de tres cifras realmente disponibles (no sumar repetidamente una terna invertida).
2. Si entre las ternas sin raíz hay diferencia por nacimiento físico **dentro del día** (contra el turno anterior), fuentes independientes y número de recorridos/formas.
3. Si ocupar **una plaza real del Top10** con una terna física sin raíz, manteniendo las nueve primeras posiciones oficiales, recupera aciertos sin perder otros. Comparar con la 10.ª familia oficial, la 11.ª admitida y sorteos neutrales de la misma bolsa.

## PRE y sellos

Fuente única `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`, con huellas VT3 físicas, ranking anclado y testigos, SHA-256 oficial `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`. Para cada corte ocultar POST fuente, POST Nocturna y fixture histórico antes de generar PRE. Probar identidad del Top10 actual por sus familias. Guardar partición exacta de las **1.000 terminaciones** de tres cifras, por categorías disjuntas: ancladas #1–3, ancladas #4–10, ancladas #11+, físicas sin anclaje nuevas / persistidas según turno y número de fuentes, Previa sin comparación intradía, no físicas.

El estado 'nueva' significa *no presente en ninguna columna que ya existiera en el turno anterior de esa misma fecha*, no una nueva predicción ni un nuevo resultado. En Previa se mantiene categoría aparte.

Elegir en PRE siete métodos Top10, siempre exactamente diez familias únicas:
- `OFICIAL` nueve primeras + décima actual;
- `ANCLADA_11` nueve primeras + puesto #11 admitido;
- `FISICA_NUEVA` nueve primeras + sin raíz de nacimiento actual con más bloques (si Previa, no hay novedad comparable);
- `FISICA_PERSISTE` nueve primeras + sin raíz ya presente antes en el día con más bloques;
- `FISICA_MAS_FUENTES` nueve primeras + sin raíz de más fuentes y bloques;
- `FISICA_MAS_FORMAS` nueve primeras + sin raíz de más formas independientes;
- `FISICA_HASH_NEUTRO` nueve primeras + candidata sin raíz elegida mediante hash determinista.

Si no existe una candidata del estrato, documentar relleno desde otra física sin anclaje; si ninguna existe, preservar décima anclada. Registrar cuántos cambios efectivos se producen, no simular que cambió una plaza si no ocurrió.

2.000 selecciones neutrales de una familia sin anclaje por corte generadas en PRE y **selladas antes del POST**, para comparar las mejoras aparentes bajo igual disponibilidad.

## POST

Para cada cabeza real usar **sólo últimos tres dígitos**, familia reversible `xyz/zyx`. Medir número de terminaciones disponibles y observadas por clase; esperanza bajo cinco números uniformes 000…999 y Poisson-binomial ilustrativa; separar septiembre/octubre y por turno. Cotejar rankings Top3/Top5/Top10, 115 cortes, ganancias/pérdidas, familia ganadora, plaza utilizada y comparación con 2.000 decisiones neutrales.

No optimizar aquí sobre el POST: ningún ganador debe intervenir en las selecciones PRE, ni una familia física sin raíz adquirir de manera ficticia antecedentes D−1/D−7. No afirmar mejora predictiva con datos reutilizados.