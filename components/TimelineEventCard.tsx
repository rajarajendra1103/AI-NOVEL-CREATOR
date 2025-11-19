
import React from 'react';
import { TimelineEvent } from '../types';
import { getPlotThreadColor } from './TimelinePage';
import { StarIcon, UserIcon, ZapIcon, CheckIcon, UserPlusIcon } from './icons';

interface TimelineEventCardProps {
    event: TimelineEvent;
    onEdit: () => void;
}

const categoryIcons: { [key in TimelineEvent['category']]: React.ReactNode } = {
    'Plot Point': <StarIcon className="w-4 h-4" />,
    'Character Moment': <UserIcon className="w-4 h-4" />,
    'Conflict': <ZapIcon className="w-4 h-4" />,
    'Resolution': <CheckIcon className="w-4 h-4" />,
    'Introduction': <UserPlusIcon className="w-4 h-4" />,
};

const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event, onEdit }) => {
    const borderColor = getPlotThreadColor(event.plotThreads);

    return (
        <div 
            onClick={onEdit}
            className={`w-64 h-36 p-3 bg-secondary rounded-lg shadow-md cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-l-4 ${borderColor} flex flex-col justify-between flex-shrink-0`}
        >
            <div>
                <div className="flex justify-between items-start">
                    <h4 className="font-bold font-serif text-text-primary mb-1 line-clamp-1">{event.title}</h4>
                    <span title={event.category} className="p-1 bg-slate-200 rounded-full text-slate-600">
                        {categoryIcons[event.category]}
                    </span>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2">{event.description}</p>
            </div>
            <div className="text-xs text-slate-500 border-t border-slate-200 pt-1 mt-1 flex justify-between">
                <span>Ch. {event.chapterNumber}</span>
                <span>{event.date || ''}</span>
            </div>
        </div>
    );
};

export default TimelineEventCard;
