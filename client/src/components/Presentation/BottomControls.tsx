import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './BottomControls.module.css';

interface BottomControlsProps {
  onLogoToggle: () => void;
  onBlankScreen: () => void;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  showLogo: boolean;
  isBlankScreen: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

const BottomControls: React.FC<BottomControlsProps> = ({
  onLogoToggle,
  onBlankScreen,
  onNextSlide,
  onPreviousSlide,
  showLogo,
  isBlankScreen,
  canGoNext,
  canGoPrevious,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.bottomControls}>
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
  );
};

export default BottomControls;

