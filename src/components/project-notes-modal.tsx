"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Square,
  StickyNote,
  Trash2,
  X
} from "lucide-react";
import { useToast } from "@/components/toast-provider";
import type { SerializedProjectNote } from "@/server/project-notes";

type NoteType = "FREE" | "CHECKLIST";

type DraftItem = {
  completed: boolean;
  key: string;
  text: string;
};

const fieldClass =
  "h-11 w-full min-w-0 rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] px-3 text-sm text-[color:var(--app-text-strong)] outline-none transition-colors placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--border-focus)]";
const textareaClass =
  "min-h-20 w-full resize-y rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[color:var(--app-text-strong)] outline-none transition-colors placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--border-focus)]";

export function ProjectNotesModal({
  onClose,
  projectId,
  projectName
}: {
  onClose: () => void;
  projectId: string;
  projectName: string;
}) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<SerializedProjectNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [composerType, setComposerType] = useState<NoteType>("FREE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [draftItems, setDraftItems] = useState<DraftItem[]>([
    { completed: false, key: "draft-0", text: "" }
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editItems, setEditItems] = useState<DraftItem[]>([]);
  // Monotonic counter for stable draft item keys without impure render-time calls.
  const keyCounter = useRef(0);
  const nextKey = (prefix: string) => {
    keyCounter.current += 1;
    return `${prefix}-${keyCounter.current}`;
  };

  const loadNotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/notes`);
      const payload = (await response.json()) as {
        notes?: SerializedProjectNote[];
        ok?: boolean;
      };

      if (response.ok && payload.ok) {
        setNotes(payload.notes ?? []);
      }
    } catch {
      toast({
        message: "Não foi possível carregar as notas do projeto.",
        title: "Erro ao carregar",
        tone: "error"
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    // Fetching the project notes on mount is a valid effect use; the state
    // updates happen asynchronously after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  function resetComposer() {
    setTitle("");
    setContent("");
    setDraftItems([{ completed: false, key: nextKey("draft"), text: "" }]);
  }

  async function createNote() {
    const items = draftItems
      .map((item) => ({ completed: item.completed, text: item.text.trim() }))
      .filter((item) => item.text);

    if (composerType === "FREE" && !title.trim() && !content.trim()) {
      toast({
        message: "Escreva um título ou conteúdo para a nota.",
        title: "Nota vazia",
        tone: "error"
      });
      return;
    }

    if (composerType === "CHECKLIST" && !title.trim() && items.length === 0) {
      toast({
        message: "Adicione um título ou pelo menos um item.",
        title: "Checklist vazia",
        tone: "error"
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/notes`, {
        body: JSON.stringify({
          content: composerType === "FREE" ? content : null,
          items: composerType === "CHECKLIST" ? items : [],
          title,
          type: composerType
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const payload = (await response.json()) as {
        note?: SerializedProjectNote;
        ok?: boolean;
      };

      if (!response.ok || !payload.ok || !payload.note) {
        throw new Error();
      }

      setNotes((current) => [payload.note as SerializedProjectNote, ...current]);
      resetComposer();
      toast({
        message: "A nota interna foi adicionada ao projeto.",
        title: "Nota criada",
        tone: "success"
      });
    } catch {
      toast({
        message: "Não foi possível salvar a nota.",
        title: "Erro ao salvar",
        tone: "error"
      });
    } finally {
      setSaving(false);
    }
  }

  async function patchNote(noteId: string, body: Record<string, unknown>) {
    const response = await fetch(`/api/project-notes/${noteId}`, {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
      method: "PATCH"
    });
    const payload = (await response.json()) as {
      note?: SerializedProjectNote;
      ok?: boolean;
    };

    if (!response.ok || !payload.ok || !payload.note) {
      throw new Error();
    }

    setNotes((current) =>
      current.map((note) => (note.id === noteId ? (payload.note as SerializedProjectNote) : note))
    );
  }

  async function toggleItem(note: SerializedProjectNote, itemId: string) {
    const items = note.items.map((item) => ({
      completed: item.id === itemId ? !item.completed : item.completed,
      text: item.text
    }));

    try {
      await patchNote(note.id, { items });
    } catch {
      toast({
        message: "Não foi possível atualizar o item.",
        title: "Erro",
        tone: "error"
      });
    }
  }

  async function deleteNote(noteId: string) {
    try {
      const response = await fetch(`/api/project-notes/${noteId}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error();
      }

      setNotes((current) => current.filter((note) => note.id !== noteId));
      toast({ message: "A nota foi removida.", title: "Nota excluída", tone: "success" });
    } catch {
      toast({
        message: "Não foi possível remover a nota.",
        title: "Erro ao remover",
        tone: "error"
      });
    }
  }

  async function moveNote(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= notes.length) {
      return;
    }

    const reordered = [...notes];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    setNotes(reordered);

    try {
      const response = await fetch(`/api/projects/${projectId}/notes`, {
        body: JSON.stringify({ order: reordered.map((note) => note.id) }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });

      if (!response.ok) {
        throw new Error();
      }
    } catch {
      setNotes(notes);
      toast({
        message: "Não foi possível salvar a nova ordem.",
        title: "Erro ao reordenar",
        tone: "error"
      });
    }
  }

  function startEdit(note: SerializedProjectNote) {
    setEditingId(note.id);
    setEditTitle(note.title ?? "");
    setEditContent(note.content ?? "");
    setEditItems(
      note.items.length > 0
        ? note.items.map((item, index) => ({
            completed: item.completed,
            key: `${item.id}-${index}`,
            text: item.text
          }))
        : [{ completed: false, key: nextKey("edit"), text: "" }]
    );
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(note: SerializedProjectNote) {
    const items = editItems
      .map((item) => ({ completed: item.completed, text: item.text.trim() }))
      .filter((item) => item.text);

    if (note.type === "FREE" && !editTitle.trim() && !editContent.trim()) {
      toast({
        message: "Escreva um título ou conteúdo para a nota.",
        title: "Nota vazia",
        tone: "error"
      });
      return;
    }

    if (note.type === "CHECKLIST" && !editTitle.trim() && items.length === 0) {
      toast({
        message: "Adicione um título ou pelo menos um item.",
        title: "Checklist vazia",
        tone: "error"
      });
      return;
    }

    setSaving(true);

    try {
      await patchNote(note.id, {
        content: note.type === "FREE" ? editContent : null,
        items: note.type === "CHECKLIST" ? items : [],
        title: editTitle,
        type: note.type
      });
      setEditingId(null);
      toast({
        message: "As alterações da nota foram salvas.",
        title: "Nota atualizada",
        tone: "success"
      });
    } catch {
      toast({
        message: "Não foi possível atualizar a nota.",
        title: "Erro ao salvar",
        tone: "error"
      });
    } finally {
      setSaving(false);
    }
  }

  const progress = useMemo(() => {
    return (note: SerializedProjectNote) => {
      if (note.type !== "CHECKLIST" || note.items.length === 0) {
        return null;
      }

      const done = note.items.filter((item) => item.completed).length;
      return `${done}/${note.items.length}`;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[color:var(--border-strong)] bg-[var(--modal-bg)] shadow-[var(--toast-shadow)]"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 font-semibold text-[color:var(--app-text-strong)]">
              <StickyNote className="size-4 text-amber-400" />
              Notas do projeto
            </h3>
            <p className="mt-0.5 truncate text-xs text-[color:var(--text-soft)]">
              {projectName} · uso interno, não aparece para o cliente
            </p>
          </div>
          <button
            aria-label="Fechar"
            className="grid size-8 shrink-0 place-items-center rounded-md text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4">
            <div className="grid w-full grid-cols-2 gap-1 rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] p-1">
              {(
                [
                  ["FREE", "Nota livre"],
                  ["CHECKLIST", "Checklist"]
                ] as const
              ).map(([value, label]) => (
                <button
                  className={[
                    "inline-flex h-9 items-center justify-center gap-2 rounded text-sm transition-all duration-200 ease-out active:scale-95",
                    composerType === value
                      ? "bg-[var(--active-bg)] text-[color:var(--app-text-strong)] shadow-sm"
                      : "text-[color:var(--text-muted)] hover:text-[color:var(--app-text-strong)]"
                  ].join(" ")}
                  key={value}
                  onClick={() => setComposerType(value)}
                  type="button"
                >
                  {value === "FREE" ? (
                    <StickyNote className="size-3.5" />
                  ) : (
                    <ListChecks className="size-3.5" />
                  )}
                  {label}
                </button>
              ))}
            </div>

            <input
              className={`${fieldClass} mt-3`}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Título da nota (opcional)"
              value={title}
            />

            {composerType === "FREE" ? (
              <textarea
                className={`${textareaClass} mt-3`}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Ideias, decisões, pendências, observações internas..."
                value={content}
              />
            ) : (
              <div className="mt-3 space-y-2">
                {draftItems.map((item, index) => (
                  <div className="flex items-center gap-2" key={item.key}>
                    <input
                      className={fieldClass}
                      onChange={(event) =>
                        setDraftItems((current) =>
                          current.map((draft) =>
                            draft.key === item.key
                              ? { ...draft, text: event.target.value }
                              : draft
                          )
                        )
                      }
                      placeholder={`Item ${index + 1}`}
                      value={item.text}
                    />
                    <button
                      aria-label={`Remover item ${index + 1}`}
                      className="grid size-11 shrink-0 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={draftItems.length === 1}
                      onClick={() =>
                        setDraftItems((current) =>
                          current.filter((draft) => draft.key !== item.key)
                        )
                      }
                      type="button"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                <button
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
                  onClick={() =>
                    setDraftItems((current) => [
                      ...current,
                      { completed: false, key: nextKey("draft"), text: "" }
                    ])
                  }
                  type="button"
                >
                  <Plus className="size-4" />
                  Adicionar item
                </button>
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <button
                className="button-primary inline-flex h-10 items-center gap-2 px-4 text-sm font-medium disabled:opacity-60"
                disabled={saving}
                onClick={() => void createNote()}
                type="button"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Adicionar nota
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="py-8 text-center text-sm text-[color:var(--text-soft)]">
                Carregando notas...
              </p>
            ) : notes.length === 0 ? (
              <p className="py-8 text-center text-sm text-[color:var(--text-soft)]">
                Nenhuma nota interna ainda. Use o espaço acima para registrar ideias e tarefas.
              </p>
            ) : (
              notes.map((note, index) => {
                const progressLabel = progress(note);

                if (editingId === note.id) {
                  return (
                    <article
                      className="rounded-md border border-[color:var(--border-strong)] bg-[var(--surface-subtle)] p-4"
                      key={note.id}
                    >
                      <input
                        className={fieldClass}
                        onChange={(event) => setEditTitle(event.target.value)}
                        placeholder="Título da nota (opcional)"
                        value={editTitle}
                      />

                      {note.type === "FREE" ? (
                        <textarea
                          className={`${textareaClass} mt-3`}
                          onChange={(event) => setEditContent(event.target.value)}
                          placeholder="Ideias, decisões, pendências, observações internas..."
                          value={editContent}
                        />
                      ) : (
                        <div className="mt-3 space-y-2">
                          {editItems.map((item, index) => (
                            <div className="flex items-center gap-2" key={item.key}>
                              <button
                                aria-label={
                                  item.completed
                                    ? `Desmarcar item ${index + 1}`
                                    : `Marcar item ${index + 1}`
                                }
                                className="grid size-11 shrink-0 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] active:scale-[0.97]"
                                onClick={() =>
                                  setEditItems((current) =>
                                    current.map((draft) =>
                                      draft.key === item.key
                                        ? { ...draft, completed: !draft.completed }
                                        : draft
                                    )
                                  )
                                }
                                type="button"
                              >
                                {item.completed ? (
                                  <CheckSquare className="size-4 text-emerald-400" />
                                ) : (
                                  <Square className="size-4 text-[color:var(--text-faint)]" />
                                )}
                              </button>
                              <input
                                className={fieldClass}
                                onChange={(event) =>
                                  setEditItems((current) =>
                                    current.map((draft) =>
                                      draft.key === item.key
                                        ? { ...draft, text: event.target.value }
                                        : draft
                                    )
                                  )
                                }
                                placeholder={`Item ${index + 1}`}
                                value={item.text}
                              />
                              <button
                                aria-label={`Remover item ${index + 1}`}
                                className="grid size-11 shrink-0 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                                disabled={editItems.length === 1}
                                onClick={() =>
                                  setEditItems((current) =>
                                    current.filter((draft) => draft.key !== item.key)
                                  )
                                }
                                type="button"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
                            onClick={() =>
                              setEditItems((current) => [
                                ...current,
                                { completed: false, key: nextKey("edit"), text: "" }
                              ])
                            }
                            type="button"
                          >
                            <Plus className="size-4" />
                            Adicionar item
                          </button>
                        </div>
                      )}

                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          className="inline-flex h-10 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
                          onClick={cancelEdit}
                          type="button"
                        >
                          Cancelar
                        </button>
                        <button
                          className="button-primary inline-flex h-10 items-center gap-2 px-4 text-sm font-medium disabled:opacity-60"
                          disabled={saving}
                          onClick={() => void saveEdit(note)}
                          type="button"
                        >
                          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                          Salvar nota
                        </button>
                      </div>
                    </article>
                  );
                }

                return (
                  <article
                    className="rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4"
                    key={note.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {note.title ? (
                            <p className="font-medium text-[color:var(--app-text-strong)]">
                              {note.title}
                            </p>
                          ) : (
                            <p className="text-sm text-[color:var(--text-faint)]">Sem título</p>
                          )}
                          <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[color:var(--text-muted)]">
                            {note.type === "CHECKLIST" ? "Checklist" : "Nota"}
                          </span>
                          {progressLabel ? (
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                              {progressLabel}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="flex flex-col">
                          <button
                            aria-label="Mover nota para cima"
                            className="grid h-4 w-7 place-items-center rounded-t-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] disabled:cursor-not-allowed disabled:opacity-30"
                            disabled={index === 0}
                            onClick={() => void moveNote(index, -1)}
                            type="button"
                          >
                            <ChevronUp className="size-3.5" />
                          </button>
                          <button
                            aria-label="Mover nota para baixo"
                            className="grid h-4 w-7 place-items-center rounded-b-md border border-t-0 border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] disabled:cursor-not-allowed disabled:opacity-30"
                            disabled={index === notes.length - 1}
                            onClick={() => void moveNote(index, 1)}
                            type="button"
                          >
                            <ChevronDown className="size-3.5" />
                          </button>
                        </div>
                        <button
                          aria-label="Editar nota"
                          className="grid size-8 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
                          onClick={() => startEdit(note)}
                          type="button"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          aria-label="Excluir nota"
                          className="grid size-8 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-red-500/10 hover:text-red-400 active:scale-[0.97]"
                          onClick={() => void deleteNote(note.id)}
                          type="button"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    {note.type === "FREE" && note.content ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[color:var(--text-muted)]">
                        {note.content}
                      </p>
                    ) : null}

                    {note.type === "CHECKLIST" && note.items.length > 0 ? (
                      <ul className="mt-3 space-y-1.5">
                        {note.items.map((item) => (
                          <li key={item.id}>
                            <button
                              className="flex w-full items-start gap-2 text-left text-sm"
                              onClick={() => void toggleItem(note, item.id)}
                              type="button"
                            >
                              {item.completed ? (
                                <CheckSquare className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                              ) : (
                                <Square className="mt-0.5 size-4 shrink-0 text-[color:var(--text-faint)]" />
                              )}
                              <span
                                className={[
                                  "min-w-0 flex-1",
                                  item.completed
                                    ? "text-[color:var(--text-faint)] line-through"
                                    : "text-[color:var(--text-muted)]"
                                ].join(" ")}
                              >
                                {item.text}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
