const WAKATIME_API_BASE_URL = "https://api.wakatime.com/api/v1";

export type WakaTimeProject = {
  id: string;
  name: string;
};

type WakaTimeProjectsResponse = {
  data?: Array<{
    id?: string;
    name?: string;
  }>;
};

export type WakaTimeSummaryDay = {
  date: string;
  projects: Array<{
    name: string;
    totalSeconds: number;
  }>;
};

type WakaTimeSummariesResponse = {
  data?: Array<{
    range?: {
      date?: string;
    };
    projects?: Array<{
      name?: string;
      total_seconds?: number;
    }>;
  }>;
};

export class WakaTimeApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "WakaTimeApiError";
    this.status = status;
  }
}

function getWakaTimeApiKey() {
  const apiKey = process.env.WAKATIME_API_KEY;

  if (!apiKey) {
    throw new WakaTimeApiError("WAKATIME_API_KEY não configurada.");
  }

  return apiKey;
}

function getAuthorizationHeader() {
  const apiKey = getWakaTimeApiKey();
  return `Basic ${Buffer.from(apiKey).toString("base64")}`;
}

async function requestWakaTime<T>(
  pathname: string,
  params: Record<string, string | number | undefined> = {}
) {
  const url = new URL(`${WAKATIME_API_BASE_URL}${pathname}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: getAuthorizationHeader()
    }
  });

  if (!response.ok) {
    throw new WakaTimeApiError(
      `WakaTime respondeu com status ${response.status}.`,
      response.status
    );
  }

  return (await response.json()) as T;
}

export async function getWakaTimeProjects() {
  const response = await requestWakaTime<WakaTimeProjectsResponse>("/users/current/projects");

  return (response.data ?? [])
    .filter((project): project is { id: string; name: string } =>
      Boolean(project.id && project.name)
    )
    .map<WakaTimeProject>((project) => ({
      id: project.id,
      name: project.name
    }));
}

export async function getWakaTimeSummaries({
  start,
  end,
  timezone
}: {
  start: string;
  end: string;
  timezone?: string;
}) {
  const response = await requestWakaTime<WakaTimeSummariesResponse>("/users/current/summaries", {
    start,
    end,
    timezone
  });

  const summaries: WakaTimeSummaryDay[] = [];

  for (const day of response.data ?? []) {
    const date = day.range?.date;

    if (!date) {
      continue;
    }

    summaries.push({
      date,
      projects: (day.projects ?? [])
        .filter((project): project is { name: string; total_seconds: number } =>
          Boolean(project.name && typeof project.total_seconds === "number")
        )
        .map((project) => ({
          name: project.name,
          totalSeconds: Math.max(0, Math.round(project.total_seconds))
        }))
    });
  }

  return summaries;
}
