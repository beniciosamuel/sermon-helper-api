import React from 'react';
import styles from '../../styles/PresentationControl.module.css';

export interface ArtBuilderTheme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

interface ThemeSelectorProps {
  themes: ArtBuilderTheme[];
  activeThemeId: string | null;
  onThemeSelect: (themeId: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themes,
  activeThemeId,
  onThemeSelect,
}) => {
  return (
    <div className={styles.themeSelector}>
      <div className={styles.themeSelectorHeader}>
        <h3 className={styles.themeSelectorTitle}>Temas</h3>
      </div>
      <div className={styles.themeList}>
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`${styles.themeItem} ${
              activeThemeId === theme.id ? styles.themeItemActive : ''
            }`}
            onClick={() => onThemeSelect(theme.id)}
          >
            <div
              className={styles.themePreview}
              style={{
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
              }}
            >
              <div
                className={styles.themeAccent}
                style={{ backgroundColor: theme.accentColor }}
              />
              <span className={styles.themePreviewText}>Aa</span>
            </div>
            <span className={styles.themeName}>{theme.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;

