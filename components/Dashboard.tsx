
import React from 'react';
import { Novel } from '../types';
import NovelCard from './NovelCard';
import { PlusIcon, BookMarkedIcon } from './icons';

interface DashboardProps {
    novels: Novel[];
    onSelectNovel: (id: string) => void;
    onDeleteNovel: (id: string) => void;
    onAddNewNovel: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ novels, onSelectNovel, onDeleteNovel, onAddNewNovel }) => {
    return (
        <div className="min-h-screen bg-primary text-text-primary p-8">
            <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12">
                <h1 className="text-5xl md:text-6xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 text-center sm:text-left">
                    Your Novel Projects
                </h1>
                {novels.length > 0 && (
                    <button
                        onClick={onAddNewNovel}
                        className="bg-accent hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 flex items-center shrink-0"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        <span>Create New Novel</span>
                    </button>
                )}
            </header>

            {novels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {novels.map(novel => (
                        <NovelCard
                            key={novel.id}
                            novel={novel}
                            onSelect={onSelectNovel}
                            onDelete={onDeleteNovel}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 flex flex-col items-center">
                    <BookMarkedIcon className="w-24 h-24 text-slate-400 mb-4" />
                    <h2 className="text-2xl font-semibold text-text-secondary mb-2">No Novels Yet</h2>
                    <p className="text-text-secondary mb-6">Let's start your first masterpiece.</p>
                     <button
                        onClick={onAddNewNovel}
                        className="bg-accent hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 flex items-center text-lg"
                    >
                        <PlusIcon className="w-6 h-6 mr-2" />
                        Create New Novel
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
