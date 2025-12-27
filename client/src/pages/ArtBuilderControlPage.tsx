import React, { useState } from 'react';
import ArtBuilderToolbar from '../components/ArtBuilder/ArtBuilderToolbar';
import LayerPanel, { ArtBuilderLayer } from '../components/ArtBuilder/LayerPanel';
import PreviewCanvas from '../components/ArtBuilder/PreviewCanvas';
import ThemeSelector, { ArtBuilderTheme } from '../components/ArtBuilder/ThemeSelector';
import styles from '../styles/PresentationControl.module.css';

// Mock themes
const MOCK_THEMES: ArtBuilderTheme[] = [
  {
    id: 'dark',
    name: 'Escuro',
    backgroundColor: '#0E0E14',
    textColor: '#F5F5FA',
    accentColor: '#E91E63',
  },
  {
    id: 'light',
    name: 'Claro',
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    accentColor: '#E91E63',
  },
  {
    id: 'gradient',
    name: 'Gradiente',
    backgroundColor: '#1A1A2E',
    textColor: '#F5F5FA',
    accentColor: '#FF4D8D',
  },
  {
    id: 'warm',
    name: 'Quente',
    backgroundColor: '#2D1B1B',
    textColor: '#FFE5D9',
    accentColor: '#FF6B6B',
  },
  {
    id: 'cool',
    name: 'Frio',
    backgroundColor: '#0A1929',
    textColor: '#E3F2FD',
    accentColor: '#42A5F5',
  },
];

const ArtBuilderControlPage: React.FC = () => {
  const [layers, setLayers] = useState<ArtBuilderLayer[]>([
    {
      id: '1',
      name: 'Camada 1',
      visible: true,
      locked: false,
      content: '<p>Clique para editar</p>',
    },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>('1');
  const [activeThemeId, setActiveThemeId] = useState<string>('dark');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  const handleLayerSelect = (layerId: string) => {
    setActiveLayerId(layerId);
  };

  const handleLayerToggleVisibility = (layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const handleLayerToggleLock = (layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
    );
  };

  const handleLayerRename = (layerId: string, newName: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, name: newName } : layer
      )
    );
  };

  const handleLayerCreate = () => {
    const newLayer: ArtBuilderLayer = {
      id: Date.now().toString(),
      name: `Camada ${layers.length + 1}`,
      visible: true,
      locked: false,
      content: '<p>Nova camada</p>',
    };
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const handleLayerDelete = (layerId: string) => {
    setLayers((prev) => {
      const filtered = prev.filter((layer) => layer.id !== layerId);
      if (activeLayerId === layerId) {
        setActiveLayerId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const handleCanvasClick = () => {
    // Focus on active layer or create new one
    if (activeLayerId) {
      // Layer already selected
    } else if (layers.length === 0) {
      handleLayerCreate();
    }
  };

  const handleLayerClick = (layerId: string) => {
    setActiveLayerId(layerId);
  };

  const handleLayerContentChange = (layerId: string, content: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, content } : layer
      )
    );
  };

  const handleThemeSelect = (themeId: string) => {
    setActiveThemeId(themeId);
  };

  const activeTheme = MOCK_THEMES.find((t) => t.id === activeThemeId) || MOCK_THEMES[0];

  return (
    <div className={styles.pageContainer}>
      <ArtBuilderToolbar
        onResolutionChange={(res) => console.log('Resolution:', res)}
        onAspectRatioChange={(ratio) => setAspectRatio(ratio)}
        onBackgroundToggle={() => console.log('Background toggled')}
        onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
      />

      <div className={styles.contentArea}>
        <div className={styles.mainContent}>
          <PreviewCanvas
            layers={layers}
            activeLayerId={activeLayerId}
            aspectRatio={aspectRatio}
            onCanvasClick={handleCanvasClick}
            onLayerClick={handleLayerClick}
            onLayerContentChange={handleLayerContentChange}
          />
        </div>

        <LayerPanel
          layers={layers}
          activeLayerId={activeLayerId}
          onLayerSelect={handleLayerSelect}
          onLayerToggleVisibility={handleLayerToggleVisibility}
          onLayerToggleLock={handleLayerToggleLock}
          onLayerRename={handleLayerRename}
          onLayerCreate={handleLayerCreate}
          onLayerDelete={handleLayerDelete}
        />
      </div>

      <ThemeSelector
        themes={MOCK_THEMES}
        activeThemeId={activeThemeId}
        onThemeSelect={handleThemeSelect}
      />
    </div>
  );
};

export default ArtBuilderControlPage;

