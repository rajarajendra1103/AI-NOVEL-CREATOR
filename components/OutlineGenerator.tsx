
import React, { useState } from 'react';
import { Novel, PlotPoint } from '../types';
import * as geminiService from '../services/geminiService';
import { SparklesIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface OutlineGeneratorProps {
    novel: Novel;
    onOutlineGenerated: (outline: PlotPoint[]) => void;
}

const OutlineGenerator: React.FC<OutlineGeneratorProps> = ({ novel, onOutlineGenerated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const newOutline = await geminiService.generateOutline(novel);
            onOutlineGenerated(newOutline);
        } catch (err) {
            console.error(err);
            setError("Failed to generate outline. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-secondary p-8 rounded-lg">
             <div className="bg-purple-100 p-3 rounded-full mb-4">
                <SparklesIcon className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-3xl font-bold font-serif text-text-primary">Generate Your Plot Outline</h2>
            <p className="text-text-secondary mt-2 max-w-xl">
                This novel doesn't have an outline yet. Use the power of AI to create a detailed, chapter-by-chapter plot based on your premise and core attributes.
            </p>
            <div className="mt-6">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-accent hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span className="ml-2">Generating...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Generate Outline
                        </>
                    )}
                </button>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <div className="mt-8 p-4 bg-primary border border-slate-200 rounded-lg text-sm text-text-secondary max-w-2xl">
                <strong>How it works:</strong> The AI will analyze your novel's premise, genre, style, and tone to build a classic three-act structure. You'll be able to edit everything once it's generated.
            </div>
        </div>
    );
};

export default OutlineGenerator;
