# Corrección VT4: cuarta cifra exclusivamente a la izquierda · 15/10/2026

## Regla inequívoca
- La madre VT3 es un recorrido físico de tres casillas consecutivas, en una misma columna y fuente.
- La cuarta cifra es otra casilla **contigua al INICIO de ese recorrido**, que se lee antes de la madre VT3.
- **Jamás** se añade a la derecha, porque los últimos tres dígitos serían entonces otra madre VT3 no avalada por el testigo original.
- Se conserva la inversión de la **madre VT3** (no la cuaterna completa) y cada hija debe tener su propio testigo físico 4D.
- Ejemplo obligatorio: `044/440 + 3 → 3044/3440`. Se eliminan `0443/4403` como derivaciones de `044/440`.
- También VT4 manual en **LALO**: los tres primeros toques forman VT3. El cuarto toque se acepta sólo si está físicamente adyacente al **primer** casillero y se **antepone**; se rechaza agregarlo al final.

## Persistencia
- Capturas personales PRE existentes `PAPA_PRE_V1` se siguen leyendo con la madre histórica con la que fueron guardadas; jamás se reescriben ni se recalculan para presentar falsamente que el usuario las había registrado bajo la regla nueva.
- Los PRE nuevos se guardan como `PAPA_PRE_V2` con madre VT3 tomada de las últimas tres cifras de la cuaterna prefijada.
- Claves locales AsyncStorage antiguas, fechas, recorridos guardados y otras modalidades no cambian.
- Pronósticos anteriores del motor sellados históricamente permanecen intactos como evidencia de la versión anterior; no se reescriben.

## Código
- `src/motorLalo.ts`: sólo genera candidatos VT4 `[extra, ...vt3]`. `vt4PrefixFamily` define las dos orientaciones legítimas de la madre y excluye todas las familias de sufijo. POST VT4 sigue comparando los testigos `paths[].value` exactos.
- `src/papaPronostico.ts`, `src/ui/PapaPronostico.tsx`: única regla izquierda también en el registro personal.
- `scripts/test-motor-lalo.ts`, `scripts/test-pronostico-papa.ts`, `scripts/test-cotejo-vt4-exacto.ts`: verifican prefijo, contacto físico, reversibilidad VT3, inexistencia de sufijo y compatibilidad V1.
- `app.json`: versión 0.2.2 / Android versionCode 5.

Se mantiene el ranking VT2/VT3, pero **los candidatos VT4 y sus puestos sí cambian deliberadamente** por aplicar la nueva regla física. No mezclar los resultados históricos de motores previos sin indicar la versión.
