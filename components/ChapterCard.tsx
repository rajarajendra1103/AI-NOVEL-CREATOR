
import React from 'react';
import { PlotPoint } from '../types';
import { PencilIcon, TrashIcon } from './icons';

interface ChapterCardProps {
    chapter: PlotPoint;
    onEdit: () => void;
    onDelete: () => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, onEdit, onDelete }) => {
    
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete Chapter ${chapter.chapter}: "${chapter.title}"?`)) {
            onDelete();
        }
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit();
    }

    const status = chapter.content ? 'Written' : 'Not Written';
    const statusColor = chapter.content ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600';

    return (
        <div
            className="group relative bg-secondary rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:shadow-accent/20 hover:-translate-y-1 flex flex-col p-4 border border-slate-200"
            role="button"
            tabIndex={0}
            onClick={onEdit}
            onKeyPress={(e) => e.key === 'Enter' && onEdit()}
        >
            <div className="flex items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex-shrink-0 flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">{chapter.chapter}</span>
                </div>
                <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-text-primary font-serif leading-tight truncate" title={chapter.title}>
                        {chapter.title}
                    </h3>
                    <span className="text-xs text-accent font-bold">Act {chapter.act}</span>
                </div>
            </div>
            
            <p className="text-sm text-text-secondary flex-grow overflow-hidden h-12 mb-3 line-clamp-2">
                {chapter.summary}
            </p>

            <div className="flex items-center space-x-2 text-xs mb-3">
                <span className={`px-2 py-0.5 rounded-full font-semibold ${statusColor}`}>{status}</span>
                <span className="px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">{chapter.pov || 'N/A'}</span>
                 {chapter.isTurningPoint && <span className="px-2 py-0.5 rounded-full font-bold text-yellow-800 bg-yellow-300">Turning Point</span>}
            </div>
            
            <div className="border-t border-slate-200 pt-2 text-sm text-text-secondary">
                <span>{chapter.wordCount ? `${chapter.wordCount.toLocaleString()} words` : '0 words'}</span>
            </div>

            <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button onClick={handleEditClick} className="p-2 bg-secondary rounded-full shadow-md hover:bg-accent hover:text-white transition-colors">
                    <PencilIcon className="w-4 h-4" />
                </button>
                <button onClick={handleDeleteClick} className="p-2 bg-secondary rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ChapterCard;