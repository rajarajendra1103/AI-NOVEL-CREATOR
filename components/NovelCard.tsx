import React from 'react';
import { Novel } from '../types';
import { TrashIcon } from './icons';

interface NovelCardProps {
    novel: Novel;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

const NovelCard: React.FC<NovelCardProps> = ({ novel, onSelect, onDelete }) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${novel.title}"? This action cannot be undone.`)) {
            onDelete(novel.id);
        }
    };

    return (
        <div 
            className="group relative bg-secondary rounded-lg shadow-lg cursor-pointer transition-all duration-300 hover:shadow-accent/20 hover:-translate-y-1 flex flex-col"
            onClick={() => onSelect(novel.id)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onSelect(novel.id)}
        >
            <div className="w-full h-40 bg-slate-200 rounded-t-lg flex items-center justify-center overflow-hidden">
                <span className="text-slate-500 font-serif text-2xl text-center p-4">{novel.title}</span>
            </div>
            <div className="p-4 flex-grow">
                <h3 className="text-xl font-bold font-serif text-text-primary truncate" title={novel.title}>{novel.title}</h3>
                <p className="text-sm text-text-secondary h-12 overflow-hidden text-ellipsis mt-1">{novel.premise}</p>
            </div>
            <button
                onClick={handleDelete}
                className="absolute top-2 right-2 p-2 bg-red-600/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:opacity-100"
                aria-label={`Delete ${novel.title}`}
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default NovelCard;