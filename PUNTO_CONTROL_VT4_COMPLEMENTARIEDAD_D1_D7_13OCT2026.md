# Punto de control VT4 — complementariedad D−1 y D−7 entre hijas, 115 cortes

**13/10/2026 · rama `lab-vt4-complementariedad-d1-d7-13oct2026`.** GitHub Actions [comparación PRE/POST #38482287525](https://github.com/y0t3/Modelo-Papa/actions/runs/38482287525) y [auditoría de especificidad #38482500955](https://github.com/y0t3/Modelo-Papa/actions/runs/38482500955), completados con éxito. No se modifican el motor, la app, `main`, Tops publicados ni los archivos de predicción previamente sellados.

## Propósito y mecanismo exacto

Comprobamos si la aparición **en el mismo corte** de una hija VT4 con geometría retrospectiva ganadora D−1 y otra hija diferente con geometría ganadora D−7 permite seleccionar mejor las diez hijas de las cinco primeras madres VT3.

Familias VT4 se siguen creando con la **inversión únicamente de su madre VT3 reversible, conservando cifra adicional y extremo de ampliación**. Un valor de cuatro cifras entra sólo si su ruta física propia de cuatro casillas existe, con vecindad real dentro de una fuente y sin prestar raíces de otras hijas. Los únicos antecedentes históricos son **marcas reales `sheet.matches` ganadoras** con fecha, jurisdicción, cabeza completa y recorrido histórico válido, nunca marcas predictivas.

Se prepararon siete métodos con **10 plazas exactas, 2 hijas por madre VT3 #1–#5**. Los métodos `BASE_CUPO2` y `D7_D1_COMBINADO` se copiaron y verificaron por identidad de rutas y puestos desde PRE históricamente sellado; los nuevos son `DOBLE_POR_MADRE`, `COBERTURA_GLOBAL`, `EQUILIBRIO_PERIODOS`, `SOPORTE_TOTAL` y `HASH_NEUTRAL`.

El workflow ocultó físicamente los objetivos POST del corte y fixture completo antes de construir y comprometer `PRE_115.json` y `SELLO.json`. Sólo después reveló cabezas para evaluar. Los rankings nuevos no consultan ninguna cabeza futura.

## Aparición real de complementariedad en PRE

- **70/115** cortes tenían alguna hija elegible respaldada por una forma ganadora D−7.
- **67/115** tenían alguna hija elegible respaldada por una forma ganadora D−1.
- **47/115** contenían **ambas señales en dos hijas diferentes**, requisito central de la prueba.
- **46/115** permitían recibir esas señales de dos **madres VT3 distintas**.
- **32/115** permitían hallar ambas señales en dos hijas de la **misma madre**.
- En el Top10 fijo BASE_CUPO2, la complementariedad aparecía en **23 cortes**. En la política combinada D−7/D−1 apareció en **44**, y en las cuatro nuevas variantes estructuradas, en **47**. Por tanto, el nuevo reparto puede cubrir más señales sin necesidad de mejorar su capacidad de seleccionar cabezas reales.

La Matutina del 03/10 **no era excepcional por la mera presencia de ambas huellas**: el fenómeno ocurría en 47 cortes.

## Comparación de resultados: cabezas exactas y cortes

| Método con 10 plazas | Cortes Top3 | Cortes Top5 | Cortes Top10 | Cabezas completas acertadas | Top10 con ambas señales | Top10 con ambas señales y algún acierto |
|---|---:|---:|---:|---:|---:|---:|
| BASE_CUPO2 | 0 | 0 | **4** | **4** | 23 | 1 |
| D7_D1_COMBINADO anterior | 0 | 0 | **4** | **5** | 44 | 1 |
| DOBLE_POR_MADRE | 0 | 0 | **4** | **4** | 47 | 1 |
| COBERTURA_GLOBAL | 0 | 0 | **4** | **4** | 47 | 1 |
| EQUILIBRIO_PERIODOS | 0 | 0 | **4** | **4** | 47 | 1 |
| SOPORTE_TOTAL | 0 | 0 | **4** | **4** | 47 | 1 |
| HASH_NEUTRAL | 0 | 0 | 1 | 1 | 18 | 1 |

**No se mejoró** la selección combinada anterior en ninguno de los 115 cortes. Los cuatro nuevos métodos empataron en Top10 con BASE_CUPO2, **pero perdieron la quinta cabeza que había obtenido la combinación anterior**. Ningún método produjo cabezas Top3 o Top5.

De los 44 cortes donde `D7_D1_COMBINADO` seleccionó ambos tipos de apoyo, **43 no coincidieron con ninguna cabeza de las cinco jurisdicciones argentinas**. En uno —Matutina del **03/10**— acertó **dos cuaternas completas, `2592` y `5832`**. Los 4 aciertos por corte no se incrementaron: el total de **5** se debe a ese doble acierto.

### Qué tan específicos son esos apoyos

El estudio POST de especificidad examinó **5.564 registros de agrupaciones VT4 elegibles en 115 cortes**, **NO 5.564 cabezas distintas**. Entre ellos:
- **370** registros tenían al menos una semejanza ganadora D−1.
- **392** tenían semejanza ganadora D−7.
- **22** tenían ambas clases de apoyo dentro de una misma agrupación.
- **7** registros correspondieron a una cabeza ganadora físicamente representable dentro del universo de las cinco madres, distribuidos entre **6 cortes**.
- De esos **7**, sólo **1** tenía apoyo D−1 y **1** apoyo D−7. Son, precisamente, `5832` y `2592` del 03/10.

La memoria de recorridos ganadores es una evidencia histórica verdadera, pero muchas agrupaciones la comparten y **no es una etiqueta exclusiva de una futura ganadora**.

### Por qué fue tan difícil distinguir las dos hijas del 03/10

**`5832`**, madre VT3 `238/832` (#4), contaba con una ruta ganadora D−1 **exacta** (mismas casillas/fuente) procedente de `3686`, Santa Fe Vespertina del 02/10. Sin embargo, **otra hermana `2385/8325` tenía también una coincidencia D−1 exacta**, de modo que no era señal individual única: **2 de 10 hermanas** compartían la marca D−1 exacta. Solamente `D7_D1_COMBINADO` y un control neutral de orden lograron incluir `5832` entre las diez plazas.

**`2592`**, madre VT3 `295/592` (#5), tenía una forma ganadora **D−7 trasladada** de `3757`, Provincia Vespertina del 26/09. **Otra hermana `2952/5922` también tenía forma D−7**: **2 de 8 hermanas** de esa madre compartían la señal. La combinación D−7/D−1 mantuvo `2592` en la posición 9.

Estas dos observaciones impiden concluir que «una huella D−1 o D−7 implica elegir automáticamente esa hija»: ni siquiera en el corte exitoso el respaldo discriminaba perfectamente entre hermanas. La ganancia adicional de `D7_D1_COMBINADO` fue real en la reconstrucción PRE/POST pero **no valida el mecanismo como predictor**.

## Comparación temporal por semanas, sólo descripción de fechas históricas

En la semana 15–19/09 todos los métodos tuvieron cero cabezas. En 21–26/09, BASE_CUPO2 y las variantes físicamente dirigidas obtuvieron una; en 28/09–03/10, BASE_CUPO2 una y D7_D1_COMBINADO dos (ambas el 03/10); en 05–10/10, las variantes dirigidas conservaron dos. Estas no son semanas de prueba independiente para una hipótesis que seleccionamos tras explorar el conjunto completo.

## Controles y límites

Anteriormente se hicieron **500 permutaciones de apoyos entre hermanas de las mismas madres** con presupuesto constante, que obtuvieron cinco o más cabezas en **62/500 = 12,4 %** y al menos cuatro cortes en 248/500. Son controles exploratorios posteriores a la mejora observada, no un contraste confirmatorio. La nueva comparación de complementariedad tampoco obtuvo un incremento adicional.

### Conclusión de trabajo

La combinación de respaldos históricos D−1/D−7 puede recuperar una hija VT4 omitida (`5832`), pero **la simple diversidad o cantidad de apoyos es frecuente y no distingue por sí misma cabezas futuras**. No es prudente imponer en VT4 un cupo obligatorio «una hija D−1 y otra D−7» ni ascender todas las hijas con cualquier antecedente.

El siguiente paso, con datos existentes, debería ser una **auditoría de exclusión del propio camino que ganó** (por qué `5832` ganó el desempate sobre `2385`, y `2592` sobre `2952`) y la réplica de esa jerarquía *sin consultar cabezas* en otros cortes; o dar prioridad a fortalecer la **admisión y clasificación VT3**, que determina qué madres son elegibles para VT4. Evitar aumentar reglas por casos aislados.

## Archivos versionados
- `PROTOCOLO_VT4_COMPLEMENTARIEDAD_13OCT2026.md`.
- `scripts/lab-vt4-complementariedad.mjs`, `scripts/lab-vt4-complementariedad-especificidad.mjs`.
- `.github/workflows/lab-vt4-complementariedad.yml`, `.github/workflows/lab-vt4-complementariedad-especificidad.yml`.
- `auditorias/vt4-complementariedad-d1-d7-115-13oct2026/PRE_115.json`, `SELLO.json`, `POST_115.json`, `RESUMEN.json`, `DIAGNOSTICO_ESPECIFICIDAD_03OCT_POST.json`.
- [GitHub Actions #38482287525](https://github.com/y0t3/Modelo-Papa/actions/runs/38482287525) (PRE→POST, éxito).
- [GitHub Actions #38482500955](https://github.com/y0t3/Modelo-Papa/actions/runs/38482500955) (auditoría POST de especificidad, éxito).

**Estado:** los cambios están en un laboratorio separado, sin implementación en motor o app. Sorteos de quiniela aleatorios, sin ventaja predictiva prospectiva demostrada.
