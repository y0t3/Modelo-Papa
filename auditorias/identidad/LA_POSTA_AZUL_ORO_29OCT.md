# La posta de Lalo · edición azul y oro integral (29 de octubre 2026)

## Objetivo y fidelidad al mockup
- Título **La posta de Lalo**, frase textual **TOMAA GIILL!!**.
- Identidad **70 % quiniela, 30 % Boca**: bolillas (11, 23, 72), trazo dorado, escudo CABJ estilizado, fondo azul profundo con textura y acentos oro.
- Cabecera ilustrada con `react-native-svg@15.12.1` (compatible con Expo SDK 54), por encima de la navegación y sin imágenes remotas.
- Marca de agua sutil exclusivamente en la **cabecera de las tarjetas** Hoja +11 / Predictiva / Cabezas / Predicción / Lalo / Info; ninguna textura interfiere con cifras ni recorridos.
- Navegación azul con pestaña activa azul medio y subrayado dorado.
- Fecha y calendario compactos, sin quitar acceso de día anterior, −7 días, siguiente ni actualización.
- Paleta global para claro y oscuro transformada en `src/ui/LaloTheme.tsx`, oscura por defecto en instalaciones nuevas; preferencia guardada en instalaciones existentes.
- Se mantienen EXACTAMENTE todos los valores de los mapas `colorForKind(mode)`, en dark/light: VT2 rosa, VT3 turquesa, VT4 oro con sus respectivos rellenos y colores de texto. Los colores de recorrido y las reglas de marcación **no cambian**.
- Experimental conserva el selector VT2/VT3, los tres ensayos por longitud y el detalle inmediatamente debajo de cada familia. Lalo VT2 conserva sólo minihojas de raíces efectivamente usadas por el motor (en un carrusel horizontal).

## Archivo fuente y zonas
`src/ui/BrandHero.tsx`: fondo, escudo, bolillas, frase literal y selector claro/oscuro. Dibujado en SVG en la app y sin bloquear la interacción.
`src/ui/BosteroWatermark.tsx`: ornamento de opacidad reducida, no interfiere con hoja +11.
`src/ui/LaloTheme.tsx`: tokens base azul/oro, sin modificar `colorForKind`.
`App.tsx`: cabecera arriba de pestañas, panel de fecha compacto.
`src/PanoramaSheet.tsx`: Hoja +11 y Predictiva.
`src/ui/HeadsTable.tsx`: Cabezas.
`src/ui/PredictionSummary.tsx`: Predicción.
`src/ui/PapaPronostico.tsx`: Lalo.
`src/ui/InfoDashboard.tsx`: Info.
`src/ui/TurnStrip.tsx`, `src/ui/AuxModeSwitch.tsx`: chips azul/oro, sin reordenar familias.
`src/DateField.tsx`: calendario sin violetas residuales.

## Verificación
`scripts/test-la-posta-identidad.ts`: verifica título, lema, ubicación de cabecera, presencia de marcas de agua y preservación de los seis mapas VT (tres longitudes × dos modos de color).
CI también comprueba TypeScript UI, motor original, Formas Primero VT2/VT3, movimientos geométricos y SVG del ícono de launcher.

La APK de laboratorio usa el paquete de instalación independiente `com.y0t3.modelopapa.formasprimero` y **no sustituye** `main` ni la app estable. En esta rama sólo se diseñaron cambios visuales; no se promocionan predicciones retrospectivas como aciertos sellados.
