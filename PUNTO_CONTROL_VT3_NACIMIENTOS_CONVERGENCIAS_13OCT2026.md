# Punto de control VT3 — nacimientos, convergencias y admisión física
**13/10/2026** — Proyecto Modelo Papá. Rama aislada `lab-vt3-nacimientos-convergencias-13oct2026`. Acciones: [corrida final](https://github.com/y0t3/Modelo-Papa/actions/runs/38354891275). Ningún cambio al motor oficial, Top sellados, hoja, `main`, APK ni VT4.

## Qué se verificó
Protocolo fijado en `PROTOCOLO_VT3_NACIMIENTOS_CONVERGENCIAS_13OCT2026.md`, script `scripts/lab-vt3-nacimientos-convergencias.mjs`. 23 días históricos, 115 cortes PRE, inventario físico completo auditado, misma bolsa original para alternativas ancladas y máximo **10 familias** incluso al admitir una familia no anclada. Las familias sin raíz NO se presentan como trasladadas ni se les fabrican raíces. Las familias de prueba física ingresan al último o últimos dos puestos para no atribuirles falsa prioridad Top3.

Se comprobaron por **aserción** todos los recorridos de familias que permanecen en fuentes antiguas entre cortes sucesivos: mismas fuentes, mismas celdas canónicas y estado anclado/no anclado. No desaparecieron ni cambiaron; por tanto, el cambio intradía es inequívocamente la aparición de una fuente física adicional. Nacimiento/convergencia son propiedades espaciales PRE, no profecías.

- NACE_FISICAMENTE: primera aparición de familia en última fuente (si no había rutas en fuentes anteriores).
- CONVERGE_FUENTES: nueva ruta en la última fuente para familia ya presente físicamente en fuentes anteriores.
- YA_PRESENTE: todas las rutas de la familia ya estaban en fuentes anteriores.
- INICIAL: Previa del día carece de corte anterior intradía.

## Todos los perfiles, NO sólo ganadores
Registros **familia×corte**, por lo que una familia puede contarse muchos días; las cifras no representan familias únicas.

| Estado | Ancladas, registros | Ganadoras ancladas | No ancladas, registros | Ganadoras no ancladas |
|---|---:|---:|---:|---:|
| Inicial (Previa) | 690 | 9 | 600 | 7 |
| Nace físicamente | 925 | 8 | 2.455 | 19 |
| Converge entre fuentes | 595 | 7 | 491 | 4 |
| Ya presente | 4.179 | 40 | 5.338 | 49 |

Hay familias que ya estaban físicamente presentes en un turno anterior pero que adquieren nuevos recorridos **anclados** al pasar de turno, sin que esto equivalga a nuevas confirmaciones independientes.

## 11 políticas predefinidas y Top10 a igual presupuesto
En la bolsa anclada sólo se reordena la lista oficial. En `OPEN`, la familia física sin raíz ocupa uno o dos últimos cupos, desplazando la(s) última(s) del Top original. Misma lista oficial en caso de falta de elegibles. Se preservaron **todos** los casos positivos y negativos.

| Regla PRE | Top3/115 | Top5/115 | Top10/115 | Ganadoras sin raíz añadidas |
|---|---:|---:|---:|---:|
| ORIGINAL | 5 | 8 | **15** | 0 |
| Priorizar familia anclada que converge | 5 | 6 | 14 | 0 |
| Priorizar ruta anclada en fuente nueva | 6 | 9 | 14 | 0 |
| Priorizar nacimiento anclado | 6 | 9 | 13 | 0 |
| 1 cupo para nacimiento sin raíz | 5 | 8 | 16 | 1 |
| 1 cupo para convergencia sin raíz | 5 | 8 | 16 | 1 |
| 1 cupo para juventud física de ≤2 turnos | 5 | 8 | 16 | 1 |
| 1 cupo para contacto físico con familias ancladas | 5 | 8 | 16 | 1 |
| 2 cupos jóvenes sin raíz | 5 | 8 | 16 | 1 |
| 2 cupos con contacto físico con ancladas | 5 | 8 | **17** | 2 |
| Control hash sin geometría, 1 cupo joven | 5 | 8 | 15 | 0 |

Los dos rescates únicos con contacto físico en 2 cupos fueron **16/09 Matutino** y **21/09 Primera**. No desplazaron aciertos de la lista original porque esas familias estaban en últimas plazas no ganadoras de estos cortes, pero no significa que nunca puedan desplazar ganadoras en datos no observados.

La alternativa con dos cupos de contacto físico seleccionó en total **182 exposiciones** de familias no ancladas (sobre 115 cortes), y sólo dos coincidieron con ganadoras. En controles negativos de 10.000 reasignaciones de **jornadas completas**, la diferencia Top10 +2 frente al oficial fue igualada o superada aproximadamente en **30,8 %** de los casos. Los otros rescates aislados con una plaza también son compatibles con los controles. La elección de criterios y ventanas se hizo en un histórico profundamente explorado; no hay holdout nuevo ni señal predictiva demostrada.

## Qué revela la Nocturna 12/10 ya conocida
La Nocturna del 12/10 se reconstruyó a partir del PRE físico `NOCTURNA_SIMULACION.json`, **sin utilizar sus cabezas objetivo en la fase de PRE**. El POST se aplicó solamente después del sellado del diagnóstico. Esta simulación fue creada retrospectivamente en 13/10 y **no reemplaza el auténtico PRE sellado a las 18:56 el 12/10**.

| VT3 objetivo | Qué había físicamente en la hoja PRE | Original | En política de ancladas |
|---|---|---|---|
| `851` / familia `158/851` | YA PRESENTE: Primera; 2 transiciones desde su primera aparición; **sin anclaje**, un bloque y una fuente. Compartía segmentos físicos con recorridos de 8 familias ancladas (NO equivale a tener 8 raíces). | Ausente del Top / bolsa | Ninguna política OPEN la escogió |
| `615` / familia `516/615` | CONVERGE_FUENTES: presente desde Primera, 2 fuentes; raíz D−7 y segundo apoyo físico en la última fuente. | Puesto **54** | Priorizar ancladas convergentes: **puesto 4** |
| `242` / familia palíndroma `242/242` | NACE_FISICAMENTE: fuente Vespertino, 0 turnos de antigüedad; ruta anclada propia D−1. | Puesto **25** | Priorizar ancladas con fuente nueva: **puesto 3** (también nacimiento anclado, puesto 3) |
| `290` / `092/290` | No existe camino físico PRE | Fuera | Fuera |
| `264` / `264/462` | No existe camino físico PRE | Fuera | Fuera |

Las prioridades *no son intercambiables*: en 115 cortes priorizar ancladas convergentes logró 14 Top10 (vs 15), y priorizar nacimientos anclados logró 13 (vs 15). Seleccionar a posteriori la que rescata 615 o 242 no constituye anticipación. El contacto de 851 con ocho familias ancladas mide proximidad física, **no nacimiento**, ni convergencia ni aval histórico; darle raíces prestadas violaría las reglas.

## Conclusión operativa
La distinción nueva es real y verificable:
1. **Nacer físicamente ahora** no es lo mismo que recibir una raíz ahora.
2. **Converger desde dos fuentes** no significa repetir la misma cifra o confirmar dos sorteos; son rutas físicas actuales.
3. **Ya presente** no implica que la forma esté agotada, ni que ocho contactos físicos deban contar como ocho confirmaciones.
4. **Admisión** (entra a la bolsa VT3) y **ordenación** (llega al Top10) siguen siendo dos problemas diferentes.

La señal morfológica ayuda a diagnosticar, pero aún no selecciona ganadores sistemáticamente mejor. Próxima dirección razonable: investigar **composición de dos estados** (nacimiento y convergencia de fuentes) frente a uno solo, bajo cuota fija y controles; evitar una política hecha a medida de 615/242. Alternativamente, mejorar el observatorio PRE para que indique por familia `INICIAL`, `NACE`, `CONVERGE`, `YA_PRESENTE` y las fuentes/recorridos sin modificar puntuación oficial.

## Ubicación
- `auditorias/vt3-nacimientos-convergencias-115-13oct2026/PRE_115.json` generado con objetivos POST fuera del directorio, junto con `SELLO.json`.
- `POST_115.json`, `RESUMEN.json`, `NOCTURNA_PRE.json`, `NOCTURNA_POST.json` y la ejecución [GitHub Actions 38354891275](https://github.com/y0t3/Modelo-Papa/actions/runs/38354891275).
