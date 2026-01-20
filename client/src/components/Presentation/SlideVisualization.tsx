import React from 'react';
import { useTranslation } from 'react-i18next';
import { Slide, MediaFile } from '../../types/presentation';
import styles from './SlideVisualization.module.css';

interface SlideVisualizationProps {
  slide: Slide | null;
  mediaFiles: MediaFile[];
  viewMode: 'preview' | 'grid' | 'timeline';
  onSlideEdit: (slideId: string) => void;
  onSlideCreate: () => void;
  slides?: Slide[];
  onSlideSelect?: (slideId: string) => void;
}

const SlideVisualization: React.FC<SlideVisualizationProps> = ({
  slide,
  mediaFiles,
  viewMode,
  onSlideEdit,
  onSlideCreate,
  slides = [],
  onSlideSelect,
}) => {
  const { t } = useTranslation();

  if (viewMode === 'grid') {
    return (
      <div className={styles.gridView}>
        <div className={styles.gridHeader}>
          <h3>{t('presentation.visualization.allSlides')}</h3>
          <button className={styles.createButton} onClick={onSlideCreate}>
            {t('presentation.visualization.createSlide')}
          </button>
        </div>
        <div className={styles.gridContainer}>
          {slides.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t('presentation.visualization.noSlides')}</p>
              <button className={styles.createButton} onClick={onSlideCreate}>
                {t('presentation.visualization.createFirstSlide')}
              </button>
            </div>
          ) : (
            slides.map((s) => (
              <div key={s.id} className={styles.gridItem} onClick={() => onSlideSelect?.(s.id)}>
                <div className={styles.gridItemPreview}>
                  <SlidePreview slide={s} mediaFiles={mediaFiles} />
                </div>
                <p className={styles.gridItemTitle}>{s.title}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'timeline') {
    return (
      <div className={styles.timelineView}>
        <div className={styles.timelineHeader}>
          <h3>{t('presentation.visualization.timeline')}</h3>
          <button className={styles.createButton} onClick={onSlideCreate}>
            {t('presentation.visualization.createSlide')}
          </button>
        </div>
        <div className={styles.timelineContainer}>
          {slides.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t('presentation.visualization.noSlides')}</p>
            </div>
          ) : (
            slides.map((s, index) => (
              <div key={s.id} className={styles.timelineItem} onClick={() => onSlideSelect?.(s.id)}>
                <div className={styles.timelineNumber}>{index + 1}</div>
                <div className={styles.timelinePreview}>
                  <SlidePreview slide={s} mediaFiles={mediaFiles} />
                </div>
                <div className={styles.timelineInfo}>
                  <p className={styles.timelineTitle}>{s.title}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Preview mode - single slide
  return (
    <div className={styles.previewView}>
      {slide ? (
        <div className={styles.slidePreviewContainer}>
          <div className={styles.slidePreview}>
            <SlidePreview slide={slide} mediaFiles={mediaFiles} />
          </div>
          <div className={styles.slideActions}>
            <button className={styles.editButton} onClick={() => onSlideEdit(slide.id)}>
              {t('presentation.visualization.edit')}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>{t('presentation.visualization.noSlideSelected')}</p>
          <button className={styles.createButton} onClick={onSlideCreate}>
            {t('presentation.visualization.createSlide')}
          </button>
        </div>
      )}
    </div>
  );
};

// Helper component for slide preview
const SlidePreview: React.FC<{
  slide: Slide;
  mediaFiles: MediaFile[];
}> = ({ slide, mediaFiles }) => {
  const backgroundMedia = slide.backgroundMediaId
    ? mediaFiles.find((m) => m.id === slide.backgroundMediaId)
    : null;

  const visibleLayers = slide.layers.filter((layer) => layer.visible);

  return (
    <div
      className={styles.slidePreviewContent}
      style={{
        backgroundImage:
          backgroundMedia?.type === 'image' ? `url(${backgroundMedia.url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {backgroundMedia?.type === 'video' && (
        <video
          className={styles.backgroundVideo}
          src={backgroundMedia.url}
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      {visibleLayers.map((layer) => (
        <div
          key={layer.id}
          className={styles.layerPreview}
          style={{
            ...layer.style,
            display: layer.visible ? 'block' : 'none',
          }}
          dangerouslySetInnerHTML={{ __html: layer.content }}
        />
      ))}
    </div>
  );
};

export default SlideVisualization;
