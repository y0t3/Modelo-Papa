# Modelo Temporal Puro · Auditoría de jurisdicciones (20/10/2026)

**Independiente de +11, hoja, recorridos y Modelo Lalo MV1.** Rama `lab/jurisdicciones-temporales-20oct2026`, script reproducible `scripts/lab-jurisdicciones-temporales.ts`.

Código y pruebas completas, éxito: https://github.com/y0t3/Modelo-Papa/actions/runs/39427145170

## Fuente y cortes

- Misma fuente RAW que consulta la APK: endpoint Viví tu Suerte. Descarga de 546 jornadas con algún resultado entre 2025-01-02 y 2026-10-19: 304 jornadas de 2025, 242 de 2026; 0 errores de descarga reportados.
- 2.724 sorteos con las cinco jurisdicciones argentinas completas, sobre los cuales se comprueba distribución y coincidencia por pareja del mismo turno: 1.515 en 2025 y 1.209 en 2026.
- Jurisdicciones: Ciudad, Provincia, Córdoba, Santa Fe, Entre Ríos. Montevideo no se toma como objetivo argentino.
- Selección RAW VT2/VT3: ranking de familias reversibles sin rotación, calculado exclusivamente con 45 jornadas reales ANTERIORES. Comparar GLOBAL, misma JURISDICCIÓN, misma JURISDICCIÓN + TURNO, MIXTO 50/50 y referencia aleatoria estable. Nada del día objetivo entra al ranking. Las formas invertidas de una familia ocupan una única unidad, no dos tickets.
- 2025 = exploración retrospectiva, 2026 = contraste retrospectivo independiente de parámetros. Este proyecto ya estudió el histórico antes y ninguna reserva puede sustituir pruebas prospectivas selladas.

## Heterogeneidad de cifras por jurisdicción

Permutación dentro de cada fecha y turno que preserva cinco cabezas existentes, sobre centenas/decenas/unidades de las terminaciones de tres cifras. 999 replicaciones; máximo estadístico corrige tres posiciones.

| Año | Cortes completos | p ajustado centenas | p ajustado decenas | p ajustado unidades |
|---|---:|---:|---:|---:|
| 2025 | 1.515 | 0,964 | 0,862 | 0,634 |
| 2026 | 1.209 | 0,225 | 0,764 | 0,883 |

No se encontraron diferencias persistentes demostrables.

## Coincidencias exactas entre jurisdicciones del mismo turno

Se observan 10 parejas por turno. Para la nulidad se permutan días **dentro del mismo mes y turno** independientemente por jurisdicción, conservando sus distribuciones de terminaciones; 999 réplicas y corrección por máximo z absoluto entre las 10 parejas.

**Hallazgo exploratorio:** Provincia–Córdoba coincidieron exactamente en sus **últimas dos cifras** 29 veces en 2025 contra 15,76 esperadas aproximadamente, p ajustado por diez parejas ≈ 0,008. Se distribuyeron por 11 meses, sin duplicación completa de cabeza. Distribución por turno: Vespertino 8, Nocturno 6, Previa 6, Primera 6, Matutino 3.

**Fracaso de replicación:** en 2026, la misma pareja coincidió **11 veces** frente a 12,55 esperadas, z≈−0,44, p ajustado=1. En 2026, la mayor desviación entre las diez parejas fue Ciudad–Provincia (18 vs 11,73), **p ajustado≈0,453**; por tanto no se encontró ninguna pareja robusta.

La sincronía de 2025 merece registro como anomalía retrospectiva, NO regla prospectiva ni evidencia causal entre sorteos.

## Dependencias cruzadas de turnos adyacentes (sin +11)

Se cruzaron 25 pares fuente-jurisdicción × destino-jurisdicción entre turnos consecutivos del mismo día, únicamente cuando ambos turnos tenían cinco cabezas. Se comparó igualdad exacta de las dos últimas cifras. Permutación de los objetivos dentro de cada mes y turno, por jurisdicción independiente: 799 réplicas, p familiar corregido por 25 comparaciones.

| Año | Transiciones completas | Mayor desviación | p corregido |
|---|---:|---|---:|
| 2025 | 1.209 | Provincia anterior → Ciudad siguiente: 18 vs 11,37 esperadas | 0,685 |
| 2026 | 967 | Córdoba anterior → Córdoba siguiente: 3 vs 10,14 esperadas | 0,343 |

No se encontró ninguna dependencia cruzada de turnos que supere el control de comparaciones múltiples, incluso cuando el valor observado luce llamativo.

## ¿Sirve un Top específico para cada jurisdicción?

Comparación PRE verdaderamente secuencial de los selectores ya fijados (ventana 45 jornadas previas, recencia exponencial), aciertos de cabeza en Top5.

| Modalidad | Año | Cabezas | Global | Jurisdicción | Jurisdicción + turno | Mixto |
|---|---|---:|---:|---:|---:|---:|
| VT2 | 2025 | 6.454 | 623 | 645 | 644 | 630 |
| VT2 | 2026 | 6.049 | 650 | 642 | 585 | 647 |
| VT3 | 2025 | 6.454 | 57 | 67 | 74 | 62 |
| VT3 | 2026 | 6.049 | 50 | 63 | 60 | 61 |

Prueba pareada por jornada (1.499 remuestreos y permutaciones de signo por día; máximo normalizado de las tres alternativas contra Global):

- VT2 2025, mejor diferencia +22: p ajustado 0,774.
- VT2 2026, diferencia local −8, mismo turno −65, mixto −3: mejor p ajustado 0,104 (no respalda mejora).
- VT3 2025, mejor diferencia +17 para mismo turno: p ajustado 0,247.
- VT3 2026, mejor diferencia +13 para jurisdicción: p ajustado 0,388; intervalo de remuestreo para esta diferencia [−5,+32], incluye cero.

En VT3 local 2026, 63 aciertos frente a ~58,73 esperados por cobertura; y en 2025, 67 frente a ~62,92. No hay ventaja reproducible clara sobre el azar. El ranking Global falló por debajo de su cobertura esperada en VT3 durante ambos años; vencer a ese ranking no demuestra habilidad predictiva.

## Conclusión y decisión

1. **No se confirma un sesgo persistente de cifras por jurisdicción** en 2025/2026.
2. **Se detectó una anomalía de sincronía Provincia–Córdoba durante 2025**, distribuida por el año, pero no se reprodujo en 2026.
3. **Las relaciones de dos cifras entre turnos consecutivos, incluyendo cruces entre jurisdicciones, no dieron diferencias significativas** tras los controles.
4. **Separar el Top por jurisdicción no mejoró confiablemente al modelo agrupado**; en VT3 existe un pequeño exceso retrospectivo estable pero insuficiente para declarar un nuevo motor útil.
5. **No alterar MV1 ni subir un modelo a producción.** Conservar scripts como controles de falsación de hipótesis y no ajustar retrospectivamente a las anomalías ya observadas.

Estos contrastes diagnostican dependencias; un juego de lotería bien realizado debe ser aleatorio y los resultados de este informe no establecen ventaja de apuesta ni rentabilidad.
