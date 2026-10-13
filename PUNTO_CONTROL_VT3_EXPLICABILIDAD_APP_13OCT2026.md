# Punto de control — explicabilidad física VT3 dentro de la app

**13/10/2026 · Rama experimental `lab-vt3-explicabilidad-app-13oct2026`**. Código validado en [GitHub Actions #38404205216](https://github.com/y0t3/Modelo-Papa/actions/runs/38404205216). **No se modifica `main` ni `src/motorLalo.ts`**, VT4, app publicada, Tops o predicciones históricas.

## Qué se añadió a la app

Nueva sección al final de **PREDICCIÓN**, «¿POR QUÉ NO ENTRÓ A VT3?», integrada en `App.tsx` con el componente `src/ui/Vt3Explainer.tsx`. El nuevo motor de diagnóstico **no altera ni reordena** el motor original: es `src/vt3Audit.ts`, lector PRE puro.

Consultas por 3 cifras, 4 cifras (últimas tres para VT3) o familia reversible; familias reversibles se canonizan correctamente (`851` -> `158/851`, `615` -> `516/615`, `242` -> `242/242`). Entrada inválida no genera una coincidencia falsa.

Se visualizan:
- Estado: sin formación física; físicamente presente pero sin admisión; dentro de Top3; dentro de Top10; admitida fuera de Top10.
- Todos los caminos propios únicos de tres casillas **vecinas, de una sola fuente**, consolidando recorrido e inverso. Cada fuente/casilla aparece con numeración humana (fila 1..6, columna 1..2).
- Total físico, admitidos en el motor, físicos sin anclaje, fuentes, raíces independientes D−1/D−7, bloques bifurcados.
- Origen exacto de cada ruta admitida, con fecha/turno/jurisdicción/cabeza histórica. Un mismo evento histórico que justifica varias rutas cuenta **una sola vez**, no se prestan raíces a otras ternas.
- Para familias admitidas por debajo de Top3 o Top10: primer criterio lexicográfico que explica su inferior posición contra el último miembro de ese Top — bifurcaciones, bloques bifurcados, D−1, D−7, fuentes, bloques; después, desempate alfabético.
- Hasta ocho caminos visibles, con expansión para todos los restantes y navegación a PREDICTIVA si la familia ya está admitida.
- Chips de cabezas reales sólo **si el turno ya fue sorteado**, etiquetados POST. Estas cabezas no se pasan al motor ni a la función de diagnóstico PRE.

El panel respeta los colores claros/oscuros ya existentes y se limita a la pestaña Predicción. No se cambian las demás pestañas, estructura de datos ni motor oficial.

## Validaciones automáticas realizadas

GitHub Actions [#38404205216](https://github.com/y0t3/Modelo-Papa/actions/runs/38404205216) terminó con **todos sus pasos exitosos**, incluidos:
1. `npm install` y `npx tsc --noEmit` sobre la app completa: sin errores de TypeScript.
2. Recrear 115 entradas PRE cronológicas desde fixture histórico congelado. Ocultar físicamente `OBJETIVOS_POST_115.json` antes de evaluar el diagnóstico. Comparar sus salidas con inventario geométrico original sellado `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`.
3. Para múltiples familias (Top10, últimas admitidas y físicas no admitidas) en **cada uno de los 115 cortes**, comprobar que número de caminos propios y admitidos iguala inventario; que raíces D−1/D−7 y puestos oficiales son exactamente los del motor existente.
4. Alterar `sheet.heads[target]` y `sheet.matches[target]` de cada corte probado: el diagnóstico devuelve **exactamente la misma salida**. Ningún resultado del objetivo afecta su explicación.
5. Comprobar después del sello PRE la coincidencia del Top3 y Top10 original de Lalo en **115 cortes: Top3 5/115; Top10 15/115**. Ningún Top alterado.

### Cobertura física histórica
Sobre familias de las cinco cabezas ganadoras por cada uno de los 115 turnos:
- **143** apariciones familia×corte físicamente representables;
- **64** además admitidas por el motor oficial con raíz propia;
- **79** presentes físicamente pero sin admisión;
- **429** sin formación física válida en el inventario de ese turno.

Son **apariciones familia×corte**, no cabezas individuales (dos cabezas podrían tener la misma familia reversible). Nada de esto modifica las posiciones originales o implica probabilidades de acierto.

## Nocturna 12/10 — caso inspeccionado con PRE sellado antes de ese sorteo

Se reconstruyó el motor original con las columnas **realmente selladas a las 18:56 de Argentina** para el corte Nocturno 12/10. Los resultados de la Nocturna no se usaron para crear las columnas ni seleccionar las familias; se usaron posteriormente como ejemplo de diagnóstico.

| Cabeza | Familia VT3 | Caminos físicos | Caminos admitidos | Raíz histórica independiente | Puesto VT3 | Razón |
|---|---|---:|---:|---|---:|---|
| `9851` | `158/851` | 1 | **0** | ninguna | **sin puesto** | físicamente sí, pero no pasó criterio de raíz/traslado/bifurcación |
| `1615` | `516/615` | 2 | **1** | **una D−7** | **54** | cero bloques bifurcados, frente al #3 `555/555` y #10 `255/552` con bifurcaciones |
| `7242` | `242/242` | 2 | **1** | **una D−1** | **25** | cero bloques bifurcados, frente a los límites Top3/Top10 con bifurcaciones |
| `8290` | `092/290` | 0 | 0 | ninguna | sin puesto | no existía recorrido físico |
| `3264` | `264/462` | 0 | 0 | ninguna | sin puesto | no existía recorrido físico |

Esto demuestra **dos causas distintas** de no aparición en el Top:
1. Falta de admisión pese a presencia física (851).
2. **Ranking entre familias correctamente admitidas** dominado por prioridad a bifurcaciones (615 y 242).

No se infiere que eliminar la prioridad mejoraría pronósticos; el análisis previo sin esa prioridad dio más aciertos retrospectivos, pero no fue robusto como señal predictiva.

## Estado del repositorio, seguridad y próximos pasos

`main` permanece intacto; **la nueva pantalla no está todavía publicada ni instalada en el teléfono**. No afirmar una actualización de APK que no se hizo. Las pruebas y UI sólo existen en la rama lab hasta aprobación y revisión para integrar.

La mejora es **observabilidad y trazabilidad**, no tasa de aciertos. Si deseamos decidir un cambio de puntuación, lo responsable es mostrar lado a lado para cada familia bifurcada/no bifurcada su rango actual y un rango alternativo, y validar las políticas congeladas con resultados futuros, manteniendo las mismas plazas y controles neutrales.

### Archivos
- `src/vt3Audit.ts`: motor **descriptivo PRE** de caminos, raíces y prioridad de puestos.
- `src/ui/Vt3Explainer.tsx`: panel responsivo con tema claro/oscuro.
- `App.tsx`: inserta el panel debajo del resumen de la predicción sin alterar motor.
- `scripts/lab-vt3-explicabilidad.mjs`: prueba independiente sobre 115 cortes y Nocturna.
- `.github/workflows/lab-vt3-explicabilidad-app.yml`.
- `PROTOCOLO_VT3_EXPLICABILIDAD_APP_13OCT2026.md`.
- `auditorias/vt3-explicabilidad-app-115-13oct2026/{PRE_115.json,NOCTURNA_PRE.json,SELLO.json,POST_115.json,RESUMEN.json}`.
- [Ejecución GitHub Actions #38404205216](https://github.com/y0t3/Modelo-Papa/actions/runs/38404205216).

**Nada de lo observado altera VT3 oficial, VT4 ni el carácter aleatorio de la quiniela.**
