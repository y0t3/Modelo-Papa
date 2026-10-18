# Modelo Lalo 0.3.8 (17 octubre 2026)

APK Android de prueba desde `main`, versionCode 14.

## PREDICCIÓN (motor oficial MV1 SIN modificaciones)
- VT2, VT3 y VT4: cada uno en página horizontal con Top3 desplegado verticalmente, Top5/Top10 ampliables hacia abajo.
- Coincidencias POST grandes, ubicadas encima del listado, y familias acertadas resaltadas con cabezas completas y puesto.

## EXPERIMENTAL
- Se comparan **Geometría Completa**, **Nueva Prueba** y **Configuraciones Conectadas** (sin duplicar Lalo en esta vista).
- Nuevo lector auditado: dos cabezas distintas, recorridos VT3 solapados en una fuente real histórica, traslado físico de la configuración a otra fuente +11 PRE y lectura de cifras actuales; seis jornadas como memoria. Nunca cruza fuentes ni altera MV1.
- Ranking hasta Top10 para los tres; marcador POST destacado y familias acertadas identificadas por puesto y cabeza.
- PRE experimental V4 local guarda Conectadas desde esta versión. Capturas V1/V2/V3 conservadas; lecturas no guardadas previamente se etiquetan como reconstrucciones, no como aciertos anticipados.

## LALO PERSONAL
- Nuevo PRE personal V4: una selección VT3 baja a VT2 literal, además de la bajada previa VT4→VT3→VT2. No se reinterpretan PRE V1/V2/V3 antiguos ni se invierten boletos.
- Botón para limpiar borrador sin congelar.
- Botón para reiniciar una semana elegida de pronósticos, borradores, boletas y cobros de prueba, con doble confirmación y sin borrar semanas ajenas.
- **No se borran datos automáticamente durante la actualización.** Los registros existentes permanecen hasta que se usa explícitamente el control.

## Verificación
TypeScript, pruebas oficiales VT2/VT3/VT4, integridad PRE, test de Configuraciones Conectadas copiado del laboratorio y suite de GitHub Actions, todas exitosas en PR #25. Compilar APK desde `main`.
