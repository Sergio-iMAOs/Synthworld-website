/** The site's own texts, in every language. English is the reference: the others must have the same keys. */
const en = {
  tagline: 'Deep polyphonic synthesizers',
  description:
    'SynthWorld makes deep polyphonic synthesizers on an engine of its own: free routing, and a modulation matrix where anything modulates anything.',
  nav: {
    synths: 'Synths',
    download: 'Download',
    manual: 'Manual',
    about: 'About',
  },
  footer: 'SynthWorld is a work in progress.',
  home: {
    construction: 'This site is under construction: nothing has been released yet, and what you read here may still change.',
    lead: 'Synthesizers on an engine of their own, where anything can be routed into anything and anything can modulate anything.',
    cta: 'See the synths',
    synths: 'The synths',
    engine: 'In every SynthWorld synth',
    features: [
      {
        title: 'Anything modulates anything',
        text: 'Any source moves any parameter, the amount of another modulation included. Feedback loops too.',
      },
      {
        title: 'A patch you can rewire',
        text: 'The processors are nodes in a graph you edit: change their order, split and join their paths, feed a side chain.',
      },
      {
        title: 'No clicks',
        text: 'Every change is smoothed or crossfaded, whatever you turn or rewire while it plays.',
      },
      {
        title: 'Any tuning',
        text: 'Scales of any number of notes, Scala files, and MTS-ESP. MPE, for a bend, pressure and timbre of each note.',
      },
      {
        title: 'Your own material',
        text: 'Import your wavetables (pictures too) and your samples, and keep them with your presets.',
      },
      {
        title: 'In your DAW or on its own',
        text: 'CLAP and VST3 plugins, and a standalone application.',
      },
    ],
  },
  synths: {
    title: 'Synths',
    lead: 'The synthesizers made with SynthWorld.',
    free: 'Free',
    listen: 'Listen',
    watch: 'Watch',
  },
  get: {
    buy: 'Buy for',
    demo: 'Demo:',
    unavailable: 'Not available yet.',
  },
  download: {
    title: 'Download',
    description: "Get SynthWorld's synths.",
    nothing: 'Nothing has been released yet.',
  },
  about: {
    title: 'About',
    description: 'What SynthWorld is and how to get in touch.',
    text: 'SynthWorld is an independent project: synthesizers made on an engine written from scratch for them.',
    contact: 'Contact',
    noContact: 'Contact details will be here soon.',
    portfolio: "The author's portfolio",
  },
};

const es: typeof en = {
  tagline: 'Sintetizadores polifónicos profundos',
  description:
    'SynthWorld hace sintetizadores polifónicos profundos sobre un motor propio: enrutamiento libre y una matriz de modulación en la que cualquier cosa modula cualquier otra.',
  nav: {
    synths: 'Sintes',
    download: 'Descargas',
    manual: 'Manual (en inglés)',
    about: 'Acerca de',
  },
  footer: 'SynthWorld está en desarrollo.',
  home: {
    construction: 'Este sitio está en construcción: aún no se ha publicado nada, y lo que lees aquí todavía puede cambiar.',
    lead: 'Sintetizadores sobre un motor propio, en los que cualquier cosa puede enrutarse a cualquier otra y cualquier cosa puede modular cualquier otra.',
    cta: 'Ver los sintes',
    synths: 'Los sintes',
    engine: 'En todos los sintes de SynthWorld',
    features: [
      {
        title: 'Cualquier cosa modula cualquier otra',
        text: 'Cualquier fuente mueve cualquier parámetro, incluida la cantidad de otra modulación. También en bucles de realimentación.',
      },
      {
        title: 'Un patch que puedes recablear',
        text: 'Los procesadores son nodos de un grafo que editas: cambia su orden, divide y une sus caminos, alimenta un side chain.',
      },
      {
        title: 'Sin clics',
        text: 'Todos los cambios se suavizan o se funden, gires o recablees lo que sea mientras suena.',
      },
      {
        title: 'Cualquier afinación',
        text: 'Escalas de cualquier número de notas, archivos Scala y MTS-ESP. MPE, para la inflexión, la presión y el timbre de cada nota.',
      },
      {
        title: 'Tu propio material',
        text: 'Importa tus tablas de ondas (también desde imágenes) y tus samples, y guárdalos con tus presets.',
      },
      {
        title: 'En tu DAW o por sí solo',
        text: 'Plugins CLAP y VST3, y una aplicación independiente.',
      },
    ],
  },
  synths: {
    title: 'Sintes',
    lead: 'Los sintetizadores hechos con SynthWorld.',
    free: 'Gratis',
    listen: 'Escucha',
    watch: 'Mira',
  },
  get: {
    buy: 'Comprar por',
    demo: 'Demo:',
    unavailable: 'Aún no disponible.',
  },
  download: {
    title: 'Descargas',
    description: 'Consigue los sintes de SynthWorld.',
    nothing: 'Aún no se ha publicado nada.',
  },
  about: {
    title: 'Acerca de',
    description: 'Qué es SynthWorld y cómo contactar.',
    text: 'SynthWorld es un proyecto independiente: sintetizadores hechos sobre un motor escrito desde cero para ellos.',
    contact: 'Contacto',
    noContact: 'Los datos de contacto estarán aquí pronto.',
    portfolio: 'El portfolio del autor',
  },
};

export const ui = { en, es };
