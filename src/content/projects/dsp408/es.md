---
summary: Aplicación para un procesador de altavoces que calibra equipos de sonido automáticamente
blurb: Mide un equipo de sonido con un micrófono, y la aplicación lo ajusta. Un driver, un emulador y una aplicación en Rust.
---

DSP 408 es una aplicación de escritorio, aún en desarrollo, que calibra un equipo de sonido automáticamente: lo mide con un micrófono y ajusta el procesador de altavoces que lo controla, el t.racks FIR DSP 408.

El fabricante del procesador solo ofrece un editor para Windows, y no documenta nada de cómo se comunica con la unidad. Así que la aplicación tiene un driver propio, escrito en Rust, para sus conexiones USB y Ethernet.

<!-- media: outputs -->

## Calibración automática

La aplicación reproduce señales de prueba por el equipo de sonido, barridos y ruido, y las escucha con un micrófono de medición. A partir de lo que oye calcula la respuesta y el retardo de cada altavoz, y con ellos los retardos, las ecualizaciones y los filtros FIR que ajustan el equipo, y los envía al procesador: sus altavoces en fase y su respuesta uniforme, sin ajustarlo de oído y a mano.

Los móviles y tabletas en la misma red son sus mandos, para recorrer el recinto mientras se calibra.

## Ingeniería inversa

El protocolo se ha deducido del editor del fabricante: descompilándolo con Ghidra, trazando sus comandos con Frida mientras se manejaban sus controles uno a uno, y registrando cada intercambio. Cada dato está anotado con su procedencia, y cada uno es un test construido con los bytes capturados.

Para capturar sin riesgo, un emulador hace de procesador para el editor del fabricante: responde como el editor espera, y falla a propósito para ver cómo gestiona los errores. El driver también se prueba contra él.

## La aplicación

Todo lo que hace el procesador está en la aplicación: los niveles, retardos y mutes de las entradas y salidas, ecualizadores paramétricos, crossovers, filtros FIR, limitadores, la matriz de enrutamiento, los enlaces entre canales y los presets de la unidad. Las curvas de los filtros se dibujan como las calcula el editor del fabricante, y sus archivos de presets y de unidad se leen y escriben byte a byte.

Tiene deshacer y rehacer, y un modo sin conexión sobre la unidad emulada. Se ve como los sintetizadores de SynthWorld, con sus skins y su fuente.

<!-- media: mixer -->
