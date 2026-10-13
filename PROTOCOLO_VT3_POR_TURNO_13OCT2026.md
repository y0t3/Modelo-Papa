# VT3: contraste de Matutino vs Vespertino y selección por turno (13/10/2026)
Laboratorio derivado **después de observar** que 8/15 Top10 originales ocurrieron en Matutino y 0/15 en Vespertino. Es análisis explicativo POST, NO hipótesis pre-especificada independiente. Sin tocar producción, sellos, VT4 ni el algoritmo vigente.

## Objetivos fijados antes de esta nueva ejecución
1. Distinguir por turno **cobertura física** de **cobertura anclada** y **promoción al Top10**. Mantener denominadores por corte (23 cortes por turno), no confundir familias×corte y cortes.
2. Para las ocho coincidencias Matutinas registrar fecha, familia, puesto, D−1/D−7, bifurcaciones y fuentes de rutas propias. Para los 18 cortes vespertinos físicamente elegibles identificar cada ganadora, su fuente y si está ausente del motor o sólo fuera de Top10; preservar todos los negativos, no sólo ejemplos.
3. Comparar por turno 20.000 reasignaciones de **jornadas completas** dentro de las 23 jornadas originales; repetir restringiendo a idéntico día de semana. Los cinco turnos se reasignan en bloque juntos. Registrar media, percentiles, y cola >= real para Top10, cobertura física y anclada. Indicar que los tests por turno vienen tras observar el reparto, y cualquier comparación simultánea de 5 turnos incurre en multiplicidad.
4. Medir la persistencia del Top10 del turno previo y qué parte de las ganadoras Top10 eran candidatas del corte anterior de la misma fecha; no asignarles mérito adicional sólo por repetir. Contar presencia de fuentes **no exclusivas** de las diez familias Top por turno.
5. No proponer un nuevo peso, cuota ni preferencia por Matutino a partir de estas mismas fechas. Objetivo: localizar error de selección y separar efecto de disponibilidad física de efecto de ranking.

Entradas: PRE_115.json SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612` del ensayo previo, POST_115.json del mismo, más `src/domain.ts` para nombres de turnos (lectura, no alteración). No usar Nocturna 12/10 en las 115 evaluaciones. El intercambio POST no altera las cabezas PRE ni las figuras.
Salida: JSON completo y resumen en `auditorias/vt3-por-turno-115-13oct2026`, sellos SHA y workflow GitHub Actions. Mantener explícito el sesgo por exploración retrospectiva sobre 23 fechas.
