# Protocolo de balance hasta Vespertina — 10/10/2026

**Ejercicio exploratorio iniciado después de que se publicaran las cabezas de Matutina y Vespertina.** No es un test prespecificado antes de esos resultados ni una predicción; la regla de evaluación procede de las auditorías preexistentes. No se busca escoger a posteriori una cifra ganadora.

Fuentes temporales:
1. PRE Previa original 09:04 ART, GitHub run **38050639551**, SHA256 `19d3357c82e59dbf5050ed7941f160b7e4c04a1a0875fb5e25de9147a245ea4b`, UNA columna.
2. PRE Primera original 10:53 ART, GitHub run **38057490657**, SHA256 `99e26413ffcb724b58a89be30a017ccfc76a7b994282073b99e5cf97dce545e9`, DOS columnas.
3. Matutina y Vespertina: **SIN foto congelada antes**; reconstruir exclusivamente las columnas +11 determinadas por resultados de turnos previos, en retrospectiva, con fecha 10/10 y la fuente disponible actualmente. No comparar con el turno objetivo para calcular rutas. Las fuentes elegibles: Matutina `prevNocturno,Previa,Primera`; Vespertina agrega `Matutino`. Ningún camino puede atravesar de una a otra fuente. Mostrar procedencia y fuentes disponibles por etapa.
4. Nunca incluir Nocturna ni su resultado, aun si se publicara mientras corre el análisis. La hoja cerrada Vespertina tiene la siguiente columna todavía **nueva**, con valor `--` mientras no salga Nocturna.

Para cada corte:
- Preservar D−1 anotaciones y D−7 anotaciones históricas, completas, interpretadas en tablero del momento. Invertir la misma ruta no crea figura adicional; mantener historia y orientación bajo un único ID `VT|source|celdas canónicas`.
- Consultar las 6 cabezas completas de turno objetivo; preservar vacíos sin inventarlos. Evaluar coincidencias de todas las figuras por ambas lecturas, modalidad VT2/3/4, jurisdicción y fuente, separando D−1, D−7, unión, intersección y TODAS las figuras contiguas del tablero como control. Sin resultados de una jurisdicción, ausencia de coincidencia = INDETERMINADA, no fallo.
- Guardar y contar TODAS las rutas que no coincidieron. Por turno se registra cuántas figuras existían antes, cuántas coinciden con el resultado posterior, y cuántas de las figuras coincidentes ya se habían visto como confirmadas en turnos anteriores del mismo día. Describir los positivos mediante cabezas antiguas completas, tabla, celdas y sentido.
- Comparar las **reconfirmaciones de la misma geometría física** a través de turnos del mismo día (Previa, Primera, Matutino, Vespertino), contando inversión como misma huella; conservar incluso las que NO se reconfirman. No exigir mismo valor entre etapas si cambian celdas de origen; si no cambia fuente, la lectura tampoco puede mutar.
- Generar los cuatro visores de hoja +11 completos **POST** donde al tocar una cabeza se ven todos los recorridos confirmados; y expediente comparativo anterior vs posterior, con control sobre el universo geométrico por modalidad, todas las negativas, y estado de integridad.

**Cero selecciones humanas** antes de cualquier turno: no confundir existencia de varias opciones con pronóstico previo, incluso en capturas auténticas. Nunca concluir ventaja estadística a partir de una selección retrospectiva. No tocar rama `main`, motor, selector, APK ni su rama de rediseño.