# Modelo Lalo · AUX HOY / AYER (APK de prueba)

**Rama:** `lab/app-aux-hoy-ayer-22oct2026`. No se modifica `main`, ni MV1.

Interfaz: una sola hoja auxiliar debajo del +11, selector compartido
HOY·DINÁMICA / AYER·BASE. Predeterminado **HOY**.
- HOY: Santiago/Neuquén de la propia jornada; para PRE de
  Previa/Primera/Matutino/Vespertino/Nocturno disponibilidad
  0/8/16/24/24 cifras, respectivamente. Memoria D−1/D−7 extraída
  de recorridos exactos ganadores que ya existían antes del sorteo.
- AYER: hoja completa del día sorteable anterior, lista desde Previa;
  raíces históricas también usan el día anterior a SU fecha.
- Ambos motores independientes; no se mezclan Tops ni fuentes.
- HOJA: mismo espacio visual, un tablero auxiliar por vez.
- CABEZAS: identifica HOY/AYER/AMBAS y abre automáticamente el origen
  si la cabeza únicamente se dibuja en la variante opuesta.
- PREDICTIVA y PREDICCIÓN comparten selector global.
- INFO: al navegar a HOJA histórica se reconstruyen las dos bases de
  esa fecha, en lugar de usar las cifras del día actualmente cargado.
- Los recorridos exactos de +11, el modo oscuro, zoom y mini capturas
  se mantienen.
- Cualquier cabeza publicada SOLO se usa POST; no añade candidatos PRE.

La APK de este laboratorio se genera por el workflow
`apk-aux-hoy-ayer.yml` y se ofrece como artifact ZIP, dentro del cual
se encuentra `app-release.apk`. El usuario debe comprobar la interfaz
en su teléfono Android antes de considerar cualquier merge.
