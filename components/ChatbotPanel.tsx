
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Novel, ChatMessage } from '../types';
import * as geminiService from '../services/geminiService';
import { XIcon, SparklesIcon, MoveIcon, ChevronDownIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface ChatbotPanelProps {
    novel: Novel;
    onClose: () => void;
}

type Mode = 'creative' | 'research';

const ChatbotPanel: React.FC<ChatbotPanelProps> = ({ novel, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<Mode>('creative');
    const [isLoading, setIsLoading] = useState(false);
    const [isContextOpen, setIsContextOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (panelRef.current) {
            const { innerWidth, innerHeight } = window;
            const { offsetWidth, offsetHeight } = panelRef.current;
            setPosition({
                x: innerWidth - offsetWidth - 32,
                y: innerHeight - offsetHeight - 32,
            });
        }
    }, []);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!panelRef.current) return;
        setIsDragging(true);
        const panelRect = panelRef.current.getBoundingClientRect();
        setOffset({
            x: e.clientX - panelRect.left,
            y: e.clientY - panelRect.top,
        });
        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !panelRef.current) return;

        let newX = e.clientX - offset.x;
        let newY = e.clientY - offset.y;

        const { innerWidth, innerHeight } = window;
        const { offsetWidth, offsetHeight } = panelRef.current;

        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + offsetWidth > innerWidth) newX = innerWidth - offsetWidth;
        if (newY + offsetHeight > innerHeight) newY = innerHeight - offsetHeight;

        setPosition({ x: newX, y: newY });
    }, [isDragging, offset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        document.body.style.userSelect = '';
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await geminiService.generateChatbotResponse(novel, [...messages, userMessage], input, mode);
            const modelMessage: ChatMessage = { role: 'model', content: response };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            ref={panelRef}
            className="fixed w-[420px] h-[600px] bg-primary rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200"
            style={{ top: position.y, left: position.x }}
        >
            <header 
                className={`flex items-center justify-between p-4 border-b border-white/20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-2xl ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center">
                    <MoveIcon className="w-5 h-5 mr-2 opacity-70" />
                    <h2 className="text-lg font-bold">AI Assistant</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
                    <XIcon className="w-5 h-5" />
                </button>
            </header>
            
            <div className="p-2 border-b border-slate-200">
                <div className="flex bg-slate-100 rounded-md p-1">
                    <button
                        onClick={() => setMode('creative')}
                        className={`w-1/2 text-sm font-semibold py-1.5 rounded-md transition-colors ${mode === 'creative' ? 'bg-white shadow text-accent' : 'text-text-secondary hover:bg-slate-200'}`}
                    >
                        ✨ Creative Mode
                    </button>
                    <button
                        onClick={() => setMode('research')}
                        className={`w-1/2 text-sm font-semibold py-1.5 rounded-md transition-colors ${mode === 'research' ? 'bg-white shadow text-accent' : 'text-text-secondary hover:bg-slate-200'}`}
                    >
                        🔍 Research Mode
                    </button>
                </div>
            </div>

            <div className="border-b border-slate-200">
                <button onClick={() => setIsContextOpen(!isContextOpen)} className="w-full flex justify-between items-center p-2 text-xs text-text-secondary hover:bg-slate-50">
                    <span>Novel Context</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isContextOpen ? 'rotate-180' : ''}`} />
                </button>
                {isContextOpen && (
                    <div className="p-2 text-xs text-slate-500 bg-slate-50 border-t border-slate-200 max-h-24 overflow-y-auto">
                       <p><strong>Title:</strong> {novel.title}</p>
                       <p><strong>Premise:</strong> {novel.premise}</p>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-slate-100 text-text-primary'}`}>
                            <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="max-w-xs px-4 py-2 rounded-2xl bg-slate-100 text-text-primary">
                            <LoadingSpinner />
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 bg-secondary rounded-b-2xl">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder="Ask anything..."
                        className="w-full p-3 pr-12 bg-primary border-2 border-slate-300 rounded-lg text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent focus:border-accent transition"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent rounded-md text-white hover:bg-purple-500 disabled:opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.949a.75.75 0 0 0 .95.826L11.25 8.25l-5.607 1.76a.75.75 0 0 0-.826.95l1.414 4.949a.75.75 0 0 0 .95.826l3.292-1.036a.75.75 0 0 0 0-1.392L6.105 11.25l5.607-1.76a.75.75 0 0 0 0-1.392L3.105 2.289Z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatbotPanel;
