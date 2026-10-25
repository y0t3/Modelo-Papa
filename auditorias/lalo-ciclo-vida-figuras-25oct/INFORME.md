# Modelo Lalo · vida de las figuras VT3 durante 6 jornadas
**Auditoría de laboratorio · 25 de octubre de 2026**

## Qué se investigó
Se compararon trayectorias VT3 realmente válidas de la hoja +11 con las
marcas de cabezas anteriores. El seguimiento se hizo sobre las seis
**jornadas completas anteriores**, con fuente y ubicación de la figura
como atributos separados de su cifra numérica.

Definiciones estrictas:
- Forma: firma de 3 celdas adyacentes, independiente de cifras, sin
  rotaciones inventadas y con recorrido siempre dentro de **una columna**.
- Activación: la forma explica una cabeza completa realmente publicada
  en una hoja anterior. Simple presencia en el tablero no es activación.
- Sitio compatible: **misma fuente**, misma forma y ancla de fila a no
  más de dos celdas de distancia; cada camino se verifica en su
  columna/día respectivo, **no se unen físicamente dos columnas**.
- Corredor: fuentes contiguas (máximo una columna de diferencia), misma
  forma y fila cercana. Sirve para observar desplazamientos entre
  hojas, NO para declarar válido un trayecto cruzado en +11.
- Persistente: activado en sitio compatible dos jornadas consecutivas.
- Reactivado: compatible D−1, NO D−2, SÍ alguno de D−3 a D−6.
- Nace: primer registro de activación en ese sitio dentro de seis
  jornadas, no aparición geométrica absoluta.
- Desaparece: activo en alguna jornada D−2..D−6, no D−1;
  **no significa que la forma dejó de existir físicamente**.

Método: 125 fechas sorteables observadas entre junio y el 23/10;
123 jornadas con datos suficientes, 615 cortes PRE, **3.295 cabezas**.
Días incompletos/feriados 20/06 (1 cabeza) y 09/07 (2 cabezas)
excluidos de la evaluación e ignorados como evidencia de desaparición.
Se compararon los Top3/Top5/Top10 PRE con los POST de cada turno;
se preservó por construcción el mismo conjunto Top10 VT3 y la
genealogía/rankings VT2 y VT4 del motor original.

## Hallazgo: forma sola frente a forma + sitio
En el primer experimento una forma con activación en cualquier columna
se consideró "activa" casi siempre. Entre 6.101 observaciones de
familias Top10, el estado genérico "persistente" alcanzó 4.341
registros y 48 de las 58 cabezas Top10. "Nacimiento" casi nunca
aparecía. Esa definición era demasiado amplia para estudiar vida.

El segundo experimento exigió coincidencia de forma, fuente y sitio.
Ahora hay 4.137 registros de candidatos con activación compatible D−1,
2.077 con reactivación después de una interrupción, y 712
con primera activación en esa posición dentro de seis jornadas.
Son **exposiciones de candidatos**, no aciertos ni familias únicas.
Estas señales son descriptivas, no independientes entre sí.

## Aciertos VT3 a igual Top10

| Orden dentro del Top10 VT3 | Top3 | Top5 | Top10 |
| --- | ---: | ---: | ---: |
| Modelo Lalo actual | 16 | 35 | 58 |
| Bifurcación + prioridad D−1 | **22** | 36 | 58 |
| Sitio compatible activado D−1 | 21 | 35 | 58 |
| Sitio compatible, dos jornadas consecutivas | 18 | 35 | 58 |
| Número de jornadas activas en sitio, últimas tres | 20 | 37 | 58 |
| Número de jornadas activas en sitio, últimas seis | **22** | **38** | 58 |
| Reaparece en sitio tras interrupción | 20 | 34 | 58 |
| Corredor D−1, fuente contigua | 20 | 37 | 58 |

La cantidad de jornadas activas en sitio (hasta seis) superó en **2**
el Top5 del criterio D−1, y lo igualó en Top3. Pero fue una variante
escogida entre muchas ensayadas en el mismo histórico.

Diferencia Top3 frente a Lalo actual (dos lados del mismo cupo):
- D−1: 9 incorporaciones, 3 pérdidas; binomial unilateral exploratorio
  p≈0,073.
- Sitio seis jornadas: 13 incorporaciones, 7 pérdidas; p≈0,132.
- Ambas señales son insuficientes para afirmar mejora predictiva.
- Ninguno de estos valores está corregido por haber comparado
  **múltiples criterios**.

## Estabilidad temporal (muy importante)

| Período | Original Top3 | D−1 Top3 | Sitio 6d Top3 | Reactiva Top3 |
| --- | ---: | ---: | ---: | ---: |
| Junio–julio (1.367 cabezas) | 7 | 10 | 11 | 3 |
| Agosto–septiembre (1.393) | 7 | 9 | 9 | 10 |
| Octubre 1–23 (535) | 2 | 3 | 2 | **7** |

La señal "reactivación" luce fuerte en octubre: recupera seis cabezas
Top3 y pierde una. En junio–julio hace lo contrario: recupera dos
y pierde seis. Por tanto no es una corrección estable.

La señal de permanencia durante seis jornadas es más equilibrada,
pero en octubre no mejora Top3 (dos ganados y dos perdidos) y reduce
Top5 de 11 a 9. No corresponde reemplazar el motor por ese resultado.

## Casos físicos representativos
- 03/10 Matutino Entre Ríos **5832**, VT3 832: sitio 6d #4→#3.
- 14/10 Nocturno Córdoba **2033**, VT3 033: sitio 6d #8→#3.
- 05/10 Matutino Santa Fe **3729**, VT3 729:
  reactivación de sitio #5→#1.
- 08/10 Matutino Entre Ríos **7071**, VT3 071:
  reactivación #7→#3.
- 13/10 Primera Ciudad **5485**, VT3 485:
  reactivación #5→#2.
Estos son ejemplos **POST** para diagnóstico, nunca criterios
fijados anticipadamente para un nuevo pronóstico.

## Lectura para el método de Lalo
1. El estado geométrico no debe confundirse con el valor numérico:
   una forma puede mantenerse mientras cambian sus cifras.
2. Tampoco debe confundirse con estar físicamente dibujable
   (la mayoría de formas de tres casillas lo están siempre).
3. La ubicación y la fuente permiten describir activaciones reales,
   periodos sin activar y movimientos sin romper la regla de columna.
4. Los cambios de estado observados **no** justifican todavía
   otro motor ni un aumento del Top3.
5. En los replay históricos D−1 sigue siendo el selector alternativo
   más simple y consistente. Todavía no supera convincentemente
   un control aleatorio condicional al mismo Top10.

**Decisión:** mantener Modelo Lalo +11 y MV1 exactamente como están,
sin incorporar estos órdenes a la APK. Usar los estados como
**diagnóstico visual**; si en el futuro se ensaya un nuevo selector,
congelar una sola regla antes de comprobar otro bloque temporal.

## Evidencias reproducibles
- Ciclo de vida de forma genérica:
  https://github.com/y0t3/Modelo-Papa/actions/runs/40158242612
- Ciclo acotado por fuente y sitio:
  https://github.com/y0t3/Modelo-Papa/actions/runs/40158485929
- Resultados en artefactos de GitHub Actions con candidatos,
  cortes PRE, días previos, resultados POST y estados.
