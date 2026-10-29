# Experimental VT2 y lectura física por formas — 29/10/2026

## Pedido atendido

La APP anterior exponía Geometría Completa y Configuraciones Conectadas solamente para VT3. Se incorporó la lectura **VT2** para ambas estrategias como motores EXPERIMENTALES INDEPENDIENTES. Ninguno alimenta Lalo MV1, VT3, VT4, AUX AYER ni AUX HOY.

En PREDICTIVA Lalo, dentro de las minihojas, cada recorrido ahora explica primero su **FORMA**:

1. Identifica la silueta geométrica de las celdas (independiente de dígitos e inversión de dirección); luego busca los recorridos que explicaron realmente cabezas anteriores con esa misma silueta. Permite ver juntos el camino HOY y la minihoja POST antigua, con sus celdas y fechas, fuente y traslado vertical.
2. La segunda sección conserva **sólo los antecedentes admitidos por el motor para este candidato**. Una silueta igual con otras cifras no se cuenta como raíz ni añade peso.
3. La minihoja actual es PRE: los resultados del turno objetivo no pueden convertirse en precedentes. Las marcas de un turno anterior del mismo día sí pueden ser referencia física del siguiente.
4. La familia numérica sigue siendo la lectura final de la trayectoria, pero el apoyo explicativo es la forma. No se cambian Tops, recorridos válidos, ni memoria MV1.

## VT2

- **Geometría Completa VT2**: recorre todas las duplas contiguas en cada columna +11 del PRE y les asigna un orden visual exploratorio a partir de desplazamientos de la misma forma/fuente y eventos ganadores anteriores de hasta seis fechas. Al final lee las dos cifras actuales. Una forma con otra cifra no crea un acierto.
- **Configuraciones Conectadas VT2**: requiere dos marcas VT2 provenientes de **cabezas ganadoras independientes**, que se hayan tocado físicamente en una misma fuente histórica. Traslada su configuración de posiciones a OTRA columna +11 que esté disponible en el PRE actual; luego lee los dos recorridos presentes, no reutiliza las cifras antiguas. Cada familia aparece una sola vez en el Top10 de consulta. No hace falta que el número resultante se parezca al anterior.
- Ambas listas son sólo investigación retrospectiva y comparación visual, **sin PRE sellado prospectivamente propio todavía**. No son una mejora demostrada ni generan apuesta.
- Los recorridos no atraviesan columnas dentro de +11; las configuraciones conectadas se trasladan entre fuentes como una comparación entre hojas, no como un camino numérico que cruza columnas.

## Icono y APK

El estilo aprobado está consolidado en `.github/scripts/icon-modelo-lalo.sh`: fondo azul oscuro `#10274A`, tipografía dorada `#F6D36D`, iniciales ML y etiqueta PRUEBA para la edición experimental. La APK de prueba se compila aislada con paquete `com.y0t3.modelopapa.formas` para no reemplazar la aplicación estable.

## Pruebas

- `npx tsc --noEmit --project tsconfig.ui-check.json`
- `npx --yes tsx scripts/test-vt2-formas-experimental.ts`: figura histórica con dígitos distintos, 2 eventos independientes, contacto, PRE sin fugas, geometría legal, sin usar fecha objetivo ni posterior.
- `scripts/test-figure-tracking.ts`, `test-vt2-family-history.ts`, `test-motor-lalo.ts`, minihojas AUX y sus regresiones.
- CI verificado: https://github.com/y0t3/Modelo-Papa/actions/runs/40851663539

## Validación pendiente

Comprobar visualmente en dispositivo: accesibilidad del detalle por figura, calidad del desplazamiento horizontal y longitud de minihojas, fechas al alternar turnos y posibilidad de comparar formas con varias trayectorias anteriores. Estudiar reglas de selección y falsos positivos de VT2 antes de adoptar el nuevo lector en el motor oficial.
