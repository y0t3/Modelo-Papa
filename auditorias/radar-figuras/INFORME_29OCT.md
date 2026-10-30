# Radar de figuras entre turnos y jornadas — 29/10/2026

**Rama experimental**: `lab/radar-figuras-entre-turnos-29oct`  
**Ejecución verificada**: [GitHub Actions 40987621905](https://github.com/y0t3/Modelo-Papa/actions/runs/40987621905) — los tres períodos y las pruebas de regresión de Lalo MV1 terminaron correctamente.  
**Impacto**: sin cambios en motor oficial, motores auxiliares, Tops vigentes, interfaz o APK.

## Acuerdo metodológico

**Los Tops son referencias para localizar recorridos; no son la identidad de aquello que seguimos.** La figura es una ruta física de celdas consecutivas de una hoja, identificada por hoja, fuente y sitio; puede volver a ser seleccionada con cifras completamente diferentes en otra jornada. Una familia numérica no es una figura, ni un puesto (#7) es una figura fija.

Los tres tableros deben permanecer separados:
1. +11: contacto vertical, horizontal o diagonal DENTRO de una columna; prohibidos saltos o cruces.
2. Auxiliar Ayer: geometría propia Santiago/Neuquén; sus cruces entre bloques están permitidos.
3. Auxiliar Hoy: tablero auxiliar independiente con disponibilidad intrajornada.

**Esta ejecución reconstruye únicamente +11** (Lalo VT2/VT3, Geometría VT2 y Figuras Conectadas VT2). No infiere los Tops auxiliares ni los sus recorridos hasta disponer de sus PRE y política temporal correspondientes. Varios motores sobre +11 son varios criterios, no varios tableros.

## Cómo se siguieron figuras, no cifras

El identificador de ruta es `hoja|fuente|longitud|casillas físicas`. Lectura directa o inversa se consideran el mismo lugar; las rotaciones y reflexiones NO se normalizan como idénticas. Los motores comparten una sola huella cuando seleccionan las mismas casillas. Relación entre fotografías PRE:
- **MISMO_SITIO**: mismos casilleros y misma fuente.
- **DESPLAZAMIENTO_VERTICAL_1**: silueta igual, una fila por encima o debajo, misma fuente.
- **FUENTE_VECINA_MISMO_SITIO**: figura de igual sitio en columna +11 inmediatamente vecina.
- Igual silueta en otra zona lejana: **no cuenta como movimiento cercano**.

También se añadieron **testigos ganadores verdaderos** anteriores, por evento `fecha|turno|jurisdicción|cabeza` único. Dos rutas que explicaron una misma cabeza NO equivalen a dos testimonios distintos. Se separa el testigo de **igual sitio** de desplazamiento vertical, traslado de fuente y la simple coincidencia general de silueta. La cabeza del turno objetivo no se consulta para elegir, y se conserva la fecha de cada raíz.

## Cortes comprobados

En 118 jornadas completas, 5 turnos por jornada, se reconstruyeron **590 fotografías PRE** y **472 comparaciones intrajornada**, de junio al 28/10. Montevideo no entra en la métrica uniforme de cinco jurisdicciones, para evitar calendarios heterogéneos.

Al comparar las figuras de los Tops de Nocturna:

| Origen del dibujo | VT2: sitios del Top actual ya presentes en el Top histórico |
|---|---:|
| Jornada sorteable inmediatamente anterior | **3.281 de 5.971 · 55,0 %** |
| Misma fecha semanal anterior D−7 | **2.698 de 5.091 · 53,0 %** |
| Semana D−14, como referencia | **2.221 de 4.158 · 53,4 %** |

Se comprobó además un contraste **emparejado en 78 Nocturnas**, donde D−7 y D−14 podían examinarse para la misma hoja objetivo, mismo número de sitios:
- VT2: **2.167 coincidencias de sitio con D−7 y 2.166 con D−14**; diferencia +1. Bootstrap por jornada 95 % aprox. **[−99, +102]**.
- VT3: **251 con D−7 y 202 con D−14**; diferencia +49. Bootstrap por jornada 95 % aprox. **[−6, +103]**, todavía compatible con cero.

Estas cifras muestran que **el mismo recorrido puede volver a entrar en los Tops cambiando la lectura**. Pero también demuestran que el mero sitio repetido es frecuente y en VT2 no mejora sobre el control D−14. VT3 da un indicio descriptivo más estrecho pero **no confirmado estadísticamente**, sujeto a múltiples comparaciones y sin validación prospectiva.

### Continuidad entre turnos: advertencia fundamental

Las hojas +11 son acumulativas: una columna completada no se modifica al pasar al siguiente turno. Por eso, si la **misma huella** continúa en el Top dentro del mismo día, su lectura numérica sigue siendo la misma. No es un nacimiento autónomo. La continuidad de su **selección por un motor** sí es un hecho registrable, no sinónimo de capacidad de acertar.

### Los testigos ganadores, por sí solos, también saturan

Se agregaron raíces geométricas verificadas de las seis jornadas anteriores, más turnos anteriores de la misma jornada. Una regla amplia (`>=2` acontecimientos de cabeza ganadora en la **misma posición**, en `>=2` días) señaló en promedio **unas 32 figuras por Nocturna**, aun sin usar el mismo número actual. Es demasiado para ser una alerta práctica: tampoco se convierte automáticamente en Top de apuestas o en una figura «especial».

Esto **descarta dar relevancia solo por cantidad de testigos**: hay que exigir cambio local observable, singularidad frente a posiciones comparables y representar únicamente unas pocas novedades, sin ocultar ni desechar las demás formas.

## Diseño de radar visual que sí respeta al padre

Cada episodio identificará una **figura y su recorrido real**, conservando:
- **Dónde** se destacó hoy: tablero, fuente, casillas, longitud, silueta y turnos en que entró/salió de Tops.
- **Qué antecedente ganador real** la marcó: minihoja, fecha, turno, cabeza, todos sus caminos y si el apoyo es **mismo sitio**, ±1 fila, fuente vecina o solo forma.
- **Qué cambió desde el corte anterior**: nuevo respaldo, entrada reciente a un Top, migración a otra fuente/zona, desaparición de un foco, reaparición en ventana de 5–6 jornadas.
- **Qué aportan las tres hojas**: hallazgo exclusivo de +11, AUX Ayer, AUX Hoy, o lectura VT2 de +11 extendida físicamente a VT3 dentro de una auxiliar. No mezclar rutas de distintas hojas al formar un número ni atribuir doble independencia a dos motores sobre +11.
- **Qué no salió**: conservar también figuras destacadas que NO produjeron cabezas. No transformar 513 fallido en un falso descubrimiento retrospectivo del 813.

**Los valores numéricos serán etiquetas para lectura actual y cotejo POST, no identidad longitudinal.** El puesto #7 de octubre se sigue como *episodio de ranking*, separado de las rutas específicas que explica; nunca se asume que el #7 representa una misma figura.

### Estado y próximos controles

La librería y los tests permiten reconocer identidad física, desplazamientos, convergencia en una misma hoja y antecedentes confirmados. El laboratorio produce un historial por corte para inspeccionar rutas. **No integra todavía un radar visual en la APK ni hace vigilancia continua**. Tampoco ha validado una ventaja predictiva.

Antes de proponer alertas selectivas en la app: (1) medir **nuevos cambios** en lugar de todas las figuras existentes; (2) comparar una figura contra otras de igual exposición física; (3) reconstruir de forma independiente los PRE auxiliares; (4) ensayar en una semana futura con criterios fijados **antes** de observar las cabezas.

## Archivos reproducibles

- `src/labRadarFiguras.ts`: identidad física, clasificación de movimientos e identidad entre motores.
- `src/labRadarRaicesGanadoras.ts`: testigos de cabezas reales pasadas y deduplicación de eventos.
- `scripts/test-radar-figuras.ts` y `scripts/test-radar-raices.ts`: rutas válidas, no saltos, raíces independientes y aislamiento auxiliar.
- `scripts/lab-radar-figuras-entre-turnos.ts`: 5 PRE por jornada, figuras de Top por fuente, comparaciones D−1/D−7/D−14 y testigos anteriores.
- [GitHub Actions 40987621905](https://github.com/y0t3/Modelo-Papa/actions/runs/40987621905): matrices junio–julio, agosto–septiembre y octubre, cada una con archivo JSON descargable de sus resultados.

**Conclusión:** formas sí se pueden rastrear aunque cambien los números. Pero "aparece otra vez" es demasiado común para destacar por sí solo. El verdadero detector debe seguir **novedades verificables y recorridos físicos con respaldo particular**, en episodios cortos, sin convertir ruido geométrico en nuevas prioridades oficiales.
