# Modelo Papá — Punto de control: cuaderno ocular comparativo, 95 cortes

Fecha de investigación: 10/10/2026.
Rama experimental: `experimento-analisis-visual-5d`.

## Resultado ya ejecutado

**GitHub Actions run verificado exitosamente:** https://github.com/y0t3/Modelo-Papa/actions/runs/38050016307

**ZIP del cuaderno ocular comparativo, para abrir sin internet tras descargarlo:** https://github.com/y0t3/Modelo-Papa/actions/runs/38050016307/artifacts/11668688489

El ZIP incluye **95 páginas interactivas**, agrupadas en `index.html`, 95 JSON fuente sin resultados del objetivo, los visores históricos originales para trazar manualmente celdas y todas las hojas anteriores ya marcadas, con sus cabezas completas. Tamaño comprimido aprox. 1,1 MB.

**Pruebas completadas:**
- Generación determinista y verificación de 95 fechas/turnos, SHA256 de cada JSON fuente y ausencia del resultado objetivo en las páginas.
- Contigüidad y geometría del camino dentro de la columna +11; inversiones no crean otra figura física.
- Cada figura elegida debe proceder de una ruta históricamente marcada, pertenecer a la fuente disponible y conservar todas las cabezas antiguas que explican su trazo.
- Elección expresa `directa` vs `inversa`. Hasta tres hipótesis; duplicar el mismo dibujo con la ruta invertida se rechaza. Sin figura elegida, `OBSERVAR_NO_JUGAR` con explicación.
- Comparación exigida contra otra huella visible y motivo de preferencia; si no hay ninguna alternativa, se registra esa ausencia, nunca se inventa un rival.
- Archivo local exportado cotejable con la lámina origen por SHA256, pero **sin certificación temporal del momento de la decisión**.
- Comprobador POST: **sólo** la orientación elegida se evalúa contra las seis cabezas del turno; la orientación opuesta se registra aparte, **sin computarla como acierto**. Si faltan resultados, la ausencia es indeterminada. La abstención no se convierte en predicción fallida.

## Cómo se usa

1. Descargar el ZIP, descomprimir, abrir `index.html` con un navegador.
2. Elegir fecha y turno. Inspeccionar la **hoja anterior completa** a la izquierda, los caminos violetas de ayer y, en verde, sólo las marcas ya comprobadas del día en las columnas disponibles.
3. Seleccionar `OBSERVAR / NO JUGAR` y explicar por qué no hay camino claramente superior; o elegir `Explorar hipótesis visual` y registrar entre uno y tres caminos.
4. Por cada camino guardar sentido, cabeza histórica, justificación, **rival visible** y explicación de por qué se lo descartaría. La selección es **totalmente humana**: no hay filtros, prioridades numéricas ni Top 3.
5. Exportar el archivo `CUADERNO-<fecha>-ANTES-<turno>.json`; el cuaderno conserva el vínculo verificable a la hoja fuente.

## Herramientas reproducibles

```sh
node scripts/check-cuaderno-ocular.cjs --record=CUADERNO-fecha-ANTES-turno.json --cut=fecha-ANTES-turno.json
```

El cotejo POST es **opcional** y debe hacerse **después** de cerrar el archivo de decisión:

```sh
node scripts/evaluar-cuaderno-ocular.cjs --cut=fecha-ANTES-turno.json --record=CUADERNO-fecha-ANTES-turno.json --results=cabezas-publicadas.json --out=informe-posterior.json
```

Forma de `cabezas-publicadas.json` (ejemplo de estructura, **no resultados reales**):

```json
{
  "date": "AAAA-MM-DD",
  "target": "Matutino",
  "heads": {
    "Ciudad": "----",
    "Provincia": "----",
    "Córdoba": "----",
    "Santa Fé": "----",
    "Entre Ríos": "----",
    "Montevideo": "----"
  }
}
```

Las `----` significan cobertura desconocida y por lo tanto **no** se marca fracaso de una elección que podría haber coincidido con una jurisdicción faltante.

## Qué NO significa

- El SHA256 verifica que el archivo se armó desde el corte preciso, **no** que una persona haya tomado una decisión antes del sorteo.
- Los 95 cortes son de septiembre de 2026, **ya sorteados**. Cualquier decisión realizada ahora es ensayo retrospectivo. El programa lo rotula siempre `REPLAY_HISTORICO_NO_PROSPECTIVO`; ni siquiera un resultado numérico favorable constituye prueba prospectiva.
- No se han generado automáticamente decisiones humanas ni supuestos «aciertos». Los ejercicios arrancan vacíos y **no existen pronósticos nuevos** registrados por esta tarea.
- Para probar el modelo en una fecha futura, hay que reproducir el tablero disponible entonces, guardar la interpretación **antes** de la publicación del sorteo, fijar sentido/columna/turno y conservar un sello temporal externo verificable (p. ej., un commit remoto registrado antes de la hora oficial). Sólo después se cotejan las cabezas.
- Los trazos reconstruidos siguen siendo interpretaciones geométricas digitales de todos los caminos válidos bajo reglas acordadas; la tinta precisa de los videos originales de septiembre **no** se ha validado fotograma a fotograma.

## Archivos de código

- `scripts/lab-comparativa95.js` — visor comparativo sin resultados del objetivo
- `scripts/lab-comparativa95.css` — diseño offline
- `scripts/build-cuaderno-ocular95.cjs` — genera las 95 páginas, firmas SHA256 y ZIP vía GitHub Actions
- `scripts/check-cuaderno-ocular.cjs` — valida ruta, sentido, procedencia, rivales, justificación y huella digital
- `scripts/evaluar-cuaderno-ocular.cjs` — compara a posteriori **sólo** el sentido elegido, más los fallos y abstenciones
- `.github/workflows/cuaderno-ocular-manual95.yml` — ejecución y tests

## Próximo objetivo

**Una prueba real de decisión de una persona, no del motor**, utilizando un tablero antes del próximo sorteo y almacenando la elección o abstención con una marca temporal externa antes de consultar la publicación. Se puede practicar primero sobre los 95 cortes históricos sin atribuir aciertos verdaderos.

Motor, selector, APK oficial y rama `main` intactos. Todo esto está exclusivamente en la rama de investigación.
