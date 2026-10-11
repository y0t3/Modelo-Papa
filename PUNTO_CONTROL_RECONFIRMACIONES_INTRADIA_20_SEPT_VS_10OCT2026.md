# Punto de control: reconfirmaciones físicas entre turnos — septiembre vs. 10/10/2026

**Fecha de ejecución:** sábado 10 de octubre de 2026. Estudio completamente **exploratorio y retrospectivo**. Se toman Previa, Primera, Matutino y Vespertino, y **solo cinco jurisdicciones argentinas** tanto en septiembre como en 10/10 para igualar la cobertura: Ciudad, Provincia, Córdoba, Santa Fé y Entre Ríos. Nocturno y Montevideo no intervienen. **Cero decisiones humanas registradas antes de los sorteos.**

## Datos y reproducibilidad

- **Historial digital**: 20 hojas 08–30/09/2026 del atlas ya auditado https://github.com/y0t3/Modelo-Papa/actions/runs/38059506764 (artefacto https://github.com/y0t3/Modelo-Papa/actions/runs/38059506764/artifacts/11672771930). Se recuperan de `TODOS_LOS_CAMINOS_PARES_Y_NEGATIVOS.json` las figuras confirmadas por día, fuente, modalidad, celdas, turno y cabeza completa; 20 fechas sin duplicados.
- **10/10**: `balance-hasta-vespertina-10oct-2026.zip` publicado previamente en la conversación; procede del expediente con fuente Previa sellada a las 09:04 y Primera a las 10:53, documentos GitHub https://github.com/y0t3/Modelo-Papa/actions/runs/38050639551 y https://github.com/y0t3/Modelo-Papa/actions/runs/38057490657. Matutina/Vespertina reconstruidas **POST** (sin foto previa propia).
- Se cuentan **figuras físicas distintas** por `VT|sourceId|celdas canónicas`, deduplicando el trazo invertido, más de una cabeza y más de una aparición. Una figura se considera *reconfirmada entre turnos* solamente cuando la justifican cabezas publicadas de **al menos dos turnos diferentes** del mismo día.
- Los scripts Python 3 (`analizar_reconfirmaciones.py`, `simular_cabezas_sucesivas.py`), JSON íntegro, 21 visores de hoja interactivas, HTML principal y ZIP con ambos insumos están entregados como archivo descargable **`prueba_repeticiones_20dias_10oct.zip` en esta conversación**. No dependen de red ni de paquetes adicionales.
- Prueba cruzada **aprobada**: las cabezas reales 10/10, reconstruidas secuencialmente mediante +11 y enumeración completa VT2/VT3/VT4, reproducen exactamente todos los caminos de `completePost`: **21 huellas únicas, 4 figuras en dos o más turnos**.

## Comparación empírica real, 20 jornadas septiembre

| Indicador | Valor |
|---|---:|
| Muestra histórica | 20 días |
| Promedio de figuras reconfirmadas, cuatro turnos, cinco jurisdicciones | **1,8** por día |
| Mediana | **2** |
| Mínimo / máximo | **0 / 4** |
| Jornadas con 4 repeticiones | **4/20 (20 %)** |
| 10/10 hasta Vespertina | **4 de 21 figuras físicas confirmadas únicas** |

Las cuatro jornadas históricas con cuatro repeticiones: **11, 14, 21 y 28 de septiembre**. No se escogieron de manera selectiva; todas las jornadas de la muestra cuentan.

## Control geométrico condicional simple — RESULTADO ENGAÑOSAMENTE BAJO

Control: preservar la cantidad de figuras confirmadas reales por `turno|columna fuente|VT` y elegir uniformemente ubicaciones físicamente válidas en ese estrato. **1400 repeticiones por día, semilla fija**. El 10/10 produjo media simulada de **1,221**, P(simulación ≥4) **1,5 %**.

**No es un modelo válido de formación de marcas a partir de cabezas**, porque cada cabeza produce simultáneamente varias rutas geométricas correlacionadas. Tomarlo aislado como evidencia de patrón extraordinario produciría una conclusión falsa o como mínimo altamente dependiente de un supuesto inadecuado.

## Control mecánico más fiel: simular cabezas y generar cada columna +11 en orden

- Fijar la fuente previa real `prevNocturno` del 10/10: `37, 55, 63, 47, 65, 42`.
- Generar **5 cabezas simuladas uniformes de cuatro cifras** por turno y de forma independiente. Construir todas las marcas válidas VT2/VT3/VT4 que explican sus sufijos, sin saltos, inversiones duplicadas ni cruces de columna. **Solamente después** de cada turno generar con +11 la nueva columna fuente para el turno siguiente.
- Repetir **7500** secuencias completas; semilla `20261010`.
- Resultados: **2,00** huellas reconfirmadas en promedio; mediana **1**, percentil 5–95 **0–6**. **21,65 %** (0,21653) de las secuencias tuvieron **4 o más** reconfirmaciones.
- Subgrupo con número de figuras confirmadas únicas parecido a las 21 observadas (rango 18–24): **1.791 simulaciones**; **15,69 %** con ≥4 reconfirmaciones.
- Este resultado concuerda mejor con el **20 % histórico** y muestra por qué el control geométrico uniforme sencillo no debe usarse para inferir valor predictivo.

Limitación: las cabezas simuladas son independientes y uniformes, hipótesis de investigación no confirmada sobre los sorteos reales. Aunque se conserve la dependencia del tablero +11 entre turnos, esto **no prueba aleatoriedad**, causalidad, poder predictivo ni apuesta conveniente. Los 20 días históricos son pocos, datos reconstruidos digitales y no verificados contra la tinta original.

## Figuras exactas que se reconfirmaron el 10/10

**Tres figuras VT2 diferentes del mismo valor 56**, entre cabeza Ciudad Previa `0956` y cabeza Córdoba Primera `9656`, todas en `prevNocturno`: celdas `1:0↔2:0`, `1:1↔2:0`, `4:1↔4:0`.

**Una VT2 invertida 48↔84**, misma figura física en columna `Primera`, celdas `4:1↔4:0`: Matutina Santa Fé `9848` (48) y Vespertina Santa Fé `2584` (84). La figura no estaba disponible en la hoja antes de Primera; sí en los turnos posteriores. **No se registra como pronóstico.**

## Conclusión y siguiente prueba

**La mera reconfirmación de cuatro figuras en un día no constituye señal predictiva excepcional** en estas muestras; tanto la frecuencia histórica 4/20 como el modelo de cabezas sucesivas 21,65 % muestran que puede suceder sin decisiones anticipatorias.

Una prueba con capacidad de refutación exige **sellar antes del turno siguiente**: (a) qué cabeza/figura específica previamente confirmada se espera que reaparezca, (b) qué orientación concreta, (c) fuente/turno y (d) abstención permitida. Luego cotejar todas las que no se reconfirmen, sin elegir después el recorrido acertado. No implantar puntuación/ranking sobre repeticiones a partir de este análisis.

**Rama únicamente experimental:** `auditoria-sorteo-10oct-2026`. No se tocó main, motor, selector ni APK oficial.