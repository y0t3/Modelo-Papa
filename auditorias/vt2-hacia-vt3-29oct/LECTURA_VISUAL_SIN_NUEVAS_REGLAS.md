# Lectura visual de VT2 → VT3 — sin fórmulas nuevas

**29 de octubre de 2026 | laboratorio aislado**  
Origen: JSON íntegro de 140 cortes PRE reconstruidos (28 jornadas, junio–octubre 2026), ejecución GitHub Actions [40949550197](https://github.com/y0t3/Modelo-Papa/actions/runs/40949550197). No existen PRE de dispositivo sellados para esos cortes. No se modifica algoritmo, selección, APK ni interfaz.

## Lo que aportan las figuras, y lo que NO aportan

**El cuadradito no alcanza.** Entre las primeras diez candidatas del lector experimental VT2→VT3 en modo «RONDAS», una VT3 podía recibir una cuarta cifra en la misma zona 2×2:
- Lalo +11: 1.317 de 1.400 familias×corte (94,1 %).
- AUX AYER: 1.270 de 1.400 (90,7 %).
- AUX HOY: 1.046 de 1.120 (93,4 %; en Previa no tiene hoja HOY).

Importante: «cuadrado posible» se calcula sobre cualquiera de los recorridos reales de esa **familia**, no necesariamente el ejemplo visual mostrado; no implica que una cuaterna ganadora fuera priorizada.

Para Lalo, las coincidencias reversibles del Top10 fueron 16 entre 1.317 exposiciones con cuadrado frente a 1 entre 83 sin cuadrado. Las frecuencias (~1,21 % y ~1,20 %) son prácticamente idénticas. Para AUX AYER, 13 entre 1.270 con cuadrado y 4 entre 130 sin él. Este contraste tiene muy pocos aciertos, está condicionado a candidatas ya priorizadas y no apoya un filtro de cuadrado. Las formas visuales merecen explicarse, no convertirse en votos.

**Dos madres VT2 coincidentes tampoco bastan.** En Lalo RONDAS, 1.139/1.400 VT3 tenían dos familias VT2 prioritarias como segmentos físicos y 15 de ellas coincidieron con cabezas; en AUX AYER 1.175/1.400 y 12 coincidencias. Una configuración tan frecuente no discrimina de manera confiable. No contar dos recorridos de la misma zona como confirmaciones históricas independientes.

## Casos emparejados dentro del mismo corte

### Viernes 05/06 — Previa, Provincia: 5623 (últimas 3 = 623)

La candidata 326/623 estaba en **#8** de la variante Lalo RONDAS y fue un **recorrido exacto**. En la Nocturna anterior +11, la minihoja se puede representar:

```text
     I   D
fila 1 ·   6
fila 2 ·   2
fila 3 ·   3
```

Recorrido vertical 6→2→3. **No tenía extensión 2×2** en sus rutas registradas.

En ese mismo PRE, el candidato **#9, 358/853**, también tenía una ruta recta vertical de tres casillas, pero en la mitad izquierda, con valor **853**. No coincidió con ninguna cabeza de ese turno. **Misma silueta, distinto resultado**; la figura sola no decide.

### Lunes 26/10 — Nocturna Montevideo: 1876

VT2 **67/76** era #7 de Lalo. La VT3 exacta **876** podía formarse extendiendo un recorrido de esa familia, pero quedó **fuera del Top10** de tres cifras. Las diez primeras VT3 del laboratorio admitían su propio cuadrado. Por ejemplo, el #7 automático fue **067/760**, no la 876. El cuadrado 1-8-6-7 no fue suficiente para que el ordenador eligiera la extensión que leyó Lalo.

### Miércoles 28/10 — Nocturna Córdoba: 4510

VT2 **01/10** estaba #7. La VT3 **510** exacta se encontraba en el universo de extensiones legales, pero **fuera del Top10**. El algoritmo colocó en **#7 la VT3 018/810**, también nacida de 01/10 y otra familia VT2; perdió. La figura completa **4-5 / 1-0** estaba físicamente visible en la Nocturna anterior. El lector humano tomó otro camino legal.

### Martes 27/10 — Primera Entre Ríos: 1308

AUX AYER RONDAS incluyó la VT3 exacta **803** en #2, nacida de 03/30 y 08/80. Su recorrido tiene un giro visible en un bloque 2×2; pero **7 de las 10 candidatas** del mismo corte tenían cuadrado posible y solo esa familia coincidió con la cabeza 1308. Una forma compartida no basta para discriminar.

## Conclusión observacional

**Lo que todavía no representamos bien es el abanico de lecturas que nace de una misma VT2.** La misma pareja priorizada puede prolongarse a varias VT3 válidas, a menudo con dos segmentos o fuentes diferentes, y el ranking numérico pierde la relación visual local.

Una propuesta de interfaz, a estudiar y **no implementada aquí**: al tocar una familia VT2, abrir una minihoja que **muestre simultáneamente todas sus extensiones físicas a VT3** en esa jornada, sin ordenarlas ni apostar por una; permitir elegir qué recorrido iluminar. Una segunda capa opcional mostraría las celdas adicionales para VT4, nunca un Top impuesto. Para AUX, conservar continuidad física permitida entre turnos; para +11, siempre una sola columna por recorrido.

Antes de hacer cambios de interfaz, comprobar con Lalo si esa lectura de «abanico visual» coincide con su forma de examinar las casillas. No deducir prioridad de #7, del cuadradito, de cantidad de caminos ni de doble madre a partir de estos resultados.

## Fuente reproducible

- Rama: `lab/vt2-a-vt3-recorridos-29oct2026`.
- Programa: `src/labVt2Vt3Extension.ts` y `scripts/lab-vt2-hacia-vt3-historico.ts`.
- Artefacto `lab-vt2-a-vt3-historico` de [Actions 40949550197](https://github.com/y0t3/Modelo-Papa/actions/runs/40949550197), con 140 cortes, diez ejemplos de traza por variante y cabezas POST.
- Conteos y casos calculados directamente de ese JSON; en las tasas, una exposición es una familia×corte, no una jugada independiente.

**Advertencia:** la retrospección no acredita predicción prospectiva, causalidad, éxito económico ni necesidad de añadir apuestas.
