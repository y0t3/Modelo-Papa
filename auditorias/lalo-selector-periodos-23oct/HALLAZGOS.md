# Modelo Lalo · Prioridad interna VT3 sin submotores

**23/10/2026 · Estado: experimento, no modifica la APK ni `main`.**

## Pregunta
¿Puede Modelo Lalo reproducir la mejora de priorización D−1 vista en AUX,
sin crear un submotor ni alterar las reglas de adyacencia/VT4?

## Diseño
- 58 jornadas, 17–31 agosto, septiembre completo y 1–22 octubre.
- 1.553 cabezas, cinco cortes PRE por jornada.
- No se agregan familias ni rutas; no se mezclan columnas ni fuentes.
- Regla de laboratorio: en el Top10 VT3 **ya elegido** por Modelo Lalo,
  ordenar por (a) existencia de bifurcación, (b) raíces D−1,
  (c) cantidad de bifurcaciones, (d) D−7, (e) fuentes, (f) bloques.
- Las mismas 10 madres seleccionadas siguen dando VT2 y VT4; cada
  modalidad conserva su orden propio y exacto cuando corresponde.
- No modificar MV1 congelado ni ranking estable de la APK.

## Comparación de aciertos

| Modalidad / cupo | Modelo Lalo actual | Variante VT3 acotada, VT4 estable |
| --- | ---: | ---: |
| VT2 Top3 | 104 | 104 |
| VT2 Top5 | 165 | 165 |
| VT2 Top10 | 311 | 311 |
| VT3 Top3 | 7 | **11** |
| VT3 Top5 | 19 | 19 |
| VT3 Top10 | 32 | 32 |
| VT4 Top3 | 0 | 0 |
| VT4 Top5 | 4 | 4 |
| VT4 Top10 | 5 | 5 |

VT3 Top3 recupera 5 cabezas y pierde 1: saldo neto +4. Por bloques:
- Ago 17–31: 2 -> 3;
- Sep 1–14: 0 -> 0;
- Sep 15–30: 3 -> 5;
- Oct 1–21: 2 -> 3;
- Oct 22: 0 -> 0.

Los cinco ascensos Top3:
- 27/08 Nocturno 0152 (puesto 4 -> 3);
- 15/09 Matutino 1977 (7 -> 2);
- 29/09 Matutino 7289 (6 -> 1);
- 05/10 Matutino 3729 (5 -> 1);
- 19/10 Vespertino 3019 (5 -> 2).
Una salida del Top3: 10/10 Nocturno 0564 (2 -> 8).

**No es una mejora estadísticamente validada.** Con 58 jornadas, la
diferencia pareada Top3 es 5 incorporaciones contra 1 pérdida.
Una prueba exploratoria de inversión de signos por jornada
dio probabilidad unilateral aproximada 0,11 (sin corrección por
seleccionar entre múltiples estrategias). Remuestreo por jornada:
diferencia neta con intervalo aproximado 95 % [0, 9].
Estas métricas **no** prueban capacidad predictiva superior al azar.

## Verificación de efectos colaterales
La versión que reordenaba TODO VT3 redujo VT4 Top5 de 4 a 2 y VT4
Top10 de 5 a 4. Mantener igual Top10 de madres pero cambiar su
orden también reducía VT4 Top5 de 4 a 2.

En la variante acotada final, el Top10 VT3 tiene exactamente el
mismo conjunto de madres y el orden original de VT4 se conserva.
Prueba automática adicional:
comparar **en los 290 cortes** huellas de familias, ranking,
fuente y coordenadas físicas de VT2 y VT4. Cualquier diferencia
genera error y rechaza el laboratorio.

## Interpretación
Un solo motor con criterios de ordenación por modalidad basta.
No hacen falta nuevas hojas, rankings mixtos ni otro APK ahora.
Se podría incorporar como vista sombra de laboratorio con
cupo idéntico si la evidencia futura lo justifica, pero por ahora
no modificar el selector de producción.

## Evidencia
- [Ranking Lalo original y prioridades retrospectivas](https://github.com/y0t3/Modelo-Papa/actions/runs/39917301815)
- [Control externo de agosto](https://github.com/y0t3/Modelo-Papa/actions/runs/39917922143)
- [Prueba integral con efectos VT4](https://github.com/y0t3/Modelo-Papa/actions/runs/39918474851)
- [Variante acotada con mismas madres](https://github.com/y0t3/Modelo-Papa/actions/runs/39918735334)
- Reproducción de la variante final en el workflow
  `lab-lalo-vt3-vt4-estable.yml`.
