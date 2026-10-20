# Modelo Temporal Puro · laboratorio independiente de la hoja +11
**Estado:** ensayo exploratorio completado en 2025 y 2026. Ninguna ventaja predictiva estable demostrada.

- [GitHub Actions con ambos años, TypeScript y archivos de salida](https://github.com/y0t3/Modelo-Papa/actions/runs/39424364331)
- [Script 2026](../../scripts/lab-temporal-puro-20oct2026.ts) · [script réplica 2025](../../scripts/lab-temporal-puro-2025.ts).
- Artefacto de la ejecución: `LAB-MODELO-TEMPORAL-PURO-2026`, con ambos JSON de auditoría.

## Definición antes de medir

Se descargaron las cabezas reales desde el mismo endpoint que utiliza la app (`descargarCabezas`). Para cada corte se admitieron *únicamente* resultados de días anteriores y, dentro del mismo día, turnos que ya sucedieron. Ningún lector lee cabezas del turno objetivo al construir los Tops.

No se utiliza +11, hoja, rutas, vecinos, fuentes +11, memoria geométrica ni motor Lalo. Sólo fechas, turnos, jurisdicciones y cifras crudas. VT3 = reversa de las últimas tres cifras (dos orientaciones máximo), VT2 = reversa de dos cifras, sin rotaciones circulares. Se conserva el cero inicial. Sólo Argentina en objetivos; se exige un mínimo de cuatro cabezas para evaluar. Las jornadas sin resultado no se inventan.

Cuatro selectores en Top3, Top5 y Top10, más un control fijo aleatorio:
1. **Frecuencia**: conteos decaídos en los últimos 60 días de sorteo.
2. **Eco temporal**: presencia reciente en seis días con prioridad leve por mismo turno.
3. **Red de transiciones**: asociaciones aprendidas en los últimos 90 días entre terminaciones del turno anterior y las del siguiente; para Previa, Nocturno previo. VT3 utiliza apoyo por pareja/dígito, VT2 por pareja directa.
4. **Recombinación**: parejas y dígitos de cabezas recientes, ensamblados sin geometría física; son candidatos, no recorridos.
5. **Aleatorio fijo**: desempate reproducible por fecha, turno y familia, independiente del resultado.

Se observaron por separado enero-junio, julio-agosto y septiembre en adelante. Los parámetros y reglas permanecieron iguales en ambos años. El segundo año se ejecutó después del primero para comprobar reproducibilidad; no se modificaron fórmulas.

## Datos evaluados

| Año | Calendario consultado | Jornadas con cabezas | Cortes PRE | Cabezas en cortes |
|---|---:|---:|---:|---:|
| 2026 (hasta 19/10) | 292 | 242 | 1.060 | 5.299 |
| 2025 | 365 | 304 | 1.366 | 6.829 |

Sin errores de descarga. Los primeros 30 días con resultados sirven como memoria inicial. No se contabilizan cortes sin al menos cuatro resultados argentinos.

## Prueba reservada: Top5 VT3

| Lector | Sep–19 oct 2026 (210 cortes, 1.050 cabezas) | Esperado uniforme | Sep–dic 2025 (511 cortes, 2.554 cabezas) | Esperado uniforme |
|---|---:|---:|---:|---:|
| Azar de control | 11 | 9,51 | 16 | 23,21 |
| Frecuencia | 11 | 10,48 | 21 | 25,52 |
| Eco temporal | 10 | 10,18 | 25 | 24,77 |
| Red de transiciones | **13** | 10,42 | **26** | 25,27 |
| Recombinación | 10 | 9,55 | 24 | 23,17 |

El resultado marginal de Transiciones en 2026 **no reaparece como ventaja clara** en 2025. No hay evidencia de que estos lectores aumenten establemente la precisión VT3.

## Prueba reservada: Top5 VT2

| Lector | Sep–19 oct 2026 | Esperado uniforme | Sep–dic 2025 | Esperado uniforme |
|---|---:|---:|---:|---:|
| Azar de control | 92 | 96,45 | 225 | 231,63 |
| Frecuencia | 123 | 105,00 | 247 | 255,40 |
| Eco temporal | **124** | 103,70 | **256** | 250,40 |
| Red de transiciones | 113 | 104,30 | 235 | 254,10 |
| Recombinación | 105 | 86,00 | 188 | 209,07 |

En 2026 aparecen diferencias favorables VT2 para varios lectores, **pero disminuyen o desaparecen en 2025**. La aparente ventaja de Recombinación cambia de signo. Los números esperados ya tienen en cuenta que una familia palindrómica reversible tiene menos valores cubiertos que una no palindrómica.

## Precaución estadística: no interpretar las permutaciones congeladas como pruebas formales

Los JSON contienen además una auditoría que **permuta las cabezas del período reservado manteniendo fijos los Tops ya calculados**, tanto dentro del turno como dentro de mes y turno. Sirve para comparar cómo se distribuyen las coincidencias al reordenar *objetivos*, pero **NO es un test de significancia válido de un modelo adaptativo**: los Tops dependen de sorteos pasados, y al permutar la secuencia sería obligatorio recalcular, corte por corte, su memoria y sus pronósticos. Por ello, aunque el campo interno indique `familyWisePermutationP`, **no debe leerse como un p-valor confirmatorio** ni utilizarse para decidir mejoras.

El número `esperado uniforme` es una referencia explícita bajo independencia y cabezas equiprobables (no una estimación empírica del generador real). Se probaron varios lectores, modalidades y K; una ventaja de un solo bloque puede surgir por múltiples comparaciones. Tampoco estas fechas fueron PRE prospectivos registrados antes de cada sorteo.

## Dictamen y próximo enfoque

No modificar Modelo Lalo MV1, sus reglas +11, ranking ni APK. Este laboratorio prueba un concepto distinto y está aislado en su propia rama.

Los modelos de frecuencia, eco, transiciones y recombinación **no presentaron ventaja consistente para VT3** al comparar los años. VT2 tuvo diferencias aisladas, pero no suficientes para reclamar superioridad reproducible.

La utilidad del estudio es metodológica: separamos con éxito una hipótesis temporal pura de la geometría, la contrastamos con datos reales extensos y evitamos incorporar señales que desaparecen en otra época.

Antes de proponer un nuevo motor predictivo, haría falta una prueba prospectiva con pronósticos sellados, o un contraste de independencia con simulaciones causales que reconstruyan el predictor dentro de cada secuencia permutada, sin adaptar la regla a resultados conocidos.
