# Modelo Lalo — control de jornadas 26, 27 y 28/10/2026

**Rama:** `lab/auditoria-26a28oct-todos-motores`  
**Estado:** ejecución GitHub Actions correcta [#40801509244](https://github.com/y0t3/Modelo-Papa/actions/runs/40801509244).  
**Código oficial, APK y Tops históricos intactos.** No se grabó ningún PRE nuevo con fecha falsa.

## 1. En qué punto nos habíamos quedado
Última auditoría comparativa anterior: **24/10**. En octubre 1–24 se reconstruyeron 105 cortes PRE y 561 cabezas. Lalo MV1 VT3: Top3 **2**, Top5 **11**, Top10 **15**. Geometría: **3/4/9**; Nueva Prueba **3/5/10**; Configuraciones Conectadas **3/3/9**. Las variantes Pulso, MISMA_6 y movimiento solo habían mostrado mejoras exploratorias históricas, sin validación estable.

## 2. Tres jornadas nuevas, misma cronología
Se estudiaron **15 cortes**, 5 por fecha 26, 27, 28/10. Cada PRE se reconstruye usando **solo** las cabezas del día publicadas antes del turno objetivo, último Nocturno real por jurisdicción, antecedentes auténticos de D−1 / D−7 y seis jornadas efectivas anteriores para señales geométricas. Las hojas AUX AYER y AUX HOY usan sus respectivas políticas cronológicas; HOY oculta turnos auxiliares todavía no publicados. Las familias VT3 reversibles se comparan con sufijos exactos de tres cifras; VT4 con **valor físico exacto de cuatro cifras**.

**Fuente incompleta al momento de ejecutar:** el proveedor devolvió **26 cabezas del 28/10** en lugar de 27: falta **Santa Fé, Nocturno**. Se registraron **80 cabezas válidas de las 81 previstas** (27 el lunes, 27 el martes y 26 el miércoles). No se inventa ni copia su valor. Por lo tanto las cifras de 28/10 y los totales son **provisionales respecto de esa cabeza**, aunque los demás 80 controles sí se ejecutaron correctamente. La falta afecta solo al cotejo POST de esa cabeza, no al cálculo PRE de la propia Nocturna.

### Comparación VT3: 26–28/10, 80 cabezas

| Motor/criterio | Top3 | Top5 | Top10 | Observación |
|---|---:|---:|---:|---|
| Lalo MV1 | 0 | 0 | **1** | Único hit: 28/10 Matutino Montevideo `9176` |
| Geometría Completa | **1** | 1 | 1 | 26/10 Primera Entre Ríos `4056` |
| Nueva Prueba | 0 | 1 | 1 | Repite el `4056` de Geometría, pero no en Top3 |
| Configuraciones Conectadas | **1** | 1 | 1 | 27/10 Nocturno Provincia `2299` |
| Pulso Top10 | 0 | 0 | **1** | Misma cobertura Top10 que MV1, solo reordena |
| Memoria MISMA_6 | 0 | 0 | **1** | No rescata cabezas nuevas en estos cortes |
| Paso reciente | 0 | 0 | **1** | No rescata cabezas nuevas en estos cortes |
| Vector continuo | 0 | 0 | **1** | No rescata cabezas nuevas en estos cortes |
| AUX AYER | **1** | 1 | 1 | 27/10 Primera Entre Ríos `1308` |
| AUX HOY | 0 | **1** | 1 | 28/10 Matutino Entre Ríos `9153` |

**Importante:** estos hit son de **PRE reconstruidos históricamente** y NO prueban que el usuario tuviese esos mismos Top guardados antes del sorteo en el dispositivo. No sumar hits entre motores sin fijar presupuesto de candidatos: cada uno consume su propio Top10, y las lecturas se solapan.

### Comparación VT2 y VT4 (lectores que efectivamente los calculan)

| Modalidad | Lalo Top3 | Lalo Top5 | Lalo Top10 | AUX AYER Top3 | AUX AYER Top5 | AUX AYER Top10 | AUX HOY Top3 | AUX HOY Top5 | AUX HOY Top10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| VT2 | **6** | **9** | **17** | **7** | **10** | **14** | **2** | **4** | **7** |
| VT4 | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** |

En +11, de las 80 cabezas **47** tenían VT2 físicamente formable, **18** VT3 formable y **6** VT4 formable en sus respectivos cortes PRE. El problema del motor sigue siendo **seleccionar/rastrear VT3 y sus madres VT4**, no alterar la regla geométrica. El hecho de que VT4 fuera formable en seis ocasiones no significa que un motor validado hubiera debido colocarlas en Top.

### Línea cronológica de aciertos VT3 distintivos
- **Lun 26, Primera, Entre Ríos `4056`**: Geometría la incluyó en Top3 (`056/650`), Nueva Prueba en Top5/Top10. No estaba en Top10 oficial.
- **Mar 27, Primera, Entre Ríos `1308`**: AUX AYER incluyó `308/803` en Top3. No estaba en Top10 oficial.
- **Mar 27, Nocturno, Provincia `2299`**: Conectadas incluyó `299/992` en Top3. No estaba en Top10 oficial.
- **Mié 28, Matutino, Entre Ríos `9153`**: AUX HOY incluyó `153/351` en Top5, no en Top3.
- **Mié 28, Matutino, Montevideo `9176`**: Lalo MV1 incluyó `176/671` en Top10, no en Top5. Pulso/MISMA_6/Paso/Vector conservan esa cobertura.

Los cinco casos diferentes entre lectores indican **complementariedad de cobertura**, pero cada lectura agrega muchas familias no ganadoras; no constituye una estrategia de unión validada.

### PRE auténtico sellado antes del 26/10
Existe un único PRE confirmado en el repositorio para esta ventana: **Previa lunes 26/10**, sellado el **25/10 a las 07:13 hora AR** (`2026-10-25T10:13:57.326Z`), SHA256 `3d4c8bc10b24f8f23290c2f41b7692aef9a1897163c1cb1d684c6609b00f8771`. Los cinco resultados reales fueron Ciudad `0094`, Provincia `0299`, Córdoba `3905`, Santa Fé `6125`, Entre Ríos `2724`. **Lalo y Pulso tuvieron 0 aciertos en VT3 Top3/Top5/Top10**, y sus diez candidatas eran idénticas. Se contrastó el hash del archivo original, no se recalculó el Top bajo otro estado de información.

Los PRE locales almacenados por la APK no se encuentran en GitHub. **No se puede afirmar** a partir de este control qué turnos y motores guardaron realmente sus pronósticos en el teléfono, ni adjudicar como prospectivos los hits reconstruidos.

## 3. Comparación con el cierre anterior
Los tres días agregan **80 cabezas** y **15 cortes** a las 561 cabezas y 105 cortes previos, con **una cabeza faltante de proveedor**. El Top10 VT3 de Lalo pasó de 15 en 1–24/10 a **16** en 1–28/10 (hasta los 80 resultados comprobados); en Top3 permanece **2** y Top5 **11**. Las variantes de memoria/movimiento conservaron exactamente **la misma cobertura Top10** que Lalo en estos tres días y **no consiguieron ningún acierto Top3**.

## 4. Decisiones por motor
- **Lalo MV1** sigue siendo la referencia; no modificar madre VT3, prefijo VT4, raíces o Tops oficiales por este tramo de tres jornadas.
- **Geometría Completa** sí agregó el `4056` fuera del Top10 oficial. Retener como lectura independiente de cobertura, no promover en MV1.
- **Configuraciones Conectadas** agregó `2299`, también exclusivo: preservar como fuente estructural diferente.
- **Nueva Prueba** simplemente duplicó una parte de Geometría con otra colocación, sin acierto Top3. Dejar de considerarla una tercera evidencia independiente y, si se desea, archivarla visualmente.
- **AUX AYER** y **AUX HOY** continúan generando señales independientes (1308 y 9153). Evaluarlas separadas, porque HOY empieza sin hoja en Previa.
- **Pulso, MISMA_6, Paso y Vector** no sumaron cobertura Top10 ni mejoraron Top3 en estas fechas. No integrarlos por ahora.

## 5. Pendiente real
1. **Completar una cabeza:** Santa Fé Nocturno 28/10 (solo si una fuente verificable la publica) y reabrir el POST de ese corte, conservando los PRE reconstruidos existentes.
2. Registrar cada candidato de los motores en una tabla sellada PRE antes del próximo sorteo, con estado por lector y fecha de guardado; conservar capturas del dispositivo si el usuario puede exportarlas.
3. Utilizar Seguimiento de figuras para clasificar cuáles de las familias VT3 que **sí existían físicamente** no fueron seleccionadas, comparando antecedentes y el costo de falsas alarmas.
4. Repetir con jornadas nuevas antes de afirmar que una combinación de fuentes mejora al motor oficial.
5. No confundir estos conteos de lotería con ventaja predictiva estadísticamente probada.

## Archivos
- [Resultados verificados por corte](RESUMEN-VERIFICADO.json) (15 cortes, todas las fuentes y rankings, condición de faltante).
- `scripts/lab-cierre-26a28oct-motores.ts` ejecuta la misma reconstrucción y valida el sello único.
- [GitHub Actions #40801509244](https://github.com/y0t3/Modelo-Papa/actions/runs/40801509244), aprobados motor MV1, AUX y conectadas.
- Artefacto Actions `cierre-26-28oct-Lalo-AUX-Experimental`: JSON íntegro con los 15 cortes y el PRE auténtico validado.
