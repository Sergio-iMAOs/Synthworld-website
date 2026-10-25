---
summary: Loudspeaker processor app for automatic sound system calibration
blurb: Measure a sound system with a microphone, and the app tunes it. A driver, an emulator and an app in Rust.
---

DSP 408 is a work in progress desktop app that calibrates a sound system automatically: it measures the system with a microphone, and tunes the loudspeaker processor that drives it, the t.racks FIR DSP 408.

The processor's maker only ships an editor for Windows, and documents nothing of how it talks to the unit. So the app has a driver of its own, written in Rust, for its USB and Ethernet connections.

<!-- media: outputs -->

## Automatic calibration

The app plays test signals through the sound system, sweeps and noise, and listens to them through a measurement microphone. From what it hears it computes each speaker's response and delay, and from them the delays, EQs and FIR filters that tune the system, and sends them to the processor: its speakers in time and its response even, without tuning it by ear and by hand.

Phones and tablets on the same network are its remotes, to walk around the venue while calibrating.

## Reverse engineering

The protocol was worked out from the maker's editor: decompiling it with Ghidra, tracing its commands with Frida as its controls were driven one by one, and recording every exchange. Each fact is written down with where it came from, and each one is a test built from the captured bytes.

To capture safely, an emulator plays the processor for the maker's editor, answering as the editor expects, and failing on purpose to see how it handles errors. The driver is tested against it too.

## The app

Everything the processor does is in the app: the inputs' and outputs' levels, delays and mutes, parametric EQs, crossovers, FIR filters, limiters, the routing matrix, channel links and the unit's presets. The filters' curves are drawn as the maker's editor computes them, and its preset and unit files are read and written byte for byte.

It has undo and redo, and an offline mode on the emulated unit. It looks like SynthWorld's synths, with their skins and their font.

<!-- media: mixer -->
