import type { StatusTone } from "@/components/status-pulse";

export type ServerEnvKey = "DATABASE_URL" | "DIRECT_URL" | "WAKATIME_API_KEY";

export type EnvironmentCheck = {
  label: "error" | "ok" | "warning";
  tone: StatusTone;
};

export type ServerEnvStatus = {
  configured: boolean;
  keys: Record<ServerEnvKey, EnvironmentCheck>;
};

function isPostgresUrl(value: string | undefined) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "postgres:" || url.protocol === "postgresql:";
  } catch {
    return false;
  }
}

function isPlausibleWakaTimeKey(value: string | undefined) {
  return Boolean(value && value.trim().length >= 20 && !value.includes(" "));
}

function getCheck(
  value: string | undefined,
  isValid: (value: string | undefined) => boolean
): EnvironmentCheck {
  if (!value || !isValid(value)) {
    return {
      label: "error",
      tone: "error"
    };
  }

  return {
    label: "ok",
    tone: "success"
  };
}

export function getServerEnvStatus(): ServerEnvStatus {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const wakaTimeApiKey = process.env.WAKATIME_API_KEY;

  const keys: Record<ServerEnvKey, EnvironmentCheck> = {
    DATABASE_URL: getCheck(databaseUrl, isPostgresUrl),
    DIRECT_URL: getCheck(directUrl, isPostgresUrl),
    WAKATIME_API_KEY: getCheck(wakaTimeApiKey, isPlausibleWakaTimeKey)
  };

  return {
    configured: Object.values(keys).every((check) => check.label === "ok"),
    keys
  };
}
