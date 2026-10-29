# Etapa visual 1 · Top10 de entrada y minihojas históricas

**29/10/2026 · rama de ensayo. No se modificó main ni se generó APK.**

## Implementado y verificado

1. **Predicción Lalo MV1 y Lalo Auxiliar:** eliminados los botones Top3/5/10. Cada modalidad VT2, VT3 y VT4 muestra siempre hasta diez familias, conservando los puestos, la geometría y la lógica de coincidencias POST; se resaltan de inmediato los aciertos en puestos 4–10. Las tarjetas se compactaron ligeramente.
2. **Top general Lalo ↔ Auxiliar:** compare siempre Top10, sin filtros de tamaño de lista.
3. **Experimental:** Geometría Completa y Configuraciones Conectadas muestran Top10 completo; «Nueva Prueba» deja de figurar como tercer lector. **Los registros PRE y su lógica de lectura/escritura no se borran**; tampoco se alteran resultados antiguos almacenados. El comparador experimental todavía ejecuta el cálculo `trial` por compatibilidad del esquema PRE.
4. **Info → Seguimiento de figuras VT3:** cada fila «Antecedente ganador real» abre una ventana con dos minihojas: ruta física ganadora antigua y ruta física actual. Cada una utiliza celdas, cifras y fuente históricas concretas. Permite cerrar y, si esa familia fue reconocida, entrar en el recorrido actual de Lalo. La lista se mantiene breve; se retiró de esa fila el texto poco intuitivo «traslado vertical ±N filas».
5. **Predicción Lalo VT2:** cada familia Top10 con testigos reales recibe un enlace discreto «Ver minihoja». Abre antecedentes ordenados por fecha/turno de hasta seis jornadas con sorteo anterior y de los turnos previos de hoy; cada cabeza se acompaña de rutas +11 confirmadas y puede recorrerlas una a una. En paralelo se muestra un recorrido de la familia actual; desde allí se conserva «Abrir recorrido actual». Las familias sin testigos comprobados no muestran un falso historial. Los resultados del turno objetivo se excluyen totalmente del PRE de antecedentes.
6. El historial visual **no suma Montevideo como raíz histórica de MV1**, aunque sus coincidencias POST siguen visibles en la hoja y en el cotejo. La ventana de Info muestra **un par de rutas concreto** asociado al antecedente seleccionado; no sustituye el tablero completo.

## Verificación

GitHub Actions, ejecución de Top10/Info: https://github.com/y0t3/Modelo-Papa/actions/runs/40840104392; y verificación de historial VT2 y temporalidad: https://github.com/y0t3/Modelo-Papa/actions/runs/40842485764

- TypeScript sin errores en el código de Android `App.tsx` y `src/**`.
- Regresión del motor Lalo principal aprobada.
- Se separó la comprobación de los scripts históricos porque la rama de partida contenía errores de tipos preexistentes en algunos archivos de `scripts/**`; el chequeo integral no era apto para certificar que la UI se compilaba.

## Pendiente antes de una APK o merge a main

- **Capa contextual del auxiliar:** piloto independiente VT2 AYER/HOY sobre 15 jornadas ya ejecutado y respaldado en [el informe](./aux-vt2-relaciones/INFORME-PILOTO.md). ANTES de añadir etiquetas «salió en X», «sube», «estaba hace siete días», repetir el análisis histórico sobre los **dos modos físicos AUX** independientes: `anterior` (Santiago/Neuquén del día previo) e `intrajornada` (fuentes Santiago/Neuquén disponibles del día, con cortes reales por turno). No aplicar reglas de la +11 ni confundir el desplazamiento en ranking con movimiento de celdas. Estudiar coincidencias/posiciones VT2,VT3,VT4 y raíces con exactitud; controlar cupos Top2 y Top10 pareados, mismas jurisdicciones reales y periodos cortos de 5–6 jornadas.
- **Actualización de producción:** después de evaluar en teléfono la navegación, el zoom, los modales, y el regreso desde las minihojas; generar APK únicamente al solicitar aprobación explícita.

## Criterio de diseño

La vista principal prioriza **coincidencias POST**, después muestra siempre **Top10 completo**. Los rastros detallados no compiten por espacio: solo se abren al tocar un antecedente. Las familias reversibles son grupos de investigación; las cabezas y rutas exactas se muestran como datos comprobables.
