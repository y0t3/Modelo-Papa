# VT3 — Diagnóstico explicativo PRE del motor Lalo
**13/10/2026, rama `lab-vt3-explicabilidad-app-13oct2026`.** Se agrega sólo una pantalla de inspección y un módulo de lectura de la hoja. No se modifica `src/motorLalo.ts`, los Tops oficiales, VT4, `main`, datos históricos ni predicciones selladas.

## Qué diagnostica
1. Buscar por terna (`851`, `615`, `242`), por familia reversible (`158/851`) o por cabeza de cuatro cifras (`9851`, etc.). En este último caso sólo la última terna importa para VT3.
2. Enumerar **todos** los caminos físicos de tres casillas distintas, vecinas, de las fuentes que realmente existían antes del turno. Consolidar camino/inversa como una sola ruta. No formar caminos cruzando fuentes, no inventar raíces.
3. Cruzar esos caminos con `buildMotorLalo(...).ranks.vt3` **sin recalcular el ranking**. Marcar qué trayectos tienen soporte histórico admitido, cuáles son únicamente físicamente válidos, y cuántos eventos independientes D−1/D−7 pertenecen realmente a la familia.
4. Si la familia existe físicamente pero no fue admitida, mostrar `sin puesto oficial, sólo presencia física` y no convertirla en candidata Top por accidente. Si fue admitida y está fuera de Top3/Top10, informar puesto y **primer criterio lexicográfico** por el cual se ubica debajo de la familia en el límite: bifurcación, bloques bifurcados, raíces D−1, raíces D−7, fuentes, bloques; en empate total, nombre.
5. Todos los caminos se muestran en fuente original, coordenadas humanas fila 1..6/columna 1..2 y cifra leída, con cabezas de origen únicamente para raíces propias admitidas. Mostrar máximo ocho rutas al principio, expandible.
6. Si los resultados del turno ya están publicados, la interfaz ofrece chips de las cinco cabezas como acceso a **explicación POST**; los resultados no se pasan nunca al cálculo del motor ni del diagnóstico PRE. Las cifras históricas son sólo lectura.

## Verificación
Reproducir 115 cortes históricos usando `scripts/replay-lalo115.ts prepare` con fixture congelado; separar físicamente `OBJETIVOS_POST_115.json` antes de construir y contrastar el diagnóstico. Para cada corte, asegurar que el ranking del motor no cambia, que las rutas pertenecen al inventario físico PRE sellado, que el diagnóstico no depende de `sheet.heads[target]` ni de `sheet.matches[target]`, y que los casos físicamente presentes sin raíz nunca obtienen puesto inventado.
Al finalizar, restaurar resultados y etiquetar la revisión histórica sin alterar ninguna selección PRE.
Para la Nocturna del **12/10/2026**, reconstruir el motor sobre el PRE originalmente sellado y corroborar:
- `158/851`: existe físicamente, pero no tiene ruta admitida con raíz propia; no ocupa puesto oficial.
- `516/615`: sí figura en el motor Lalo, puesto **54**.
- `242/242`: sí figura, puesto **25**.
No incluir el resultado nocturno en una predicción retroactiva. No usar VT4 para explicar estas familias.

## Integración en la app
Panel debajo de **PREDICCIÓN** (no reemplaza Top3/5/10). Respeta temas claro y oscuro, permite inspección manual y botón a la hoja PREDICTIVA para candidatos admitidos. No se cambia el motor. `main` puede contener otra versión de la app distinta a la rama experimental, por lo que el cambio **no está desplegado ni instalado**: requiere revisar y fusionar deliberadamente.

**La quiniela es aleatoria. Diagnóstico de geometría y prioridad no significa aumento demostrado de probabilidad futura.**
