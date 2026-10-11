# Prueba experimental de reutilización V9 + VT0 — 3, 9 y 10 de octubre de 2026

**Estado:** realizada el 10/10/2026, después de los cinco sorteos. Rama exclusiva `auditoria-sorteo-10oct-2026`. **No se modificaron** `main`, motor predictivo, selector, APK ni rama de rediseño. No se seleccionó ninguna cabeza/sentido antes de los resultados. La implementación y pruebas reproducibles están en el paquete `rescate-v9-vt0-3-9-10oct-2026.zip` generado para el usuario en esta conversación, con `analizar_geometrias.py`, expediente original íntegro de la jornada 10/10, JSON exhaustivo, atlas HTML y reporte.

## Integridad de entrada y tipo de evidencia

Se reutilizó el expediente completo auditado del 10/10 `COMPARACION_EXHAUSTIVA_NEGATIVOS.json`, con los **39 trazos originales reconstruidos del 09/10** y **68 del 03/10** en su documentación de origen; cuando se reinterpretan sobre las cinco fuentes completas de Nocturna, quedan **34 geometrías únicas D−1** y **50 D−7** (las inversiones y múltiples cabezas sobre un camino cuentan una sola vez). Se verificaron las capturas PRE originales auténticas:
- **Antes de Previa** 09:04 ART, SHA256 JSON `19d3357c82e59dbf5050ed7941f160b7e4c04a1a0875fb5e25de9147a245ea4b`.
- **Antes de Primera** 10:53 ART, SHA256 JSON `99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9`.

Los tres cortes posteriores (Matutino, Vespertino, Nocturno) son reconstrucciones retrospectivas **sin fotografía sellada antes del objetivo**, aunque las columnas se forman en el orden cronológico y exclusivamente con fuentes anteriores al objetivo. Las marcas antiguas digitales siguen pendientes de validación cuadro a cuadro con la tinta original manuscrita.

## Prueba 1 — V9: nacimiento de fuente no es reconfirmación por cabeza

| Turno objetivo | Fuentes +11 disponibles | Todos los caminos físicos VT2+VT3+VT4 posibles | Nuevos caminos por columna | Figuras heredadas únicas | Heredadas compatibles POST |
|---|---:|---:|---:|---:|---:|
| Previa | 1 | 386 | 386 | 17 | 1 |
| Primera | 2 | 679 | 293 | 35 | 2 |
| Matutino | 3 | 972 | 293 | 62 | 2 |
| Vespertino | 4 | 1265 | 293 | 72 | 2 |
| Nocturno | 5 | **1.558** | 293 | **75** | **8** |

Las **386** geometrías físicamente posibles de la primera fuente persisten sin cambios hasta el último turno **por construcción**. Esto invalida interpretar `persist` de V9 sobre el tablero acumulado como si fuera una repetición de marca ganadora. Las marcas confirmadas por cabezas posteriores son otro tipo de evento.

## Prueba 2 — VT0: identidad física reversible y seguimiento retrospectivo

- **40 figuras físicas únicas** confirmadas después de resultados del sábado; **9** reconfirmadas en dos o más turnos.
- De las **34 geometrías únicas** heredadas del 09/10, **8** fueron confirmadas exactamente por alguna cabeza el 10/10. **26** no fueron confirmadas exactamente. En las ocho: 4 con lectura anterior reusada, 3 con solo lectura inversa, 1 con ambas orientaciones confirmadas.
- De las **50 geometrías únicas** heredadas del 03/10, **5** fueron confirmadas exactamente por alguna cabeza el 10/10. **45** no fueron confirmadas exactamente. Entre esas cinco: 2 solo inversa, 3 ambas orientaciones.
- Hay **una figura exacta** compartida entre los conjuntos confirmados D−1 y D−7: VT2 `prevNocturno` celdas `0:0↔0:1`, lecturas `37/73`; el resultado Primera Entre Ríos `2473` confirma 73. En el origen D−1 el sentido coincidía; en el D−7 fue la lectura inversa.
- Unión de antiguas geometrías **exactamente reconfirmadas** el 10/10: **12**; las otras **28** de las 40 figuras que aparecieron entre turnos no coincidían exactamente con ninguna de las dos memorias (aunque otras relaciones por forma/contacto pueden existir).
- Ejemplo D−1 VT3: cabeza antigua 09/10 `4843` Santa Fé Previa marcó `843`, huella `prevNocturno` `3:0→4:1→4:0`; el 10/10 confirma `654` en Provincia Nocturna `2654` sobre esa misma figura. No es pronóstico humano.
- Ejemplo de inversión VT2 D−7: antigua cabeza `3610` dejó figura `37/73`, el 10/10 Primera Entre Ríos confirmó `73`.

## Prueba 3 — relaciones físicas, con TODOS los ausentes

Categorías son exclusivas por prioridad para resumir, **pero todas** las comparaciones contra nuevas figuras compatibles en fuente y largo se conservan en JSON, incluidas las que no reaparecen:

| Relación prioritaria | D−1, 09/10 (34) | D−7, 03/10 (50) |
|---|---:|---:|
| MISMA_HUELLA | **8** | **5** |
| MISMA_FORMA_DESPLAZADA | 16 | 17 |
| TOQUE_DE_EXTREMO | 6 | 8 |
| TOQUE_INTERNO | 1 | 0 |
| SIN_CONTACTO | 1 | 1 |
| SIN_FIGURA_COMPARABLE | 2 | 19 |

**No valorar una forma desplazada como más predictiva**: las VT2 cortas comparten topología fácilmente y las relaciones se calculan después de conocer las marcas. `SIN_FIGURA_COMPARABLE` indica que ninguna figura de misma modalidad y fuente fue *confirmada* hoy, no que la ruta fuese imposible en el tablero.

## Comprobaciones técnicas efectuadas

Pruebas Python 3 aprobadas: identidad reversible, prohibición de cruces entre fuentes, vecindad estricta, prohibición de saltos/reuso, traslación geométrica, comprobación de las dos capturas preturno por SHA256, presencia de todas las figuras previas al añadir otra columna, coincidir con 40 figuras confirmadas y nueve reconfirmadas del expediente. También se comprobó la sintaxis del visor HTML y su JavaScript en Node.

**Conclusión:** recuperar de VT0 la **firma canónica reversible**, y de V9 el **registro temporal descriptivo** diferenciado entre `nace columna / existe geometría / fue marcada por cabeza posterior`. Incorporar la métrica V8 solo como observatorio sin puntuaciones. **No copiar** enumerador original V7/VF con cruces entre fuentes, ni el ranking V8/V9, ni convicción, ni V11/V13/V14. **No hay evidencia prospectiva de mejor selección**; siguiente etapa debe exigir elecciones y abstenciones anteriores a sorteos con un control ciego.

## Archivos y navegación

- Paquete reproducible descargable de la conversación: `rescate-v9-vt0-3-9-10oct-2026.zip`.
- Visor: `index.html`: tablero del 10/10 con cinco columnas y cabezas antiguas D−1/D−7 tocables, que iluminan todas las geometrías físicas; también cabezas confirmadas del 10/10; el resto permanece tenue.
- Informe completo: `INFORME_RESCATE_V9_VT0.md`.
- Datos íntegros: `ANALISIS_TODOS_RECORRIDOS_NEGATIVOS.json`.
- Ejecución: `python analizar_geometrias.py --source fuente_cierre_10oct.zip --out .`.
