# Modelo Papá

Aplicación experimental para reconstruir digitalmente la hoja diaria de quiniela y estudiar el flujo geométrico temporal.

## Principios del tablero
- Cada turno es un bloque físico independiente de 6 filas × 2 dígitos (+11).
- Filas: Ciudad, Provincia, Córdoba, Santa Fé, Entre Ríos, Montevideo.
- Un recorrido sólo usa celdas que se tocan horizontal, vertical o diagonalmente.
- No hay saltos ni cruces entre columnas/turnos.
- Una celda no se reutiliza dentro del mismo recorrido.
- El orden del recorrido define el número.
- Para una cabeza ABCD sólo cuentan sufijos: CD (VT2), BCD (VT3), ABCD (VT4). Prefijos y fragmentos internos no son coincidencias.

## Construcción temporal
- PREVIA ← Nocturna del día de sorteo anterior.
- PRIMERA ← Previa del día actual.
- MATUTINO ← Primera.
- VESPERTINO ← Matutino.
- NOCTURNO ← Vespertino.

## Pantallas
- HOJA: tablero +11 histórico/actual, cabezas coincidentes y recorridos interactivos.
- CABEZAS: consulta de las cabezas completas por fecha, turno y jurisdicción.
- ANÁLISIS: reservado para el motor temporal V1, separado del motor geométrico objetivo.

## Fuente
Las cabezas se consultan desde Viví tu Suerte, igual que en VF-Quiniela.

## Desarrollo local
```bash
npm install
npx expo start
```

Proyecto separado de VF-Quiniela para no mezclar el laboratorio de motores anteriores con Modelo Papá.
