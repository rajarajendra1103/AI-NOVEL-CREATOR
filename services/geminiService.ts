
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Novel, PlotPoint, ChatMessage, Continent, Region, Landmark, Resource, ClimateZone, Dynasty, Faction, GovernmentSystem, Alliance, Religion, Guild, Order, Language, Tradition, Myth, ArtForm, Cuisine, DressStyle, Spell, Artifact, Creature, ManaSource, Curse, Technology, Market, Occupation, Currency, Building, Festival, CalendarSystem, War, Battle, HistoricEra, Prophecy, Hero, LocationEvent, CulturalRelation, MagicInteraction, CharacterOrigin, AIWorldSeed, LoreIndex, UserTag } from '../types';

const getClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
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
        // Geography & Environment
        continents: createArrayProperty("Continents: Large landmasses.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "description"] }),
        regions: createArrayProperty("Regions: Smaller divisions.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, geography_type: { type: Type.STRING }, resources: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "geography_type"] }),
        landmarks: createArrayProperty("Landmarks: Natural or mystical locations.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, legend: { type: Type.STRING } }, required: ["name", "type"] }),
        resources: createArrayProperty("Resources: Natural materials.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, rarity: { type: Type.STRING } }, required: ["name", "type", "rarity"] }),
        climateZones: createArrayProperty("Climate Zones: Defines weather.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "description"] }),

        // Political & Social
        dynasties: createArrayProperty("Dynasties/Royal Houses.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, emblem: { type: Type.STRING } }, required: ["name"] }),
        factions: createArrayProperty("Political or secret organizations.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, goals: { type: Type.STRING }, influence: { type: Type.STRING, description: "e.g., Local, Regional, Global" }, rival_factions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of names of rival factions." } }, required: ["name", "goals"] }),
        governmentSystems: createArrayProperty("Forms of governance.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING } }, required: ["name", "type"] }),
        alliances: createArrayProperty("Treaties or unions.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, members: { type: Type.ARRAY, items: { type: Type.STRING } }, purpose: { type: Type.STRING } }, required: ["name", "members", "purpose"] }),
        religions: createArrayProperty("Faith systems.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, deities: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name"] }),
        guilds: createArrayProperty("Trade or craft organizations.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, specialty: { type: Type.STRING } }, required: ["name", "specialty"] }),
        orders: createArrayProperty("Secretive or spiritual organizations.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, belief_focus: { type: Type.STRING } }, required: ["name", "belief_focus"] }),

        // Cultural & Civilizational
        languages: createArrayProperty("Spoken or written systems.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, origin: { type: Type.STRING } }, required: ["name"] }),
        traditions: createArrayProperty("Cultural practices.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, significance: { type: Type.STRING } }, required: ["name", "significance"] }),
        myths: createArrayProperty("Folklore and stories.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ["name", "summary"] }),
        artForms: createArrayProperty("Unique creative expressions.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, style: { type: Type.STRING } }, required: ["name", "style"] }),
        cuisines: createArrayProperty("Common foods and drinks.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "ingredients"] }),
        dressStyles: createArrayProperty("Traditional clothing.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, materials: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "materials"] }),

        // Magical / Technological
        spells: createArrayProperty("Individual magical abilities.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, element: { type: Type.STRING }, mana_cost: { type: Type.STRING } }, required: ["name"] }),
        artifacts: createArrayProperty("Magical or ancient items.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, power: { type: Type.STRING } }, required: ["name", "power"] }),
        creatures: createArrayProperty("Sentient or mythical beings.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, abilities: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "type"] }),
        manaSources: createArrayProperty("Sources of power.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, intensity: { type: Type.STRING } }, required: ["name"] }),
        curses: createArrayProperty("Magical effects.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, effect_type: { type: Type.STRING } }, required: ["name", "effect_type"] }),
        technologies: createArrayProperty("Sci-fi or steampunk innovations.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, function: { type: Type.STRING } }, required: ["name", "function"] }),

        // Economic & Daily Life
        markets: createArrayProperty("Economic links.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, main_goods: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "main_goods"] }),
        occupations: createArrayProperty("Common professions.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, role_in_society: { type: Type.STRING } }, required: ["name", "role_in_society"] }),
        currencies: createArrayProperty("Money or exchange units.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, material: { type: Type.STRING } }, required: ["name"] }),
        buildings: createArrayProperty("Castles, temples, etc.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, purpose: { type: Type.STRING } }, required: ["name", "type", "purpose"] }),
        festivals: createArrayProperty("World-level celebrations.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, frequency: { type: Type.STRING } }, required: ["name"] }),
        calendarSystems: createArrayProperty("Timekeeping formats.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, year_length: { type: Type.STRING } }, required: ["name"] }),
        
        // Conflict & History
        wars: createArrayProperty("Past or ongoing battles.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, cause: { type: Type.STRING } }, required: ["name", "cause"] }),
        battles: createArrayProperty("Specific events in a war.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, location: { type: Type.STRING } }, required: ["name"] }),
        historicEras: createArrayProperty("Major world epochs.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, signature_events: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "signature_events"] }),
        prophecies: createArrayProperty("Predicted events.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, prophecy_text: { type: Type.STRING } }, required: ["name", "prophecy_text"] }),
        heroes: createArrayProperty("Legendary individuals.", { type: Type.OBJECT, properties: { name: { type: Type.STRING }, story: { type: Type.STRING }, role: { type: Type.STRING } }, required: ["name", "story", "role"] }),
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
    const prompt = `You are a master storyteller. Your task is to generate the foundational structure for a novel based on the user's idea. Create a compelling title, a memorable cast of characters, define their intricate relationships, and build a detailed chapter-by-chapter plot. The elements must be cohesive and interconnected.

Structure the outline into a classic three-act structure. Ensure you identify and mark the key turning points in the story.

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

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const generateOutline = async (novel: Novel): Promise<PlotPoint[]> => {
    const ai = getClient();
    const prompt = `You are a world-class novelist and story architect. You are tasked with creating a plot outline for an existing novel concept.

Based on the following novel details, generate a detailed plot outline with 10-15 chapters, organized into a classic three-act structure. Ensure you identify and mark the key turning points in the story.

Title: "${novel.title}"
Premise: "${novel.premise}"
${novel.genre && novel.genre.length > 0 ? `Genres: "${novel.genre.join(', ')}"` : ''}
${novel.style ? `Writing Style: "${novel.style}"` : ''}
${novel.tone && novel.tone.length > 0 ? `Tone: "${novel.tone.join(', ')}"` : ''}
${novel.pov ? `Point of View: "${novel.pov}"` : ''}
${novel.language ? `Language: Write in ${novel.language}` : ''}
Characters: ${novel.characters.map(c => c.name).join(', ') || 'Not specified yet.'}

Generate the output as a valid JSON object that strictly adheres to the provided schema for just the "outline" array.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: novelSchema.properties.outline,
            temperature: mapCreativityToTemperature(novel.creativity),
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};


export const generateChapterContent = async (novel: Novel, chapter: PlotPoint): Promise<string> => {
    const ai = getClient();

    const previousChapter = novel.outline
        .filter(p => p.chapter < chapter.chapter)
        .sort((a, b) => b.chapter - a.chapter)[0];

    const prompt = `You are a masterful novelist, tasked with writing a single chapter for an ongoing story. Your writing must be immersive, descriptive, and emotionally resonant, adhering strictly to the provided style, tone, and language. You must maintain perfect continuity with the provided story context.

---
## NOVEL CONTEXT
**Title:** ${novel.title}
**Premise:** ${novel.premise}
**Genre:** ${novel.genre?.join(', ') || 'Not specified'}
**Writing Style:** ${novel.style || 'Not specified'}
**Tone:** ${novel.tone?.join(', ') || 'Not specified'}
**Point of View:** ${novel.pov || 'Not specified'}
**Language:** Write in ${novel.language || 'English'}

## MAIN CHARACTERS
${novel.characters.map(c => `- **${c.name} (${c.role}):** ${c.description}`).join('\n')}

## OVERALL PLOT OUTLINE
${novel.outline.map(p => `- Ch. ${p.chapter}: ${p.title} - ${p.summary}`).join('\n')}
---
${previousChapter ? `
## PREVIOUS CHAPTER SUMMARY (Chapter ${previousChapter.chapter}: ${previousChapter.title})
${previousChapter.summary}
` : ''}
---
## YOUR TASK: WRITE CHAPTER ${chapter.chapter}
**Chapter Title:** "${chapter.title}"
**Chapter Summary:** ${chapter.summary}

**Instructions:**
1.  Write the full prose for this chapter, expanding on the summary with rich detail.
2.  Show, don't just tell. Use vivid descriptions, internal monologue, and character actions to convey emotions and advance the plot.
3.  Incorporate dialogue, character actions, and sensory details to bring the scene to life.
4.  Ensure the events flow logically from the previous chapter and align with the overall plot outline.
5.  Do NOT write "Chapter ${chapter.chapter}" or the chapter title at the beginning of your response. Begin directly with the chapter's text.
6.  The response should ONLY contain the prose for the chapter.`;

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
    const prompt = `You are a master worldbuilder and storyteller. Based on the following high-level notes and parameters, generate a rich, cohesive, and interconnected fictional world. The elements should be creative, logically consistent, and fit the specified tone.

**High-Level Setting Notes:** "${settings.settingNotes}"
**Tone:** ${settings.tone}
**Novel Premise (for context):** "${novel.premise}"

**Generation Parameters:**
- Generate approximately ${settings.numKingdoms} major kingdom(s) or political entities.
- Generate approximately ${settings.numCities} notable cities, towns, or landmarks.
- Generate approximately ${settings.numCultures} distinct culture(s).
- ${settings.includeMagic ? 'Generate 1-2 magic or technology systems, along with related spells, artifacts, etc.' : 'Do not generate magic or technology systems.'}
- Populate the other categories (Geography, History, Economy, etc.) with a few (2-4) relevant entries each to create a well-rounded world.
- Crucially, the generated entities should be interconnected. For example, a war from a historic era must involve the factions you create; a culture's traditions should be influenced by its geography and religion; a magical artifact should have a clear origin within the world's history.

Generate the output as a valid JSON object that strictly adheres to the provided schema. Do not include entities for Story Integration or Meta categories.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: worldSchema,
            temperature: mapCreativityToTemperature(novel.creativity),
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const generateChatbotResponse = async (novel: Novel, history: ChatMessage[], message: string, mode: 'creative' | 'research'): Promise<string> => {
    const ai = getClient();
    
    const creativePersona = `
        **Persona: Creative Partner**
        Your role is to be an imaginative and encouraging writing assistant.
        - **Brainstorming:** When asked for ideas, provide 2-3 distinct and creative options.
        - **Dialogue/Prose:** Help write dialogue and prose that matches the novel's established tone and style.
        - **Problem Solving:** Help the user overcome writer's block with insightful suggestions.
        - **Continuity:** If a user's request seems to contradict the established plot or character traits, gently point it out and ask for clarification.
    `;
    const researchPersona = `
        **Persona: Meticulous Researcher**
        Your role is to be a factual and accurate research assistant.
        - **Accuracy:** Provide precise information about real-world topics (history, science, culture, etc.).
        - **Applicability:** Frame your answers so they are directly useful for the novel.
        - **Clarity:** If a topic is complex, break it down into simple terms.
        - **Honesty:** If you don't know the answer to something, state that clearly rather than inventing information.
    `;

    const systemInstruction = {
        parts: [{ text: `
            ## Your Role
            You are an AI assistant for a novelist. You will operate in one of two modes. Adhere strictly to your assigned persona.

            ${mode === 'creative' ? creativePersona : researchPersona}
            
            ## General Rules
            1.  **Context is King:** All responses MUST be consistent with the provided Novel Context.
            2.  **Be Concise:** Provide clear and direct answers. Avoid lengthy, unnecessary preambles.
            3.  **Use Markdown:** Format your responses with Markdown for readability (e.g., lists, bold text).
            4.  **Clarify Ambiguity:** If the user's request is vague or contradicts the context, ask clarifying questions before generating a detailed response.
            ---
            ## NOVEL CONTEXT
            **Title:** ${novel.title}
            **Premise:** ${novel.premise}
            **Genre, Style, Tone:** ${novel.genre?.join(', ') || 'N/A'}, ${novel.style || 'N/A'}, ${novel.tone?.join(', ') || 'N/A'}
            **Point of View:** ${novel.pov || 'N/A'}
            **Language:** ${novel.language || 'English'}
            
            ### Characters
            ${novel.characters.map(c => `- **${c.name} (${c.role}):** ${c.description}`).join('\n') || 'No characters defined yet.'}
            
            ### Plot Outline
            ${novel.outline.map(p => `- **Ch ${p.chapter} (Act ${p.act}): ${p.title}** - ${p.summary}`).join('\n') || 'No outline defined yet.'}
            ---
        `}]
    };
    
    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        })),
        config: {
            systemInstruction,
            temperature: mapCreativityToTemperature(novel.creativity)
        }
    });
    
    const response = await chat.sendMessage({ message });

    return response.text;
};
