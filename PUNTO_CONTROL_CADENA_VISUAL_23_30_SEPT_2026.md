# Modelo Papá — Punto de control: cadena visual 23–30/09/2026

Fecha de verificación: 10/10/2026. Rama: `experimento-analisis-visual-5d`.

## Punto de partida preservado
El análisis anterior **29→30 de septiembre** quedó intacto: después de cerrar 29 había 37 caminos marcados (VT2=23, VT3=12, VT4=2); antes de Primera del 30 cabían 17 de esos caminos (VT2=11, VT3=6). Dos contactaban marcas de Previa 30, pero **ninguno** era la huella `54→10`. La cabeza posterior `0910` confirmó `10`, sin que existiera antes criterio visual suficiente para preferirla. **No contar como predicción acertada.**

## Qué se ejecutó en esta continuación
Se añadió `scripts/run-visual-chain7d.cjs` a la rama experimental y se integró en `.github/workflows/visual-marked-sheets7d.yml`. Reconstruye **siete hojas marcadas completas** (23, 24, 25, 26, 28, 29 y 30/09; domingo no sorteado), **seis transiciones entre jornadas reales** y **30 cortes antes de cada turno**, con archivos HTML/JSON de cada hoja y pareja.

Las marcas de una hoja sólo existen DESPUÉS de la cabeza conocida. Todas las rutas VT2/VT3/VT4 válidas se conservan con cabeza completa, turno, columna, orden de celdas y cifras. La proyección sobre la tabla siguiente conserva exactamente las celdas y origen; no crea rutas desde tableros vacíos, no cruza columnas y no otorga puntuaciones.

El ensayo enmascara las cabezas del objetivo y posteriores en cada corte y comprueba que la relectura no cambia. Es una **reconstrucción retrospectiva con censura causal**, no una predicción prospectiva sellada.

**Acción GitHub concluida correctamente:** https://github.com/y0t3/Modelo-Papa/actions/runs/38041829318

**Artefacto de siete hojas y comparadores:** https://github.com/y0t3/Modelo-Papa/actions/runs/38041829318/artifacts/11665942432

En el ZIP abrir `index.html`; `CADENA_CORTES_CAUSALES.json` conserva todos los cortes y `CADENAS_TRES_JORNADAS.md` / `.json` registran tanto supervivencias como fallas.

## Contacto entre huellas en el corte antes de Primera
| Fechas | Rutas heredadas | Contactan marcas previas del día | Misma huella ya marcada |
|---|---:|---:|---:|
| 23→24 | 26 | 16 | 0 |
| 24→25 | 33 | 12 | 0 |
| 25→26 | 25 | 8 | 0 |
| 26→28 | 31 | 4 | 0 |
| 28→29 | 46 | 0 | 0 |
| 29→30 | 17 | 2 | 0 |

La densidad de contactos varía mucho. No sirve por sí sola como selector, ni permite elegir retrospectivamente el `10`.

## Dos ejemplos completos de cadena de tres fechas, NO seleccionados por sus resultados futuros
- **VT3 / `prevNocturno` / celdas `2:0→2:1→3:1`:** 28/09, cabeza `1760`, marca `760`; 29/09, relectura `289` y marca de cabeza `7289` en Matutino; 30/09, relectura `877`. No se comprobó una nueva marca ganadora de esta misma huella el 30.
- **VT2 / `prevNocturno` / celdas `0:1→1:1`:** 28/09, `49` (entre otras, de `2949` y `7949`); 29/09, `83` confirmado por cabeza `4983` de Primera; 30/09, relectura `58`. No se comprobó una nueva marca ganadora de esta misma huella el 30. Las distintas cabezas del 28 que comparten camino NO son distintos caminos.

## Control contra sesgo de supervivencia: TODAS las geometrías que se remarcaron dos días seguidos
Se deduplicó por **modalidad + columna de origen + celdas ordenadas**, sin confundir caminos con cabezas o sorteos independientes. Luego se comprobó contra todas las marcas de la tercera jornada, por separado de su lectura anterior.

| Tres fechas | Geometrías marcadas tanto primera como segunda | Marcadas también tercera |
|---|---:|---:|
| 23→24→25 | 7 | 0 |
| 24→25→26 | 9 | 0 |
| 25→26→28 | 1 | 0 |
| 26→28→29 | 6 | 0 |
| 28→29→30 | 3 | 0 |
| **Total de secuencias en trios solapados** | **26** | **0** |

Este 0/26 **no determina la duración natural de una formación**, ni es probabilidad estimada: los tríos se solapan y la muestra es corta. Es un contraste descriptivo contra promocionar cualquier huella sólo por haberse marcado dos veces.

## Lo que falta — siguiente paso exacto
Inspección visual cualitativa del conjunto de marcas en estos siete días para estudiar **desplazamiento, giro, bifurcación, concentración y cambios de columna de origen**, siempre sin pegar celdas de columnas distintas dentro de una misma ruta. Empezar por casos positivos y negativos de todos los turnos; documentar tanto las figuras llamativas como las alternativas que no se confirmaron. Antes de cualquier criterio de elección, definirlo SIN usar el resultado que se pretenda anticipar. Si no distingue: **OBSERVAR / NO JUGAR**.

No se cambió `main`, la APK oficial, el selector congelado ni la lógica predictiva principal. No se derivó fórmula, puntuación o TOP de estos casos.
