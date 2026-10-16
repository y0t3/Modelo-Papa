# Auditoría histórica por fecha, turno y jurisdicción — 16/10/2026

**Informe de procedencia; NO introducir reglas predictivas, ni borrar históricos sellados.** La investigación se ejecutó en rama de laboratorio; la corrección visual VT4 y dos pruebas de regresión sí se incorporaron separadamente a `main`.

## El error metodológico que apareció
Los laboratorios anteriores habían eliminado las fechas **20/06/2026** y **09/07/2026** de TODO el conjunto de sorteos por interpretarlas como días sin quiniela argentina. Esto eliminó incorrectamente sorteos **legítimos de Uruguay**, cuya Nocturna es una de las seis filas del tablero +11.

La restricción correcta no es «feriado nacional = ninguna jurisdicción sorteó». La unidad de procedencia es **fecha + jurisdicción + turno real**. Un día sin cabezas argentinas puede tener una Nocturna de Montevideo que deba alimentar la hoja argentina siguiente.

## Resultado de la consulta real a Viví Tu Suerte
La auditoría `scripts/lab-auditar-historico-api.ts` consultó el proveedor de la app y contrastó sus bloques `datos[momento_*]` con las cabezas interpretadas por `descargarCabezas`. En 14 fechas distribuidas entre junio, julio y octubre:

| Fecha | Cabezas válidas informadas en total | Fuente argentina | Montevideo en fuente |
|---|---:|---|---|
| **19/06/2026** | 25 | Varias | Nocturno ausente |
| **20/06/2026 (sábado)** | **1** | Todas las casillas ausentes | **Nocturno `0963`** |
| **21/06/2026 (domingo)** | 0 | Ausente | Ausente |
| **08/07/2026** | 27 | Varias | Vespertina `8653`, Nocturno `6575` |
| **09/07/2026 (jueves)** | **2** | Todas las casillas ausentes | **Vespertina `0449` y Nocturno `0802`** |
| **10/07/2026** | 27 | Varias | Nocturno `4352` |
| **12/07/2026 (domingo)** | 0 | Ausente | Ausente |

La app utiliza los nombres internos `Matutino` (Uruguay vespertina de las 15:00) y `Nocturno`. Se preservan los ceros a la izquierda (`963` → `0963`, `802` → `0802`) y el +11 físico usa solo las dos últimas cifras.

Se almacenaron SHA-256 de la respuesta cruda y de todas las cabezas normalizadas, fechas, turnos, jurisdicciones, vacíos, alertas y comparaciones de duplicación con el día contiguo. **No se hallaron divergencias entre el bloque `datos` de la API y las cabezas normalizadas para las fechas muestreadas.**

**Limitación comprobada:** la respuesta de la API contenía claves `error` y `datos`, **sin metadatos explícitos de fecha efectiva de cada sorteo**. La fecha del parámetro consultado NO constituye por sí sola una prueba del calendario real. Una copia de una fecha anterior puede aparentar un resultado del día consultado.

## Cotejo independiente

**Fuente gubernamental DNLQ Uruguay:**
- **20 de junio (sábado), Nocturno número 963**: https://www.loteria.gub.uy/ver_resultados.php?vano=2026&vdia=20&vmes=6
- **9 de julio (jueves), Vespertino número 449 y Nocturno número 802**: https://www.loteria.gub.uy/ver_resultados.php?vano=2026&vdia=9&vmes=7

Por lo tanto, esos turnos de Uruguay **existieron realmente**, no son artefactos del proveedor, y sus cabezas deben mantenerse como datos históricos válidos.

**Fuentes argentinas secundarias en conflicto:**
- Un archivo agrupa bajo «9 de julio» resultados de Ciudad como Previa `1544`, pero el resultado se atribuye al **8 de julio** en otros registros: https://almacendedatos.com.ar/loteria/?fecha=2026-07-09 y https://elgolpedesuerte.com/pais/argentina/fechas?fecha=2026-07-08 . Por tanto, no es confirmación independiente de un sorteo argentino el 9 de julio.
- Un sitio titula «20 de junio» cabezas argentinas `1843` (Ciudad) y `6637` (Provincia), que otras fuentes identifican claramente como **19 de junio**: https://elsello.info/2026/06/20/quiniela-sorteo-de-la-previa-20-06-2026/ y https://www.eldestaperadio.com/atr/quiniela-de-hoy-resultados-de-los-sorteos-en-nacional-provincia-y-santa-fe-este-viernes-19-de-junio-20266195019 .
- No afirmar con certeza universal que *ninguna* jurisdicción argentina sorteó en esas fechas sin consultar sus archivos oficiales por jurisdicción; **el proveedor usado por la app reporta todas las cabezas argentinas ausentes para esas fechas**.

## Corrección que sí quedó integrada en main
Prueba de protección `scripts/test-historico-sorteos-parciales.ts`, agregada al workflow de pruebas estable, verifica:
- `loadPreviousDraws('2026-06-22',1,...)` conserva la Nocturna uruguaya **20/06**, y construye la fila de Montevideo **`74`** en la tabla +11.
- `loadPreviousDraws('2026-07-10',1,...)` conserva la Nocturna uruguaya **09/07**, y construye la fila de Montevideo **`13`**.
- Esas dos fuentes solo contienen los sorteos efectivamente documentados; las otras filas **quedan `--`**, sin rellenar artificialmente cabezas argentinas.
- Sábado Montevideo solo Nocturno; jueves ambos horarios, sin inventar otro turno.
- La prueba no cambia la implementación de `loadPreviousDraws` ni el motor Lalo, sino que fija el comportamiento correcto ante futuras modificaciones.

La validación completa de `main` terminó en **success**: https://github.com/y0t3/Modelo-Papa/actions/runs/38871267198 .

## Estado de la investigación
- **Auditoría automática exitosa:** https://github.com/y0t3/Modelo-Papa/actions/runs/38870887959
- Artefacto `VERIFICACION-HISTORICA-CABEZAS-2026`: `AUDITORIA_PROCEDENCIA_CABEZAS_2026.json`.
- La reconstrucción de los 520 cortes previos se volvió a ejecutar con ambas Nocturnas verdaderas, sin contar una cabeza uruguaya como sexto acierto argentino. El informe cuantitativo está en la rama `lab/revision-520-pre-con-uruguay-verificado-16oct2026`.

**Próximo control:** gestionar explícitamente procedencia/verificación del turno, conservar `----` donde no hubo dato corroborado y advertir contradicciones, en lugar de aceptar o bloquear automáticamente fechas enteras. La historia sellada jamás se reescribe retroactivamente.
