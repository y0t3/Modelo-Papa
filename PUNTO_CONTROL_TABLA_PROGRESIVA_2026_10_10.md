# Modelo Papá — lectura viva progresiva de la tabla +11
Punto de control: 2026-10-10 · Rama `experimento-analisis-visual-5d`.

## Regla central (aclarada por el usuario)
**Nocturna anterior +11 → Previa.**
Cuando termina Previa, se incorpora **Previa +11** para estudiar Primera.
Al terminar Primera, se incorpora **Primera +11** para Matutina.
Luego **Matutina +11** para Vespertina y **Vespertina +11** para Nocturna.

Cada turno requiere interpretar **la tabla entera disponible hasta ese momento**,
no sólo la última columna ni un par fijo de turnos. La comparación con la jornada
anterior y el mismo día de semanas anteriores puede ayudar, pero D−7 NO es filtro
obligatorio y no debe imponer abstención.

Cada ruta física VT2/VT3/VT4 permanece **entera dentro de una sola columna
de origen**. Comparar formas entre columnas no autoriza mezclarlas en la ruta.
La cabeza del turno objetivo se conoce sólo después de congelar el análisis.

VT3 prioritario y limitado a un Top3 de referencia, VT2 memoria independiente
preservada y VT4 físico / extra experimental sin confundir modalidades.

## Desarrollo técnico entregado
- `src/progressiveBoard7d.ts`: observador causal para **los cinco turnos**;
  devuelve todas las columnas disponibles, rutas comprobadas de sorteos
  terminados de hoy, forma relativa, relaciones entre turnos y entre columnas,
  enlaces con la última jornada y con D−7 cuando existe. D−7 puede faltar.
  No da puntuaciones ni candidatos; es observador, no motor final.
- `scripts/test-progressive-board7d.cjs`: asegura 1→2→3→4→5 columnas,
  incrementos de +11, recuperación de VT3 hoy, comparaciones entre columnas,
  ausencia de fuga desde el resultado objetivo y futuro, y posibilidad de
  seguir sin D−7 o ayer.
- `scripts/run-progressive-observer7d.cjs`: examen descriptivo histórico
  previo a cada sorteo. Diferencia marcas VT3 **ya confirmadas** de
  resultados posteriores. NO utiliza los resultados posteriores para
  construir señales.
- `.github/workflows/progressive-observer7d.yml`: informes JSON y logs
  disponibles en GitHub Actions, tres ventanas históricas.

La batería general:
https://github.com/y0t3/Modelo-Papa/actions/runs/38027986774
Los tres informes:
https://github.com/y0t3/Modelo-Papa/actions/runs/38028091957

## Censo de señales VT3 de HOY disponibles antes del sorteo
Se informa cuántas jornadas/turnos tenían al menos una marca ganadora VT3
de sorteos anteriores **de ese mismo día**, sin necesidad de D−7:

| Tramo | Primera | Matutino | Vespertino | Nocturno |
|---|---:|---:|---:|---:|
| 2025 | 133/303 | 234/306 | 281/301 | 301/308 |
| Ene-may 2026 | 56/122 | 104/124 | 116/122 | 123/124 |
| Jun-sep 2026 | 37/102 | 77/103 | 102/102 | 102/104 |

Previa siempre comienza sin cabezas de HOY: se dispone de la Nocturna
anterior +11 y de memoria de sorteos anteriores, pero no deben
inventarse marcas actuales.

Relaciones de figuras VT3 **entre turnos comprobados de HOY** y
**entre columnas físicas distintas** aparecen más seguido cuando se
acumulan turnos, aunque compartir una forma no garantiza acierto.

La mera repetición NUMÉRICA en el siguiente sorteo de alguno de los
VT3 ya confirmados hoy fue escasa:
- 2025: Primera 1, Matutino 2, Vespertino 5, Nocturno 11.
- Ene-may 2026: Primera 0, Matutino 0, Vespertino 0, Nocturno 4.
- Jun-sep 2026: Primera 0, Matutino 1, Vespertino 2, Nocturno 3.

**Estos conteos describen cobertura entre MUCHAS cifras conocidas, no
aciertos de una selección Top3 previamente congelada.** La lectura
final debe interpretar el movimiento de la geometría, no simplemente
repetir el sufijo numérico de una cabeza anterior.

## Estado y siguiente bloque
Comprobado técnicamente: lectura progresiva completa y causal en todas
las transiciones, independencia operativa de D−7, relación de figuras
ganadoras anteriores de hoy con ayer/semana opcionales.

**Todavía pendiente:** cómo unificar esas observaciones de figuras,
desplazamientos, bifurcaciones y concentraciones para SELECCIONAR un
Top3 VT3 explicable del turno siguiente, sin enumeración indiscriminada
ni pesos elegidos tras ver resultados. Una única regla experimental
deberá fijarse ANTES de medirla, exigir trayectorias físicas por
columna y ser contrastada con referencia aleatoria de igual número de
candidatas, separando cobertura de ranking.

NO declarar que este observador reproduzca por sí solo la interpretación
visual del padre ni que se haya encontrado ya un motor predictivo.
No integrar código experimental en `main` o APK sin comprobarlo.
