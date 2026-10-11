# Punto de control: diez elecciones visuales PRE y cotejo separado (11/10/2026)

**Experimento ya efectuado, completamente retrospectivo. No es una prueba humana del padre ni predicciones anteriores al sorteo.** Rama aislada: `auditoria-sorteo-10oct-2026`. No se alteraron motor, selector, `main` ni APK.

## Protocolo realmente aplicado

Se seleccionaron 10 cortes de las 145 hojas existentes, distribuidos dos por turno, entre 15/09 y 29/09. El asistente observó solo los 10 archivos HTML **PRE**, sus matrices +11, las huellas D−1/D−7 y contactos anteriores del día. Decidió una lectura VT2 en cada corte, cinco VT3 y se abstuvo en todas las VT4, **antes de abrir POST**. Conservó una identidad de huella reversible pero congeló orientación A/B explícita. Cero cruces entre fuentes, saltos o reutilización de celdas.

Se guardó antes del cotejo `DECISIONES_VISUALES_PRE_FIJADAS.json` con SHA256 canónico:

`5a3fa54ba8f12b28d58753a46509cc7148e547545eb6fc40a28aef3495df211f`

El código POST verificó ese digest antes de abrir resultados. Diez páginas originales PRE aisladas conservadas con sus SHA256 en `CONTROL_INTEGRIDAD.json`; visor `indice_PRE.html` **no contiene cabezas objetivo**, visor `DESPUES_resultados.html` mantiene toda la evaluación en archivo separado. Chromium probó ambos y página original PRE. Entrega descargable: `modelo-papa-10-examenes-visuales-pre-post.zip` (25 archivos, código y fuentes completas de diez cortes), e informe `examen_ocular_10_cortes/INFORME_FINAL.md`.

## Las diez decisiones (antes del cotejo) y resultados (después)

| Corte | VT2 con sentido congelado | VT3 con sentido congelado | Compatibilidad de cabeza de turno |
|---|---:|---:|---:|
| 15/09 Previa | 71 (B) | — | 0 |
| 16/09 Primera | 06 (B) | 706 (B) | 0 |
| 18/09 Matutino | 62 (B) | — | 0 |
| 19/09 Vespertino | 91 (A) | 858 (A) | 0 |
| 21/09 Nocturno | 26 (A) | 231 (B) | 0 |
| 22/09 Previa | 41 (A) | — | 0 |
| 23/09 Primera | 56 (A) | — | 0 |
| 24/09 Matutino | 35 (A) | — | 0 |
| 26/09 Vespertino | 17 (B) | 177 (A) | 0 |
| 29/09 Nocturno | 84 (B) | 997 (A) | 0 |

VT2 **0/10**, VT3 **0/5**, VT4 **0 elegidas, 10 abstenciones**. Éxito se evalúa estrictamente entre **cinco cabezas argentinas por objetivo** para mantener cobertura homogénea.

**Hallazgo cualitativo 19/09:** la VT2 elegida **91**, fuente `prevNocturno` celdas `4:1 ↔ 5:0`, marcaba D−1 y D−7, tocaba cuatro marcas conocidas y terminó **reconfirmada físicamente en sentido inverso 19** por Ciudad Vespertino cabeza **6619**. Sigue siendo **error** porque sentido A (91) estaba fijado.

## Control de oportunidades y reglas automáticas ya congeladas

En estos diez cortes había **359** figuras VT2 heredadas, **239** VT3, **63** VT4. POST: **31** huellas VT2 y **1** VT3 coincidieron físicamente con alguna de las cinco cabezas, ninguna VT4. Estas rutas eran alternativas a priori, **no diez apuestas más**. Cinco reglas de las seis reglas automáticas VT2 obtuvieron 0/10 o menos selecciones; la D−7 simple tuvo **1/10**, el **10** Matutino Ciudad **0910** del 18/09. Reglas VT3/VT4 no mostraron ventaja en el estudio general de 145 cortes.

El resultado de 0/15 no es evidencia concluyente: los días son históricos, previamente estudiados, y esta interpretación por el asistente **no equivale a cómo elegiría el padre**. No se adapta un ranking posterior a estos negativos.

## Decisión técnica

V8 para explicar recorridos, VT0 para identidad física reversible y V9 para bitácora de antecedentes/confirmaciones —sin puntaje combinado ni validación de cruces entre fuentes. **Siguiente estudio específico**: orientación antes del objetivo en huellas con D−1/D−7 y marcas anteriores, registrando equivocaciones inversas en vez de convertirlas en aciertos. Continuar con histórico, sin esperar nuevos sorteos, pero evitando cualquier selección a posteriori.
