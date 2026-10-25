# Modelo Lalo VT3 · holdout julio y 23 de octubre de 2026

**Estado:** laboratorio solamente. La APK, `main` y la geometría MV1 quedan intactas.

## Diseño predeterminado
Esta comprobación no se utilizó para elegir las prioridades. Regla fija:
dentro de las diez familias VT3 ya clasificadas, conservar la presencia
de bifurcaciones como criterio principal y adelantar D−1 como segundo
criterio; continuar por cantidad de bifurcaciones, D−7, fuentes y bloques.
El conjunto Top10 VT3 y la jerarquía completa de VT2 y VT4 permanecen
idénticos; NO aparecen candidatos o recorridos nuevos. Verificación de
fingerprint por familia, puesto, fuente y coordenadas en cada corte.

Cada jornada se reconstruye cronológicamente: Previa usa solo Nocturna
anterior; Primera incorpora Previa, etc. Las cabezas objetivo y futuras
no intervienen en PRE. Se evalúan cabezas publicadas por la fuente de la
app; días sin sorteo, como el feriado del 09/07, no se rellenan.

## Resultado del bloque no usado para elegir la variante

| Dato | Julio 01–31 | Viernes 23/10 | Conjunto |
| --- | ---: | ---: | ---: |
| Cabezas evaluadas | 699 | 27 | 726 |
| Cabezas VT3 físicamente formables en +11 | 170 | 7 | 177 |
| VT3 Top3 original | 2 | 0 | 2 |
| VT3 Top3 variante | **3** | 0 | **3** |
| VT3 Top5, ambos | 4 | 0 | 4 |
| VT3 Top10, ambos | 6 | 0 | 6 |

Nuevo acierto Top3: **24/07 Previa Entre Ríos 4886, puesto 4 → 3**.
No hubo pérdidas Top3 en las 28 jornadas de esta comprobación.
El 23/10 ninguna variante logró cabeza VT3 Top10, pese a siete cabezas
con final de tres cifras físicamente formable.

Invariantes: 140 cortes PRE (28 jornadas × 5 turnos), mismos diez
madres VT3 y mismos puestos, fuentes, dígitos y coordenadas de TODOS
los recorridos VT2 y VT4. Prueba automatizada aprobada.

## Efecto combinado observado, NO confirmación predictiva

Junto a los 58 días 17/08–22/10 que se habían explorado previamente:
86 jornadas, 2.279 cabezas, 430 cortes PRE.

- Top3 VT3 original: **9**; variante: **14**.
- Se incorporaron seis cabezas y se perdió una (saldo neto +5).
- Top5/Top10 VT3 no cambian, tampoco VT2 ni VT4.
- Contraste pareado de los siete eventos discordantes:
  prueba binomial unilateral p=0,0625; bilateral p=0,125,
  **sin corrección por seleccionar entre distintos selectores**.
  El tamaño pequeño de la muestra de aciertos obliga a cautela.
- Remuestreo ilustrativo por día de la diferencia neta:
  30.000 réplicas, semilla 20261024, intervalo percentil 95 %
  aproximadamente [0,10] aciertos. No demuestra valor predictivo.

### Referencia aleatoria *condicional* al Top10

En los 430 cortes, 38 cabezas estuvieron dentro del Top10 VT3
original (35 cortes con al menos un éxito). Simulación exploratoria
con 50.000 repeticiones, semilla 20261024: elegir tres **puestos**
uniformes sin reemplazo entre los diez de cada corte, contando varias
cabezas en un puesto cuando corresponda. Media 11,42 Top3, desviación
2,82; el 22,9 % de simulaciones igualó o superó los **14** Top3 de
la variante. Aproximación condicional: asume que existen diez puestos
en cada corte relevante; no es un ensayo de predicción ciego, ni una
prueba corregida por selección múltiple.

Importante: este nulo evalúa solo la **discriminación dentro del Top10**,
no compara el motor físico con el azar en el universo de todos los números
ni calcula probabilidades de sorteo.

## Conclusión y decisión
- La variante es una mejora retrospectiva de la *concentración* en
  Top3 con cupo idéntico, sin cambios colaterales de VT2/VT4.
- La muestra independiente julio y 23/10 es favorable en julio y
  neutra el 23/10. No establece superioridad estadística.
- No integrar en la APK ni sustituir MV1. Mantenerla como laboratorio
  fijo, sin sumar nuevos selectores por cada resultado.
- La limitación más visible es la distancia entre familias físicamente
  formables y familias efectivamente priorizadas. Recomendación futura:
  estudiar esa distribución con criterios geométricos y cortes PRE,
  sin modificar reglas por coincidencias puntuales.

## Archivos y ejecución
Workflow aprobado:
https://github.com/y0t3/Modelo-Papa/actions/runs/40146128681
Artefacto: `lalo-vt3-holdout-julio-23oct` con por-cabeza,
cortes-pre y comparaciones. Test:
`scripts/lab-holdout-lalo-julio-23oct.ts`.

Evaluación integral previa:
https://github.com/y0t3/Modelo-Papa/actions/runs/39919569807
