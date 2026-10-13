# VT3 — Inercia física frente a evidencia nueva del tercer candidato
**13/10/2026 · Rama:** `lab-vt3-inercia-recorridos-tercero-13oct2026`. **Solo experimento**, sin cambios en `main`, VT3/VT4 oficiales, app, hoja física, predicciones selladas ni APK.

## Hipótesis diagnóstica
En `FUSION_CONSERVADORA` las primeras dos familias del Top3 original quedan intactas y la tercera se elige por semejanza física con ganadoras de la semana X. En los 90 cortes evaluados, la tercera propuesta fue siempre una familia físicamente real fuera del Top10 oficial; aparecieron repeticiones considerables de familias (p. ej. `253/352` diez veces y `066/660` siete). ¿El aprendiz repite esa tercera porque llega **evidencia nueva** en el tablero +11 o por **inercia** de un mismo recorrido presente en fuentes anteriores?

Este ensayo **no** aprende nuevos pesos ni genera un nuevo Top. Audita todas las 90 selecciones congeladas anteriores, independientemente de si ganaron o fallaron, y las compara con terceras elegidas neutrales con idéntica plaza.

## Definiciones PRE
Fuente física inmutable `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`, SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`. Inventario PRE anterior `auditorias/vt3-control-tercer-puesto-90-13oct2026/PRE_90.json`, SHA256 `5f506c1cde4988105da3bb7d1914379f9ebd5a3f8c68770b93022f1625bdacf0`.

**Ruta física independiente:** `fuente|lista de celdas` con normalización de invertir sus tres celdas. Dos recorridos de una misma familia en otra fuente son diferentes; dos inversiones del mismo camino **no** representan nueva evidencia. Todos tienen 3 celdas distintas, vecinas consecutivas, dentro de una única fuente válida para el turno. Conservamos ALL los testigos físicos y todas las raíces propias; no prestamos raíces a otras familias.

**Evento de raíz histórica:** `fecha|D−1/D−7|turno|jurisdicción|cabeza completa`. Varios `rootIds` por la misma cabeza/evento no constituyen respaldo independiente. Una familia nueva físicamente sin raíz tiene **cero** eventos.

**Comparación entre turnos de la misma fecha:** tomar el turno anterior inmediato (Previa→Primera→Matutino→Vespertino→Nocturno) y comparar la misma familia, cuando existía físicamente. Desglosar:
- `primeraAparicion`: no estaba físicamente disponible en turno anterior.
- `identica`: mismo conjunto de rutas físicas fuente/casilleros y mismos eventos históricos de raíz.
- `nuevasRutasSinEvento`: aparecen rutas adicionales pero ninguna cabeza histórica propia adicional.
- `nuevoEventoRaiz`: aparece al menos un nuevo evento de respaldo propio comprobado (con/sin rutas nuevas).
- `desaparecenRutas`: rutas anteriores dejan de estar presentes, auditar como posible cambio de hoja; no asumir monotonía.
Registrar cuántas rutas nuevas pertenecen a la **fuente añadida en ese turno**, vs rutas provenientes de fuentes ya existentes, y los bloques físicos reales y valores propios, sin cifras añadidas de VT4.

Las repeticiones se miden separadamente: misma tercera **en el corte inmediatamente anterior del mismo día**, misma tercera en un corte anterior de ese día pero no consecutivo, y repetición entre fechas. No confundir «familia repetida» con «mismo recorrido repetido»: comprobar intersección de rutas y eventos para cada reaparición.

## Diseño y separación temporal
- PRE en GitHub Actions: aislar físicamente TODOS los POST históricos y restaurar solo los dos PRE de arriba. Crear huellas por cada familia/corte, y `PRE_90.json` con listas de candidatos neutrales externas al Top oficial. Guardar `SELLO.json` (hashes de script, protocolo, fuente y PRE), con fecha y semillas.
- **POST:** leer las terceras propuestas **congeladas por el laboratorio de semana X→X+1**, vía `auditorias/vt3-control-tercer-puesto-90-13oct2026/POST_90.json`. Ésta es salida POST de una auditoría anterior que incluye la propuesta físicamente generada antes de las cabezas; validarla contra `auditorias/vt3-dominio-semanal-top3-top5-115-13oct2026/POST_115.json` para impedir sustituciones ex post. Solo entonces leer las cabezas objetivo para etiquetar el acierto; registrar todo el universo negativo.
- Controles **5.000 × 90 cortes**: terceros neutrales uniformes entre familias físicas externas, y neutrales del **mismo estado anclada/no anclada y misma categoría de cantidad de rutas** de la tercera aprendida en cada corte. No cambiar primera y segunda plazas ni capacidad del Top. Generar usando semilla y algoritmo prespecificados, nunca elegir la réplica con mejores aciertos.
- Diagnósticos neutrales: número de familiares terceros **distintos**, repetición consecutiva dentro de día, reaparición intradía, total de propuestas `identica`/ `nuevoEventoRaiz`/ `nuevasRutasSinEvento`; promedio de rutas añadidas y eventos raíz nuevos; porcentaje de segundas visitas al mismo origen físico.
- Dividir por turno y semana. Mostrar si la única familia aprendida ganadora, `246/642` de Vespertina 21/09, llegó con rutas/raíces nuevas, **sin derivar una regla de ese éxito**. Informar la categoría de todos los terceros no ganadores también.
- Contraste: si el aprendizaje repite el mismo tercero mucho más que un control neutral, distinguir si esa frecuencia resulta de copiar rutas previas (inercia) o de nuevo respaldo. Si no supera controles, no hay justificación para cambiar VT3 ni VT4.

## Límites
Este corpus se ha reutilizado en decenas de estudios, y la lotería es aleatoria. Repetición de rutas/cabezas históricas es una característica descriptiva del tablero y no garantiza éxito predictivo. Un resultado exploratorio no promocionará un nuevo puntaje. Registrar todos los hallazgos negativos y la distinción «ruta nueva» frente a «evento raíz nuevo».

Entregables: `scripts/lab-vt3-inercia-tercero.mjs`, `.github/workflows/lab-vt3-inercia-tercero.yml`, `auditorias/vt3-inercia-tercero-90-13oct2026/{PRE_90.json,SELLO.json,POST_90.json,RESUMEN.json}` e informe Markdown.
