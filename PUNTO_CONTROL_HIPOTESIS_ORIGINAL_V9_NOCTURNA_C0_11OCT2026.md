# V9 y la hipótesis original de Papá: concentración en Nocturna anterior +11

**Fecha:** 11/10/2026. **Resultado de auditoría realizada con 29 días y 145 cortes históricos** (08/09–10/10/2026). Rama experimental `auditoria-sorteo-10oct-2026`, sin cambios en `main`, motor visual vigente, selector ni APK.

## Hipótesis recuperada correctamente

El padre sospechaba que la **fuente Nocturna del sorteo anterior (+11)** concentraba más recorridos físicos que luego eran confirmados por cabezas de distintos turnos. **No es requisito ni exclusión:** cualquier otra columna puede generar candidatos. Se debe reconocer **la misma figura física en cualquiera de sus dos orientaciones** como acierto de familia, conforme a la corrección recién consensuada.

## Qué estaba haciendo el V9 real

En `motor_v9.py` original recuperado de Library y `VF-Quiniela/src/engine.ts`, la variable `c0` recibía **coeficiente fijo 0,12** en el score. También se premiaba `birth`, `persist`, `reinforcement`, `recent`, `convergence` y `newsource`. **El V9 no aprendía ni recalibraba los pesos a partir de errores/aciertos nuevos**; era una fórmula heurística. Más aún, importaba el enumerador V7, que permitía **puentes prohibidos entre fuentes**, y calculaba `persist` sobre tableros acumulativos: la mera disponibilidad mecánica de la primera columna sumaba persistencia, aun sin una marca ganadora. Por tanto se debe evitar portar su score a producción.

## Recuento físico 29 jornadas

Fuente: expedientes independientes `CORTES_PRE_SIN_CABEZAS_OBJETIVO.json` y `RESULTADOS_POST_TODOS_NEGATIVOS.json` del observatorio de 145 cortes; solo cinco jurisdicciones argentinas a fin de igualar cobertura. Todas las trayectorias VT2/VT3/VT4 adyacentes dentro del **mismo par de turno**, sin celdas reutilizadas y con inversión deduplicada.

**Marcado durante toda la jornada:** suma de familias físicas únicas confirmadas por fuente y día (sin volver a contar una misma figura marcada en distintos turnos): Nocturna anterior **432**, Previa **295**, Primera **270**, Matutino **154**, Vespertino **108**. C0 tiene el mayor número exclusivo de familias en **18/29** días (19/29 si empata), y el máximo de eventos confirmados por corte en **19/29**. **No permite inferir superioridad**, porque fuente 0 se observa en cinco cortes diarios vs 4/3/2/1 para las demás.

**Control equilibrado: antes de Nocturna**, con las cinco fuentes presentes en el mismo corte cada fecha:

| Fuente | VT2 físicas confirmadas | VT3 | VT4 | TOTAL |
|---|---:|---:|---:|---:|
| Nocturna anterior +11 | **66** | **30** | 8 | **104** |
| Previa +11 | 66 | 25 | 9 | 100 |
| Primera +11 | 68 | 13 | 3 | 84 |
| Matutino +11 | 53 | 25 | 7 | 85 |
| Vespertino +11 | 62 | 29 | 17 | **108** |

**C0 ocupa el primer lugar sin empate en solo 5 de los 29 Nocturnos**, cuando se exige igualdad de etapa. Eso tampoco explica por sí solo la concentración, porque fuentes tienen cantidades diferentes de recorridos posibles según vacíos y geometrías.

**Tasa confirmada por figuras posibles**, fuente 0 versus las cuatro restantes en bloque, mismo corte Nocturno:
- VT2 **66/754 = 8,75 %** en C0 frente a **9,74 %** otras.
- VT3 **30/2668 = 1,12 %** en C0 frente a **1,04 %** otras.
- VT4 **8/7772 = 0,103 %** en C0 frente a **0,145 %** otras.

Control descriptivo 3.000 permutaciones de paquetes completos de cinco cabezas Nocturna entre fechas (semilla fijada, preservando cada tabla y las combinaciones de cabezas): las diferencias C0-resto están dentro de la banda usual para las tres modalidades; **no surge una señal robusta**. En rigor no es una prueba prospectiva, y las huellas no son observaciones independientes.

**Memoria física heredada del día anterior y semana anterior, antes de Nocturna**:
- D−1: C0 **22/439 (5,01 %)**, otras columnas **56/886 (6,32 %)**.
- D−7: C0 **30/380 (7,89 %)**, otras columnas **46/703 (6,54 %)**.
Esto sugiere una **pequeña pista descriptiva en D−7**, que no se reproduce de igual modo en D−1 y varía por VT/fuente; no basta para fijar prioridad predictiva.

## Prueba de prioridad opcional, nunca obligación

**1.305 decisiones PRE** de tres reglas × VT2/VT3/VT4 × 145 cortes, guardadas ANTES de abrir POST, SHA256 **`b8fda6797b94de764a1dd2ba5b76f36999cd96ea69d3df7c55659a3ee7281a69`**. Fuente candidata heredada D−7 en primer orden, D−1 complementaria, confirmaciones y contactos ya conocidos del día, desempate estable.

| Estrategia | Elegidas VT2 | De C0 | Aciertos de familia VT2 | Aciertos VT3 | VT4 |
|---|---:|---:|---:|---:|---:|
| Sin preferencia de origen | 140 | 97 | **10** | 0 | 0 |
| C0 **solo desempata** respaldos iguales | 140 | 104 | **11** | 0 | 0 |
| C0 siempre primero si hay familia | 140 | 140 | **10** | 0 | 0 |

En VT2 el desempate cambió **solo 7 selecciones** y sumó 1 acierto; el enfoque extremo cambió 43 y obtuvo cuatro aciertos nuevos a cambio de cuatro perdidos. Ambos son análisis históricos derivados de un diseño **posterior al conocimiento de fechas y resultados**, con fuerte dependencia entre cinco cortes del mismo día. **No prueba aprendizaje ni ventaja rentable**.

## Decisión y recomendación

**Sí rescatar el propósito de V9, no su fórmula original.** Redefinir el componente V9 de laboratorio como `observador_origen_c0`: por figura VT0 reversible y fuente, registrar oportunidad física, D−7, D−1, cabeza antigua original, reconfirmación real de turnos ya sorteados, concentración absoluta **y normalizada por número de trayectorias posibles**. En futuras validaciones o ejercicios de separación cronológica, la preferencia Nocturna +11 será una hipótesis **flexible**; no se invalidarán familias acertadas en sentido inverso ni se rechazarán fuentes alternativas. Exigir evaluaciones temporales *entrenar con pasado -> fijar -> evaluar futuro*, nunca convertir resultados POST del mismo día en predicción PRE.

**Material reproducible entregado en el chat:**
- `hipotesis_nocturna_v9_11oct/index.html`: visor interactivo de concentración bruta contra normalizada por fecha, turno Nocturno, modalidad.
- `INFORME_HIPOTESIS_NOCTURNA_V9.md`, `RESULTADOS_HIPOTESIS_V9_NOCTURNA_29_DIAS.json`.
- `prueba_prioridad_c0_PRE_POST.py`, `DECISIONES_FAMILIAS_V9_C0_PRE_FIJADAS.json`, `HASH_PRE.txt`, `COTEJO_POLITICAS_PRIORIDAD_C0_POST.json`.
- `analizar_hipotesis_nocturna.py`, `crear_informe_y_visor.py`, `insumos/` (copias PRE y POST originales), ZIP `hipotesis-original-v9-nocturna-memoria-29-dias.zip`.
- SHA, recuentos, JS sintáctico y archivo ZIP comprobados; Chromium no está instalado en esta sesión, **no afirmar que la UI se probó en navegador**.

No modificar APK ni motor oficial por esta revisión.
