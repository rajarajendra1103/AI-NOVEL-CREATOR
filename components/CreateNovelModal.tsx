
import React, { useState } from 'react';
import { Novel } from '../types';

interface CreateNovelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (premise: string, title: string, genre: string[], style: string, tone: string[], language: string, pov: Novel['pov']) => Promise<void>;
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
const povs: Novel['pov'][] = ['First Person', 'Second Person', 'Third Person'];

const MultiSelectButtons: React.FC<{
    label: string;
    options: readonly string[];
    selected: string[];
    onToggle: (option: string) => void;
}> = ({ label, options, selected, onToggle }) => (
    <div className="md:col-span-2">
        <label className="block text-xs md:text-sm font-medium text-text-secondary mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onToggle(option)}
                    className={`px-2 py-1 text-[10px] md:text-xs rounded-full border transition-colors duration-200 ${
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


const CreateNovelModal: React.FC<CreateNovelModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [premise, setPremise] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [style, setStyle] = useState('');
    const [selectedTones, setSelectedTones] = useState<string[]>([]);
    const [language, setLanguage] = useState('English');
    const [pov, setPov] = useState<Novel['pov']>('Third Person');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleToggleGenre = (genre: string) => {
        setSelectedGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
    };
    
    const handleToggleTone = (tone: string) => {
        setSelectedTones(prev => prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone]);
    };

    const handleSubmit = async () => {
        if (!premise.trim()) {
            setError('Please enter a premise for your novel.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await onCreate(premise, title, selectedGenres, style, selectedTones, language, pov);
            setPremise('');
            setTitle('');
            setSelectedGenres([]);
            setStyle('');
            setSelectedTones([]);
            setLanguage('English');
            setPov('Third Person');
        } catch (err) {
            console.error(err);
            setError('Failed to generate novel. Please try again.');
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    const commonInputClass = "w-full p-2 bg-primary border border-slate-300 rounded-lg text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent focus:border-accent transition text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-secondary rounded-lg shadow-xl max-w-3xl w-full mx-auto transform transition-all max-h-[90vh] flex flex-col" >
                {/* Header - Static */}
                <div className="p-5 border-b border-slate-200 shrink-0">
                    <h2 className="text-2xl font-bold font-serif text-text-primary mb-1">Create a New Novel</h2>
                    <p className="text-text-secondary text-sm">
                        Start with a single idea. Our AI will handle the rest.
                    </p>
                </div>

                {/* Content - Scrollable */}
                <div className="p-5 overflow-y-auto flex-grow custom-scrollbar">
                    <div className="space-y-4">
                        <div>
                            <input
                                type="text"
                                className={commonInputClass}
                                placeholder="Novel Title (Optional)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                             <textarea
                                className={`${commonInputClass} h-24 resize-none`}
                                placeholder="Enter your novel premise here..."
                                value={premise}
                                onChange={(e) => setPremise(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <MultiSelectButtons label="Genre" options={genres} selected={selectedGenres} onToggle={handleToggleGenre} />
                            <MultiSelectButtons label="Tone" options={tones} selected={selectedTones} onToggle={handleToggleTone} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label htmlFor="style-select" className="block text-xs font-medium text-text-secondary mb-1">Writing Style</label>
                                <select
                                    id="style-select"
                                    className={commonInputClass}
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="">Select Style</option>
                                    {writingStyles.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="pov-select" className="block text-xs font-medium text-text-secondary mb-1">Point of View</label>
                                <select
                                    id="pov-select"
                                    className={commonInputClass}
                                    value={pov}
                                    onChange={(e) => setPov(e.target.value as Novel['pov'])}
                                    disabled={isLoading}
                                >
                                    {povs.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="language-select" className="block text-xs font-medium text-text-secondary mb-1">Language</label>
                                <select
                                    id="language-select"
                                    className={commonInputClass}
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    disabled={isLoading}
                                >
                                    {languages.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
                </div>
                
                {/* Footer - Static */}
                <div className="p-4 border-t border-slate-200 bg-secondary rounded-b-lg shrink-0 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg text-text-primary hover:bg-slate-200 transition-colors disabled:opacity-50 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-accent hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[120px] justify-center text-sm"
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Building...</span>
                            </div>
                        ) : (
                            'Create Novel'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateNovelModal;
