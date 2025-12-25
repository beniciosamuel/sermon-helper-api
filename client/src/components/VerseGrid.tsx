import React from 'react';
import styles from '../styles/BiblePresenter.module.css';
import { MOCK_VERSES } from '../data/mockVerses';

interface VerseGridProps {
  book: string;
  chapter: number;
  selectedVerse: number | null;
  onVerseSelect: (verse: number) => void;
  onChapterChange?: (chapter: number) => void;
}

const VerseGrid: React.FC<VerseGridProps> = ({
  book,
  chapter,
  selectedVerse,
  onVerseSelect,
  onChapterChange,
}) => {
  const verses = MOCK_VERSES[book]?.[chapter] || [];

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChapter = parseInt(e.target.value, 10);
    if (onChapterChange) {
      onChapterChange(newChapter);
    }
  };

  if (verses.length === 0) {
    return (
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <h1 className={styles.contentTitle}>
            {book} {chapter}
          </h1>
          <select
            className={styles.chapterSelect}
            value={chapter}
            onChange={handleChapterChange}
          >
            {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                Capítulo {num}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.verseGrid}>
          <p style={{ color: 'var(--text-secondary)', padding: '40px' }}>
            Nenhum versículo disponível para este capítulo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>
          {book} {chapter}
        </h1>
        <select
          className={styles.chapterSelect}
          value={chapter}
          onChange={handleChapterChange}
        >
          {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              Capítulo {num}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.verseGrid}>
        {verses.map((verse) => (
          <div
            key={verse.number}
            className={`${styles.verseCard} ${
              selectedVerse === verse.number ? styles.verseCardSelected : ''
            }`}
            onClick={() => onVerseSelect(verse.number)}
          >
            <p className={styles.verseText}>{verse.text}</p>
            <span className={styles.verseNumber}>{verse.number}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerseGrid;

