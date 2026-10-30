# Formas Primero VT3 — Auxiliar Ayer vs Auxiliar Hoy

**Estudio experimental · 30/10/2026**  
Rama: `lab/aux-seleccion-geometrica-vt3`. No se modifica ningún motor oficial, la APK ni los Top10 de producción.

## Hipótesis y protocolo

Las dos auxiliares Santiago/Neuquén forman muchas VT3 físicas. El motor auxiliar actual solo ordena las familias proyectadas desde testigos ganadores de D−1 y D−7; la gran mayoría de las familias formadas quedan fuera del Top10. Se examinó si **priorizar sitios y siluetas físicas antes de leer los dígitos**, usando una ventana corta de hasta 6 jornadas anteriores, mejora la selección.

### Restricciones

- Las auxiliares Ayer y Hoy son **tableros completamente independientes**. No cruzar sus casillas ni mezclarlas con +11.
- Las tres franjas de cada AUX sí permiten contacto horizontal, vertical y diagonal, incluso entre franjas, sin saltos ni reutilización de casillas.
- AUX Ayer usa las tres franjas Santiago/Neuquén de la jornada sorteable anterior para todos los turnos. AUX Hoy solo tiene 0/8/16/24/24 celdas en Previa/Primera/Matutino/Vespertino/Nocturno.
- VT3 coincide con las **últimas tres cifras reales** de una cabeza (se considera la familia reversible por recorrido físico válido). Se conserva el cero.
- El motor actual conserva **exactamente sus referencias originales D−1 y D−7**. Formas Primero obtiene testigos antiguos de los **seis días sorteables anteriores**, se deduplican eventos ganadores y se favorecen sitios/figuras con antecedentes; clasifica primero sitios, luego lee los dígitos actuales para producir hasta 10 familias distintas.
- Control B: puestos 11–20 del ranking auxiliar original, no un ranking reentrenado.
- Controles neutrales: cinco selecciones deterministas con semillas 0..4, cada una con hasta 10 familias **físicamente formables** escogidas sin consultar resultados futuros ni antecedentes.
- Cada uno de los tres selectores mantiene máximo **10 familias por tablero y turno**. Previa AUX Hoy no tiene familias, y en cortes con menos de diez opciones disponibles se reporta el número real.
- Se registran aciertos por cabeza y corte, deduplicados dentro de un tablero. Una misma cabeza puede coincidir en ambos tableros y nunca se cuenta como dos cabezas distintas en el análisis global.
- Los candidatos se eligen de un corte PRE reconstruido. Los resultados del turno se incluyen solo en el cotejo POST. Test unitario: el orden de ubicaciones físicas es idéntico al cambiar todas las cifras actuales manteniendo la grilla.
- Los resultados son históricos y la idea fue desarrollada con conocimiento de algunos episodios de octubre: **septiembre–octubre es un contraste con reglas congeladas, no un test prospectivo sellado que descarte sesgo por investigación previa**.

## Validación técnica

- [CI desarrollo junio–agosto](https://github.com/y0t3/Modelo-Papa/actions/runs/41029455433): **success**.
- [CI contraste septiembre–octubre](https://github.com/y0t3/Modelo-Papa/actions/runs/41029455393): **success**.
- Reconstrucción: 77 jornadas junio–agosto (385 cortes por tablero), 42 jornadas septiembre–octubre (210 cortes por tablero). **119 jornadas, 595 cortes por tablero, 2.975 cabezas por tablero**. Se omitieron el 20/6 y el 9/7 por jornadas incompletas.
- Los totales del Top10 AUX original, con referencias D−1/D−7 restauradas, **reproducen el embudo anterior**: junio–septiembre AUX Ayer 56, AUX Hoy 41; octubre 12–29 AUX Ayer 3, AUX Hoy 4.
- Se descartó un primer cálculo donde el comparador original recibía erróneamente seis jornadas en vez de D−1/D−7. **Todas las tablas de esta auditoría provienen de los dos replays posteriores con el motor original restablecido y pruebas aprobadas**.

## Comparación total de 119 jornadas

| Método, diez familias por turno | AUX AYER · coincidencias VT3 | AUX HOY · coincidencias VT3 |
|---|---:|---:|
| Top10 original | **59** | **45** |
| Puestos 11–20 originales | **64** | **48** |
| **Formas Primero por sitio/silueta** | **72** | **43** |
| Promedio cinco controles neutrales | **58,8** | **42,4** |

Los controles individuales neutrales fueron:
- AUX AYER: junio–agosto [56,33,33,36,42], septiembre–octubre [18,17,22,20,17].
- AUX HOY: junio–agosto [34,27,27,27,33], septiembre–octubre [12,13,15,14,10].

El total de cabezas cuyo VT3 fue físicamente formable: **698 en AUX AYER**, **383 en AUX HOY**; no hay expectativa de recuperar las otras cabezas mediante solo un ranking. La media de familias distintas en los tableros fue aproximadamente 115–125 en Ayer y 70–75 en Hoy.

En AUX AYER, los 72 aciertos de Formas Primero fueron **13 más que los 59 del Top10 original** y 8 más que los puestos 11–20, pero la diferencia sigue siendo modesta en relación con 2.975 cabezas evaluadas y hay mucha dependencia entre turnos, hojas y pruebas exploratorias. AUX HOY no mejoró.

## Separación temporal

| Tramo | Ayer Top10 actual | Ayer Formas Primero | Ayer control neutral promedio | Hoy Top10 actual | Hoy Formas Primero | Hoy control neutral promedio |
|---|---:|---:|---:|---:|---:|---:|
| Junio–agosto · 77 jornadas | 38 | 41 | 40,0 | 31 | 29 | 29,6 |
| Septiembre · 26 jornadas | 18 | **25** | 10,8 | 10 | 7 | 8,6 |
| Octubre 12–29 · 16 jornadas | 3 | 6 | **8,0** | 4 | 7 | 4,2 |

**Interpretación:** septiembre es la señal más favorable para Formas Primero en AUX AYER. Octubre sigue por encima del Top10 original (6 vs 3) pero no por encima de la media neutral (6 vs 8). En junio–agosto el método prácticamente empata con el control neutral. Por tanto todavía **no se valida una superioridad estable** que justifique reemplazar el ranking oficial. Las decisiones no se reoptimizaron al ver estos resultados.

### ¿En qué momento de septiembre ocurrió?

En las **seis jornadas sorteables del 24 al 30 de septiembre**, AUX AYER registró **13 coincidencias con Formas Primero** y **4 con el Top10 original**. Antes de esa ventana, del 1 al 23 de septiembre, Formas registró **12** y el original **14**. Así, los **+7** netos de septiembre proceden de la mejora de **+9** en los últimos seis sorteables, compensada por **−2** en los anteriores.

Se trata de una **ventana elegida retrospectivamente por su resultado**; no demuestra que la próxima racha pueda identificarse de manera anticipada. A nivel de jornada completa, en 119 días el selector Formas AUX AYER superó al Top10 original en **30 días**, quedó debajo en **23** y empató en **66**. La diferencia es pequeña, con muchos días empatados.

## Solo Nocturna

| Tramo | Ayer Top10 | Ayer 11–20 | Ayer Formas | Hoy Top10 | Hoy 11–20 | Hoy Formas |
|---|---:|---:|---:|---:|---:|---:|
| Junio–agosto (77 noches) | 6 | 8 | 6 | 5 | 9 | 6 |
| Septiembre–octubre (42 noches) | 3 | 6 | 5 | 4 | 7 | 2 |
| **119 noches** | **9** | **14** | **11** | **9** | **16** | **8** |

En Nocturna, **los puestos 11–20 del motor original fueron más productivos que ambos Top10**, particularmente en AUX Hoy. Es una oportunidad para analizar **la jerarquía del selector**, no una señal suficiente para aumentar cantidad de apuestas.

## Caso de inspección: 29/10 Nocturna, Santa Fe 2813

- VT3 exacta: **813**, familia **318/813**.
- AUX AYER, Top10 oficial: **puesto 12**, fuera de los primeros diez.
- **Formas Primero AUX AYER: puesto 8**, dentro del Top10 reconstruido.
- En la formación geométrica seleccionada constaron **dos eventos ganadores históricos en dos fechas anteriores**. La lectura fue una trayectoria real de tres casillas en la misma AUX Ayer. La selección por ubicación se hizo antes de leer 813 como cifra.
- AUX HOY, ranking histórico original: **puesto 79**; Formas Primero no lo incluyó en Top10.
- Es un acierto encontrado en un **replay histórico PRE**, no una predicción publicada antes del sorteo. No corresponde ajustar un modelo sobre el caso 813 y luego citarlo como prueba predictiva.

## Decisión

- **Mantener la propuesta en laboratorio, especialmente AUX AYER**. No modificar la app oficial ni sus Top10 VT3 por esta evidencia.
- **No recomendar aplicar Formas Primero AUX HOY**: durante 119 jornadas fue 43 vs 45 del motor original, sin superioridad consistente frente a controles.
- **No declarar que el 813 demuestra capacidad predictiva**: muestra que un selector físico diferente puede rescatar una ganadora que cayó al #12, pero no valida el método estadísticamente.
- Investigar a continuación **qué subtipos de respaldo físico PRE** (sitios exactos repetidos en varias fechas frente a siluetas cercanas, cruces entre franjas vs dentro de una franja, anclas) explican las 25 coincidencias de AUX Ayer en septiembre. Evaluar filtros **definidos antes** de volver a mirar otras fechas; si la mejora no sobrevive a controles del mismo número de familias, descartar. Un eventual traslado a producto requeriría registro prospectivo por turno.

## Archivos de reproducción

- `src/labAuxFormasPrimeroVT3.ts`: ranking de sitio y silueta ANTES de dígitos del corte; ventana 6 jornadas, raíces deduplicadas, 10 familias físicas.
- `scripts/test-aux-formas-primero-vt3.ts`: cambio de cifras no cambia prioridad de sitios; exige geometría y veta información futura.
- `scripts/lab-aux-formas-primero-vt3.ts`: comparación pareada, dos auxiliares por separado, top original, puestos 11–20 y cinco controles neutrales.
- `.github/workflows/lab-aux-formas-vt3-junago.yml` y `.github/workflows/lab-aux-formas-vt3-sepoct.yml`: reproducen los 119 días.
- Artefactos: `aux-formas-vt3-junio-agosto` y `aux-formas-vt3-septiembre-octubre`.

**Estado:** investigación experimental sin intervención en APK, interfaz ni MV1.
