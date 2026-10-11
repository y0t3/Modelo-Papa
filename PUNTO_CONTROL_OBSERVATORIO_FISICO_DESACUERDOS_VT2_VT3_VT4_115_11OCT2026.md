# Punto de control: observatorio físico de desacuerdos VT2 D−7/V9 con madres VT3 y hermanas VT4 (115 cortes)

**Fecha de prueba: 11/10/2026.** Se siguió investigando únicamente con las hojas y resultados ya disponibles. **Ningún motor oficial, hoja de marcado, selector de pronósticos ni APK se modificó.** Este es un laboratorio retrospectivo, NO un resultado futuro sellado.

## Motivo y fuentes reutilizadas (sin repetir laboratorios)

- Top3 D−7 y V9 del **laboratorio independiente congelado** de 115 cortes, sin cambiar su bolsa ni sus scores.
- VT3 y grupos hermanos VT4 D−7 del paquete **corregido por entradas crudas de cinco caracteres** (últimas cuatro cifras como hace la app). Sus **115 tableros fuente coinciden exactamente** con VT2; no se mezcló la antigua versión con celdas faltantes.
- 23 jornadas históricas, 115 cortes (70 septiembre + 45 octubre), objetivo cinco jurisdicciones argentinas; físicamente seis filas +11 (también Montevideo).

## Contacto geométrico real VT2→VT3

Se define **puente físico** sólo cuando una familia VT2 y una madre VT3 comparten **el mismo par de celdas consecutivas dentro de alguna ruta VT3 y la misma fuente**, sin cruzar las dos columnas de origen de otra fuente, sin vacío ni reutilización. Se conserva cada ruta alternativa, la ruta confirmada de D−7 y toda la genealogía; invertir una hija VT4 no crea una nueva madre VT3. No basta con coincidencia verbal de cifras.

## Cotejo de Top3 por corte (115)

| Resultado | Cortes |
|---|---:|
| Ambos aciertan | **21** |
| Sólo V9 | **15** |
| Sólo D−7 | **12** |
| Ninguno | **67** |

Acumulados D−7 **33/115**, V9 **36/115**; el balance V9−D−7 es +3 pero no hay mejora confirmada. Entre los 345 puestos de Top3 de cada política, **160 familias-posición son compartidas** y **185 posiciones son exclusivas a cada método**.

| Rasgo físico de familias exclusivas | Entran por V9, 185 | D−7 desplazadas, 185 |
|---|---:|---:|
| Con puente VT2→VT3 del universo heredado D−7 | **157** | **180** |
| Sin puente VT3 heredado | **28** | **5** |
| Familia coincide con POST (exposiciones, NO cortes) | **25** | **22** |
| Confirmaciones reales anteriores (promedio) | **1,23** | **0,00** |
| Rutas transferidas D−7 (promedio) | **5,66** | **8,91** |
| Fuentes D−7 distintas (promedio) | **1,46** | **2,48** |
| Rutas VT2 actuales (promedio) | **2,68** | **4,29** |

Esto documenta el **conflicto interpretable**: V9 prioriza reconfirmaciones anteriores, a veces desplazando figuras más ricas en fuentes, geometrías y madres VT3 heredadas. No significa que mayor número de trazos prediga resultados. Tampoco sirve usar la ausencia de VT3 heredada como veto.

Por turno: Previa D−7/V9 Top3 idénticos en los 23 casos; Primera 6/23 idénticos; Matutina, Vespertina y Nocturna 0/23. D−7/V9 aciertos por turno: Previa 8/8; Primera 6/7; Matutina 8/7; Vespertina 5/6; Nocturna 6/8.

### Casos positivos y negativos para inspección visual

- **05/10 Vespertina**: D−7 `78,07,38`; V9 `17,29,13`; coincide `13/31` y gana sólo V9. `13` tiene una confirmación previa real y tres madres VT3 heredadas físicamente conectadas.
- **07/10 Nocturna**: D−7 `79,27,29`; V9 `12,06,28`; coincide `79/97` y gana sólo D−7. `79` tenía cuatro fuentes de origen D−7, doce huellas heredadas, seis caminos VT2 y cinco madres VT3 conectadas.
- **19/09 Primera**: gana sólo V9 con `39/93`, sin puente con VT3 heredada; no imponer un filtro VT3.

## Ejecutado y verificado

- **7.684** rutas VT2 físicas válidas auditadas.
- **17.478** contactos físicos VT2→VT3 auditados; son pares de rutas solapadas, **NO señales independientes**.
- Las rutas VT3 relacionadas también se auditaron; no hay salto de casilleros, cruce de fuentes ni reutilización.
- SHA256 del PRE completo **`83a5721f84f9b6abfd3cedd26db5900a620ef4c1e9fa11418b134a96d1e10109`**; PRE recalculado con POST físicamente apartado, **idéntico**.
- Visores offline `OBSERVATORIO_PRE_115.html` y `OBSERVATORIO_POST_115.html` incluyen selector de fecha/turno/familia/orden, dibujan la hoja del día y la hoja D−7 por separado, con VT2 actual, madre VT3 físicamente conectada, huellas antiguas y extensión con hijas orientadas e inversas distintas; PRE no revela objetivos. **Ambos probados en Chromium con Playwright**, cambio a 07/10 Nocturna, visualización de `79/97`, sin errores JavaScript.
- El ZIP de conversación **`modelo-papa-observatorio-visual-discrepancias-vt2-vt3-vt4-115-11oct2026.zip`** contiene 12 archivos: programa de observación, generador de visores, auditor de PRE, insumos VT2/VT3/PRE, POST separado, tabla CSV con los 115 cortes, HTML e informe. **5.019.791 bytes, SHA256 `30a318c4f2fc79d983c1948a731cc83db8a5e45a223cfc24792857e4ec668320`**; ZIP pasó test de integridad y **cinco salidas** se regeneraron byte por byte con hashes iguales desde un directorio aislado.
- Script de GitHub para repetir chequeos sobre ese ZIP extraído: [`scripts/verificar-observatorio-discrepancias-115.cjs`](scripts/verificar-observatorio-discrepancias-115.cjs). Uso: `node scripts/verificar-observatorio-discrepancias-115.cjs <carpeta_zip_extraido>` (requiere Python 3).

## Decisión inmediata

**No se necesita esperar información futura para continuar.** El siguiente trabajo sobre las mismas hojas es visualizar y aislar los conflictos entre: (a) persistencia y movilidad de huellas D−7, (b) confirmación anterior V9, (c) puentes VT2→VT3, y (d) **qué dígito concreto forma las dos hijas VT4** —no solo cuántas rutas existen. Mantener cada observador independiente y los negativos visibles; no inventar mejora predictiva o introducir un bono de V9, madre VT3 o roce sin evidencia. Los anteriores Top se conservan y las extensiones siguen agrupadas por madre.
