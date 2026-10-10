# Modelo Papá — examen ocular SIN ver Primera del 30/09/2026
Punto de control: 2026-10-10 · rama experimental `experimento-analisis-visual-5d`.

## Qué se podía saber justo ANTES de Primera del 30/09
- La hoja del **29/09** ya estaba completa y marcada desde resultados conocidos:
  **37 caminos** físicos, VT2=23, VT3=12, VT4=2, con todas las cabezas
  completas anotadas debajo.
- El **30/09, antes de Primera**, la tabla +11 sólo tiene columnas
  **Nocturna anterior** y **Previa**, con las marcas ya comprobadas en
  Previa de ese mismo día.
- De todos los caminos del 29, había **17 rutas legibles** en esas
  columnas: VT2=11; VT3=6; VT4=0.
- Esas rutas provienen de **seis cabezas históricas completas**, y
  ninguna fue inventada desde una hoja en blanco.
- El archivo previo no contiene las cabezas de Primera del 30; el
  resultado se conserva en documento posterior separado.

## Las seis agrupaciones visibles — SIN clasificación ni prioridad
| Cabeza del 29 | Sorteo del 29 | Rutas que caben antes de Primera | Relecturas concretas sobre el 30 |
|---|---|---:|---|
| 0154 | Primera | 1 VT2 | 10 |
| 4983 | Primera | 1 VT3 + 2 VT2 | 778, 58, 78 |
| 7289 | Matutino | 3 VT3 + 3 VT2 | 877, 807, 803, 77, 07, 03 |
| 8731 | Vespertino | 2 VT2 | 37, 37 |
| 8794 | Nocturno | 2 VT2 | 60, 37 |
| 7342 | Nocturno | 2 VT3 + 1 VT2 | 304, 304, 04 |

**Qué se ve y qué NO podemos deducir de esas marcas:**
1. **7289** deja una zona con varios caminos y dos huellas que
   tocan una marca comprobada de Previa del día 30: el VT3 que
   relee `803` (`2:0→3:0→4:1`) y el VT2 que relee `03`
   (`3:0→4:1`). Ambos comparten la celda `4:1` con una marca
   VT2 producida por la cabeza **1553**, ya conocida de Previa del 30.
   Es **una sola familia histórica 7289**, no dos confirmaciones
   independientes ni una predicción de 803/03.
2. **0154** tiene un solo recorrido VT2 legible, `1:0→0:0`
   dentro de `prevNocturno`, que pasó de `54` a `10` al
   cambiar de jornada. **No toca** marcas conocidas de Previa.
   Su relativa soledad no demuestra que valga más que los demás.
3. **7342** produce `304` por dos caminos VT3 diferentes.
   No son dos sorteos independientes: se trata de un mismo valor
   releído desde rutas de una misma cabeza anterior.
4. **8731** relee `37` por dos caminos y **8794** también
   relee `37` en otra ruta; compartir las cifras tampoco
   equivale a un desplazamiento visual común, si las celdas
   pertenecen a zonas diferentes.
5. **No existe, con esta sola comparación**, un motivo visual
   inequívoco y establecido previamente para preferir `10`
   frente a `803`, `03`, `304` o `37`.
   Por ello, **OBSERVAR / NO JUGAR** sería una salida
   intelectualmente válida en ese corte.

## Apertura posterior al resultado (prohibida durante la interpretación)
La cabeza **0910** de Primera del 30/09 confirmó el recorrido VT2
`10` en `prevNocturno` (`1:0→0:0`), exactamente la huella
que en la hoja del 29 había explicado la cabeza **0154** por VT2 `54`.

La continuidad es **real y comprobable físicamente**; lo que
todavía no se encontró es la razón visual que hubiese aislado
ese recorrido entre los 17 ANTES del sorteo. No contarla
como acierto pronosticado.

## Nuevo banco de trabajo visual
Se construyó `2-ANTES-Primera-TABLERO-COMPLETO.html`, que muestra:
- **A la izquierda:** todas las marcas VT2/VT3/VT4 de la hoja
  cerrada del 29, sobre el tablero +11 completo de ese día.
- **A la derecha:** los mismos trazos que caben en la tabla +11
  del 30 antes de Primera, con la opción de superponer las marcas
  de Previa ya comprobadas el 30.
- Cualquier persona puede observar todo el tablero, aislar una
  ruta física de origen conocido y escribir por qué le llama
  la atención frente a las demás; puede escoger **cero a tres
  rutas** por comodidad experimental, nunca para rellenar cupo.
- Un botón descarga esa anotación como JSON local. El archivo
  registra que es **replay retrospectivo, NO sello prospectivo**.
- `99-DESPUES-Primera.md` conserva el resultado por separado.
- `index.html` abre directamente el panel y las otras
  cuatro etapas, para no tener que navegar manualmente los
  nombres de archivo.

**Archivo de trabajo (GitHub Actions):**
https://github.com/y0t3/Modelo-Papa/actions/runs/38040882682

**Artefacto con visor, cinco galerías, datos y resultado aparte:**
https://github.com/y0t3/Modelo-Papa/actions/runs/38040882682/artifacts/11666260405

## Qué cambiaría como próximo paso
No construir todavía un ranking de continuidad ni puntuar
superposición de celdas: el caso muestra cómo ese criterio
favorecería `803/03` pero no `10`, pese a que éste
fue el confirmado después.

Comparar varias HOJAS YA MARCADAS antes de la fecha objetivo,
incluyendo otros días contiguos y los mismos turnos de semana
anterior cuando existan, para examinar si aparecen movimientos
visuales continuos no explicados por un simple contacto o
un único resultado retrospectivo. El paso debe seguir siendo
descriptivo. Cualquier futura hipótesis que produzca candidatos
debe registrarse antes de sorteos reales posteriores, con
posibilidad de no proponer ninguno.

No se tocó `main`, APK ni el selector oficial. Se
preservan VT2 y VT4, y nunca se reconstruyen trazos combinando
celdas de distintas columnas.
