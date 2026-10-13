# Punto de control VT3 — equilibrio por nacimiento, convergencia y continuidad
**13 de octubre de 2026.** Rama `lab-vt3-equilibrio-estados-13oct2026`. GitHub Actions completado: [38357340232](https://github.com/y0t3/Modelo-Papa/actions/runs/38357340232).

## Alcance real
14 políticas PRE fijadas en `PROTOCOLO_VT3_EQUILIBRIO_ESTADOS_13OCT2026.md` y evaluadas por `scripts/lab-vt3-equilibrio-estados.mjs`. 23 fechas históricas, 115 cortes, 10 familias por selección; original intacto. Ninguna variante se instala en producción; no se cambia `main`, motor Lalo, hoja física, Top sellados, APK ni VT4.

Cada familia se clasifica por el inventario físico PRE ya auditado:
- **NACE_FISICAMENTE**: aparece por primera vez en la nueva fuente disponible.
- **CONVERGE_FUENTES**: ya estaba formada en una fuente anterior y también aparece en la nueva.
- **YA_PRESENTE**: sigue físicamente en las fuentes anteriores, sin aparecer en la fuente nueva.
- **INICIAL (Previa)**: sin transición intradía comparable.

La clasificación no transforma un roce con otra familia en raíz y **no** prueba que una cabeza futura saldrá. Se conservan todos los recorridos y el orden del ranking entre familias seleccionadas; primeras 3/5 originales protegidas según método. Las candidatas no ancladas explícitas ocupan sólo una o dos plazas finales.

## Resultados absolutos, 115 cortes

| Política | Top3 | Top5 | Top10 | Rescates / pérdidas Top10 contra original |
|---|---:|---:|---:|---|
| Oficial | 5 | 8 | **15** | — |
| Mínimo 1 anclada de cada estado; primeros tres protegidos | 5 | 8 | 15 | 0/0 |
| Mínimo 2 ancladas por estado; primeros tres protegidos | 5 | 8 | 15 | 1/1 |
| Mínimo 3 ancladas por estado; primeros tres protegidos | 5 | 8 | **12** | 1/4 |
| Mínimo 2; primeros cinco protegidos | 5 | 8 | 15 | 1/1 |
| Mínimo 2; sin protección | 5 | 8 | 15 | 1/1 |
| Máximo 6 de un estado, tres primeros protegidos | 5 | 8 | 15 | 1/1 |
| Mínimo 1 + un cupo físico con puente | 5 | 8 | 16 | 1/0 |
| Mínimo 2 + un cupo físico con puente | 5 | 8 | 16 | 2/1 |
| Mínimo 2 + un cupo físico joven | 5 | 8 | 16 | 2/1 |
| Mínimo 2 + dos cupos físicos con puente | 5 | 8 | **13** | 3/5 |
| Sólo un cupo físico con puente (control previo) | 5 | 8 | 16 | 1/0 |
| Sólo dos cupos físicos con puente (control previo) | 5 | 8 | **17** | 2/0 |
| Mínimo 2, elegibles de la clase por hash fijo (control) | 5 | 8 | 15 | 1/1 |

Cuotas mínimas de 1/2/3 alteraron los diez nombres del Top en respectivamente **44/69/85 cortes** (al menos una familia diferente), sin beneficio neto. Tres cupos de cada estado obligaron a introducir 225 exposiciones de familia al Top a lo largo de los cortes, desplazando cuatro cortes antes acertados.

### Balance + físico sin raíz
- `M2_P3_BRIDGE1`: dos rescates (**21/09 Primera**, **29/09 Nocturno**) y una pérdida (**18/09 Nocturno**), Top10=16. El balance no mejora frente a `OPEN_BRIDGE1_ORIG`, que mantiene Top10=16 **sin pérdidas**.
- `M2_P3_BRIDGE2`: tres rescates (**16/09 Matutino**, **21/09 Primera**, **29/09 Nocturno**) y **cinco** pérdidas; Top10=13. El `OPEN_BRIDGE2_ORIG` sin cuotas logró 17.
- La alternativa sin equilibrio de dos cupos, Top10=17, superó a la original por +2 en esta muestra, pero en 20.000 permutaciones de jornadas completas una ganancia igual o superior apareció ~**31,5%** de las veces (cola exploratoria pareada 0,31493). **No hay ventaja predictiva demostrada.**

Por mes:
- Original Sep 10/70, Oct 5/45.
- Mínimo dos Sep 10/70, Oct 5/45.
- Mínimo tres Sep 7/70, Oct 5/45.
- Mínimo dos + dos puentes Sep 8/70, Oct 5/45.
- Sin cuotas + dos puentes Sep 12/70, Oct 5/45.

Por turno, con mínimo dos ancladas: Previa 3, Primera 1, Matutino 8, Vespertino **0**, Nocturno 3. No resuelve el atasco de Vespertino; la estrategia de cuota no es un remedio general.

## Nocturna 12/10, diagnóstico POST *conocido*
Construida a partir del PRE físico original de ese corte y de perfiles históricos, no usa sus cabezas en construcción de políticas. Es una **simulación retrospectiva**, nunca sustituye el PRE real sellado el 12/10 a las 18:56.

| VT3 objetivo | Estado físico PRE | Original | Mínimo 3 (primeros 3 protegidos) | Resultado general de la cuota |
|---|---|---|---|---|
| 851 (158/851) | YA_PRESENTE en Primera, sin raíz anclada | No admitida | No admitida | No recuperada por ninguna política |
| 615 (516/615) | CONVERGE_FUENTES, dos fuentes y raíz D−7 | Puesto 54 | Fuera de Top10 | No recuperada por ninguna cuota |
| 242 (242/242) | NACE_FISICAMENTE en Vespertino, anclada D−1 | Puesto 25 | **Puesto 9** | Mínimo 3 la selecciona, pero baja de 15 a 12 cortes globales |
| 290 (092/290) | No figura físicamente en PRE | Fuera | Fuera | Sin camino |
| 264 (264/462) | No figura físicamente en PRE | Fuera | Fuera | Sin camino |

El control por hash de familias de cada estado coloca 242 en el puesto 10 en esa Nocturna, pero sólo empata Top10 global 15. **No escoger políticas según qué acertaron en un sorteo conocido.**

## ¿Qué quedó demostrado y qué no?
- Se puede describir auditablemente el flujo físico de cada familia sin alterar lo ocurrido ni atribuirle resultados.
- **No hay evidencia de que reservar un número fijo de plazas a nacimientos, convergencias y continuidad aumente el rendimiento**; cuotas intensas desplazan familias correctamente seleccionadas.
- La carencia de raíz (851) y la ordenación deficiente de una candidata ya anclada (615, 242) siguen siendo problemas lógicamente separados.
- Priorizar un estado porque explica una cabeza conocida pierde en otras fechas. Pese a 20.000 controles de reasignación, toda la investigación fue sobre las **mismas 23 jornadas reutilizadas para diseñar hipótesis**; no se puede afirmar pronóstico por encima del azar.

## Próximo enfoque acotado
No seguir probando porcentajes arbitrarios de estados. Mejor analizar las **transiciones concretas de una familia** entre turnos y fechas: primera fuente física, si una ruta nueva es realmente propia o sólo la misma familia en otro bloque, cambios de genealogía D−1/D−7 y cuáles de esos cambios son preexistentes al corte. Contar NEGATIVOS semejantes a 851/615/242 y evaluar *riesgo de excluir candidatas*, no sólo rescates. El observatorio puede mostrar `NACE/CONVERGE/YA_PRESENTE` sin hacer pasar ese atributo descriptivo por probabilidad.

## Evidencia
- `auditorias/vt3-equilibrio-estados-115-13oct2026/PRE_115.json` con todas las selecciones y atributos físicos, sin objetivos.
- `SELLO.json` con hashes de insumos, código, protocolo, PRE y Nocturna PRE.
- `POST_115.json` todos los cortes; `RESUMEN.json` desgloses por mes, turno, ganancias, pérdidas, controles de 22 desplazamientos y 20.000 permutaciones completas.
- `NOCTURNA_PRE.json` y `NOCTURNA_POST.json` aislados.
- [Workflow GitHub Actions 38357340232](https://github.com/y0t3/Modelo-Papa/actions/runs/38357340232).
