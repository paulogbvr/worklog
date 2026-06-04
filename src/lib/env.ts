type ServerEnvKey = "DATABASE_URL" | "WAKATIME_API_KEY";

const serverEnvKeys: ServerEnvKey[] = ["DATABASE_URL", "WAKATIME_API_KEY"];

export type ServerEnvStatus = {
  configured: boolean;
  keys: Record<ServerEnvKey, boolean>;
  missingKeys: ServerEnvKey[];
};

export function getServerEnvStatus(): ServerEnvStatus {
  const keys = serverEnvKeys.reduce(
    (result, key) => {
      result[key] = Boolean(process.env[key]);
      return result;
    },
    {} as Record<ServerEnvKey, boolean>
  );

  const missingKeys = serverEnvKeys.filter((key) => !keys[key]);

  return {
    configured: missingKeys.length === 0,
    keys,
    missingKeys
  };
}
