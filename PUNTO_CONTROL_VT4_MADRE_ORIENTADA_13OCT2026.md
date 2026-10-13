# Punto de control VT4 · familia formada por madre VT3 orientada

**13/10/2026 · Rama `lab-vt4-familia-madre-orientada-13oct2026`**. Ejecución GitHub Actions [38455223431](https://github.com/y0t3/Modelo-Papa/actions/runs/38455223431), **completada correctamente**. El TypeScript de la aplicación compila sin errores (`npx tsc --noEmit`). Cambio en `src/motorLalo.ts` **únicamente en rama laboratorio**, sin modificar `main`, predicciones antiguas, app instalada ni sellos históricos.

## Corrección solicitada

**VT4 vieja:** toma ruta física completa `3226` y agrupa la inversión total `6223`, aunque esto **no conserva** el lugar fijo de la nueva cifra con respecto a la familia VT3 `226/622`.

**VT4 nueva:** reconoce madre física `226/622`, cifra adicional `3` y posición de ampliación como propiedades esenciales de la agrupación:
- Añadir al **principio**: `3+226=3226`; invertir solamente madre y mantener el 3 al comienzo: `3+622=3622`; familia **`3226/3622`**.
- Añadir al **final**: `226+3=2263`; invertir madre: `622+3=6223`; familia **`2263/6223`**.
- **Jamás** colocar `6223` como inverso del primero `3226`, ni `3622` como inverso del segundo `2263`. Son **dos ramas maternas diferentes**.
- Solamente registrar variantes que existen en **caminos de cuatro celdas físicas contiguas de una sola fuente**, derivados de tres casillas exactas de su madre VT3 admitida. Una etiqueta de familia describe variantes teóricas de la madre, no dice que ambas tengan testigos físicos; para `3226/3622`, la prueba encontró **ambas variantes físicas**.
- Para la identidad de agrupación emplear `madre VT3 canónica + cifra agregada + lado prefix/suffix`; todas las rutas con sus madres reales, cifras y celdas se guardan como testigos. No inventar una cuaterna ni traslado histórico.

## Resultado de la primera ejecución real

Se reconstruyeron Primera y Matutina 13/10 desde las mismas entradas PRE del experimento anterior y se volvió a verificar el archivo VT3 de Matutina **sellado a las 13:52**, SHA256 `067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41`. VT3 y sus diez madres top permanecen idénticas a las antiguas. No se utilizaron cabezas futuras para escoger VT4.

| Turno | Familias VT4 anteriores | Agrupaciones nuevas VT4 por madre | Resultado Top10 |
|---|---:|---:|---|
| Primera | **67** | **94** | **10 familias reagrupadas; hijas de madres VT3 #1–#2** |
| Matutina | **76** | **104** | **Mismo Top10 que Primera, con nuevas etiquetas** |

**MUY IMPORTANTE:** el cambio **NO liberó posiciones del Top10** por sí solo. De hecho, al preservar madre y lado se generan **más grupos**, porque una misma cuaterna física puede estar respaldada por dos madres distintas y se conserva esa procedencia, en vez de fusionarlas erróneamente como una sola pareja de inversión completa. Esto evita mezclar testimonios, pero incrementa grupos etiquetados, no el cupo de 10.

### Ejemplo de nuevo Top10 por madre

| Puesto | VT4 corregida | Madre VT3 dominante |
|---|---|---|
| 1 | `2263/6223` | `226/622` (#1) |
| 2 | `2265/6225` | `226/622` (#1) |
| 3 | `3226/3622` | `226/622` (#1) |
| 4 | `5226/5622` | `226/622` (#1) |
| 5 | `2266/6226` | `226/622` (#1) |
| 6 | `6226/6622` | `226/622` (#1) |
| 7 | `3056/5036` | `305/503` (#2) |
| 8 | `6305/6503` | `305/503` (#2) |
| 9 | `3057/5037` | `305/503` (#2) |
| 10 | `7305/7503` | `305/503` (#2) |

En ambos turnos, **6 plazas siguen ocupadas por hijas de la madre #1 y 4 por la madre #2**. No desaparece el efecto de congelación del Top10: está causado por dar prioridad absoluta al ranking de madres sobre diversidad de hijas, no por la inversión VT4 únicamente.

## Dos casos del día que verifican la procedencia

- **Primera Ciudad `5485`**: físicamente representable por dos caminos completos. Nueva agrupación por madre `485/584` (#5) → familia `5485/5584`, puesto **52**. También por madre `548/845` (#9) → familia `5485/8455`, puesto **87**. Son **dos agrupaciones distintas** que contienen la **misma cuaterna 5485** física; no deben contarse como dos cabezas ni dos aciertos distintos. Bajo el agrupamiento antiguo `5485/5845` quedaba puesto 35. Corregir la geometría **no** rescató esta cabeza en Top10.
- **Matutina Provincia `1057`**: mantiene una cuaterna física legítima en `prevNocturno`, pero **no entra a VT4** porque ni `105/501` ni `057/750` tienen madre VT3 admitida en Top10. Cambiar el modo de invertir no corrige este cuello de botella de admisión.

La coincidencia **Montevideo 3629** ya comprobada ese día fue **VT3 Top5**, no VT4.

## Qué se validó
- `npx tsc --noEmit`: correcto.
- Para **todas** las rutas de cuatro cifras clasificadas en Primera y Matutina: cuatro celdas distintas físicamente vecinas, cifras idénticas a las de cada casilla, madre VT3 real admitida Top10, orientación y cifra añadida compatibles con la etiqueta de su nuevo grupo.
- Identidad de Top10 VT3 Matutina y tablero/raíces igual a su sello anterior al sorteo.
- Ninguna familia creada tomando inversión completa automática de VT4. La cuaterna inversa sólo podría aparecer como **otra formación** sustentada por otra madre/lado físico propios.
- Los archivos PRE anteriores y los Tops de producción siguen intactos.

## Precauciones y trabajo pendiente

1. **Agrupación y selección de plazas son dos problemas diferentes.** La primera queda corregida en laboratorio; el Top10 se sigue monopolizando por las mismas dos madres.
2. Se necesitan dos métricas distintas: **agrupaciones VT4** (madre+cifra+lado), y **cuaternas físicas distintas** que cubren las diez plazas, porque una cifra como `5485` puede estar representada en más de una agrupación. No inflar cobertura por etiquetado repetido.
3. Para mejorar variedad sin inventar resultados: estudiar una política que **limite la cantidad de hijas por madre** y rellene con hijas legítimas de madres adicionales. Compararla con VT4 original al mismo cupo real de cuaternas y sellar futuros sorteos antes de que salgan.
4. La prueba fue reconstruida **después** de Primera y Matutina: demuestra coherencia física y computacional de la nueva regla, **no** aumento de precisión prospectiva. La quiniela es aleatoria.

## Artefactos respaldados
- `src/motorLalo.ts`: nueva agrupación VT4 con madre VT3, cifra y lado preservados (solo rama lab).
- `scripts/lab-vt4-madre-orientada.mjs`: reconstruye y verifica.
- `.github/workflows/lab-vt4-madre-orientada.yml`.
- `auditorias/vt4-familia-madre-orientada-13oct2026/RECONSTRUCCION_VT4_MADRE.json` y `SELLO.json`.
- [GitHub Actions #38455223431, correcta](https://github.com/y0t3/Modelo-Papa/actions/runs/38455223431).

**No se ha instalado ni promovido el cambio a main.**
