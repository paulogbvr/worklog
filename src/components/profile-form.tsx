"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserRound } from "lucide-react";
import { useToast } from "@/components/toast-provider";

export function ProfileForm({ initialName }: { initialName: string | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(initialName ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        profile?: { name: string | null };
      };

      if (!response.ok || !payload.ok) {
        throw new Error();
      }

      setName(payload.profile?.name ?? "");
      toast({
        message: "A saudação da dashboard usará o nome atualizado.",
        title: "Perfil salvo",
        tone: "success"
      });
      router.refresh();
    } catch {
      toast({
        message: "Não foi possível salvar o perfil.",
        title: "Erro ao salvar",
        tone: "error"
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[var(--surface-subtle)] text-[color:var(--text-muted)]">
          <UserRound className="size-5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[color:var(--app-text-strong)]">
            Nome de exibição
          </h2>
          <p className="mt-0.5 text-xs text-[color:var(--text-soft)]">
            Usado na saudação da dashboard. Deixe em branco para uma saudação simples.
          </p>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">Seu nome</span>
        <input
          className="h-11 w-full min-w-0 rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] px-3 text-sm text-[color:var(--app-text-strong)] outline-none transition-colors placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--border-focus)]"
          maxLength={80}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void save();
            }
          }}
          placeholder="Ex.: Paulo Oliveira"
          value={name}
        />
      </label>

      <div className="mt-4 flex justify-end">
        <button
          className="button-primary inline-flex h-10 items-center gap-2 px-4 text-sm font-medium transition-transform duration-200 active:scale-[0.98] disabled:opacity-60"
          disabled={saving}
          onClick={() => void save()}
          type="button"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Salvar perfil
        </button>
      </div>
    </div>
  );
}
