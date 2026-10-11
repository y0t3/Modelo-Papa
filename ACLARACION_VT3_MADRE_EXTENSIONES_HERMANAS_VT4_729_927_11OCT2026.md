# Aclaración de familia madre VT3 y grupo de extensiones VT4 — 729/927

**Fecha:** 11/10/2026. **Corrección conceptual indicada por el usuario.** Exclusivamente documentación en la rama experimental `auditoria-sorteo-10oct-2026`, sin tocar motor, tablas +11, marcado automático, `main`, APK ni decisiones PRE/POST previamente congeladas.

## Qué se había confundido

El ejemplo del 05/10 se estaba presentando como `VT4 3729/9273`, tratándolo solamente como pareja numérica reversible de cuatro cifras. **Eso NO describe completamente la operación propuesta por el usuario:** partir de **una familia madre VT3 física ya identificada**, `729 / 927`, y **agregar la misma cifra a ambas lecturas de esa madre**, sin derivar una madre nueva del resultado de cuatro cifras.

Ejemplo exacto aportado por el usuario, con cifra **3** agregada **a la izquierda** en ambas lecturas:
- **Familia madre VT3:** `729 / 927`.
- **Hija VT4 1:** `3 + 729 = 3729`.
- **Hija VT4 2:** `3 + 927 = 3927`.
- **Grupo de extensiones VT4 anclado en la misma madre:** **`3729 / 3927`**, según la notación del usuario.

`3729` y `3927` son **hermanas por ascendencia VT3**, **NO** las dos orientaciones inversas de un único número VT4. Invertir por separado sus cuatro cifras da `9273` y `7293`, respectivamente. Esas lecturas inversas deben gestionarse como propiedad de cada hija, no como otra operación creadora de madre. En particular **está prohibido deducir una nueva madre `273`** tomando arbitrariamente las tres cifras finales de `9273`: esa terna no es `729/927`. Si una hija es leída del revés, la genealogía se conserva: madre `729/927`, no `273`.

**Distinción entre pertenencia de grupo y equivalencia reversible:**
- Grupo materno/operación: `madreVT3=(729,927), dígito=3, lado=izquierda` → `{3729,3927}`.
- Familia reversible de la hija 1: `{3729,9273}`.
- Familia reversible de la hija 2: `{3927,7293}`.
Estas dos últimas parejas **no deben sustituir el grupo de extensiones materno**. Si se muestra `3729/9273` a título de inversión numérica, aclarar explícitamente que **no** es la pareja materna `3729/3927` que se pidió formar.

## Unidad de clasificación propuesta para el nuevo laboratorio

Representar separadamente:
1. Identidad de **familia madre VT3** y TODAS sus huellas físicas legales, fuente, posiciones y procedencia D−7/D−1.
2. **Operación de extensión** (`cifraNueva`, `lado`, orientación del VT3 usado; registrar ambas lecturas de la madre).
3. **Grupo de hijas hermanas VT4** generado por la operación, sin sustituirlo por el reverso de una sola hija.
4. **Cada hija VT4**, con su lectura directa e inversa y testigos VT4 físicos propios (si existen); si no hay ruta física, marcar **propuesta numérica**, nunca un recorrido verificado.
5. **Evaluación** por grupo materno y por hija, informando el costo/cantidad de lecturas cubiertas. Contar `3729/3927` como un grupo materno **no es automáticamente equivalente** a contar `3729/9273` como una familia reversible de una sola hija. Si se reconocen inversas como aciertos (regla histórica), el grupo puede abarcar hasta cuatro números de cuatro cifras: `3729,3927,9273,7293`. El control aleatorio y el presupuesto deben igualar esa cobertura; evitar inflar éxitos por duplicación.

La cifra agregada no altera ni sustituye la familia VT3 madre. El reconocimiento físico válido de una VT4 por roce requiere ruta real de cuatro celdas contiguas dentro de **una misma fuente**; crear una segunda hija hermana numérica **no prueba** que exista una segunda ruta VT4.

## Consecuencia sobre ensayos anteriores

Las tablas/Top3/5/10 anteriores estaban construidas sobre otra unidad —**familia numérica reversible VT4**— y **NO se pueden reinterpretar automáticamente** como Top3/5/10 de grupos de dos hijas bajo una misma VT3. En particular, el rescate de `3729/9273` desde puesto 14 a 3 del ensayo viejo **no valida todavía** el grupo materno `3729/3927`, ni puede adjudicarse un acierto adicional. Conservar PRE/POST y hashes previos intactos; cualquier clasificación nueva requiere un PRE nuevo, otro denominador y controles equivalentes por presupuesto.

### Estado

Corrección de interpretación **documentada**, NO prueba experimental reevaluada. Queda pendiente implementar/evaluar genealogía de grupos maternos en laboratorio, sin alterar el marcado automático de la hoja.
