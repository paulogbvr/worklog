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

function parseIntervals(body: Record<string, unknown>) {
  if (Array.isArray(body.intervals)) {
    return body.intervals;
  }

  return [
    {
      endedAt: body.endedAt,
      startedAt: body.startedAt
    }
  ];
}

export function parseWorkOperationInput(body: Record<string, unknown>) {
  const projectId = optionalText(body.projectId);
  const rawIntervals = parseIntervals(body);

  if (!projectId) {
    return {
      error: "Selecione um projeto.",
      ok: false as const
    };
  }

  if (rawIntervals.length === 0) {
    return {
      error: "Adicione pelo menos um intervalo.",
      ok: false as const
    };
  }

  if (rawIntervals.length > 20) {
    return {
      error: "Uma operação pode ter no máximo 20 intervalos.",
      ok: false as const
    };
  }

  const intervals = rawIntervals.map((rawInterval, index) => {
    const interval =
      typeof rawInterval === "object" && rawInterval
        ? (rawInterval as Record<string, unknown>)
        : {};
    const startedAt = parseDate(interval.startedAt);
    const endedAt = parseDate(interval.endedAt);

    if (!startedAt || !endedAt) {
      return {
        error: `Informe início e término válidos no intervalo ${index + 1}.`
      };
    }

    if (endedAt <= startedAt) {
      return {
        error: `O término do intervalo ${index + 1} deve ser posterior ao início.`
      };
    }

    return {
      data: {
        durationSeconds: Math.round((endedAt.getTime() - startedAt.getTime()) / 1000),
        endedAt,
        startedAt
      }
    };
  });
  const invalidInterval = intervals.find((interval) => "error" in interval);

  if (invalidInterval && "error" in invalidInterval) {
    return {
      error: invalidInterval.error,
      ok: false as const
    };
  }

  const parsedIntervals = intervals
    .flatMap((interval) => ("data" in interval && interval.data ? [interval.data] : []))
    .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());

  for (let index = 1; index < parsedIntervals.length; index += 1) {
    if (parsedIntervals[index].startedAt < parsedIntervals[index - 1].endedAt) {
      return {
        error: `Os intervalos ${index} e ${index + 1} estão sobrepostos.`,
        ok: false as const
      };
    }
  }

  return {
    data: {
      intervals: parsedIntervals,
      note: optionalText(body.note),
      projectId
    },
    ok: true as const
  };
}
