# Modelo Lalo · Bitácora de marcas ganadoras de ambas hojas

**Laboratorio aislado:** `lab/registro-marcas-doble-hoja-21oct2026` · **21 de octubre de 2026**. Motor MV1 congelado, Tops y APK de producción **sin modificaciones**.

## Objetivo

Reproducir el trabajo manuscrito del padre sin añadir pronósticos artificiales: **marcar después de cada sorteo las terminaciones realmente publicadas** por las seis jurisdicciones del tablero principal y ver todos sus recorridos en ambos tableros. VT2, VT3 y VT4 son modalidades de acierto igualmente válidas; ninguna se elimina del registro.

Separar tres clases de información que **NO son equivalentes**: 1) un candidato es físicamente construible antes de sortear; 2) después de sortear, una cabeza efectivamente publicada permite marcar esa terminación exacta; 3) aparece una nueva fuente física al incorporarse otro turno del auxiliar. Las marcas y los cambios de fuentes no alteran automáticamente el ranking MV1.

## Geometría y temporalidad

**Hoja +11:** cada recorrido VT2/VT3/VT4 permanece dentro de una columna de origen; solamente fuentes previas al turno objetivo. No cruzar columnas.

**Hoja auxiliar:** Santiago (fila 0) y Neuquén (fila 1), Previa / Primera / Matutino consecutivas: grilla **2×12**, cabezas crudas **sin +11**; sí se puede atravesar una frontera entre turnos **por contacto físico**, horizontal/vertical/diagonal, sin saltos, huecos ni reutilización. Antes de Previa no hay cifras; antes de Primera hay Previa; antes de Matutino, Previa y Primera; antes de Vespertino y Nocturno, las tres columnas completas cuando se publicaron.

**POST exacto:** solo las últimas 2, 3 o 4 cifras de cabezas **realmente salidas en Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos o Montevideo**. Para localizar sus recorridos no se invierte arbitrariamente la terminación observada. La familia reversible sirve en consultas de candidatos, pero no sustituye el sufijo exacto de una cabeza publicada. VT4 solo vale como cuatro cifras exactas, sin invertir el número completo para inventar una nueva madre VT3.

**Regresión del proveedor:** Vivitusuerte 20/10: Santiago **8067 / 6142 / 9634** y Neuquén **0469 / 0245 / 0210**, en turnos Previa / Primera / Matutino.

## Funcionalidad implementada en la rama de laboratorio

- Módulo puro `src/auxMarkLedger.ts` que devuelve una bitácora POST con **cada evento cabeza × jurisdicción × turno**, sus recorridos VT2, VT3 y VT4 en las dos hojas, si cruza turnos, fuentes físicas y evolución de disponibilidad PRE por corte.
- La pestaña experimental `AUX` abre por defecto el modo **«Todas las marcas ganadoras»** con trazos simultáneos mediante **tres barras de color en cada celda** (VT2 rosa, VT3 turquesa, VT4 amarillo, ajustados al modo claro/oscuro); el número no queda tapado por líneas. Los filtros VT2/VT3/VT4 son activables independientemente. Se pueden tocar las cabezas realmente publicadas para inspeccionar todos los recorridos exactos individualmente.
- Modo alternativo **«Seguir familia»**: permite explorar gráficamente terminaciones o familias que aún no han salido, pero claramente separadas del modo POST para no convertir una hipótesis en una marca ganadora.
- Tabla de evolución PRE: primeras familias físicas disponibles y familias que **acaban de pasar a dos fuentes distintas**. Una ruta nueva dentro de una fuente no equivale a una segunda fuente; tampoco lo equivale seguir viendo dos fuentes sin que haya entrado otro turno.

La pantalla utiliza el turno seleccionado como **corte de revisión**, no carga ni ilumina futuras cabezas de destino. Cada evento histórico se comprueba contra el tablero PRE de **su propio turno**, evitando dibujar una cabeza antigua con posiciones que todavía no existían al sortear. La bitácora es visual/auditora, **no un motor de predicción adicional**.

## Validación técnica

`scripts/lab-aux-bitacora-test.ts` pasa 18 comprobaciones de recorrido, fuente, modo VT2/VT3/VT4, detección de cruce, no inversión de cabeza observada, contador de fuentes y **no contaminación** por cabezas que salgan en turnos posteriores.

Ejemplo sintético fundamentado en geometría del 20/10:

| Cabeza observada | Recorridos exactos VT2 auxiliar | VT3 auxiliar | VT4 auxiliar |
|---|---:|---:|---:|
| Vespertino Entre Ríos `4066` | 2 | 2 | 2 |
| Nocturno Ciudad `2697` | 1 | 3 | 1 |
| Nocturno Provincia `7310` | 2 | 1 | 0 |

El test comprueba específicamente que `2697` tiene una ruta VT3 **697** por dos bloques auxiliares contiguos. No iluminar `796` como si hubiera sido el sufijo exacto del ganador `2697`.

## Cotejo real del 1/09 al 20/10/2026

**43 jornadas, 215 cortes PRE reconstruidos, 1.152 cabezas publicadas**. Se reconstruyó la columna Nocturna anterior de +11 para cada día, se usó Vivitusuerte para las tres franjas auxiliares, se marcaron POST los resultados de las seis jurisdicciones y se registraron rutas y fuentes. Errores de descarga: **0**.

| Modalidad | En +11 | En auxiliar | En ambas | Solo auxiliar | Unión de hojas |
|---|---:|---:|---:|---:|---:|
| **VT2 exacto** | 703 | 398 | 284 | 114 | **817** |
| **VT3 exacto** | 294 | 154 | 44 | 110 | **404** |
| **VT4 exacto** | 93 | 42 | 3 | 39 | **132** |

Las **cabezas con al menos una ruta exacta que CRUZA franjas auxiliares** fueron 83 (VT2), 41 (VT3), 15 (VT4). Una cabeza puede aparecer en varias modalidades; estos totales **no se suman** para informar cabezas únicas ni apuestas ganadas.

El total de **rutas físicas POST** en el auxiliar: 766 VT2, 272 VT3 y 74 VT4. Muchas rutas pueden explicar **la misma cabeza**; no son señales estadísticamente independientes ni votos extras.

### Cómo creció la segunda hoja (suma de 43 días)

| Corte PRE | Nuevas familias VT2 formables | Nuevas familias VT3 formables | Nuevas familias VT4 formables |
|---|---:|---:|---:|
| Previa | 0 | 0 | 0 |
| Primera (tras Previa) | 477 | 1.449 | 4.813 |
| Matutino (tras Primera) | 448 | 2.001 | 9.662 |
| Vespertino (tras Matutino) | 321 | 1.709 | 8.573 |
| Nocturno | **0** | **0** | **0** |

Estas cifras son **registros familia × corte** de *primera aparición física*, no familias únicas a través de todos los días ni candidatos que hayan ganado.

Las familias que pasaron **por primera vez a tener dos o más fuentes**: VT2, 247 antes de Matutino y 260 antes de Vespertino; VT3, 976 y 959; VT4, 6.121 y 5.813. Todos son contadores **geométricos** sobre el universo de recorridos posibles; no representan predicciones certeras, apuestas ni aportes independientes de cada ruta. Las familias multifuente **persistentes** se siguen observando, pero no se vuelven a contar como respaldo recién nacido.

### Día de control: martes 20/10/2026

| Corte PRE | Celdas auxiliar | Familias VT3 recién formables | VT3 recién multifuente |
|---|---:|---:|---:|
| Previa | 0 | 0 | 0 |
| Primera | 8 | 28 | 0 |
| Matutino | 16 | 45 | 22 |
| Vespertino | 24 | 49 | 33 |
| Nocturno | 24 | 0 | 0 |

Entre las **27 cabezas publicadas** ese día hubo 15 VT2 físicamente formables en +11 y 6 en auxiliar (unión 17); 7 VT3 en +11 y 3 en auxiliar (unión 10); 4 VT4 exactos en +11 y 2 auxiliares (unión 6). No equivalen a pronósticos anteriores sellados.

Casos auxiliares VT3 exactos: `4066 → 066`, `2697 → 697`, `7310 → 310`. Caso de cruce VT4: `2697`, con ruta física de cuatro celdas.

## Interpretación y decisión

1. **Reproducción visual:** mejorada y comprobada. Ahora VT2, VT3 y VT4 aparecen juntas, usando exclusivamente las cabezas realmente publicadas, sin perder ni confundir los cruces legales de la auxiliar y la prohibición de cruces en +11.
2. **Aporte geométrico:** real. La hoja auxiliar explica físicamente resultados que +11 no explica, y el límite de Matutino permite distinguir nuevas fuentes de permanencias.
3. **Mejora predictiva:** NO demostrada con este estudio. Los contadores POST y de familias físicamente formables no justifican prioridades nuevas ni ganancias monetarias. La quiniela sigue siendo aleatoria.
4. **Regla de desarrollo:** mantener MV1, Tops y APK intactos; conservar solo la pantalla AUX ampliada dentro del laboratorio hasta la revisión visual del usuario.
5. **Próximo contraste:** comparar para cada *evento ganador anterior* la forma física que deja en su hoja original, el turno en que reaparece en la actual y si su posterior reaparición tiene relación estable con aciertos del Top; hacerlo en cortes históricos realmente sellados o con controles de igual número de terminaciones.

## Código y ejecución

- `src/auxMarkLedger.ts`: bitácora y cambios de respaldo.
- `src/ui/AuxiliarySheetPanel.tsx`: superposición coloreada y filtros.
- `scripts/lab-aux-bitacora-test.ts`: pruebas de corrección geométrica y temporal.
- `scripts/lab-aux-bitacora-historica.ts`: registro de 43 jornadas, 215 cortes.
- `.github/workflows/lab-bitacora-doble-hoja.yml`: ejecución reproducible.
- **GitHub Actions aprobada:** https://github.com/y0t3/Modelo-Papa/actions/runs/39658242784

**Estado:** estudio descriptivo reproducible terminado. Ningún cambio en `main` ni nueva APK de producción.
