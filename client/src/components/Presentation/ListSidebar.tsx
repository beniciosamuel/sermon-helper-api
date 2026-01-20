import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Song, MediaFile, Announcement } from '../../types/presentation';
import styles from './ListSidebar.module.css';

interface ListSidebarProps {
  songs: Song[];
  mediaFiles: MediaFile[];
  announcements: Announcement[];
  onSongSelect: (song: Song) => void;
  onMediaLoad: (file: File) => void;
  onMediaSelect: (media: MediaFile) => void;
  onAnnouncementSelect: (announcement: Announcement) => void;
  onGenerateSlides: (song: Song) => void;
  onBackgroundVideoSelect: (slideId: string, mediaId: string) => void;
  selectedSlideId?: string | null;
  selectedMediaId?: string | null;
}

const ListSidebar: React.FC<ListSidebarProps> = ({
  songs,
  mediaFiles,
  announcements,
  onSongSelect,
  onMediaLoad,
  onMediaSelect,
  onAnnouncementSelect,
  onGenerateSlides,
  onBackgroundVideoSelect: _onBackgroundVideoSelect,
  selectedSlideId: _selectedSlideId,
  selectedMediaId,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'songs' | 'media' | 'announcements'>('songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMediaUpload, setShowMediaUpload] = useState(false);

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onMediaLoad(file);
      setShowMediaUpload(false);
    }
  };

  const getMediaTypeIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      default:
        return '📄';
    }
  };

  const _videoFiles = mediaFiles.filter((m) => m.type === 'video');

  return (
    <div className={styles.listSidebar}>
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>{t('presentation.listSidebar.title')}</h3>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'songs' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('songs')}
        >
          {t('presentation.listSidebar.songs')}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'media' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('media')}
        >
          {t('presentation.listSidebar.media')}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'announcements' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          {t('presentation.listSidebar.announcements')}
        </button>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('presentation.listSidebar.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.content}>
        {activeTab === 'songs' && (
          <div className={styles.songsList}>
            {filteredSongs.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{t('presentation.listSidebar.noSongs')}</p>
              </div>
            ) : (
              filteredSongs.map((song) => (
                <div key={song.id} className={styles.songItem} onClick={() => onSongSelect(song)}>
                  <div className={styles.songInfo}>
                    <h4 className={styles.songTitle}>{song.title}</h4>
                    {song.artist && <p className={styles.songArtist}>{song.artist}</p>}
                  </div>
                  <button
                    className={styles.generateButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateSlides(song);
                    }}
                    title={t('presentation.listSidebar.generateSlides')}
                  >
                    ➕
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div className={styles.mediaList}>
            <div className={styles.mediaActions}>
              <button className={styles.uploadButton} onClick={() => setShowMediaUpload(true)}>
                {t('presentation.listSidebar.loadMedia')}
              </button>
              {showMediaUpload && (
                <input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileUpload}
                  className={styles.fileInput}
                />
              )}
            </div>
            {mediaFiles.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{t('presentation.listSidebar.noMedia')}</p>
              </div>
            ) : (
              mediaFiles.map((media) => (
                <div
                  key={media.id}
                  className={`${styles.mediaItem} ${
                    selectedMediaId === media.id ? styles.mediaItemSelected : ''
                  }`}
                  onClick={() => onMediaSelect(media)}
                >
                  <div className={styles.mediaIcon}>{getMediaTypeIcon(media.type)}</div>
                  <div className={styles.mediaInfo}>
                    <p className={styles.mediaName}>{media.name}</p>
                    <p className={styles.mediaType}>{media.type}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className={styles.announcementsList}>
            {filteredAnnouncements.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{t('presentation.listSidebar.noAnnouncements')}</p>
              </div>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={styles.announcementItem}
                  onClick={() => onAnnouncementSelect(announcement)}
                >
                  <h4 className={styles.announcementTitle}>{announcement.title}</h4>
                  <p className={styles.announcementContent}>{announcement.content}</p>
                  {announcement.date && (
                    <p className={styles.announcementDate}>{announcement.date}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListSidebar;
