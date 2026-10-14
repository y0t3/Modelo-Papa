# Auditoría de procedencia de un empate VT3 — 13/10/2026

Caso: Nocturna del 13/10/2026. **Informe retrospectivo**, aunque la reconstrucción usa exclusivamente estructuras PRE de aquel turno ya versionadas.

Objetivo: distinguir (a) *familias* VT3 empatadas, (b) *cabezas ganadoras históricas independientes* D−7, y (c) *recorridos históricos físicos distintos*, que no son la misma unidad. Una cabeza puede producir varias huellas antiguas, y cada huella puede trasladarse a más de una ubicación del tablero actual. No duplicar confirmaciones por número de candidatos descendientes.

Fuentes inmutables:
- `auditorias/vt3-cotejo-nocturna-13oct2026/INPUT_PRE_13OCT.json` (cinco objetos, incluida hoja Nocturna y D−1/D−7 con caminos ganadores anteriores).
- `auditorias/vt3-cotejo-nocturna-13oct2026/PRE_13OCT.json` (ranking previo por fuente/turno; Matutina cotejada con sello temporal del 13/10).
- Resultados del 13/10 se revelan **sólo en el análisis POST**; no se usan para elegir qué familias empatan.

Procedimiento: invertir prioridades D−1 y D−7 **únicamente a efectos de diagnóstico**, conservando bifurcaciones, fuentes y bloques. Extraer todas las familias con exactamente la misma tupla que la familia ubicada en el rango #11; seleccionar el grupo de empate completo, no la ganadora. Para cada candidata volver a proyectar todas las rutas reales ganadoras VT3 de D−1/D−7 sobre su propia fuente: misma secuencia de movimientos, sin saltos de fila, sin atravesar columnas, sin reutilizar celda. Guardar cabeza histórica (evento único `fecha/turno/jurisdicción/cabeza`), raíz geométrica física exacta, antigua y nueva secuencia de casillas, delta fila/columna y terna creada.

Grupos excluyentes por **evento histórico ganador completo**; por cada evento contar cuántas familias VT3 empatadas nacen de él y cuántas geometrías antiguas distintas aporta. La misma cabeza con dos formas geométricas cuenta UN antecedente ganador, no dos. Varias familias de la misma forma vieja tampoco constituyen antecedentes independientes.

Comparación negativa: después de congelar el inventario, identificar la única familia del grupo que coincide con una cabeza del sorteo del 13/10. Calcular qué criterio PRE real pudo distinguirla de hermanas del *mismo evento y exacta huella antigua*: ruta, posición, delta y exposición. Nunca atribuir capacidad predictiva por escogerla sabiendo que fue ganadora.

NO tocar `main`, `src/motorLalo.ts`, sus rankings ni VT4. No registrar un PRE retrospectivo como pronóstico oportunamente sellado ni reclamar ejecución de la prueba de 115 cortes aún pendiente.