---
summary: Adaptive FM plugin for hexaphonic guitars
blurb: Each string gets a modulator of its own that follows its pitch, so a whole chord can go through FM without turning to mud.
link:
  label: Helixx's page
  url: /synths/helixx/
---

Helixx is an audio effect that frequency-modulates a hexaphonic guitar, or any other source with one voice on each channel. It follows the pitch of each channel on its own and modulates it with a modulator of its own, so a chord stays a chord.

It's free software, made with JUCE, and its code is [on GitHub](https://github.com/Sergio-iMAOs/Helixx).

<!-- media: window -->

## One modulator per string

FM and distortion usually fall apart on chords: every note modulates every other, and the result is a wash of intermodulation. A hexaphonic pickup gives each string a channel of its own, and Helixx treats each channel as a separate monophonic voice, with a YIN pitch detector, a sine modulator at the detected pitch times a ratio, and its own modulated delay line or filter. Everything runs at 4× oversampling, to keep the sidebands from aliasing.

Nothing in it is specific to the guitar: it takes 1 to 32 channels, so it also works on a stem split into mono parts.

<!-- media: voices -->

## Three algorithms

All three share the same modulator and differ in what it drives: the delay time of a fractional delay line (adaptive FM, after Lazzarini, Timoney and Lysaght), the coefficient of an allpass filter (phase distortion, after Pekonen), or the gain of a one-sample feedback path (feedback amplitude modulation, after Kleimola, Lazzarini, Välimäki and Timoney).

In adaptive FM, a relative mode sets the modulation range in semitones of each string's pitch instead of milliseconds: the modulation index no longer depends on the note, and the timbre stays even all the way up the neck.

## See every string

The spectrum shows a string's input and output, or all of them summed, with lines at its pitch and at where its sidebands should land. Under it, a cell for each channel shows its note, frequency and tuning.

<!-- media: spectrum -->
