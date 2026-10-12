# Modelo Lalo

Aplicación visual +11 para estudiar la quiniela y los recorridos VT2, VT3 y VT4.

## Un único motor experimental
La app conecta sus cinco pantallas (**Hoja, Predictiva, Predicción, Cabezas, Info**) con `src/motorLalo.ts`.
- **VT2:** recorridos físicos de dos celdas trasladados desde huellas confirmadas D−7 y última jornada, más terminaciones físicas de madres VT3.
- **VT3:** recorridos de tres celdas trasladados desde huellas confirmadas y bifurcaciones que conservan un tramo de dos celdas.
- **VT4:** hijas reversibles de madres VT3 seleccionadas, con trayectoria propia de cuatro celdas. No se prestan recorridos entre hermanas.

Sólo se dibujan recorridos físicamente válidos dentro de cada fuente 6×2 (+11): contacto horizontal, vertical o diagonal, sin casillas vacías, saltos, reutilización ni cruces entre fuentes. Se conservan todos los caminos válidos y sus sentidos, con deduplicación de huellas reversibles en el inventario. Montevideo alimenta la hoja física; las referencias históricas para seleccionar se toman de cinco jurisdicciones argentinas.

**PRE no consulta los resultados del turno objetivo.** Los resultados POST solamente sirven para marcar la hoja conocida y cotejar propuestas anteriores. Este modelo no tiene superioridad predictiva demostrada, y los rankings experimentales NO son probabilidades de éxito.

### Fuentes temporales
- D−7: el mismo día calendario de la semana previa, si hubo resultados disponibles.
- D−1 operativa: la última jornada con sorteos efectivos, que puede no ser el día calendario anterior.
- Las columnas del propio día se incorporan progresivamente de Previa a Nocturna: cada objetivo sólo ve lo que existía previamente.

## Versiones y archivo histórico
- Estado anterior congelado: rama `checkpoint-ui-motor-12oct2026`.
- Investigación retrospectiva y antiguos observadores: rama `auditoria-sorteo-10oct-2026`.
- Nuevo desarrollo: `modelo-lalo-motor-unificado-vt234`.
- Los módulos de motor experimental 6D/7D/V1 y sus auxiliares se **retiraron de esta rama**, no están conectados a App.tsx ni se superponen. Permanecen recuperables en el checkpoint.

## Iniciar
```sh
npm install
npx expo start
```
Comprobar también la acción de TypeScript de esta rama. Antes de publicar una APK, verificar táctil, legibilidad, historia temporal y desempeño en Android real.

**Nota de Android:** el identificador interno `com.y0t3.modelopapa` sigue siendo el mismo para no romper la ruta de actualización de una instalación existente. El nombre visible y el slug del proyecto ya son **Modelo Lalo**.
