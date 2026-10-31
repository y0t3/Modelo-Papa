# VT3 AUX: por qué aparecen ganadoras en puestos 11–20

**Auditoría retrospectiva PRE · 30/10/2026 · Rama:** `lab/aux-vt3-rangos-11a20-30oct2026`.

Se examinó el motor auxiliar **sin modificar** su ranking original (fuentes ganadoras del día sorteable anterior y mismo día de la semana precedente). Los controles experimentales reordenan exclusivamente familias del **Top20 original**, sin mezclar AUX Ayer, AUX Hoy ni la hoja +11. La lectura usa recorridos físicamente contiguos de tres celdas, permite cruzar franjas de una misma AUX y mantiene reversibles como una familia.

## Datos, protocolo y comparabilidad

- **119 jornadas** completas (77 de junio–agosto y 42 de septiembre y octubre), 595 cortes por hoja; cinco cabezas por turno (Ciudad, Provincia, Córdoba, Santa Fe y Entre Ríos); se excluyen las jornadas incompletas 20/6 y 9/7 y, en octubre, las anteriores al 12/10. **No incluir Montevideo** en la evaluación.
- PRE reconstruido estrictamente con cifras de las celdas disponibles al turno, y antecedentes de los seis días sorteables previos para las características físicas. Las cabezas reales del turno se incorporan exclusivamente a POST.
- **Etapa temprana:** Previa/Primera/Matutino; AUX Ayer completa, AUX Hoy vacía/parcial. **Etapa completa:** Vespertino/Nocturno; ambas con 24 cifras.
- Para comparar Top10 vs 11–20 **de igual cantidad**, se evalúan por separado solamente cortes con 20 candidatos en el ranking auténtico. Se mantienen registros del total de cortes y los casos sin 20 disponibles, para no atribuir ventaja a una hoja parcial.
- Nuevos órdenes exploratorios de diez familias, siempre dentro del Top20 original: **Exacto** (más fechas de antecedentes en misma posición), **Desplazado** (más fechas con silueta comparable a ±2 columnas), **Cruce** (trayectorias que cruzan fronteras de franjas). Los desempates preservan el puesto original. Cinco controles de diez familias se eligen por orden pseudoaleatorio determinista entre los mismos veinte, sin resultados futuros.
- Cada marca histórica se deduplica por **evento real** (una misma cabeza con muchos recorridos no son muchos testigos). La pertenencia a la familia se coteja por las últimas tres cifras exactas; los números con cero inicial se conservan.

## Resultado principal — 10 contra 10 con candidatos completos

| Tablero y etapa | Cortes comparables | Top10 oficial | Puestos 11–20 | Exacto | Desplazado | Cruces | Neutro medio |
|---|---:|---:|---:|---:|---:|---:|---:|
| AUX Ayer, temprana | 351 | 38 | 39 | 35 | 29 | 34 | 37,6 |
| AUX Ayer, completa | 234 | 21 | 25 | 27 | 26 | 27 | 21,4 |
| AUX Hoy, temprana | 176 | 20 | 18 | 18 | 17 | 15 | 16,6 |
| AUX Hoy, completa | 228 | 19 | **27** | 23 | 21 | 24 | 24,0 |

Son **coincidencias de cabezas**, no apuestas ganadoras ni eventos independientes. Para Aux Hoy temprana, apenas 176 de los 357 cortes disponen de veinte familias; es imprescindible no extrapolar sus resultados a la Previa sin tablero.

Con hojas completas, **los puestos 11–20 superan a los primeros diez** en ambas auxiliares, especialmente Aux Hoy (27 vs 19); sin embargo, una selección neutra entre las veinte promedió 24 en Hoy, muy próxima a los 27 del bloque 11–20. No está demostrada una ganancia estadísticamente robusta; los turnos y cabezas dentro de una jornada están correlacionados y existen múltiples comparaciones retrospectivas.

## Qué distinguía a las familias ganadoras 11–20

En la etapa **completa de AUX Ayer** se registraron **25** familias ganadoras dentro de 2.340 candidatas de puestos 11–20. De esas 25:
- 15 tenían al menos un antecedente de **posición exacta**; también lo tenían **1.300 de las 2.340 candidatas** del bloque (55,6 %), de modo que la repetición exacta separa poco.
- 25 tenían antecedentes de **silueta desplazada**; también **2.212 de las 2.340 candidatas** (94,5 %), por lo que el desplazamiento es casi universal y por sí solo no discrimina.
- 11 tenían recorridos actuales que **cruzan franjas**; 1.028 de las 2.340 candidatas (43,9 %) podían cruzar. Proporción entre ganadoras: 11/25 = 44 %, prácticamente idéntica al universo del bloque.
- Las **25** tenían recuerdos físicos de la figura/posición en **dos o más jornadas anteriores**; esa condición se daba en **1.948 de las 2.340 candidatas** (83,2 %). Las otras 392 no aportaron una ganadora en estos cortes. **Es una observación específica del período, turno y hoja, no una regla de descarte validada.**

Contrastes obligatorios: en la etapa temprana de AUX Ayer, 31 de 39 familias ganadoras 11–20 cumplían dos o más jornadas, por lo que un filtro estricto habría excluido 8; en AUX Hoy completa, solo **12 de 27** lo cumplían, y un filtro igual habría descartado 15. Por tanto **no trasladar** una regularidad de AUX Ayer completa a otros modos.

En AUX Hoy completa, apenas **9 de 27** ganadoras en 11–20 tenían raíces tanto en la referencia del día anterior como en la semanal, mientras 18 dependían de uno de los dos bloques de referencia. Esta observación sugiere estudiar por separado cómo se pondera la diversidad de raíces y su número; no permite concluir que los respaldos dobles sean perjudiciales.

## Revisión de episodios concretos de octubre

| PRE/POST | AUX y rango | Evidencia previa válida del puesto |
|---|---|---|
| 27/10 Nocturna, Córdoba **1066** → VT3 066 | AUX Ayer #15 | 4 raíces originales (1 anterior, 3 semanales), 1 evento de sitio exacto, 3 de figura desplazada, 2 sitios con cruce |
| 28/10 Nocturna, Entre Ríos **2547** → VT3 547 | AUX Ayer #11 | 4 raíces (2 anteriores, 2 semanales), **0 exactas**, 5 eventos de desplazamiento en tres fechas, un sitio con cruce |
| 29/10 Nocturna, Santa Fe **2813** → VT3 813 | AUX Ayer #12 | 4 raíces (3 anteriores, 1 semanal), 1 exacta, 4 eventos desplazados en cuatro fechas, sin cruce entre franjas |

Estos son ejemplos **descriptivos**: no fueron elegidos sin conocimiento del POST y no deben convertirse en condiciones ajustadas específicamente para rescatar 066/547/813.

## Estabilidad del nuevo orden por lugar exacto

En AUX Ayer con hoja completa, nuevo orden por posición exacta: junio–agosto **23** vs Top10 **15**; septiembre–octubre **4** vs Top10 **6**. La ventaja no se sostiene al pasar al segundo período. La misma inestabilidad aparece en otras variantes. Reordenar exclusivamente por raíces del motor actual reproduce sus resultados, control de regresión.

## Decisión de esta etapa

**Mantener Motor Lalo y los Top10 operativos tal como están**, sin incorporar ranking nuevo, eliminación automática de VT3 ni aumento de jugadas.

Prioridad del próximo estudio: en **AUX Hoy completa**, contrastar si el orden actual —que **ya deduplica eventos ganadores**, prioriza número de raíces y luego referencias anterior/semanal, cruces y desempates— separa adecuadamente la **cantidad de eventos únicos** de su **distribución entre jornadas**, siempre con los mismos 20 candidatos y diez posiciones. No presentar multiplicidad de caminos como múltiples raíces: el motor actual no comete ese error. En paralelo conservar como **alerta observacional** (sin filtrar) la condición de antecedentes en varias jornadas de AUX Ayer completa. Toda hipótesis posterior deberá quedar fijada antes de mirar otro período o, idealmente, sellada prospectivamente por turno.

## Archivos y reproducción

- `src/labAuxTop20AuditVT3.ts`: evidencia física por familia, event-id deduplicado, 7 selectores y cinco controles neutrales.
- `scripts/test-aux-top20-vt3.ts`: invariantes de geometría, raíces deduplicadas, bloqueo de información posterior y selección de hasta 10.
- `scripts/lab-aux-top20-vt3.ts`: replay PRE, casos ganadores del 11–20 y tablas por etapa/mes/turno; reporte con control explícito para cortes completos de 20.
- `.github/workflows/lab-aux-top20-vt3.yml`: dos periodos independientes, pruebas de regresión del Lalo y replay real.
- [GitHub Actions, revisión original](https://github.com/y0t3/Modelo-Papa/actions/runs/41162008622): dos trabajos success.
- [GitHub Actions, control equiparado veinte disponibles](https://github.com/y0t3/Modelo-Papa/actions/runs/41162159975): dos trabajos success.
- Artefactos JSON de ambos períodos en las ejecuciones, con detalle por turno y familia.

**No se tocaron ni main, ni MV1, ni la APK; solo rama de investigación.**
