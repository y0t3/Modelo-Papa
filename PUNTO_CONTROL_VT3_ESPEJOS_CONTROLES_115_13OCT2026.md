# VT3 · cierre de laboratorio de espejos y negativos — 13/10/2026

## Estado
- Rama: `lab-vt3-espejos-controles-13oct2026`.
- Protocolo fijado en commit `941234e3fac96096124b0daf064adf3374aa5919`.
- Implementación sellada antes de ejecución en `6764ccdcbcd6c7ea353934c71db6ffba1007541b`; workflow en `6f9e11bd554944ce4de57251d79788468c512b33`.
- GitHub Actions [38349729256](https://github.com/y0t3/Modelo-Papa/actions/runs/38349729256): **SUCCESS**, incluyó separación física PRE/POST, comprobación SHA256, contraste, subida de artefacto y commit de resultados.
- PRE de origen (`auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`) SHA256: `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`.
- PRE nuevo SHA256: `46f5d1f0e64fb72e6f05fa0c2de4ad1262cb9a0f7c71e18d803ff1073363e5d5`.
- Archivo permanente: `auditorias/vt3-espejos-controles-115-13oct2026/` (PRE, SELLO, POST, RESUMEN, Nocturna diagnosticada aparte).

## Resultado independiente de la simulación nocturna
Se conservaron los 115 cortes y 23 fechas históricas; los controles reprodujeron:
- cobertura física en 80 cortes;
- 143 exposiciones familia×corte coincidentes en inventario;
- Top10 original, 15 cortes, 17 exposiciones coincidentes.

| Señal PRE | Exposiciones señal | Coincidencias POST señal | Control comparable: observado / referencia | Septiembre comparable | Octubre comparable |
|---|---:|---:|---:|---:|---:|
| Otra ruta con iguales extremos y centro distinto | 612 | 6 | 5 / 5,634 | 4 / 4,031 | 1 / 1,603 |
| Ruta adicional en fuente sin raíz propia | 919 | 12 | 12 / 10,516 | 9 / 6,765 | 3 / 3,751 |
| Familia física sin ninguna ruta admitida | 8.884 | 79 | 76 / 76,421 | 44 / 48,496 | 32 / 27,925 |

El control comparable usa sólo estratos PRE mixtos (señal presente y ausente) por corte y densidad morfológica (bloques, fuentes según señal y palindromía). Los observados comparables pueden ser menos que los aciertos totales. Las exposiciones, rutas y turnos no son observaciones independientes. No hay prueba confirmatoria ni potencial predictivo demostrado, pues el corpus ya fue investigado repetidamente.

### Diagnóstico de Nocturna conocida 12/10
- **851 / 158**: físicamente disponible, una fuente y un bloque, sin anclaje; no hay puesto original.
- **615 / 516**: anclaje real D−7 en Primera, con otro recorrido válido sin anclaje en Vespertino; puesto 54.
- **242 / 242**: anclaje real D−1 en Vespertino y alternativa con los mismos extremos y centro distinto; puesto 25.
- **290 / 092 y 264 / 462**: ninguna terna físicamente posible con el PRE; controles negativos.

Se etiquetaron todos antes de unir con el resultado POST en el código nuevo, pero este corte se había conocido antes de diseñar el ensayo; es una ilustración, no validación.

## Decisión
No mover el Top oficial con ninguna de estas señales. No elevar automáticamente una ruta física sin raíces, ni asignarle la raíz de otra fuente o casillero. Los únicos resultados favorables son pequeños, inestables por mes o indistinguibles de controles de densidad. VT4 permanece congelada, al igual que app, APK, hoja, sellos y `src/motorLalo.ts`.

## Próxima línea de trabajo
No reiterar por defecto bonificaciones por bifurcaciones, más fuentes, contactos parciales, D−2/D−9 o simple mayor densidad. La siguiente fase útil será **registrar prospectivamente y por separado**, desde antes de un sorteo nuevo, el Top10 original y las familias físicas no elegidas con sus trazos y razones, y medir en nuevos cortes si algún criterio fijo distingue a ganadoras y negativas equivalentes. Diferenciar estrictamente mejora de cobertura, mejora de selección y evidencia prospectiva; no ampliar el cupo de diez familias para atribuir un supuesto beneficio.

Este registro conserva una auditoría reproducible, no una afirmación de que existan ternas con probabilidad de salida superior a otras.
