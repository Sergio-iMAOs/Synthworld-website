---
summary: Fully flexible synthesiser making framework
blurb: Focus on DSP and GUI and get a deep, fully flexible plugin synthesiser.
link:
  label: SynthWorld's synthesisers
  url: /
---

SynthWorld is a work in progress C++ framework for making plugin synthesisers. You develop independent processors, each with its own custom GUI, and SynthWorld automatically incorporates them into a deep, fully flexible polyphonic synthesiser.

It stands on its own, with no JUCE or other plugin framework: its own GUI toolkit, native CLAP and LV2 plugins, also built as VST3 and AU, a standalone application and an installer.

<!-- media: window -->

## Just worry about your DSP algorithms

Define your DSP processors and SynthWorld will incorporate them into the synthesiser, providing communication with the GUI, polyphony, voice management, modulation, automation, presets and much more. Everything smoothed, so you can forget about clicks and artifacts.

Voices are processed in groups, one per SIMD lane, so a processor written like scalar code serves a whole group at once. And only what's used is computed: a big synth playing a simple patch costs as little as a simple synth.

It comes with its own processors too: wavetable, simple and sub oscillators, noises, a sampler, a granular, filters, envelopes, LFOs and a whole set of effects.

<!-- media: wavetable, granular, noise -->

## Modulate anything

SynthWorld provides a fully flexible modulation matrix that allows all kind of modulations. Any modulator can modulate any parameter, through a straight line or a curve.

Make nested modulations, self/feedback modulations, modulate the modulation amount of any modulation.

<!-- media: mod-matrix -->

## Fully flexible and dynamic routing

The processors form a graph you can edit while playing, and the routing changes smoothly. Any connections, side chains, and containers that hold several options for one place in the patch.

The graph has three layers: the notes, changed by a transposer, a chord maker or an arpeggiator before they reach the voices; each voice, with its own copy of its processors; and the global effects over the voices' sum.

<!-- media: graph -->

## Skins

A synth looks the way its skin draws it. Every synth has SynthWorld's own, one dark and one light, and can bring its own, with colours, fonts and even shapes of their own.

<!-- media: sw-light, deep-sea, riso, starship -->
