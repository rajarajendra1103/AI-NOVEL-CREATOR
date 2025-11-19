import React from 'react';
import { TrashIcon } from './icons';

interface WorldbuildingCardProps {
    item: {
        id: string;
        name: string;
        title?: string;
        description?: string;
        summary?: string;
        goals?: string;
        // Add other potential description-like fields here
    };
    onEdit: () => void;
    onDelete: () => void;
}

const WorldbuildingCard: React.FC<WorldbuildingCardProps> = ({ item, onEdit, onDelete }) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    const title = item.name || item.title || 'Untitled';
    const description = item.description || item.summary || item.goals || 'No description available.';

    return (
        <div 
            onClick={onEdit}
            className="group relative bg-secondary rounded-lg shadow-md border border-slate-200 flex flex-col transition-all duration-300 hover:shadow-accent/20 hover:-translate-y-1 cursor-pointer"
        >
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg flex items-center">
                <h3 className="text-xl font-bold font-serif text-text-primary truncate">{title}</h3>
            </div>
            <div className="p-4 flex-grow">
                <p className="text-sm text-text-secondary h-24 overflow-y-auto">{description}</p>
            </div>
             <button
                onClick={handleDelete}
                className="absolute top-2 right-2 p-2 bg-red-600/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:opacity-100"
                aria-label={`Delete ${title}`}
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default WorldbuildingCard;