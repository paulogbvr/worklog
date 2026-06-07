import type { ProjectNote, ProjectNoteItem, ProjectNoteType } from "@prisma/client";

export type ProjectNoteItemInput = {
  completed: boolean;
  position: number;
  text: string;
};

export type SerializedProjectNoteItem = {
  completed: boolean;
  id: string;
  position: number;
  text: string;
};

export type SerializedProjectNote = {
  content: string | null;
  createdAt: string;
  id: string;
  items: SerializedProjectNoteItem[];
  position: number;
  title: string | null;
  type: ProjectNoteType;
  updatedAt: string;
};

export function serializeProjectNote(
  note: ProjectNote & { items: ProjectNoteItem[] }
): SerializedProjectNote {
  return {
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    id: note.id,
    items: [...note.items]
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        completed: item.completed,
        id: item.id,
        position: item.position,
        text: item.text
      })),
    position: note.position,
    title: note.title,
    type: note.type,
    updatedAt: note.updatedAt.toISOString()
  };
}
