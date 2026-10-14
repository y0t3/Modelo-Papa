# Cotejo de VT3 con jornada completa y Nocturna 13/10/2026

Fecha de corte retrospectivo: 13/10/2026, después de la Nocturna. **NO** se clasifica ningún Top calculado ahora como predicción nueva anterior al sorteo.

Fuentes externas verificadas, 25 cabezas de Ciudad, Provincia, Córdoba, Santa Fe y Entre Ríos: `https://sigmadiario.com/quiniela`, `https://www.jugandoonline.com.ar/Quiniela-Nocturna.aspx/1000`, `https://www.quinielanacionaln.com.ar/`.

**Reutilizar hojas históricas reales**: fixture inmutable que concluye 10/10/2026, + jornada 12/10 documentada y contrastada en `scripts/lab-vt3-en-vivo-13oct2026.mjs`. 12/10 tiene como día anterior 10/10; D−7 es 06/10 con base 05/10. Montevideo 12/10 permanece `----`, igual que en la auditoría previa. Para cada turno del 13/10 solo se cargan las cinco cabezas de turnos anteriores dentro de la propia jornada; la cabeza del turno objetivo y sus posteriores quedan `----`.

**Fases GitHub Actions**:
1. `prepare`: leer los resultados ya publicados (POST), construir cinco `INPUT_PRE` sin resultados del turno objetivo y guardar entradas cronológicas. No realizar puntuación predictiva con los resultados; es reconstrucción retrospectiva.
2. Esconder físicamente el archivo POST, fixture y otras fuentes POST.
3. `pre`: generar los cinco rankings VT3 y su variante de tercer puesto D−1 a partir solamente de `INPUT_PRE`; verificar que la Matutina coincide **literalmente** con el Top VT3 sellado a las 16:52 UTC/13:52 ART (13/10); guardar PRE+SELLO y hacer commit antes de cotejar POST.
4. Restaurar POST, `post`: comparar los 25 resultados de 4 cifras por **sus últimos tres dígitos** como familia reversible VT3, anotando si cada familia fue físicamente dibujable, admitida, rango oficial, Top3, Top10, lugar de la variante D−1, y diagnóstico de 4 dígitos VT4 exactos separado.

**Regla challenger ya congelada en** `PROTOCOLO_VT3_TERCERO_PROSPECTIVO_14OCT2026.md`: dos primeras familias oficiales fijas; familia con más eventos ganadores independientes D−1 de las posiciones originales #3–#10; desempatar por D−7, bloques físicos y rango. Para comparación neutral fija, hash de fecha+turno+familia. Conservar inmutable conjunto Top10.

**Prior seal**: `auditorias/vt3-en-vivo-13oct2026/MATUTINA_PRE_SELLADA.json` y `SELLO.json`, hash `067ec73544ba2f225fbf73818e64c926d5f89c404e932397eced66a6dea51a41`.

**Interpretación honesta**: el PRE oficial Matutino se selló en GitHub antes del sorteo; la regla challenger D−1 fue propuesta **después** de ese sorteo. Incluso su aplicación sobre aquel PRE auténtico es retrospectiva. Previa/Primera/Vespertina/Nocturna reconstruidos posteriormente: no son predicciones prospectivas. Tampoco se registra como éxito VT4 una terna acertada sin cuaterna exacta en una ruta válida.