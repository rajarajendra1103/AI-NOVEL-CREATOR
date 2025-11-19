
import React, { useState, useEffect, useCallback } from 'react';
import { Novel, View } from './types';
import * as geminiService from './services/geminiService';

import Dashboard from './components/Dashboard';
import NovelEditor from './components/NovelEditor';
import CreateNovelModal from './components/CreateNovelModal';
import LoadingSpinner from './components/LoadingSpinner';
import OutlineReviewer from './components/OutlineReviewer';
import AppSidebar from './components/AppSidebar';
import ChatbotPanel from './components/ChatbotPanel';
import { MenuIcon, BotIcon } from './components/icons';

const App: React.FC = () => {
    const [novels, setNovels] = useState<Novel[]>([]);
    const [activeNovelId, setActiveNovelId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [stagedNovel, setStagedNovel] = useState<Omit<Novel, 'timelineEvents' | 'continents' | 'regions' | 'landmarks' | 'resources' | 'climateZones' | 'dynasties' | 'factions' | 'governmentSystems' | 'alliances' | 'religions' | 'guilds' | 'orders' | 'languages' | 'traditions' | 'myths' | 'artForms' | 'cuisines' | 'dressStyles' | 'spells' | 'artifacts' | 'creatures' | 'manaSources' | 'curses' | 'technologies' | 'markets' | 'occupations' | 'currencies' | 'buildings' | 'festivals' | 'calendarSystems' | 'wars' | 'battles' | 'historicEras' | 'prophecies' | 'heroes' | 'locationEvents' | 'culturalRelations' | 'magicInteractions' | 'characterOrigins' | 'aiWorldSeeds' | 'loreIndices' | 'userTags' | 'customWorldbuildingEntities' > | null>(null);
    const [creationArgs, setCreationArgs] = useState<{ premise: string; title: string; genre: string[]; style: string; tone: string[]; language: string; pov: Novel['pov'] } | null>(null);

    const [activeView, setActiveView] = useState<View>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    useEffect(() => {
        try {
            const storedNovels = localStorage.getItem('novels');
            if (storedNovels) {
                setNovels(JSON.parse(storedNovels));
            }
        } catch (error) {
            console.error("Failed to load novels from localStorage", error);
            localStorage.removeItem('novels');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('novels', JSON.stringify(novels));
        }
    }, [novels, isLoading]);

    const handleSelectNovel = (id: string) => {
        setActiveNovelId(id);
        setActiveView('overview');
    };

    const handleGoToDashboard = () => {
        setActiveNovelId(null);
    };
    
    const getNewNovelBase = (): Pick<Novel, 'timelineEvents' | 'continents' | 'regions' | 'landmarks' | 'resources' | 'climateZones' | 'dynasties' | 'factions' | 'governmentSystems' | 'alliances' | 'religions' | 'guilds' | 'orders' | 'languages' | 'traditions' | 'myths' | 'artForms' | 'cuisines' | 'dressStyles' | 'spells' | 'artifacts' | 'creatures' | 'manaSources' | 'curses' | 'technologies' | 'markets' | 'occupations' | 'currencies' | 'buildings' | 'festivals' | 'calendarSystems' | 'wars' | 'battles' | 'historicEras' | 'prophecies' | 'heroes' | 'locationEvents' | 'culturalRelations' | 'magicInteractions' | 'characterOrigins' | 'aiWorldSeeds' | 'loreIndices' | 'userTags' | 'customWorldbuildingEntities'> => ({
        timelineEvents: [],
        continents: [], regions: [], landmarks: [], resources: [], climateZones: [],
        dynasties: [], factions: [], governmentSystems: [], alliances: [], religions: [], guilds: [], orders: [],
        languages: [], traditions: [], myths: [], artForms: [], cuisines: [], dressStyles: [],
        spells: [], artifacts: [], creatures: [], manaSources: [], curses: [], technologies: [],
        markets: [], occupations: [], currencies: [], buildings: [], festivals: [], calendarSystems: [],
        wars: [], battles: [], historicEras: [], prophecies: [], heroes: [],
        locationEvents: [], culturalRelations: [], magicInteractions: [], characterOrigins: [],
        aiWorldSeeds: [], loreIndices: [], userTags: [],
        customWorldbuildingEntities: [],
    });


    const generateAndStageNovel = async (premise: string, title: string, genre: string[], style: string, tone: string[], language: string, pov: Novel['pov']) => {
        setIsGenerating(true);
        try {
            const generatedNovelStructure = await geminiService.generateNovelStructure(premise, genre, style, tone, language, 'Balanced', pov);
            const newNovel = {
                ...generatedNovelStructure,
                title: title || generatedNovelStructure.title,
                id: 'temp-id',
                premise,
                genre,
                style,
                tone,
                language,
                pov,
                creativity: 'Balanced' as Novel['creativity'],
            };
            setStagedNovel(newNovel);
        } catch (err) {
            console.error(err);
            setCreationArgs(null);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleStartCreation = async (premise: string, title: string, genre: string[], style: string, tone: string[], language: string, pov: Novel['pov']) => {
        setIsCreateModalOpen(false);
        setCreationArgs({ premise, title, genre, style, tone, language, pov });
        await generateAndStageNovel(premise, title, genre, style, tone, language, pov);
    };
    
    const handleRegenerate = async () => {
        if (creationArgs) {
            setStagedNovel(null);
            await generateAndStageNovel(creationArgs.premise, creationArgs.title, creationArgs.genre, creationArgs.style, creationArgs.tone, creationArgs.language, creationArgs.pov);
        }
    };

    const handleAccept = () => {
        if (stagedNovel) {
            const finalNovel: Novel = { 
                ...stagedNovel, 
                id: Date.now().toString(), 
                ...getNewNovelBase(),
            };
            setNovels(prev => [...prev, finalNovel]);
            handleSelectNovel(finalNovel.id);
            setStagedNovel(null);
            setCreationArgs(null);
        }
    };

    const handleSkip = () => {
        if (creationArgs) {
            const blankNovel: Novel = {
                id: Date.now().toString(),
                title: creationArgs.title || 'Untitled Novel',
                premise: creationArgs.premise,
                genre: creationArgs.genre,
                style: creationArgs.style,
                tone: creationArgs.tone,
                language: creationArgs.language,
                pov: creationArgs.pov,
                creativity: 'Balanced',
                outline: [],
                characters: [],
                relationships: [],
                ...getNewNovelBase(),
            };
            setNovels(prev => [...prev, blankNovel]);
            handleSelectNovel(blankNovel.id);
            setStagedNovel(null);
            setCreationArgs(null);
        }
    };

    const handleUpdateNovel = (updatedNovel: Novel) => {
        setNovels(prevNovels => 
            prevNovels.map(n => n.id === updatedNovel.id ? updatedNovel : n)
        );
    };

    const handleDeleteNovel = (id: string) => {
        setNovels(prevNovels => prevNovels.filter(n => n.id !== id));
        if (activeNovelId === id) {
            setActiveNovelId(null);
        }
    };

    const renderFullPageLoader = (text: string) => (
        <div className="fixed inset-0 bg-primary bg-opacity-95 flex flex-col items-center justify-center z-[100]">
           <LoadingSpinner />
           <p className="text-xl mt-4 text-text-secondary">{text}</p>
           <p className="text-md mt-2 text-slate-400">This can take up to a minute.</p>
        </div>
    );
    
    if (isLoading) return renderFullPageLoader("Loading your projects...");
    if (isGenerating) return renderFullPageLoader("Building your novel's universe...");

    if (stagedNovel) {
        // We need to provide a default structure for the reviewer, even though it will be empty
        const reviewNovel = {
            ...stagedNovel,
            ...getNewNovelBase()
        };
        return (
            <OutlineReviewer
                novel={reviewNovel}
                onRegenerate={handleRegenerate}
                onAccept={handleAccept}
                onSkip={handleSkip}
            />
        );
    }
    
    const activeNovel = novels.find(n => n.id === activeNovelId);
    
    const handleOpenChatbot = () => {
        if (activeNovelId) {
            setIsChatbotOpen(true);
        } else {
            alert("Please select a novel to start a chat with the AI assistant.");
        }
    };

    const renderContent = () => {
        if (activeNovel) {
            return (
                <NovelEditor
                    key={activeNovel.id}
                    initialNovel={activeNovel}
                    onUpdateNovel={handleUpdateNovel}
                    activeView={activeView}
                />
            );
        }
        return (
            <>
                <Dashboard
                    novels={novels}
                    onSelectNovel={handleSelectNovel}
                    onDeleteNovel={handleDeleteNovel}
                    onAddNewNovel={() => setIsCreateModalOpen(true)}
                />
                <CreateNovelModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleStartCreation}
                />
            </>
        );
    };

    return (
        <div className="h-screen bg-secondary flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-slate-200 bg-primary shadow-sm md:hidden">
                <button onClick={() => setIsMobileMenuOpen(true)}>
                    <MenuIcon className="w-6 h-6 text-text-primary" />
                </button>
                    <h1 className="text-lg font-bold text-accent">AI Novel Creator</h1>
                    <div className="w-6 h-6" />
            </header>
            <div className="flex flex-1 overflow-hidden">
                <AppSidebar
                    activeNovel={activeNovel}
                    activeView={activeView}
                    onSetView={setActiveView}
                    onGoToDashboard={handleGoToDashboard}
                    isMobileMenuOpen={isMobileMenuOpen}
                    onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
                />
                <main className="flex-1 overflow-y-auto relative">
                    {renderContent()}
                </main>
            </div>

            <button
                onClick={handleOpenChatbot}
                className={`fixed bottom-8 right-8 bg-accent text-white p-4 rounded-full shadow-lg hover:bg-purple-500 transition-colors z-40 ${!activeNovelId ? 'bg-slate-400 hover:bg-slate-400 cursor-not-allowed' : ''}`}
                aria-label="Open AI Assistant"
                title={!activeNovelId ? "Select a novel to enable the AI Assistant" : "Open AI Assistant"}
                disabled={!activeNovelId}
            >
                <BotIcon className="w-8 h-8" />
            </button>

            {isChatbotOpen && activeNovel && (
                <ChatbotPanel
                    novel={activeNovel}
                    onClose={() => setIsChatbotOpen(false)}
                />
            )}
        </div>
    );
};

export default App;
