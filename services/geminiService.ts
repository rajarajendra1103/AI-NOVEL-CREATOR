import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Novel, PlotPoint, ChatMessage, Continent, Region, Landmark, Resource, ClimateZone, Dynasty, Faction, GovernmentSystem, Alliance, Religion, Guild, Order, Language, Tradition, Myth, ArtForm, Cuisine, DressStyle, Spell, Artifact, Creature, ManaSource, Curse, Technology, Market, Occupation, Currency, Building, Festival, CalendarSystem, War, Battle, HistoricEra, Prophecy, Hero, LocationEvent, CulturalRelation, MagicInteraction, CharacterOrigin, AIWorldSeed, LoreIndex, UserTag } from '../types';

/**
 * Creates a fresh instance of the AI client.
 * This MUST be called inside each function to ensure it picks up the latest API key.
 */
const getClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const mapCreativityToTemperature = (creativity?: Novel['creativity']): number => {
    switch (creativity) {
        case 'Grounded': return 0.2;
        case 'Balanced': return 0.7;
        case 'Imaginative': return 1.0;
        default: return 0.7;
    }
};

const novelSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A creative and fitting title for the novel based on the premise." },
        outline: {
            type: Type.ARRAY,
            description: "A detailed plot outline with 10-15 chapters, organized into a classic three-act structure.",
            items: {
                type: Type.OBJECT,
                properties: {
                    chapter: { type: Type.INTEGER, description: "The chapter number." },
                    act: { type: Type.INTEGER, description: "The act number (1, 2, or 3)." },
                    title: { type: Type.STRING, description: "The title of the chapter." },
                    summary: { type: Type.STRING, description: "A 2-3 sentence summary of the chapter's key events." },
                    isTurningPoint: { type: Type.BOOLEAN, description: "Set to true if this chapter contains a major turning point in the story (e.g., inciting incident, midpoint, climax)." }
                },
                required: ["chapter", "act", "title", "summary", "isTurningPoint"]
            }
        },
        characters: {
            type: Type.ARRAY,
            description: "A list of 4-6 main and supporting characters.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The character's full name." },
                    description: { type: Type.STRING, description: "A detailed description of the character's appearance, personality, and backstory." },
                    role: { type: Type.STRING, description: "The character's role in the story (e.g., Protagonist, Antagonist, Mentor, Love Interest)." }
                },
                required: ["name", "description", "role"]
            }
        },
        relationships: {
            type: Type.ARRAY,
            description: "A list describing the relationships between key characters.",
            items: {
                type: Type.OBJECT,
                properties: {
                    character1: { type: Type.STRING, description: "The name of the first character." },
                    character2: { type: Type.STRING, description: "The name of the second character." },
                    relationship: { type: Type.STRING, description: "A brief description of their relationship (e.g., 'Allies', 'Rivals', 'Siblings', 'Forbidden Lovers')." }
                },
                required: ["character1", "character2", "relationship"]
            }
        }
    },
    required: ["title", "outline", "characters", "relationships"]
};

const createArrayProperty = (description: string, items: object) => ({ type: Type.ARRAY, description, items });

const worldSchema = {
    type: Type.OBJECT,
    properties: {
        continents: createArrayProperty("Continents", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "description"] }),
        regions: createArrayProperty("Regions", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, geography_type: { type: Type.STRING } }, required: ["name", "geography_type"] }),
        landmarks: createArrayProperty("Landmarks", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING } }, required: ["name", "type"] }),
        resources: createArrayProperty("Resources", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, rarity: { type: Type.STRING } }, required: ["name", "rarity"] }),
        factions: createArrayProperty("Factions", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, goals: { type: Type.STRING } }, required: ["name", "goals"] }),
        religions: createArrayProperty("Religions", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, deities: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name"] }),
        creatures: createArrayProperty("Creatures", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING } }, required: ["name", "type"] }),
        historicEras: createArrayProperty("Historic Eras", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, signature_events: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "signature_events"] }),
    }
};

export const generateNovelStructure = async (
    premise: string, 
    genre?: string[], 
    style?: string, 
    tone?: string[], 
    language?: string,
    creativity?: Novel['creativity'],
    pov?: Novel['pov']
): Promise<Omit<Novel, 'id' | 'premise' | 'genre' | 'style' | 'tone' | 'language' | 'pov' | 'creativity' | 'timelineEvents' | 'continents' | 'regions' | 'landmarks' | 'resources' | 'climateZones' | 'dynasties' | 'factions' | 'governmentSystems' | 'alliances' | 'religions' | 'guilds' | 'orders' | 'languages' | 'traditions' | 'myths' | 'artForms' | 'cuisines' | 'dressStyles' | 'spells' | 'artifacts' | 'creatures' | 'manaSources' | 'curses' | 'technologies' | 'markets' | 'occupations' | 'currencies' | 'buildings' | 'festivals' | 'calendarSystems' | 'wars' | 'battles' | 'historicEras' | 'prophecies' | 'heroes' | 'locationEvents' | 'culturalRelations' | 'magicInteractions' | 'characterOrigins' | 'aiWorldSeeds' | 'loreIndices' | 'userTags' | 'customWorldbuildingEntities'>> => {
    const ai = getClient();
    const prompt = `You are a master storyteller. Your task is to generate the foundational structure for a novel based on the user's idea.
    Premise: "${premise}"
    ${genre && genre.length > 0 ? `Genres: "${genre.join(', ')}"` : ''}
    ${style ? `Writing Style: "${style}"` : ''}
    ${tone && tone.length > 0 ? `Tone: "${tone.join(', ')}"` : ''}
    ${pov ? `Point of View: "${pov}"` : ''}
    ${language ? `Language: Write in ${language}` : ''}
    Generate the output as a valid JSON object that strictly adheres to the provided schema.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: novelSchema,
            temperature: mapCreativityToTemperature(creativity),
        }
    });

    return JSON.parse(response.text.trim());
};

export const generateOutline = async (novel: Novel): Promise<PlotPoint[]> => {
    const ai = getClient();
    const prompt = `Generate a detailed plot outline for a novel titled "${novel.title}". 
    Premise: "${novel.premise}"
    Characters: ${novel.characters.map(c => c.name).join(', ')}
    Generate the output as a valid JSON array of plot points.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: novelSchema.properties.outline,
            temperature: mapCreativityToTemperature(novel.creativity),
        }
    });

    return JSON.parse(response.text.trim());
};


export const generateChapterContent = async (novel: Novel, chapter: PlotPoint): Promise<string> => {
    const ai = getClient();
    const prompt = `Write the full prose for Chapter ${chapter.chapter} of "${novel.title}". 
    Summary: ${chapter.summary}
    Characters: ${novel.characters.map(c => c.name).join(', ')}
    Language: ${novel.language || 'English'}
    Tone: ${novel.tone?.join(', ') || 'N/A'}`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            temperature: mapCreativityToTemperature(novel.creativity),
        }
    });

    return response.text;
};

export const generateWorld = async (
    settings: {
        settingNotes: string;
        tone: string;
        numKingdoms: number;
        numCities: number;
        numCultures: number;
        includeMagic: boolean;
    },
    novel: Novel
): Promise<Partial<Novel>> => {
    const ai = getClient();
    const prompt = `Generate worldbuilding elements for the novel "${novel.title}".
    Notes: "${settings.settingNotes}"
    Tone: ${settings.tone}
    Generate approximately ${settings.numKingdoms} kingdoms and ${settings.numCities} cities.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: worldSchema,
            temperature: mapCreativityToTemperature(novel.creativity),
        }
    });
    
    return JSON.parse(response.text.trim());
};

export const generateChatbotResponse = async (novel: Novel, history: ChatMessage[], message: string, mode: 'creative' | 'research'): Promise<string> => {
    const ai = getClient();
    
    const systemInstruction = `You are an AI assistant for a novelist. Mode: ${mode}. Novel: ${novel.title}. Premise: ${novel.premise}.`;
    
    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        })),
        config: {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            temperature: mapCreativityToTemperature(novel.creativity)
        }
    });
    
    const response = await chat.sendMessage({ message });
    return response.text;
};