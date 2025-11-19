
import React from 'react';
import { Novel, PlotPoint } from '../types';
import ChapterCard from './ChapterCard';
import { BookOpenIcon, PlusIcon } from './icons';

interface ChapterListProps {
    novel: Novel;
    onEditChapter: (chapter: PlotPoint) => void;
    onAddNewChapter: () => void;
    onDeleteChapter: (chapterNumber: number) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({ novel, onEditChapter, onAddNewChapter, onDeleteChapter }) => {
    const sortedChapters = [...novel.outline].sort((a, b) => a.chapter - b.chapter);

    return (
        <div className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold font-serif text-text-primary">Chapters</h2>
                <button
                    onClick={onAddNewChapter}
                    className="flex items-center bg-accent hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New Chapter
                </button>
            </div>

            {sortedChapters.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                    {sortedChapters.map(chapter => (
                        <ChapterCard
                            key={chapter.chapter}
                            chapter={chapter}
                            onEdit={() => onEditChapter(chapter)}
                            onDelete={() => onDeleteChapter(chapter.chapter)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center bg-secondary p-8 rounded-lg mt-10">
                    <BookOpenIcon className="w-20 h-20 text-slate-400 mb-4" />
                    <h3 className="text-2xl font-semibold text-text-secondary mb-2">Your Story Awaits</h3>
                    <p className="text-text-secondary mb-6">You haven't written any chapters yet. Let's get started!</p>
                    <button
                        onClick={onAddNewChapter}
                        className="bg-accent hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                    >
                        Create First Chapter
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChapterList;