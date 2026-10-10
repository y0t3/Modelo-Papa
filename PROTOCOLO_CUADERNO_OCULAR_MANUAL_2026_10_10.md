# Modelo Papá — Protocolo de observación ocular comparativa sin cabeza objetivo
Fecha de elaboración: 10/10/2026. Rama `experimento-analisis-visual-5d`.

## Propósito
Convertir el visor ciego existente en **cuaderno de decisiones humanas**, NO un selector programático de números. El motor no propone automáticamente mejores recorridos. Se muestran **TODOS** los VT2/VT3/VT4 físicamente contiguos que realmente explicaron las cabezas de la hoja anterior, además de las marcas ya comprobadas del día, cabezas completas y las alternativas con contacto o sin él.

## Observación antes del sorteo
La persona puede registrar `OBSERVAR_NO_JUGAR` con explicación, o `HIPOTESIS_VISUAL` (hasta 3 trazos). En cada trazo se exige:
- origen único, lista ordenada de celdas físicamente adyacentes, modalidad VT2/VT3/VT4, sentido de lectura **elegido explícitamente**; el mismo dibujo invertido no cuenta como dibujo independiente;
- procedencia de por lo menos un trazo ya MARCADO en la hoja histórica anterior (se conservan TODAS las cabezas antiguas que lo justificaron, y ambos sentidos posibles);
- explicación visual propia de al menos 16 caracteres;
- al menos **una alternativa visible** comparada, idealmente otra huella válida de la misma modalidad y columna, con motivo de descarte de al menos 16 caracteres; si no existe alternativa en el corte, explicar expresamente por qué;
- reconocimiento de que pueden coexistir otras formaciones; no usar marcadores de resultado futuro para construir ninguna explicación.

Para abstenerse se exige motivo visual, también se permite especificar cuáles huellas cercanas compitieron y por qué no se distinguían.

## Registros exportados
Cada archivo contendrá fecha, turno, fuentes visibles, día anterior, sello hash SHA-256 de la **lámina fuente del corte** (para verificar que las celdas no fueron modificadas), modo `REPLAY_HISTORICO`, fecha/hora **de exportación local no verificable**, decisión, orientaciones y recorridos escogidos, cabezas históricas, alternativas, explicación y nota de falta de evidencia temporal real. La validez geográfica y de geometría se comprueba por CLI contra el JSON de corte exacto; la coincidencia con la lámina fuente **NO** demuestra cuándo se hizo la selección.

Ningún registro se prellena con un candidato ni se comparará con el resultado objetivo dentro del mismo visor. Un estudio verdaderamente prospectivo debe guardarse mediante commit o servicio con marca temporal **antes** de publicarse el sorteo, y luego hacerse la verificación por separado. No llamaremos «acierto prospectivo» a una selección hecha ahora sobre una fecha antigua.

## Afirmaciones prohibidas
No afirmar que la ruta directa se prefirió históricamente cuando en realidad se miró después el resultado. No tratar la ruta invertida como segundo dibujo independiente. No atribuir causalidad a contactos o a «proximidad». No usar una decisión retrospectiva del laboratorio como dato que mejore un ranking ya congelado. Respetar `OBSERVAR/NO JUGAR` sin culpa.

La versión oficial en `main`, APK, motor y selector no se tocan. Sólo scripts y vistas experimentales.