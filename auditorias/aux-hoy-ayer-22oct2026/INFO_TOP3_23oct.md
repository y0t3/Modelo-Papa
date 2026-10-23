# Corrección INFO · última minihoja PRE

La última minihoja de Santiago–Neuquén en INFO representa el corte
actual, no una jornada ganadora. Antes estaba vacía de marcas por diseño.
Ahora consume el mismo ranking AUX, raíces D−1/D−7 y proyector
geométrico que la pestaña PREDICTIVA.

- Top3 independientes de VT2, VT3, VT4 del turno en foco.
- Únicamente sus recorridos físicamente proyectados actuales.
- Modo HOY/AYER sincronizado con el resto de la app.
- La semana histórica sigue mostrando solo coincidencias POST exactas.
- HOY antes de Previa muestra 0 cifras y avisa que se puede elegir
  AYER, sin inventar rutas futuras.
- Rutas y familias nunca se recalculan con cabezas POST del turno actual.
- Se reutiliza el mismo agrupador y la misma regla VT4 real.

Prueba: `scripts/test-info-aux-predictiva-top3.ts`.
