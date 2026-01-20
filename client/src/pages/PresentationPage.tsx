import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ListSidebar,
  SlideVisualization,
  TopControls,
  SlidesList,
  PresentationLayersPanel,
} from '../components/Presentation';
import FooterControls from '../components/FooterControls';
import {
  Slide,
  Song,
  MediaFile,
  Announcement,
  SlideLayer,
  PresentationTheme,
} from '../types/presentation';
import styles from '../styles/PresentationPage.module.css';

const PresentationPage: React.FC = () => {
  const { t } = useTranslation();

  // Mock data - in production, this would come from API/state management
  const [songs] = useState<Song[]>([
    {
      id: '1',
      title: 'Amazing Grace',
      artist: 'John Newton',
      lyrics: [
        'Amazing grace, how sweet the sound',
        'That saved a wretch like me',
        'I once was lost, but now am found',
        'Was blind, but now I see',
      ],
    },
  ]);

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [announcements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Welcome',
      content: 'Welcome to our service today!',
      date: new Date().toLocaleDateString(),
    },
  ]);

  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'preview' | 'grid' | 'timeline'>('preview');
  const [_showLogo, setShowLogo] = useState<boolean>(false);
  const [_isBlankScreen, setIsBlankScreen] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [activeThemeId, setActiveThemeId] = useState<string>('dark');

  const themes: PresentationTheme[] = [
    {
      id: 'dark',
      name: t('presentation.themes.dark'),
      backgroundColor: '#0E0E14',
      textColor: '#F5F5FA',
      accentColor: '#E91E63',
    },
    {
      id: 'light',
      name: t('presentation.themes.light'),
      backgroundColor: '#FFFFFF',
      textColor: '#1A1A1A',
      accentColor: '#E91E63',
    },
    {
      id: 'gradient',
      name: t('presentation.themes.gradient'),
      backgroundColor: '#1A1A2E',
      textColor: '#F5F5FA',
      accentColor: '#FF4D8D',
    },
  ];

  const selectedSlide = slides.find((s) => s.id === selectedSlideId) || null;
  const _currentSlide = slides[currentSlideIndex] || null;

  // Song handlers
  const handleSongSelect = useCallback((song: Song) => {
    // eslint-disable-next-line no-console
    console.log('Song selected:', song);
  }, []);

  const handleGenerateSlides = useCallback(
    (song: Song) => {
      const newSlides: Slide[] = song.lyrics.map((lyric, index) => ({
        id: `slide-${Date.now()}-${index}`,
        title: `${song.title} - Verse ${index + 1}`,
        layers: [
          {
            id: `layer-${Date.now()}-${index}-lyrics`,
            type: 'lyrics' as const,
            visible: true,
            locked: false,
            content: `<p>${lyric}</p>`,
            style: {
              fontSize: 32,
              fontFamily: 'Arial',
              color: '#FFFFFF',
              textAlign: 'center' as const,
            },
          },
        ],
        order: slides.length + index,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      setSlides((prev) => [...prev, ...newSlides]);
      if (newSlides.length > 0) {
        setSelectedSlideId(newSlides[0].id);
        setCurrentSlideIndex(slides.length);
      }
    },
    [slides]
  );

  // Media handlers
  const handleMediaLoad = useCallback((file: File) => {
    const fileType = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : 'audio';

    const newMedia: MediaFile = {
      id: `media-${Date.now()}`,
      name: file.name,
      type: fileType,
      url: URL.createObjectURL(file),
    };

    setMediaFiles((prev) => [...prev, newMedia]);
  }, []);

  const handleMediaSelect = useCallback((media: MediaFile) => {
    // Replace slides with slides generated from the selected media
    // This ensures idempotent behavior - clicking the same media multiple times
    // will always result in the same slide set

    let newSlides: Slide[] = [];

    if (media.type === 'image') {
      // For images, create a single slide with the image as background
      newSlides = [
        {
          id: `slide-${media.id}-${Date.now()}`,
          title: media.name,
          layers: [
            {
              id: `layer-${media.id}-background`,
              type: 'background' as const,
              visible: true,
              locked: false,
              content: '',
              style: {
                fontSize: 32,
                fontFamily: 'Arial',
                color: '#FFFFFF',
                textAlign: 'center' as const,
              },
            },
          ],
          backgroundMediaId: media.id,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    } else if (media.type === 'video') {
      // For videos, create a single slide with the video as background
      newSlides = [
        {
          id: `slide-${media.id}-${Date.now()}`,
          title: media.name,
          layers: [
            {
              id: `layer-${media.id}-background`,
              type: 'background' as const,
              visible: true,
              locked: false,
              content: '',
              style: {
                fontSize: 32,
                fontFamily: 'Arial',
                color: '#FFFFFF',
                textAlign: 'center' as const,
              },
            },
          ],
          backgroundMediaId: media.id,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    } else if (media.type === 'audio') {
      // For audio, create a slide with audio metadata
      newSlides = [
        {
          id: `slide-${media.id}-${Date.now()}`,
          title: media.name,
          layers: [
            {
              id: `layer-${media.id}-lyrics`,
              type: 'lyrics' as const,
              visible: true,
              locked: false,
              content: `<p>${media.name}</p>`,
              style: {
                fontSize: 32,
                fontFamily: 'Arial',
                color: '#FFFFFF',
                textAlign: 'center' as const,
              },
            },
          ],
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }

    // Replace all slides with the new ones
    setSlides(newSlides);

    // Update selected media
    setSelectedMediaId(media.id);

    // Select the first slide if available
    if (newSlides.length > 0) {
      setSelectedSlideId(newSlides[0].id);
      setCurrentSlideIndex(0);
    } else {
      setSelectedSlideId(null);
      setCurrentSlideIndex(0);
    }
  }, []);

  const handleBackgroundVideoSelect = useCallback((slideId: string, mediaId: string) => {
    setSlides((prev) =>
      prev.map((slide) => (slide.id === slideId ? { ...slide, backgroundMediaId: mediaId } : slide))
    );
  }, []);

  // Announcement handlers
  const handleAnnouncementSelect = useCallback(
    (announcement: Announcement) => {
      const newSlide: Slide = {
        id: `slide-${Date.now()}`,
        title: announcement.title,
        layers: [
          {
            id: `layer-${Date.now()}-announcement`,
            type: 'announcement' as const,
            visible: true,
            locked: false,
            content: `<p>${announcement.content}</p>`,
            style: {
              fontSize: 24,
              fontFamily: 'Arial',
              color: '#FFFFFF',
              textAlign: 'center' as const,
            },
          },
        ],
        order: slides.length,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSlides((prev) => [...prev, newSlide]);
      setSelectedSlideId(newSlide.id);
      setCurrentSlideIndex(slides.length);
    },
    [slides]
  );

  // Slide handlers
  const handleSlideCreate = useCallback(() => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: t('presentation.slide.newSlide'),
      layers: [
        {
          id: `layer-${Date.now()}`,
          type: 'lyrics' as const,
          visible: true,
          locked: false,
          content: `<p>${t('presentation.slide.clickToEdit')}</p>`,
          style: {
            fontSize: 32,
            fontFamily: 'Arial',
            color: '#FFFFFF',
            textAlign: 'center' as const,
          },
        },
      ],
      order: slides.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSlides((prev) => [...prev, newSlide]);
    setSelectedSlideId(newSlide.id);
    setCurrentSlideIndex(slides.length);
  }, [slides, t]);

  const handleSlideSelect = useCallback(
    (slideId: string) => {
      setSelectedSlideId(slideId);
      const index = slides.findIndex((s) => s.id === slideId);
      if (index !== -1) {
        setCurrentSlideIndex(index);
      }
    },
    [slides]
  );

  const handleSlideEdit = useCallback((slideId: string) => {
    setSelectedSlideId(slideId);
    setViewMode('preview');
  }, []);

  const handleSlideReorder = useCallback((reorderedSlides: Slide[]) => {
    const updatedSlides = reorderedSlides.map((slide, index) => ({
      ...slide,
      order: index,
    }));
    setSlides(updatedSlides);
  }, []);

  const handleSlideDelete = useCallback(
    (slideId: string) => {
      setSlides((prev) => {
        const filtered = prev.filter((s) => s.id !== slideId);
        if (selectedSlideId === slideId) {
          setSelectedSlideId(filtered.length > 0 ? filtered[0].id : null);
          setCurrentSlideIndex(0);
        }
        return filtered;
      });
    },
    [selectedSlideId]
  );

  const handleDeleteAllSlides = useCallback(() => {
    setSlides([]);
    setSelectedSlideId(null);
    setCurrentSlideIndex(0);
    setSelectedMediaId(null);
  }, []);

  const handleSlideDuplicate = useCallback(
    (slideId: string) => {
      const slide = slides.find((s) => s.id === slideId);
      if (slide) {
        const duplicatedSlide: Slide = {
          ...slide,
          id: `slide-${Date.now()}`,
          title: `${slide.title} (Copy)`,
          layers: slide.layers.map((layer) => ({
            ...layer,
            id: `layer-${Date.now()}-${Math.random()}`,
          })),
          order: slides.length,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setSlides((prev) => [...prev, duplicatedSlide]);
      }
    },
    [slides]
  );

  // Layer handlers
  const handleLayerSelect = useCallback((layerId: string) => {
    // Layer selection logic
    // eslint-disable-next-line no-console
    console.log('Layer selected:', layerId);
  }, []);

  const handleLayerToggleVisibility = useCallback(
    (layerId: string) => {
      if (!selectedSlide) return;
      setSlides((prev) =>
        prev.map((slide) =>
          slide.id === selectedSlide.id
            ? {
                ...slide,
                layers: slide.layers.map((layer) =>
                  layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
                ),
              }
            : slide
        )
      );
    },
    [selectedSlide]
  );

  const handleLayerToggleLock = useCallback(
    (layerId: string) => {
      if (!selectedSlide) return;
      setSlides((prev) =>
        prev.map((slide) =>
          slide.id === selectedSlide.id
            ? {
                ...slide,
                layers: slide.layers.map((layer) =>
                  layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
                ),
              }
            : slide
        )
      );
    },
    [selectedSlide]
  );

  // Control handlers
  const handleLive = useCallback(() => {
    setIsLive((prev) => !prev);
  }, []);

  const handleBlank = useCallback(() => {
    setSelectedSlideId(null);
    setIsLive(false);
    setIsBlankScreen(true);
  }, []);

  const handleBlack = useCallback(() => {
    setSelectedSlideId(null);
    setIsLive(false);
    setIsBlankScreen(true);
  }, []);

  const handleLogo = useCallback(() => {
    setShowLogo((prev) => !prev);
  }, []);

  const handleBack = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      setSelectedSlideId(slides[currentSlideIndex - 1].id);
    }
  }, [currentSlideIndex, slides]);

  const handleForward = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      setSelectedSlideId(slides[currentSlideIndex + 1].id);
    } else if (!selectedSlideId && slides.length > 0) {
      setCurrentSlideIndex(0);
      setSelectedSlideId(slides[0].id);
    }
  }, [currentSlideIndex, slides, selectedSlideId]);

  const handleFormatChange = useCallback(
    (format: SlideLayer['style']) => {
      if (!selectedSlide) return;
      setSlides((prev) =>
        prev.map((slide) =>
          slide.id === selectedSlide.id
            ? {
                ...slide,
                layers: slide.layers.map((layer) =>
                  layer.id === selectedSlide.layers[0]?.id
                    ? { ...layer, style: { ...layer.style, ...format } }
                    : layer
                ),
              }
            : slide
        )
      );
    },
    [selectedSlide]
  );

  const currentFormat = selectedSlide?.layers[0]?.style || {};

  return (
    <div className={styles.presentationPage}>
      {/* Top Controls */}
      <TopControls onFormatChange={handleFormatChange} currentFormat={currentFormat} />

      {/* Secondary List Sidebar */}
      <ListSidebar
        songs={songs}
        mediaFiles={mediaFiles}
        announcements={announcements}
        onSongSelect={handleSongSelect}
        onMediaLoad={handleMediaLoad}
        onMediaSelect={handleMediaSelect}
        onAnnouncementSelect={handleAnnouncementSelect}
        onGenerateSlides={handleGenerateSlides}
        onBackgroundVideoSelect={handleBackgroundVideoSelect}
        selectedSlideId={selectedSlideId}
        selectedMediaId={selectedMediaId}
      />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* View Mode Toggle */}
        <div className={styles.viewModeToggle}>
          <button
            className={`${styles.viewModeButton} ${viewMode === 'preview' ? styles.active : ''}`}
            onClick={() => setViewMode('preview')}
          >
            {t('presentation.viewMode.preview')}
          </button>
          <button
            className={`${styles.viewModeButton} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
          >
            {t('presentation.viewMode.grid')}
          </button>
          <button
            className={`${styles.viewModeButton} ${viewMode === 'timeline' ? styles.active : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            {t('presentation.viewMode.timeline')}
          </button>
        </div>

        {/* Slide Visualization */}
        <div className={styles.visualizationArea}>
          <SlideVisualization
            slide={viewMode === 'preview' ? selectedSlide : null}
            mediaFiles={mediaFiles}
            viewMode={viewMode}
            onSlideEdit={handleSlideEdit}
            onSlideCreate={handleSlideCreate}
            slides={slides}
            onSlideSelect={handleSlideSelect}
          />
        </div>
      </div>

      {/* Presentation Layers Panel */}
      {selectedSlide ? (
        <PresentationLayersPanel
          layers={selectedSlide.layers}
          activeLayerId={selectedSlide.layers[0]?.id || null}
          onLayerSelect={handleLayerSelect}
          onLayerToggleVisibility={handleLayerToggleVisibility}
          onLayerToggleLock={handleLayerToggleLock}
        />
      ) : (
        <div className={styles.placeholderLayersPanel} />
      )}

      {/* Slides List Panel - Horizontal */}
      <SlidesList
        slides={slides}
        themes={themes}
        selectedSlideId={selectedSlideId}
        activeThemeId={activeThemeId}
        mediaFiles={mediaFiles}
        onSlideSelect={handleSlideSelect}
        onSlideReorder={handleSlideReorder}
        onThemeSelect={setActiveThemeId}
        onSlideDelete={handleSlideDelete}
        onSlideDuplicate={handleSlideDuplicate}
        onDeleteAllSlides={handleDeleteAllSlides}
      />

      {/* Footer Controls */}
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

export default PresentationPage;
