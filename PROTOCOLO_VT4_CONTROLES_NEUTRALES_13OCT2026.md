# Control complementario: 500 repartos neutrales por madre sobre 115 cortes VT4

**13/10/2026 · rama `lab-vt4-diversidad-madres-top10-13oct2026`.** Complemento exploratorio de `PROTOCOLO_VT4_DIVERSIDAD_MADRES_TOP10_13OCT2026.md`. Después de observar 4/115 Top10 de `CUPO_2`, necesitamos comprobar si es inusual en **las mismas diez plazas** y el mismo inventario físico. No modificar motor o Tops.

Cálculo fijado antes de ejecutar este control, con semilla determinista `20261013`: en cada corte crear 500 selecciones aleatorias de diez **grupos VT4 físicamente válidos sin repetir una misma cuaterna exacta**, y otras 500 selecciones que incluyan **una hija por cada madre VT3 #1…#10**, sorteada neutralmente entre sus hijas válidas y evitando valores repetidos. En caso de colisión, buscar otra hija de la misma madre; si no fuera posible, marcar falta y no comparar como Top10 lleno.

**Blindaje:** fase PRE recibe sólo `INPUT_PRE_115.json` ya generado y guardado antes, sin `OBJETIVOS_POST_115.json` ni fixture de futuras cabezas; guarda `CONTROL_PRE.json` con las elecciones completas y sello SHA256 de código y entradas. Sólo después se reponen los resultados y se calculan, para cada réplica de 115 cortes, Top3/5/10, media, rango, cuantiles, y proporción que iguala o supera 4/115 Top10 (cupo 2) o 3/115 Top5 (cupo 1). Ninguna réplica se elige porque haya acertado.

**Advertencia:** el método de control es complementario y fue creado después de observar el desempeño inicial; además, el corpus ya fue investigado muchas veces. No interpretar porcentajes como evidencia confirmatoria de capacidad predictiva. Los sorteos son aleatorios.
