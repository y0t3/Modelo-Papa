# VT3 — espejos físicos y controles negativos (13/10/2026)

Estudio EXPLORATORIO, no ranking de producción. Rama: lab-vt3-espejos-controles-13oct2026.
Base inalterada: auditores VT3 físico vs motor Lalo, 115 cortes/23 jornadas ya reutilizados.
No se toca main, APK, motor, resultados sellados ni VT4. No hacer afirmaciones de predicción a partir de correlaciones retrospectivas.

Hipótesis descriptivas fijadas ANTES del contraste POST:
1. **Cambia-centro**: familia anclada con al menos otro camino físico no anclado en la MISMA fuente, mismos extremos y distinta casilla central (caso 242). Compárese con otras familias ancladas, con controles de densidad.
2. **Segunda fuente sin raíz**: familia anclada con una ruta física adicional en una fuente distinta de las ancladas (caso 615). NO otorgar raíz por proximidad.
3. **Sin anclaje**: familia físicamente válida con cero rutas aceptadas (caso 851). Sólo cobertura e incidencia descriptiva, NO premiar por ausencia de raíz.
4. Control: varias rutas/bloques no son eventos independientes; las familias y sus inversas se agrupan correctamente. Se identifican testigos y negativos con idéntica unidad familia×corte.

Control emparejado por corte y estrato PRE:
- cambia-centro: estado anclado + cantidad fuentes [1/2/3+] + cantidad bloques [1/2/3/4+] + palindromía.
- segunda fuente: estado anclado + cantidad bloques [1/2/3/4+] + palindromía (no emparejar por fuentes, pues es la variable medida).
- sin anclaje: cantidad fuentes + bloques + palindromía (no emparejar por anclaje).
Sólo estratos con positivos y negativos de la señal; no se extrapola fuera de la zona comparable. Esperanza condicional descriptiva: ganadoras en estrato × proporción señal del estrato. Excluir estratos no mezclados de la métrica emparejada. Ninguna expectativa es evidencia estadística confirmatoria. Informar septiembre y octubre separadamente, resultados negativos, conteos de casos y episodios de acierto repetidos por jornada.

Ejecución:
1. PRE: sólo leer PRE_115.json ya congelado en el ensayo de inventario (SHA comprobado), generar etiquetas y listas sin resultados. No abrir POST.
2. Sellar SHA256 de PRE y código.
3. POST: tras restituir POST_115.json, verificar sello, unir por fecha/turno, obtener aciertos y controles.
4. Guardar PRE, SELLO, POST, RESUMEN y caso Nocturna 12/10 **separado y marcado diagnóstico conocido**.
No promover regla al ranking original salvo validación prospectiva real futura.
