/**
 * Per-route SEO copy (title + description) in all supported languages.
 * Content follows Enter Gauja Vadlīnijas 2025 keyword guidance:
 * H1 with core keyword + Enter {Category}, 120-160 char description.
 */

import type { Lang } from "@/lib/language";
import type { EnterGaujaKey } from "@/lib/enter-gauja";

export interface RouteSeo {
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  category?: EnterGaujaKey;
}

export const ROUTE_SEO: Record<string, RouteSeo> = {
  home: {
    title: {
      lv: "Wanderlust.lv | Sertificēts gids Gaujas nacionālajā parkā",
      en: "Wanderlust.lv | Certified guide in Gauja National Park, Latvia",
      es: "Wanderlust.lv | Guía certificada en el Parque Nacional Gauja",
    },
    description: {
      lv: "Ekskursijas, pārgājieni un transfēri Siguldā, Cēsīs, Līgatnē un Gaujas nacionālajā parkā ar sertificētu gidu Ilzi Gulbi. Enter Gauja partneris.",
      en: "Guided tours, hikes and private transfers in Sigulda, Cēsis, Līgatne and Gauja National Park with certified guide Ilze Gulbe. Enter Gauja partner.",
      es: "Excursiones, senderismo y traslados privados en Sigulda, Cēsis, Līgatne y el Parque Nacional Gauja con guía certificada Ilze Gulbe. Partner de Enter Gauja.",
    },
  },
  tours: {
    category: "history",
    title: {
      lv: "Enter History: ekskursijas un pilis Gaujas ielejā | Wanderlust.lv",
      en: "Enter History: guided castle tours in the Gauja Valley | Wanderlust.lv",
      es: "Enter History: excursiones y castillos del valle de Gauja | Wanderlust.lv",
    },
    description: {
      lv: "Ekskursijas pa Turaidas, Cēsu un Siguldas pilīm ar sertificētu gidu. Vēsture, leģendas un praktiskā informācija ceļojumam pa Gaujas ieleju.",
      en: "Guided castle tours through Turaida, Cēsis and Sigulda. History, legends and practical trip info across the Gauja Valley with a certified local guide.",
      es: "Excursiones guiadas por los castillos de Turaida, Cēsis y Sigulda. Historia, leyendas e información práctica del valle de Gauja con guía local.",
    },
  },
  hiking: {
    category: "nature",
    title: {
      lv: "Enter Nature: pārgājieni un dabas takas Gaujas NP | Wanderlust.lv",
      en: "Enter Nature: hiking and nature trails in Gauja National Park",
      es: "Enter Nature: senderismo y rutas naturales en el Parque Gauja",
    },
    description: {
      lv: "Sertificēta gida pārgājieni pa Gaujas nacionālā parka takām — klintis, alas, skatu punkti. Ģimenēm draudzīgi un pieredzējušiem maršruti.",
      en: "Guided hikes across Gauja National Park trails — cliffs, caves, viewpoints. Family-friendly and challenging routes with a certified nature guide.",
      es: "Senderismo guiado por las rutas del Parque Nacional Gauja — acantilados, cuevas, miradores. Rutas familiares y exigentes con guía certificada.",
    },
  },
  transfers: {
    title: {
      lv: "Privātie transfēri Rīga–Sigulda–Cēsis | Wanderlust.lv",
      en: "Private transfers Riga–Sigulda–Cēsis | Wanderlust.lv",
      es: "Traslados privados Riga–Sigulda–Cēsis | Wanderlust.lv",
    },
    description: {
      lv: "Privātie transfēri no Rīgas lidostas un centra uz Siguldu, Cēsīm un Gaujas nacionālo parku. Komfortabli auto, angliski un latviski runājošs šoferis.",
      en: "Private airport and city transfers to Sigulda, Cēsis and Gauja National Park. Comfortable vehicles, English and Latvian speaking driver.",
      es: "Traslados privados desde Riga hacia Sigulda, Cēsis y el Parque Nacional Gauja. Vehículos cómodos, chófer que habla inglés y español.",
    },
  },
  about: {
    title: {
      lv: "Par Ilzi Gulbi — sertificēta Gaujas NP gide | Wanderlust.lv",
      en: "About Ilze Gulbe — certified Gauja National Park guide",
      es: "Sobre Ilze Gulbe — guía certificada del Parque Nacional Gauja",
    },
    description: {
      lv: "Ilze Gulbe — sertificēta Gaujas nacionālā parka gide ar vairāku gadu pieredzi kultūras, vēstures un dabas ekskursijās Vidzemē.",
      en: "Ilze Gulbe — certified Gauja National Park guide with years of experience in cultural, historical and nature tours across Vidzeme.",
      es: "Ilze Gulbe — guía certificada del Parque Nacional Gauja con años de experiencia en excursiones culturales, históricas y naturales por Vidzeme.",
    },
  },
  contact: {
    title: {
      lv: "Kontakti — rezervē ekskursiju vai transfēru | Wanderlust.lv",
      en: "Contact — book a tour, hike or transfer | Wanderlust.lv",
      es: "Contacto — reserva una excursión o traslado | Wanderlust.lv",
    },
    description: {
      lv: "Sazinies ar Wanderlust.lv, lai rezervētu ekskursiju, pārgājienu vai transfēru Gaujas nacionālajā parkā. E-pasts, telefons, sociālie tīkli.",
      en: "Contact Wanderlust.lv to book a guided tour, hike or transfer in Gauja National Park. Email, phone and social channels.",
      es: "Contacta con Wanderlust.lv para reservar una excursión, senderismo o traslado en el Parque Nacional Gauja. Email, teléfono y redes sociales.",
    },
  },
  faq: {
    title: {
      lv: "Biežāk uzdotie jautājumi | Wanderlust.lv",
      en: "Frequently asked questions | Wanderlust.lv",
      es: "Preguntas frecuentes | Wanderlust.lv",
    },
    description: {
      lv: "Atbildes uz biežāk uzdotajiem jautājumiem par ekskursijām, pārgājieniem un transfēriem Gaujas nacionālajā parkā.",
      en: "Answers to frequently asked questions about guided tours, hikes and transfers in Gauja National Park.",
      es: "Respuestas a preguntas frecuentes sobre excursiones, senderismo y traslados en el Parque Nacional Gauja.",
    },
  },
  book: {
    title: {
      lv: "Rezervē ekskursiju | Wanderlust.lv",
      en: "Book a tour | Wanderlust.lv",
      es: "Reserva una excursión | Wanderlust.lv",
    },
    description: {
      lv: "Rezervē privātu ekskursiju, pārgājienu vai transfēru ar sertificētu gidu Gaujas nacionālajā parkā.",
      en: "Book a private guided tour, hike or transfer in Gauja National Park.",
      es: "Reserva una excursión, senderismo o traslado privado en el Parque Nacional Gauja.",
    },
  },
  privacy: {
    title: {
      lv: "Privātuma politika — Wanderlust.lv",
      en: "Privacy policy — Wanderlust.lv",
      es: "Política de privacidad — Wanderlust.lv",
    },
    description: {
      lv: "Kā Wanderlust.lv vāc, izmanto un aizsargā apmeklētāju personīgos datus.",
      en: "How Wanderlust.lv collects, uses and protects visitor personal data.",
      es: "Cómo Wanderlust.lv recopila, utiliza y protege los datos personales de los visitantes.",
    },
  },
  cookies: {
    title: {
      lv: "Sīkdatņu politika — Wanderlust.lv",
      en: "Cookie policy — Wanderlust.lv",
      es: "Política de cookies — Wanderlust.lv",
    },
    description: {
      lv: "Kā Wanderlust.lv izmanto sīkdatnes un kā pārvaldīt savus iestatījumus.",
      en: "How Wanderlust.lv uses cookies and how to manage your preferences.",
      es: "Cómo Wanderlust.lv usa cookies y cómo gestionar tus preferencias.",
    },
  },
  terms: {
    title: {
      lv: "Lietošanas noteikumi — Wanderlust.lv",
      en: "Terms of service — Wanderlust.lv",
      es: "Términos del servicio — Wanderlust.lv",
    },
    description: {
      lv: "Noteikumi, kas regulē Wanderlust.lv un tā piedāvāto ekskursiju, pārgājienu un transfēru izmantošanu.",
      en: "Terms governing the use of Wanderlust.lv and its guided tours, hikes and transfers.",
      es: "Términos que rigen el uso de Wanderlust.lv y sus excursiones, senderismo y traslados.",
    },
  },
};
