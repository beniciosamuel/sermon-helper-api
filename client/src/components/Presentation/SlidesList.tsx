import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Slide, PresentationTheme, MediaFile } from '../../types/presentation';
import styles from './SlidesList.module.css';

interface SlidesListProps {
  slides: Slide[];
  themes: PresentationTheme[];
  selectedSlideId: string | null;
  activeThemeId: string;
  mediaFiles?: MediaFile[];
  onSlideSelect: (slideId: string) => void;
  onSlideReorder: (slides: Slide[]) => void;
  onThemeSelect: (themeId: string) => void;
  onSlideDelete: (slideId: string) => void;
  onSlideDuplicate: (slideId: string) => void;
  onDeleteAllSlides: () => void;
}

const SlidesList: React.FC<SlidesListProps> = ({
  slides,
  themes,
  selectedSlideId,
  activeThemeId,
  mediaFiles = [],
  onSlideSelect,
  onSlideReorder,
  onThemeSelect,
  onSlideDelete,
  onSlideDuplicate: _onSlideDuplicate,
  onDeleteAllSlides,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'slides' | 'themes'>('slides');
  const [draggedSlideId, setDraggedSlideId] = useState<string | null>(null);
  const [dragOverSlideId, setDragOverSlideId] = useState<string | null>(null);

  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  const handleDragStart = (e: React.DragEvent, slideId: string) => {
    setDraggedSlideId(slideId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slideId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlideId(slideId);
  };

  const handleDragLeave = () => {
    setDragOverSlideId(null);
  };

  const handleDrop = (e: React.DragEvent, targetSlideId: string) => {
    e.preventDefault();
    if (!draggedSlideId || draggedSlideId === targetSlideId) {
      setDraggedSlideId(null);
      setDragOverSlideId(null);
      return;
    }

    const draggedSlide = slides.find((s) => s.id === draggedSlideId);
    const targetSlide = slides.find((s) => s.id === targetSlideId);

    if (!draggedSlide || !targetSlide) {
      setDraggedSlideId(null);
      setDragOverSlideId(null);
      return;
    }

    const newSlides = slides.map((slide) => {
      if (slide.id === draggedSlideId) {
        return { ...slide, order: targetSlide.order };
      }
      if (slide.id === targetSlideId) {
        return { ...slide, order: draggedSlide.order };
      }
      return slide;
    });

    onSlideReorder(newSlides);
    setDraggedSlideId(null);
    setDragOverSlideId(null);
  };

  const handleDragEnd = () => {
    setDraggedSlideId(null);
    setDragOverSlideId(null);
  };

  return (
    <div className={styles.slidesList}>
      <div className={styles.slidesListHeader}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'slides' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('slides')}
          >
            {t('presentation.slidesList.title')}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'themes' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('themes')}
          >
            {t('presentation.slidesList.themes')}
          </button>
        </div>
        {activeTab === 'slides' && slides.length > 0 && (
          <button
            className={styles.deleteAllButton}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteAllSlides();
            }}
            title={t('presentation.slidesList.deleteAll')}
          >
            🗑️ {t('presentation.slidesList.deleteAll')}
          </button>
        )}
      </div>

      {activeTab === 'slides' && (
        <div className={styles.slidesContainer}>
          {sortedSlides.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t('presentation.slidesList.noSlides')}</p>
            </div>
          ) : (
            sortedSlides.map((slide) => (
              <div
                key={slide.id}
                className={`${styles.slideItem} ${
                  selectedSlideId === slide.id ? styles.slideItemSelected : ''
                } ${draggedSlideId === slide.id ? styles.slideItemDragging : ''} ${
                  dragOverSlideId === slide.id ? styles.slideItemDragOver : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, slide.id)}
                onDragOver={(e) => handleDragOver(e, slide.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slide.id)}
                onDragEnd={handleDragEnd}
                onClick={() => onSlideSelect(slide.id)}
              >
                <div className={styles.slideItemPreview}>
                  <SlidePreviewThumbnail slide={slide} mediaFiles={mediaFiles} />
                  <button
                    className={styles.deleteSlideButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSlideDelete(slide.id);
                    }}
                    title={t('presentation.slidesList.delete')}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'themes' && (
        <div className={styles.themesContainer}>
          <div className={styles.themesList}>
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
                <p className={styles.themeName}>{theme.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for slide preview thumbnail
const SlidePreviewThumbnail: React.FC<{
  slide: Slide;
  mediaFiles: MediaFile[];
}> = ({ slide, mediaFiles }) => {
  const backgroundMedia = slide.backgroundMediaId
    ? mediaFiles.find((m) => m.id === slide.backgroundMediaId)
    : null;

  const visibleLayers = slide.layers.filter((layer) => layer.visible);

  return (
    <div
      className={styles.slideThumbnail}
      style={{
        backgroundImage:
          backgroundMedia?.type === 'image' ? `url(${backgroundMedia.url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {backgroundMedia?.type === 'video' && (
        <video className={styles.thumbnailVideo} src={backgroundMedia.url} muted playsInline />
      )}
      {visibleLayers.length > 0 && (
        <div className={styles.thumbnailContent}>
          {visibleLayers[0].content.replace(/<[^>]*>/g, '').substring(0, 20) || '...'}
        </div>
      )}
    </div>
  );
};

export default SlidesList;
