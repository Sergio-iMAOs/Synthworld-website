---
summary: "Un efecto de FM adaptativa, gratuito y de código abierto, para guitarras hexafónicas: cada cuerda tiene su propio modulador, que sigue su altura, así que un acorde entero puede pasar por la FM sin convertirse en barro."
---

Helixx es un proyecto paralelo de SynthWorld, y un efecto en lugar de un sinte: modula en frecuencia una guitarra hexafónica, o cualquier otra cosa que llegue con una voz en cada canal.

<!-- object: binary -->

## Un modulador por cuerda

La FM y la distorsión suelen desmoronarse con los acordes: cada nota modula a todas las demás, y lo que sale es una masa de sonido. Una pastilla hexafónica lo evita dándole a cada cuerda su propio canal, y Helixx trata cada canal como una voz independiente. Cada una tiene:

- **Un detector de altura**, de 60 Hz a 1,5 kHz.
- **Un modulador senoidal** a esa altura multiplicada por **COARSE FREQ**. Los números enteros se mantienen armónicos, y cualquier otro saca las bandas laterales de la serie armónica.
- **Su propia línea de retardo o su propio filtro**, que el modulador controla.

Así, cada nota se modula en sintonía consigo misma, y un acorde sigue siendo un acorde. Todo funciona con sobremuestreo de 4×, para que las bandas laterales no produzcan aliasing.

<!-- screenshot: voices -->

<!-- object: system -->

## Tres algoritmos

Los tres comparten el mismo modulador y se diferencian en aquello sobre lo que actúa:

- **Adaptive FM** controla el tiempo de retardo de una línea de retardo. El retardo en movimiento sube y baja la altura, como la sirena de un coche que pasa, y eso es modulación de frecuencia: las clásicas bandas laterales de la FM.
- **Allpass** controla el coeficiente de un filtro paso todo: distorsión de fase, sobre todo en los graves.
- **Feedback AM** controla la ganancia de un camino de realimentación de una muestra: modulación de amplitud por realimentación.

<!-- object: comet -->

## Igual en todo el mástil

En Adaptive FM, con **MOD RANGE** en milisegundos, la modulación crece con la altura, así que las notas agudas suenan más brillantes que las graves. Activa **RELATIVE** y pasa a estar en semitonos, relativa a la altura de cada cuerda: la modulación deja de depender de la nota, y el timbre se mantiene igual en todo el mástil.

<!-- object: cluster -->

## Mira cada cuerda

El espectro muestra la entrada y la salida de una cuerda, o la suma de todas, con líneas naranjas en su altura y donde deberían caer sus bandas laterales. Pasa el ratón por encima para leer la frecuencia, el nivel y la nota más cercana.

<!-- screenshot: spectrum -->

Debajo, una celda por canal muestra su nota, su frecuencia y su afinación: haz clic en una para elegir lo que muestra el espectro. Un canal que ha perdido su altura se atenúa e indica **HELD**, porque su modulador conserva la última altura que encontró.

<!-- object: constellation -->

## No solo guitarras

Nada en él es específico de la guitarra ni de seis canales. Helixx admite de 1 a 32 canales, siempre que las entradas y las salidas coincidan, así que también funciona con una pista dividida en partes mono, o con un par estéreo con una voz en cada lado. Eso sí, cada canal debe ser monofónico: un acorde en un solo canal no le da al detector de altura nada claro que seguir.

<!-- object: satellite -->

## Libre y de código abierto

Helixx es software libre, bajo la GNU AGPL 3.0 o posterior, y su código está [en GitHub](https://github.com/Sergio-iMAOs/Helixx). Suena en tu DAW como plugin VST3, o AU en macOS, o por sí solo como aplicación. Hasta que haya descargas listas para usar, su repositorio explica cómo compilarlo tú mismo.
