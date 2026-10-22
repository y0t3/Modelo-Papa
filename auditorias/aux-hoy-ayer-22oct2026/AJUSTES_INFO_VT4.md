# Correcciones visibles solicitadas 22/10/2026

- PREDICCIÓN: elimina tarjetas violeta y el texto individual "en ambos
  motores". La sección TOP GENERAL conserva la comparación cruzada.
  El resaltado POST real por coincidencia con cabeza publicada sigue.
- VT4: el nombre de la familia VT3 madre puede incluir una orientación
  que no tenga recorrido. La interfaz de AUX PREDICTIVA/PREDICCIÓN/detalle
  muestra SOLO las hijas VT4 físicamente formadas, sin modificar el
  agrupador interno ni cambiar ranking. Testigo de captura:
  9241 es un camino contiguo en Santiago 8067 | 6142 | 9634; 9142
  no es una cifra físicamente legible en esa grilla.
- INFO: minihojas de Santiago–Neuquén de las jornadas de la semana previa
  y corte PRE de la fecha en curso. Selector sincronizado HOY/AYER.
  Los días históricos colorean rutas exactas de cabezas realmente salidas;
  el corte actual no falsifica ganadores. El historial se carga
  separadamente para evitar que INFO bloquee HOJA/Predicción.
- Tests de regresión exacta: scripts/test-aux-correcciones-info-vt4.ts

El resto de MV1 y de los motores AUX permanece separado y sin cambios.
