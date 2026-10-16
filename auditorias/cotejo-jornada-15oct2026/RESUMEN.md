# Cotejo jornada completa · jueves 15/10/2026

**Estado:** auditoría diagnóstica. No cambia el motor de la APK 0.3.5.

## Procedencia y distinción temporal
- **Previa PRE sellada auténtica:** 15/10 01:23 (Argentina), rama `prospectivo-vt4-a-b-previa-15oct2026`, archivo `PRE_15OCT_PREVIA.json`, hash SHA256 `f251926160d0d0bea9ea4d93a7d88b1c8646c7a304add5e07d206749992c0bb9`. La Nocturna Santa Fe del 14/10 faltaba; conservar el vacío para juzgar el sello.
- **Cotejos cronológicos reconstruidos:** Previa, Primera, Matutino, Vespertino, Nocturno. Solo usan columnas anteriores al turno, pero fueron calculados después del resultado. **NO son apuestas/pronósticos sellados antes de los sorteos**.
- Las 25 cabezas principales coinciden entre los valores publicados por Ruta1000 para el 15/10 y la API que consume la aplicación (sin diferencias).\n- **Montevideo se incorpora como dato de la hoja cuando ya se publicó en una jornada anterior al turno objetivo** (Matutino 8312 y Nocturno 7116 según API), pero no se contabiliza como una de las cinco cabezas argentinas del cotejo. Se repitió la prueba después de detectar esta omisión y los recuentos permanecieron iguales.
- Los antecedentes utilizados en la reconstrucción son 14/10 y 08/10, con sus respectivas jornadas nocturnas previas como origen de las hojas.

## Resultado sellado Previa
- Cinco cabezas: Ciudad **1184**, Provincia **1918**, Córdoba **7563**, Santa Fé **5115**, Entre Ríos **0212**.
- VT3: **0/5** cabezas en las diez familias selladas.
- VT4 concentrado: **0/5** exactas en su Top10; VT4 por rondas: **0/5** exactas en su Top10.
- La cifra **0244** estaba en el Top10 VT4 por rondas para **Previa**; salió después en **Santa Fe Matutina** y **Entre Ríos Vespertina**. **No es acierto de Previa**.

## Resultados reconstruidos, cinco cabezas por turno
| Turno | VT3 visible físicamente | VT3 Top3 | VT3 Top5 | VT3 Top10 | VT4 exacto Top10 |
|---|---:|---:|---:|---:|---:|
| Previa | 0/5 | 0 | 0 | 0 | 0 |
| Primera | 1/5 | 0 | 0 | 0 | 0 |
| Matutino | 4/5 | 0 | 1 | 2 | 1 |
| Vespertino | 1/5 | 0 | 0 | 0 | 0 |
| Nocturno | 2/5 | 0 | 0 | 0 | 0 |
| **TOTAL** | **8/25** | **0** | **1** | **2** | **1** |

Top3 VT4 tampoco coincidió en ninguno de los 25 resultados reconstruidos. VT2 tuvo 14/25 con presencia física, 4/25 en Top10.

## Anatomía de las ocho cabezas con VT3 física
- **Primera Córdoba 8242**, familia `242/242`: está dibujada físicamente pero no fue admitida, sin raíz trasladada/bifurcada válida.
- **Matutino Ciudad 8997**, `799/997`: física, sin admisión.
- **Matutino Provincia 4942**, `249/942`: admitida **#5**. Tiene dos raíces independientes, un bloque bifurcado. Frente al puesto #3 (`344/443`), pierde por **1 vs 2 bloques bifurcados**.
- **Matutino Santa Fé 0244**, `244/442`: admitida **#10**, y número exacto en VT4 **#10**. Frente al #3, también pierde por **1 vs 2 bifurcaciones**. De sus 4 recorridos VT3 físicos, 2 están admitidos.
- **Matutino Entre Ríos 1301**, `103/301`: física, sin admisión.
- **Vespertino Santa Fé 6076**, `076/670`: física, sin admisión.
- **Nocturno Córdoba 6204**, `204/402`: física pero no admitida; también presenta coincidencia VT4 real en la hoja, sin ingreso al motor.
- **Nocturno Entre Ríos 6624**, `426/624`: admitida **#16**, por fuera del Top10. Frente al puesto #10 (`163/361`), queda atrás por **0 vs 1 antecedentes de la jornada anterior**; frente al #3, por **1 vs 2 bloques bifurcados**.

## Qué prueban estos resultados y qué no
- De ocho cabezas con VT3 físicamente dibujable, solo **tres** tenían familias admitidas en el motor. Cinco quedan excluidas por falta de vínculo histórico propio bajo las reglas actuales. Esto apunta a **cobertura/admisión** además de orden de posiciones.
- De las tres admitidas, dos quedaron dentro del Top10; ninguna alcanzó Top3. Eso apunta también a **orden/prioridad**.
- El caso Matutino concentra ambos éxitos del Top10 VT3 y el único exacto VT4 del Top10, pero es una **reconstrucción**, no una predicción registrada en ese momento.
- No se demuestra ventaja estadística ni capacidad de anticipar futuros sorteos con un solo día.

## Siguiente prueba recomendada (sin cambiar el motor oficial)
1. **Control A/B de la prioridad de bifurcaciones**, con regla predefinida y datos pasados separados de prueba futura. En estudio exploratorio previo de 115 cortes, la opción sin prioridad absoluta de bifurcación pasó de 5 a 9 cortes con presencia ganadora en Top3 (Top10, de 15 a 16), pero los resultados se obtuvieron sobre historia reutilizada y **no justifican activar el cambio sin una prueba prospectiva**.
2. **Cobertura de familias físicas sin raíz propia**: medir qué familias nuevas se admitirían bajo alternativas geométricas verificables y cuántos falsos candidatos adicionales se producirían. No darles apoyo histórico prestado ni fabricar trayectos.
3. **Sellar antes de cada turno siguiente** el Top3/Top5/Top10 de VT3 y las hijas exactas VT4, con la cobertura física y la hora, para evitar juzgar como prospectivos los replays.

### Evidencia
- Workflow con resultados: https://github.com/y0t3/Modelo-Papa/actions/runs/38844629959
- Sello PRE independiente: https://github.com/y0t3/Modelo-Papa/blob/prospectivo-vt4-a-b-previa-15oct2026/auditorias/prospectivo-vt4-ab-previa-15oct2026/PRE_15OCT_PREVIA.json
- Estudio anterior de 115 cortes: `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/RESUMEN.json` de la rama prospectiva.
- El workflow publica `COTEJO_15OCT2026.json` como artefacto descargable con el detalle por turno y cada cabeza.
