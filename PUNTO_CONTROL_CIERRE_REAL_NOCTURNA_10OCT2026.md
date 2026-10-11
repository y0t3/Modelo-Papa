# Cierre de Nocturna — jornada completa sábado 10/10/2026

**Estado:** cotejo exhaustivo realizado y verificado el 10 de octubre de 2026, cerca de las 22:00 ART. **Se mantiene sin modificar `main`, APK, motor, selector y rama de rediseño.**

## Fuente realmente fechada: evitar la Nocturna del viernes

Consulta de `https://vivitusuerte.com/api/juegos/cabezasDiarias?fecha=2026-10-10`, autenticada por registro independiente de GitHub Actions: https://github.com/y0t3/Modelo-Papa/actions/runs/38100193505. Hora: **21:57:49 ART**, sábado 10/10 (UTC 2026-10-11T00:57:49.634Z). El artefacto del raw JSON original es https://github.com/y0t3/Modelo-Papa/actions/runs/38100193505/artifacts/11687376299. Las cuatro tandas anteriores coinciden con registros previos; Nocturna **6/6**:

| Ciudad | Provincia | Córdoba | Santa Fé | Entre Ríos | Montevideo |
|---:|---:|---:|---:|---:|---:|
| **4324** | **2654** | **1044** | **6215** | **0564** | **4515** |

**Peligro de fuentes:** varios portales todavía enseñaban `9226`, `6844`, `0336` etc. del **09/10** erróneamente rotulados con fecha 10/10. Se descartaron. Solo se usó la respuesta de la API fechada, preservando original.

## Cronología y procedencia

- PREVIA auténticamente sellada ANTES de su sorteo 09:04:33 ART, run `38050639551`, SHA256 `19d3357c82e59dbf5050ed7941f160b7e4c04a1a0875fb5e25de9147a245ea4b`: UNA columna.
- PRIMERA auténticamente sellada ANTES de su sorteo 10:53:58 ART, run `38057490657`, SHA256 `99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9`: DOS columnas.
- **Matutina, Vespertina y Nocturna NO tienen captura original sellada antes de sus sorteos.** Se reconstruyen **posteriormente**, censurando el turno objetivo y todos los siguientes al formar columnas +11. La fuente de Nocturna contiene las cinco columnas `prevNocturno,Previa,Primera,Matutino,Vespertino`.
- Se volvieron a parsear **todas** las 39 marcas comprobadas de D−1 (09/10) y 68 de D−7 (03/10) desde los HTML reconstruidos; las 54 aplicables a Primera (25+29) coinciden **exactamente** en cabeza completa, modalidad, jurisdicción, turno, secuencia física, orientación y lectura contra el JSON PRE original.
- **Todo es visual geométrico**: todas las huellas físicas válidas de VT2/VT3/VT4, contiguas, sin cruces de columna, sin saltos y sin reusar celda. Una figura y su inversión son UN dibujo físico con dos lecturas posibles.

## Cinco turnos completos — figuras heredadas de D−1 y D−7 sin duplicaciones

| Turno | Fuentes | VT2 compatibles / total | VT3 compatibles / total | VT4 compatibles / total |
|---|---:|---:|---:|---:|
| Previa (PRE sellada) | 1 | **1/14** | 0/3 | 0/0 |
| Primera (PRE sellada) | 2 | **2/26** | 0/9 | 0/0 |
| Matutina (POST retrospectiva) | 3 | **2/36** | 0/20 | 0/6 |
| Vespertina (POST retrospectiva) | 4 | **2/42** | 0/24 | 0/6 |
| **Nocturna (POST retrospectiva)** | **5** | **7/45** | **1/24** | **0/6** |

Para Nocturna **6/6**, hay 75 geometrías heredadas únicas; **ocho** coinciden físicamente con al menos una terminación publicada, **67** no coinciden. El listado completo, incluidos los 67, está en `COMPARACION_EXHAUSTIVA_NEGATIVOS.json` del paquete ZIP exportado en esta conversación: `cierre-modelo-papa-nocturna-10oct-2026.zip`.

Por memoria Nocturna: **D−1: 3 VT2 + 1 VT3**, **D−7: 4 VT2**, **D−1∩D−7: 0** de las 9 compartidas. Al comparar con TODAS las figuras físicamente posibles de las cinco columnas, se observan 13/110 VT2, 7/380 VT3 y 4/1068 VT4 compatibles. No usar el enorme universo como supuesto de elecciones independientes.

### Ocho figuras geométricas heredadas compatibles con Nocturna

1. **VT3 456/654**, `prevNocturno` celdas `3:0→4:1→4:0`, D−1 cabeza antigua `4843` (09/10 Previa Santa Fé, marcaba 843), hoy **Provincia 2654** confirma **654**. Es la única VT3 heredada compatible de los cinco turnos.
2. **VT2 45/54**, `prevNocturno` `3:0→4:1`, D−1 cabezas antiguas 4843 y 0534, confirma Provincia 2654 (54).
3. **VT2 46/64**, `Primera` `0:1→1:0`, D−1 4202, confirma Entre Ríos 0564 (64; orientación inversa).
4. **VT2 64/46**, `prevNocturno` `2:0→3:0`, D−1 0336, confirma Entre Ríos 0564 (64; inversa).
5. **VT2 42/24**, `prevNocturno` `5:0→5:1`, D−7 1211, confirma Ciudad 4324 (24); esta figura ya había sido confirmada por 6542 en Matutina como 42.
6. **VT2 46/64**, `prevNocturno` `3:0→4:0`, D−7 2592, 7429, 6129, confirma Entre Ríos 0564 (64).
7. **VT2 51/15**, `Previa` `1:0→1:1`, D−7 2592, 7429, 6129, confirma **dos cabezas de Nocturna: Santa Fé 6215 y Montevideo 4515**, misma figura física contada UNA sola vez. También figura confirmada por Provincia 5415 de Vespertina como 15.
8. **VT2 54/45**, `prevNocturno` `4:1→5:0`, D−7 3610, confirma Provincia 2654 (54; inversa).

**Córdoba 1044** no tiene recorrido confirmado VT2/3/4 en las cinco columnas disponibles del +11; no se inventa un dibujo por el hecho de haberse publicado una cabeza.

## Reconfirmaciones entre turnos

Sobre las cinco tandas del sábado, se marcaron **40 figuras físicas únicas** después de conocerse los resultados. **Nueve** se confirmaron en dos o más turnos diferentes:

- Previa Ciudad 0956 → Primera Córdoba 9656: **3 geometrías VT2 distintas** leyendo `56`.
- Matutina Ciudad 6542 → Nocturna Ciudad 4324: **3 geometrías VT2** `42↔24`, mismo dibujo invertido.
- Matutina Santa Fé 9848 → Vespertina Santa Fé 2584: **1 figura VT2** `48↔84`.
- Vespertina Provincia 5415 → Nocturna Santa Fé 6215 / Montevideo 4515: **2 figuras VT2** `15`.

Para comparación homogénea de **cinco turnos y cinco jurisdicciones argentinas**, se recontaron 20 hojas digitales de septiembre (08–30/09): media **4** figuras reconfirmadas por jornada, mediana 3, máximo 16; **2/20** jornadas (17/09 y 28/09) tuvieron **nueve o más**. El 10/10 tiene nueve, incluso excluyendo Montevideo. Frecuencia descriptiva ~10 % de 20 jornadas, no validación predictiva ni inferencia sobre azar.

## Interpretación prudente

- Ocho coincidencias de recorridos no significan ocho pronósticos acertados: **cero** figuras, orientaciones o números fueron seleccionados y sellados previamente como apuestas humanas. 
- Para Nocturna, ahora sí se pueden marcar 67 negativos definitivos gracias a 6/6 cabezas; los cuatro turnos anteriores permanecen 5/6 y sus negativos no pueden completarse automáticamente.
- Una figura compartida por D−1 y D−7 **no** resultó compatible en Nocturna. Tampoco la inversión genera un nuevo dibujo. No introducir una nueva puntuación ni un selector por mera reconfirmación.
- Comparación completa exportada en la conversación como `cierre-modelo-papa-nocturna-10oct-2026.zip`, con `index.html`, cinco hojas HTML interactivas, informe Markdown, JSON exhaustivo, fuente original, archivos PRE originales, scripts Python reproducibles y control histórico de 20 días.
- **No tocar** `main`, rama de rediseño APK, motor ni selector. Código experimental y punto de control solo en `auditoria-sorteo-10oct-2026`.
