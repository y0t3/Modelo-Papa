# Punto de control: VT4 por roce — diversidad de madres y todos los recorridos (11/10/2026)

**Investigación terminada.** 29 jornadas, 145 cortes PRE/POST (100 septiembre y 45 octubre). Solo rama experimental `auditoria-sorteo-10oct-2026`. **NO** se modificó motor del Modelo Papá, `main`, selector, APK ni pesos productivos.

## Pregunta que se investigó

¿Por qué la VT4 física `3729/9273`, acertada el **05/10/2026 Matutino Santa Fe**, había quedado en el puesto **14** del selector VT3→VT4 por roce, fuera del Top10? ¿Podría V13 distinguir figuras por madres VT3 diversas, sin cambiar resultados para favorecer casos conocidos?

Hallazgo: el ranking por roce estaba dominado por **hijas numéricas de pocas madres físicas VT3**. En 05/10 los puestos 1–4 derivaban de una sola madre VT3 `177/771` y 5–8 de `338/833`. La familia `3729/9273` nacía de una madre `729/927` de fuente Primera+11 marcada en D−7 y ocupaba el puesto 14. Otras modalidades tenían cientos de alternativas y a veces 10 lugares ocupados por apenas 2–3 madres.

## Prueba causalmente censurada por corte

Con el PRE de las 145 hojas y **sin abrir el objetivo del turno**, se fijaron **11 políticas de diversificación** (restringir 1/2/3 hijas por madre física o numérica, alternar fuentes, mezcla suave o priorizar D−7) sobre exactamente la misma bolsa de hasta 100 VT4 físicas por roce. SHA256 PRE congelado:
`d748498c9214b5f38feb3e9fd4ec3c90c5298941f9d34a975ebf2bc13d0b1fda`.

En otra etapa, sin leer POST, se fijaron **seis políticas adicionales** de evidencia por **TODOS los caminos VT4** y **TODAS las madres VT3 reales** (D−1, D−7 en una o más madres, múltiples testigos, familias madre alternativas) sobre la misma bolsa. SHA256:
`e59cb79a1dee20808e9b5a2ea09c6ab0688d6be71a0710d8905ecf0b2c2107cd`.

Ambos evaluadores verificaron los hashes PRE antes de abrir las cinco cabezas argentinas del POST. Repetición usando solo fuentes embebidas en el ZIP e integridad de rutas verificada. **Las políticas se diseñaron después de conocer el caso 3729**, de modo que octubre NO es un holdout genuinamente independiente; aunque el PRE no lea POST, el análisis global continúa siendo exploratorio.

## Resultado general de los 145 cortes

- **Septiembre, 100 cortes:** 0 coincidencias en Top3/5/10 en **todas** las 17 políticas de VT4 por roce.
- **Octubre, 45 cortes:** ranking original VT3+roce **0** en Top3/5/10. Diversificar madres produjo **1/45** Top5 o Top10. Alternancia de fuentes **1/45 Top3**. Dar prioridad a madres distintas con D−1 y D−7 **1/45 Top3**. **TODAS las coincidencias de octubre son el mismo evento 05/10, familia 3729/9273**, no aciertos independientes.
- En las 4.445 candidatas ROCE de las bolsas hasta Top100 de octubre, solo **2** terminaron coincidiendo con cabezas: 05/10 `3729/9273` (puesto 14) y 10/10 Nocturno `2654/4562` (puesto 80). **2.147** exposiciones tenían madre D−7, con **1** positiva; **2.298** no, con **1** positiva. Antecedente D−7 solo no discrimina aquí.
- Control aritmético: al escoger 10 familias aleatorias de la misma bolsa por fecha/turno, coincidencias esperadas ~**0,20** cortes en octubre (0,80 en septiembre). Una coincidencia entre 45 cortes probando 17 métodos no demuestra ventaja de pronóstico.
- Por diversificación extrema una madre física por hija, media de madres diferentes en Top10 octubre **2,33 → 10**, pero se reemplazan unas **7,67 familias** por corte. Alternar fuentes amplió fuentes distintas representadas en Top10 **1,27 → 2,87**; no imponer esta regla en contra de la hipótesis preferencial Nocturna anterior.

## Verificación exhaustiva de todos los dibujos por familia

En los Top de las 17 políticas hay **4.562 apariciones familia-numérica/corte** (una posición por las lecturas reversibles), pero cuentan con **13.024 testigos físicos de cuatro celdas**; **3.295** de esas apariciones tienen **al menos dos** recorridos diferentes. Cada testigo conserva su fuente + casillas reales y sus dos subrecorridos VT3 exactos. Por lo tanto, no descartar las rutas alternativas de una familia representándola solo con un dibujo.

El ejemplo `3729/9273` tiene **dos rutas físicas VT4** en fuente Primera+11 y **tres posibles madres VT3 físicas** en sus subtrayectos: una `273/372` con marca **D−1**, una `729/927` sin marca y otra `729/927` físicamente distinta con **D−7**. Se debe separar D−1/D−7 de la madre de la hipótesis de que la hija VT4 ya acertó: **la hija NO estaba históricamente comprobada por ese hecho**.

Con políticas fijadas PRE:
- posición antigua roce **14.º**, fuera Top10;
- **5.º** si se restringe una hija por **familia madre**;
- **2.º** si se intercalan fuentes;
- **3.º** si se priorizan antecedentes D−1 y D−7 de madres físicas distintas.

## Prototipo e informe reproducibles entregados al usuario

Carpeta local `experimento_diversidad_madres_vt4_145/`:
- `ANTES_FAMILIAS_MADRES_MULTIRUTAS.html` — visor autocontenido, 145 cortes, 16 variantes visibles (11 de diversidad y cinco de historial completo), Top10 de familias y **TODOS** los dibujos físicos sobre matrices +11; libre de cabezas objetivo.
- `DESPUES_COTEJO_MADRES_VT4.html` — página separada con balance real.
- `INFORME_MADRES_Y_HUELLAS_VT4.md`, `LEEME_PRIMERO.md`;
- seis scripts de preparación PRE y cotejo POST, dos PRE JSON, sus SHA, archivo.gz de rutas y madres completas, resultados POST y entradas originales `FUENTES/`, copia de captura `CAPTURA_PRE_HUELLAS_3729.png`.
- ZIP `modelo-papa-vt4-madres-diversidad-multitrazos-145-cortes.zip` (24 archivos, ~5 MB, `ZipFile.testzip()` OK).
- UI probada de verdad en Chromium con Playwright `page.set_content`: fecha 05/10 Matutino, fuentes intercaladas, familia 3729 (dos trazos, madres y marcas), regla de D−1/D−7 distintas, navegación a 10/10 y documento POST; **cero errores JS**.

## Decisión técnica

**Rescatar en laboratorio**: llevar todas las huellas y todas las madres al expediente de cada familia V13, y ofrecer una diversificación ligera como explicación, no como filtro permanente ni score supuestamente predictivo. La cifra agregada de una hija VT4 nunca altera la familia VT3 madre. Las inversiones siguen siendo aciertos de familia. Mantener Nocturna anterior como hipótesis flexible, no fuente obligatoria. V12/V14 todavía no ha mostrado una razón estadística suficiente para publicar Top3 predictivos VT4.

Los sorteos de quiniela son aleatorios; no atribuir poder predictivo demostrado a la coincidencia histórica de 3729. El hallazgo es principalmente **un defecto subsanable de representación de diversidad y multitrayectorias**, que antes perdía información útil.
