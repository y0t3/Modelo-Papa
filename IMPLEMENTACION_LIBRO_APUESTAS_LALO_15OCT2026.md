# Registro monetario de Lalo: importe idéntico en la bajada de cuatro, tres y dos cifras

## Regla acordada
Cuando Lalo confirma una apuesta que incluye una cuaterna «bajada», el mismo importe se aplica **separadamente** al número VT4, a las últimas 3 cifras y a las últimas 2 cifras. Ejemplo: `3044`, `044`, `44` con $1.000 por número producen $3.000 de gasto total. El pronóstico PRE no equivale a una apuesta: el gasto nace sólo al confirmar **APUESTA REAL**.

## Pantalla
Nueva sección interna de pestaña LALO: `MI PRONÓSTICO | APUESTAS | BALANCE`. En APUESTAS:
1. Congelar primero el PRE personal para poder construir la boleta. Los candidatos aparecen como **números literales**, conservando el origen `↓ Bajado` para VT3 y VT2.
2. Activar o desactivar los renglones que realmente se jugaron (por defecto aparecen todos marcados), elegir una jurisdicción y escribir un **único importe entero en pesos argentinos por número**. Se muestra el gasto antes de confirmar.
3. Confirmar explícitamente; guarda una boleta independiente del PRE, con SHA256, fecha, turno, jurisdicción, alcance **a la cabeza**, importes y renglones literales. No se pueden insertar nuevas boletas de ese turno si se conoce algún resultado ni si la fecha ya pasó.
4. Cuando se conoce la cabeza de esa jurisdicción, compara estrictamente sus últimas 2/3 o cuatro cifras exactas contra **el valor apostado**. Ejemplo: `044` no es la apuesta literal `440` aunque su familia analítica reversible coincida.
5. **Cobro real:** tras una coincidencia documentada, Lalo registra cuánto dinero efectivamente recibió. No se inventan premios, tasas, multiplicadores ni ganancias estimadas. Los cobros quedan registrados como eventos separados e incrementan el total cobrado, sin alterar la boleta ni el PRE.

En BALANCE se muestran boletas, números, **gastado**, **cobrado** y **neto = cobrado − gastado** por semana seleccionada. Apuestas con resultados pendientes o ganancias aún no cobradas tienen gasto registrado pero **ingresos $0** hasta que exista un cobro real.

## Limitaciones claras
- La primera versión comprueba automáticamente sólo **a la cabeza** por jurisdicción. No se asignan pagos a apuestas a 5/10/20 posiciones sin contar con todas las extracciones y las tarifas aplicables. Antes de agregar esos alcances hay que especificar la modalidad de Lalo.
- Si varias elecciones generan **el mismo número literal y la misma modalidad**, se ofrece una sola línea para evitar duplicación automática de gastos. Hay que confirmar con Lalo si en tal caso suele apostar **un importe único** o **volver a cargar ese importe por cada cuaterna**: esto afecta el presupuesto cuando se superponen bajadas.
- Importes permitidos en esta versión: pesos enteros positivos, admitiendo entrada `1000` o `1.000` (se rechazan decimales en vez de interpretarlos mal).
- Se conservan los PRE antiguos V1/V2 sin atribuirles bajadas retrospectivas. Todas las boletas son registros **locales** en AsyncStorage, no tickets legales ni certificados por terceros; pueden perderse si se borra la app. La clave de apuestas no reemplaza las claves de pronósticos existentes.
- Los pronósticos, el motor predictivo automático VT2/VT3/VT4 y todos sus rankings permanecen inalterados. No se generó APK.

## Archivos
- `src/laloApuestas.ts`: catálogo literal, boletas, integridad, verificación de cabeza y dinero.
- `src/laloLibroStorage.ts`: persistencia de boletas/cobros en clave separada y guardado con bloqueo de operaciones concurrentes.
- `src/ui/LaloLibroApuestas.tsx`: selección de líneas, jurisdicción, importe, confirmación, recibos y balance.
- `src/ui/PapaPronostico.tsx`: integración en la pestaña LALO.
- `scripts/test-lalo-libro-apuestas.ts`: prueba de coste triple, premios cobrados, no inversión de cifras, resultado neto e integridad.
- `.github/workflows/validar-lalo-unificado.yml`: CI completa incluida prueba nueva.
