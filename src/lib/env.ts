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

function getCheck({
  exists,
  healthy,
  valid
}: {
  exists: boolean;
  healthy?: boolean;
  valid: boolean;
}): EnvironmentCheck {
  if (!exists || !valid) {
    return {
      label: "error",
      tone: "error"
    };
  }

  if (healthy === false || healthy === undefined) {
    return {
      label: "warning",
      tone: "warning"
    };
  }

  return {
    label: "ok",
    tone: "success"
  };
}

export function getServerEnvStatus({
  databaseAvailable,
  wakaTimeSyncSuccessful
}: {
  databaseAvailable: boolean;
  wakaTimeSyncSuccessful: boolean;
}): ServerEnvStatus {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const wakaTimeApiKey = process.env.WAKATIME_API_KEY;

  const keys: Record<ServerEnvKey, EnvironmentCheck> = {
    DATABASE_URL: getCheck({
      exists: Boolean(databaseUrl),
      healthy: databaseAvailable,
      valid: isPostgresUrl(databaseUrl)
    }),
    DIRECT_URL: getCheck({
      exists: Boolean(directUrl),
      healthy: isPostgresUrl(directUrl),
      valid: isPostgresUrl(directUrl)
    }),
    WAKATIME_API_KEY: getCheck({
      exists: Boolean(wakaTimeApiKey),
      healthy: wakaTimeSyncSuccessful,
      valid: isPlausibleWakaTimeKey(wakaTimeApiKey)
    })
  };

  return {
    configured: Object.values(keys).every((check) => check.label === "ok"),
    keys
  };
}
