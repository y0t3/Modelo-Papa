# Caso visual de referencia — 7 de octubre de 2026, 0261

## Qué está efectivamente documentado

Fuente secundaria: `AUDITORIA_VISUAL.html` de la Biblioteca del proyecto,
preparada con fotogramas de las hojas manuscritas del 6 al 8 de octubre.

- Resultado de Provincia, Vespertino: cabeza **0261**, VT3 **261**.
- Tres formas VT3 **encontradas retrospectivamente por el programa**:
  - `Primera`, recorrido `2:0→2:1→1:1` (forma L).
  - `Primera`, recorrido `3:1→2:1→1:1` (recta).
  - `Matutino`, recorrido `2:1→3:0→2:0` (otro quiebre).
- Las tres rutas son matemáticamente válidas y distintas, dentro de
  columnas individuales. La imagen elaborada `EJEMPLO_261_TRES_GEOMETRIAS.png`
  muestra **rutas automáticas posteriores**, no los trazos originales.
- La auditoría describe celdas resaltadas originales en los fotogramas,
  pero **no digitalizó de forma inequívoca el orden y sentido de cada camino**.
- Todavía no está confirmado en el material visual directamente disponible
  que el número concreto 0261 sea legible bajo un trazo manuscrito determinado.

**Por tanto: 0 recorridos manuales ordenados acreditados para este caso.**
No elegir una de las tres rutas porque su relectura futura se parezca
a un resultado, ni fabricar flechas, celdas o una selección Top3.

## Verificación que falta en la fuente original

Consultar directamente `fotograma_original_hojas.jpg` o
`fotograma_hojas_completas.jpg`, contenidos/referenciados en el
archivo de auditoría o el video original. Para el 7/10:

1. Verificar las cabezas concretas efectivamente anotadas **debajo**
   de cada hoja y distinguirlas de las cabezas de la fuente publicada.
2. Identificar **qué celdas están realmente resaltadas** en cada
   columna +11 (fila 0–5, lado izquierdo 0 / derecho 1).
3. Sólo si el trazo tiene flechas, números ordinales u otra evidencia
   inequívoca, digitalizar el **orden** de la ruta.
4. Si aparecen celdas coloreadas sin dirección verificable,
   conservar exclusivamente una **huella sin sentido de lectura**.
5. Contrastar entre hojas marcadas de días contiguos —no recorrer
   las 184 formas de una cuadrícula vacía— para estudiar
   continuidad, desplazamientos y ramificaciones observables.

Los archivos ZIP de biblioteca con los fotogramas originales
fueron localizados por su título, pero **no admitieron
materialización para una inspección directa en esta sesión**.
No simular que se los vio ni atribuirles coordenadas inexistentes.

## Implementación realizada

- `evidencia-visual/octubre-07-0261-por-verificar.json`:
  ficha de evidencia con el fotograma **sin celdas digitalizadas**
  y los tres recorridos automáticos explícitamente etiquetados
  como **NO manuales**.
- `src/markedSheetEvidenceReader7d.ts`:
  observa sólo hojas marcadas con procedencia y referencias;
  separa `FOTOGRAMA_REFERENCIADO_SIN_CELDAS_DIGITALIZADAS`,
  `CELDAS_MANUALES_RESALTADAS_SIN_ORDEN`,
  `TRAZO_MANUAL_ORDENADO_VERIFICADO` y
  `RUTA_AUTOMATICA_NO_MANUAL`; no crea ni ordena ternas.
  Distingue la cabeza `DEBAJO_VISIBLE` del resultado publicado
  cuya anotación en la hoja no se pudo constatar.
- `scripts/test-marked-sheet-evidence7d.cjs`: prueba sobre
  el caso 0261 que ninguna ruta automática adquiere rango manual;
  verifica la ocultación del turno objetivo y que un trazo
  sintético ordenado y vinculado con una cabeza **simulada visible**
  pueda leerse sólo cuando la fuente se comprueba.

## Qué investigar después

**No corresponde programar otro selector todavía.** El paso
decisivo es recuperar al menos **una hoja marcada original con las
cabezas inferiores legibles** y estudiar a ojo cuáles rutas señaló
realmente papá. Sólo entonces comparar esa figura contra otra hoja
de la secuencia y buscar posibles continuaciones en la tabla +11
ya disponible antes del siguiente turno.

No modificar `main`, APK, filtros VT2 ni motor VT3 experimental.
