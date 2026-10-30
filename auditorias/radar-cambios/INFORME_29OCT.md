# Radar experimental de cambios físicos — VT2 y VT3
**Modelo Lalo / Sistema de Quiniela**  
Fecha del estudio: 29/10/2026  
Rama aislada: `lab/alertas-cambios-formas-vt2-vt3-29oct`  
Validación final: [GitHub Actions 40992654638](https://github.com/y0t3/Modelo-Papa/actions/runs/40992654638) — pruebas unitarias, geometría de las tres hojas, memoria de testigos, pulsos, regresión MV1 y replay sin excepciones.

## Pregunta

¿Permite una **novedad física observable PRE**, en una ventana corta de 5–6 jornadas, distinguir unas pocas figuras de VT2 y VT3 frente a figuras geométricamente comparables que no presentan esa novedad?

**No perseguimos familias ni ordenamos Tops después del sorteo.** La identidad bajo seguimiento es tablero + fuente + posición/casillas + longitud; los motores y la familia son etiquetas informativas. No se han alterado los rankings oficiales ni la APK.

## Señales (calculadas antes del objetivo)

Se revisan los Top10 de cada motor existente: Lalo +11 VT2 y VT3; Geometría/Conectadas VT2; Formas Primero VT2 y VT3; Auxiliar Ayer / Auxiliar Hoy VT2 y VT3. La misma ruta elegida por varios motores de +11 cuenta UNA figura física.

- `NACE_CON_TESTIGO`: **ausente de los Tops en las últimas seis jornadas disponibles** y con algún antecedente ganador en el mismo sitio de una jornada anterior. Se requieren al menos tres jornadas previas para activar el aviso, pero «nacimiento» nunca se usa si apareció en cualquiera de las seis observadas.
- `REAPARECE_CON_TESTIGO`: había aparecido en algún corte anterior de las seis jornadas, **no estaba en el Top de la jornada inmediatamente anterior** y tiene al menos un testigo ganador previo o intrajornada en ese sitio.
- `REFUERZO_REAL_INTRADIA`: el recorrido ya explicó una cabeza de un sorteo **anterior al corte objetivo, dentro de la misma jornada**, en esa misma hoja. Jamás permite consultar el turno objetivo ni un turno posterior.
- `MADRE_CON_EXTENSION_AUXILIAR`: figura VT2 seleccionada cuya familia actual aparece como madre de una VT3 **físicamente seleccionada** tanto en Auxiliar Ayer como en Auxiliar Hoy. **Importante: esta primera prueba NO enumera aún extensiones VT3 fuera de los Top10**. Es una definición intencionalmente conservadora, pero podría pasar por alto un caso como el 813 si solo existe físicamente y está fuera de los Tops.

Las señales se pueden superponer, excepto nacimiento y reaparición (se corrigió la confusión detectada en una primera pasada). Se preservan todas en auditoría, pero la vista rápida selecciona máximo **dos focos VT2 y dos VT3 por corte**, con prioridad fija de geometría/historia PRE. Esto no equivale a recomendar apuestas.

## Muestra y controles

**15 jornadas entre 12 y 28/10/2026**, 5 cortes por día = **75 cortes PRE**. No hay cortes descartados. Cada corte se compara POST con cinco cabezas de Ciudad, Provincia, Córdoba, Santa Fe y Entre Ríos; Montevideo queda fuera del ensayo homogéneo por calendario propio. Una figura puntúa como coincidencia si su lectura física directa/inversa explica la terminación de al menos una cabeza real, y se cuenta UNA vez, aunque explique varias.

Control: por cada foco seleccionado **antes del sorteo**, elegir otra figura también seleccionada pero **no activada** en el mismo corte, de la misma hoja y longitud; priorizar **misma fuente y misma silueta**; usar mismo tablero/longitud como alternativa explícita si faltan controles. Selección determinista por ID de recorrido, NUNCA por su número posterior. Los controles se excluyen entre sí (sin reemplazo), para no multiplicar una misma oportunidad.

Esto corrige parcialmente el sesgo de exposición, pero NO controla completamente dependencias entre figuras, cabezas, calendarios o motores, ni equivale a ensayo prospectivo sellado.

### Resultado agregado

| Métrica | VT2 | VT3 |
|---|---:|---:|
| Observaciones figura/corte que dispararon al menos un aviso | **2.216** | **612** |
| Focos filtrados para revisión visual | **144** | **132** |
| Focos que explicaron ≥1 cabeza posterior | **14** | **1** |
| Figuras control que explicaron ≥1 cabeza posterior | **12** | **0** |
| Pares exactos (misma fuente y silueta) | **141 de 144** | **116 de 132** |
| Pares relajados, mismo tablero y longitud | **3** | **16** |
| Focos sin control comparable | **0** | **0** |

VT2, pares discordantes: **13 foco sí/control no, 11 control sí/foco no**; una coincidencia en ambos y 119 en ninguno. En los 141 controles de geometría exactamente emparejada, 14 focos y 11 controles explicaron al menos una cabeza. No es una diferencia convincente.

VT3: **1/132** focos vs **0/132** controles; diferencia insuficiente para concluir, y 16 pares no tuvieron la misma silueta y fuente.

Estos datos son **incidencias de figuras/corte**, no personas, apuestas, episodios independientes ni ganancias. La misma huella puede aparecer en varios turnos y los eventos están correlacionados.

### División cronológica, sin ajustar la regla retrospectivamente

| Ventana | VT2 focos (éxitos / expuestos) | VT2 controles (éxitos / expuestos) | VT3 focos | VT3 controles |
|---|---:|---:|---:|---:|
| 12–20/10 | **3/74** | **5/74** | **0/62** | **0/62** |
| 21–28/10 | **11/70** | **7/70** | **1/70** | **0/70** |

El signo de la diferencia en VT2 cambia de una mitad a otra. **Es compatible con la idea de episodios volátiles, pero también con variaciones aleatorias**. No hay demostración estadística de patrones explotables ni se autoriza seleccionar retrospectivamente la ventana que mejor quedó.

### Carga de avisos antes del filtro

| Tipo de evento activado | VT2 | VT3 |
|---|---:|---:|
| Nacimiento genuino (ausente en seis anteriores) | **61** | **272** |
| Reaparición después de faltar a la última jornada | **1.080** | **299** |
| Nuevo testigo ganador intrajornada | **969** | **68** |
| Madre VT2 con VT3 en ambas auxiliares | **545** | — |

Las categorías **se superponen**: no sumarlas para calcular figuras distintas. El contraste refuerza que VT2 genera muchísima repetición y VT3 nacimientos más definidos, pero requieren evaluación individual.

La primera prueba detectó que algunas reapariciones de días −4/−5 estaban mal etiquetadas como nacimientos. **Se corrigió**, se añadió test unitario y se repitió el replay. La corrección redujo los nacimientos VT2 a 61 y VT3 a 272, sin cambiar el número total de incidencias disparadas.

## Ejemplo real de minihoja a rescatar

En la **Primera del 27/10**, el laboratorio seleccionó una figura VT2 de la columna Nocturna anterior de +11, sitio físico `3:1>4:0`, lectura `08` y señal de reaparición + refuerzo ganador de un sorteo anterior del mismo día. En POST apareció **Entre Ríos 1308**. Es una reconstrucción retrospectiva PRE (no un pronóstico sellado); también hubo muchos focos seleccionados que no acertaron. Deben conservarse ambos casos en la futura interfaz.

## Lo que aprendimos y siguiente prueba

1. **El radar ya puede mirar las tres hojas, en paralelo, y producir cuatro focos visuales por turno sin seguir familias numéricas longitudinalmente.** La matemática del Top original no se modifica.
2. **Una figura naciente, por sí sola, tampoco da ventaja comprobada.** Tampoco basta con reunir testigos o contar repetidos: en VT2 hay demasiada exposición, y en VT3 falta muestra de cabezas exactas.
3. **Ventanas cortas: sí para localizar acontecimientos, no para vender una regularidad estadística.** En una mitad de octubre VT2 quedó por debajo del control y en otra por encima.
4. **Siguiente limitación técnica a resolver:** para casos tipo `13/31 → 513 o 813`, hay que examinar **todas las VT3 físicamente formables alrededor de la madre VT2 en cada una de las dos auxiliares**, incluso si la VT3 no entra en el Top10. Registrar alternativas fallidas, priorizar la visualización de los recorridos, y contrastar contra extensiones igualmente posibles pero sin respaldo geométrico, de modo que la cobertura mayor no se presente como certeza de mejor acierto.

**Nada se ejecuta automáticamente en la aplicación todavía.** No se incorporó un radar visual en la APK ni se ajustó la prioridad de motores. Se evita mezclar recorridos entre tableros, otorgar doble valor a dos motores sobre +11 o leer resultados del turno objetivo al construir avisos.

## Reproducibilidad

- `src/labAlertasCambios.ts`: nacimiento, reaparición, refuerzo intrajornada y respaldo interhoja, más controles emparejados y evaluación separada POST.
- `scripts/test-alertas-cambios.ts`: prueba de los estados y guardias anti-fuga temporal, incluso prohibición de testigos del propio turno.
- `scripts/lab-tres-hojas-figuras.ts`: replay 75 cortes, testigos reales por fuente, Top10 por motor, focos y controles.
- `.github/workflows/lab-alertas-cambios-vt2-vt3.yml`: pruebas y publicación de artefacto.
- [GitHub Actions #40992654638](https://github.com/y0t3/Modelo-Papa/actions/runs/40992654638) — artefacto `alertas-cambios-octubre` con las 75 jornadas/cortes resumidos y ejemplos físicos finales.
