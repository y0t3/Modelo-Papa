# Modelo Lalo MV1 · Mutación geométrica VT3 de una casilla

**25 de octubre de 2026 · Solo laboratorio.** Motor original, pantalla
PREDICTIVA, APK y `main` quedan **intactos**.

## Pregunta

Una cabeza publicada puede tener terminación VT3 físicamente posible en
la hoja PRE, pero el motor Lalo no incorporó su familia. ¿Se explican
esas ausencias porque una forma anterior ganadora **conserva dos
casillas contiguas** y cambia solamente la tercera, sin saltos?

## Protocolo geométrico y temporal

- Ventana de **seis jornadas completas anteriores** (>=20 cabezas),
  sin usar cabezas futuras del objetivo. Los feriados/días incompletos
  no producen estados negativos ficticios.
- Una raíz VT3 antigua debe haber explicado físicamente una cabeza
  completa publicada en su fecha/turno. Montevideo cuenta como
  resultado evaluado, pero **no se usa como raíz +11**.
- La figura nueva requiere **exactamente dos posiciones compartidas
  formando un borde real**, y una tercera casilla distinta. Ambas
  rutas son recorridos válidos separados dentro de **la misma columna**;
  comparar dos días no habilita cruzar columnas.
- Conservamos todas las orientaciones que forman distintas familias
  con las mismas tres celdas, sin duplicar el reverso idéntico como
  otro recorrido independiente.
- Universo: solo familias VT3 físicamente formables en PRE y que NO
  fueron reconocidas en el conjunto del motor original.
- Tres criterios de prueba fijados antes del contraste: apoyo reciente
  D−1 / cantidad de fechas activadas en los seis días / convergencia
  respaldada por >=2 columnas y >=2 jornadas.
- Cada variante reemplaza como máximo el puesto **#10** (o completa
  hasta diez si la lista original tiene menos) SIN alterar VT2, VT4
  ni la genealogía de las madres VT3 oficiales.
- Resultado familiar reversible y sufijo efectivamente dibujable en
  el sentido sorteado se cuentan **por separado**.

## Resultado: gran cobertura física, escasa discriminación

**124 jornadas, 620 cortes PRE, 3.321 cabezas** publicadas
entre el 1/6 y el sábado 24/10.

| Categoría | Cabezas |
| --- | ---: |
| VT3 exacto físicamente formable en hoja PRE | 852 |
| Formable, pero **fuera del conjunto** del motor | 542 |
| Formable no reconocida, con al menos una mutación de borde histórico | **500** |
| Formable no reconocida sin mutación de borde en seis jornadas | **42** |

**500 de las 542 excluidas (92,3 %) tienen esa mutación geométrica.**
La señal tiene gran cobertura, pero resulta muy frecuente para elegir
un candidato en particular: unas **77,7 familias sombra por corte**,
antes de las restricciones de cada variante.

### Top10 con un reemplazo como máximo

| Variante | Baseline Top10 | Top10 variante | Ganó | Perdió |
| --- | ---: | ---: | ---: | ---: |
| Apoyo reciente | 58 | 62 | 5 | 1 |
| Días activados en ventana de seis | 58 | **63** | 6 | 1 |
| Convergencia entre fuentes | 58 | 61 | 4 | 1 |

Las seis nuevas coincidencias de la variante seis jornadas poseían
el **sufijo exacto físicamente formable**, no solo el reverso de
su familia.

### Control aleatorio (15.000 réplicas, pool y cupo idénticos)

| Variante | Recuperaciones de la regla | Promedio aleatorio | Réplicas que igualaron/superaron |
| --- | ---: | ---: | ---: |
| Recencia | 5 | 6,36 | 75,8 % |
| Memoria seis días | 6 | 6,41 | 61,9 % |
| Convergencia | 4 | 4,52 | 70,1 % |

**Ninguno superó el control aleatorio.** El saldo Top10 positivo no
es evidencia de capacidad predictiva superior. El contraste es
condicional al universo de familias físicamente válidas, no a todas
las terminaciones posibles; tampoco mide probabilidad de apostar.

En sábado **24/10**, bloque excluido de la elección de criterios
anteriores, hubo 26 cabezas, cinco VT3 exactas físicamente formables y
cinco no reconocidas. Las cinco tenían mutación de borde histórica,
pero ninguna variante consiguió un acierto Top10.

## Los 42 casos que NO tienen mutación de borde

| Diagnóstico de la relación con las raíces ganadoras previas | Casos |
| --- | ---: |
| Comparten solo una posición en la misma fuente | **22** |
| La misma forma aparece en **otra fuente** | 9 |
| Misma forma trasladada a otro sitio de la misma fuente | 6 |
| Reutilizan las mismas tres casillas, pero no el borde nuevo probado | 4 |
| No hay raíces ganadoras antiguas en esa fuente | 1 |
| **Total** | **42** |

**31 de estos 42 aparecieron en Nocturna.** Esto probablemente refleja
que Nocturna dispone de cinco fuentes, y requiere un análisis
denominador por cantidad de familias PRE para comparar con turnos
anteriores. Los cuatro casos con las mismas tres posiciones incluyen
posibles órdenes de recorrido diferentes y/o raíces fuera del D−1/D−7
original; **no deben contarse automáticamente como un fallo del
traslado rígido**.

Ejemplos para diagnóstico posterior:
- Santa Fe Previa 17/08, cabeza `1395`: tres posiciones antiguas
  reaparecen, no implica automáticamente el mismo orden de recorrido.
- Santa Fe Nocturno 16/10, `5807`: historia anterior de tres
  posiciones que merece inspección de fuentes y antigüedad.
- Ciudad Nocturno 05/06, `9496`: misma forma comprobada en otra fuente.
- Córdoba Matutino 24/10, `1573`: VT3 físicamente válido, sin
  selección satisfactoria en Top10.

## Decisión y siguiente paso

**No incorporar ningún selector sombra a la APK.** La prueba más
literal de "una casilla que cambia" explicó físicamente el 92,3 %
de las familias excluidas pero **no aportó discriminación superior al
azar condicional**. Sumar esos candidatos indiscriminadamente
anularía la función del Top3/Top10.

La siguiente pregunta útil no es ampliar más el histórico ni
inventar transformaciones arbitrarias, sino identificar para los
42 casos complejos el tipo de discontinuidad: cambio de fuente,
traslado vertical, orden diferente de las mismas tres posiciones
o ausencia de activación previa. Ese diagnóstico debe mantenerse
**descriptivo** hasta hallar una regla breve que pueda congelarse
antes de un período de validación verdaderamente independiente.

## Resultados y verificaciones

- [Acción aprobada de mutación y clasificación](https://github.com/y0t3/Modelo-Papa/actions/runs/40162874426)
- Código: `scripts/lab-mutacion-una-celda-vt3.ts`
- Artefacto Actions: `labo-lalo-vt3-mutacion-una-celda`
- Archivos: `resumen.json`, `control-aleatorio.json`,
  `familias-testigos.json`, `cabezas.json`,
  `familias-sin-mutacion.json`, `cortes.json`.
