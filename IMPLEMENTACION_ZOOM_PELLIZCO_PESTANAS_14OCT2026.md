# Zoom por pellizco en las seis pestañas de Modelo Lalo

## Qué se agregó
- Un solo componente de interfaz, `src/ui/ZoomableTab.tsx`, envuelve **el contenido** de HOJA, PREDICTIVA, PREDICCIÓN, PAPÁ, CABEZAS e INFO. No se toca el motor Lalo ni las hojas ni los candidatos.
- Pellizcar con dos dedos amplía/reduce de **100 % a 250 %** (escalas continuas); el límite de 100 % evita que los números terminen demasiado chicos.
- Al ampliar, se mantienen la **lectura vertical** y la posibilidad de desplazarse horizontalmente en la superficie ampliada.
- El zoom de cada pestaña se conserva al pasar a otra y se restaura al reabrir la app, mediante AsyncStorage; si los datos previos están inválidos, se usa 100 %.
- La barra de navegación siempre queda fija y debajo aparece una banda discreta que indica el porcentaje y ofrece **Restablecer**. No se amplían ni vuelven inalcanzables las pestañas.
- La transformación se muestra con `Animated.Value` durante el gesto para no repintar cálculos del motor en cada evento; la zona de desplazamiento (ancho y alto) se actualiza cuando termina el gesto.
- Se usa `react-native-gesture-handler@~2.28.0`, compatible con Expo SDK 54, y `GestureHandlerRootView` en la raíz de la app.

## Controles y cuidados
- Los toques de **un dedo** siguen funcionando para seleccionar cabezas, rutas, turnos, botones, y dibujar trayectorias en PAPÁ.
- **Dos dedos** activan el zoom. Durante un pellizco se suspenden los desplazamientos del contenedor principal, para minimizar conflictos.
- No se modificó ningún modal de `Ver detalle`; los modales nativos se mantienen en tamaño de pantalla y los mini recorridos allí conservan sus dimensiones. La acción de zoom se aplica al contenido de las seis pestañas.
- La ubicación del zoom se ancla inicialmente a la esquina superior izquierda del contenido; tras ampliarlo se puede desplazar horizontal y verticalmente.
- Se conserva el salto CABEZAS → HOJA, que ajusta la posición vertical usando el zoom elegido.
- Como el gesto funciona en código nativo del dispositivo, TypeScript/Actions verifican dependencias y lógica; **antes de considerar terminada la UX hay que probar manualmente en Android** el desplazamiento, el zoom y los botones, especialmente cuando la pestaña Papá tiene el editor activo.
- **No se genera APK** como parte de esta tarea; queda a la espera de la compilación conjunta que solicite el usuario.

## Auditoría de implementación
- `src/tabZoom.ts`: valores de zoom, seguridad de restauración y límites.
- `src/ui/ZoomableTab.tsx`: soporte táctil de pinch, scroll en ambos ejes y transform.
- `App.tsx`: barra con indicador, memoria por pestaña y raíz Gestures.
- `package.json`: única dependencia nueva, Gesture Handler.
- `scripts/test-zoom-pestanas.ts`: normalización, límites, seis escalas independientes.
- Workflow `validar-lalo-unificado.yml`: TypeScript y test del estado de zoom, más regresiones previas.
