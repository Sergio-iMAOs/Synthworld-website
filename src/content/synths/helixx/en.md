---
summary: "A free, open-source adaptive FM effect for hexaphonic guitars: each string gets a modulator of its own that follows its pitch, so a whole chord can go through FM without turning to mud."
---

Helixx is a side project of SynthWorld's, and an effect rather than a synth: it frequency-modulates a hexaphonic guitar, or anything else that comes with one voice on each channel.

<!-- object: binary -->

## One modulator per string

FM and distortion usually fall apart on chords: every note modulates every other, and what comes out is a wash. A hexaphonic pickup avoids that by giving each string a channel of its own, and Helixx treats each channel as a voice of its own. Each one gets:

- **A pitch detector**, from 60 Hz to 1.5 kHz.
- **A sine modulator** at that pitch times **COARSE FREQ**. Whole numbers stay harmonic, and anything else moves the sidebands off the harmonic series.
- **Its own delay line or filter**, which the modulator drives.

So each note is modulated in tune with itself, and a chord stays a chord. It all runs at 4× oversampling, to keep the sidebands from aliasing.

<!-- screenshot: voices -->

<!-- object: system -->

## Three algorithms

All three share the same modulator and differ in what it acts on:

- **Adaptive FM** drives the delay time of a delay line. The moving delay shifts the pitch up and down, as a passing siren's does, and that is frequency modulation: classic FM sidebands.
- **Allpass** drives the coefficient of an allpass filter: phase distortion, mostly in the low end.
- **Feedback AM** drives the gain of a one-sample feedback path: feedback amplitude modulation.

<!-- object: comet -->

## Even across the neck

In Adaptive FM, with **MOD RANGE** in milliseconds, the modulation grows with the pitch, so high notes come out brighter than low ones. Turn on **RELATIVE** and it's in semitones, relative to each string's pitch: the modulation no longer depends on the note, and the timbre stays even all the way up the neck.

<!-- object: cluster -->

## See every string

The spectrum shows a string's input and output, or all of them summed, with orange lines at its pitch and at where its sidebands should land. Hover over it to read the frequency, the level and the nearest note.

<!-- screenshot: spectrum -->

Under it, a cell for each channel shows its note, frequency and tuning: click one to choose what the spectrum shows. A channel that has lost its pitch dims and reads **HELD**, because its modulator keeps the last pitch it found.

<!-- object: constellation -->

## Not only guitars

Nothing in it is specific to the guitar or to six channels. Helixx takes 1 to 32 channels, as long as inputs and outputs match, so it also works on a stem split into mono parts, or on a stereo pair with one voice on each side. Each channel does need to be monophonic: a chord on a single channel gives the pitch detector nothing clear to follow.

<!-- object: satellite -->

## Free and open source

Helixx is free software, under the GNU AGPL 3.0 or later, and its code is [on GitHub](https://github.com/Sergio-iMAOs/Helixx). It plays in your DAW as a VST3 plugin, or an AU on macOS, or on its own as an application. Until there are ready-made downloads, its repository explains how to build it yourself.
