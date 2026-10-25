# Diagnóstico de reconocimiento geométrico — sábado 24/10/2026

**Estado:** laboratorio retrospectivo, pruebas automatizadas aprobadas. **MV1, `main` y APK intactos.** Este informe continúa el replay histórico de VT2/VT3/VT4 y busca la causa de las figuras ganadoras que quedaron fuera del Top10.

## 1. Pregunta correcta: ausencia o posición de ranking

La hoja +11 del sábado tiene **cinco cabezas con terminación VT3 físicamente formable** y **dos cabezas VT4 con recorrido válido de cuatro celdas**, que no acertaron dentro del Top10 correspondiente. La nueva auditoría vuelve a construir cinco cortes PRE, preservando solo los turnos del mismo día publicados ANTES de cada objetivo, y verifica que los primeros diez puestos de cada modalidad coinciden exactamente con el replay PRE congelado.

| Turno, jurisdicción | Cabeza | Familia VT3 | Rutas exactas de VT3 | Ranking VT3 completo |
|---|---|---|---:|---|
| Primera, Provincia | `9379` | `379/973` | 1 | **no reconocida** |
| Primera, Córdoba | `1573` | `375/573` | 1 | **no reconocida** |
| Matutino, Ciudad | `9321` | `123/321` | 1 | **no reconocida** |
| Vespertino, Provincia | `5693` | `396/693` | 2 | **no reconocida** |
| Nocturno, Córdoba | `5739` | `739/937` | 2 | **no reconocida** |

**Clasificación comprobada:** VT3: **5 no reconocidas, 0 reconocidas debajo del Top10**. VT4: **2 no reconocidas, 0 reconocidas debajo del Top10**. No es un problema de ordenar mejor el Top10, sino de familias que no entraron al universo del motor.

### Dependencia VT4

Ambos recorridos de cuatro celdas son físicamente correctos; agregan exactamente una cifra **a la izquierda** de la madre VT3. Ambos suceden en la columna **Previa** de su corte:

| Cabeza | Cuarta cifra izquierda | Madre real | Madre reconocida por el motor | VT4 generado |
|---|---:|---|---|---|
| `1573` | `1` | `375/573` (`573`) | No | No |
| `5739` | `5` | `739/937` (`739`) | No | No |

No hay evidencia de inversión ilegal de cuaternas ni error de construcción VT4 en estos dos casos. **El cuello de botella ya estaba en VT3:** falta la madre reconocida para generar esa extensión exacta. Subir hijas VT4 en el ranking actual no arregla una madre ausente.

## 2. Testigos geométricos ganadores de las seis jornadas anteriores

Se rastrearon exclusivamente cabezas publicadas **antes** del sábado 24/10, sobre seis jornadas de sorteo: 17, 19, 20, 21, 22 y 23/10. Solo cuentan recorridos legales de tres celdas contiguas de una misma columna. La silueta se compara ignorando los dígitos actuales, admitiendo inversión y traslado vertical hasta dos filas para este *diagnóstico*.

| Cabeza objetivo | Fecha antigua | Cabeza ganadora antigua | Silueta antigua (3 dígitos) | Relación con la fuente del sábado |
|---|---|---|---|---|
| `9379` | 22/10 | `8578` | `578` | Misma columna, Previa |
| `1573` | 19/10 | `2099` | `099` | Fuente contigua: Nocturna anterior → Previa |
| `9321` | 20/10 | `8568` | `568` | Misma columna, Previa |
| `5693` | 22/10 | `9760` | `760` | Fuente contigua: Primera → Matutino |
| `5739` | 21/10 | `1746` | `746` | Fuente contigua: Primera → Matutino |

`9379` presenta además una figura vecina antigua el 17/10 (`7344`); `5693` y `5739` presentan otros testigos antiguos de diferente fuente. Esto NO significa un movimiento predicho entre columnas de una hoja: son dos fotografías geométricas de diferentes jornadas. No se atraviesan columnas en un recorrido +11.

**Por qué las cinco faltaban en MV1:** ninguna tenía una ruta transferida válida desde las raíces canónicas de D−1 (23/10) o D−7 (17/10) **en la misma fuente** que permitiese reconocer la familia VT3. Dos tenían evidencia de la misma forma en la misma fuente en otros días de la ventana de seis; las otras tres, testigos en otras fuentes. El reconocimiento actual exige esos testigos históricos específicos; la mera posibilidad física de escribir un VT3 en una columna NO basta.

## 3. Control negativo: la geometría histórica por sí sola discrimina muy poco

Se enumeraron TODAS las familias físicas candidatas con tres cifras en cada corte, se excluyeron las ya reconocidas por el motor y, **antes** de leer las cabezas del turno, se computó quién tenía una figura ganadora histórica de la misma silueta y fuente, o fuente vecina, en las últimas seis jornadas. POST solo etiqueta cuáles acertaron.

| Corte | Familias físicas totales | Familias no reconocidas | Con mismo/vecino testigo ganador de seis jornadas | Ganadoras incluidas |
|---|---:|---:|---:|---:|
| Previa | 52 | 30 | 24 | 0 |
| Primera | 113 | 85 | 75 | 2 |
| Matutino | 149 | 103 | 84 | 1 |
| Vespertino | 169 | 120 | 97 | 1 |
| Nocturno | 198 | 149 | 109 | 1 |
| **Suma de exposiciones** | **681** | **487** | **389** | **5** |

**Una condición tan amplia rescata los cinco casos POST, pero junto con 384 exposiciones no ganadoras.** Las exposiciones son registros familia–turno, no familias únicas ni apuestas. El filtro **no selecciona por sí mismo** qué candidatos subir a un Top3/Top10.

Filtros por tipo de testigo:
- **Misma fuente, últimas seis jornadas:** 191 exposiciones, **2 ganadoras**, 189 no ganadoras.
- **Fuente vecina, últimas seis jornadas:** 281 exposiciones, **4 ganadoras**, 277 no ganadoras.
- **Misma o vecina fuente:** 389 exposiciones, **5 ganadoras**, 384 no ganadoras. Los filtros se solapan, por eso no deben sumarse.

Las cifras de este solo sábado no constituyen una estimación estadística de ventaja predictiva. Son diagnósticos retrospectivos y el número de alternativas no ganadoras explica por qué ampliar la memoria física de modo indiscriminado saturaría el sistema.

## 4. Consecuencia y decisión

1. **Descartar un ajuste simple del ranking:** en estos cinco casos no había familias VT3 en ningún puesto, no eran candidatas #11–#20 escondidas.
2. **No adelantar una modificación de VT4:** las dos cuaternas formables tenían madre VT3 legítima pero ausente. VT4 solo debe generarse desde madre reconocida y con cifra antepuesta físicamente.
3. **No sumar como favoritas todas las figuras de 5–6 jornadas:** aparecen por centenares en el mismo corte, con pocas ganadoras; replicaría el error de usar una cobertura amplia como si fuera selección.
4. **Ensayar una transición selectiva y temporalmente justificada:** por ejemplo, observar el mismo recorrido activado por resultados publicados en distintas fuentes/jornadas y buscar si nace, conserva dirección y se apaga, contrastándolo con no ganadoras emparejadas del mismo corte. Esta es una **hipótesis pendiente**, no una regla validada.
5. Usar pruebas históricas ciegas en una ventana de selección y una ventana independiente, además de tops realmente sellados antes de sorteos nuevos. La prueba anterior **MISMA_6** tuvo una mejora exploratoria Top10 de 59 a 67 en 620 cortes, con fracción de aleatorios ≥ resultado de 0,0642; no suficiente para integrarse como mejora.

## 5. Código y evidencias verificables

- **Causa de reconocimiento y madres VT4:** [Actions #40228427219](https://github.com/y0t3/Modelo-Papa/actions/runs/40228427219), `scripts/lab-rastro-faltantes24-vt234.ts`, artefacto `analisis-rastro24-VT3-VT4`.
- **Testigos de seis jornadas, fecha/fuente/silueta:** [Actions #40228772183](https://github.com/y0t3/Modelo-Papa/actions/runs/40228772183), `scripts/lab-testigos6-24oct.ts`, artefacto `testigos-seis-jornadas-vt3-24oct`.
- **Universo de familias NO ganadoras con testigos comparables:** [Actions #40228970734](https://github.com/y0t3/Modelo-Papa/actions/runs/40228970734), `scripts/lab-universo-testigos6-24oct.ts`, artefacto `universo-candidatos-testigos6-24oct`.
- Replay original de bases, cabezas y 5 cortes PRE: `auditorias/lalo-retro-sabado24-vt234/retro-pre-24oct.json`; resultados POST: `retro-post-24oct.json`; recorridos exactos: `auditoria-fisica-24oct.json`.
- **Todas las Actions mencionadas aprobaron la regresión del motor MV1.**

> La clasificación se realiza *después* de conocer las cinco cabezas ganadoras del sábado, pero para cada corte el motor se ejecuta sin recibir la cabeza que intenta predecir. Esto permite estudiar los errores sin convertir el resultado conocido en una predicción ficticia.
