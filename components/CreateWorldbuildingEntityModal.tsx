
import React, { useState, useEffect } from 'react';
import { Novel } from '../types';
import { Category, standardCategories } from './WorldbuildingPage';

interface CreateWorldbuildingEntityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: { category: string; entityType: string; isCustom: boolean; entityData: any; entityTypeKey?: keyof Novel; }) => void;
    novel: Novel;
    dynamicCategories: Category[];
}

const getNewEntityTemplate = (entityType: keyof Novel) => {
    const name = `New ${entityType.replace(/([A-Z])/g, ' $1').slice(0, -1).trim()}`;
    
    const entityStructures: { [key: string]: any } = {
        continents: { name, description: '', climate_zones: [], kingdoms_list: [] },
        regions: { name, geography_type: '', resources: [], notable_locations: [] },
        landmarks: { name, type: '', legend: '' },
        resources: { name, type: '', rarity: '' },
        climateZones: { name, description: '', seasons: '' },
        dynasties: { name, founding_year: '', emblem: '' },
        factions: { name, goals: '', influence: '', rival_factions: [] },
        governmentSystems: { name, type: '', leader_title: '' },
        alliances: { name, members: [], purpose: '' },
        religions: { name, deities: [], rituals: '' },
        guilds: { name, specialty: '', influence_area: '' },
        orders: { name, belief_focus: '', symbol: '' },
        languages: { name, alphabet_type: '', origin: '' },
        traditions: { name, significance: '', festival_date: '' },
        myths: { name, summary: '', cultural_origin: '' },
        artForms: { name, style: '', cultural_significance: '' },
        cuisines: { name, ingredients: [], region: '' },
        dressStyles: { name, materials: [], symbolism: '' },
        spells: { name, element: '', mana_cost: '' },
        artifacts: { name, power: '', origin: '' },
        creatures: { name, type: '', habitat: '', abilities: [] },
        manaSources: { name, location: '', intensity: '' },
        curses: { name, effect_type: '', duration: '' },
        technologies: { name, inventor: '', function: '' },
        markets: { name, main_goods: [] },
        occupations: { name, role_in_society: '' },
        currencies: { name, material: '', conversion_rate: '' },
        buildings: { name, type: '', location: '', purpose: '' },
        festivals: { name, origin: '', frequency: '' },
        calendarSystems: { name, year_length: '', seasons: [] },
        wars: { name, cause: '', outcome: '' },
        battles: { name, date: '', location: '' },
        historicEras: { name, start_year: '', end_year: '', signature_events: [] },
        prophecies: { name, prophecy_text: '', status: '' },
        heroes: { name, story: '', role: '' },
        default: { name, description: '' },
    };

    return entityStructures[entityType] || entityStructures.default;
};

const commonInputClass = "w-full p-2 bg-primary border border-slate-300 rounded-lg text-text-primary focus:ring-2 focus:ring-accent transition-colors";
const commonTextareaClass = `${commonInputClass} h-24`;
const commonLabelClass = "text-sm font-medium text-text-secondary capitalize";
const CREATE_NEW_VALUE = "CREATE_NEW";

const CreateWorldbuildingEntityModal: React.FC<CreateWorldbuildingEntityModalProps> = ({ isOpen, onClose, onCreate, novel, dynamicCategories }) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [selectedType, setSelectedType] = useState('');
    const [isCreatingNewEntityType, setIsCreatingNewEntityType] = useState(false);
    const [newEntityTypeName, setNewEntityTypeName] = useState('');

    const [formData, setFormData] = useState<any | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSelectedCategory('');
            setIsCreatingNewCategory(false);
            setNewCategoryName('');
            setSelectedType('');
            setIsCreatingNewEntityType(false);
            setNewEntityTypeName('');
            setFormData(null);
            setError('');
        }
    }, [isOpen]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value;
        if (newCategory === CREATE_NEW_VALUE) {
            setIsCreatingNewCategory(true);
            setSelectedCategory(CREATE_NEW_VALUE);
        } else {
            setIsCreatingNewCategory(false);
            setSelectedCategory(newCategory);
        }
        setSelectedType('');
        setIsCreatingNewEntityType(false);
        setNewEntityTypeName('');
        setFormData(null);
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value;
        if (newType === CREATE_NEW_VALUE) {
            setIsCreatingNewEntityType(true);
            setSelectedType(CREATE_NEW_VALUE);
            setFormData({ name: `New ${newEntityTypeName || 'Entity'}`, description: '' });
        } else {
            setIsCreatingNewEntityType(false);
            setSelectedType(newType);
            if (newType) {
                const isStandard = standardCategories.some(sc => sc.subcategories.includes(newType as keyof Novel));
                if (isStandard) {
                    setFormData(getNewEntityTemplate(newType as keyof Novel));
                } else {
                    setFormData({ name: `New ${newType}`, description: '' });
                }
            } else {
                setFormData(null);
            }
        }
    };
    
    const handleFormChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        const category = isCreatingNewCategory ? newCategoryName.trim() : selectedCategory;
        const entityType = isCreatingNewEntityType ? newEntityTypeName.trim() : selectedType;
        
        if (!category) { setError('Please select or create a category.'); return; }
        if (!entityType) { setError('Please select or create an entity type.'); return; }
        if (!formData || !formData.name.trim()) { setError('Please enter a name for the entity.'); return; }

        const isStandard = standardCategories.some(sc => sc.subcategories.includes(entityType as keyof Novel));
        
        onCreate({
            category,
            entityType,
            isCustom: !isStandard,
            entityData: formData,
            entityTypeKey: isStandard ? (entityType as keyof Novel) : undefined,
        });
    };
    
    const currentSubcategories = dynamicCategories.find(c => c.name === selectedCategory)?.subcategories || [];

    const renderFields = () => {
        if (!formData) return null;
        return Object.keys(formData).map(key => {
            const value = formData[key];
            const label = key.replace(/([A-Z])/g, ' $1').trim();

            if (Array.isArray(value)) {
                 return (
                    <div key={key}>
                        <label className={commonLabelClass}>{label}</label>
                        <textarea value={value.join(', ')} onChange={e => handleFormChange(key, e.target.value.split(',').map(s => s.trim()))} className={commonTextareaClass} />
                        <p className="text-xs text-slate-500 mt-1">Enter values separated by commas.</p>
                    </div>
                );
            }

            if (typeof value === 'string' && (value.length > 60 || key.includes('description') || key.includes('summary') || key.includes('goals') || key.includes('text'))) {
                 return (
                    <div key={key}>
                        <label className={commonLabelClass}>{label}</label>
                        <textarea value={value} onChange={e => handleFormChange(key, e.target.value)} className={commonTextareaClass} />
                    </div>
                );
            }
            
            return (
                 <div key={key}>
                    <label className={commonLabelClass}>{label}</label>
                    <input type="text" value={value} onChange={e => handleFormChange(key, e.target.value)} className={commonInputClass} />
                </div>
            );
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">Create New Worldbuilding Entity</h2>
                <div className="space-y-4">
                    <div>
                        <label className={commonLabelClass}>Category</label>
                        <select value={selectedCategory} onChange={handleCategoryChange} className={commonInputClass}>
                            <option value="">-- Select Category --</option>
                            {dynamicCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            <option value={CREATE_NEW_VALUE}>+ Create new category...</option>
                        </select>
                        {isCreatingNewCategory && (
                             <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="New category name" className={`${commonInputClass} mt-2`} />
                        )}
                    </div>
                    <div>
                        <label className={commonLabelClass}>Entity Type</label>
                        <select value={selectedType} onChange={handleTypeChange} className={commonInputClass} disabled={!selectedCategory}>
                            <option value="">-- Select Type --</option>
                            {currentSubcategories.map(type => 
                                <option key={type.toString()} value={type.toString()} className="capitalize">
                                    {type.toString().replace(/([A-Z])/g, ' $1').replace(/s$/, '').trim()}
                                </option>
                            )}
                             <option value={CREATE_NEW_VALUE}>+ Create new entity type...</option>
                        </select>
                         {isCreatingNewEntityType && (
                             <input type="text" value={newEntityTypeName} onChange={e => setNewEntityTypeName(e.target.value)} placeholder="New entity type name" className={`${commonInputClass} mt-2`} />
                        )}
                    </div>
                    {formData && <div className="border-t border-slate-300 pt-4 space-y-4">{renderFields()}</div>}
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-text-primary hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={!formData} className="bg-accent hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
                </div>
            </div>
        </div>
    );
};

export default CreateWorldbuildingEntityModal;
