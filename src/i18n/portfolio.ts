import type { Lang } from './index';

/** The portfolio's texts, in every language (the site's own are in ui.ts). English is the reference: the others must have the same keys. */
const en = {
  description: 'Sergio iMAOs: music, sound engineering, and instruments made of code and of wood.',
  roles: 'Music, sound and the instruments to make them',
  intro:
    "I love art, especially music and sound, and I'm passionate about discovering new ideas. I'm drawn to what’s being created TODAY. Fresh, avant-garde, and experimental works that reflect our current life experience.",
  nav: { music: 'Music', projects: 'Projects', about: 'About', contact: 'Contact' },
  today: 'Today',
  synthworld: 'SynthWorld, my synthesisers',
  music: {
    title: 'Music',
    lead: 'Songs and soundtracks. From composition to mastering.',
    selected: 'Selected works',
    all: 'All works',
    kinds: { soundtrack: 'Soundtrack', soundtrackAlbum: 'Soundtrack album', album: 'Album' },
    credits: { viaje: 'Guitar and vocals recording, mixing and mastering by Jose Muñoz at' },
    coverOf: 'Cover of',
    studio: 'The studio',
    collaborate: {
      title: 'Open for collaborations',
      text: "I'm always excited to connect with other artists. I'm open to fresh ideas and meaningful collaborations. Let's build something new!",
      cta: 'Contact me',
    },
  },
  projects: {
    title: 'Projects',
    lead: 'Some of my documented personal projects.',
    more: 'See more',
    others: 'Other projects',
  },
  about: {
    title: 'About',
    lead: 'My story, my experience.',
    bio: 'Bio',
    early: [
      "Born in Valladolid, Spain, in 2000, I've been curious about knowledge and my surroundings from a very young age.",
      'In 2014, I started playing electric bass in a rock band, beginning a long musical journey that took me through multiple bands and genres. In 2019, I began exploring jazz, music theory, and harmony, studying books like The Berklee Book of Jazz Harmony, and discovered a fascinating, deep world that inspired me to start composing and learning new instruments.',
      'During these early years, I also began learning about live sound mixing and the basics of music production.',
    ],
    sevilla: [
      'In 2021, I moved to Sevilla, Spain, where I lived intermittently for three years. During that time, I started a project called La Onda, bringing together artists from various disciplines to organize events that celebrated all forms of art. These ranged from open-air gatherings with workshops and performances to multiple days camping festivals filled with creative activities.',
      "The main goal was to build a supportive artist community and network, and it worked. La Onda became one of the city's key artistic projects and a hub for creatives. Although based in Sevilla, we organized events across Spain.",
      'At the same time, I began studying music production and sound design, primarily through books. One key resource was The Computer Music Tutorial by Curtis Roads, which eventually led me to explore audio DSP.',
    ],
    abroad: [
      'Between 2023 and 2024, after traveling through and exploring many European cities, I settled in Zürich, Switzerland for six months. There, I continued expanding my artistic network while working as a sound engineer in various venues and as a stagehand for large-scale, high-production shows across the country.',
      'In the summer of 2025, I took part in Waking Life Festival in Portugal, co-running a live music and jam session stage as both organizer and sound engineer.',
      "Afterwards, I moved to Helsinki, Finland to begin a Master’s in Acoustics and Audio Technology at Aalto University. There, I started working as an acoustics research assistant at Aalto Acoustics Lab in Ville Pulkki's research group.",
    ],
    photos: {
      live: { caption: 'Playing live, 2015', alt: 'Sergio playing electric bass on stage with a band' },
      laOnda: { caption: 'A La Onda event', alt: 'A crowd at night in front of a small lit stage under a canopy' },
      lab: { caption: 'At Aalto Acoustics Lab', alt: 'Sergio standing in an anechoic chamber next to a column of loudspeakers' },
      keyboard: { alt: 'A keyboard in the dark, lit in red' },
    },
    studies: {
      title: 'Academic studies',
      items: [
        { years: '2025 – Today', what: 'Master’s in Acoustics and Audio Technology', where: 'Aalto University (Espoo, Finland)' },
        { years: '2022 – 2023', what: 'Digital Mixing and Music Production', where: 'ProAudio School (Sevilla, Spain)' },
        { years: '2018 – 2021', what: 'Bachelor’s in Computer Science', where: 'Universidad de Valladolid (Valladolid, Spain)' },
      ],
    },
    work: {
      title: 'Work experience',
      items: [
        { years: '2026 – Today', what: 'Acoustics research assistant', where: 'Aalto Acoustics Lab (Espoo, Finland)' },
        { years: '2021 – 2026', what: 'Live sound engineer', where: 'Freelancer' },
        { years: '2021 – 2025', what: 'Event organiser', where: 'La Onda (Spain), freelancer' },
        { years: '2023 – 2024', what: 'Stagehand', where: 'EPOS (Switzerland), Nomadworks (Switzerland)' },
        { years: '2020', what: 'Computer science research assistant', where: 'Universidad de Valladolid (Valladolid, Spain)' },
        { years: '2018 – 2023', what: 'Music teacher', where: 'Freelancer' },
        { years: '2017 – 2024', what: 'Professional musician', where: 'Ralea Orchestra (Spain), freelancer' },
      ],
    },
  },
  contact: {
    title: 'Contact',
    lead: 'Feel free to reach out, whether you have a project in mind, need a sound engineer, want to collaborate, or simply want to connect or ask me anything.',
    email: 'Email',
  },
};

const es: typeof en = {
  description: 'Sergio iMAOs: música, ingeniería de sonido e instrumentos hechos de código y de madera.',
  roles: 'Música, sonido y los instrumentos para hacerlos',
  intro:
    'Me encanta el arte, sobre todo la música y el sonido, y me apasiona descubrir ideas nuevas. Me atrae lo que se está creando HOY: obras frescas, vanguardistas y experimentales que reflejan cómo vivimos ahora.',
  nav: { music: 'Música', projects: 'Proyectos', about: 'Sobre mí', contact: 'Contacto' },
  today: 'Hoy',
  synthworld: 'SynthWorld, mis sintetizadores',
  music: {
    title: 'Música',
    lead: 'Canciones y bandas sonoras. De la composición al mastering.',
    selected: 'Obras seleccionadas',
    all: 'Todas las obras',
    kinds: { soundtrack: 'Banda sonora', soundtrackAlbum: 'Álbum de banda sonora', album: 'Álbum' },
    credits: { viaje: 'Grabación de guitarra y voces, mezcla y mastering de Jose Muñoz en' },
    coverOf: 'Portada de',
    studio: 'El estudio',
    collaborate: {
      title: 'Abierto a colaboraciones',
      text: 'Siempre me ilusiona conectar con otros artistas. Estoy abierto a ideas frescas y a colaboraciones con sentido. ¡Construyamos algo nuevo!',
      cta: 'Escríbeme',
    },
  },
  projects: {
    title: 'Proyectos',
    lead: 'Algunos de mis proyectos personales documentados.',
    more: 'Ver más',
    others: 'Otros proyectos',
  },
  about: {
    title: 'Sobre mí',
    lead: 'Mi historia, mi experiencia.',
    bio: 'Bio',
    early: [
      'Nací en Valladolid, España, en 2000, y desde muy pequeño he sentido curiosidad por el conocimiento y por lo que me rodea.',
      'En 2014 empecé a tocar el bajo eléctrico en una banda de rock: el comienzo de un largo viaje musical que me ha llevado por muchas bandas y géneros. En 2019 empecé a explorar el jazz, la teoría musical y la armonía con libros como The Berklee Book of Jazz Harmony, y descubrí un mundo fascinante y profundo que me animó a componer y a aprender nuevos instrumentos.',
      'En esos primeros años también empecé a aprender a mezclar sonido en directo y los fundamentos de la producción musical.',
    ],
    sevilla: [
      'En 2021 me mudé a Sevilla, España, donde viví de forma intermitente durante tres años. En ese tiempo puse en marcha un proyecto llamado La Onda, que reunía a artistas de varias disciplinas para organizar eventos que celebraban todas las formas de arte: desde encuentros al aire libre con talleres y actuaciones hasta festivales de acampada de varios días llenos de actividades creativas.',
      'El objetivo principal era construir una comunidad y una red de artistas que se apoyaran, y funcionó. La Onda se convirtió en uno de los proyectos artísticos clave de la ciudad y en un punto de encuentro para creativos. Aunque teníamos la base en Sevilla, organizamos eventos por toda España.',
      'Al mismo tiempo empecé a estudiar producción musical y diseño de sonido, sobre todo con libros. Uno fundamental fue The Computer Music Tutorial, de Curtis Roads, que acabó llevándome a explorar el DSP de audio.',
    ],
    abroad: [
      'Entre 2023 y 2024, después de viajar por muchas ciudades europeas y explorarlas, me instalé seis meses en Zúrich, Suiza. Allí seguí ampliando mi red artística mientras trabajaba como técnico de sonido en varias salas y como auxiliar de escenario en espectáculos de gran formato y gran producción por todo el país.',
      'En el verano de 2025 participé en el Waking Life Festival, en Portugal, donde codirigí un escenario de música en directo y jam sessions como organizador y como técnico de sonido.',
      'Después me mudé a Helsinki, Finlandia, para empezar un máster en Acústica y Tecnología de Audio en la Universidad Aalto. Allí empecé a trabajar como asistente de investigación en acústica en el Aalto Acoustics Lab, en el grupo de investigación de Ville Pulkki.',
    ],
    photos: {
      live: { caption: 'Tocando en directo, 2015', alt: 'Sergio tocando el bajo eléctrico en un escenario con una banda' },
      laOnda: { caption: 'Un evento de La Onda', alt: 'Público de noche frente a un pequeño escenario iluminado bajo un toldo' },
      lab: { caption: 'En el Aalto Acoustics Lab', alt: 'Sergio de pie en una cámara anecoica junto a una columna de altavoces' },
      keyboard: { alt: 'Un teclado en la oscuridad, iluminado en rojo' },
    },
    studies: {
      title: 'Formación académica',
      items: [
        { years: '2025 – Hoy', what: 'Máster en Acústica y Tecnología de Audio', where: 'Universidad Aalto (Espoo, Finlandia)' },
        { years: '2022 – 2023', what: 'Mezcla digital y producción musical', where: 'ProAudio School (Sevilla, España)' },
        { years: '2018 – 2021', what: 'Grado en Ingeniería Informática', where: 'Universidad de Valladolid (Valladolid, España)' },
      ],
    },
    work: {
      title: 'Experiencia laboral',
      items: [
        { years: '2026 – Hoy', what: 'Asistente de investigación en acústica', where: 'Aalto Acoustics Lab (Espoo, Finlandia)' },
        { years: '2021 – 2026', what: 'Técnico de sonido en directo', where: 'Autónomo' },
        { years: '2021 – 2025', what: 'Organizador de eventos', where: 'La Onda (España), autónomo' },
        { years: '2023 – 2024', what: 'Auxiliar de escenario', where: 'EPOS (Suiza), Nomadworks (Suiza)' },
        { years: '2020', what: 'Asistente de investigación en informática', where: 'Universidad de Valladolid (Valladolid, España)' },
        { years: '2018 – 2023', what: 'Profesor de música', where: 'Autónomo' },
        { years: '2017 – 2024', what: 'Músico profesional', where: 'Orquesta Ralea (España), autónomo' },
      ],
    },
  },
  contact: {
    title: 'Contacto',
    lead: 'Escríbeme con toda libertad: si tienes un proyecto en mente, necesitas un técnico de sonido, quieres colaborar, o simplemente quieres conectar o preguntarme lo que sea.',
    email: 'Correo',
  },
};

const portfolio = { en, es };

/** The portfolio's texts in a language. */
export const portfolioTextsOf = (lang: Lang) => portfolio[lang];
