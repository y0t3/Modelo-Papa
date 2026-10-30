# VT3 AUX — disponibilidad de tablero y tipos de respaldo físico
**Punto de control: 30/10/2026. Rama:** `lab/aux-vt3-etapas-respaldos-30oct2026`.

## Alcance y controles
Reproducción histórica **PRE reconstruida** de 119 jornadas (1/6–29/10, excluyendo 20/6 y 9/7 por incompletas y 1–11/10 en el bloque de octubre), 595 cortes por AUX y cinco jurisdicciones por corte (Ciudad, Provincia, Córdoba, Santa Fe y Entre Ríos). Los resultados de ambos tableros se evalúan por separado; no se suman como cabezas distintas.

- **Etapa temprana:** Previa, Primera y Matutino. AUX Ayer ya tiene 24 cifras; AUX Hoy aporta 0, 8 y 16 cifras respectivamente.
- **Etapa completa:** Vespertino y Nocturno. Ambos tienen 24 cifras; siguen siendo tableros independientes, sin cruces entre AUX Ayer, AUX Hoy ni +11.
- Todas las figuras de VT3 usan tres celdas distintas contiguas, incluidos cruces válidos entre franjas del **mismo** tablero y las familias reversibles.
- **Oficial:** posiciones 1–10 con las referencias D−1 y D−7 originales. **Control interno:** posiciones 11–20 del mismo ranking. **Base:** Formas Primero, seis jornadas anteriores. **Exacto:** nuevos sitios priorizados por testigos de la misma ubicación. **Desplazado:** nuevos sitios priorizados por la misma silueta trasladada hasta dos columnas, excluyendo coincidencia exacta como primer respaldo. Los tres experimentos comparten ventana de seis jornadas y máximo diez familias formables, deduplicadas, por turno y hoja.
- Controles neutrales: cinco selecciones deterministas de familias físicamente posibles, sin resultados futuros. La selección de sitios sucede antes de leer los dígitos del tablero actual; los sorteos POST intervienen **solamente** en el cotejo.
- Pruebas de PRE: prioridad de ubicaciones invariante al sustituir los dígitos, ausencia de fechas futuras, caminos físicos válidos, top deduplicado y regresión del motor Lalo.

## Etapa temprana — 357 cortes y 1.785 cabezas por AUX

| Métrica | AUX Ayer | AUX Hoy |
| --- | ---: | ---: |
| Cabezas VT3 físicamente formables | **428** | **138** |
| Top10 oficial | 38 | 24 |
| Puestos 11–20 | 39 | 21 |
| Formas Primero, base | **44** | 22 |
| Priorización de sitio exacto | 42 | 22 |
| Priorización de silueta desplazada | 41 | 23 |
| Promedio de controles neutrales | 35,2 | 23,4 |

La superioridad bruta del AUX Ayer en esta etapa deriva en gran parte de su hoja completa desde la Previa. AUX Hoy no dispone de familia VT3 en Previa y puede tener menos de diez familias con historia en otros turnos. El porcentaje de ganadoras formables recuperadas por el Top10 es 38/428 = 8,9 % para Ayer y 24/138 = 17,4 % para Hoy; **no** equivale a una predicción superior de Hoy.

## Etapa completa — 238 cortes y 1.190 cabezas por AUX

| Métrica | AUX Ayer | AUX Hoy |
| --- | ---: | ---: |
| Cabezas VT3 físicamente formables | **270** | **245** |
| Top10 oficial | 21 | 21 |
| Puestos 11–20 | 25 | **27** |
| Formas Primero, base | **28** | 21 |
| Priorización de sitio exacto | **28** | 19 |
| Priorización de silueta desplazada | **28** | 19 |
| Promedio de controles neutrales | 23,6 | 19,0 |

En AUX Ayer las tres selecciones geométricas dan **28 coincidencias** con las hojas completas, pero no son la misma selección ni un triunfo robusto: el valor es 28/1.190 cabezas (2,35 %), los controles son comparables y se han comparado múltiples variantes. AUX Hoy no mejora con prioridad exacta ni desplazada.

### Desglose en turnos con hoja completa

| Tablero/turno | Oficial | 11–20 | Base | Exacto | Desplazado |
| --- | ---: | ---: | ---: | ---: | ---: |
| Ayer Vespertino | 12 | 11 | 17 | 13 | 14 |
| Ayer Nocturno | 9 | 14 | 11 | 15 | 14 |
| Hoy Vespertino | 12 | 11 | 13 | 10 | 14 |
| Hoy Nocturno | 9 | 16 | 8 | 9 | 5 |

La Nocturna de AUX Ayer suma 15 coincidencias con prioridad de ubicación exacta frente a 9 del oficial, pero esta observación retrospectiva **no** autoriza una política específica de Nocturna. Al contrario, la misma prioridad no mejora AUX Hoy ni Vespertino de AUX Ayer respecto de la base.

### Estabilidad mensual en la etapa completa, AUX Ayer

| Mes | Oficial | Base | Exacto | Desplazado |
| --- | ---: | ---: | ---: | ---: |
| Junio | 3 | 3 | 5 | 2 |
| Julio | 4 | 3 | 4 | 5 |
| Agosto | 8 | 9 | 9 | 9 |
| Septiembre | 6 | 11 | 6 | 9 |
| Octubre 12–29 | 0 | 2 | 4 | 3 |

La ventaja cambia de criterio según el mes. Ninguna prioridad aislada demostró estabilidad suficiente para llevarse a producción.

## Diagnóstico y decisión

**La disponibilidad de celdas y la jerarquización son problemas distintos.** En la primera parte de la jornada, AUX Ayer proporciona mucha mayor cobertura física. Con ambos tableros completos, los Top10 originales empatan en coincidencias (21/21), aunque las hojas siguen siendo distintas. Los puestos 11–20 mantienen cifras similares o superiores a los Top10, lo cual justifica auditar la clasificación, **pero no** ampliar automáticamente candidatos ni apuestas.

**No promover las variantes:** Exacto y Desplazado no superaron de forma consistente a la base; los tres métodos físicos de AUX Ayer empatan en la etapa completa, mientras AUX Hoy pierde coincidencias con los dos nuevos. Estos ensayos se diseñaron con conocimiento retrospectivo del período: no hay PRE prospectivo sellado, ni control suficiente para atribuir predictividad.

**Siguiente paso permitido en laboratorio:** conservar, antes de mirar otros resultados, un contraste por turno de 10 familias exactas con cabezas POST únicas, testigos de sitio exacto, silueta desplazada y cruce de franjas, con controles neutros de igual presupuesto y agrupación por jornada; no modificar MV1 ni APK. Exigir validación prospectiva PRE sellada antes de considerar cambios operativos.

## Reproducción y estado
- [GitHub Actions — prueba de junio–agosto y septiembre–octubre](https://github.com/y0t3/Modelo-Papa/actions/runs/41033035976): **2 trabajos success**, con tests de geometría, PRE, regresión Lalo y replay independiente por periodo.
- `src/labAuxRespaldosVT3.ts`: políticas exacto y desplazado, sin modificar selector oficial.
- `scripts/test-aux-etapas-respaldos-vt3.ts`: invariancia de geometría respecto de cifras y veto POST.
- `scripts/lab-aux-etapas-respaldos-vt3.ts`: replay separando turnos y respaldo.
- `.github/workflows/lab-aux-vt3-etapas-respaldos.yml`: matriz independiente de períodos.
- Artefactos Actions: `aux-etapas-respaldos-junio-agosto` y `aux-etapas-respaldos-septiembre-octubre`, con JSON de métrica por turno y por mes.

**Rama de laboratorio exclusivamente: sin commits a main, cambios de interfaz, APK ni motores oficiales.**
