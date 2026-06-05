function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseWorkEntryInput(body: Record<string, unknown>) {
  const projectId = optionalText(body.projectId);
  const startedAt = parseDate(body.startedAt);
  const endedAt = parseDate(body.endedAt);

  if (!projectId) {
    return {
      error: "Selecione um projeto.",
      ok: false as const
    };
  }

  if (!startedAt || !endedAt) {
    return {
      error: "Informe início e fim válidos.",
      ok: false as const
    };
  }

  if (endedAt <= startedAt) {
    return {
      error: "O término deve ser posterior ao início.",
      ok: false as const
    };
  }

  return {
    data: {
      durationSeconds: Math.round((endedAt.getTime() - startedAt.getTime()) / 1000),
      endedAt,
      note: optionalText(body.note),
      projectId,
      startedAt
    },
    ok: true as const
  };
}
