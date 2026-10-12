# Punto de control — copias físicas adicionales VT3, geometría nueva y sus hijas VT4

**11/10/2026. Trabajo terminado sobre los 115 cortes históricos ya disponibles**, sin esperar sorteos nuevos. Rama experimental `auditoria-sorteo-10oct-2026`. No cambiar `main`, APK, marcado automático de la hoja ni V7–V14 oficiales.

## Cuál era el pendiente exacto

Tras auditar traslados confirmados D−7 y desde la última jornada, analizar **otras copias físicas reales de la MISMA madre VT3 presentes en la hoja PRE actual**, diferenciándolas de las huellas heredadas:

1. **Heredada**: ruta VT3 que coincide en fuente y coordenadas con algún traslado D−7 o de la última jornada.
2. **Otra ubicación de igual forma**: nueva ruta en la misma fuente con idéntica firma de movimientos físicos consecutivos, ignorando la lectura invertida.
3. **Forma nueva**: ruta de la familia VT3 con distinta firma de desplazamientos dentro de la misma fuente, no contenida en las huellas heredadas.

Todas las rutas son **casilleros contiguos (diagonal permitida), sin saltos, sin cruce de fuentes, vacíos ni reutilización**. Las tres clasificaciones son observacionales, nunca marcas predictivas añadidas manualmente. Las marcas históricas del tablero siguen siendo AUTOMÁTICAS a partir de las cabezas completas coincidentes.

Madre `729/927` + cifra `3`: **dos hijas hermanas ORIENTADAS `3729` y `3927`**, con inversas individuales `9273` y `7293`. Un padre VT3 no cambia a `273` por invertir una hija. Se conservaron todas las rutas VT4 reales y las proyecciones sin testigo se mantienen numéricas, no físicas.

## PRE geométrico auditado (115 cortes / 23 jornadas)

Sobre **1.104 madres-corte VT3** ya seleccionadas y sin mover sus puestos:
- **4.033** recorridos VT3 actuales comprobados exhaustivamente contra la tabla de 6×2 de cada fuente.
- **1.914** recorridos actuales distintos heredados de D−7 y/o la última jornada, contando una única vez una ubicación respaldada por ambas fechas.
- **2.119** recorridos adicionales de **forma no heredada**; en este universo, bajo firma reversiblemente normalizada y dentro de la misma fuente, **0** clasificados como otra ubicación de igual forma. No generalizar ese cero a todas las geometrías posibles.
- **918/1.104** madres con nuevas formas; **692** madres con al menos una hija física exclusiva de nueva forma.
- **1.947/11.040** combinaciones madre+cifra generaron alguna hija reversible VT4 con testigo físico de forma nueva **sin** testigo desde los padres heredados de esa madre.
- **10.875** testigos VT4 de extensión de ruta madre heredada y **11.884** de ruta madre de nueva forma, contabilizados como testimonios geométricos, NO apuestas ni aciertos independientes.
- El primer dígito cambia entre orden anterior D−7+D−1 y variante por formas nuevas en **730/1.104** madres.

PRE SHA256 `19c7b3ca7039854c6b425f0ca21503cb7c3bc1a8758515616b88888ea0c6779b`. Se calculó **sin archivo POST** y se reprodujo idéntico en carpeta aislada. El programa auditor `verificar.py` **vuelve a enumerar exhaustivamente** rutas sobre las fuentes +11, verifica trayectos y genealogías, y pasa en los 115 cortes.

## Comparación exploratoria de elección de la cifra (SIN cambiar las madres)

Orden anterior `D7D1_overlap` congelado vs nueva prioridad descriptiva a **hija VT4 físicamente exclusiva de forma nueva**, luego hijas físicas nuevas, después cantidad de rutas nuevas y desempate por orden congelado. Cupos: las mismas madres Top3/5/10, entre 1 y 3 dígitos por madre. **Control de probabilidad esperada exacta** para elegir K dígitos sin reemplazo entre diez en **esas mismas madres**; el presupuesto de grupos es igual pero el promedio de números VT4 distintos cubiertos entre políticas no es idéntico.

| Top madres × K cifras | Antes | Forma nueva | Control azar exacto |
|---|---:|---:|---:|
| Top3 × 1 | 0 | 0 | — |
| Top5 × 1 | 1 | 0 | — |
| Top10 × 1 | **1** | **0** | **1,97** |
| Top10 × 2 | **3** | **3** | **3,88** |
| Top10 × 3 | **5** | **6** | **5,73** |

Son **cortes con ≥1 cabeza completa cubierta**, de 115. Para Top10 × 3, **dos cortes rescatados y uno perdido**, delta **+1**; bootstrap descriptivo agrupado en las **23 jornadas** **[−2,+4]**, sin señal predictiva robusta. Promedio de valores distintos cubiertos Top10 × 3: antiguo **102,17**, nuevo **105,54**. Más cobertura es un posible confundidor. No afirmar que las formas nuevas anticipen sorteos.

### Casos obligatorios, positivos y negativos

- **26/09 Nocturno:** madre `283/382` puesto 7, cifra `4` asciende del 5.º al 3.º; resultado POST `4283`. Una forma adicional aporta un testigo físico exclusivo de la hija reversible `2834/4382` (inversa del `4283` entre las lecturas propuestas).
- **29/09 Nocturno:** madre `243/342` puesto 10, cifra `7` asciende del 5.º al 2.º; cabeza POST `7342`; dos huellas VT4 de forma nueva para hija reversible `2437/7342`, no disponible desde padre heredado.
- **19/09 Nocturno, negativo:** madre `109/901`, cifra `4` baja del 1.º al 3.º; se pierde `4109` en cupo 1 y 2 aunque hay caminos de procedencia heredada y nueva.
- **05/10 Matutina, negativo:** madre `729/927`, cifra `3` baja del 3.º al 5.º; se pierde `3729` con Top10 × 3. Ambas hermanas físicas `3729/3927` ya estaban presentes por extensiones **heredadas**. No adjudicar retroactivamente como acierto nuevo.

## Reproducibilidad, visor y restricciones

Paquete creado en la conversación: **`modelo-papa-copias-fisicas-nuevas-vt3-vt4-115-cortes-11oct2026.zip`**, 15 archivos, **3.245.913 bytes**, SHA256 **`c17ef404e079341110cfb0c5ecb02b7b569746cae36a4f86321b12a942413fcb`**. ZIP `testzip()` pasó; su contenido fue copiado a carpeta aislada **SIN POST** para fase PRE, SHA generado idéntico; al incorporar POST se reprodujeron idénticamente hashes POST, controles, CSV y ambos visores. Sin dependencias externas: Python 3 estándar.

Incluye `INPUT_PRE.json`, `PRE_MOVIMIENTOS.json`, `RESULTADOS_POST.json` separado, `analizar_copias.py` (`pre`/`post`), `verificar.py`, `controles.py`, `generar_visores.py`, `PRE_COPIAS.json`, `POST_COPIAS.json`, `BALANCE_115.csv`, informe, instrucciones y `VISOR_COPIAS_PRE_115.html`/`VISOR_COPIAS_POST_115.html`. Las vistas están empaquetadas con **115 casos**; los controles interactivos se probaron **en una copia representativa del caso 05/10** usando Chromium/Playwright `set_content` con cambio de madre, cifra y rutas, sin errores JS, no se declara verificada la apertura íntegra 115 casos en el navegador local debido al bloqueo de `file://` del entorno.

**Decisión:** registrar la geometría adicional en el observatorio pero NO subirla de prioridad automática en los Top de producción. Seguir desarrollando sobre estos mismos datos: distinguir en cada hija VT4 cuánto aporta el testigo heredado y cuánto aporta el camino nuevo, superponer evidencias D−7/D−1/V9 y mantener casos negativos visibles. La validación prospectiva es paralela, NO bloquea el desarrollo.
