import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/BiblePresenter.module.css';

interface SidebarBibleProps {
  onBookSelect: (book: string) => void;
  onChapterSelect: (chapter: number) => void;
  selectedBook: string;
  selectedChapter: number;
}

const BIBLE_BOOKS = [
  'Gênesis',
  'Êxodo',
  'Levítico',
  'Números',
  'Deuteronômio',
  'Josué',
  'Juízes',
  'Rute',
  '1 Samuel',
  '2 Samuel',
  '1 Reis',
  '2 Reis',
  '1 Crônicas',
  '2 Crônicas',
  'Esdras',
  'Neemias',
  'Ester',
  'Jó',
  'Salmos',
  'Provérbios',
  'Eclesiastes',
  'Cânticos',
  'Isaías',
  'Jeremias',
  'Lamentações',
  'Ezequiel',
  'Daniel',
  'Oséias',
  'Joel',
  'Amós',
  'Obadias',
  'Jonas',
  'Miquéias',
  'Naum',
  'Habacuque',
  'Sofonias',
  'Ageu',
  'Zacarias',
  'Malaquias',
  'Mateus',
  'Marcos',
  'Lucas',
  'João',
  'Atos',
  'Romanos',
  '1 Coríntios',
  '2 Coríntios',
  'Gálatas',
  'Efésios',
  'Filipenses',
  'Colossenses',
  '1 Tessalonicenses',
  '2 Tessalonicenses',
  '1 Timóteo',
  '2 Timóteo',
  'Tito',
  'Filemom',
  'Hebreus',
  'Tiago',
  '1 Pedro',
  '2 Pedro',
  '1 João',
  '2 João',
  '3 João',
  'Judas',
  'Apocalipse',
];

const BIBLE_VERSIONS = ['ARA', 'NVI'];

const SidebarBible: React.FC<SidebarBibleProps> = ({
  onBookSelect,
  onChapterSelect,
  selectedBook,
  selectedChapter,
}) => {
  const { t } = useTranslation();
  const [selectedVersion, setSelectedVersion] = useState<string>('ARA');

  const renderChapterButtons = () => {
    const buttons = [];
    const totalChapters = 50; // Mock: assume max 50 chapters

    for (let i = 1; i <= totalChapters; i += 10) {
      const end = Math.min(i + 9, totalChapters);
      const label = i === end ? `${i}` : `${i}-${end}`;

      buttons.push(
        <button
          key={i}
          className={`${styles.chapterButton} ${
            selectedChapter >= i && selectedChapter <= end ? styles.chapterButtonActive : ''
          }`}
          onClick={() => onChapterSelect(i)}
        >
          {label}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <select
          className={styles.versionSelect}
          value={selectedVersion}
          onChange={(e) => setSelectedVersion(e.target.value)}
        >
          {BIBLE_VERSIONS.map((version) => (
            <option key={version} value={version}>
              {version}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.booksList}>
        {BIBLE_BOOKS.map((book) => (
          <div
            key={book}
            className={`${styles.bookItem} ${selectedBook === book ? styles.bookItemActive : ''}`}
            onClick={() => onBookSelect(book)}
          >
            {book}
          </div>
        ))}
      </div>

      {selectedBook && (
        <div className={styles.chapterSelector}>
          <div className={styles.chapterSelectorTitle}>{t('bible.chapters')}</div>
          <div className={styles.chapterButtons}>{renderChapterButtons()}</div>
        </div>
      )}
    </div>
  );
};

export default SidebarBible;
