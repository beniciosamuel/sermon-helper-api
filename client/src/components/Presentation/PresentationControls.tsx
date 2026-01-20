import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PresentationControls.module.css';

interface PresentationControlsProps {
  onLogoToggle: () => void;
  onBlankScreen: () => void;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  onFormatChange?: (format: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontWeight?: 'normal' | 'bold' | 'lighter';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
  }) => void;
  showLogo: boolean;
  isBlankScreen: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentFormat?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontWeight?: 'normal' | 'bold' | 'lighter';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
  };
}

const PresentationControls: React.FC<PresentationControlsProps> = ({
  onLogoToggle,
  onBlankScreen,
  onNextSlide,
  onPreviousSlide,
  onFormatChange,
  showLogo,
  isBlankScreen,
  canGoNext,
  canGoPrevious,
  currentFormat = {},
}) => {
  const { t } = useTranslation();
  const [showFormatPanel, setShowFormatPanel] = React.useState(false);

  const handleFormatChange = (key: string, value: string | number) => {
    if (onFormatChange) {
      onFormatChange({ ...currentFormat, [key]: value });
    }
  };

  return (
    <>
      {/* Formatting Panel - Top */}
      {showFormatPanel && (
        <div className={styles.formatPanel}>
          <div className={styles.formatGroup}>
            <label>{t('presentation.controls.fontSize')}</label>
            <select
              value={currentFormat.fontSize || 24}
              onChange={(e) => handleFormatChange('fontSize', parseInt(e.target.value))}
            >
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
          </div>

          <div className={styles.formatGroup}>
            <label>{t('presentation.controls.fontFamily')}</label>
            <select
              value={currentFormat.fontFamily || 'Arial'}
              onChange={(e) => handleFormatChange('fontFamily', e.target.value)}
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>

          <div className={styles.formatGroup}>
            <label>{t('presentation.controls.textAlign')}</label>
            <div className={styles.alignButtons}>
              <button
                className={`${styles.alignButton} ${
                  currentFormat.textAlign === 'left' ? styles.active : ''
                }`}
                onClick={() => handleFormatChange('textAlign', 'left')}
                title={t('presentation.controls.alignLeft')}
              >
                ⬅
              </button>
              <button
                className={`${styles.alignButton} ${
                  currentFormat.textAlign === 'center' ? styles.active : ''
                }`}
                onClick={() => handleFormatChange('textAlign', 'center')}
                title={t('presentation.controls.center')}
              >
                ⬌
              </button>
              <button
                className={`${styles.alignButton} ${
                  currentFormat.textAlign === 'right' ? styles.active : ''
                }`}
                onClick={() => handleFormatChange('textAlign', 'right')}
                title={t('presentation.controls.alignRight')}
              >
                ➡
              </button>
            </div>
          </div>

          <div className={styles.formatGroup}>
            <label>{t('presentation.controls.textStyle')}</label>
            <div className={styles.styleButtons}>
              <button
                className={`${styles.styleButton} ${
                  currentFormat.fontWeight === 'bold' ? styles.active : ''
                }`}
                onClick={() =>
                  handleFormatChange(
                    'fontWeight',
                    currentFormat.fontWeight === 'bold' ? 'normal' : 'bold'
                  )
                }
                title={t('presentation.controls.bold')}
              >
                <strong>B</strong>
              </button>
              <button
                className={`${styles.styleButton} ${
                  currentFormat.fontStyle === 'italic' ? styles.active : ''
                }`}
                onClick={() =>
                  handleFormatChange(
                    'fontStyle',
                    currentFormat.fontStyle === 'italic' ? 'normal' : 'italic'
                  )
                }
                title={t('presentation.controls.italic')}
              >
                <em>I</em>
              </button>
              <button
                className={`${styles.styleButton} ${
                  currentFormat.textDecoration === 'underline' ? styles.active : ''
                }`}
                onClick={() =>
                  handleFormatChange(
                    'textDecoration',
                    currentFormat.textDecoration === 'underline' ? 'none' : 'underline'
                  )
                }
                title={t('presentation.controls.underline')}
              >
                <u>U</u>
              </button>
            </div>
          </div>

          <div className={styles.formatGroup}>
            <label>{t('presentation.controls.textColor')}</label>
            <input
              type="color"
              value={currentFormat.color || '#FFFFFF'}
              onChange={(e) => handleFormatChange('color', e.target.value)}
              className={styles.colorInput}
            />
          </div>

          <button className={styles.closeFormatButton} onClick={() => setShowFormatPanel(false)}>
            ✕
          </button>
        </div>
      )}

      {/* Control Buttons - Bottom */}
      <div className={styles.controls}>
        <button
          className={styles.formatToggleButton}
          onClick={() => setShowFormatPanel(!showFormatPanel)}
          title={t('presentation.controls.formatting')}
        >
          {t('presentation.controls.formatting')}
        </button>

        <div className={styles.controlGroup}>
          <button
            className={`${styles.controlButton} ${showLogo ? styles.active : ''}`}
            onClick={onLogoToggle}
            title={t('presentation.controls.toggleLogo')}
          >
            🏷️ {t('presentation.controls.logo')}
          </button>

          <button
            className={`${styles.controlButton} ${isBlankScreen ? styles.active : ''}`}
            onClick={onBlankScreen}
            title={t('presentation.controls.blankScreen')}
          >
            ⬛ {t('presentation.controls.blank')}
          </button>
        </div>

        <div className={styles.navigationGroup}>
          <button
            className={styles.navButton}
            onClick={onPreviousSlide}
            disabled={!canGoPrevious}
            title={t('presentation.controls.previous')}
          >
            ⬅ {t('presentation.controls.previous')}
          </button>
          <button
            className={styles.navButton}
            onClick={onNextSlide}
            disabled={!canGoNext}
            title={t('presentation.controls.next')}
          >
            {t('presentation.controls.next')} ➡
          </button>
        </div>
      </div>
    </>
  );
};

export default PresentationControls;
