import React from 'react';
import { useTranslation } from 'react-i18next';
import { SlideLayer } from '../../types/presentation';
import styles from './PresentationLayersPanel.module.css';

interface PresentationLayersPanelProps {
  layers: SlideLayer[];
  activeLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerToggleVisibility: (layerId: string) => void;
  onLayerToggleLock: (layerId: string) => void;
}

const PresentationLayersPanel: React.FC<PresentationLayersPanelProps> = ({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerToggleVisibility,
  onLayerToggleLock,
}) => {
  const { t } = useTranslation();

  const getLayerTypeLabel = (type: SlideLayer['type']) => {
    switch (type) {
      case 'background':
        return t('presentation.layers.background');
      case 'lyrics':
        return t('presentation.layers.lyrics');
      case 'announcement':
        return t('presentation.layers.announcement');
      default:
        return type;
    }
  };

  const getLayerTypeIcon = (type: SlideLayer['type']) => {
    switch (type) {
      case 'background':
        return '🖼️';
      case 'lyrics':
        return '📝';
      case 'announcement':
        return '📢';
      default:
        return '📄';
    }
  };

  // Sort layers by type to maintain rendering order: background, lyrics, announcement
  const sortedLayers = [...layers].sort((a, b) => {
    const order = { background: 0, lyrics: 1, announcement: 2 };
    return (order[a.type] || 99) - (order[b.type] || 99);
  });

  return (
    <div className={styles.layersPanel}>
      <div className={styles.layersHeader}>
        <h3 className={styles.layersTitle}>{t('presentation.layers.title')}</h3>
      </div>

      <div className={styles.layersList}>
        {sortedLayers.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{t('presentation.layers.noLayers')}</p>
          </div>
        ) : (
          sortedLayers.map((layer) => (
            <div
              key={layer.id}
              className={`${styles.layerItem} ${
                activeLayerId === layer.id ? styles.layerItemActive : ''
              } ${!layer.visible ? styles.layerItemHidden : ''}`}
              onClick={() => onLayerSelect(layer.id)}
            >
              <div className={styles.layerItemContent}>
                <div className={styles.layerTypeIcon}>{getLayerTypeIcon(layer.type)}</div>

                <div className={styles.layerInfo}>
                  <p className={styles.layerType}>{getLayerTypeLabel(layer.type)}</p>
                  <p className={styles.layerPreview}>
                    {layer.content.replace(/<[^>]*>/g, '').substring(0, 30) || 'Empty layer'}
                  </p>
                </div>

                <div className={styles.layerActions}>
                  <button
                    className={styles.layerVisibilityButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerToggleVisibility(layer.id);
                    }}
                    title={
                      layer.visible
                        ? t('presentation.layers.hideLayer')
                        : t('presentation.layers.showLayer')
                    }
                  >
                    {layer.visible ? '👁️' : '👁️‍🗨️'}
                  </button>

                  <button
                    className={styles.layerLockButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerToggleLock(layer.id);
                    }}
                    title={
                      layer.locked
                        ? t('presentation.layers.unlockLayer')
                        : t('presentation.layers.lockLayer')
                    }
                  >
                    {layer.locked ? '🔒' : '🔓'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PresentationLayersPanel;

