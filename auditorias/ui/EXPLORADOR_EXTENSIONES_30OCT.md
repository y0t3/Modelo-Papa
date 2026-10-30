# Explorador visual de extensiones VT2 → VT3 — rama experimental

Fecha: 30 de octubre de 2026.  
Rama: `feature/extensiones-agrupadas-experimental-30oct`.

## Cómo abrirlo

En la app de Modelo Lalo: **PREDICCIÓN → MODELO LALO → Experimental · Figuras VT2 y VT3 → Extensiones VT2 → VT3 · tres hojas**. El panel permanece cerrado hasta tocarlo: no interfiere con el panorama, los Top10 ni las seis pestañas.

1. Elegir **Solo madres Lalo** (predeterminado) o **Todos los motores +11** (Geometría, Figuras Conectadas y Formas Primero VT2, además de Lalo).
2. Tocar una familia VT2 del Top10, por ejemplo **13/31**.
3. Ver una o dos bandas: `_13` y `_31`, con **todos los prefijos físicamente formables** en al menos una auxiliar. Las bandas son orientaciones de lectura, NO una misma ruta/casilla compartida.
4. Tocar cualquier valor, por ejemplo **513** o **813**, y abrir sus minihojas de **Auxiliar Ayer** y **Auxiliar Hoy**, mostrando las cifras y el orden 1→2→3.
5. Ver **todos los caminos físicos** (primeros dos de cada hoja predeterminados), los antecedentes reales y si esa familia estaba en Top10 VT3 auxiliar.
6. Cambiar de madre, fecha o turno sin alterar ningún cálculo predictivo.

## Invariantes

- **VT2 y VT3 conservan sus Top10 y motores independientes**. El explorador solo facilita leer extensiones físicas adicionales. VT3 no debe existir en un Top para mostrarse.
- **No se descarta ninguna ruta físicamente formable**, aunque las listas se agrupen y estén plegadas. Cada minihoja usa `findAuxPaths` del tablero real, nunca una ruta combinada entre hojas.
- **Ayer disponible desde Previa**: sus tres franjas de Santiago–Neuquén están completas al inicio del día objetivo. El explorador construye el tablero Ayer íntegro aunque el turno de predicción sea Previa.
- **Hoy intrajornada**: solo usa franjas PRE publicadas antes del turno objetivo; en Previa aparece vacío.
- Histórico de testimonios: se limita a jornadas anteriores a la objetivo. La vista no conoce la cabeza ganadora del turno objetivo para formar opciones ni ordenar fichas.
- El usuario puede ver **todos** los recorridos actuales, no solo uno que parezca interesante después del sorteo.
- No introduce predicciones nuevas, apuesta automática, priorización de extensiones por resultados futuros ni alteración de geometría del padre.
- Los dos sentidos de la madre se muestran por separado; ante una madre reversible como 11/11 solo existe una banda.

## Validación

GitHub Actions `VALIDAR explorador extensiones agrupadas`: TypeScript de la aplicación y sus dependencias, pruebas de reducción sin pérdidas, auditoría geométrica y regresiones del Modelo Lalo MV1.

Los scripts experimentales históricos tienen errores de TypeScript independientes del código de aplicación; por ello se usa `tsconfig.app-ui.json` para la comprobación de la app y se ejecutan por separado sus pruebas de comportamiento. No afecta la compilación móvil.

El flujo `apk-extensiones-agrupadas.yml` prepara un APK **de prueba** en esta rama; no publica ni reemplaza la APK oficial.

**Estado:** implementación en rama de prueba; las funciones visuales deben verificarse en un teléfono antes de proponer fusión o publicación general.
