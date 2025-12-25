import React from 'react';
import styles from '../styles/BiblePresenter.module.css';

interface PreviewPanelProps {
  book: string;
  chapter: number;
  verse: number | null;
  verseText: string | null;
  isLive: boolean;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  book,
  chapter,
  verse,
  verseText,
  isLive,
}) => {
  const highlightKeyword = (text: string): React.ReactNode => {
    // Simple keyword highlighting - highlight words like "Deus", "Senhor", "Jesus"
    const keywords = ['Deus', 'Senhor', 'Jesus', 'Cristo', 'Espírito'];
    const words = text.split(' ');
    
    return words.map((word, index) => {
      const cleanWord = word.replace(/[.,;:!?]/g, '');
      const isKeyword = keywords.some(
        (keyword) => cleanWord.toLowerCase() === keyword.toLowerCase()
      );
      
      return (
        <React.Fragment key={index}>
          {isKeyword ? (
            <span className={styles.previewTextHighlight}>{word}</span>
          ) : (
            word
          )}
          {index < words.length - 1 && ' '}
        </React.Fragment>
      );
    });
  };

  const reference = verse ? `${book} ${chapter}:${verse}` : '';

  return (
    <div className={styles.previewPanel}>
      <div className={styles.previewSection}>
        <div className={styles.sectionTitle}>Prévia ao Vivo</div>
        <div className={styles.previewArea}>
          {verseText ? (
            <>
              <p className={styles.previewText}>
                {highlightKeyword(verseText)}
              </p>
              {reference && (
                <div className={styles.previewReference}>{reference}</div>
              )}
            </>
          ) : (
            <p className={styles.previewText} style={{ opacity: 0.3 }}>
              Selecione um versículo
            </p>
          )}
        </div>
      </div>
      
      <div className={styles.previewSection}>
        <div className={styles.sectionTitle}>Saída ao Vivo</div>
        <div
          className={`${styles.previewArea} ${
            isLive ? styles.previewAreaLive : ''
          }`}
        >
          {isLive && verseText ? (
            <>
              <p className={styles.previewText}>
                {highlightKeyword(verseText)}
              </p>
              {reference && (
                <div className={styles.previewReference}>{reference}</div>
              )}
            </>
          ) : (
            <p className={styles.previewText} style={{ opacity: 0.3 }}>
              {isLive ? 'AO VIVO' : 'Aguardando...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;

