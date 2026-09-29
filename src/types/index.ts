export type ModuleTab = 'pre-unit' | 'unit-1' | 'unit-2' | 'term-test';

export type ActivityId =
  | 'hub'
  | 'pre-simon'
  | 'pre-phonics-pop'
  | 'pre-alphabet-dash'
  | 'u1-photo-album'
  | 'u1-talk-massi'
  | 'u1-family-race'
  | 'u2-hide-seek'
  | 'u2-timetable'
  | 'u2-color-blitz'
  | 'term-eval-test';

export interface ActivityMeta {
  id: ActivityId;
  index: number;
  title: string;
  subtitle: string;
  unit: string;
  unitTag: 'pre-unit' | 'unit-1' | 'unit-2' | 'term-test';
  icon: string;
  interactionType: 'Vision + Voix' | 'Voix Phonics' | 'Chrono Table' | 'Vision Phygitale' | 'Dialogue Oral' | 'Course Table' | 'Vision Spatiale' | 'Lecture Vocale' | 'Défi Éclair' | 'Test 3 Phases';
  description: string;
}

export interface CardItem {
  id: string;
  name: string;
  category: 'letter' | 'family' | 'school' | 'color';
  label: string;
  arabicLabel?: string;
  phonicsSound?: string;
  color?: string;
  iconName?: string;
  image?: string;
}

export interface PlacedCard {
  cardId: string;
  x: number; // percentage 0-100 on table
  y: number; // percentage 0-100 on table
  rotation?: number;
  width?: number;
  height?: number;
}

export interface EvaluationScores {
  phase1: number; // Max 6 (Visual & Spatial Comprehension)
  phase2: number; // Max 8 (Spoken Production & Pronunciation)
  phase3: number; // Max 6 (Script Phonics & Tracing)
  total: number;  // Max 20
  voiceFluency: number; // 0-100%
  vowelPronunciation: number; // 0-100%
  visionPrecision: number; // 0-100%
  spatialAccuracy: number; // 0-100%
  notes: string[];
  recommendations: string[];
  completedAt?: string;
}

export type MascotMood = 'neutral' | 'happy' | 'talking' | 'listening' | 'cheering' | 'thinking' | 'surprised';
