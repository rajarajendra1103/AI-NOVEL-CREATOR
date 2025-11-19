
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Novel, PlotPoint, View } from '../types';
import * as geminiService from '../services/geminiService';
import CharacterCard from './CharacterCard';
import RelationshipGraph from './RelationshipGraph';
import NovelOverview from './NovelOverview';
import OutlineGenerator from './OutlineGenerator';
import ChapterList from './ChapterList';
import ChapterEditor from './ChapterEditor';
import SettingsPage from './SettingsPage';
import TimelinePage from './TimelinePage';
import WorldbuildingPage from './WorldbuildingPage';

interface NovelEditorProps {
    initialNovel: Novel;
    onUpdateNovel: (updatedNovel: Novel) => void;
    activeView: View;
}

const NovelEditor: React.FC<NovelEditorProps> = ({ initialNovel, onUpdateNovel, activeView }) => {
  const [novel, setNovel] = useState<Novel>(initialNovel);
  const [error, setError] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] = useState<PlotPoint | null>(null);

  useEffect(() => {
    setNovel(initialNovel);
    if (editingChapter) {
        const currentActiveChapter = initialNovel.outline.find(p => p.chapter === editingChapter.chapter);
        setEditingChapter(currentActiveChapter || null);
    }
  }, [initialNovel, editingChapter?.chapter]);

  const handleGenerateChapterContent = useCallback(async (chapter: PlotPoint) => {
    setNovel(prevNovel => {
        const updatedNovel = {
            ...prevNovel,
            outline: prevNovel.outline.map(p => 
                p.chapter === chapter.chapter ? { ...p, isGeneratingContent: true } : p
            ),
        };
        onUpdateNovel(updatedNovel);
        return updatedNovel;
    });

    try {
        const content = await geminiService.generateChapterContent(novel, chapter);
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        
        setNovel(prevNovel => {
            const updatedOutline = prevNovel.outline.map(p =>
                p.chapter === chapter.chapter ? { ...p, content, wordCount, isGeneratingContent: false } : p
            );
            const updatedNovel = { ...prevNovel, outline: updatedOutline };
            onUpdateNovel(updatedNovel);
            return updatedNovel;
        });
    } catch (err) {
        console.error(err);
        setError(`Failed to generate content for Chapter ${chapter.chapter}.`);
        setNovel(prevNovel => {
            const updatedNovel = {
                ...prevNovel,
                outline: prevNovel.outline.map(p => 
                    p.chapter === chapter.chapter ? { ...p, isGeneratingContent: false } : p
                ),
            };
            onUpdateNovel(updatedNovel);
            return updatedNovel;
        });
    }
  }, [novel, onUpdateNovel]);

  const handleAddNewChapter = () => {
    const sortedOutline = [...novel.outline].sort((a,b) => a.chapter - b.chapter);
    const lastChapter = sortedOutline.length > 0 ? sortedOutline[sortedOutline.length - 1] : null;
    const newAct = lastChapter ? lastChapter.act : 1;
    const newChapterNumber = lastChapter ? lastChapter.chapter + 1 : 1;

    const newChapter: PlotPoint = {
        chapter: newChapterNumber,
        act: newAct,
        title: 'Untitled Chapter',
        summary: 'A new chapter begins...',
        isTurningPoint: false,
        pov: 'Third Person',
    };
    const updatedOutline = [...novel.outline, newChapter];
    const updatedNovel = { ...novel, outline: updatedOutline };
    setNovel(updatedNovel);
    onUpdateNovel(updatedNovel);
    setEditingChapter(newChapter);
  };

  const handleSaveChapter = (updatedChapter: PlotPoint) => {
    const updatedOutline = novel.outline.map(p =>
        p.chapter === updatedChapter.chapter ? updatedChapter : p
    );
    const updatedNovel = { ...novel, outline: updatedOutline };
    onUpdateNovel(updatedNovel);
  };


  const handleDeleteChapter = (chapterNumberToDelete: number) => {
      const remainingChapters = novel.outline.filter(p => p.chapter !== chapterNumberToDelete);
      const sortedAndRenumbered = remainingChapters
          .sort((a, b) => a.chapter - b.chapter)
          .map((chapter, index) => ({
              ...chapter,
              chapter: index + 1
          }));
      
      const updatedNovel = { ...novel, outline: sortedAndRenumbered };
      setNovel(updatedNovel);
      onUpdateNovel(updatedNovel);

      if (editingChapter?.chapter === chapterNumberToDelete) {
          setEditingChapter(null);
      }
  };

  const handleOutlineGenerated = (outline: PlotPoint[]) => {
    const updatedNovel = { ...novel, outline };
    setNovel(updatedNovel);
    onUpdateNovel(updatedNovel);
  };

  const sortedChapters = useMemo(() => 
    [...novel.outline].sort((a, b) => a.chapter - b.chapter),
  [novel.outline]);

  const goToChapter = (chapterNumber: number) => {
    const chapter = sortedChapters.find(c => c.chapter === chapterNumber);
    if (chapter) setEditingChapter(chapter);
  };

  const goToNextChapter = () => {
    if (!editingChapter) return;
    const currentIndex = sortedChapters.findIndex(p => p.chapter === editingChapter.chapter);
    if (currentIndex > -1 && currentIndex < sortedChapters.length - 1) {
      setEditingChapter(sortedChapters[currentIndex + 1]);
    }
  };

  const goToPreviousChapter = () => {
    if (!editingChapter) return;
    const currentIndex = sortedChapters.findIndex(p => p.chapter === editingChapter.chapter);
    if (currentIndex > 0) {
      setEditingChapter(sortedChapters[currentIndex - 1]);
    }
  };

  const renderContent = () => {
    if (!novel) return null;
  
    switch (activeView) {
      case 'overview':
        return <NovelOverview novel={novel} />;
      case 'outline':
        if (novel.outline.length === 0) {
          return <OutlineGenerator novel={novel} onOutlineGenerated={handleOutlineGenerated} />;
        }
        if (editingChapter) {
            const currentIndex = sortedChapters.findIndex(p => p.chapter === editingChapter.chapter);
            return (
                <ChapterEditor 
                    chapter={editingChapter}
                    onSaveChapter={handleSaveChapter}
                    onGenerateContent={handleGenerateChapterContent}
                    onGoBack={() => setEditingChapter(null)}
                    onGoToChapter={goToChapter}
                    onGoNext={goToNextChapter}
                    onGoPrevious={goToPreviousChapter}
                    allChapters={sortedChapters}
                    isFirstChapter={currentIndex === 0}
                    isLastChapter={currentIndex === sortedChapters.length - 1}
                />
            );
        }
        return (
            <ChapterList
                novel={novel}
                onEditChapter={setEditingChapter}
                onAddNewChapter={handleAddNewChapter}
                onDeleteChapter={handleDeleteChapter}
            />
        );
      case 'characters':
        return (
          <div>
            <h2 className="text-3xl font-bold font-serif text-text-primary mb-6">Characters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {novel.characters.map((char) => (
                <CharacterCard key={char.name} character={char} />
              ))}
            </div>
          </div>
        );
      case 'relationships':
        return (
          <div>
            <h2 className="text-3xl font-bold font-serif text-text-primary mb-6">Character Relationships</h2>
            <div className="bg-primary rounded-lg p-4 h-[calc(100vh-16rem)] shadow-inner">
                <RelationshipGraph characters={novel.characters} relationships={novel.relationships} />
            </div>
          </div>
        );
      case 'settings':
        return <SettingsPage novel={novel} onUpdateNovel={onUpdateNovel} />;
      case 'timeline':
        return <TimelinePage novel={novel} onUpdateNovel={onUpdateNovel} />;
      case 'worldbuilding':
        return <WorldbuildingPage novel={novel} onUpdateNovel={onUpdateNovel} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
        {error && <p className="text-red-500 bg-red-100 border border-red-400 p-3 rounded-md mb-4">{error}</p>}
        {renderContent()}
    </div>
  );
};

export default NovelEditor;