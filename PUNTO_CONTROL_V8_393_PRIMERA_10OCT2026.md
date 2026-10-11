# Auditoría definitiva del caso V8 → 393 → Primera Ciudad 8393, sábado 10/10/2026

**Hallazgo central verificado dos veces:** el V8 original sí lleva **393 al puesto 1** con el tablero pre-sorteo de Primera auténticamente capturado a las **10:53:58 ART**. Pero **sus dos recorridos dirigidos cruzan entre Nocturna anterior y Previa**, por lo que la figura **no existe** dentro de las rutas físicamente válidas del Modelo Papá actual.

## Origen verificable
- Repositorio viejo **VF-Quiniela**, `src/engine.ts`, funciones `tableroManual`, `candidatos` y `v8`: https://github.com/y0t3/VF-Quiniela/blob/main/src/engine.ts
- `App.tsx` viejo: para turno objetivo **Primera**, campo `necesarios = ['Anterior','Previa']`. `loadVF` carga Nocturna del 9/10 y Previa del 10/10, sin conocer Primera: https://github.com/y0t3/VF-Quiniela/blob/main/App.tsx
- Fuente original inalterada ANTES del sorteo: https://github.com/y0t3/Modelo-Papa/actions/runs/38057490657 ; SHA256 de JSON.stringify: `99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9`. Fila **Córdoba**, Nocturna anterior +11 = **63**, Previa +11 = **93**.
- Verificación independiente sobre el código **original Python** de Library: `motor_v7_2.py` + `motor_v8_parcial_2.py`. Única adaptación: desactivar el acceso a la base SQLite al importar V7 (ausente del entorno), **sin modificar** `tablero_manual`, `candidatos`, `metricas` ni `rankear_v8_parcial`. También se ejecutó equivalente exacto en Node del código TypeScript de `VF-Quiniela`. Ambos devuelven **puesto 1, score 0.9500000000000002 y 2 recorridos**.

## Los dos recorridos exactos, que son la misma figura invertida

Las coordenadas antiguas usan `(fila índice 0..5, columna física índice 0..3)`:
- `(2,1) [3 de Nocturna anterior] → (2,2) [9 de Previa] → (2,3) [3 de Previa]`: **393**.
- `(2,3) → (2,2) → (2,1)`: **393**, inversión de la misma huella.
- El paso `(2,1)→(2,2)` atraviesa `Math.floor(col/2) = 0→1`. **No existe ninguna trayectoria de 393 confinada a una sola fuente en la foto pre-Primera**.

## Por qué sumó 0,9500

`score = 0.55*c0 + 0.30*fuentes + 0.05*horizontal + 0.10*conf`

| Variable | Valor | Puntos |
|---|---:|---:|
| `c0`: todos los caminos TOCAN la fuente inicial | 1 | 0,55 |
| `fuentes`: entre sus recorridos toca las dos fuentes / dos existentes | 1 | 0,30 |
| `horizontal`: ambos trazos sobre la misma fila | 1 | 0,05 |
| `conf = min(log(1+2)/log(9),1)` | 0,5 | 0,05 |
| **Total** | | **0,95** |

`solo_c0=0` indicaba que ni un solo recorrido era enteramente de la fuente inicial, **pero no se usa como penalización** en la fórmula.

**No fue primer puesto exclusivo**: `393`, `555` y `767` empataban exactamente en 0.9500000000000002. `393` quedó primero por desempate en orden alfabético/numeral. `355`, `535`, `553` tenían 0.9500000000000001, diferencia solo de error numérico de punto flotante.

## Ablación: mismo tablero y mismo V8, solo se filtran cruces

- PRE Primera original: **289** ternas distintas; `393` **#1**, 2 rutas inválidas.
- PRE Primera filtrado por fuente de cada celda (`floor(col/2)` constante): **208** ternas; `393` **desaparece**, 0 caminos.
- Las 81 ternas que se perdieron dependían exclusivamente de cruces, no de errores de lectura de la cabeza.
- Con objetivo de turno cambiado en la app: Antes de Previa `393` ausente; Antes de Primera **#1**; Antes de Matutina **#1**; Antes de Vespertina **#8**; Antes de Nocturna **#171**. Las cinco hojas reconstruidas contienen exclusivamente fuentes cronológicamente previas al objetivo y no emplean resultado de su propio turno.

## Lectura adecuada y utilidad

**Es un acierto de ranking pre-objetivo reproducible**, pero no demuestra un acierto realizado prospectivamente por una persona: la fotografía previa conservada no guardó una selección humana del V8 ni su captura de pantalla. El 393 pudo haber aparecido primero durante el cálculo antes de Primera, y ahora **sabemos exactamente por qué**; eso no valida por sí solo el poder predictivo de la regla en varias jornadas.

**No copiar** cruces entre columnas al enumerador del Modelo Papá: viola la restricción visual física explícita. **Sí rescatar** el estilo de auditoría explicativa V8: razones, rutas, fuentes, direcciones, pesos y rivales empatados, con cada huella inversa contada una sola vez. Si se quiere investigar la proximidad entre fuentes, es otro **experimento independiente**, nunca una VT válida de este motor.

## Artefactos

- Paquete completo de reproducción creado en la conversación: `auditoria-v8-393-primera-10oct-2026.zip`.
- Visor local `investigacion_v8_393/index.html`, informe `INFORME_V8_393.md`.
- JS `v8_original_exacto.js`, verificador fuentes originales Python `verificar_v8_python_original.py` (requiere los dos módulos originales de Library), todo el JSON de ranking (`RESULTADO_V8_EXACTO_Y_CONTROL.json`), foto PRE original exacta y resultados fechados.
- **No se modificó** `main`, motor vigente, APK, selector ni rama de rediseño. Esta auditoría es un punto de control únicamente en `auditoria-sorteo-10oct-2026`.
