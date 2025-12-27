import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../../styles/PresentationControl.module.css';

export interface ArtBuilderLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  content: string;
}

interface LayerPanelProps {
  layers: ArtBuilderLayer[];
  activeLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerToggleVisibility: (layerId: string) => void;
  onLayerToggleLock: (layerId: string) => void;
  onLayerRename: (layerId: string, newName: string) => void;
  onLayerCreate: () => void;
  onLayerDelete: (layerId: string) => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerToggleVisibility,
  onLayerToggleLock,
  onLayerRename,
  onLayerCreate,
  onLayerDelete,
}) => {
  const { t } = useTranslation();
  const [editingLayerId, setEditingLayerId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState<string>('');

  const handleNameEdit = (layer: ArtBuilderLayer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const handleNameSave = (layerId: string) => {
    if (editingName.trim()) {
      onLayerRename(layerId, editingName.trim());
    }
    setEditingLayerId(null);
    setEditingName('');
  };

  const handleNameCancel = () => {
    setEditingLayerId(null);
    setEditingName('');
  };

  return (
    <div className={styles.layerPanel}>
      <div className={styles.layerPanelHeader}>
        <h3 className={styles.layerPanelTitle}>{t('artBuilder.layers')}</h3>
        <button
          className={styles.addLayerButton}
          onClick={onLayerCreate}
          title={t('artBuilder.addLayer')}
        >
          +
        </button>
      </div>

      <div className={styles.layerList}>
        {layers.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{t('artBuilder.noLayers')}</p>
            <p className={styles.emptyStateHint}>{t('artBuilder.clickToAdd')}</p>
          </div>
        ) : (
          layers.map((layer) => (
            <div
              key={layer.id}
              className={`${styles.layerItem} ${
                activeLayerId === layer.id ? styles.layerItemActive : ''
              } ${!layer.visible ? styles.layerItemHidden : ''}`}
              onClick={() => onLayerSelect(layer.id)}
            >
              <div className={styles.layerItemContent}>
                <button
                  className={styles.layerDragHandle}
                  title={t('artBuilder.dragToReorder')}
                  disabled
                >
                  ⋮⋮
                </button>

                <button
                  className={styles.layerVisibilityButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerToggleVisibility(layer.id);
                  }}
                  title={layer.visible ? t('artBuilder.hideLayer') : t('artBuilder.showLayer')}
                >
                  {layer.visible ? '👁️' : '👁️‍🗨️'}
                </button>

                {editingLayerId === layer.id ? (
                  <input
                    className={styles.layerNameInput}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleNameSave(layer.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleNameSave(layer.id);
                      } else if (e.key === 'Escape') {
                        handleNameCancel();
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <span
                    className={styles.layerName}
                    onDoubleClick={() => handleNameEdit(layer)}
                  >
                    {layer.name}
                  </span>
                )}

                <button
                  className={styles.layerLockButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerToggleLock(layer.id);
                  }}
                  title={layer.locked ? t('artBuilder.unlockLayer') : t('artBuilder.lockLayer')}
                >
                  {layer.locked ? '🔒' : '🔓'}
                </button>

                {layers.length > 1 && (
                  <button
                    className={styles.layerDeleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDelete(layer.id);
                    }}
                    title={t('artBuilder.deleteLayer')}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LayerPanel;

