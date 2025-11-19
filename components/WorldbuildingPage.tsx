
import React, { useState, useMemo } from 'react';
import { Novel, CustomWorldbuildingEntity } from '../types';
import { GlobeAltIcon, SparklesIcon, MountainIcon, FlagIcon, UsersIcon, BeakerIcon, BuildingStorefrontIcon, SwordsIcon, LinkIcon, TagIcon, PlusIcon } from './icons';
import GenerateWorldModal from './GenerateWorldModal';
import WorldbuildingCard from './WorldbuildingCard';
import EditWorldbuildingEntityModal from './EditWorldbuildingEntityModal';
import CreateWorldbuildingEntityModal from './CreateWorldbuildingEntityModal';

interface WorldbuildingPageProps {
    novel: Novel;
    onUpdateNovel: (updatedNovel: Novel) => void;
}

type CategoryName = 
    | 'Geography & Environment'
    | 'Political & Social'
    | 'Cultural & Civilizational'
    | 'Magical / Technological'
    | 'Economic & Daily Life'
    | 'Conflict & History'
    | 'Story Integration'
    | 'Meta Entities';

export type Category = { name: string; icon: React.ReactNode; subcategories: (keyof Novel | string)[] };
    
export const standardCategories: Category[] = [
    { name: 'Geography & Environment', icon: <MountainIcon className="w-5 h-5" />, subcategories: ['continents', 'regions', 'landmarks', 'resources', 'climateZones'] },
    { name: 'Political & Social', icon: <FlagIcon className="w-5 h-5" />, subcategories: ['dynasties', 'factions', 'governmentSystems', 'alliances', 'religions', 'guilds', 'orders'] },
    { name: 'Cultural & Civilizational', icon: <UsersIcon className="w-5 h-5" />, subcategories: ['languages', 'traditions', 'myths', 'artForms', 'cuisines', 'dressStyles'] },
    { name: 'Magical / Technological', icon: <BeakerIcon className="w-5 h-5" />, subcategories: ['spells', 'artifacts', 'creatures', 'manaSources', 'curses', 'technologies'] },
    { name: 'Economic & Daily Life', icon: <BuildingStorefrontIcon className="w-5 h-5" />, subcategories: ['markets', 'occupations', 'currencies', 'buildings', 'festivals', 'calendarSystems'] },
    { name: 'Conflict & History', icon: <SwordsIcon className="w-5 h-5" />, subcategories: ['wars', 'battles', 'historicEras', 'prophecies', 'heroes'] },
    { name: 'Story Integration', icon: <LinkIcon className="w-5 h-5" />, subcategories: ['locationEvents', 'culturalRelations', 'magicInteractions', 'characterOrigins'] },
    { name: 'Meta Entities', icon: <TagIcon className="w-5 h-5" />, subcategories: ['aiWorldSeeds', 'loreIndices', 'userTags'] },
];

const WorldbuildingPage: React.FC<WorldbuildingPageProps> = ({ novel, onUpdateNovel }) => {
    const [activeCategory, setActiveCategory] = useState<string>('Geography & Environment');
    const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEntity, setEditingEntity] = useState<{ entity: any; type: string; isStandard: boolean } | null>(null);

    const dynamicCategories = useMemo(() => {
        const customCategoriesMap = new Map<string, Set<string>>();
        (novel.customWorldbuildingEntities || []).forEach(entity => {
            if (!customCategoriesMap.has(entity.category)) {
                customCategoriesMap.set(entity.category, new Set());
            }
            customCategoriesMap.get(entity.category)!.add(entity.entityType);
        });

        const newCategories: Category[] = standardCategories.map(c => ({
            ...c,
            subcategories: [...c.subcategories],
        }));

        customCategoriesMap.forEach((entityTypes, categoryName) => {
            let category = newCategories.find(c => c.name === categoryName);
            if (!category) {
                category = { name: categoryName, icon: <TagIcon className="w-5 h-5" />, subcategories: [] };
                newCategories.push(category);
            }
            
            entityTypes.forEach(entityTypeName => {
                if (!category.subcategories.includes(entityTypeName)) {
                     category.subcategories.push(entityTypeName);
                }
            });
        });
        return newCategories;
    }, [novel.customWorldbuildingEntities]);

    const handleDelete = (entityType: string, id: string, isStandard: boolean) => {
        if (!window.confirm("Are you sure you want to delete this element?")) return;

        if (isStandard) {
            const updatedEntities = (novel[entityType as keyof Novel] as any[]).filter(item => item.id !== id);
            onUpdateNovel({ ...novel, [entityType]: updatedEntities });
        } else {
            const updatedEntities = (novel.customWorldbuildingEntities || []).filter(item => item.id !== id);
            onUpdateNovel({ ...novel, customWorldbuildingEntities: updatedEntities });
        }
    };

    const handleEdit = (entity: any, type: string, isStandard: boolean) => {
        setEditingEntity({ entity, type, isStandard });
        setIsEditModalOpen(true);
    };

    const handleSaveEntity = (updatedEntity: any) => {
        if (!editingEntity) return;
        const { type, isStandard } = editingEntity;

        if (isStandard) {
            const updatedEntities = (novel[type as keyof Novel] as any[]).map(item =>
                item.id === updatedEntity.id ? updatedEntity : item
            );
            onUpdateNovel({ ...novel, [type]: updatedEntities });
        } else {
            const updatedEntities = (novel.customWorldbuildingEntities || []).map(item =>
                item.id === updatedEntity.id ? updatedEntity : item
            );
            onUpdateNovel({ ...novel, customWorldbuildingEntities: updatedEntities });
        }
        setIsEditModalOpen(false);
        setEditingEntity(null);
    };
    
    const handleCreateEntity = (data: { category: string; entityType: string; isCustom: boolean; entityData: any; entityTypeKey?: keyof Novel; }) => {
        if (data.isCustom) {
            const newEntity: CustomWorldbuildingEntity = {
                id: `${data.entityType}-${Date.now()}-${Math.random()}`,
                category: data.category,
                entityType: data.entityType,
                name: data.entityData.name,
                description: data.entityData.description,
            };
            const currentEntities = novel.customWorldbuildingEntities || [];
            onUpdateNovel({ ...novel, customWorldbuildingEntities: [...currentEntities, newEntity] });
        } else if (data.entityTypeKey) {
            const newEntity = {
                ...data.entityData,
                id: `${data.entityTypeKey}-${Date.now()}-${Math.random()}`
            };
            const currentEntities = (novel[data.entityTypeKey] as any[]) || [];
            onUpdateNovel({ ...novel, [data.entityTypeKey]: [...currentEntities, newEntity] });
        }
        setIsCreateModalOpen(false);
    };

    const handleWorldGenerated = (worldData: Partial<Novel>) => {
        const updatedNovel = { ...novel };
        
        for (const key in worldData) {
            const entityKey = key as keyof Novel;
            if (Array.isArray(updatedNovel[entityKey])) {
                const newItems = (worldData[entityKey] as any[]).map(item => ({
                    ...item,
                    id: `${entityKey}-${Date.now()}-${Math.random()}`
                }));
                (updatedNovel[entityKey] as any[]) = [...(updatedNovel[entityKey] as any[]), ...newItems];
            }
        }
        onUpdateNovel(updatedNovel);
    };

    const activeCategoryInfo = dynamicCategories.find(c => c.name === activeCategory);
    
    return (
        <div>
            <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-3xl font-bold font-serif text-text-primary">Worldbuilding Encyclopedia</h2>
                <div className="flex items-center gap-2">
                     <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center bg-white border border-slate-300 text-text-primary font-bold py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Create New Entity
                    </button>
                    <button
                        onClick={() => setIsGeneratorModalOpen(true)}
                        className="flex items-center bg-accent hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
                    >
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Generate World with AI
                    </button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="md:w-1/4 lg:w-1/5 flex-shrink-0">
                    <nav className="flex flex-col space-y-1">
                        {dynamicCategories.map(cat => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`flex items-center space-x-3 p-2 rounded-md text-sm font-medium transition-colors w-full text-left ${activeCategory === cat.name ? 'bg-purple-100 text-accent' : 'text-text-secondary hover:bg-slate-100'}`}
                            >
                                {cat.icon}
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-grow">
                    {activeCategoryInfo ? (
                        <div>
                             {activeCategoryInfo.subcategories.map(subcategory => {
                                const isStandard = standardCategories.some(sc => sc.subcategories.includes(subcategory as keyof Novel));
                                let items: any[];
                                let title: string;

                                if (isStandard) {
                                    items = novel[subcategory as keyof Novel] as any[] || [];
                                    title = subcategory.replace(/([A-Z])/g, ' $1').trim();
                                } else {
                                    items = (novel.customWorldbuildingEntities || []).filter(e => e.entityType === subcategory && e.category === activeCategoryInfo.name);
                                    title = subcategory;
                                }

                                if (!items || items.length === 0) return null;

                                return (
                                    <div key={subcategory} className="mb-8">
                                        <div className="border-b border-slate-200 pb-2 mb-4">
                                            <h3 className="text-xl font-bold font-serif capitalize text-text-primary">
                                                {title}
                                            </h3>
                                        </div>
                                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                                            {items.map(item => (
                                                <WorldbuildingCard
                                                    key={item.id}
                                                    item={item}
                                                    onEdit={() => handleEdit(item, subcategory, isStandard)}
                                                    onDelete={() => handleDelete(subcategory, item.id, isStandard)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                             })}
                             {activeCategoryInfo.subcategories.every(sub => {
                                const isStandard = standardCategories.some(sc => sc.subcategories.includes(sub as keyof Novel));
                                if (isStandard) return !(novel[sub as keyof Novel] as any[])?.length;
                                return !(novel.customWorldbuildingEntities || []).some(e => e.entityType === sub && e.category === activeCategoryInfo.name);
                             }) && (
                                <div className="text-center py-20 flex flex-col items-center bg-secondary rounded-lg">
                                    <GlobeAltIcon className="w-24 h-24 text-slate-400 mb-4" />
                                    <h2 className="text-2xl font-semibold text-text-secondary mb-2">This part of your world is undiscovered.</h2>
                                    <p className="text-text-secondary mb-6">Use the "Create New Entity" button to start building.</p>
                                </div>
                             )}
                        </div>
                    ) : (
                         <div className="text-center py-20 flex flex-col items-center bg-secondary rounded-lg">
                            <GlobeAltIcon className="w-24 h-24 text-slate-400 mb-4" />
                            <h2 className="text-2xl font-semibold text-text-secondary mb-2">Your world awaits.</h2>
                            <p className="text-text-secondary mb-6">Select a category to begin, or create something entirely new.</p>
                        </div>
                    )}
                </main>
            </div>

            {isGeneratorModalOpen && (
                <GenerateWorldModal
                    isOpen={isGeneratorModalOpen}
                    onClose={() => setIsGeneratorModalOpen(false)}
                    onGenerate={handleWorldGenerated}
                    novel={novel}
                />
            )}
            {isCreateModalOpen && (
                <CreateWorldbuildingEntityModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreateEntity}
                    novel={novel}
                    dynamicCategories={dynamicCategories}
                />
            )}
            {isEditModalOpen && editingEntity && (
                <EditWorldbuildingEntityModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveEntity}
                    entity={editingEntity.entity}
                    entityType={editingEntity.type}
                    novel={novel}
                />
            )}
        </div>
    );
};

export default WorldbuildingPage;
