
import React, { useState, useMemo } from 'react';
import { Novel, TimelineEvent } from '../types';
import { PlusIcon, ClockIcon } from './icons';
import AddTimelineEventModal from './AddTimelineEventModal';
import TimelineEventCard from './TimelineEventCard';

interface TimelinePageProps {
    novel: Novel;
    onUpdateNovel: (updatedNovel: Novel) => void;
}

const PLOT_THREAD_COLORS: { [key: string]: string } = {
    'Main Plot': 'border-red-500',
    'Subplot A': 'border-blue-500',
    'Subplot B': 'border-green-500',
    'Character Arc': 'border-yellow-500',
    'Romance': 'border-pink-500',
    'Mystery': 'border-purple-500',
    'default': 'border-slate-400',
};

export const getPlotThreadColor = (threads: string[]) => {
    if (!threads || threads.length === 0) return PLOT_THREAD_COLORS['default'];
    return PLOT_THREAD_COLORS[threads[0]] || PLOT_THREAD_COLORS['default'];
};


const TimelinePage: React.FC<TimelinePageProps> = ({ novel, onUpdateNovel }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
    const [characterFilter, setCharacterFilter] = useState<string>('');
    const [threadFilter, setThreadFilter] = useState<string>('');
    const [zoom, setZoom] = useState<number>(100);

    const allPlotThreads = useMemo(() => {
        const threads = new Set<string>();
        novel.timelineEvents.forEach(event => {
            event.plotThreads.forEach(thread => threads.add(thread));
        });
        return Array.from(threads);
    }, [novel.timelineEvents]);

    const filteredEvents = useMemo(() => {
        return novel.timelineEvents
            .filter(event => {
                const charMatch = !characterFilter || event.charactersInvolved.includes(characterFilter);
                const threadMatch = !threadFilter || event.plotThreads.includes(threadFilter);
                return charMatch && threadMatch;
            })
            .sort((a, b) => a.orderPosition - b.orderPosition);
    }, [novel.timelineEvents, characterFilter, threadFilter]);
    
    const eventsByType = {
        flashback: filteredEvents.filter(e => e.eventType === 'flashback'),
        normal: filteredEvents.filter(e => e.eventType === 'normal'),
        flashforward: filteredEvents.filter(e => e.eventType === 'flashforward'),
    };

    const handleOpenModal = (event?: TimelineEvent) => {
        setEditingEvent(event || null);
        setIsModalOpen(true);
    };

    const handleSaveEvent = (eventToSave: Omit<TimelineEvent, 'id' | 'orderPosition'>) => {
        let updatedEvents: TimelineEvent[];
        if (editingEvent) {
             updatedEvents = novel.timelineEvents.map(e => e.id === editingEvent.id ? { ...editingEvent, ...eventToSave } : e);
        } else {
            const newEvent: TimelineEvent = {
                ...eventToSave,
                id: Date.now().toString(),
                orderPosition: (novel.timelineEvents.length > 0 ? Math.max(...novel.timelineEvents.map(e => e.orderPosition)) : 0) + 1,
            };
            updatedEvents = [...novel.timelineEvents, newEvent];
        }
        onUpdateNovel({ ...novel, timelineEvents: updatedEvents });
        setIsModalOpen(false);
        setEditingEvent(null);
    };

    const handleDeleteEvent = (id: string) => {
        const updatedEvents = novel.timelineEvents.filter(e => e.id !== id);
        onUpdateNovel({ ...novel, timelineEvents: updatedEvents });
        setIsModalOpen(false);
        setEditingEvent(null);
    };

    const timelineWidth = useMemo(() => {
        const eventCount = Math.max(eventsByType.flashback.length, eventsByType.normal.length, eventsByType.flashforward.length);
        const cardWidth = 288; // 256px width + 32px gap
        return Math.max(eventCount * cardWidth, 1000);
    }, [eventsByType]);
    
    const TimelineTrack: React.FC<{ events: TimelineEvent[], title: string }> = ({ events, title }) => (
        <div className="h-48 relative border-b-2 border-dashed border-slate-300">
            <span className="absolute left-2 top-2 text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</span>
            <div className="flex space-x-8 h-full items-center pt-4">
               {events.map(event => (
                   <TimelineEventCard key={event.id} event={event} onEdit={() => handleOpenModal(event)} />
               ))}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-3xl font-bold font-serif text-text-primary">Timeline</h2>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Filters */}
                    <select value={characterFilter} onChange={e => setCharacterFilter(e.target.value)} className="p-2 bg-secondary border border-slate-200 rounded-lg text-sm">
                        <option value="">Filter by Character</option>
                        {novel.characters.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                     <select value={threadFilter} onChange={e => setThreadFilter(e.target.value)} className="p-2 bg-secondary border border-slate-200 rounded-lg text-sm">
                        <option value="">Filter by Plot Thread</option>
                        {allPlotThreads.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    {/* Zoom */}
                    <div className="flex items-center bg-secondary border border-slate-200 rounded-lg p-1">
                        <button onClick={() => setZoom(z => Math.max(50, z - 25))} className="px-2 text-lg">-</button>
                        <span className="px-2 text-sm w-16 text-center">{zoom}%</span>
                        <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="px-2 text-lg">+</button>
                    </div>

                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center bg-accent hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add Event
                    </button>
                </div>
            </header>

            <div className="flex-grow overflow-x-auto overflow-y-hidden p-4 bg-primary rounded-lg shadow-inner">
                {novel.timelineEvents.length > 0 ? (
                    <div style={{ width: `${timelineWidth * (zoom / 100)}px`, minWidth: '100%' }}>
                        <TimelineTrack events={eventsByType.flashback} title="Flashbacks" />
                        <TimelineTrack events={eventsByType.normal} title="Main Timeline" />
                        <TimelineTrack events={eventsByType.flashforward} title="Flash-forwards" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <ClockIcon className="w-20 h-20 text-slate-400 mb-4" />
                        <h3 className="text-2xl font-semibold text-text-secondary mb-2">Map Your Story's Journey</h3>
                        <p className="text-text-secondary mb-6">Add events to visualize your plot, track character arcs, and manage pacing.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-accent hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                        >
                            Create First Event
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AddTimelineEventModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveEvent}
                    onDelete={handleDeleteEvent}
                    event={editingEvent}
                    novel={novel}
                />
            )}
        </div>
    );
};

export default TimelinePage;
