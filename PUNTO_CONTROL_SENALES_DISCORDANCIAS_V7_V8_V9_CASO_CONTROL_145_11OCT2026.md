# Punto de control — discrepancias V7/V8/V9: señales PRE en familias confirmadas vs controles negativos

**11/10/2026 · Auditoría ejecutada sobre las mismas 29 jornadas (145 cortes).** Rama experimental `auditoria-sorteo-10oct-2026`. **No se modifica** `main`, motor oficial, selector, APK, Top previos ni sus hashes PRE/POST.

## Objetivo

En lugar de diseñar un nuevo ranking después de ver el caso positivo, comparar **todas las familias de un solo especialista** V7/V8/V9 que sí se confirmaron con las que NO se confirmaron, preservando reversibilidad, todas las rutas válidas y misma fuente. Preguntar si los rasgos anteriores al sorteo realmente diferenciaban ganadoras de negativas.

## Datos y verificaciones

- PRE congelado de discrepancias (sin alterar) SHA256 `3bed354fcafc474e40df227d6198ec88d814d78f99a92b8955c9662009965575`.
- POST original (sin alterar) SHA256 `2de4db0dc04728397178e7d39c34a8e9c3b791fe158c822f8734fee21c7fc952`.
- **11.037 registros de familias-corte** (unión de Top de especialistas y candidatas V13 inferiores), 145 cortes × VT2/VT3/VT4 = 435 modalidad-corte. **No equivalen a 11.037 ensayos independientes.**
- Diez rasgos PRE auditados: D−7, D−1, ambos, confirmación física exacta en turno anterior ya sorteado, contacto con marca anterior, procedencia Nocturna anterior +11, al menos 2 o 3 recorridos, al menos 2 fuentes, D−1 y D−7 en recorridos distintos.
- Tres controles complementarios: (a) número esperado de marcas positivas para rasgo condicionado por la cantidad de familias y aciertos **del mismo corte**; (b) **2.000 permutaciones** de los **cinco resultados completos** entre fechas del **mismo turno y mes**, sin descomponer jurisdicciones ni cambiar tableros; (c) **167 parejas** de positivos y negativos del mismo corte/VT/**especialista**, seleccionando un control de fuentes y cantidad de recorridos comparables (sin usar D−1, D−7 o confirmación para formar la pareja).
- Se probaron 300 combinaciones período × VT × subconjunto × rasgo; son análisis **exploratorios**, no tests preregistrados. Las pruebas nominales no se interpretan como p definitivos tras múltiples hipótesis. Octubre ya era histórico conocido en el proyecto, por lo que no es un holdout independiente.

## Resultado principal de rasgos exclusivos VT2

| Rasgo | Septiembre confirmadas / esperadas en el mismo corte | Octubre confirmadas / esperadas en el mismo corte |
|---|---:|---:|
| D−7 | **34 / 32,9** | **24 / 23,7** |
| D−1 | **44 / 42,7** | **26 / 26,6** |
| Reconfirmada exacta antes del turno | **24 / 17,8** | **15 / 10,8** |
| Fuente Nocturna anterior +11 | **51 / 50,3** | **26 / 23,1** |
| 2+ recorridos físicos | **55 / 53,2** | **26 / 26,4** |
| 2+ fuentes distintas | **29 / 32,3** | **16 / 14,8** |
| D−1/D−7 en trazos distintos | **6 / 7,3** | **8 / 6,6** |

La única pista descriptiva que se mantuvo favorable es *una confirmación exacta ya conocida antes del objetivo*, pero permanece dentro de controles amplios: en octubre, al redistribuir paquetes completos de cabezas entre fechas del mismo turno, las coincidencias con este rasgo promediaron **10,38**, rango central aproximado **6 a 15**, observado **15**; contraste exploratorio de doble cola ~**0,074**, **sin ajuste por muchas hipótesis**. Septiembre no refuerza de forma decisiva.

En **parejas controladas VT2**: septiembre **84 pares**, reconfirmación anterior presente solo en ganadora **11** contra solo en negativa **6**; octubre **42 pares**, **4 contra 1**. Pocas parejas discordantes, y además hay correlación por jornadas. Para D−7 septiembre **5 contra 14**; octubre **10 contra 6**. **No hay rasgo que discrimine con estabilidad convincente.**

**Especialistas no son fuentes de evidencia independiente:** V9 favorece por definición reconfirmación; si el selector premia «V9 y confirmación exacta» como dos votos, estaría duplicando el mismo hecho.

## Efecto de familia-jornada que debe controlar V9

VT2 **exclusivas de especialista**:
- Septiembre: **90** coincidencias familia/corte, pero **80** familias-jornada únicas; con reconfirmación anterior **24** exposiciones, **20** familias-jornada.
- Octubre: **43** coincidencias familia/corte, pero **33** familias-jornada únicas; con reconfirmación anterior **15** exposiciones, **10** familias-jornada.

Ejemplo comprobado 05/10 Vespertino y Nocturno: la misma VT2 `13/31` fue confirmada en ambos turnos, pero NO son dos familias-día distintas. V9 debe conservar los dos eventos en el historial visual y descontar su dependencia al calcular fiabilidad.

## Caso positivo con negativo comparable

**02/10 Primera**: VT2 `79/97`, propuesta exclusiva de V9, tenía **un** recorrido de Nocturna anterior, marcado D−1 y con **dos** confirmaciones exactas anteriores; la cabeza Entre Ríos **0197** la confirmó. VT2 `05/50`, también exclusiva de V9 y con **un** recorrido en la misma fuente, tenía D−7 pero **no** reconfirmación exacta anterior y no salió en ese objetivo. **Un caso explicativo, no evidencia de regla general.**

## Decisión

Preservar la arquitectura correctiva: V7 antecedentes verificados D−1/D−7, V8 multiplicidad real sin duplicar sentidos, V9 confirmar solamente con cabeza observada y mantener registro por **jornada/familia**, V13 una ficha por familia de todas las fuentes/recorridos, V12/V14 auditoría de sustituciones y capacidad de abstención. **No otorgar todavía bonus automático por reconfirmación, D−7, C0 ni multihuella.** Las pocas señales no superarían de forma confiable controles de exposición y pareja con datos históricos tan explorados.

## Entrega al usuario y pruebas

Carpeta `auditoria_discordancias_visual_145` y ZIP `modelo-papa-auditoria-discrepancias-senales-v7-v8-v9-145-cortes.zip` con:
- `COMPARADOR_POST_SENALES.html`: análisis interactivo de período, VT, especialista y evidencia positiva vs negativa, deliberadamente POST, nunca un visor ciego PRE;
- `INFORME_DISCREPANCIAS_EVIDENCIA.md`, `BALANCE_SENALES_POR_CORTES.csv`, `BALANCE_PAREJAS.csv`;
- `RESULTADOS_EVIDENCIA_VISUAL_145.json`, `PAREJAS_CASO_CONTROL.json`;
- scripts `1_analizar_evidencia.py`, `2_parejas_comparables.py`, `3_crear_informe_y_visor.py`, `4_verificar_y_empaquetar.py`;
- las fuentes PRE/POST ORIGINALES sin alteración bajo `insumos/`, validaciones, captura del navegador.

Se verificaron hashes originales, 145 coincidencias de cortes, 167 parejas, geometría heredada del PRE auditorado y página HTML con cambios de selectores en **Chromium/Playwright** sin errores JS. ZIP `testzip()` OK. El experimento solo lee fuente histórica, NO modifica motor ni app.
