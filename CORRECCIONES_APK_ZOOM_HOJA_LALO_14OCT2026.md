# Correcciones posteriores a la primera APK — 14/10/2026

## Hallazgos informados por el usuario
1. Pellizco permitía zoom pero el contenido quedaba anclado a la izquierda y **no se podía recorrer horizontalmente**. Botón 100 % e indicador funcionaban.
2. El nuevo filtro por turno y la selección de una cabeza en **HOJA** eliminaban las demás marcas en vez de dejarlas tenues como en la versión anterior.
3. Renombrar la pestaña **PAPÁ** a **LALO** y su título a **PRONÓSTICO DE LALO**.

## Implementación
- Zoom: `ZoomableTab` abandona dos `ScrollView` anidados en ejes opuestos. Mantiene scroll vertical nativo, y añade `Gesture.Pan` horizontal de un dedo cuando zoom >100 %, limitado hasta el borde opuesto. `Gesture.Pinch` conserva como pivote la coordenada X del pellizco; los toques simples y el desplazamiento vertical no se apropian del gesto lateral (`activeOffsetX`/`failOffsetY`). Se preservan botón reset, % y escalas independientes por pestaña.
- Hoja: separa inventario completo (`data.routes`) de trazos seleccionados (`boardRoutes`). `MarkedBoard` mantiene siempre el contexto completo con opacidad reducida para marcas ajenas, incluso en las celdas donde se superponen varias modalidades.
- Renombre: etiquetas, encabezados, explicación, balance semanal y mensajes de almacenamiento muestran **Lalo**. Las **claves persistidas** `modelo-lalo:papa:...`, esquema `PAPA_PRE_V1`, componentes/tipos internos y pestaña con ID interno `papa` no cambian, de modo que se conserva compatibilidad con pronósticos, resultados y borradores ya guardados.
- APK v0.2.1 (android versionCode 4). El motor de predicción no fue modificado.

## Verificaciones
`npx tsc --noEmit`, pruebas de todos los módulos existentes, nuevo `scripts/test-correcciones-ui-14oct.ts` (bordes horizontales, pivote, celdas marcadas y tenues), CI y APK Android release por GitHub Actions. El comportamiento táctil real de pan/pinch debe verificarse en el dispositivo porque CI no emula la pantalla Android.

**Advertencia de firma:** si una APK compilada en un runner de GitHub diferente tiene firma no coincidente con la instalada, Android puede bloquear la actualización aunque suba `versionCode`. No desinstalar la app con registros locales sin un respaldo previo.
