
import React from 'react';
import { Novel } from '../types';
import { FileTextIcon, TypeIcon, ActivityIcon } from './icons';

interface NovelOverviewProps {
    novel: Novel;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-secondary p-6 rounded-lg shadow-md flex items-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-text-secondary text-sm font-medium">{label}</p>
            <p className="text-text-primary text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const NovelOverview: React.FC<NovelOverviewProps> = ({ novel }) => {
    const totalChapters = novel.outline.length;
    const completedChapters = novel.outline.filter(p => p.content).length;
    const totalWordCount = novel.outline.reduce((sum, p) => sum + (p.wordCount || 0), 0);
    const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
    
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold font-serif text-text-primary mb-6">Novel Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<FileTextIcon className="w-6 h-6 text-white"/>} label="Chapters" value={totalChapters} color="bg-blue-500"/>
                <StatCard icon={<TypeIcon className="w-6 h-6 text-white"/>} label="Word Count" value={totalWordCount.toLocaleString()} color="bg-green-500" />
                <StatCard icon={<ActivityIcon className="w-6 h-6 text-white"/>} label="Status" value="In Progress" color="bg-yellow-500" />
            </div>

            <div className="bg-secondary p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-xl font-bold font-serif mb-4">Progress</h3>
                <div className="flex items-center">
                    <div className="w-full bg-slate-200 rounded-full h-4">
                        <div className="bg-accent h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="ml-4 font-semibold text-text-primary">{progress}%</span>
                </div>
                <p className="text-sm text-text-secondary mt-2">{completedChapters} of {totalChapters} chapters written.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-secondary p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <h3 className="text-xl font-bold font-serif mb-4">Premise</h3>
                    <p className="text-text-secondary italic">"{novel.premise}"</p>
                </div>
                <div className="bg-secondary p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <h3 className="text-xl font-bold font-serif mb-4">Core Attributes</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-text-secondary font-semibold">GENRE</p>
                            <p className="text-lg text-text-primary">{novel.genre?.join(', ') || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary font-semibold">STYLE</p>
                            <p className="text-lg text-text-primary">{novel.style || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary font-semibold">TONE</p>
                            <p className="text-lg text-text-primary">{novel.tone?.join(', ') || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NovelOverview;
