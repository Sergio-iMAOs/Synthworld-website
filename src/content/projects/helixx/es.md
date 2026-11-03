---
summary: Plugin de FM adaptativa para guitarras hexafónicas
blurb: Cada cuerda tiene su propio modulador, que sigue su altura, así que un acorde entero puede pasar por la FM sin convertirse en barro.
link:
  label: La página de Helixx
  url: /es/synths/helixx/
---

Helixx es un efecto de audio que modula en frecuencia una guitarra hexafónica, o cualquier otra fuente con una voz en cada canal. Sigue la altura de cada canal por separado y lo modula con su propio modulador, así que un acorde sigue siendo un acorde.

Es software libre, hecho con JUCE, y su código está [en GitHub](https://github.com/Sergio-iMAOs/Helixx).

<!-- media: window -->

## Un modulador por cuerda

La FM y la distorsión suelen desmoronarse con los acordes: cada nota modula a todas las demás, y el resultado es una masa de intermodulación. Una pastilla hexafónica le da a cada cuerda su propio canal, y Helixx trata cada canal como una voz monofónica independiente, con un detector de altura YIN, un modulador senoidal a la altura detectada multiplicada por una razón, y su propia línea de retardo o su propio filtro modulados. Todo funciona con sobremuestreo de 4×, para que las bandas laterales no produzcan aliasing.

Nada en él es específico de la guitarra: admite de 1 a 32 canales, así que también funciona con una pista dividida en partes mono.

<!-- media: voices -->

## Tres algoritmos

Los tres comparten el mismo modulador y se diferencian en lo que controla: el tiempo de retardo de una línea de retardo fraccional (FM adaptativa, según Lazzarini, Timoney y Lysaght), el coeficiente de un filtro paso todo (distorsión de fase, según Pekonen), o la ganancia de un camino de realimentación de una muestra (modulación de amplitud por realimentación, según Kleimola, Lazzarini, Välimäki y Timoney).

En la FM adaptativa, un modo relativo fija el rango de modulación en semitonos de la altura de cada cuerda en lugar de en milisegundos: el índice de modulación deja de depender de la nota, y el timbre se mantiene igual en todo el mástil.

## Mira cada cuerda

El espectro muestra la entrada y la salida de una cuerda, o la suma de todas, con líneas en su altura y donde deberían caer sus bandas laterales. Debajo, una celda por canal muestra su nota, su frecuencia y su afinación.

<!-- media: spectrum -->
