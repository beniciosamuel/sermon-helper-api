export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  duration?: number; // For video/audio in seconds
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  lyrics: string[];
  metadata?: {
    tempo?: number;
    key?: string;
    genre?: string;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface SlideLayer {
  id: string;
  type: 'background' | 'lyrics' | 'announcement';
  visible: boolean;
  locked: boolean;
  content: string;
  style?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontWeight?: 'normal' | 'bold' | 'lighter';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
  };
}

export interface Slide {
  id: string;
  title: string;
  layers: SlideLayer[];
  backgroundMediaId?: string; // Reference to MediaFile for video background
  themeId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PresentationTheme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily?: string;
}

export interface PresentationState {
  slides: Slide[];
  currentSlideIndex: number;
  isLive: boolean;
  showLogo: boolean;
  isBlankScreen: boolean;
  activeThemeId: string;
  selectedSlideId: string | null;
}
