import { CardItem, ActivityMeta } from '../types';

export const ACTIVITIES_LIST: ActivityMeta[] = [
  {
    id: 'pre-simon',
    index: 1,
    title: 'Classroom Simon Says',
    subtitle: 'Consignes de classe impératives',
    unit: 'Pre-Unit',
    unitTag: 'pre-unit',
    icon: '🦊',
    interactionType: 'Vision + Voix',
    description: 'Montre l\'objet demandé à la caméra (crayon, livre, règle) ou répète les ordres de classe à voix haute !',
  },
  {
    id: 'pre-phonics-pop',
    index: 2,
    title: 'Phonics Pop',
    subtitle: 'Discrimination du son voyelle /ɪ/',
    unit: 'Pre-Unit',
    unitTag: 'pre-unit',
    icon: '🫧',
    interactionType: 'Voix Phonics',
    description: 'Fais éclater les bulles contenant le son court /ɪ/ (six, sister, tick, in, live) en les prononçant au micro !',
  },
  {
    id: 'pre-alphabet-dash',
    index: 3,
    title: 'Speed Alphabet Dash',
    subtitle: 'Défi chrono 30s sur table (i, j, l, t, u)',
    unit: 'Pre-Unit',
    unitTag: 'pre-unit',
    icon: '⏱️',
    interactionType: 'Chrono Table',
    description: 'Range les 5 lettres physiques dans l\'ordre alphabétique sur la table avant que la bougie ne fonde !',
  },
  {
    id: 'u1-photo-album',
    index: 4,
    title: 'The Magic Photo Album',
    subtitle: 'Membres de la famille & Arbre généalogique',
    unit: 'Unit 1',
    unitTag: 'unit-1',
    icon: '🌳',
    interactionType: 'Vision Phygitale',
    description: 'Pose la carte du membre de la famille sur la table : la photo s\'anime et énonce sa présentation !',
  },
  {
    id: 'u1-talk-massi',
    index: 5,
    title: 'Talk with Massi',
    subtitle: 'Dialogue interactif de présentation',
    unit: 'Unit 1',
    unitTag: 'unit-1',
    icon: '🎙️',
    interactionType: 'Dialogue Oral',
    description: 'Réponds oralement aux 4 questions de Massi : prénom, âge, lieu de résidence et langues parlées.',
  },
  {
    id: 'u1-family-race',
    index: 6,
    title: 'Family Assembly Race',
    subtitle: 'Défi chrono 45s d\'assemblage',
    unit: 'Unit 1',
    unitTag: 'unit-1',
    icon: '⚡',
    interactionType: 'Course Table',
    description: 'Reconstitue l\'arbre généalogique complet sur la table en moins de 45 secondes chrono !',
  },
  {
    id: 'u2-hide-seek',
    index: 7,
    title: 'Hide & Seek School Things',
    subtitle: 'Prépositions spatiales (in, on, under, next to)',
    unit: 'Unit 2',
    unitTag: 'unit-2',
    icon: '🎒',
    interactionType: 'Vision Spatiale',
    description: 'Positionne les fournitures réelles selon les consignes spatiales relatives (ex: stylo SUR le livre).',
  },
  {
    id: 'u2-timetable',
    index: 8,
    title: 'Timetable Master',
    subtitle: 'Emploi du temps & Jours de la semaine',
    unit: 'Unit 2',
    unitTag: 'unit-2',
    icon: '📅',
    interactionType: 'Lecture Vocale',
    description: 'Lis à voix haute l\'emploi du temps hebdomadaire pour débloquer toutes les matières scolaires !',
  },
  {
    id: 'u2-color-blitz',
    index: 9,
    title: 'Color & School Items Blitz',
    subtitle: 'Défi éclair 5 secondes par fourniture',
    unit: 'Unit 2',
    unitTag: 'unit-2',
    icon: '⚡',
    interactionType: 'Défi Éclair',
    description: 'Enchaîne 5 fournitures couleur + objet en moins de 5 secondes chacune !',
  },
  {
    id: 'term-eval-test',
    index: 10,
    title: 'Term 1 Evaluation Test',
    subtitle: 'Test Sommatif officiel du Premier Terme (/20)',
    unit: 'Test Term 1',
    unitTag: 'term-test',
    icon: '🏆',
    interactionType: 'Test 3 Phases',
    description: 'Épreuve officielle en 3 phases (Compréhension spatiale 6pts, Voix & Phonics 8pts, Tracé script 6pts).',
  },
];

export const ALL_FLASHCARDS: CardItem[] = [
  // Letters Pre-Unit
  { id: 'let-i', name: 'Letter i', label: 'i', category: 'letter', phonicsSound: '/ɪ/', color: '#3B82F6' },
  { id: 'let-j', name: 'Letter j', label: 'j', category: 'letter', phonicsSound: '/dʒ/', color: '#10B981' },
  { id: 'let-l', name: 'Letter l', label: 'l', category: 'letter', phonicsSound: '/l/', color: '#F59E0B' },
  { id: 'let-t', name: 'Letter t', label: 't', category: 'letter', phonicsSound: '/t/', color: '#EF4444' },
  { id: 'let-u', name: 'Letter u', label: 'u', category: 'letter', phonicsSound: '/juː/', color: '#8B5CF6' },

  // Letters Unit 1
  { id: 'let-b', name: 'Letter b', label: 'b', category: 'letter', phonicsSound: '/b/', color: '#06B6D4' },
  { id: 'let-h', name: 'Letter h', label: 'h', category: 'letter', phonicsSound: '/h/', color: '#EC4899' },
  { id: 'let-k', name: 'Letter k', label: 'k', category: 'letter', phonicsSound: '/k/', color: '#F97316' },
  { id: 'let-m', name: 'Letter m', label: 'm', category: 'letter', phonicsSound: '/m/', color: '#84CC16' },

  // Family Members
  { id: 'fam-father', name: 'Father', label: 'Father (Dad)', arabicLabel: 'أب', category: 'family', color: '#2563EB', iconName: '👨' },
  { id: 'fam-mother', name: 'Mother', label: 'Mother (Mum)', arabicLabel: 'أم', category: 'family', color: '#DB2777', iconName: '👩' },
  { id: 'fam-brother', name: 'Brother', label: 'Brother', arabicLabel: 'أخ', category: 'family', color: '#059669', iconName: '👦' },
  { id: 'fam-sister', name: 'Sister', label: 'Sister', arabicLabel: 'أخت', category: 'family', color: '#7C3AED', iconName: '👧' },
  { id: 'fam-grandfather', name: 'Grandfather', label: 'Grandfather', arabicLabel: 'جد', category: 'family', color: '#4B5563', iconName: '👴' },
  { id: 'fam-grandmother', name: 'Grandmother', label: 'Grandmother', arabicLabel: 'جدة', category: 'family', color: '#9333EA', iconName: '👵' },

  // School Supplies
  { id: 'sch-pen', name: 'Pen', label: 'Blue Pen', category: 'school', color: '#2563EB', iconName: '🖊️' },
  { id: 'sch-pencil', name: 'Pencil', label: 'Yellow Pencil', category: 'school', color: '#EAB308', iconName: '✏️' },
  { id: 'sch-book', name: 'Book', label: 'Red Book', category: 'school', color: '#DC2626', iconName: '📖' },
  { id: 'sch-rubber', name: 'Rubber', label: 'Red Rubber', category: 'school', color: '#F43F5E', iconName: '🧼' },
  { id: 'sch-ruler', name: 'Ruler', label: 'Green Ruler', category: 'school', color: '#16A34A', iconName: '📏' },
  { id: 'sch-bag', name: 'School Bag', label: 'School Bag', category: 'school', color: '#7C3AED', iconName: '🎒' },
];

export const PHONICS_POP_WORDS = [
  { word: 'six', hasTargetSound: true, soundType: '/ɪ/', translation: '6 (six)' },
  { word: 'sister', hasTargetSound: true, soundType: '/ɪ/', translation: 'sœur' },
  { word: 'tick', hasTargetSound: true, soundType: '/ɪ/', translation: 'cocher' },
  { word: 'in', hasTargetSound: true, soundType: '/ɪ/', translation: 'dans' },
  { word: 'live', hasTargetSound: true, soundType: '/ɪ/', translation: 'vivre' },
  // Distractors with /ʌ/
  { word: 'bus', hasTargetSound: false, soundType: '/ʌ/', translation: 'bus' },
  { word: 'cup', hasTargetSound: false, soundType: '/ʌ/', translation: 'tasse' },
  { word: 'duck', hasTargetSound: false, soundType: '/ʌ/', translation: 'canard' },
  { word: 'rug', hasTargetSound: false, soundType: '/ʌ/', translation: 'tapis' },
  { word: 'tub', hasTargetSound: false, soundType: '/ʌ/', translation: 'baignoire' },
];

export const SIMON_COMMANDS = [
  {
    id: 'cmd-pencil',
    text: 'Show me your pencil!',
    french: 'Montre-moi ton crayon !',
    expectedType: 'vision',
    targetCardId: 'sch-pencil',
    actionText: 'Show Yellow Pencil',
    voiceEcho: 'pencil'
  },
  {
    id: 'cmd-listen',
    text: 'Listen!',
    french: 'Écoute !',
    expectedType: 'voice',
    targetCardId: null,
    actionText: 'Say "Listen"',
    voiceEcho: 'listen'
  },
  {
    id: 'cmd-book',
    text: 'Show me your book!',
    french: 'Montre-moi ton livre !',
    expectedType: 'vision',
    targetCardId: 'sch-book',
    actionText: 'Show Red Book',
    voiceEcho: 'book'
  },
  {
    id: 'cmd-stand',
    text: 'Stand up!',
    french: 'Lève-toi !',
    expectedType: 'voice',
    targetCardId: null,
    actionText: 'Say "Stand up"',
    voiceEcho: 'stand up'
  },
  {
    id: 'cmd-ruler',
    text: 'Show me your green ruler!',
    french: 'Montre-moi ta règle verte !',
    expectedType: 'vision',
    targetCardId: 'sch-ruler',
    actionText: 'Show Green Ruler',
    voiceEcho: 'ruler'
  }
];

export const TIMETABLE_SLOTS = [
  { day: 'Monday', subject: 'Maths', icon: '📐', prompt: 'On Monday, I have Maths!' },
  { day: 'Tuesday', subject: 'English', icon: '🇬🇧', prompt: 'On Tuesday, I have English!' },
  { day: 'Wednesday', subject: 'Arabic', icon: '📖', prompt: 'On Wednesday, I have Arabic!' },
  { day: 'Thursday', subject: 'French', icon: '🇫🇷', prompt: 'On Thursday, I have French!' },
  { day: 'Friday', subject: 'Science', icon: '🔬', prompt: 'On Friday, I have Science!' },
];
