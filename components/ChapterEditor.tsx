
import React from 'react';
import { PlotPoint } from '../types';
import { ArrowLeftIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface ChapterEditorProps {
    chapter: PlotPoint;
    onSaveChapter: (updatedChapter: PlotPoint) => void;
    onGenerateContent: (chapter: PlotPoint) => void;
    onGoBack: () => void;
    onGoNext: () => void;
    onGoPrevious: () => void;
    onGoToChapter: (chapterNumber: number) => void;
    allChapters: PlotPoint[];
    isFirstChapter: boolean;
    isLastChapter: boolean;
}

const ChapterEditor: React.FC<ChapterEditorProps> = ({
    chapter,
    onSaveChapter,
    onGenerateContent,
    onGoBack,
    onGoNext,
    onGoPrevious,
    onGoToChapter,
    allChapters,
    isFirstChapter,
    isLastChapter
}) => {
    
    const commonInputClass = "w-full bg-secondary border-2 border-slate-200 rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent focus:border-accent transition";

    return (
        <div className="h-full flex flex-col">
            <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button onClick={onGoBack} className="flex items-center text-sm text-text-secondary hover:text-text-primary transition-colors flex-shrink-0">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Chapter List
                </button>
                <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                    <button onClick={onGoPrevious} disabled={isFirstChapter} className="px-3 py-2 bg-secondary rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
                    <select
                        value={chapter.chapter}
                        onChange={(e) => onGoToChapter(Number(e.target.value))}
                        className="p-2 bg-secondary border-2 border-slate-200 rounded-lg text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
                    >
                        {allChapters.map(c => (
                            <option key={c.chapter} value={c.chapter}>
                                Ch. {c.chapter}
                            </option>
                        ))}
                    </select>
                    <button onClick={onGoNext} disabled={isLastChapter} className="px-3 py-2 bg-secondary rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
            </header>
            <div className="flex-grow bg-secondary rounded-lg p-6 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    <div className="lg:col-span-2">
                        <label htmlFor="chapter-title" className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                        <input
                            id="chapter-title"
                            type="text"
                            value={chapter.title}
                            onChange={(e) => onSaveChapter({ ...chapter, title: e.target.value })}
                            className={`${commonInputClass} text-2xl font-bold font-serif`}
                        />
                    </div>
                    <div>
                        <label htmlFor="chapter-act" className="block text-sm font-medium text-text-secondary mb-1">Act</label>
                         <input
                            id="chapter-act"
                            type="number"
                            value={chapter.act}
                            onChange={(e) => onSaveChapter({ ...chapter, act: Math.max(1, Number(e.target.value)) })}
                            className={`${commonInputClass} text-2xl font-bold font-serif`}
                            min="1"
                        />
                    </div>
                     <div>
                        <label htmlFor="chapter-pov" className="block text-sm font-medium text-text-secondary mb-1">Point of View</label>
                         <input
                            id="chapter-pov"
                            type="text"
                            value={chapter.pov || ''}
                            onChange={(e) => onSaveChapter({ ...chapter, pov: e.target.value })}
                            className={`${commonInputClass} text-lg`}
                            placeholder="e.g., Third Person"
                        />
                    </div>
                </div>
                
                <div className="mb-6">
                    <label htmlFor="chapter-summary" className="block text-sm font-medium text-text-secondary mb-1">Summary</label>
                    <textarea
                        id="chapter-summary"
                        value={chapter.summary}
                        onChange={(e) => onSaveChapter({ ...chapter, summary: e.target.value })}
                        className={`${commonInputClass} h-32`}
                        rows={4}
                    />
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6">
                    <h3 className="text-xl font-bold font-serif mb-4 text-text-primary">Chapter Content</h3>
                    {chapter.content ? (
                        <div className="prose prose-slate max-w-none text-text-secondary whitespace-pre-wrap font-serif text-lg leading-relaxed p-4 bg-primary rounded-md" dangerouslySetInnerHTML={{ __html: chapter.content.replace(/\n/g, '<br />') }} />
                    ) : (
                        <div className="text-center py-10 rounded-lg bg-primary border-2 border-dashed border-slate-300">
                            {chapter.isGeneratingContent ? (
                                <div className="flex flex-col items-center">
                                    <LoadingSpinner />
                                    <p className="mt-4 text-text-secondary">Generating chapter content...</p>
                                    <p className="text-sm text-slate-400">This can take up to 30 seconds.</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-text-secondary mb-4">This chapter is empty.</p>
                                    <button
                                        onClick={() => onGenerateContent(chapter)}
                                        className="bg-accent hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                                    >
                                        Generate Chapter Content with AI
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChapterEditor;