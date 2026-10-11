# Ensayo experimental de árbitro V12/V14 sobre familias VT4 (11/10/2026)

**Resultado ejecutado.** No es un port de V12/V14 histórico. Prueba la idea original —combinar especialistas y decidir cuáles familias entran Top10/Top5/Top3— con las correcciones de genealogía y caminos físicos.

**Solo laboratorio en rama** `auditoria-sorteo-10oct-2026`. Motor oficial, `main`, selector de producción y APK intactos.

## Protocolo y datos

- 29 días, 145 cortes PRE. Familias VT4 numéricas reversibles `A/B`; identidades de madres VT3 distintas de las hijas VT4; 4 celdas válidas para DIRECTA/ROCE, extensión AZAR sin testigo físico se rotula proyección y no realimenta memoria VT4 como geométrica. Regla madre VT3 de ejemplo: `346/643`, hija `0643/3460`, variante hermana `0346/6430` sin introducirla retroactivamente al Top.
- El 11/10 se reejecutó `correccion_genealogia_vt3_vt4/probar_genealogia.py` satisfactoriamente: 5.800 propuestas intactas, 3.770 genealogías de extensión, 1.885 hermanas explicitadas, cero cambios del POST previo.
- Se reconstruyeron a partir del universo exhaustivo PRE bolsas de **100 familias por método** (DIRECTA, ROCE, AZAR) en cada corte y se cotejaron contra las 5 cabezas argentinas completas por objetivo. Las primeras diez de cada método se verificaron idénticas a las listas históricas congeladas. Hash PRE de bolsas **`c6e745e835d79b2a607a89263f198def3f1af99760ea3f0740d3385eb01f5e28`**.
- Resultado de octubre, **45 cortes**: Top10 de cada uno de los cuatro métodos originales **0**. En Top20: DIRECTA **0**, ROCE físico **1**, AZAR numérico **1 pero sin VT4 física**. En Top50: DIRECTA **0**, ROCE **1 físico**, AZAR **2 numéricos, 0 físicos**. En Top100: DIRECTA **4 físicos**, ROCE **2 físicos**, AZAR **3 numéricos, ninguno físico**. No sumarlos como aciertos independientes, una misma cabeza/figura puede aparecer en más de un método.
- Casos: **05/10 Matutino Santa Fe cabeza 3729**, familia `3729/9273` rango **14** de ROCE, cuatro celdas dentro de Primera +11. **02/10 Previa Córdoba 6397**, familia `6397/7936` rango **13** de AZAR, madre `639/936`, hija **sin** testigo físico de cuatro celdas en su propia propuesta. Las dos lecturas de la hija no pueden sobrescribir identidad de la madre.
- Aumentar de 10 a 100 familias aumenta oportunidades numéricas de coincidencia casi por definición, no demuestra una mejora predictiva.

## Segunda etapa: metaordenador por familia y arbitraje PRE

- Se agruparon las candidatas de los tres métodos en una **bolsa única por familia numérica**, sin duplicar sentidos ni fuentes, pero preservando evidencia/procedencia de todos sus recorridos. Total **32.608 familias-corte** en 145 cortes.
- Modelo experimental de ordenación V13/V12-V14: regresión logística con 17 rasgos preobjetivo (rango por método, existencia de ruta física, fuentes, huellas, historia D−1/D−7, roce/contactos, etc.). **Solo septiembre 2026** para entrenar: **22.605 filas y apenas 18 positivas**. No interpretar su score como confianza calibrada.
- Con las cabezas posteriores de octubre inaccesibles a esta fase se congelaron **45 cortes × ocho estrategias**: meta-selector aprendido solo septiembre, criterio fijo, conservador físico, aleatorio de control por hash, cuatro listas antiguas. SHA256 de selecciones PRE: **`60077028e7e357729f06fca692290955e71d3437417b4da9c8519a1ee4fe0549`**.
- Cotejo POST independiente: **todos 0/45** en Top 3, Top 5 y Top 10. Ninguno mejoró los métodos antiguos; no evidencia para activar el metaordenador. Cabezas numéricas posteriores separadas de listas PRE.
- A diferencia de un método de aprendizaje prospectivo formal, **octubre no es un holdout virgen**, porque ya se había examinado en iteraciones del proyecto antes de este diseño. Verificar ausencia de archivos POST en el ejecutable PRE evita fuga directa de datos pero no elimina sesgo de investigación histórico.

## Conclusión metodológica

1. La arquitectura de especialistas V7/V8/V9 + selector por familia + árbitro V12/V14 mantiene sentido como diseño explicable.
2. V12/V14 **no puede aportar familias ausentes de sus bolsas de entrada**; el límite del Top10 existe antes de arbitrar.
3. Un Top10 de familias físicas/no físicas es diferente de un Top10 de números; la lectura invertida pertenece a la familia, y la extensión VT4 artificial debe conservar su madre VT3 y un estado de proyección explícito.
4. Por ahora las listas VT4 pueden mantenerse como **investigación**, con derecho a abstenerse de presentar una señal predictiva. No forzar pesos ni porcentajes de mezcla; no aprender de 18 positivos y atribuirle certeza.
5. La mejora real debe evaluarse en series cronológicas genuinamente independientes o ampliar el análisis de respaldos visuales reales, no añadir más compuertas sobre la misma evidencia.

**Material de entrega al usuario:** `modelo-papa-ensayo-arbitro-v12-v14-familias-vt4-145-cortes.zip` (22 archivos; fuentes PRE, SEPT entrenamiento, POST separado, 5 scripts, hash, informe, visor PRE y POST). ZIP verificado. URLs locales del chat: `ensayo_arbitro_v12_v14_vt4_145/ANTES_ARBITRO_FAMILIAS_VT4.html`, `DESPUES_ARBITRO_FAMILIAS_VT4.html`, `INFORME_ARBITRAJE_V12_V14.md`.
