# Rescate experimental: Top3/5/10 por familias + propuestas VT4 desde VT3 (roce/azar)

**11/10/2026**. Rama exclusiva `auditoria-sorteo-10oct-2026`, sin modificar `main`, motor oficial, selector ni APK.

**El usuario fijó las reglas:**
- Los Top 10, Top 5 y Top 3 son **familias**, no lecturas numéricas sueltas. La orientación inversa de la misma huella física es **ACIERTO**; la memoria no penaliza invertir.
- VT4 no debe quedar vacía por escasez de antecedentes históricos. Se pueden proponer familias VT4 extendiendo una VT3 por una cuarta cifra de **roce** o de **azar** según el respaldo; pero la hipótesis numérica sin cuatro celdas legítimas no se presenta como ruta físicamente verificada.
- La selección en capas deberá separar V7/V8/V9 como observadores, V13 como ordenador por familia y V12/V14 como árbitros que puedan abstenerse.

## Ejecución y artefactos

Construido y probado un prototipo PRE/POST separado, listo para examinar **145 cortes históricos** de 29 jornadas con cuatro políticas:
- `SOLO_DIRECTA`: 10 VT4 físicamente trazadas;
- `VT3_ROCE`: prolongaciones 3→4 con una celda vecina al extremo de una VT3, **dentro de la misma fuente**, sin saltos, huecos ni reuso;
- `VT3_AZAR`: semilla fija SHA-256, un dígito insertado al comienzo/final de una VT3; **es solo proyección numérica** si no tiene cuarta celda disponible;
- `MIXTA`: lista de 10 con 4 directas, 3 por roce y 3 por azar (proporción **experimental**, no aprendida ni recomendada).

Las listas son familias reversibles de cuatro dígitos con **un puesto por pareja numérica**, soportadas por **todos los recorridos físicos** que forman la lectura (no solo un trazo ilustrativo), cada recorrido con fuente y celdas. Es indispensable mantener la distinción entre familia numérica de lecturas y huella geométrica exacta; no igualar arbitrariamente dos geometrías de fuentes distintas. Top3 ⊂ Top5 ⊂ Top10. 580 listas, 5.800 propuestas.

Congelado `PROPUESTAS_VT4_PRE_CERRADAS.json` **antes de ejecutar el evaluador POST**, con SHA256:
`de4dbe05e31a88364ef37c14457c032fcd9be9c873b26a918746aafb13e6b104`.

Se registraron en las familias seleccionadas **9.051 apariciones de huellas reales** en los 145 cortes. **1.885** propuestas de tipo azar en sus listas; **527** tenían además un recorrido de cuatro celdas saliendo físicamente de su raíz VT3; **1.358** no lo tenían. En la interfaz se distinguen con transparencia. Ningún acierto de proyección numérica alimenta memoria V9 de recorridos físicos si no tiene cuarta celda real.

## Resultado retrospectivo por cabeza completa (cinco jurisdicciones argentinas por corte)

| Política | Top 3 | Top 5 | Top 10 |
|---|---:|---:|---:|
| VT4 directa | 0/145 | 0/145 | **2/145** |
| VT3 + roce | 0 | 0 | 0 |
| VT3 + azar | 0 | 0 | **1/145** |
| Mixta 4/3/3 | 0 | 0 | 0 |

Los **tres** casos de las políticas individuales corresponden a septiembre; **octubre 0/45 en las cuatro**. El único Top10 azar que coincidió con cabeza completa también tenía una prolongación física válida; no se encontró un acierto exclusivamente virtual. **No hay demostración de predictibilidad ni evidencia de ventaja de la mezcla**. El desempeño anterior V13 (1/45 VT4 top10 en octubre con otro selector) no debe compararse como si fueran mismos rankings.

Ejemplo físico del 10/10 antes de Primera, Top3 MIXTA:
1. `3567/7653`: cuatro celdas directas y **cinco** recorridos físicos válidos de esa familia.
2. `5346/6435`: VT3 D−7 prolongada por roce, **cuatro** recorridos válidos.
3. `0643/3460`: una cuarta cifra `0` agregada por azar a la VT3; **cero** rutas VT4 físicas para esa familia en esa hoja. Está rotulada explícitamente como proyección, NO como acierto de ruta.

## Pruebas

- PRE independiente de cabezas posteriores; `1_construir_pre.py` no abre POST. `2_evaluar_post.py` verifica el digest y luego abre POST.
- 5.800 propuestas y listas anidadas y sin familias numéricas repetidas.
- Todas las 4-celdas DIRECTA/ROCE verificadas con el universo exhaustivo VT4 anterior; rutas de cada familia agrupadas por fuente/huella, no se descartan alternativas ni inversas.
- Visor HTML PRE y página HTML POST probados en Chromium: cambiar fecha/turno/método, escoger propuesta azar y comprobar falta de recorrido, escoger familia roce y alternar todas sus rutas, sin errores JS.
- ZIP comprobado íntegro (17 archivos).

Entregas en chat:
- `rescate_vt4_familias_v13_145/ANTES_VT4_FAMILIAS.html`
- `rescate_vt4_familias_v13_145/DESPUES_COTEJO_VT4.html`
- `rescate_vt4_familias_v13_145/INFORME_VT4_Y_ARQUITECTURA.md`
- `modelo-papa-familias-vt4-roce-azar-145-cortes.zip`, incluye scripts, inventario exhaustivo, PRE/POST JSON y copias de fuentes.

**Decisión:** arquitectura correcta; rescatar generación extendida como **propuestas experimentales** y catalogar su clase. La proporción 4/3/3 NO ha demostrado ventaja y NO debe pasar a producción. El V13 renovado debe ordenar familias completas y V12/V14 decidir con evidencia cuándo usar extensión física, cuándo permitir azar y cuándo abstenerse; se necesitan verdaderos controles cronológicos adicionales, sin fugas. 