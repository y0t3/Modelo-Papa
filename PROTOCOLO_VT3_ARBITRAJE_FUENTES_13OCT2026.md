# VT3 — arbitraje por procedencia de fuente y persistencia
13/10/2026 · Rama aislada `lab-vt3-arbitraje-fuentes-13oct2026`.

**Motivación descubierta POST, no validación nueva:** en los 115 cortes de 23 jornadas Matutina consiguió 8 cortes Top10, Vespertina cero; Matutina registró tanto madres arrastradas de los Top10 anteriores como otras que llegaron por la fuente Primera. Los resultados de esas mismas 23 fechas ya se inspeccionaron y optimizaron muchas veces.

## Hipótesis a falsar sin introducir familias físicas extra
Evaluar con exactamente diez familias VT3 ancladas procedentes de la **misma bolsa original Lalo** (sin inventario nuevo), manteniendo el orden original como desempate para toda alternativa. No alterar rutas, genealogías, familia reversible, ni fuentes.

- `A_OFICIAL`: Top10 original intacto.
- `B_FUENTE_NUEVA`: primero candidatas con **al menos una ruta anclada propia** en la última fuente intradía que ya había ocurrido (Previa: prevNocturno; Primera: Previa; Matutino: Primera; Vespertino: Matutino; Nocturno: Vespertino); después las demás. Dentro de cada grupo se respeta el ranking oficial.
- `C_NOCTURNA_ANTERIOR_AL_FINAL`: primero candidatas con **al menos una ruta anclada propia en fuente distinta de prevNocturno**; después las demás. Candidatas con raíces en ambas pueden ir primero, pero sólo por sus caminos propios.
- `D_PERSISTENTE`: primero candidatas que ya estaban en el Top10 oficial del turno inmediatamente anterior en la misma jornada; orden original dentro de cada grupo.
- `E_NACIENTE`: primero candidatas que NO estaban en ese Top10 anterior; orden original dentro de cada grupo.

No se suman pesos, raíces, fuentes ni bonificaciones especiales. Previa no tiene turno anterior: C/D/E no discriminan con fuentes de un turno inexistente y respetan original cuando todos empatan (B también). Las rutas añadidas en la hoja sólo se usan si la familia ya está anclada por la bolsa original, para no confundir cobertura física y permiso predictivo.

## Protocolo temporal
1. Partir del PRE físico `auditorias/vt3-cobertura-bifurcaciones-115-13oct2026/PRE_115.json`, SHA256 `be7649199ad7a133c73ae37f3c102e8d660eb000c74f62f10aa0df7cb9db7612`.
2. Apartar físicamente `POST_115.json` y `NOCTURNA_POST_DIAGNOSTICO.json` antes de generar las cuatro alternativas. Guardar `PRE_115.json`, `SELLO.json` con hashes y lista ordenada de las diez familias por corte.
3. Restituir POST y comparar cada política sobre 115 cortes, agrupados por turno/mes; enumerar ganancias y pérdidas frente a original. Jamás cambiar `src/motorLalo.ts`, `main`, APK, Tops sellados ni VT4.
4. No declarar ganadora una alternativa tras inspeccionar los resultados. El ensayo no tiene holdout externo; sirve para identificar sensibilidad del criterio físico por turno y próximos controles con datos ya existentes.

Regla de interpretación: Mejoras retrospectivas pequeñas o cambiantes de mes no dan señal confiable. Es válido concluir que ninguna alternativa ayuda. Evaluar tanto los éxitos nuevos como las familias correctas desalojadas del Top10.
