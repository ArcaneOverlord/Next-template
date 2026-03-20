// src/lib/types.ts

// The Library Hierarchy
export interface LibraryEntity {
  id: string;
  name: string;
  type: 'section' | 'rack' | 'shelf' | 'book';
  parentId: string | null;
}

// The Book Content (Nested Scope Logic)
export interface NoteBlock {
  id: string;
  type: 'h1' | 'h2' | 'h3' | 'text' | 'image' | 'video' | 'pdf';
  content: string | File; // Text content or media URL/Blob
  metadata?: {
    width?: number;       // For resizing images/videos
    height?: number;
  };
  children: NoteBlock[];  // THIS is the magic. Sub-headings live inside their parent heading's children array.
}
