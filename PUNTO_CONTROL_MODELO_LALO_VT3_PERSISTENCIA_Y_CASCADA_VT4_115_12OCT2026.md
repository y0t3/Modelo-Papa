# Modelo Lalo — Persistencia de Top VT3 y puerta de madres para VT4

**12/10/2026. Experimento retrospectivo terminado y reproducido sobre 115 cortes (23 jornadas), más 4 cortes observados el 12/10.** Nada de este trabajo altera la rama de aplicación `modelo-lalo-motor-unificado-vt234`, `main`, el marcado automático de la hoja +11, el motor vigente, los rankings mostrados al usuario o la APK. Se conservaron PRE y POST separados.

## Qué se ha comprobado

Se recuperó el artefacto oficial de evaluación del motor actual `Modelo-Lalo-medicion-115-PRE-POST` de GitHub Actions y los archivos del contraste 12/10. Un motor físico **independiente en Python**, construido sólo con los insumos PRE, reenumeró todas las huellas VT3 legítimas (fuente 6×2, vecindad directa incluso diagonal, sin saltos ni reutilización, inversión reversible, confirmación antigua real, traslado y bifurcación anclada a borde consecutivo de la misma madre). La reconstrucción coincidió **exactamente en el Top 10 original de los 115/115 cortes** y en los 4 cortes del 12/10.

También se enumeraron las hijas VT4 propias de esos recorridos físicos por ambos extremos y en ambas orientaciones, sin prestar caminos a la hija hermana. **Las bolsas VT4 con Top10 de madres coincidieron exactamente con el motor original en 115/115 cortes y en los cuatro del 12/10.** Estos controles hacen que las comparaciones sean sobre datos y reglas verdaderamente iguales, no sobre un sustituto.

## Inmovilidad intradía

En las 23 jornadas hubo 92 pasos de turno. **52/92** conservaron Top3 VT3 exacto y **25/92** Top10 exacto. En **77/92** hubo al menos una madre nueva; en **37** de esos 77, el Top3 siguió igual. Hubo 1.042 exposiciones de nuevas familias entre turnos.

El sorteo del 12/10 mostró:
- `565/565`: 5 ramas, 1 fuente, primer puesto desde Previa hasta Vespertina.
- `365/563`: 2 ramas, pasa de 1 a 2 fuentes desde Matutina.
- `536/635`: pasa de 1 a 2 ramas y de 1 a 2 fuentes desde Matutina.
- Familias elegibles VT3: **20 → 24 → 58 → 58**. El motor realmente actualiza su bolsa.

**Causa identificada en código:** el ranking VT3 es lexicográfico: tener rama, cantidad de bloques con rama (máximo 15), cantidad de cabezas antiguas D−1, D−7, fuentes y finalmente huellas. Por ello, 5 bifurcaciones de una fuente mantienen superioridad frente a dos de distintas fuentes, aunque hayan llegado nuevas columnas. Esto explica la estabilidad, pero no prueba que esté mal predictivamente.

## Ablaciones PRE con misma bolsa y cupo, y evaluación POST

| Criterio VT3 | Top 3 | Top 5 | Top 10 | Top3 idéntico entre turnos/92 |
|---|---:|---:|---:|---:|
| Lalo congelado | 5 | 8 | 15 | 52 |
| Limitar a 2 el peso de bifurcación | 6 | 8 | 12 | 48 |
| Más fuentes físicas antes que número de ramas | 5 | 9 | 14 | 47 |
| Antigüedad D−1 antes que ramas | 9 | 13 | 17 | 55 |
| Nuevas o renovadas figuras de ese turno | 4 | 9 | 14 | 4 |

Cortes con alguna familia VT3 reversible coincidente dentro del cupo (115). D−1 +2 Top10 sobre Lalo, pero intervalo de remuestreo pareado por **23 jornadas** **[−3, +8]**, contiene 0. **Ninguna variante justifica cambiar el motor** y hacer rotar las familias artificialmente no aumentó los aciertos. No es validación externa: las fechas ya intervinieron en el diseño de muchas hipótesis.

## Cascada VT3→VT4: cobertura física, NO Top10 ni pronóstico

Con EXACTAS hijas propias de 4 casilleros:

| Madres VT3 habilitadas | Hijas VT4 físicas medias por corte | Cortes con alguna hija VT4 ganadora en TODA la bolsa |
|---|---:|---:|
| Top3 | 22,24 | 1/115 |
| Top5 | 35,27 | 6/115 |
| **Top10 actual** | **66,69** | **7/115** |
| Top20 | 117,07 | 13/115 |
| Todas las madres | 232,19 | 27/115 |

La bolsa es 3,48 veces mayor en «todas» que en Top10 y sólo entonces cubre 27 cortes. **No es un incremento demostrado de eficacia**. El Top10 VT4 real seguía **0/115**. No contar familias múltiples del mismo corte como aciertos independientes.

Caso 12/10 Previa: hija exacta `5276/6725` ya disponible con Top5 de madres, pero situada **19.ª** por el ordenamiento VT4. Primera/Matutina/Vespertina: **ni todas las madres VT3** forman físicamente una hija VT4 ganadora bajo el criterio del motor, por lo que reordenar las hijas existentes NO puede arreglar esos cortes.

## Entrega y reproducción

**Paquete de esta conversación:** `modelo-lalo-vt3-persistencia-madres-hijas-115-cortes-12oct2026.zip`, **27 archivos, 818.854 bytes**, SHA256 `ba682e416d486a0795547c4631117f86b718bc4150f1cdb58b5a4239b403d13e`.

Incluye `INPUT_PRE_115.json`, `REPLAY_PRE_115.json`, `INPUT_PRE_12OCT.json`, el contraste PRE 12/10 congelado, objetivos POST en archivos **separados**, scripts `auditar_vt3.py`, `evaluar_madres_vt4.py`, `comparar_prioridades_vt3.py`, `diagnostico_12oct.py`, `crear_visores.py`, `reproducir_aislado.py`, todas las salidas PRE/POST, informe y visores `VISOR_EVOLUCION_VT3_PRE.html` / `VISOR_EVOLUCION_VT3_POST.html`.

Se extrajo ZIP en una carpeta **totalmente nueva**, se eliminaron físicamente `OBJETIVOS_POST_115.json` y `OBJETIVOS_POST_12OCT.json`, se ejecutaron todos los análisis PRE y se verificaron **cinco archivos PRE idénticos SHA256**. Luego se restituyeron resultados y se reprodujeron **cuatro salidas POST idénticas SHA256**. ZIP íntegro, 27/27. Ambos HTML autocontenidos probados con Chromium, fecha/turno, criterio, familia, fuente y ruta; cero errores JS. PRE no contiene cabezas objetivo.

## Decisión

**Primero VT3; no alterar producción.** Documentar en el visor qué figuras se renuevan en otras fuentes, estudiar cuándo una madre aparece sólo fuera de Top10 y separar fracaso de recuperación de fracaso de priorización. Al volver a VT4, recordar la doble puerta: seleccionar la madre y luego la hija exacta con testigo físico propio. Seguir con controles de igual presupuesto y futuras fechas verdaderamente inéditas. No convertir esta auditoría retrospectiva en afirmación de poder predictivo.
