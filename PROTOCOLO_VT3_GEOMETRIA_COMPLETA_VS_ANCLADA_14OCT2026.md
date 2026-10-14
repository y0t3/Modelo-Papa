# Protocolo VT3 — geometría completa vs. geometría con raíz verificada
**14/10/2026 · 23 jornadas / 115 cortes (retrospectiva). Ramas de laboratorio, `main` intacta.**

## Pregunta única
¿Al permitir todos los caminos físicos VT3 posibles, incluidos los que no derivan de una firma de una huella ganadora anterior, se recuperan cabezas VT3 que quedaban fuera del selector anclado? ¿El cambio mejora el Top3/5/10 respecto de exactamente el mismo orden geométrico **restringido a anclados**, VT3 original y controles neutrales?

## Fuente y universo
`auditorias/vt3-atlas-cuatro-dimensiones-115-14oct2026/EVENTOS_PRE_115.json`: todos los caminos VT3 físicos disponibles antes de cada turno, 6×2 por fuente, tres celdas vecinas sin reutilizar y sin cruces. `auditorias/vt3-posiciones-geometricas-115-14oct2026/PRE_115.json`: subconjunto anclado por **misma fuente + firma geométrica** de una cabeza históricamente premiada. Deducir pertenencia al anclado por identificador de ruta físico canónico, NO por cifras.

No usar PRE de cortes posteriores como memoria. Para cada fecha y turno, consultar exclusivamente la hoja del mismo turno de D−1 exacto y D−7 exacto, ambas estrictamente anteriores. Comparar firmas y posiciones físicas **dentro de la misma fuente**; una traslación entre dos hojas homónimas no habilita recorrido cruzado entre fuentes. NO usar valores/familias actuales para priorizar.

## Una política geométrica idéntica sobre dos universos
`EVOLUCION_D1`: ordenar rutas por (1) desplazamiento relativo >=2 filas frente a forma/fuente homónima D−1, (2) distancia máxima geométrica D−1, (3) desplazamiento >=2 filas D−7, (4) distancia máxima D−7, (5) respaldo por evento histórico ganador independiente de la propia firma, (6) desplazamiento desde raíz ganadora, (7) desempate estable por fuente, posición y clave geométrica. No depende de ninguna familia actual.
`EVOLUCION_D7`: iguales elementos pero D−7 antes de D−1, en consonancia con el uso histórico de hojas del mismo día semanal.
Ejecutar **la misma** ordenación sobre (a) `SOLO_RAICES`, (b) `TODAS`. Así la única diferencia causal es la apertura de rutas sin raíz; no cambiar simultáneamente la regla de score. Conservar `GEO_DESPLAZAMIENTO` antiguo y VT3 oficial como baselines independientes.

**Lectura tardía:** Después de ordenar rutas físicas, concatenar dígitos, formar la familia reversible VT3 y conservar hasta 10 familias distintas. Evaluar Top3/5/10 a igual cupo. También informar tamaño del universo, cuántas rutas sin raíz ascienden a cada Top y de qué familia, y diversidad de formas/posiciones. No se cuenta como éxito geométrico observar una ruta ya existente: sólo la coincidencia de familia PRE con una cabeza futura POST.

## Controles y diagnóstico de cobertura
- 2.000 permutaciones neutrales por universo y corte, congelando universos PRE. Comparar los Top3/5/10 contra distribuciones por igual presupuesto.
- POST se abre únicamente tras escribir y sellar PRE. Antecedentes de D−1/D−7 usan física PRE de esos días, jamás sus objetivos sorteados futuros.
- Medir ganadoras físicamente presentes en el universo completo, en el pool anclado, y en `TODAS\SOLO_RAICES`, sin confundir oportunidad/oráculo con selección exitosa.
- Tabular puntajes por septiembre y octubre, por turno y neto frente a VT3 oficial. Una cola de control neutral NO es prueba confirmatoria dado que estas mismas jornadas se reutilizaron para generar hipótesis.
- No interpretar posiciones como resultados sorteados, no invertir VT4, no tocar hoja marcada/producción/app/sellos prospectivos del 14/10.

**Regla para aceptar una mejora:** no incorporar como ranking oficial un uplift retrospectivo sin consistencia temporal y sellos verdaderamente posteriores. Dejar informe y candidatos geométricos nuevos auditables, incluso si el resultado es negativo.
