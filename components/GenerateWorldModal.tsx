
import React, { useState } from 'react';
import { Novel } from '../types';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface GenerateWorldModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (worldData: Partial<Novel>) => void;
    novel: Novel;
}

const tones = ['Gritty', 'Whimsical', 'Realistic', 'Epic', 'Dark', 'Hopeful'];

const GenerateWorldModal: React.FC<GenerateWorldModalProps> = ({ isOpen, onClose, onGenerate, novel }) => {
    const [settingNotes, setSettingNotes] = useState('');
    const [tone, setTone] = useState('Epic');
    const [numKingdoms, setNumKingdoms] = useState(2);
    const [numCities, setNumCities] = useState(4);
    const [numCultures, setNumCultures] = useState(3);
    const [includeMagic, setIncludeMagic] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const worldData = await geminiService.generateWorld({
                settingNotes, tone, numKingdoms, numCities, numCultures, includeMagic
            }, novel);
            onGenerate(worldData);
            onClose();
        } catch (err) {
            console.error("Failed to generate world:", err);
            setError("The AI failed to generate the world. Please try again or adjust your settings.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-2">Generate World with AI</h2>
                <p className="text-text-secondary mb-6">Describe your world in a few sentences, set the parameters, and let the AI build the foundation.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-text-secondary">Setting Notes</label>
                        <textarea
                            value={settingNotes}
                            onChange={e => setSettingNotes(e.target.value)}
                            placeholder="e.g., A gaslamp fantasy world where alchemy is powered by captured starlight, set in a continent divided by a colossal, ancient forest..."
                            className="w-full h-28 p-2 bg-primary border border-slate-300 rounded-lg"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-text-secondary">Tone</label>
                            <select value={tone} onChange={e => setTone(e.target.value)} className="w-full p-2 bg-primary border border-slate-300 rounded-lg" disabled={isLoading}>
                                {tones.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center space-x-3 pt-6">
                             <input type="checkbox" id="includeMagic" checked={includeMagic} onChange={e => setIncludeMagic(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" disabled={isLoading}/>
                             <label htmlFor="includeMagic" className="text-sm font-medium text-text-secondary">Include Magic/Tech System</label>
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-text-secondary">Generation Scope</label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            <NumberInput label="Kingdoms" value={numKingdoms} onChange={setNumKingdoms} disabled={isLoading} />
                            <NumberInput label="Cities/Towns" value={numCities} onChange={setNumCities} disabled={isLoading} />
                            <NumberInput label="Cultures" value={numCultures} onChange={setNumCultures} disabled={isLoading} />
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={onClose} disabled={isLoading} className="px-6 py-2 rounded-lg text-text-primary hover:bg-slate-200">Cancel</button>
                    <button onClick={handleSubmit} disabled={isLoading} className="bg-accent hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg min-w-[150px] text-center">
                        {isLoading ? <div className="flex justify-center"><LoadingSpinner/></div> : 'Generate World'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const NumberInput: React.FC<{label: string, value: number, onChange: (val: number) => void, disabled: boolean}> = ({ label, value, onChange, disabled }) => (
    <div>
        <span className="text-xs text-text-secondary">{label}</span>
        <input 
            type="number" 
            min="0"
            max="10"
            value={value}
            onChange={e => onChange(parseInt(e.target.value, 10))}
            className="w-full p-2 bg-primary border border-slate-300 rounded-lg text-center"
            disabled={disabled}
        />
    </div>
);

export default GenerateWorldModal;
