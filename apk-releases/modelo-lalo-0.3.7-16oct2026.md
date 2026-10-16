# Modelo Lalo 0.3.7 — 16 octubre 2026

APK Android de prueba desde main: versión 0.3.7, versionCode 13.

Corrección de Experimental:
- Nueva Prueba vuelve a mostrar resultados al consultar jornadas históricas sin PRE guardado; estos resultados se etiquetan "Reconstrucción histórica", no como aciertos anticipados.
- Las tres columnas Lalo / Geometría / Nueva Prueba tienen selector Top3, Top5, Top10.
- La selección experimental de dos madres geométricas más una nueva elegible ocupa Top3; 4..10 extienden la geometría sin inventar recorridos.
- Se reconstruye el PRE ocultando las cabezas del turno que se consulta y posteriores (sin usar POST).
- PRE V1/V2 inalterables; nueva captura PRE V3 guarda los Top10 para la Nueva Prueba.
- Motor Lalo MV1 / VT4 conservados tal cual en main.

Validación: TypeScript y todas las pruebas GitHub Actions exitosas (PR #23).
