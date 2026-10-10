# Punto de control — comparación de DOS capturas verdaderamente previas del 10/10/2026

**Fecha:** sábado 10/10/2026. Se hace **sin resultado de Primera y sin generar ningún pronóstico humano**.

## Origen verificable
- Antes de **Previa**, 09:04:33 ART, GitHub run https://github.com/y0t3/Modelo-Papa/actions/runs/38050639551 , SHA256 `19d3357c82e59dbf5050ed7941f160b7e4c04a1a0875fb5e25de9147a245ea4b`.
- Antes de **Primera**, 10:53:58 ART, GitHub run https://github.com/y0t3/Modelo-Papa/actions/runs/38057490657 , SHA256 `99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9`. La segunda captura verificó que no contenía ninguna cabeza de Primera ni turnos posteriores; conservó **5/6** cabezas de Previa, **3** marcas VT2 ya confirmadas y cero selecciones humanas.
- Primer tablero, única fuente Nocturna anterior: `37 / 55 / 63 / 47 / 65 / 42`.
- Segundo tablero, la misma columna Nocturna anterior sin cambios y una fuente adicional `Previa`: `67 / 51 / 93 / 18 / 72 / --`.

## Comparación geométrica de las dos fotografías PRE

Las rutas de una misma figura se deduplican al invertir su sentido; múltiples cabezas viejas que usaron el mismo dibujo no multiplican los dibujos físicos. Cada figura queda íntegramente dentro de una columna.

| Estado de la hoja | VT2 | VT3 | VT4 | Dibujos distintos |
|---|---:|---:|---:|---:|
| Antes de Previa | 14 | 3 | 0 | **17** |
| Antes de Primera | 26 | 9 | 0 | **35** |
| Incorporados solo por columna Previa | 12 | 6 | 0 | **18** |

**Los 17 dibujos anteriores siguen siendo exactamente los mismos, con idéntica lectura.** Ninguno desapareció ni «se transformó» al entrar la nueva columna. El aumento consiste en nuevas figuras **independientes en otra fuente**.

Antes de Primera, las figuras propias únicas de D−1 son **17 VT2 y 5 VT3**, las de D−7 son **16 VT2 y 4 VT3**; hay **7 dibujos VT2 físicos compartidos** por ambas memorias y **ningún VT3 compartido**.

## Las siete figuras compartidas por D−1 y D−7 antes de Primera

Este conjunto queda **congelado antes de conocer el resultado de Primera**, pero **ninguna orientación ni número fue seleccionado**.

| Modalidad | Fuente | Figuras/celdas | Lecturas posibles |
|---|---|---|---|
| VT2 | Nocturna anterior | `2:1→3:0` | 34/43 |
| VT2 | Nocturna anterior | `0:0→1:1` | 35/53 |
| VT2 | Previa | `1:0→2:1` | 53/35 |
| VT2 | Nocturna anterior | `3:0→3:1` | 47/74 |
| VT2 | Nocturna anterior | `0:0→0:1` | 37/73 |
| VT2 | Previa | `3:1→4:1` | 82/28 |
| VT2 | Previa | `4:0→4:1` | 72/27 |

Este grupo sirve para un **contraste descriptivo futuro contra todas las otras 28 figuras**, pero la presencia en las dos memorias por sí misma NO confiere prioridad ni significa pronóstico.

### Regla temporal importante

La figura **82/28** se forma en la nueva columna `Previa` antes de Primera. Aun cuando Córdoba había salido **6182 en Previa**, **queda PROHIBIDO presentar 82/28 como acierto previo a Previa**: la columna que contiene esa figura **no existía** antes de que se sortease Previa. Esta es exactamente la fuga de información que evitamos al sellar dos fotografías separadas.

## Marcas conocidas de Previa y contactos físicos previos a Primera

Las tres marcas ya confirmadas de **Ciudad 0956** son VT2 `56` dentro de **Nocturna anterior**. Una figura es idéntica a una huella que D−1 marcó con la cabeza vieja 7148, terminación vieja 48, leída hoy como 56.

Entre las 35 geometrías heredadas disponibles antes de Primera:
- **2** figuras comparten 2 o más celdas con una de esas 3 marcas (incluida la geometría exacta 56 y una VT3 **456/654** que toca su tramo pero no constituye esa confirmación);
- **11** comparten exactamente una celda;
- **22** no comparten ninguna celda **en su propia fuente**; en particular los 18 recorridos de la columna `Previa` no pueden tocar físicamente las marcas que están en `prevNocturno`.

Estos contactos no justifican asignar puntos ni elegir una cifra.

## Control de abundancia de trayectorias en tablero

| Fuente | Todos los VT2 físicamente posibles | Todos los VT3 | Todos los VT4 |
|---|---:|---:|---:|
| Nocturna anterior (12 celdas) | 26 | 92 | 268 |
| Previa (10 celdas, última fila vacía) | 21 | 72 | 200 |

Estas son geometrías potenciales (no marca ni apuesta), calculadas con vecindad de celdas y deduplicación por inversión. Más dibujos no significa mayor capacidad predictiva; sirve como control de lo fácil que es encontrar coincidencias en un espacio de muchas opciones.

## Saldo y próximos usos

- **Sí** conseguimos dos registros auténticamente previos; **sí** podemos analizar de inmediato cambios de distribución, fuentes y geometrías antes de un turno posterior.
- **No** existe una decisión de número/orientación firmada antes de Primera; por tanto no se pueden adjudicar aciertos predictivos ni fallos de usuario.
- Más adelante comparar este expediente sellado con Primera y actualizar las cabezas del resto del día, pero **sin dejar de trabajar entre turnos**: los visores y análisis de geometría requieren solo las capturas PRE.

Rama aislada: `auditoria-sorteo-10oct-2026`. No tocar `main`, app, APK, selector ni motor congelado.