
import React, { useState, useEffect } from 'react';
import { Novel, TimelineEvent } from '../types';

interface AddTimelineEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<TimelineEvent, 'id' | 'orderPosition'>) => void;
    onDelete: (id: string) => void;
    event: TimelineEvent | null;
    novel: Novel;
}

const eventCategories: TimelineEvent['category'][] = ['Plot Point', 'Character Moment', 'Conflict', 'Resolution', 'Introduction'];
const eventTypes: TimelineEvent['eventType'][] = ['normal', 'flashback', 'flashforward'];
const predefinedPlotThreads = ['Main Plot', 'Subplot A', 'Subplot B', 'Character Arc', 'Romance', 'Mystery'];

const AddTimelineEventModal: React.FC<AddTimelineEventModalProps> = ({ isOpen, onClose, onSave, onDelete, event, novel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [chapterNumber, setChapterNumber] = useState<number>(1);
    const [eventType, setEventType] = useState<TimelineEvent['eventType']>('normal');
    const [category, setCategory] = useState<TimelineEvent['category']>('Plot Point');
    const [charactersInvolved, setCharactersInvolved] = useState<string[]>([]);
    const [plotThreads, setPlotThreads] = useState<string[]>([]);
    const [date, setDate] = useState('');

    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setDescription(event.description);
            setChapterNumber(event.chapterNumber);
            setEventType(event.eventType);
            setCategory(event.category);
            setCharactersInvolved(event.charactersInvolved);
            setPlotThreads(event.plotThreads);
            setDate(event.date || '');
        } else {
            // Reset form for new event
            setTitle('');
            setDescription('');
            setChapterNumber(1);
            setEventType('normal');
            setCategory('Plot Point');
            setCharactersInvolved([]);
            setPlotThreads([]);
            setDate('');
        }
    }, [event, isOpen]);
    
    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave({ title, description, chapterNumber, eventType, category, charactersInvolved, plotThreads, date });
    };

    const handleDelete = () => {
        if (event && window.confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
            onDelete(event.id);
        }
    };
    
    const commonInputClass = "w-full p-2 bg-primary border border-slate-300 rounded-lg text-text-primary focus:ring-2 focus:ring-accent";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">{event ? 'Edit Event' : 'Add New Event'}</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-text-secondary">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={commonInputClass} />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-text-secondary">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${commonInputClass} h-24`} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                           <label className="text-sm font-medium text-text-secondary">Chapter</label>
                           <input type="number" value={chapterNumber} onChange={e => setChapterNumber(Number(e.target.value))} min="1" className={commonInputClass} />
                        </div>
                         <div>
                           <label className="text-sm font-medium text-text-secondary">Date/Time (Optional)</label>
                           <input type="text" value={date} onChange={e => setDate(e.target.value)} placeholder="e.g., Day 3, Afternoon" className={commonInputClass} />
                        </div>
                        <div>
                           <label className="text-sm font-medium text-text-secondary">Category</label>
                           <select value={category} onChange={e => setCategory(e.target.value as TimelineEvent['category'])} className={commonInputClass}>
                               {eventCategories.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-text-secondary">Event Type</label>
                         <div className="flex space-x-2 bg-slate-200 p-1 rounded-lg">
                            {eventTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setEventType(type)}
                                    className={`w-full text-center capitalize px-3 py-1 rounded-md font-semibold transition-colors text-sm ${eventType === type ? 'bg-white text-accent shadow' : 'text-text-secondary hover:bg-white/50'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text-secondary">Characters Involved</label>
                        {/* FIX: Explicitly type `option` as HTMLOptionElement to resolve TypeScript inference issue. */}
                        <select multiple value={charactersInvolved} onChange={e => setCharactersInvolved(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className={`${commonInputClass} h-24`}>
                            {novel.characters.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-text-secondary">Plot Threads</label>
                        {/* FIX: Explicitly type `option` as HTMLOptionElement to resolve TypeScript inference issue. */}
                        <select multiple value={plotThreads} onChange={e => setPlotThreads(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className={`${commonInputClass} h-24`}>
                            {predefinedPlotThreads.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                         <p className="text-xs text-slate-500 mt-1">Select one or more. The first selection determines the color.</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                     <div>
                        {event && (
                            <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors">
                                Delete Event
                            </button>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={onClose} className="px-6 py-2 rounded-lg text-text-primary hover:bg-slate-200 transition-colors">Cancel</button>
                        <button onClick={handleSubmit} className="bg-accent hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg">Save Event</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTimelineEventModal;
