# Punto de control VT4 — reparto de madres Top10 y control neutral

**13 de octubre de 2026 · rama `lab-vt4-diversidad-madres-top10-13oct2026`**

Ejecución principal [GitHub Actions #38461727992 — exitosa](https://github.com/y0t3/Modelo-Papa/actions/runs/38461727992). Controles complementarios [#38462201901 — exitosos](https://github.com/y0t3/Modelo-Papa/actions/runs/38462201901). **No se alteró `src/motorLalo.ts` en esta rama, ni `main`, la app instalada, Tops antiguos o sellos históricos**.

## Planteo comprobado
VT4 ya se había corregido para formar una agrupación `madre VT3 reversible + cifra añadida + extremo prefijo/sufijo`; por ejemplo `3+226=3226` y `3+622=3622`, familia `3226/3622`, con los **dos valores sólo admitidos si poseen caminos físicos reales**. Ya no se agrupa por inversión completa de cuatro cifras.

El Top10 anterior seguía repartido en seis hijas de la madre VT3 #1 y cuatro de la #2 durante los cortes Primera y Matutino del 13/10. Ahora se compararon **115 cortes**, 23 fechas históricas, con las mismas diez plazas VT4 y las mismas madres VT3 admitidas Top10, **sin crear caminos de más de una fuente ni asignar madres prestadas**.

## Procedimiento PRE/POST

1. A partir del fixture histórico de 30 fechas (SHA256 de bytes originales `7e393c54b073cae83ae972b8511e533b61fbc087fe574a8dde84ae9100530217`), se crearon `INPUT_PRE_115.json` y `OBJETIVOS_POST_115.json` por separado. En cada fila PRE, todos los resultados del turno objetivo y posteriores quedaron `----`. D−1/D−7 contienen **solamente** fechas históricas anteriores.
2. GitHub Actions movió físicamente el archivo POST **y** el fixture de resultados fuera del directorio antes de ejecutar cualquier selección. Se guardaron diez grupos elegidos por cada política, sus madres y **únicamente los cuatro dígitos efectivamente existentes en sus recorridos físicos**, más `PRE_115.json` y `SELLO.json`. El commit PRE precedió cronológicamente a POST.
3. Después se restituyeron POST y fixture para cotejar las **cinco jurisdicciones argentinas** por corte. Un grupo se considera acertado sólo cuando una de sus **cuaternas físicamente leídas** coincide exactamente con una cabeza, nunca por una variante teórica sin recorrido. Ninguna cabeza puede contar doble por pertenecer a dos agrupaciones.
4. Los métodos son `ORIGINAL_CORREGIDO`, `UNICO_NUMERO`, `CUPO_1`, `CUPO_2`, `CUPO_3`, `RONDA_MADRES`, `BASE_NEUTRAL`. Todos tienen **diez grupos**; las políticas diversificadas prohíben repetir un mismo valor real de cuatro cifras entre grupos. Los cupos 1/2/3 son metas iniciales con posibilidad de relleno, pero los 115 cortes se completaron **sin ninguna plaza de relleno excedida**.
5. Se hicieron **dos controles complementarios** sellados antes de leer resultados: 500 selecciones neutrales de diez grupos físicos numéricamente disjuntos, y 500 selecciones neutrales con **una hija física de cada una de las diez madres**, escogida al azar sin solapamiento de cuaternas. Se guardaron todas las elecciones `CONTROL_PRE.json` y su `CONTROL_SELLO.json` antes de restaurar POST. Estos controles complementarios fueron propuestos **después** de conocer 4/115, así que sus porcentajes son **diagnósticos exploratorios**, no contraste confirmatorio preregistrado.

## Resultados sobre 115 cortes

| Método | Top3 | Top5 | Top10 | Madres distintas medias por Top10 | Cuaternas reales distintas medias |
|---|---:|---:|---:|---:|---:|
| VT4 madre corregida, ranking original | **0** | **0** | **0** | 1,287 | 15,948 |
| Sólo prohibir repetir cuaternas reales | 0 | 0 | 0 | 1,400 | 16,174 |
| **Cupo 1 por madre** | 0 | **3** | **3** | **10,000** | 18,000 |
| **Cupo 2 por madre** | 0 | 0 | **4** | **5,000** | 17,757 |
| Cupo 3 por madre | 0 | 0 | 0 | 4,000 | 17,435 |
| Por rondas de madres | 0 | **3** | **3** | **10,000** | 18,000 |
| Una muestra neutral por hash | 0 | 0 | **1** | 6,626 | 15,165 |

**4/115 Top10** es el mejor rendimiento *de estas siete políticas históricas*; se consiguió con dos hijas por madre, cinco madres diferentes y nunca más de diez plazas. **0/115 Top3 en TODOS los modelos**. No declarar que se aprendió a predecir el premio a la cabeza.

### Los cuatro casos recuperados por CUPO_2

| Fecha y turno | Cabeza completa real | Agrupación VT4 corregida | Madre VT3 propia | Nuevo puesto Top10 |
|---|---|---|---|---:|
| **24/09 Previa** | **3159** | `3159/3951` | `159/951` | **9** |
| **03/10 Matutino** | **2592** | `2295/2592` | `295/592` | **9** |
| **10/10 Matutino** | **6542** | `4562/6542` | `456/654` | **10** |
| **10/10 Nocturno** | **2654** | `2456/2654` | `456/654` | **9** |

El reparto de una hija por madre rescató **24/09 Previa** (puesto 5), **03/10 Matutino** (puesto 5), **10/10 Nocturno** (puesto 5), pero no 10/10 Matutino. Por eso `CUPO_1` y `RONDA_MADRES` dan **3/115 Top5 y Top10**. Una muestra neutral fija encontró otra cabeza (`2735`, 18/09 Vespertino, puesto 9); el historial no permite considerar que el acierto de cualquier variante se deba a predicción y no a selección combinatoria.

El conteo de madres demuestra la concentración original: en las 1.150 plazas históricas, **1.054** correspondieron a madres VT3 de puesto #1 y **96** a #2. **Ninguna** a #3–#10. Con `CUPO_2`, hay exactamente 230 plazas para cada una de las madres #1–#5. Con `CUPO_1`, exactamente 115 plazas para cada una de las madres #1–#10.

## 1.000 controles de cupo equivalente, sellados antes del cotejo

Cada réplica contiene diez grupos físicos por cada uno de los 115 cortes. No se buscaron ni eligieron las réplicas que mejor salieron.

| Control | Top10 medio /115 | Fracción de 500 réplicas con **≥4 Top10** | Top5 medio /115 | Fracción con **≥3 Top5** |
|---|---:|---:|---:|---:|
| **500 grupos neutrales sin cuaternas repetidas** | **0,858** | **4/500 = 0,8 %** | 0,422 | 1/500 = 0,2 % |
| **500 controles de una hija neutral por madre** | **0,784** | **2/500 = 0,4 %** | 0,708 | 10/500 = 2,0 % |

La primera comparación corresponde al rendimiento 4/115 del `CUPO_2`; la segunda métrica Top5 corresponde al `CUPO_1`. Son distribuciones sobre **este historial concreto**, no probabilidades de futuro ni evidencia confirmatoria; el corpus se reutilizó en numerosos ensayos previos y las políticas de cupo se escogieron al estudiar esas mismas fechas. Aun así, **el criterio merece seguimiento prospectivo**: en esta prueba no se comportó como una elección física totalmente indiferenciada.

## 13 de octubre: Primera y Matutina

Se reconstruyeron con las fuentes PRE previamente auditadas y se verificó que el Top10 VT3 de Matutina coincide con el PRE originalmente sellado a las 13:52 (SHA256 `067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41`). El modelo VT4 **no** estaba sellado antes de esos sorteos; esta comparación es sólo retrospectiva, aunque sus fuentes y su geometría PRE son legítimas.

**Primera:**
- Ranking corregido original: seis hijas de #1 y cuatro de #2.
- Cupo uno: una hija de cada una de las **diez madres**; Top3 `2263/6223`, `3056/5036`, `3507/3705`.
- Cupo dos: dos hijas de cada madre **#1–#5**; Top3 `2263/6223`, `2265/6225`, `3056/5036`.
- **`5485` de Ciudad no entró en el Top10 de ninguna política de reparto por madres**. El control neutral por hash sí incluyó una agrupación que contenía el valor físico `5485` en su quinto puesto; **eso no valida el control como predictor**.

**Matutina:**
- Cupo uno: diez madres; Top3 `2263/6223`, `3056/5036`, `5699/5996`.
- Cupo dos: cinco madres; Top3 `2263/6223`, `2265/6225`, `3056/5036`.
- `1057` de Provincia sigue **fuera de la admisión** de VT4 porque ninguna de las dos madres de su cuaterna física pertenece al Top10 VT3 admitido. **Ninguna política de cupos** la incluye. Montevideo `3629` había coincidido con VT3 Top5, pero no con VT4.

En los dos cortes de 13/10, ninguno de los repartos `CUPO_1`/`CUPO_2`/`CUPO_3` ni rondas obtuvo Top10 VT4.

## Conclusión prudente

1. **Corregir identidad de familias** y **repartir madres** son problemas distintos. Ambos están ahora probados en laboratorio: la familia usa solo inversión de madre VT3, y la selección de diez plazas puede diversificarse sin crear caminos falsos.
2. La concentración del Top10 anterior era total. Diversificar efectivamente cambia qué familias pueden competir; `CUPO_2` recupera cuatro cabezas reales de 115 cortes. Esto es un resultado retrospectivo descriptivo, no una mejora predictiva confirmada.
3. **La restricción de admisión materna sigue sin resolverse**. Una cuaterna como `1057` puede existir en la hoja sin tener ninguna madre admisible en VT3 Top10. Un reparto más justo entre las diez madres actuales jamás la incluirá.
4. **No tocar producción todavía.** Validar ahora `CUPO_1`, `CUPO_2` y VT4 madre corregida en una secuencia de sorteos nuevos, **sellando explícitamente los Top10 VT4 antes** de que salgan. Evaluar también la cobertura de madres VT3 fuera del Top10, pero separada del reordenamiento para no mezclar causas.
5. Nunca sumar dos veces la misma cuaterna por pertenecer a dos grupos distintos, nunca añadir una cifra sin camino físico y nunca inferir probabilidad a partir de dibujos retrospectivos. La quiniela es aleatoria.

## Archivos y reproducibilidad
- `PROTOCOLO_VT4_DIVERSIDAD_MADRES_TOP10_13OCT2026.md`
- `PROTOCOLO_VT4_CONTROLES_NEUTRALES_13OCT2026.md`
- `scripts/lab-vt4-diversidad-top10.mjs`
- `scripts/lab-vt4-diversidad-13oct.mjs`
- `scripts/lab-vt4-controles-neutrales.mjs`
- `.github/workflows/lab-vt4-diversidad-top10.yml`
- `.github/workflows/lab-vt4-controles-neutrales.yml`
- `auditorias/vt4-diversidad-madres-top10-115-13oct2026/INPUT_PRE_115.json`, `PRE_115.json`, `SELLO.json`, `OBJETIVOS_POST_115.json`, `POST_115.json`, `RESUMEN.json`, `13OCT_POST.json`, `CONTROL_PRE.json`, `CONTROL_SELLO.json`, `CONTROL_RESUMEN.json`.
- [Actions 38461727992, éxito](https://github.com/y0t3/Modelo-Papa/actions/runs/38461727992).
- [Actions 38462201901, éxito](https://github.com/y0t3/Modelo-Papa/actions/runs/38462201901).

**VT3/VT4 oficiales, app y `main` siguen sin cambiar.**
