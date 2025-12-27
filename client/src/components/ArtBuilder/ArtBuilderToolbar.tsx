import React, { useRef, useEffect } from 'react';
import styles from '../../styles/PresentationControl.module.css';

interface ArtBuilderToolbarProps {
  onFormatChange?: (format: any) => void;
  onResolutionChange?: (resolution: string) => void;
  onAspectRatioChange?: (ratio: string) => void;
  onBackgroundToggle?: () => void;
  onPreviewToggle?: () => void;
}

const ArtBuilderToolbar: React.FC<ArtBuilderToolbarProps> = ({
  onFormatChange,
  onResolutionChange,
  onAspectRatioChange,
  onBackgroundToggle,
  onPreviewToggle,
}) => {
  const quillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Quill.js will be initialized here when the library is installed
    // For now, we'll create a mock toolbar
    if (quillRef.current) {
      // Placeholder for Quill initialization
    }
  }, []);

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        {/* Rich Text Formatting Controls */}
        <div className={styles.formatGroup}>
          <button className={styles.toolbarButton} title="Negrito">
            <strong>B</strong>
          </button>
          <button className={styles.toolbarButton} title="Itálico">
            <em>I</em>
          </button>
          <button className={styles.toolbarButton} title="Sublinhado">
            <u>S</u>
          </button>
          <div className={styles.toolbarSeparator} />
          <button className={styles.toolbarButton} title="Alinhar à esquerda">
            ⬅
          </button>
          <button className={styles.toolbarButton} title="Centralizar">
            ⬌
          </button>
          <button className={styles.toolbarButton} title="Alinhar à direita">
            ➡
          </button>
          <div className={styles.toolbarSeparator} />
          <select className={styles.fontSizeSelect} defaultValue="24">
            <option value="12">12</option>
            <option value="14">14</option>
            <option value="16">16</option>
            <option value="18">18</option>
            <option value="20">20</option>
            <option value="24">24</option>
            <option value="28">28</option>
            <option value="32">32</option>
            <option value="36">36</option>
            <option value="48">48</option>
            <option value="64">64</option>
          </select>
          <div className={styles.toolbarSeparator} />
          <button className={styles.toolbarButton} title="Cor do texto">
            <span className={styles.colorButton}>
              A
              <span className={styles.colorIndicator} style={{ backgroundColor: 'var(--accent)' }} />
            </span>
          </button>
          <button className={styles.toolbarButton} title="Limpar formatação">
            🧹
          </button>
        </div>
      </div>

      <div className={styles.toolbarRight}>
        {/* Art Builder Controls */}
        <select
          className={styles.controlSelect}
          defaultValue="1920x1080"
          onChange={(e) => onResolutionChange?.(e.target.value)}
        >
          <option value="1920x1080">1920 × 1080</option>
          <option value="1280x720">1280 × 720</option>
          <option value="3840x2160">3840 × 2160</option>
        </select>
        <select
          className={styles.controlSelect}
          defaultValue="16:9"
          onChange={(e) => onAspectRatioChange?.(e.target.value)}
        >
          <option value="16:9">16:9</option>
          <option value="4:3">4:3</option>
          <option value="21:9">21:9</option>
        </select>
        <button
          className={styles.toolbarButton}
          onClick={onBackgroundToggle}
          title="Alternar fundo"
        >
          🖼️
        </button>
        <div className={styles.toolbarSeparator} />
        <button
          className={`${styles.toolbarButton} ${styles.previewButton}`}
          onClick={onPreviewToggle}
          title="Alternar visualização"
        >
          👁️ Preview
        </button>
      </div>
    </div>
  );
};

export default ArtBuilderToolbar;

