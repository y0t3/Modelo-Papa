# Laboratorio: madres VT3 #4/#5, geometrías de control y antecedentes D−1/D−7

**13/10/2026**. Exploración de los 115 cortes ya estudiados; no implantar reglas en `main` ni alterar sellos anteriores.

## Objetivo y hipótesis
La franja #4–#5 concentró 6 coincidencias VT4 frente a 1,479 esperadas bajo una referencia aleatoria idealizada. Comprobar si esa diferencia puede describirse por:
- raíces independientes propias D−1/D−7 y su coexistencia;
- bloques y caminos reales, fuentes y madurez de los recorridos VT3;
- repetición de exactamente la misma ruta anterior;
- número de hijas físicas y coincidencias de formas ganadoras D−1/D−7 de las propias hijas.

Distinguir **cobertura físicamente posible** de **selección con diez plazas**, evitando presentar como pronóstico el inventario completo de hijas.

## Diseño ciego
Usar sólo tres PRE históricos sellados: `vt4-hermanas-geometricas/PRE_115.json`, `vt3-vigencia-fisica/PRE_115.json` e `INVENTARIO_RUTAS_PRE_115.json` de transferencia VT4. Verificar hashes originales. Para cada corte y las cinco primeras madres, registrar sus propias métricas históricas y conjunto de valores VT4 físicamente construidos. Comprobar contra el mapa de 10.000 valores PRE que la unión de las tres primeras y el conjunto adicional de la cuarta y quinta coincidan exactamente con la clasificación original por menor rango materno.

PRE: elegir **exactamente dos madres** entre las cinco primeras por 9 criterios fijos: primeras 2, cuarta/quinta, mayores raíces D−1, mayores raíces D−7, doble memoria, más bloques, persistencia exacta, más huellas ganadoras en hijas, mayor cantidad de números físicos y control neutral hash. Son **dos madres**, no diez agrupaciones. Se comparan *bolsas completas de hijas físicamente elegibles* de esas dos madres para diagnosticar elegibilidad, con tamaño variable medido exactamente; no es una predicción VT4 Top10.

POST: tras sellar PRE por commit, revelar las 575 cabezas y contrastar ocurrencias exactas, cortes, media de exposición, expectativa bajo una nula ilustrativa uniforme y diferencias septiembre/octubre. Enumerar casos positivos #4/#5 y madres negativas emparejadas en mismo corte por tamaño de bolsa. No usar resultados de un corte para puntuar ese corte.

Pruebas múltiples, datos seleccionados tras resultados conocidos y dependencia entre sorteos implican que **ninguna asociación histórica demuestra ventaja predictiva**. Los próximos cambios oficiales requieren sello nuevo y validación prospectiva independiente.