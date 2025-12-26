import React from 'react';
import styles from '../../styles/PresentationControl.module.css';
import { PresentationLayer } from './LayerPanel';

interface PreviewCanvasProps {
  layers: PresentationLayer[];
  activeLayerId: string | null;
  aspectRatio: string;
  onCanvasClick: () => void;
  onLayerClick: (layerId: string) => void;
  onLayerContentChange?: (layerId: string, content: string) => void;
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  layers,
  activeLayerId,
  aspectRatio,
  onCanvasClick,
  onLayerClick,
  onLayerContentChange,
}) => {
  const [aspectWidth, aspectHeight] = aspectRatio.split(':').map(Number);
  const layerRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

  const visibleLayers = layers.filter((layer) => layer.visible);

  // Update content when layer changes
  React.useEffect(() => {
    visibleLayers.forEach((layer) => {
      const ref = layerRefs.current[layer.id];
      if (ref && ref.innerHTML !== layer.content) {
        ref.innerHTML = layer.content || '<p>Clique para editar</p>';
      }
    });
  }, [layers, visibleLayers]);

  const handleContentChange = (layerId: string, event: React.FormEvent<HTMLDivElement>) => {
    if (onLayerContentChange) {
      const content = event.currentTarget.innerHTML;
      onLayerContentChange(layerId, content);
    }
  };

  return (
    <div className={styles.previewContainer}>
      <div
        className={styles.previewCanvas}
        style={{ aspectRatio: `${aspectWidth}/${aspectHeight}` }}
        onClick={onCanvasClick}
      >
        <div className={styles.previewGrid} />
        {visibleLayers.length === 0 ? (
          <div className={styles.previewPlaceholder}>
            <p>Clique para editar</p>
            <p className={styles.previewPlaceholderHint}>
              Selecione uma camada ou crie uma nova
            </p>
          </div>
        ) : (
          visibleLayers.map((layer) => (
            <div
              key={layer.id}
              ref={(el) => {
                layerRefs.current[layer.id] = el;
              }}
              className={`${styles.previewLayer} ${
                activeLayerId === layer.id ? styles.previewLayerActive : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onLayerClick(layer.id);
              }}
              contentEditable={!layer.locked && activeLayerId === layer.id}
              suppressContentEditableWarning
              onBlur={(e) => handleContentChange(layer.id, e)}
              onInput={(e) => handleContentChange(layer.id, e)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PreviewCanvas;

