# Sidecar PRE prospectivo — genealogía VT3 para Previa 14/10/2026

**Rama independiente, sin editar jamás el PRE ni el SELLO original de la Previa ya sellados a las 01:13 ART.**
Se autorizan exclusivamente las mismas 30 fechas históricas, las cabezas completas anteriores al objetivo (12 y 13 de octubre) y las fuentes visibles ANTES de la Previa de 14/10. No leer resultados del 14/10 ni calcular POST en este flujo.

## Hipótesis prefijada desde laboratorio retrospectivo
Para cada familia VT3 respaldada por una raíz ganadora histórica, reconstruir ruta antigua y ruta actual en su misma fuente; firma invariante por traslación e inversión de ruta, y posición de bloque. Variables `MUTATION`: firma distinta; `SHIFT_BIG`: firma idéntica desplazada al menos dos filas; `CHANGE_NUMERIC`: distinta familia reversible de la cabeza antigua. Puntaje descriptivo **3×MUTATION + 2×SHIFT_BIG + CHANGE_NUMERIC**. No afirmar probabilidad.

Política `GENEALOGIA_TERCERO`: conservar las madres #1 y #2, escoger tercera únicamente de madres originalmente #3–#10 por mayor puntaje, empatar con ranking oficial; conservar mismas diez madres. Política `GENEALOGIA_DECIMO`: conservar originales #1 a #9 y elegir la mayor puntuación positiva de madres ancladas originalmente #11–#30; si no hay elegible mantener décima oficial. Control: hash SHA256 determinista prefijado sobre la misma bolsa elegible para cada plaza.

## Verificaciones
- Verificar SHA256 del PRE y sello previos, no modificarlos ni modificar selección original.
- Reconstruir exactamente la salida íntegra `buildMotorLalo` a partir de entradas anteriores; cotejar 18 familias, órdenes, rutas y raíces con el PRE previamente sellado.
- Las columnas Previa–Vespertino del 14/10 están vacías; `sheet.heads.Previa=[]`. Ningún sorteo objetivo consultado.
- Guardar nuevo PRE independiente con rutas, raíces y puntajes antes del sorteo; sellar hashes del PRE base, protocol, script, motor y el nuevo PRE, con hora de GitHub Actions.
- La evaluación posterior será POST en otro flujo, sin editar ambos sellos.

**Interpretación:** la regla proviene de numerosas exploraciones sobre 115 cortes ya conocidos. Su ensayo en 14/10 es el primer contraste temporal de ese criterio, no una validación por sí mismo. Sorteo aleatorio y riesgo de sobreajuste.
