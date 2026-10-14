# VT3 — arbitraje D−7 versus D−1 con raíces propias y controles

Rama aislada: `lab-vt3-prioridad-d7-contra-d1-14oct2026`. **No editar `main`, motor ni app**. Se investiga un criterio que surgió tras observar el 13/10 la cabeza Nocturna `1234`, cuya terna reversible `234/432` era la número 21 pese a una huella D−7 ganadora. Este es un estudio **post hoc**, no prueba de predicción.

## Fuente PRE y separación temporal
- `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json` SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`.
- `auditorias/vt3-cotejo-nocturna-13oct2026/PRE_13OCT.json` (cinco cortes del 13/10) y su sello; Matutina debe mantener el PRE histórico auténticamente anterior.
- 115 cortes de 15/09–10/10 y 5 cortes de 13/10. PRE solo carga familia, fuentes físicas, número de bifurcaciones, raíces D−1/D−7 y rangos originales. Las cabezas objetivo quedan ocultas antes de escribir y versionar `PRE_120.json` y `NEUTRAL_PRE_2000.json`. Luego se restaura y evalúa. El aislamiento de archivos es garantía **mecánica** del script, no convierte una hipótesis descubierta post hoc en prueba prospectiva.

## Diseños fijados sin POST
**Categorías excluyentes** de familia anclada: D7_SOLO (`d7>0,d1=0`), D1_SOLO (`d1>0,d7=0`), AMBAS y NINGUNA. Contar el número de *terminaciones diferentes* que cubre cada familia reversible (1 o 2; no duplicar palíndromos).

Ránkings sobre la **bolsa anclada VT3 idéntica**:
- OFICIAL: `bif>0, bif, d1, d7, sources, blocks` y familia alfabética.
- D7_ANTES_D1: `bif>0, bif, d7, d1, sources, blocks`. Conservar bifurcaciones antes que memoria histórica.
- D7_SOLO_RANGO3: mantener las dos familias originales #1–#2, poner como #3 la familia D7_SOLO mejor respaldada físicamente dentro de puestos originales #3–10, y conservar el resto del orden original sin agregar ni eliminar familias. Si no hay candidata, conservar ranking oficial.
- D7_SOLO_RANGO10: mantener los nueve primeros oficiales, reemplazar el décimo por una familia D7_SOLO de puestos originales #11–30 escogida por `bif, d7, fuentes, bloques, rango`. Si no hay, conservar la décima.
- D1_SOLO_RANGO10: **control de admisión simétrico**, mismo procedimiento con D1_SOLO.
- HASH_D7_RANGO3 y HASH_D7_RANGO10: elegir candidata elegible mediante SHA256 determinista del corte (sin resultados), misma extensión y mismo cupo de la política D7 correspondiente.

Control neutral adicional: 2000 sorteos PRE de una candidata D7_SOLO por corte entre las elegibles #3–10 para la tercera plaza, y una D7_SOLO de #11–30 para la plaza 10. No se agregan rutas ni se «prestan» raíces o bifurcaciones ajenas.

## POST
- Obtener familia objetivo VT3 de las **últimas tres cifras de cada cabeza de cuatro dígitos**.
- Medir aciertos Top3, Top5, Top10 por corte, incidencias de familias ganadoras por estrato, exposición esperada con `5 * número de terminaciones/1000`, rescates y pérdidas pareadas vs oficial, también por septiembre/octubre, 13/10 separado, y por turno.
- Calcular neutralidad de 2000 controles con decisiones selladas.
- Auditar `1234`: rango oficial 21, cuántas candidatas D7_SOLO disponibles, nuevo rango si D7 primero, decisión cupo10/3 y vecinos negativos del mismo corte. **Nunca** adjudicar éxito porque se sabe retrospectivamente que esta cabeza salió.
- Comprobar todas las rutas del ranking contra inventario PRE original y no alterar ningún ranking oficial.

Límite: 120 cortes seleccionados y revisitados, más múltiples experimentos previos. Una variación estadística no valida capacidad predictiva; requiere corte futuro efectivamente sellado antes del sorteo.
## Corrección de coherencia experimental (14/10)
El primer intento automatizado detectó que permitir una candidata #11–#30 en la tercera plaza rompía la exigencia de mantener el Top10 idéntico. Se restringe **exclusivamente la política de tercera plaza y su control neutral** a los puestos originales #3–#10. La política de décima plaza sigue pudiendo buscar en #11–#30. Corrección de consistencia interna, **anterior a completar cualquier POST de este ensayo**; no se utilizó ningún resultado nuevo para tomarla.
