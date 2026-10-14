# Modelo Lalo — Quiniela visual VT2, VT3 y VT4

La aplicación Expo/React Native utiliza **un único motor operativo**, `src/motorLalo.ts`. Los módulos anteriores `predictive.ts`, `routeHistory.ts`, `routeLife.ts` y `analysisEngine.ts` fueron retirados: no forman parte de la app unificada. Su historial Git y las ramas experimentales se conservan.

## Reglas
- Cada fuente contiene seis filas y dos dígitos (+11). Sólo hay recorridos de celdas físicamente contiguas, sin cruzar fuentes ni reutilizar celdas.
- Las columnas **se acumulan** de Previa a Nocturna: una ruta física de la mañana no desaparece cuando llega un turno posterior.
- La hoja marca recorridos que explican cabezas **ya publicadas** (POST). La predicción PRE no utiliza esas cabezas futuras.
- VT3 agrupa reversibles sin contar trazados duplicados como evidencia independiente. VT4 incorpora físicamente la cuarta cifra a la madre VT3, sin invertir el número de cuatro dígitos para inventar una madre nueva.
- Los Tops oficiales del motor permanecen sin cambios: no se añadieron filtros de descarte ni bonificaciones automáticas por novedades.

## Observación sin alterar los Tops
- `src/vt3Audit.ts` y `src/ui/Vt3Explainer.tsx`: explican por qué entró o no una familia VT3, sus raíces y el cambio en cada fuente (INICIAL, NACE, SUMA_FUENTE, SIN_NOVEDAD, AUN_NO_APARECE).
- `src/vt3Shadow.ts`: ranking experimental independiente sobre todas las trayectorias físicas, basado en la política geométrica exploratoria F_D1. No alimenta VT4 ni los Tops oficiales.
- `src/ui/Vt3Parallel.tsx` y `src/vt3Snapshot.ts`: visualizan los dos Top10 y permiten **guardar antes de los resultados** una captura PRE local por fecha y turno, que la aplicación no sobrescribe; SHA-256 verifica integridad. El POST se compara con la captura guardada, no con un ranking recalculado. El tiempo del teléfono y su almacenamiento **no constituyen un sello cronológico externo**: para validar prospectivamente de forma rigurosa, publicar el PRE y su hash en GitHub antes del sorteo.
- La evaluación paralela considera cinco cabezas: Ciudad, Provincia, Córdoba, Santa Fé y Entre Ríos. Montevideo permanece como fila del tablero pero no se evalúa como cabeza objetivo en esta comparación.

## Laboratorio y comprobación
Los PRE/POST de los **115 cortes retrospectivos**, controles neutrales y protocolos siguen guardados en ramas `lab-vt3-*`, sin abarrotar `main`. Ninguno de los filtros de descarte probados elevó los aciertos de Top3/5/10.

```sh
npm install
npx tsc --noEmit
npx --yes tsx scripts/test-motor-lalo.ts
npx --yes tsx scripts/test-consolidacion-lalo.ts
npx expo start
```

GitHub Actions valida la app en `.github/workflows/validar-lalo-unificado.yml`. El APK se construye desde su workflow manual.
