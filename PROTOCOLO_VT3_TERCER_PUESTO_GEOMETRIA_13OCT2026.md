# Laboratorio VT3: aislar el tercer puesto, sin aumentar inventario, 13/10/2026

Objetivo: estudiar por qué el tercer puesto oficial VT3 tuvo 0 familias ganadoras en 115 cortes (puestos #1 y #2 acumulan 5), sin transformar el resultado observado en una nueva regla predictiva.

**PRE sellado**: tomar exclusivamente `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json` (SHA-256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`). Para cada fecha y turno conservar intactas #1 y #2, elegir la tercera familia **dentro de las posiciones #3–#10 originales**, manteniendo el mismo inventario VT3 Top10. Adelantar la elegida al puesto #3, desplazar las intermedias sin eliminar familias, y mantener el resto del Top10 original. Todos los caminos y las raíces son los históricos PRE de esa misma candidata: prohibido copiar el respaldo de otro grupo o introducir recorridos.

Criterios congelados sin leer el POST:
1. `OFICIAL`: posición #3 original;
2. `RANGO5_CONTROL`: poner la familia original #5 (control focal post hoc);
3. `MAS_D1`: más raíces propias D−1;
4. `MAS_D7`: más raíces propias D−7;
5. `EVENTOS_NO_COMPARTIDOS`: más eventos históricos distintos no compartidos con #1 y #2;
6. `FORMAS_DIVERSAS`: mayor número de formas geométricas propias de rutas VT3 válidas, deduplicadas orientación;
7. `CONTINUIDAD_DIA`: familia presente en el turno anterior del mismo día, con más bloques;
8. `FUENTE_RECIENTE`: más recorridos admitidos dentro de la nueva columna del corte;
9. `HASH_NEUTRAL`: hash determinista del corte y familia (control negativo).

Generar además **5000 decisiones neutrales** (tercero elegido entre exactamente las mismas ocho familias #3…#10 en cada corte), y registrar hash de los datos PRE y selecciones neutral antes de revelar POST. El universo elegible es idéntico para todos los modelos en cada corte y Top10 permanece idéntico. Afirmaciones de mejora sólo si superan controles y son estables en cortes cronológicos externos. Incluso entonces, resultados de este mismo histórico quedan exploratorios.

POST: 115×5 cabezas y terminación VT3 reversible (sin mezclar cifra añadida); comparar Top3, Top5 y Top10, coincidencia exacta del tercero, ganancias/pérdidas, septiembre vs octubre, además del riesgo del tercer puesto seleccionado por terminales físicamente disponibles. Evaluar contra 5000 neutral PRE y no tratar la coincidencia del rango #5 como hipótesis independiente: se eligió precisamente porque el rango #5 había ganado cuatro veces. No mover motor oficial ni `main`.