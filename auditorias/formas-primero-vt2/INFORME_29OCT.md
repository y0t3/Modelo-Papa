# Ensayo Formas Primero VT2 — 29/10/2026

## Pregunta e implementación

Se extendió **el mismo criterio geométrico de Formas Primero VT3** a VT2 sin tocar el ranking oficial MV1.

1. Se consideran exclusivamente figuras de dos **casillas contiguas** en una sola columna +11.
2. Se recuperan sólo recorridos que explicaron cabezas ganadoras de hasta **seis jornadas históricas anteriores**; una cabeza cuenta una vez como evento independiente aunque tenga varios caminos.
3. Se ordenan **posiciones** por silueta, desplazamiento, fuente, recencia y eventos comprobados, sin consultar sus dos cifras actuales.
4. Sólo después se leen las dos cifras actuales, se agrupan los reversos (por ejemplo 12/21), y se muestra un Top10 independiente.
5. No existen rutas válidas si requieren saltar o cruzar columnas. Las referencias de fuentes vecinas son comparaciones de hojas, nunca recorridos mixtos.
6. Sin testigos históricos no se inventan prioridades. Los resultados POST del objetivo están ocultos al seleccionar candidatos.
7. En la interfaz, Formas Primero VT2 presenta minihojas actuales/históricas y POST por familia, en paralelo a Formas Primero VT3 y Lalo MV1, sin modificar sus Tops.

Pruebas obligatorias: `scripts/test-motor-formas-primero-vt2.ts` (invariancia completa ante reemplazo de cifras, cabeza de cinco cifras terminada en 01, bloqueo de POST, geometría de dos casillas, no inventar raíces); más pruebas anteriores VT3 y MV1.

**Importante:** durante el desarrollo se detectó y corrigió una comprobación de tres casillas heredada de VT3. **Se descartó por completo el primer replay incorrecto y se repitieron los tres períodos**. Datos sólo de la ejecución final aprobada: https://github.com/y0t3/Modelo-Papa/actions/runs/40858316696.

## Replay retrospectivo comparado — mismas hojas PRE para los dos motores

118 jornadas; 590 cortes (cinco turnos por jornada); 2.950 cabezas verificadas de las cinco jurisdicciones comparables, sin Montevideo. Días incompletos y domingos no se cuentan como cortes completos. No hay PRE externo sellado; reconstrucciones estrictamente cronológicas con el historial disponible.

| Período | Cortes | Lalo Top3 | Formas Top3 | Lalo Top5 | Formas Top5 | Lalo Top10 | Formas Top10 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Junio–julio | 255 | **77** | 70 | **123** | 111 | 246 | **247** |
| Agosto–septiembre | 260 | **81** | 72 | **135** | 116 | **264** | 245 |
| Octubre 12–28 | 75 | **25** | 16 | **39** | 31 | **66** | 54 |
| **TOTAL** | **590** | **183** | **158** | **297** | **258** | **576** | **546** |

Cifras corresponden a **cabezas reales cuya familia de las dos últimas cifras coincide con el Top**. No equivalen automáticamente a que esa figura concreta haya sido recorrida por el sorteo ganador ni a premios.

### Exclusivos y control por azar

En Top10, **289** cabezas coincidieron con ambos motores, **287 sólo Lalo** y **257 sólo Formas Primero**: diferencia neta Formas−Lalo **−30**. En Top3, coincidencias 31 compartidas, 152 sólo Lalo y 127 sólo Formas: diferencia **−25**.

Un control neutral simple que elige familias de igual manera entre todas las **físicamente formables** de cada corte produciría (en esperanza aproximada) **165,48** coincidencias Top3, **275,79** Top5 y **551,36** Top10. Formas Primero obtuvo **158, 258 y 546**: comparable al azar, no mejor. Este control es aproximado: no equipara multiplicidades ni dependencias entre rutas.

Prueba apareada de casos discordantes (bilateral, por cabeza): **p≈0,151** Top3; **p≈0,061** Top5; **p≈0,214** Top10. Remuestreo de jornadas completas (12.000 réplicas, semilla fija) para diferencia Formas−Lalo: intervalo aproximado del 95% **[−59,+11]** Top3, **[−81,+3]** Top5, **[−72,+12]** Top10. Todos cruzan cero.

### Interpretación

- VT2 **no mejoró a Lalo** en el acumulado: quedó por debajo en Top3, Top5 y Top10.
- El motor de formas **selecciona candidatos diferentes**: 257 cabezas exclusivas en Top10; no es sólo un reordenamiento de Lalo.
- Las formas de dos casillas tienen pocas topologías (horizontal, vertical y dos diagonales). El gran número de posibles ubicaciones puede diluir la selectividad geométrica, lo que hace indispensable el control neutral.
- Los resultados **no justifican integrar VT2 Formas Primero al motor oficial** ni atribuir ventaja predictiva. Conservarlo separado en Experimental para investigación prospectiva, manteniendo el histórico PRE y la evaluación POST.
- Tampoco permiten asegurar que el usuario vaya a conseguir una ganancia jugando estos números.

Archivos de detalle `cortes-*.json` y `resumen-*.json` disponibles como tres artefactos de CI (jun-jul, ago-sep, octubre); el comparador completo se conserva en `scripts/lab-formas-primero-vt2-periodos.ts`. Auditoría consolidada generada por análisis independiente de los JSON para cotejar el pareado y el bootstrap.
