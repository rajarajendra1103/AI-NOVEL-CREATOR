import React from 'react';
import { Novel, PlotPoint } from '../types';
import { RefreshIcon, ArrowRightIcon, XIcon } from './icons';

interface OutlineReviewerProps {
  novel: Novel;
  onRegenerate: () => void;
  onAccept: () => void;
  onSkip: () => void;
}

const groupChaptersByAct = (outline: PlotPoint[]) => {
    return outline.reduce((acc, plotPoint) => {
        (acc[plotPoint.act] = acc[plotPoint.act] || []).push(plotPoint);
        return acc;
    }, {} as Record<number, PlotPoint[]>);
};

const OutlineReviewer: React.FC<OutlineReviewerProps> = ({ novel, onRegenerate, onAccept, onSkip }) => {
    const acts = groupChaptersByAct(novel.outline);

    return (
        <div className="min-h-screen bg-primary text-text-primary p-8 flex flex-col">
            <header className="text-center mb-8">
                <p className="text-accent font-semibold">STEP 1 OF 2</p>
                <h1 className="text-4xl md:text-5xl font-bold font-serif text-text-primary mt-2">
                    Review Your Novel's Outline
                </h1>
                <p className="text-text-secondary mt-2 max-w-3xl mx-auto">
                    Our AI has generated a potential plot structure based on your premise. You can accept it, ask for a new one, or skip this step entirely.
                </p>
            </header>
            
            <main className="flex-grow bg-secondary rounded-lg p-6 overflow-y-auto mb-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold font-serif text-center mb-2">{novel.title}</h2>
                    <p className="text-text-secondary text-center italic mb-8">"{novel.premise}"</p>

                    {Object.entries(acts).map(([actNumber, chapters]) => (
                        <div key={actNumber} className="mb-8">
                            <h3 className="text-2xl font-bold font-serif text-accent border-b-2 border-slate-200 pb-2 mb-4">
                                Act {actNumber}
                            </h3>
                            <ul className="space-y-4">
                                {chapters.map(chapter => (
                                    <li key={chapter.chapter} className="bg-primary p-4 rounded-md shadow-md border border-slate-200">
                                        <h4 className="font-bold text-lg flex justify-between items-center">
                                            <span>Ch. {chapter.chapter}: {chapter.title}</span>
                                            {chapter.isTurningPoint && <span className="text-xs bg-yellow-400 text-yellow-900 font-bold px-2 py-1 rounded-full">Turning Point</span>}
                                        </h4>
                                        <p className="text-text-secondary mt-1 text-sm">{chapter.summary}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="bg-secondary rounded-lg p-4 sticky bottom-8 w-full max-w-4xl mx-auto shadow-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <button onClick={onRegenerate} className="flex items-center justify-center w-full sm:w-auto px-6 py-3 border-2 border-slate-300 rounded-lg text-text-primary font-semibold hover:bg-slate-100 transition-colors">
                        <RefreshIcon className="w-5 h-5 mr-2" />
                        Regenerate
                    </button>
                    <button onClick={onSkip} className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-slate-200 rounded-lg text-text-primary font-semibold hover:bg-slate-300 transition-colors">
                        <XIcon className="w-5 h-5 mr-2" />
                        Skip Outline
                    </button>
                    <button onClick={onAccept} className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-accent rounded-lg text-white font-bold hover:bg-purple-500 transition-colors transform hover:scale-105">
                        Accept & Continue
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default OutlineReviewer;