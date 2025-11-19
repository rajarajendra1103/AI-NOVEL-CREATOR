
export type View = 'overview' | 'outline' | 'characters' | 'relationships' | 'settings' | 'timeline' | 'worldbuilding';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Character {
  name: string;
  description: string;
  role: string;
}

export interface Relationship {
  character1: string;
  character2: string;
  relationship: string;
}

export interface PlotPoint {
  chapter: number;
  act: number;
  title: string;
  summary: string;
  isTurningPoint: boolean;
  content?: string;
  wordCount?: number;
  isGeneratingContent?: boolean;
  pov?: string;
  pacing?: 'Slow' | 'Medium' | 'Fast';
  status?: 'Draft' | 'First Edit' | 'Final Polish' | 'Complete';
  seedIdea?: string;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  eventType: 'flashback' | 'normal' | 'flashforward';
  chapterNumber: number;
  charactersInvolved: string[];
  plotThreads: string[];
  orderPosition: number;
  category: 'Plot Point' | 'Character Moment' | 'Conflict' | 'Resolution' | 'Introduction';
  date?: string;
}

// --- WORLD BUIDLING ENTITIES ---

// 1. Geography & Environment
export interface Continent { id: string; name: string; description: string; climate_zones?: string[]; kingdoms_list?: string[]; }
export interface Region { id: string; name: string; geography_type: string; resources?: string[]; notable_locations?: string[]; }
export interface Landmark { id: string; name: string; type: string; legend?: string; }
export interface Resource { id: string; name: string; type: string; rarity: string; uses?: string; }
export interface ClimateZone { id: string; name: string; description: string; seasons?: string; }

// 2. Political & Social
export interface Dynasty { id: string; name: string; founding_year?: string; emblem?: string; }
export interface Faction { id: string; name: string; goals: string; influence?: string; rival_factions?: string[]; }
export interface GovernmentSystem { id: string; name: string; type: string; leader_title?: string; }
export interface Alliance { id: string; name: string; members: string[]; purpose: string; }
export interface Religion { id: string; name: string; deities?: string[]; rituals?: string; }
export interface Guild { id: string; name: string; specialty: string; influence_area?: string; }
export interface Order { id: string; name: string; belief_focus: string; symbol?: string; }

// 3. Cultural & Civilizational
export interface Language { id: string; name: string; alphabet_type?: string; origin?: string; }
export interface Tradition { id: string; name: string; significance: string; festival_date?: string; }
export interface Myth { id: string; name: string; summary: string; cultural_origin?: string; }
export interface ArtForm { id: string; name: string; style: string; cultural_significance?: string; }
export interface Cuisine { id: string; name: string; ingredients: string[]; region?: string; }
export interface DressStyle { id: string; name: string; materials: string[]; symbolism?: string; }

// 4. Magical / Technological
export interface Spell { id: string; name: string; element?: string; mana_cost?: string; }
export interface Artifact { id: string; name: string; power: string; origin?: string; }
export interface Creature { id: string; name: string; type: string; habitat?: string; abilities?: string[]; }
export interface ManaSource { id: string; name: string; location?: string; intensity?: string; }
export interface Curse { id: string; name: string; effect_type: string; duration?: string; }
export interface Technology { id: string; name: string; inventor?: string; function: string; }

// 5. Economic & Daily Life
export interface Market { id: string; name: string; main_goods: string[]; }
export interface Occupation { id: string; name: string; role_in_society: string; }
export interface Currency { id: string; name: string; material?: string; conversion_rate?: string; }
export interface Building { id: string; name: string; type: string; location?: string; purpose: string; }
export interface Festival { id: string; name: string; origin?: string; frequency?: string; }
export interface CalendarSystem { id: string; name: string; year_length?: string; seasons?: string[]; }

// 6. Conflict & History
export interface War { id: string; name: string; cause: string; outcome?: string; }
export interface Battle { id: string; name: string; date?: string; location?: string; }
export interface HistoricEra { id: string; name: string; start_year?: string; end_year?: string; signature_events: string[]; }
export interface Prophecy { id:string; name: string; prophecy_text: string; status?: string; }
export interface Hero { id: string; name: string; story: string; role: string; }

// 7. Story Integration
export interface LocationEvent { id: string; name: string; type: string; related_chapter: number; }
export interface CulturalRelation { id: string; culture_a: string; culture_b: string; relation_type: string; }
export interface MagicInteraction { id: string; system_a: string; system_b: string; result: string; }
export interface CharacterOrigin { id: string; character_id: string; birthplace?: string; heritage?: string; }

// 8. Meta Entities
export interface AIWorldSeed { id: string; setting_notes: string; configuration: object; }
export interface LoreIndex { id: string; entity_id: string; entity_type: string; name: string; }
export interface UserTag { id: string; name: string; entity_ids: string[]; }

// Custom Worldbuilding Entity
export interface CustomWorldbuildingEntity {
  id: string;
  category: string;
  entityType: string;
  name: string;
  description: string;
}

export interface Novel {
  id: string;
  title: string;
  premise: string;
  genre?: string[];
  style?: string;
  tone?: string[];
  pov?: 'First Person' | 'Second Person' | 'Third Person';
  language?: string;
  creativity?: 'Grounded' | 'Balanced' | 'Imaginative';
  outline: PlotPoint[];
  characters: Character[];
  relationships: Relationship[];
  timelineEvents: TimelineEvent[];

  // Expanded Worldbuilding Entities
  continents: Continent[];
  regions: Region[];
  landmarks: Landmark[];
  resources: Resource[];
  climateZones: ClimateZone[];
  dynasties: Dynasty[];
  factions: Faction[];
  governmentSystems: GovernmentSystem[];
  alliances: Alliance[];
  religions: Religion[];
  guilds: Guild[];
  orders: Order[];
  languages: Language[];
  traditions: Tradition[];
  myths: Myth[];
  artForms: ArtForm[];
  cuisines: Cuisine[];
  dressStyles: DressStyle[];
  spells: Spell[];
  artifacts: Artifact[];
  creatures: Creature[];
  manaSources: ManaSource[];
  curses: Curse[];
  technologies: Technology[];
  markets: Market[];
  occupations: Occupation[];
  currencies: Currency[];
  buildings: Building[];
  festivals: Festival[];
  calendarSystems: CalendarSystem[];
  wars: War[];
  battles: Battle[];
  historicEras: HistoricEra[];
  prophecies: Prophecy[];
  heroes: Hero[];
  locationEvents: LocationEvent[];
  culturalRelations: CulturalRelation[];
  magicInteractions: MagicInteraction[];
  characterOrigins: CharacterOrigin[];
  aiWorldSeeds: AIWorldSeed[];
  loreIndices: LoreIndex[];
  userTags: UserTag[];
  customWorldbuildingEntities: CustomWorldbuildingEntity[];
}
