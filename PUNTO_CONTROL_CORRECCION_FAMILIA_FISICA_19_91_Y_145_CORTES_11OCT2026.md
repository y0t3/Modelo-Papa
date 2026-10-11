# RECTIFICACIÓN METODOLÓGICA — familia física acertada aunque cambie el sentido

**Regla central corregida por observación del usuario el 11/10/2026:** acertar la **misma huella física** de VT2/VT3/VT4 dentro de la **misma fuente**, aunque el resultado confirme la lectura al revés, **ES ACIERTO DE FAMILIA**. La dirección **NUNCA** debe restar la confirmación ni alimentar la memoria negativa. Registrar lectura directa/inversa como una etiqueta descriptiva adicional; no son dos figuras distintas.

**Caso comprobado:** 19/09/2026, Vespertino, `prevNocturno`, VT2 ruta reversible `4:1 ↔ 5:0`. PRE elección congelada **91**; Ciudad dio **6619**, lectura **19**, sobre la **MISMA HUELLA**. Etiqueta correcta: `hitFamilyPhysical=true`, `hitInversePhysical=true`, `hitDirectionalExact=false`. **ACIERTO**, jamás "fallo". El documento `PUNTO_CONTROL_DIEZ_EJERCICIOS_OCULARES_PRE_POST_11OCT2026.md` contiene la valoración previa incorrecta, que debe leerse con esta rectificación.

## Regla técnica

- Identidad física: `kind + sourceId + min(cells A→B, cells B→A)` (canónica entre las dos orientaciones de la misma trayectoria).
- La familia numérica `19/91` agrupa las dos lecturas; **su presencia en cualquier otra huella no equivale a confirmación física de la huella elegida**.
- `ACIERTA_FAMILIA_FISICA`: misma huella física confirmada por una cabeza completa posterior, cualquiera de sus sentidos.
- `SENTIDO_CONFIRMADO`: `DIRECTO`, `INVERSO` o `AMBOS`, **solo diagnóstico**, no éxito/fracaso.
- `ACIERTA_FAMILIA_NUMERICA`: lectura en alguna cabeza del turno aunque por otra trayectoria; categoría de menor especificidad, siempre separada del acierto físico.
- `SIN_CONFIRMACION_FISICA`: no resultó la huella elegida; atención a cobertura ausente y resultados faltantes.
- Una elección es máximo un acierto de familia por corte/modalidad, aunque dos cabezas confirmen ambas orientaciones.

**Documentos PRE originales y SHA intactos:** `5a3fa54ba8f12b28d58753a46509cc7148e547545eb6fc40a28aef3495df211f`. **No se alteró** ninguna ruta, número ni abstención previa. Solo se ha recalculado la etiqueta de resultado POST.

## Nuevo balance 10 ejercicios

| Modalidad | Selecciones | Aciertos físicos por familia | En el mismo sentido | Invertidos |
|---|---:|---:|---:|---:|
| **VT2** | 10 | **1** | 0 | **1** |
| VT3 | 5 | 0 | 0 | 0 |
| VT4 | 0 | 0 | 0 | 0 |

## Recuento corregido de seis reglas históricas en los 145 cortes

Los criterios fueron determinísticos y retrospectivos y **no** reproducen necesariamente al padre; se corrigió solo el cotejo de la figura ya elegida.

| Regla | VT2 elegidas | Antes: orientado exacto | Ahora: familia física | VT3 elegidas | Ahora: VT3 familia física |
|---|---:|---:|---:|---:|---:|
| D−7 | 115 | 6 | **9** | 113 | **2** |
| D−1 | 140 | 7 | **15** | 136 | 0 |
| D−1 ∩ D−7, misma huella | 114 | 3 | **9** | 42 | 0 |
| D−7 toca marca previa | 89 | 1 | **5** | 86 | **1** |
| D−7 confirmó misma huella antes | 85 | 1 | **5** | 12 | 0 |
| D−7 + D−1 o contacto V9 | 114 | 2 | **7** | 94 | **1** |

VT4: **0 aciertos de familia** con las seis reglas, sin cambios. Los casos con ambos sentidos confirmados en el mismo corte se cuentan solo **una vez por figura**, aunque existan dos eventos direccionales.

Estos resultados **no prueban** ventaja estadística, ya que son retrospectivos y las hojas ya habían sido estudiadas. Sí comprueban que una métrica que exige el sentido exacto **subregistraba positivos del propio método visual**.

## Archivos y trazabilidad

Nuevo entregable corregido en la conversación: `modelo-papa-correccion-familia-19-91-y-145-cortes.zip` con `indice_PRE.html` original, diez hojas PRE separadas, `DECISIONES_VISUALES_PRE_FIJADAS.json` inalterado, `DESPUES_resultados.html` con criterio reparado, `INFORME_CORREGIDO.md`, `REEVALUACION_FAMILIAS_10_Y_145.json`, 145 POST originales y decisiones de seis reglas, `reevaluar_familias.py`, `verificar_correccion.py`. El material anterior se conserva bajo `ARCHIVO_ANTERIOR_*` **solo para auditoría, no para entrenar memoria**.

**Estado:** aún experimental, no cambios a `main`, selector, APK ni motores predictivos. Si una futura memoria de patrones marca una inversión de idéntica huella como error, está evaluando contra la regla equivocada.