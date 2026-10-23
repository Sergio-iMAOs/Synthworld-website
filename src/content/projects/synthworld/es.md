---
summary: Un framework totalmente flexible para hacer sintetizadores
blurb: Céntrate en el DSP y la interfaz y obtén un sintetizador en forma de plugin, profundo y totalmente flexible.
link:
  label: Los sintetizadores de SynthWorld
  url: /es/
---

SynthWorld es un framework en C++, aún en desarrollo, para hacer sintetizadores en forma de plugin. Desarrollas procesadores independientes, cada uno con su propia interfaz, y SynthWorld los incorpora automáticamente a un sintetizador polifónico profundo y totalmente flexible.

No depende de nadie, ni de JUCE ni de ningún otro framework de plugins: tiene su propio kit de interfaz, plugins CLAP y LV2 nativos, también en VST3 y AU, una aplicación independiente y un instalador.

<!-- media: window -->

## Preocúpate solo de tus algoritmos de DSP

Define tus procesadores de DSP y SynthWorld los incorporará al sintetizador: se encarga de la comunicación con la interfaz, la polifonía, la gestión de voces, la modulación, la automatización, los presets y mucho más. Todo suavizado, para que te olvides de clics y artefactos.

Las voces se procesan en grupos, una por carril SIMD, así que un procesador escrito como código escalar sirve a todo un grupo a la vez. Y solo se calcula lo que se usa: un sintetizador grande tocando un patch sencillo cuesta tan poco como uno sencillo.

También trae sus propios procesadores: osciladores de tablas de ondas, simples y subosciladores, ruidos, un sampler, un granular, filtros, envolventes, LFO y todo un repertorio de efectos.

<!-- media: wavetable, granular, noise -->

## Modula cualquier cosa

SynthWorld ofrece una matriz de modulación totalmente flexible que permite todo tipo de modulaciones. Cualquier modulador puede modular cualquier parámetro, en línea recta o con una curva.

Haz modulaciones anidadas, automodulaciones y realimentaciones, o modula la cantidad de cualquier otra modulación.

<!-- media: mod-matrix -->

## Enrutamiento totalmente flexible y dinámico

Los procesadores forman un grafo que puedes editar mientras tocas, y el enrutamiento cambia con suavidad. Cualquier conexión, cadenas laterales y contenedores con varias opciones para un mismo lugar del patch.

El grafo tiene tres capas: las notas, que un transpositor, un generador de acordes o un arpegiador cambian antes de que lleguen a las voces; cada voz, con su propia copia de sus procesadores; y los efectos globales sobre la suma de las voces.

<!-- media: graph -->

## Skins

Un sintetizador se ve como lo dibuja su skin. Todos tienen las de SynthWorld, una oscura y una clara, y pueden traer las suyas, con sus propios colores, fuentes e incluso formas.

<!-- media: sw-light, deep-sea, riso, starship -->
