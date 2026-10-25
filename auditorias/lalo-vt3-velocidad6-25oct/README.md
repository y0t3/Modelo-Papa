# Ensayo geométrico VT3 — paso reciente y vector vertical constante (25/10/2026)

**Rama:** `lab/lalo-vt3-direccion-velocidad-6j-25oct`. **Laboratorio retrospectivo exploratorio. Motor Lalo MV1, rama `main` y APK intactos.**

## Motivo y secuencia de pruebas
Después de observar que las cinco cabezas VT3 físicamente formables del sábado 24/10 no fueron reconocidas por el motor histórico D−1/D−7, se investigó si el **movimiento geométrico** ayuda a recuperar candidatas sin aceptar centenares de figuras que aparecen solo por geometría.

El ensayo anterior de **cadenas activadas**, disponible en [el informe de cadenas](https://github.com/y0t3/Modelo-Papa/blob/lab/lalo-vt3-cadenas-activadas-6j-25oct/auditorias/lalo-cadenas-activadas-25oct/README.md), había probado continuidad entre jornadas, avance hacia la derecha y desplazamiento vertical constante, sin distinguir los cinco aciertos del sábado y sin mejora robusta. Para evitar repetir exactamente esa configuración, aquí se restringió el avance reciente a **dos jornadas** y el cambio vertical a **una fila**, y se exigió una velocidad vertical firmada exacta en la cadena completa. Son hipótesis **exploratorias adicionales**, no replicaciones independientes fuera de muestra.

## Reglas PRE (sin filtrar por el ganador futuro)

- **PASO_RECIENTE:** la misma silueta VT3 debió haber sido activada por una cabeza publicada hace como máximo dos jornadas efectivas, en la **fuente inmediatamente anterior a la derecha actual**: fuente histórica `s−1`, fuente candidata `s`, con diferencia vertical de ancla de hasta una fila. La cabeza antigua y el valor actual pueden diferir. Solo se usan recorridos contiguos de tres celdas dentro de cada columna de su respectiva hoja.
- **VECTOR_CONTINUO:** la silueta debió activarse en dos jornadas anteriores **consecutivas**, una en fuente `s−2` y otra en `s−1`, y ahora formar físicamente una candidata en `s`. Ambas transiciones de fila deben tener el **mismo desplazamiento firmado** de −1, 0 o +1. La activación reciente tiene como máximo dos jornadas de antigüedad. La identidad de eventos publicados históricos se deduplica.

Las dos reglas trabajan **solo con familias VT3 físicamente posibles pero ausentes del ranking completo MV1**. Cada una sustituye como máximo el **puesto 10**, conservando intactos los primeros nueve. La cuarta cifra y las prioridades de VT2/VT4 no se cambian.

## Protocolo
- **124 jornadas**, **620 cortes**, **3.321 cabezas**, junio–24/10/2026. El modelo original mantiene Top3 **17**, Top5 **35**, Top10 **59**.
- Las últimas Nocturnas se recuperan históricamente por **jurisdicción**, sin copiar sorteos inexistentes ni tomar un turno posterior.
- Cada hoja PRE contiene únicamente resultados publicados **antes del turno que va a compararse**. Cabezas del turno objetivo se consultan para comprobación POST después de guardar las selecciones del corte.
- Una familia VT3 admite inversión de sus tres cifras, nunca cruza columnas de la hoja +11 y nunca salta celdas.
- Para cada regla se repitieron **10.000** elecciones aleatorias por período, entre las mismas familias elegibles y con el mismo cupo de una incorporación #10. También se comparó dentro de cada corte la proporción de testigos ganadores frente a no ganadores, mediante **2.000** permutaciones bilaterales emparejadas por corte. Ningún `p` obtenido es confirmatorio debido a la exploración reiterada.

## Resultados por período: cabezas en Top10 VT3

| Período | Lalo MV1 | Paso reciente | Vector continuo |
|---|---:|---:|---:|
| Junio–julio | 24 | 28 | 25 |
| Agosto–septiembre | 20 | 24 | 20 |
| Octubre (hasta sábado 24) | 15 | **13** | **14** |
| **Total** | **59** | **65** | **59** |

Como no cambian los primeros cinco puestos, Top3 **17** y Top5 **35** permanecen iguales en las tres versiones.

| Criterio | Cortes con opción (620) | Tamaño promedio del grupo elegible por corte con opción | Nuevos aciertos | Aciertos desplazados | Total Top10 | Controles aleatorios con igual o más nuevos |
|---|---:|---:|---:|---:|---:|---:|
| PASO_RECIENTE | 493 | **18,38** | 8 | 2 | **65** | **8,08%** |
| VECTOR_CONTINUO | 119 | **1,50** | 1 | 1 | **59** | **100%** |

Para **PASO_RECIENTE**, la aleatorización condicional produjo en promedio **4,53** aciertos nuevos, frente a 8 observados. Al comparar las familias ganadoras y no ganadoras *dentro de su mismo corte*, la diferencia media de proporciones con el rasgo fue solo **+0,0091**, y un **51,1%** de 2.000 permutaciones bilaterales igualó o superó el valor absoluto observado. Resultado no robusto.

Para **VECTOR_CONTINUO**, se computaron 178 exposiciones familiares elegibles, de las cuales **2** tenían cabezas ganadoras y **176** no; el criterio seleccionado incorporó solo una ganadora y desplazó otra del puesto 10. La diferencia emparejada dentro de corte fue **+0,00055** (fracción bilateral aleatoria **84,05%**).

El conjunto `PASO_RECIENTE` tiene **9.062 exposiciones** de familias elegibles repartidas por cortes; apenas **92** son exposiciones con al menos una cabeza ganadora en ese corte, y **8.970** no lo son. NO son 9.062 familias distintas ni 9.062 apuestas. Este universo amplio ayuda a entender por qué una mejora puntual del Top10 no demuestra calidad de discriminación.

## Revisión específica del sábado 24/10

| Corte | Familias no reconocidas con paso reciente | Familia ganadora dentro de ellas | ¿Elegida para #10? | Con vector continuo |
|---|---:|---|---|---:|
| Previa | 0 | — | — | 0 |
| Primera | 9 | Ninguna | `078/870` (no ganadora) | 0 |
| Matutino | 15 | Ninguna | `088/880` (no ganadora) | 0 |
| Vespertino | 19 | **`396/693`**, cabeza `5693` | `088/880` (no ganadora) | 0 |
| Nocturno | 20 | Ninguna | `088/880` (no ganadora) | 0 |

Las cinco VT3 físicamente formables que faltaron en Lalo fueron `379/973`, `375/573`, `123/321`, `396/693` y `739/937`. La regla **PASO_RECIENTE** solo reconoció como **elegible** a `396/693`, pero no la priorizó, ya que quedaba una lista de otras 18 familias con la misma condición. **VECTOR_CONTINUO** no encontró ningún candidato elegible en los cinco cortes del sábado.

Esto diferencia claramente **ser geométricamente detectable** de **ser elegido en Top10**. Aunque la figura `5693` se movió de fuente vecina con un cambio de fila compatible, otras 18 candidatas cumplían el mismo patrón. Ninguna de las dos reglas habría resuelto el sábado.

## Interpretación, límites y decisión

1. **No adoptar `PASO_RECIENTE`**: aumentó el Top10 histórico 59→65 pero empeoró en octubre 15→13 y su éxito contra controles fue compatible con exploración/azar; sigue ofreciendo demasiadas alternativas.
2. **No adoptar `VECTOR_CONTINUO`**: su reducción del universo elegible fue fuerte, pero el Top10 quedó en 59, no rescató el sábado y los controles no mostraron señal.
3. **No modificar el algoritmo de VT2, las madres de VT4 ni la APK**. Los dos VT4 formables del sábado dependían de madres VT3 no reconocidas, pero ampliar a ciegas la genealogía violaría los fundamentos del modelo.
4. En vez de seguir ajustando retrospectivamente umbrales de antigüedad y desplazamiento hasta lograr un Top10 favorable, congelar la hipótesis, usar contrastes prospectivos sellados y medir estabilidad por períodos. Los cortes posteriores al 24/10 deben reservarse como comprobación nueva, sin reoptimizar contra ellos.
5. El método analiza una lotería: estas coberturas geométricas **no prueban ventaja real sobre un mecanismo aleatorio de sorteo**.

## Respaldos
- [GitHub Actions #40233012716](https://github.com/y0t3/Modelo-Papa/actions/runs/40233012716) — corrida completa verificada, con regresiones de MV1 y última Nocturna por jurisdicción aprobadas.
- `scripts/lab-vt3-velocidad6.ts` — reproducción total, controles emparejados, azar condicional y detalle del sábado.
- `auditorias/lalo-vt3-velocidad6-25oct/resultados-verificados.json` — resultados de ejecución versionados, incluyendo selección PRE por corte del sábado, alternativas, controles y diferencias.
- Artefacto GitHub Actions `laboratorio-vt3-velocidad` — `resumen.json`, `cabezas.json`, `cortes.json`, `controles-emparejados.json`.
