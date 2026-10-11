# Punto de control — examen ocular histórico V8/V9/VT0 en 145 cortes (11/10/2026)

**Trabajo ejecutado, no pendiente.** Se utilizaron los datos previamente auditados del observatorio integrado: 29 fechas de sorteo entre 08/09 y 10/10/2026 × cinco turnos, 145 expedientes preobjetivo. **No** se modificó main, motor, ranking oficial, app ni APK. Resultados **retrospectivos**, no pronósticos prospectivos.

## Protocolo y congelamiento interno

- **Seis reglas determinísticas** por modalidad VT2, VT3 y VT4 (elegir máximo una orientación/ruta por corte o abstenerse): (1) primera figura D−7, (2) primera D−1, (3) figura exacta compartida D−1+D−7, (4) D−7 que toca figura confirmada de turno anterior del día, (5) D−7 idéntica a figura confirmada previamente, y (6) D−7 con apoyo D−1 o contacto V9.
- Cada ruta pertenece a una fuente de 6 filas × 2 celdas, vecinos de rey, sin saltos ni repetición; la inversión es la misma figura física y los sentidos A/B quedan explícitos. Orientación automática escogida de la marca histórica antes del resultado, sin invertir por conveniencia posterior. No se usó la fórmula de puntuación V8.
- Los códigos `1_seleccionar_sin_resultados.py` y `2_cotejar_despues.py` operan separados: el primero **no lee** el archivo POST y guarda 2.610 decisiones/abstenciones con SHA256 **`3eabad2ba394db15af643d198e52fb561eaf99cccd3394f5605956a1b9bd5ca1`**; el segundo verifica ese hash y después lee los resultados. Las cinco jurisdicciones argentinas poseen cabezas por corte y se evalúan sistemáticamente (145 × cinco = 725 cabezas de tanda, expuestas a tres modalidades y distintas reglas, no independientes).
- Referencia exploratoria adicional: 1.500 permutaciones de paquetes de cabezas por fecha dentro del mismo turno. No inferir ventaja estadística ni beneficios económicos.

## Resultados VT2

| Criterio | Elegidas | Abstenciones | Coincidencias con cabeza y misma figura | Media de aciertos con cabezas permutadas |
|---|---:|---:|---:|---:|
| D−7 sola | 115 | 30 | **6** | 5,434 |
| D−1 sola | 140 | 5 | **7** | 6,354 |
| D−7 y D−1 misma huella | 114 | 31 | **3** | 5,378 |
| D−7 toca marca anterior del día | 89 | 56 | **1** | 4,373 |
| D−7 confirmó misma huella antes | 85 | 60 | **1** | 4,002 |
| D−7 con D−1 o contacto V9 | 114 | 31 | **2** | 5,424 |

**VT3**: 0 coincidencias entre respectivamente **113, 136, 42, 86, 12, 94** elecciones. **VT4**: 0 entre **95, 112, 0, 71, 0, 71** elecciones. **No se observa mejora al reforzar automáticamente con convergencia/contactos**. Las fechas históricas ya se habían investigado y por ello no constituyen un holdout independiente. El criterio humano real del padre **NO** fue ejercido en estas elecciones algorítmicas.

## Examen manual utilizable SIN esperar un sorteo

Entregado en la conversación el archivo `modelo-papa-examen-visual-historico-145-cortes.zip` (165 archivos, 145 páginas PRE INDIVIDUALES), que contiene:

- `indice_PRE.html` muestra 29 fechas y cinco turnos. Cada enlace abre una **página HTML independiente** con UNA sola matriz PRE del turno y sus memorias, sin incluir la cabeza del objetivo ni datos POST embebidos de otros turnos. Las páginas siguen teniendo resultados de turnos YA sorteados si se elige un turno posterior, por lo que hay que abrirlas en orden.
- Cada página PRE puede mostrar todas las rutas VT2/VT3/VT4 permitidas o solo heredadas D−1/D−7, elegir huella exacta y sentido A/B o abstenerse, bloquear la ficha actual y exportar JSON. No permite puentes V8 físicamente prohibidos.
- `DESPUES_evaluador.html` es un archivo SEPARADO con los resultados POST. Acepta varios JSON de decisiones, cuenta todas las elecciones/abstenciones y distingue coincidencia de terminación y de figura/sentido físico; conserva las cabezas completas.
- `TABLERO_RESULTADOS_AUTOMATICOS.html` presenta los 145 cortes, las seis reglas, sus resultados y negativos; el ZIP incluye los archivos PRE y POST fuente, SHA256, resumen, scripts y pruebas.
- Chromium con contenido local cargado mediante `set_content`: PRE Primera 10/10, `393` 0 rutas válidas, `654` 2 rutas; se eligió `654` orientación inversa, fijó, exportó JSON y evaluó como no coincidente en Primera. Test independiente 10/10 Nocturna con ruta `vt2|prevNocturno|3:0>4:1` lectura `54`: cotejo positivo exacto correcto. Pruebas de sintaxis JS y empaquetado ZIP aprobadas.
- **Advertencia:** un ejercicio con datos ya sorteados y horas del navegador NO demuestra que la decisión fuera realmente previa al sorteo. No llamar prueba prospectiva real.

## Decisión técnica

Se mantiene V8 para transparencia del recorrido y diagnóstico de cruces inválidos, VT0 para identidad reversible y V9 para eventos descriptivos sin confundir persistencia física y reconfirmación. **No habilitar el scoring antiguo de V8/V9 ni nuevos filtros en producción**. Con las fechas existentes ya es posible hacer 10–15 **prácticas manuales visuales** en cortes históricamente PRE y cotejar sus decisiones, comparando después la selección humana frente a estas seis reglas. No hace falta esperar el siguiente sorteo, pero no sobreinterpretar el control retrospectivo.
