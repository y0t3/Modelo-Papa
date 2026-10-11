# Observatorio experimental integrado V8 + V9 + VT0 — 11/10/2026

**Estado:** construido, probado y entregado en esta conversación como `observatorio-integrado-v8-v9-vt0-29-jornadas.zip`, con visor autocontenido `observatorio_integrado_v8_v9_vt0/index.html`. **No se ha alterado main, APK, el motor predictivo, selector o validación física de rutas.** Trabajo de laboratorio.

## Alcance y fuentes

- Reutiliza exactamente las **29 hojas antes de Primera** del 08/09 al 10/10 del observatorio V8, con fuente Nocturna anterior y Previa actual; el 10/10 conserva el snapshot original sellado a las 10:53 ART, SHA256 `99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9`.
- V8 original: rutas dirigidas y fórmula original, puentes históricos **inválidos** entre pares de turno siempre identificados por separado.
- VT0: clave de figura física reversible **fuente+trayectoria canónica**; NO cuenta dos orientaciones como dos dibujos. Rutas válidas sólo si adyacentes, sin reuso, sin vacíos y dentro de una única fuente.
- V9: **sin score antiguo**; simple bitácora descriptiva para cada figura V8 legal: ya disponible en columna anterior / se vuelve disponible con Previa; huella exacta D−1 o D−7 si está documentada; marca exacta ya confirmada de Previa / mero contacto de celdas.
- D−1/D−7 recuperados de las hojas históricas verificadas; en **9 jornadas** no hay anotaciones verificadas en el dataset y se indica *sin documentación*, nunca *sin memoria*.

## Tests integrales, resultados

| Prueba | Resultado |
|---|---:|
| Jornadas | **29** |
| Ternas-fecha V8 sin filtrar | **8.259** |
| Recorridos dirigidos V8 | **18.096** |
| Dirigidos sin cruzar fuentes | **9.512** |
| Dirigidos con cruces V8 prohibidos | **8.584** |
| Instancias de huella legal por terna-fecha, inversa deduplicada | **9.028** |

Las 29 jornadas conservaron el número de rutas V8 originales. **Antifuga:** se eliminaron todas las cabezas futuras de Primera en cada jornada y los metadatos V9/VT0 resultaron idénticos para los 29 casos. Pruebas de frontera, vecindad, celdas distintas e inversión. El HTML se probó con Chromium real: cambiar fecha y número, dos figuras VT0 de `654`, destacar figura, detectar falta de D−1/D−7, sin errores de JS.

## Ejemplo que muestra utilidad pero NO valida selección

**10/10 antes de Primera:**
- `393` V8 primer puesto, **2** recorridos dirigidos, **2** cruces prohibidos, **0** huellas VT0 válidas; por definición no tiene persistencia ni confirmación física V9 dentro del método actual.
- `654`: **2** huellas VT0 válidas en `prevNocturno`, **1** misma huella exacta D−1 proveniente de Santa Fé Previa 09/10 cabeza completa `4843` (VT3 vieja `843`, nueva `654`), **2** figuras tocaban las marcas VT2 `56` de la Previa Ciudad `0956`. NINGUNA de esas señales constituye pronóstico `654` de Primera, que no salió en ese turno.
- Este contraste demuestra **capacidad de explicar y falsar geometrías**, no capacidad de elegir números ganadores.

## Artefactos de laboratorio

- `index.html`, visor autosuficiente con las tres capas.
- `DATOS_INTEGRADOS_29_JORNADAS.json`: todas las figuras, incluidas las no coincidentes, con detalles D−1/D−7 por cabeza antigua.
- `construir_integrado.py`: cómputo reproducible sin consultar resultados objetivo.
- `renderizar_visor.py`: integración visual de la capa V9+VT0 sobre observatorio V8 original.
- `PRUEBAS_Y_BALANCE.json`, `probar_visor.py`, captura `vista_654.png`, `INFORME_INTEGRACION.md`.

**Siguiente etapa propuesta:** ampliar de *VT3 antes de Primera* a VT2/VT3/VT4 y los cinco cortes del día; separar estrictamente huellas disponibles, huellas históricas, figuras reconfirmadas y contactos; luego un registro prospectivo de selecciones y abstenciones sin sesgo retrospectivo. No transferir ranking V8/V9 al motor vigente por ahora.
