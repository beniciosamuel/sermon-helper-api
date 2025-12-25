import React, { useState, useMemo } from 'react';
import SidebarBible from '../components/SidebarBible';
import VerseGrid from '../components/VerseGrid';
import PreviewPanel from '../components/PreviewPanel';
import FooterControls from '../components/FooterControls';
import styles from '../styles/BiblePresenter.module.css';
import { theme } from '../styles/theme';
import { MOCK_VERSES } from '../data/mockVerses';

const BiblePresenterPage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<string>('Gênesis');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  const selectedVerseText = useMemo(() => {
    if (!selectedVerse || !MOCK_VERSES[selectedBook]?.[selectedChapter]) {
      return null;
    }
    const verse = MOCK_VERSES[selectedBook][selectedChapter].find(
      (v) => v.number === selectedVerse
    );
    return verse?.text || null;
  }, [selectedBook, selectedChapter, selectedVerse]);

  const handleBookSelect = (book: string) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setSelectedVerse(null);
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
    setSelectedVerse(null);
  };

  const handleVerseSelect = (verse: number) => {
    setSelectedVerse(verse);
  };

  const handleLive = () => {
    setIsLive(!isLive);
  };

  const handleBlank = () => {
    setSelectedVerse(null);
    setIsLive(false);
  };

  const handleBlack = () => {
    setSelectedVerse(null);
    setIsLive(false);
  };

  const handleLogo = () => {
    // Placeholder for logo action
    console.log('Logo clicked');
  };

  const handleBack = () => {
    if (selectedVerse && selectedVerse > 1) {
      setSelectedVerse(selectedVerse - 1);
    }
  };

  const handleForward = () => {
    const verses = MOCK_VERSES[selectedBook]?.[selectedChapter] || [];
    if (selectedVerse && selectedVerse < verses.length) {
      setSelectedVerse(selectedVerse + 1);
    } else if (!selectedVerse && verses.length > 0) {
      setSelectedVerse(1);
    }
  };

  // Inject CSS variables
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', theme.background);
    root.style.setProperty('--panel', theme.panel);
    root.style.setProperty('--panel-alt', theme.panelAlt);
    root.style.setProperty('--pink', theme.pink);
    root.style.setProperty('--magenta', theme.magenta);
    root.style.setProperty('--purple-dark', theme.purpleDark);
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);
  }, []);

  return (
    <div className={styles.pageContainer}>
      <SidebarBible
        onBookSelect={handleBookSelect}
        onChapterSelect={handleChapterSelect}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
      />
      <VerseGrid
        book={selectedBook}
        chapter={selectedChapter}
        selectedVerse={selectedVerse}
        onVerseSelect={handleVerseSelect}
        onChapterChange={handleChapterSelect}
      />
      <PreviewPanel
        book={selectedBook}
        chapter={selectedChapter}
        verse={selectedVerse}
        verseText={selectedVerseText}
        isLive={isLive}
      />
      <FooterControls
        onBlank={handleBlank}
        onBlack={handleBlack}
        onLogo={handleLogo}
        onBack={handleBack}
        onForward={handleForward}
        onLive={handleLive}
        isLive={isLive}
      />
    </div>
  );
};

export default BiblePresenterPage;

