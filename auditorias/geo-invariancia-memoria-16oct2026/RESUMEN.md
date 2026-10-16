# Hallazgo de laboratorio: memoria geométrica de hojas completas es invariante a las cifras

**Fecha 16/10/2026 · Código de producción intacto · Modelo Lalo 0.3.5 sin cambios.**

## Hipótesis
La comparación temporal de Geometría completa debería distinguir cómo cambiaron los números o las formas históricamente marcadas. En la implementación actual, parte de su ranking temporal se obtiene con `makeReference(sheet,turn)` y `context(candidate,reference)`: enumeran *todos* los recorridos posibles de 3 celdas en una tabla anterior y comparan únicamente `source`, `shape` y `position`.

Una columna completa de la hoja +11 siempre ofrece el mismo conjunto de celdas (6 filas × 2 columnas). El conjunto de recorridos contiguos de tres celdas y sus figuras físicas es por ello idéntico independientemente de qué dígitos ocupen las celdas.

## Prueba contrafactual reproducible
GitHub Actions: https://github.com/y0t3/Modelo-Papa/actions/runs/38851177968

1. Construir hojas completas del día actual y las dos hojas anteriores con números de ejemplo.
2. Calcular una sola vez el `LaloView` oficial con **sus raíces históricas reales de esta prueba**. Mantenerlo fijo en ambas ejecuciones para aislar el efecto de la memoria visual, ya que recalcular raíces sería probar otro mecanismo.
3. Primera ejecución de `buildVt3Shadow`: hojas anteriores intactas.
4. Segunda ejecución: todas las cifras de cada columna histórica pasan a `77`, conservando las celdas ocupadas y las vacías.
5. Comprobar que los conjuntos de recorridos físicos de cada fuente siguen iguales y que el resultado completo de Geometría (orden, diez familias, distancias a ayer/semana, rutas elegidas y resultados intermedios expuestos) es **exactamente idéntico**.

**Resultado: pruebas automáticas aprobadas en los cinco turnos y 50 comparaciones de columnas de referencia, con 379 raíces del motor oficial utilizadas como contexto.** No se modificaron las raíces, la hoja objetivo ni las reglas del motor.

## Interpretación correcta
- La parte de Geometría que consulta **todas las formas posibles** de D−1/D−7, mientras la presencia de celdas no cambie, **no distingue los dígitos de esas jornadas**. Sus desplazamientos responden a la disposición repetida de posiciones y formas, no a los números sorteados.
- La evidencia histórica *verificada* `view.roots` **sí depende de cabezas publicadas**; no se demostró que todo el ranking sea independiente de sorteos anteriores.
- Esto ayuda a interpretar que quitar las prioridades temporales basadas en todas las formas solo cambiara el Top3 en 5/135 y 2/135 cortes en el experimento previo, y que Geometría mantenga gran inercia intradía.
- No se trata de afirmar que comparar figuras carezca de interés: lo que está en duda es si comparar **figuras disponibles automáticamente en todas las hojas** constituye memoria predictiva.
- El estudio es técnico y no demuestra capacidad para anticipar resultados futuros.

## Contexto de resultados
- 15/09–15/10: 27 jornadas / 135 cortes / 675 cabezas, Geometría Top3 10; Lalo Top3 5; prioridad adicional a familias presentes en más fuentes Top3 11.
- Verificación 15/08–14/09, sin retocar las reglas: 26 jornadas / 130 cortes / 650 cabezas, Geometría Top3 **1**; Lalo Top3 **1**; prioridad por más fuentes **1**.
- La disponibilidad física de una familia de 3 cifras ganadora fue **171/675** vs **163/650**: ~25% en ambos períodos. El problema variable estuvo en el *orden*, no en la cantidad bruta de cabezas físicamente posibles.
- Priorizar familias con más fuentes no demostró una ventaja general bajo comparación por turno, rango de Previa y densidad de rutas.

## Próximo control propuesto
En una **copia experimental** (sin modificar MV1 ni `src/motorLalo.ts` ni `src/vt3Shadow.ts`):
1. Sustituir SOLO las referencias `makeReference` de D−1/D−7 basadas en todas las rutas por los recorridos **realmente vinculados a cabezas ganadoras** en esas fechas, que ya aparecen en `view.roots` con fecha, fuente, cabeza y casillas.
2. Diferenciar visualmente "misma forma trasladada" de "bifurcación" y contar raíces **independientes**, no la multitud de caminos alternativos de una única cabeza.
3. Repetir **idénticos 265 cortes** de agosto a octubre con familias de tres cifras, distinguiendo cobertura física / admisión / Top3 y Top10.
4. Congelar esa definición *antes* de cualquier nuevo corte y luego hacer validación prospectiva. No optimizar parámetros hasta encajar con el 15/10.

## Archivos y evidencias
- Prueba: `scripts/test-geo-memoria-invariancia.ts` del branch `lab/geo-invariancia-memoria-posicional-16oct2026`.
- Acción: `.github/workflows/lab-geo-memoria-invariancia.yml`.
- Resultado 15/09–15/10 fuentes: https://github.com/y0t3/Modelo-Papa/actions/runs/38850256819
- Verificación 15/08–14/09: https://github.com/y0t3/Modelo-Papa/actions/runs/38850616453
- Informe del contraste de meses: `auditorias/geo-refuerzo-fuentes-agosto-octubre-2026/RESUMEN.md` de `lab/geo-fuentes-verificacion-agosto-16oct2026`.

**Decisión de este hito:** mantener APK y motores sin modificaciones. La nueva hipótesis experimental debe respetar el criterio paterno de patrones ganadores comprobados, no reutilizar figuras genéricas de tablas siempre completas.
