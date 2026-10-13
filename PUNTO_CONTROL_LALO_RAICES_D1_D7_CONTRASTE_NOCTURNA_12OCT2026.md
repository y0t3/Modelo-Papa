# Modelo Lalo · Auditoría D−1/D−7 y contraste nocturno 12/10/2026

**Investigación retrospectiva independiente; NO modifica motor oficial, selector, main ni APK.**

## Base
- Origen: visores `VISOR_APOYO_VT3_PRE.html` / `VISOR_APOYO_VT3_POST.html` ya conservados en Biblioteca/Proyecto, derivados del laboratorio sellado de 115 cortes.
- PRE y POST contienen 119 registros: los 115 históricos (15/09–10/10, 23 jornadas) y cuatro PRE del 12/10 hasta Vespertina; los objetivos de esos cuatro registros están vacíos en PRE.
- Se cotejaron por fecha y turno los 115 registros PRE y POST: 0 desajustes.
- Se reprodujo la selección VT3 oficial: Top3 5/115, Top5 8/115 y Top10 15/115.

## Resultados: respaldo por procedencia histórica
Se clasificó **cada exposición familia×corte** por `d1Roots>0` y `d7Roots>0`. Fecha doble NO significa independencia geométrica demostrada.

| Procedencia PRE | Exposiciones | Coincidencias elegibles POST | Esperanza proporcional a la bolsa PRE por corte |
|---|---:|---:|---:|
| Sólo D−1 | 2.734 | 33 | 26,32 |
| Sólo D−7 | 2.598 | 23 | 27,66 |
| Ambas fechas | 1.057 | 8 | 10,02 |
| **Total** | **6.389** | **64** | **64,00** |

Las 64 son coincidencias familia×corte de toda la bolsa; **no** 64 aciertos del Top10, ni eventos independientes. No se estima significación aquí. La fecha doble no muestra ventaja general. Falta reconstruir identidades de raíz histórica y geometría para separar bifurcaciones hermanas de antecedentes genuinamente independientes.

## Sensibilidad de rankings (ensayos retrospectivos exploratorios)
Sin aumentar los cupos, se reordenó la **misma bolsa PRE** por rasgos conocidos antes del sorteo, desempatando con el rango oficial.

| Criterio | VT3 Top3/115 | VT3 Top10/115 |
|---|---:|---:|
| Ranking oficial | 5 | 15 |
| Primero con D−1 y D−7 | 6 | 14 |
| Número total de raíces registradas `d1Roots+d7Roots` | 7 | 15 |
| Cociente raíces / bifurcaciones | 5 | 16 |
| Reservar un puesto a familia de ambas fechas | 6 | 15 |

Ninguna alternativa prueba mejora prospectiva; la de cociente cambia prácticamente todos los rankings y su incremento Top10 (+1) es inestable. Son comparaciones múltiples realizadas tras estudiar estas fechas. **No implementar ni promover reglas.** Estas variables son indicadores de procedencia histórica, no un recuento certificado de geometrías independientes.

## Nocturna del lunes 12 de octubre: contraste externo con fecha explícita
Primeras cabezas reportadas por fuentes que identifican explícitamente **12/10/2026 Nocturna**:
- Ciudad: **9851** — https://www.tujugada.com.ar/quiniela-nacional.asp?sorteo=09062026
- Provincia: **1615** — https://m.ruta1000.com.ar/index2008.php/index2008.php?FechaAlMinuto=2026_10_12
- Córdoba: **7242** — https://www.lanacion.com.ar/loterias/quiniela-cordoba/
- Santa Fe: **8290** — https://tomboleros.com/loteria-santa-fe/quiniela
- Entre Ríos: **3264** — https://soytimbero.com/quinielas/entre-rios
- Montevideo: figura **SIN SORTEO** en el sitio Ruta 1000, por lo que no se imputa cabeza.

**Precaución de fecha:** numerosos sitios mostraron 4324 (Ciudad), 2654 (Provincia), 1044 (Córdoba), 6215 (Santa Fe), 0564 (Entre Ríos) como «últimos nocturnos», pero corresponden al **sábado 10/10**, no al lunes 12/10. No deben usarse como POST del día 12.

### Control PRE anterior al sorteo: Vespertina 12/10, NO pronóstico Nocturna oficial
El visor PRE contiene 12/10 hasta **Vespertino**: 58 familias VT3, Top3 `565/565, 556/655, 555/555`, Top10 `565/565, 556/655, 555/555, 365/563, 536/635, 276/672, 265/562, 526/625, 255/552, 356/653`.

Comparando estrictamente ese corte PRE congelado de Vespertina con las cinco primeras cabezas reportadas para Nocturna:
- 9851 → `158/851`, ausente en las 58.
- 1615 → `516/615`, disponible en **puesto 51/58** (sólo fuente Primera; `d1Roots=0`, `d7Roots=1`).
- 7242 → `242/242`, ausente.
- 8290 → `092/290`, ausente.
- 3264 → `264/462`, ausente.

**No contabilizar esto como acierto o fallo del PRE nocturno oficial.** Antes de Nocturna se incorpora Vespertina como una fuente nueva; puede alterar bolsa y ranking. Existe el archivo `Modelo-Lalo-Nocturna-12oct-PRE-sellado.zip` (3.457 bytes) en Biblioteca del proyecto, pero en esta sesión no fue posible materializar sus bytes: el sistema devolvió «This Project file does not have an authorized raw-byte materialization path». Sus propuestas selladas no se leyeron y NO deben reconstruirse retrospectivamente usando el resultado.

## Próximo paso
1. Recuperar bytes legibles del PRE Nocturna sellado y del ZIP del laboratorio de 27 archivos, validando SHA256 (del informe anterior: `4c9e81c082faf0d2522fe6a012ec19ca825b50ecca002314318107bbc91f8ae3` para ZIP histórico).
2. Identificar raíz como **fecha histórica + fuente + ruta original + cabeza completa**, distinguiendo raíces de apoyo y meros caminos/bifurcaciones de la misma raíz; comparar con D−1/D−7.
3. Ejecutar retroprueba íntegra de VT3 y después presupuesto fijo de diez madres VT3 → hijas VT4 con recorridos propios; validación con nuevos cortes prospectivos.
4. Conservar motor oficial y APK intactos hasta que exista evidencia robusta.

*Fecha del informe: 12/10/2026. Todos los resultados históricos son exploratorios; no implican una ventaja predictiva.*
