
import React, { useState, useEffect } from 'react';
import { Novel } from '../types';

interface SettingsPageProps {
    novel: Novel;
    onUpdateNovel: (updatedNovel: Novel) => void;
}

const genres = [
    'Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 'Romance',
    'Horror', 'Historical Fiction', 'Young Adult', 'Literary Fiction'
];
const writingStyles = [
    'Descriptive', 'Concise', 'Poetic', 'Journalistic',
    'Fast-Paced', 'Character-Driven', 'Plot-Driven'
];
const tones = [
    'Humorous', 'Serious', 'Ominous', 'Lighthearted', 'Suspenseful',
    'Melancholy', 'Optimistic', 'Cynical', 'Whimsical'
];
const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Mandarin'];
const creativityLevels: Novel['creativity'][] = ['Grounded', 'Balanced', 'Imaginative'];
const povs: Novel['pov'][] = ['First Person', 'Second Person', 'Third Person'];

const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-secondary p-6 rounded-lg shadow-md border border-slate-200">
        <h3 className="text-xl font-bold font-serif text-text-primary">{title}</h3>
        <p className="text-text-secondary mt-1 mb-6">{description}</p>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const SelectInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: readonly (string | undefined)[] }> = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full p-3 bg-primary border-2 border-slate-300 rounded-lg text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const MultiSelectButtons: React.FC<{
    label: string;
    options: readonly string[];
    selected: string[];
    onToggle: (option: string) => void;
}> = ({ label, options, selected, onToggle }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onToggle(option)}
                    className={`px-3 py-1.5 text-sm rounded-full border-2 transition-colors duration-200 ${
                        selected.includes(option)
                            ? 'bg-accent border-accent text-white font-semibold'
                            : 'bg-primary border-slate-300 text-text-primary hover:bg-slate-100'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ novel, onUpdateNovel }) => {
    const [settings, setSettings] = useState(novel);
    const [hasChanges, setHasChanges] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setSettings(novel);
    }, [novel]);

    useEffect(() => {
        setHasChanges(JSON.stringify(novel) !== JSON.stringify(settings));
    }, [novel, settings]);

    const handleChange = (field: keyof Novel, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleToggle = (field: 'genre' | 'tone', value: string) => {
        setSettings(prev => {
            const currentValues = (prev[field] as string[] | undefined) || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [field]: newValues };
        });
    };

    const handleSave = () => {
        onUpdateNovel(settings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const handleReset = () => {
        setSettings(novel);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold font-serif text-text-primary mb-6">Novel Settings</h2>
            
            <SettingsCard
                title="Core Attributes"
                description="Define the fundamental creative direction of your novel. These settings influence how the AI generates content and structures the story."
            >
                <MultiSelectButtons label="Genre" options={genres} selected={settings.genre || []} onToggle={(g) => handleToggle('genre', g)} />
                <MultiSelectButtons label="Tone" options={tones} selected={settings.tone || []} onToggle={(t) => handleToggle('tone', t)} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                    <SelectInput 
                        label="Writing Style" 
                        value={settings.style || ''} 
                        onChange={e => handleChange('style', e.target.value)} 
                        options={writingStyles} 
                    />
                    <SelectInput 
                        label="Point of View" 
                        value={settings.pov || 'Third Person'} 
                        onChange={e => handleChange('pov', e.target.value)} 
                        options={povs} 
                    />
                     <SelectInput 
                        label="Language" 
                        value={settings.language || 'English'} 
                        onChange={e => handleChange('language', e.target.value)} 
                        options={languages} 
                    />
                </div>
            </SettingsCard>

            <SettingsCard
                title="AI Personalization"
                description="Fine-tune the AI's creative engine to better match your desired output."
            >
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">AI Creativity Level</label>
                    <div className="flex space-x-2 bg-slate-200 p-1 rounded-lg">
                        {creativityLevels.map(level => (
                             <button
                                key={level}
                                onClick={() => handleChange('creativity', level)}
                                className={`w-full text-center px-4 py-2 rounded-md font-semibold transition-colors text-sm ${settings.creativity === level ? 'bg-white text-accent shadow' : 'text-text-secondary hover:bg-white/50'}`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        {settings.creativity === 'Grounded' && 'The AI will be more factual and stick closely to the prompt. Good for realism.'}
                        {settings.creativity === 'Balanced' && 'A happy medium between creativity and coherence. Recommended for most uses.'}
                        {settings.creativity === 'Imaginative' && 'The AI will take more creative risks, potentially leading to more unique but less predictable results.'}
                    </p>
                </div>
            </SettingsCard>

            <div className="flex justify-end items-center space-x-4 pt-4 border-t border-slate-200">
                {showSuccess && <p className="text-green-600">Changes saved successfully!</p>}
                <button
                    onClick={handleReset}
                    disabled={!hasChanges}
                    className="px-6 py-2 rounded-lg text-text-primary hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                    Reset
                </button>
                <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="bg-accent hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
